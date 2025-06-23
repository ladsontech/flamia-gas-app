
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  phoneNumber: string;
  action: 'send' | 'verify';
  code?: string;
}

// In-memory storage for verification codes (in production, use a database)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const body = new URLSearchParams({
    From: fromNumber,
    To: to,
    Body: message,
  });

  console.log('Sending SMS request to:', url);
  console.log('SMS payload:', { From: fromNumber, To: to, Body: message });

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

    const { phoneNumber, action, code } = parsedBody;
    console.log('Parsed request:', { phoneNumber, action, code: code ? 'present' : 'not provided' });

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
      // Generate and send verification code
      const verificationCode = generateVerificationCode();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      
      verificationCodes.set(phoneNumber, { code: verificationCode, expiresAt });
      
      const message = `Your Flamia verification code is: ${verificationCode}. This code expires in 10 minutes.`;
      
      console.log(`Attempting to send SMS to ${phoneNumber} with code ${verificationCode}`);
      
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
    } else if (action === 'verify') {
      // Verify the code
      const stored = verificationCodes.get(phoneNumber);
      
      if (!stored) {
        console.log(`No verification code found for ${phoneNumber}`);
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
      
      if (Date.now() > stored.expiresAt) {
        console.log(`Verification code expired for ${phoneNumber}`);
        verificationCodes.delete(phoneNumber);
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
      
      // Code is valid, remove it from storage
      verificationCodes.delete(phoneNumber);
      
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
