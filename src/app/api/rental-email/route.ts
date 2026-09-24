'use server';

import { NextRequest, NextResponse } from 'next/server';

export type RentalEmailType =
  | 'return_request_approved'
  | 'otp_handover' |'inspection_results' |'damage_assessment' |'refund_processed';

interface RentalEmailPayload {
  type: RentalEmailType;
  farmerEmail: string;
  providerEmail?: string;
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
  damages?: { label: string; cost: number }[];
  totalDamageCost?: number;
  depositAmount?: number;
  // Refund
  refundAmount?: number;
  refundMethod?: string;
}

const BASE_STYLE = `font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);`;
const HEADER = `background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);padding:28px 24px;text-align:center;`;
const BODY = `padding:28px 24px;`;
const FOOTER = `background:#f9fafb;padding:16px 24px;text-align:center;font-size:12px;color:#9ca3af;`;
const BADGE = (color: string) => `display:inline-block;background:${color};color:white;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;`;

function formatINR(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function buildEmail(payload: RentalEmailPayload): { subject: string; farmerHtml: string; providerHtml?: string } {
  const bookingBadge = `<span style="${BADGE('#16a34a')}">#${payload.bookingId}</span>`;

  switch (payload.type) {
    case 'return_request_approved': {
      const subject = `Return Request Approved — ${payload.equipmentName} | KisanSetu`;
      const farmerHtml = `<div style="${BASE_STYLE}">
        <div style="${HEADER}">
          <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">🌾 KisanSetu</h1>
          <p style="color:#bbf7d0;margin:8px 0 0;font-size:15px;">✅ Return Request Approved</p>
        </div>
        <div style="${BODY}">
          <p style="font-size:16px;margin:0 0 8px;">Hi <strong>${payload.farmerName}</strong>,</p>
          <p style="color:#6b7280;margin:0 0 16px;">Your return request for <strong>${payload.equipmentName}</strong> has been approved by the provider. Please proceed with the OTP handover.</p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;margin:16px 0;">
            <p style="margin:4px 0;font-size:14px;"><strong>Booking:</strong> ${bookingBadge}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Equipment:</strong> ${payload.equipmentName}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Provider:</strong> ${payload.providerName}</p>
          </div>
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px;margin:16px 0;">
            <p style="margin:0;font-size:13px;color:#1d4ed8;">📌 <strong>Next Step:</strong> Generate your handover OTP in the app and share it with the provider when returning the equipment.</p>
          </div>
        </div>
        <div style="${FOOTER}"><p style="margin:0;">KisanSetu — Connecting Farmers with Equipment</p></div>
      </div>`;

      const providerHtml = `<div style="${BASE_STYLE}">
        <div style="${HEADER}">
          <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">🌾 KisanSetu</h1>
          <p style="color:#bbf7d0;margin:8px 0 0;font-size:15px;">Return Request — Action Required</p>
        </div>
        <div style="${BODY}">
          <p style="font-size:16px;margin:0 0 8px;">Hi <strong>${payload.providerName}</strong>,</p>
          <p style="color:#6b7280;margin:0 0 16px;"><strong>${payload.farmerName}</strong> has submitted a return request for <strong>${payload.equipmentName}</strong>. You have approved it.</p>
          <div style="background:#f9fafb;border-radius:10px;padding:16px;margin:16px 0;">
            <p style="margin:4px 0;font-size:14px;"><strong>Booking:</strong> ${bookingBadge}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Farmer:</strong> ${payload.farmerName}</p>
          </div>
          <p style="font-size:13px;color:#6b7280;">Please be ready to receive the equipment and verify the OTP handover.</p>
        </div>
        <div style="${FOOTER}"><p style="margin:0;">KisanSetu — Connecting Farmers with Equipment</p></div>
      </div>`;

      return { subject, farmerHtml, providerHtml };
    }

    case 'otp_handover': {
      const subject = `OTP Handover Code — ${payload.equipmentName} | KisanSetu`;
      const farmerHtml = `<div style="${BASE_STYLE}">
        <div style="${HEADER}">
          <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">🌾 KisanSetu</h1>
          <p style="color:#bbf7d0;margin:8px 0 0;font-size:15px;">🔐 Your Handover OTP</p>
        </div>
        <div style="${BODY}">
          <p style="font-size:16px;margin:0 0 8px;">Hi <strong>${payload.farmerName}</strong>,</p>
          <p style="color:#6b7280;margin:0 0 16px;">Here is your secure OTP for equipment handover. Share this code with <strong>${payload.providerName}</strong> when returning the equipment.</p>
          <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
            <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Your Handover OTP</p>
            <p style="margin:0;font-size:48px;font-weight:900;color:#16a34a;letter-spacing:12px;font-family:monospace;">${payload.otp}</p>
            <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">Valid for this return session only</p>
          </div>
          <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:14px;margin:16px 0;">
            <p style="margin:0;font-size:13px;color:#92400e;">⚠️ <strong>Do not share this OTP with anyone other than the equipment provider.</strong></p>
          </div>
          <div style="background:#f9fafb;border-radius:10px;padding:14px;margin:16px 0;">
            <p style="margin:4px 0;font-size:14px;"><strong>Booking:</strong> ${bookingBadge}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Equipment:</strong> ${payload.equipmentName}</p>
          </div>
        </div>
        <div style="${FOOTER}"><p style="margin:0;">KisanSetu — Connecting Farmers with Equipment</p></div>
      </div>`;

      const providerHtml = `<div style="${BASE_STYLE}">
        <div style="${HEADER}">
          <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">🌾 KisanSetu</h1>
          <p style="color:#bbf7d0;margin:8px 0 0;font-size:15px;">Equipment Return — OTP Verification Pending</p>
        </div>
        <div style="${BODY}">
          <p style="font-size:16px;margin:0 0 8px;">Hi <strong>${payload.providerName}</strong>,</p>
          <p style="color:#6b7280;margin:0 0 16px;"><strong>${payload.farmerName}</strong> has generated a handover OTP for returning <strong>${payload.equipmentName}</strong>. Please ask them for the OTP to confirm receipt.</p>
          <div style="background:#f9fafb;border-radius:10px;padding:14px;margin:16px 0;">
            <p style="margin:4px 0;font-size:14px;"><strong>Booking:</strong> ${bookingBadge}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Farmer:</strong> ${payload.farmerName}</p>
          </div>
        </div>
        <div style="${FOOTER}"><p style="margin:0;">KisanSetu — Connecting Farmers with Equipment</p></div>
      </div>`;

      return { subject, farmerHtml, providerHtml };
    }

    case 'inspection_results': {
      const stars = '★'.repeat(payload.conditionRating || 0) + '☆'.repeat(5 - (payload.conditionRating || 0));
      const ratingLabel = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][payload.conditionRating || 0] || 'N/A';
      const subject = `Inspection Complete — ${payload.equipmentName} | KisanSetu`;
      const farmerHtml = `<div style="${BASE_STYLE}">
        <div style="${HEADER}">
          <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">🌾 KisanSetu</h1>
          <p style="color:#bbf7d0;margin:8px 0 0;font-size:15px;">🔍 Inspection Results</p>
        </div>
        <div style="${BODY}">
          <p style="font-size:16px;margin:0 0 8px;">Hi <strong>${payload.farmerName}</strong>,</p>
          <p style="color:#6b7280;margin:0 0 16px;">The provider has completed the inspection of <strong>${payload.equipmentName}</strong>. Here are the results:</p>
          <div style="background:#f9fafb;border-radius:10px;padding:16px;margin:16px 0;">
            <p style="margin:4px 0;font-size:14px;"><strong>Booking:</strong> ${bookingBadge}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Equipment:</strong> ${payload.equipmentName}</p>
            <p style="margin:8px 0 4px;font-size:14px;"><strong>Condition Rating:</strong> <span style="color:#f59e0b;font-size:18px;">${stars}</span> <strong>${ratingLabel}</strong></p>
            ${payload.inspectionNotes ? `<p style="margin:8px 0 4px;font-size:14px;color:#6b7280;"><strong>Notes:</strong> ${payload.inspectionNotes}</p>` : ''}
          </div>
          <p style="font-size:13px;color:#6b7280;">A damage assessment will follow. You will be notified of any deductions from your security deposit.</p>
        </div>
        <div style="${FOOTER}"><p style="margin:0;">KisanSetu — Connecting Farmers with Equipment</p></div>
      </div>`;

      return { subject, farmerHtml };
    }

    case 'damage_assessment': {
      const hasDamage = (payload.damages || []).length > 0;
      const damageRows = (payload.damages || []).map(d =>
        `<tr><td style="padding:8px 12px;font-size:14px;color:#374151;">${d.label}</td><td style="padding:8px 12px;font-size:14px;text-align:right;color:#dc2626;font-weight:600;">−${formatINR(d.cost)}</td></tr>`
      ).join('');
      const subject = `Damage Assessment — ${payload.equipmentName} | KisanSetu`;
      const farmerHtml = `<div style="${BASE_STYLE}">
        <div style="${hasDamage ? 'background:linear-gradient(135deg,#dc2626,#b91c1c)' : HEADER.split('background:')[1].split(';')[0].replace('background:', 'background:')};padding:28px 24px;text-align:center;">
          <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">🌾 KisanSetu</h1>
          <p style="color:${hasDamage ? '#fecaca' : '#bbf7d0'};margin:8px 0 0;font-size:15px;">${hasDamage ? '⚠️ Damage Assessment Report' : '✅ No Damage Found'}</p>
        </div>
        <div style="${BODY}">
          <p style="font-size:16px;margin:0 0 8px;">Hi <strong>${payload.farmerName}</strong>,</p>
          <p style="color:#6b7280;margin:0 0 16px;">${hasDamage ? `The provider has identified damage on <strong>${payload.equipmentName}</strong>. The following deductions will be applied to your security deposit.` : `Great news! No damage was found on <strong>${payload.equipmentName}</strong>. Your full deposit will be refunded.`}</p>
          ${hasDamage ? `
          <table style="width:100%;border-collapse:collapse;margin:16px 0;border-radius:10px;overflow:hidden;">
            <thead><tr style="background:#fef2f2;"><th style="padding:10px 12px;font-size:13px;text-align:left;color:#6b7280;">Damage Item</th><th style="padding:10px 12px;font-size:13px;text-align:right;color:#6b7280;">Deduction</th></tr></thead>
            <tbody>${damageRows}</tbody>
            <tfoot>
              <tr style="background:#fef2f2;border-top:2px solid #fecaca;">
                <td style="padding:10px 12px;font-size:14px;font-weight:700;color:#dc2626;">Total Deduction</td>
                <td style="padding:10px 12px;font-size:14px;font-weight:700;color:#dc2626;text-align:right;">−${formatINR(payload.totalDamageCost || 0)}</td>
              </tr>
              <tr style="background:#f0fdf4;">
                <td style="padding:10px 12px;font-size:14px;font-weight:700;color:#16a34a;">Refund Amount</td>
                <td style="padding:10px 12px;font-size:14px;font-weight:700;color:#16a34a;text-align:right;">${formatINR(Math.max(0, (payload.depositAmount || 0) - (payload.totalDamageCost || 0)))}</td>
              </tr>
            </tfoot>
          </table>
          <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:14px;margin:16px 0;">
            <p style="margin:0;font-size:13px;color:#92400e;">📋 This assessment will be reviewed by KisanSetu support. You may raise a dispute within 48 hours if you disagree.</p>
          </div>` : `
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;text-align:center;margin:16px 0;">
            <p style="font-size:32px;margin:0 0 8px;">🎉</p>
            <p style="font-size:15px;font-weight:700;color:#16a34a;margin:0;">Full deposit of ${formatINR(payload.depositAmount || 0)} will be refunded</p>
          </div>`}
        </div>
        <div style="${FOOTER}"><p style="margin:0;">KisanSetu — Connecting Farmers with Equipment</p></div>
      </div>`;

      const providerHtml = `<div style="${BASE_STYLE}">
        <div style="${HEADER}">
          <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">🌾 KisanSetu</h1>
          <p style="color:#bbf7d0;margin:8px 0 0;font-size:15px;">Damage Assessment Submitted</p>
        </div>
        <div style="${BODY}">
          <p style="font-size:16px;margin:0 0 8px;">Hi <strong>${payload.providerName}</strong>,</p>
          <p style="color:#6b7280;margin:0 0 16px;">Your damage assessment for <strong>${payload.equipmentName}</strong> (Booking ${bookingBadge}) has been submitted. ${hasDamage ? `Total deduction: <strong style="color:#dc2626;">${formatINR(payload.totalDamageCost || 0)}</strong>` : 'No damage was recorded.'}</p>
          <p style="font-size:13px;color:#6b7280;">KisanSetu support will review and process the refund to the farmer within 3–5 business days.</p>
        </div>
        <div style="${FOOTER}"><p style="margin:0;">KisanSetu — Connecting Farmers with Equipment</p></div>
      </div>`;

      return { subject, farmerHtml, providerHtml };
    }

    case 'refund_processed': {
      const subject = `Refund Processed — ${formatINR(payload.refundAmount || 0)} | KisanSetu`;
      const farmerHtml = `<div style="${BASE_STYLE}">
        <div style="${HEADER}">
          <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">🌾 KisanSetu</h1>
          <p style="color:#bbf7d0;margin:8px 0 0;font-size:15px;">💸 Refund Processed!</p>
        </div>
        <div style="${BODY}">
          <p style="font-size:16px;margin:0 0 8px;">Hi <strong>${payload.farmerName}</strong>,</p>
          <p style="color:#6b7280;margin:0 0 16px;">Your refund for the rental of <strong>${payload.equipmentName}</strong> has been processed successfully.</p>
          <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
            <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">Refund Amount</p>
            <p style="margin:0;font-size:42px;font-weight:900;color:#16a34a;font-family:monospace;">${formatINR(payload.refundAmount || 0)}</p>
            <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">Will be credited within 3–5 business days</p>
          </div>
          <div style="background:#f9fafb;border-radius:10px;padding:16px;margin:16px 0;">
            <p style="margin:4px 0;font-size:14px;"><strong>Booking:</strong> ${bookingBadge}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Equipment:</strong> ${payload.equipmentName}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Refund Method:</strong> ${payload.refundMethod || 'Original Payment Method'}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Status:</strong> <span style="${BADGE('#16a34a')}">Processing</span></p>
          </div>
          <p style="font-size:13px;color:#6b7280;text-align:center;">Thank you for using KisanSetu! We hope your rental experience was great. 🌾</p>
        </div>
        <div style="${FOOTER}"><p style="margin:0;">KisanSetu — Connecting Farmers with Equipment</p></div>
      </div>`;

      const providerHtml = `<div style="${BASE_STYLE}">
        <div style="${HEADER}">
          <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">🌾 KisanSetu</h1>
          <p style="color:#bbf7d0;margin:8px 0 0;font-size:15px;">Rental Cycle Complete</p>
        </div>
        <div style="${BODY}">
          <p style="font-size:16px;margin:0 0 8px;">Hi <strong>${payload.providerName}</strong>,</p>
          <p style="color:#6b7280;margin:0 0 16px;">The rental cycle for <strong>${payload.equipmentName}</strong> (Booking ${bookingBadge}) is now complete. A refund of <strong>${formatINR(payload.refundAmount || 0)}</strong> has been initiated to <strong>${payload.farmerName}</strong>.</p>
          <p style="font-size:13px;color:#6b7280;">Your equipment is now available for new bookings. Thank you for being a KisanSetu provider!</p>
        </div>
        <div style="${FOOTER}"><p style="margin:0;">KisanSetu — Connecting Farmers with Equipment</p></div>
      </div>`;

      return { subject, farmerHtml, providerHtml };
    }

    default:
      return { subject: 'KisanSetu Update', farmerHtml: '<p>Update</p>' };
  }
}

export async function POST(req: NextRequest) {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
    }

    const payload: RentalEmailPayload = await req.json();
    const { subject, farmerHtml, providerHtml } = buildEmail(payload);

    const sendEmail = async (to: string, html: string, subj: string) => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'KisanSetu <onboarding@resend.dev>',
          to: [to],
          subject: subj,
          html,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Resend error: ${err}`);
      }
      return res.json();
    };

    // Send to farmer
    await sendEmail(payload.farmerEmail, farmerHtml, subject);

    // Send to provider if applicable
    if (payload.providerEmail && providerHtml) {
      await sendEmail(payload.providerEmail, providerHtml, subject);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
