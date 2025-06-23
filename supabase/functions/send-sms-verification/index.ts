
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

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Missing Twilio credentials');
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  const body = new URLSearchParams({
    From: fromNumber,
    To: to,
    Body: message,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twilio API error: ${error}`);
  }

  return await response.json();
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, action, code }: SMSRequest = await req.json();

    if (action === 'send') {
      // Generate and send verification code
      const verificationCode = generateVerificationCode();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      
      verificationCodes.set(phoneNumber, { code: verificationCode, expiresAt });
      
      const message = `Your Flamia verification code is: ${verificationCode}. This code expires in 10 minutes.`;
      
      await sendSMS(phoneNumber, message);
      
      console.log(`SMS sent to ${phoneNumber} with code ${verificationCode}`);
      
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
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action' }),
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
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
