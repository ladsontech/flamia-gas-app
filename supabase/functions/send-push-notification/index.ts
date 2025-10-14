import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FCM_ENDPOINT = 'https://fcm.googleapis.com/fcm/send';

interface PushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
  fcm_token?: string;
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

    // Get all push subscriptions with FCM tokens
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth, fcm_token');

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

    // Get FCM Server Key
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
    if (!fcmServerKey) {
      console.error('FCM_SERVER_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'FCM not configured. Please add FCM_SERVER_KEY to secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send notifications to all subscriptions
    let successCount = 0;
    const failedEndpoints: string[] = [];

    for (const sub of subscriptions as PushSubscription[]) {
      // Skip if no FCM token
      if (!sub.fcm_token) {
        console.log(`Skipping subscription without FCM token: ${sub.endpoint}`);
        continue;
      }

      try {
        const fcmPayload = {
          to: sub.fcm_token,
          notification: {
            title,
            body: message,
            icon: '/icon.png',
            click_action: targetPage || '/'
          },
          data: {
            url: targetPage || '/'
          }
        };

        const response = await fetch(FCM_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `key=${fcmServerKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fcmPayload),
        });

        const result = await response.json();
        
        if (response.ok && result.success === 1) {
          successCount++;
          console.log(`Successfully sent to FCM token: ${sub.fcm_token.substring(0, 20)}...`);
        } else {
          console.error(`Failed to send to ${sub.fcm_token}:`, result);
          failedEndpoints.push(sub.endpoint);
          
          // Remove invalid tokens (NotRegistered or InvalidRegistration)
          if (result.results?.[0]?.error === 'NotRegistered' || 
              result.results?.[0]?.error === 'InvalidRegistration') {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint);
            console.log(`Removed invalid token: ${sub.endpoint}`);
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
        total: subscriptions.length,
        failedEndpoints: failedEndpoints.length > 0 ? failedEndpoints : undefined
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
