
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  phoneNumber: string;
  action: 'send' | 'verify';
  code?: string;
  type?: string;
}

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove any spaces, dashes, or other formatting
  let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  // If it starts with 0, assume it's a Ugandan number and replace with +256
  if (cleaned.startsWith('0')) {
    cleaned = '+256' + cleaned.substring(1);
  }
  
  // If it doesn't start with +, add +256 (assuming Ugandan)
  if (!cleaned.startsWith('+')) {
    cleaned = '+256' + cleaned;
  }
  
  return cleaned;
};

const sendSMS = async (to: string, message: string) => {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

  console.log('Twilio credentials check:', {
    accountSid: accountSid ? 'present' : 'missing',
    authToken: authToken ? 'present' : 'missing',
    fromNumber: fromNumber ? 'present' : 'missing'
  });

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Missing Twilio credentials. Please check TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER');
  }

  // Format the phone number properly
  const formattedTo = formatPhoneNumber(to);
  console.log('Phone number formatted from', to, 'to', formattedTo);

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const body = new URLSearchParams({
    From: fromNumber,
    To: formattedTo,
    Body: message,
  });

  console.log('Sending SMS request to:', url);
  console.log('SMS payload:', { From: fromNumber, To: formattedTo, Body: message });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  console.log('Twilio response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Twilio API error:', errorText);
    throw new Error(`Twilio API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  console.log('Twilio response:', result);
  return result;
};

const handler = async (req: Request): Promise<Response> => {
  console.log('SMS verification function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const requestBody = await req.text();
    console.log('Request body:', requestBody);
    
    let parsedBody: SMSRequest;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    const { phoneNumber, action, code, type } = parsedBody;
    console.log('Parsed request:', { phoneNumber, action, code: code ? 'present' : 'not provided', type });

    if (!phoneNumber || !action) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: phoneNumber and action' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }

    if (action === 'send') {
      // Generate and store verification code in database
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      
      console.log(`Storing verification code for ${phoneNumber}: ${verificationCode}`);
      
      // Store or update verification code in database
      const { error: dbError } = await supabase
        .from('phone_verifications')
        .upsert({ 
          phone_number: phoneNumber, 
          code: verificationCode, 
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Database error storing verification code:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }
      
      const message = `Your Flamia verification code is: ${verificationCode}. This code expires in 10 minutes.`;
      
      console.log(`Attempting to send SMS to ${phoneNumber} with code ${verificationCode}`);
      
      try {
        await sendSMS(phoneNumber, message);
        console.log(`SMS sent successfully to ${phoneNumber}`);
        
        return new Response(
          JSON.stringify({ success: true, message: 'Verification code sent' }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      } catch (smsError: any) {
        console.error('SMS sending failed:', smsError);
        
        // Clean up the stored code since SMS failed
        await supabase
          .from('phone_verifications')
          .delete()
          .eq('phone_number', phoneNumber);
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to send SMS: ${smsError.message}. Please check your phone number format (should include country code, e.g., +256789123456)` 
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
    } else if (action === 'verify') {
      // Verify the code from database
      const { data: stored, error: fetchError } = await supabase
        .from('phone_verifications')
        .select('*')
        .eq('phone_number', phoneNumber)
        .single();
      
      if (fetchError || !stored) {
        console.log(`No verification code found for ${phoneNumber}`, fetchError);
        return new Response(
          JSON.stringify({ success: false, error: 'No verification code found for this number' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
      
      const expiresAt = new Date(stored.expires_at);
      if (Date.now() > expiresAt.getTime()) {
        console.log(`Verification code expired for ${phoneNumber}`);
        // Clean up expired code
        await supabase
          .from('phone_verifications')
          .delete()
          .eq('phone_number', phoneNumber);
        
        return new Response(
          JSON.stringify({ success: false, error: 'Verification code has expired' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
      
      if (stored.code !== code) {
        console.log(`Invalid verification code for ${phoneNumber}. Expected: ${stored.code}, Got: ${code}`);
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid verification code' }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      }
      
      // Code is valid, remove it from database
      await supabase
        .from('phone_verifications')
        .delete()
        .eq('phone_number', phoneNumber);
      
      console.log(`Phone number ${phoneNumber} verified successfully`);
      
      return new Response(
        JSON.stringify({ success: true, message: 'Phone number verified successfully' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    } else {
      console.log(`Invalid action: ${action}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action. Must be "send" or "verify"' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
  } catch (error: any) {
    console.error('Error in send-sms-verification function:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error',
        details: error.stack 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
