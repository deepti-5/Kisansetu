import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

interface BookingEmailPayload {
  type: 'booking_created' | 'booking_approved' | 'booking_declined' | 'booking_completed' | 'payment_receipt';
  buyerEmail: string;
  supplierEmail?: string;
  bookingRef: string;
  equipmentName: string;
  supplierName: string;
  supplierPhone: string;
  buyerName: string;
  startDate: string;
  endDate: string;
  days: number;
  dailyRate: number;
  subtotal: number;
  deposit: number;
  platformFee: number;
  totalAmount: number;
  amountPaid: number;
  paymentMethod?: string;
  meetingPoint?: string;
  meetingTime?: string;
  driverName?: string;
  driverPhone?: string;
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function getEmailContent(payload: BookingEmailPayload): { subject: string; html: string } {
  const priceBreakdown = `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr style="background:#f9fafb;"><td style="padding:8px 12px;font-size:14px;color:#6b7280;">Daily Rate</td><td style="padding:8px 12px;font-size:14px;text-align:right;">${formatCurrency(payload.dailyRate)}/day</td></tr>
      <tr><td style="padding:8px 12px;font-size:14px;color:#6b7280;">Rental (${payload.days} days)</td><td style="padding:8px 12px;font-size:14px;text-align:right;">${formatCurrency(payload.subtotal)}</td></tr>
      <tr style="background:#f9fafb;"><td style="padding:8px 12px;font-size:14px;color:#6b7280;">Refundable Deposit</td><td style="padding:8px 12px;font-size:14px;text-align:right;color:#f59e0b;">${formatCurrency(payload.deposit)}</td></tr>
      <tr><td style="padding:8px 12px;font-size:14px;color:#6b7280;">Platform Fee (5%)</td><td style="padding:8px 12px;font-size:14px;text-align:right;">${formatCurrency(payload.platformFee)}</td></tr>
      <tr style="background:#16a34a;"><td style="padding:10px 12px;font-size:15px;font-weight:bold;color:white;">Total Amount</td><td style="padding:10px 12px;font-size:15px;font-weight:bold;color:white;text-align:right;">${formatCurrency(payload.totalAmount)}</td></tr>
    </table>
  `;

  const baseStyle = `font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;`;
  const headerStyle = `background:linear-gradient(135deg,#16a34a,#15803d);padding:32px 24px;text-align:center;border-radius:8px 8px 0 0;`;
  const bodyStyle = `padding:24px;`;
  const footerStyle = `background:#f9fafb;padding:16px 24px;text-align:center;font-size:12px;color:#9ca3af;border-radius:0 0 8px 8px;`;

  const supplierInfo = `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
      <h3 style="margin:0 0 8px;font-size:14px;color:#15803d;">Supplier Contact</h3>
      <p style="margin:4px 0;font-size:14px;"><strong>${payload.supplierName}</strong></p>
      <p style="margin:4px 0;font-size:14px;color:#6b7280;">📞 ${payload.supplierPhone}</p>
    </div>
  `;

  switch (payload.type) {
    case 'booking_created':
      return {
        subject: `Booking Confirmed - ${payload.bookingRef} | KisanSetu`,
        html: `<div style="${baseStyle}">
          <div style="${headerStyle}">
            <h1 style="color:white;margin:0;font-size:24px;">🌾 KisanSetu</h1>
            <p style="color:#bbf7d0;margin:8px 0 0;font-size:16px;">Booking Confirmed!</p>
          </div>
          <div style="${bodyStyle}">
            <p style="font-size:16px;">Hi <strong>${payload.buyerName}</strong>,</p>
            <p style="color:#6b7280;">Your booking has been successfully created. Here are your booking details:</p>
            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:4px 0;font-size:14px;"><strong>Booking ID:</strong> ${payload.bookingRef}</p>
              <p style="margin:4px 0;font-size:14px;"><strong>Equipment:</strong> ${payload.equipmentName}</p>
              <p style="margin:4px 0;font-size:14px;"><strong>Rental Period:</strong> ${payload.startDate} to ${payload.endDate} (${payload.days} days)</p>
            </div>
            ${priceBreakdown}
            ${supplierInfo}
            ${payload.meetingPoint ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0;"><h3 style="margin:0 0 8px;font-size:14px;color:#1d4ed8;">Meeting Details</h3><p style="margin:4px 0;font-size:14px;">📍 ${payload.meetingPoint}</p>${payload.meetingTime ? `<p style="margin:4px 0;font-size:14px;">🕐 ${payload.meetingTime}</p>` : ''}</div>` : ''}
            ${payload.driverName ? `<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0;"><h3 style="margin:0 0 8px;font-size:14px;color:#92400e;">Driver Details</h3><p style="margin:4px 0;font-size:14px;"><strong>${payload.driverName}</strong></p><p style="margin:4px 0;font-size:14px;">📞 ${payload.driverPhone}</p></div>` : ''}
          </div>
          <div style="${footerStyle}"><p>KisanSetu - Connecting Farmers with Equipment</p><p>This is an automated email. Please do not reply.</p></div>
        </div>`,
      };

    case 'booking_approved':
      return {
        subject: `Booking Approved - ${payload.bookingRef} | KisanSetu`,
        html: `<div style="${baseStyle}">
          <div style="${headerStyle}">
            <h1 style="color:white;margin:0;font-size:24px;">🌾 KisanSetu</h1>
            <p style="color:#bbf7d0;margin:8px 0 0;font-size:16px;">✅ Booking Approved!</p>
          </div>
          <div style="${bodyStyle}">
            <p style="font-size:16px;">Hi <strong>${payload.buyerName}</strong>,</p>
            <p style="color:#6b7280;">Great news! Your booking <strong>${payload.bookingRef}</strong> has been approved by the supplier.</p>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:4px 0;font-size:14px;"><strong>Equipment:</strong> ${payload.equipmentName}</p>
              <p style="margin:4px 0;font-size:14px;"><strong>Rental Period:</strong> ${payload.startDate} to ${payload.endDate}</p>
            </div>
            ${supplierInfo}
            ${payload.meetingPoint ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0;"><h3 style="margin:0 0 8px;font-size:14px;color:#1d4ed8;">Meeting Details</h3><p style="margin:4px 0;font-size:14px;">📍 ${payload.meetingPoint}</p>${payload.meetingTime ? `<p style="margin:4px 0;font-size:14px;">🕐 ${payload.meetingTime}</p>` : ''}</div>` : ''}
          </div>
          <div style="${footerStyle}"><p>KisanSetu - Connecting Farmers with Equipment</p></div>
        </div>`,
      };

    case 'booking_declined':
      return {
        subject: `Booking Update - ${payload.bookingRef} | KisanSetu`,
        html: `<div style="${baseStyle}">
          <div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:32px 24px;text-align:center;border-radius:8px 8px 0 0;">
            <h1 style="color:white;margin:0;font-size:24px;">🌾 KisanSetu</h1>
            <p style="color:#fecaca;margin:8px 0 0;font-size:16px;">Booking Update</p>
          </div>
          <div style="${bodyStyle}">
            <p style="font-size:16px;">Hi <strong>${payload.buyerName}</strong>,</p>
            <p style="color:#6b7280;">Unfortunately, your booking <strong>${payload.bookingRef}</strong> for <strong>${payload.equipmentName}</strong> could not be confirmed at this time. Please browse other available equipment on KisanSetu.</p>
          </div>
          <div style="${footerStyle}"><p>KisanSetu - Connecting Farmers with Equipment</p></div>
        </div>`,
      };

    case 'booking_completed':
      return {
        subject: `Rental Completed - ${payload.bookingRef} | KisanSetu`,
        html: `<div style="${baseStyle}">
          <div style="${headerStyle}">
            <h1 style="color:white;margin:0;font-size:24px;">🌾 KisanSetu</h1>
            <p style="color:#bbf7d0;margin:8px 0 0;font-size:16px;">🎉 Rental Completed!</p>
          </div>
          <div style="${bodyStyle}">
            <p style="font-size:16px;">Hi <strong>${payload.buyerName}</strong>,</p>
            <p style="color:#6b7280;">Your rental of <strong>${payload.equipmentName}</strong> has been completed. Thank you for using KisanSetu!</p>
            ${priceBreakdown}
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:4px 0;font-size:14px;color:#15803d;">💚 Your refundable deposit of <strong>${formatCurrency(payload.deposit)}</strong> will be processed within 3-5 business days.</p>
            </div>
          </div>
          <div style="${footerStyle}"><p>KisanSetu - Connecting Farmers with Equipment</p></div>
        </div>`,
      };

    case 'payment_receipt':
      return {
        subject: `Payment Receipt - ${payload.bookingRef} | KisanSetu`,
        html: `<div style="${baseStyle}">
          <div style="${headerStyle}">
            <h1 style="color:white;margin:0;font-size:24px;">🌾 KisanSetu</h1>
            <p style="color:#bbf7d0;margin:8px 0 0;font-size:16px;">Payment Receipt</p>
          </div>
          <div style="${bodyStyle}">
            <p style="font-size:16px;">Hi <strong>${payload.buyerName}</strong>,</p>
            <p style="color:#6b7280;">We've received your payment. Here's your receipt:</p>
            <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:4px 0;font-size:14px;"><strong>Booking ID:</strong> ${payload.bookingRef}</p>
              <p style="margin:4px 0;font-size:14px;"><strong>Equipment:</strong> ${payload.equipmentName}</p>
              <p style="margin:4px 0;font-size:14px;"><strong>Amount Paid:</strong> ${formatCurrency(payload.amountPaid)}</p>
              ${payload.paymentMethod ? `<p style="margin:4px 0;font-size:14px;"><strong>Payment Method:</strong> ${payload.paymentMethod}</p>` : ''}
            </div>
            ${priceBreakdown}
            ${supplierInfo}
          </div>
          <div style="${footerStyle}"><p>KisanSetu - Connecting Farmers with Equipment</p><p>Keep this email as your payment receipt.</p></div>
        </div>`,
      };

    default:
      return { subject: `KisanSetu Booking Update - ${payload.bookingRef}`, html: '<p>Booking update</p>' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const payload: BookingEmailPayload = await req.json();
    const { subject, html } = getEmailContent(payload);

    // Send to buyer
    const buyerRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [payload.buyerEmail],
        subject,
        html,
      }),
    });

    if (!buyerRes.ok) {
      const err = await buyerRes.text();
      throw new Error(`Resend API error: ${err}`);
    }

    // Send to supplier if email provided and it's a new booking
    if (payload.supplierEmail && payload.type === 'booking_created') {
      const supplierHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px 24px;text-align:center;border-radius:8px 8px 0 0;">
          <h1 style="color:white;margin:0;font-size:24px;">🌾 KisanSetu</h1>
          <p style="color:#bbf7d0;margin:8px 0 0;font-size:16px;">New Booking Request!</p>
        </div>
        <div style="padding:24px;">
          <p style="font-size:16px;">Hi <strong>${payload.supplierName}</strong>,</p>
          <p style="color:#6b7280;">You have a new booking request from <strong>${payload.buyerName}</strong>.</p>
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="margin:4px 0;font-size:14px;"><strong>Booking ID:</strong> ${payload.bookingRef}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Equipment:</strong> ${payload.equipmentName}</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Rental Period:</strong> ${payload.startDate} to ${payload.endDate} (${payload.days} days)</p>
            <p style="margin:4px 0;font-size:14px;"><strong>Total Amount:</strong> ₹${payload.totalAmount.toLocaleString('en-IN')}</p>
          </div>
          <p style="color:#6b7280;">Please log in to your Supplier Hub to accept or decline this request.</p>
        </div>
        <div style="background:#f9fafb;padding:16px 24px;text-align:center;font-size:12px;color:#9ca3af;border-radius:0 0 8px 8px;"><p>KisanSetu - Connecting Farmers with Equipment</p></div>
      </div>`;

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'onboarding@resend.dev',
          to: [payload.supplierEmail],
          subject: `New Booking Request - ${payload.bookingRef} | KisanSetu`,
          html: supplierHtml,
        }),
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Email sending failed';
    console.error('send-booking-email error:', error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
