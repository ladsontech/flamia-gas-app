import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkEmailRequest {
  contacts: string[];
  subject: string;
  message: string; // plain text or simple HTML
  from?: string;   // optional override
}

const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
  return re.test(email);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { contacts, subject, message, from }: BulkEmailRequest = await req.json();
    if (!contacts || contacts.length === 0) {
      throw new Error('No contacts provided');
    }
    if (!subject || subject.trim() === '') {
      throw new Error('Subject cannot be empty');
    }
    if (!message || message.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('Resend API key not configured (RESEND_API_KEY)');
    }

    const fromAddress = from || Deno.env.get('EMAIL_FROM') || 'Flamia <no-reply@flamia.store>';

    const uniqueValid = Array.from(new Set(contacts.map(c => (c || '').trim().toLowerCase()))).filter(isValidEmail);
    if (uniqueValid.length === 0) {
      throw new Error('No valid emails after validation');
    }

    // Batch sending (Resend recommends single or small batches; use batches of up to 100)
    const batchSize = 100;
    const batches: string[][] = [];
    for (let i = 0; i < uniqueValid.length; i += batchSize) {
      batches.push(uniqueValid.slice(i, i + batchSize));
    }

    let successCount = 0;
    const results: any[] = [];

    for (const batch of batches) {
      // Resend supports array for "to"
      const payload = {
        from: fromAddress,
        to: batch,
        subject: subject.trim(),
        html: `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;font-size:14px;color:#111;">
  <div style="margin-bottom:12px;">${message.trim().replace(/\n/g, '<br/>')}</div>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
  <div style="font-size:12px;color:#6b7280;">You are receiving this email from Flamia.</div>
</div>`
      };

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const t = await res.text();
        console.error('Resend error:', res.status, t);
        throw new Error(`Email API error: ${res.status}`);
      }
      const data = await res.json();
      results.push(data);
      // If accepted, count all recipients in this batch as success
      successCount += batch.length;
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalSent: uniqueValid.length,
        successCount,
        failedCount: uniqueValid.length - successCount,
        results
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-bulk-email function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);



