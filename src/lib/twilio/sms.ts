/**
 * KisanSetu — Twilio SMS utility
 * Sends rental lifecycle SMS notifications to farmers and providers.
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export interface SmsSendResult {
  success: boolean;
  messageSid?: string;
  error?: string;
}

/**
 * Low-level: send a single SMS via Twilio REST API.
 */
export async function sendSms(to: string, body: string): Promise<SmsSendResult> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn('[KisanSetu SMS] Twilio credentials not configured — skipping SMS.');
    return { success: false, error: 'Twilio credentials not configured' };
  }

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

  const formData = new URLSearchParams({ To: to, From: TWILIO_PHONE_NUMBER, Body: body });

  try {
    const res = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[KisanSetu SMS] Twilio error:', data);
      return { success: false, error: data?.message || 'Failed to send SMS' };
    }

    return { success: true, messageSid: data.sid };
  } catch (err) {
    console.error('[KisanSetu SMS] Network error:', err);
    return { success: false, error: 'Network error sending SMS' };
  }
}

// ─── Message builders ─────────────────────────────────────────────────────────

export type RentalSmsType =
  | 'return_request_approved'
  | 'otp_handover' |'inspection_results' |'damage_assessment' |'refund_processed';

export interface RentalSmsPayload {
  type: RentalSmsType;
  farmerPhone?: string;
  providerPhone?: string;
  farmerName: string;
  providerName: string;
  bookingId: string;
  equipmentName: string;
  // OTP handover
  otp?: string;
  // Inspection
  conditionRating?: number;
  inspectionNotes?: string;
  // Damage
  totalDamageCost?: number;
  depositAmount?: number;
  // Refund
  refundAmount?: number;
}

function formatINR(n: number) {
  return `Rs.${n.toLocaleString('en-IN')}`;
}

function buildMessages(payload: RentalSmsPayload): { farmerMsg?: string; providerMsg?: string } {
  const eq = payload.equipmentName;
  const bk = `#${payload.bookingId}`;

  switch (payload.type) {
    case 'return_request_approved':
      return {
        farmerMsg: `[KisanSetu] Hi ${payload.farmerName}, your return request for ${eq} (${bk}) has been approved by ${payload.providerName}. Please generate your handover OTP in the app.`,
        providerMsg: `[KisanSetu] Hi ${payload.providerName}, you have approved the return request for ${eq} (${bk}) from ${payload.farmerName}. Please be ready to receive the equipment.`,
      };

    case 'otp_handover':
      return {
        farmerMsg: `[KisanSetu] Hi ${payload.farmerName}, your handover OTP for ${eq} (${bk}) is: ${payload.otp}. Share this with ${payload.providerName} to confirm return. Do NOT share with anyone else.`,
        providerMsg: `[KisanSetu] Hi ${payload.providerName}, ${payload.farmerName} has generated a handover OTP for ${eq} (${bk}). Ask them for the OTP to confirm receipt.`,
      };

    case 'inspection_results': {
      const rating = payload.conditionRating ? `${payload.conditionRating}/5` : 'N/A';
      return {
        farmerMsg: `[KisanSetu] Hi ${payload.farmerName}, inspection of ${eq} (${bk}) is complete. Condition: ${rating}. A damage assessment will follow if applicable.`,
        providerMsg: `[KisanSetu] Hi ${payload.providerName}, inspection results for ${eq} (${bk}) have been recorded (Rating: ${rating}). Proceed to damage assessment.`,
      };
    }

    case 'damage_assessment': {
      const deduction = payload.totalDamageCost || 0;
      const refund = Math.max(0, (payload.depositAmount || 0) - deduction);
      if (deduction > 0) {
        return {
          farmerMsg: `[KisanSetu] Hi ${payload.farmerName}, damage assessment for ${eq} (${bk}): deduction ${formatINR(deduction)}, refund ${formatINR(refund)}. You may raise a dispute within 48 hrs.`,
          providerMsg: `[KisanSetu] Hi ${payload.providerName}, your damage assessment for ${eq} (${bk}) has been submitted. Total deduction: ${formatINR(deduction)}. KisanSetu will process the refund.`,
        };
      }
      return {
        farmerMsg: `[KisanSetu] Hi ${payload.farmerName}, no damage found on ${eq} (${bk}). Your full deposit of ${formatINR(payload.depositAmount || 0)} will be refunded.`,
        providerMsg: `[KisanSetu] Hi ${payload.providerName}, damage assessment for ${eq} (${bk}) submitted — no damage recorded. Full deposit will be refunded to the farmer.`,
      };
    }

    case 'refund_processed':
      return {
        farmerMsg: `[KisanSetu] Hi ${payload.farmerName}, your refund of ${formatINR(payload.refundAmount || 0)} for ${eq} (${bk}) has been initiated. It will be credited within 3-5 business days.`,
        providerMsg: `[KisanSetu] Hi ${payload.providerName}, the rental cycle for ${eq} (${bk}) is complete. Refund of ${formatINR(payload.refundAmount || 0)} has been initiated to ${payload.farmerName}.`,
      };

    default:
      return {};
  }
}

/**
 * High-level: send rental lifecycle SMS to farmer and/or provider.
 * Non-blocking — errors are logged but never thrown.
 */
export async function sendRentalSms(payload: RentalSmsPayload): Promise<void> {
  const { farmerMsg, providerMsg } = buildMessages(payload);

  const tasks: Promise<SmsSendResult>[] = [];

  if (farmerMsg && payload.farmerPhone) {
    tasks.push(sendSms(payload.farmerPhone, farmerMsg));
  }
  if (providerMsg && payload.providerPhone) {
    tasks.push(sendSms(payload.providerPhone, providerMsg));
  }

  if (tasks.length === 0) return;

  const results = await Promise.allSettled(tasks);
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[KisanSetu SMS] Task ${i} rejected:`, r.reason);
    } else if (!r.value.success) {
      console.warn(`[KisanSetu SMS] Task ${i} failed:`, r.value.error);
    }
  });
}
