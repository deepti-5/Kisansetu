import { NextRequest, NextResponse } from 'next/server';

// Import the same store — in a real app use Redis/DB; here we share via module singleton
// We re-declare the type to match the send route's store
declare global {
  // eslint-disable-next-line no-var
  var __kisansetu_otp_store: Map<string, { otp: string; expiresAt: number; attempts: number; lastSentAt: number }> | undefined;
}

// Use a global singleton so both routes share the same Map instance in dev (hot reload safe)
if (!global.__kisansetu_otp_store) {
  global.__kisansetu_otp_store = new Map();
}
const otpStore = global.__kisansetu_otp_store;

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
    }

    const normalizedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

    const record = otpStore.get(normalizedPhone);

    if (!record) {
      return NextResponse.json(
        { error: 'No OTP found for this number. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Check expiry
    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedPhone);
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check max attempts
    if (record.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(normalizedPhone);
      return NextResponse.json(
        { error: 'Too many incorrect attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    // Increment attempt count
    record.attempts += 1;
    otpStore.set(normalizedPhone, record);

    // Verify OTP
    if (record.otp !== otp.trim()) {
      const remaining = MAX_ATTEMPTS - record.attempts;
      return NextResponse.json(
        {
          error: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
          attemptsRemaining: remaining,
        },
        { status: 400 }
      );
    }

    // OTP is correct — clean up
    otpStore.delete(normalizedPhone);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
