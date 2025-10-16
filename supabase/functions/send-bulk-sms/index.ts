import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkSmsRequest {
  contacts: string[];
  message: string;
  from?: string;
}

interface SmsRecipient {
  statusCode: number;
  number: string;
  status: string;
  cost: string;
  messageId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { contacts, message, from }: BulkSmsRequest = await req.json();

    if (!contacts || contacts.length === 0) {
      throw new Error('No contacts provided');
    }

    if (!message || message.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    // Get Africa's Talking credentials
    const apiKey = Deno.env.get('AFRICAS_TALKING_API_KEY');
    const username = Deno.env.get('AFRICAS_TALKING_USERNAME');

    if (!apiKey || !username) {
      throw new Error('Africa\'s Talking credentials not configured');
    }

    // Determine API URL based on environment
    const baseUrl = username === 'sandbox' 
      ? 'https://api.sandbox.africastalking.com/version1/messaging'
      : 'https://api.africastalking.com/version1/messaging';

    console.log(`Sending SMS to ${contacts.length} contacts using ${baseUrl}`);

    // Format phone numbers and send in batches (Africa's Talking accepts comma-separated numbers)
    const batchSize = 100; // Send max 100 at a time
    const batches: string[][] = [];
    
    for (let i = 0; i < contacts.length; i += batchSize) {
      batches.push(contacts.slice(i, i + batchSize));
    }

    const allResults: SmsRecipient[] = [];
    let totalCost = 0;
    let successCount = 0;

    for (const batch of batches) {
      const formattedNumbers = batch
        .map(num => num.startsWith('+') ? num : `+${num}`)
        .join(',');

      const body = new URLSearchParams({
        username: username,
        to: formattedNumbers,
        message: message,
      });

      if (from) {
        body.append('from', from);
      }

      console.log(`Sending batch of ${batch.length} SMS...`);

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': apiKey,
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Africa\'s Talking API error:', errorText);
        throw new Error(`SMS API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('SMS API response:', result);

      if (result.SMSMessageData && result.SMSMessageData.Recipients) {
        const recipients = result.SMSMessageData.Recipients;
        allResults.push(...recipients);
        
        recipients.forEach((recipient: SmsRecipient) => {
          if (recipient.statusCode === 101) {
            successCount++;
            // Extract numeric cost value
            const costMatch = recipient.cost.match(/[\d.]+/);
            if (costMatch) {
              totalCost += parseFloat(costMatch[0]);
            }
          }
        });
      }
    }

    console.log(`SMS sent: ${successCount}/${contacts.length} successful, Total cost: UGX ${totalCost.toFixed(2)}`);

    return new Response(
      JSON.stringify({
        success: true,
        totalSent: contacts.length,
        successCount,
        failedCount: contacts.length - successCount,
        totalCost: `UGX ${totalCost.toFixed(2)}`,
        recipients: allResults,
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
    console.error('Error in send-bulk-sms function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
