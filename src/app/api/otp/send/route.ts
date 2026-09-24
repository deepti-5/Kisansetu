import { NextRequest, NextResponse } from 'next/server';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Global singleton OTP store shared with verify route
declare global {
  // eslint-disable-next-line no-var
  var __kisansetu_otp_store: Map<string, { otp: string; expiresAt: number; attempts: number; lastSentAt: number }> | undefined;
}

if (!global.__kisansetu_otp_store) {
  global.__kisansetu_otp_store = new Map();
}
const otpStore = global.__kisansetu_otp_store;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^\d{10}$/.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Invalid phone number. Enter a 10-digit mobile number.' }, { status: 400 });
    }

    const normalizedPhone = `+91${phone.replace(/\s/g, '')}`;

    // Rate limiting: 60 second cooldown between sends
    const existing = otpStore.get(normalizedPhone);
    if (existing) {
      const cooldownRemaining = Math.ceil((existing.lastSentAt + 60000 - Date.now()) / 1000);
      if (cooldownRemaining > 0) {
        return NextResponse.json(
          { error: `Please wait ${cooldownRemaining} seconds before requesting a new OTP.`, cooldown: cooldownRemaining },
          { status: 429 }
        );
      }
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(normalizedPhone, {
      otp,
      expiresAt,
      attempts: 0,
      lastSentAt: Date.now(),
    });

    // Check Twilio credentials
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('Twilio credentials not configured');
      return NextResponse.json(
        { error: 'SMS service not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to your environment variables.' },
        { status: 503 }
      );
    }

    // Send SMS via Twilio REST API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const formData = new URLSearchParams({
      To: normalizedPhone,
      From: TWILIO_PHONE_NUMBER,
      Body: `Your KisanSetu verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`,
    });

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio error:', twilioData);
      otpStore.delete(normalizedPhone);
      return NextResponse.json(
        { error: twilioData.message || 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent to +91 ${phone}`,
      expiresIn: 600,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
