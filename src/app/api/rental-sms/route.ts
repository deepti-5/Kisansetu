import { NextRequest, NextResponse } from 'next/server';
import { sendRentalSms, RentalSmsPayload } from '@/lib/twilio/sms';

export async function POST(req: NextRequest) {
  try {
    const payload: RentalSmsPayload = await req.json();

    if (!payload.type || !payload.bookingId || !payload.equipmentName) {
      return NextResponse.json(
        { error: 'Missing required fields: type, bookingId, equipmentName' },
        { status: 400 }
      );
    }

    await sendRentalSms(payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[rental-sms route] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
