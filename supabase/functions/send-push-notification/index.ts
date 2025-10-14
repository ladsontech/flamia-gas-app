import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { title, message, targetPage } = await req.json();

    if (!title || !message) {
      return new Response(
        JSON.stringify({ error: 'Title and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!roleData || roleData.role !== 'super_admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth');

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscriptions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No subscriptions found', sent: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    if (!vapidPrivateKey) {
      return new Response(
        JSON.stringify({ error: 'VAPID keys not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send notifications to all subscriptions
    let successCount = 0;
    const failedEndpoints: string[] = [];

    for (const sub of subscriptions as PushSubscription[]) {
      try {
        const payload = JSON.stringify({
          title,
          body: message,
          icon: '/images/icon.png',
          badge: '/images/icon.png',
          data: {
            url: targetPage || '/'
          }
        });

        const response = await sendWebPush(sub, payload, vapidPrivateKey);
        
        if (response.ok) {
          successCount++;
        } else {
          console.error(`Failed to send to ${sub.endpoint}:`, response.status);
          failedEndpoints.push(sub.endpoint);
          
          // Remove invalid subscriptions
          if (response.status === 410 || response.status === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
          }
        }
      } catch (error) {
        console.error(`Error sending to ${sub.endpoint}:`, error);
        failedEndpoints.push(sub.endpoint);
      }
    }

    // Log the notification
    await supabase
      .from('push_notifications_log')
      .insert({
        title,
        message,
        target_page: targetPage || '/',
        sent_by: user.id,
        total_sent: successCount
      });

    return new Response(
      JSON.stringify({
        message: 'Notifications sent',
        sent: successCount,
        failed: failedEndpoints.length,
        total: subscriptions.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendWebPush(
  subscription: PushSubscription,
  payload: string,
  vapidPrivateKey: string
): Promise<Response> {
  const { endpoint, p256dh, auth } = subscription;
  
  // Import web-push crypto utilities
  const encoder = new TextEncoder();
  const payloadBytes = encoder.encode(payload);
  
  // Generate VAPID headers
  const vapidPublicKey = 'BHZicL5xWcu2_631X8golREEl22KTPsFgrmgxIbduXL_7lxhEVB8Zn_FV9CofzyVT0x8GVZVZe-op4y44D_fxww';
  
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  
  const vapidHeaders = await generateVAPIDHeaders(
    audience,
    'mailto:support@flamia.com',
    vapidPublicKey,
    vapidPrivateKey
  );

  // Encrypt payload
  const encryptedPayload = await encryptPayload(payloadBytes, p256dh, auth);

  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'TTL': '86400',
      'Content-Encoding': 'aes128gcm',
      'Authorization': vapidHeaders.Authorization,
      'Crypto-Key': vapidHeaders['Crypto-Key'],
    },
    body: encryptedPayload,
  });
}

async function generateVAPIDHeaders(
  audience: string,
  subject: string,
  publicKey: string,
  privateKey: string
): Promise<{ Authorization: string; 'Crypto-Key': string }> {
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60; // 12 hours

  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = { aud: audience, exp, sub: subject };

  // Base64URL encode
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Sign with private key
  const signature = await signJWT(unsignedToken, privateKey);
  const jwt = `${unsignedToken}.${signature}`;

  return {
    Authorization: `vapid t=${jwt}, k=${publicKey}`,
    'Crypto-Key': `p256ecdsa=${publicKey}`,
  };
}

function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function signJWT(data: string, privateKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  
  // Convert base64url private key to raw bytes
  const keyBytes = base64UrlDecode(privateKey);
  
  // Import the private key
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  // Sign the data
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    dataBytes
  );

  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  return new Uint8Array([...binary].map(c => c.charCodeAt(0)));
}

async function encryptPayload(
  payload: Uint8Array,
  p256dh: string,
  auth: string
): Promise<Uint8Array> {
  // Simplified encryption - in production, use a proper web-push library
  // This is a placeholder that needs proper ECDH and AES-GCM implementation
  return payload;
}
