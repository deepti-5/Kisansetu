import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export interface RefundRequestBody {
  bookingId: string;
  refundAmount: number; // in INR (rupees)
  reason?: string;
  damageDeduction?: number;
  depositAmount?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: RefundRequestBody = await req.json();
    const { bookingId, refundAmount, reason, damageDeduction, depositAmount } = body;

    if (!bookingId || refundAmount === undefined) {
      return NextResponse.json({ error: 'bookingId and refundAmount are required' }, { status: 400 });
    }

    if (refundAmount < 0) {
      return NextResponse.json({ error: 'Refund amount cannot be negative' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // Find the payment transaction for this booking
    const { data: txn, error: txnError } = await supabase
      .from('payment_transactions')
      .select('payment_intent_id, stripe_charge_id, amount')
      .eq('booking_id', bookingId)
      .eq('payment_status', 'succeeded')
      .maybeSingle();

    if (txnError || !txn) {
      // No Stripe transaction found — mark as manual refund
      await supabase
        .from('bookings')
        .update({
          payment_status: 'refunded',
          booking_status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      return NextResponse.json({
        success: true,
        method: 'manual',
        message: 'No Stripe payment found. Booking marked as refunded manually.',
        refundAmount,
      });
    }

    // If refund amount is 0 (full damage deduction), just mark as completed
    if (refundAmount === 0) {
      await supabase
        .from('bookings')
        .update({
          payment_status: 'refunded',
          booking_status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId);

      return NextResponse.json({
        success: true,
        method: 'no_refund',
        message: 'Full deposit retained due to damage. Booking marked as completed.',
        refundAmount: 0,
      });
    }

    // Process Stripe refund (amount in paise = rupees * 100)
    const refundAmountPaise = Math.round(refundAmount * 100);

    let stripeRefund: Stripe.Refund;

    if (txn.stripe_charge_id) {
      // Refund via charge ID
      stripeRefund = await stripe.refunds.create({
        charge: txn.stripe_charge_id,
        amount: refundAmountPaise,
        reason: 'requested_by_customer',
        metadata: {
          booking_id: bookingId,
          damage_deduction: String(damageDeduction || 0),
          deposit_amount: String(depositAmount || 0),
          refund_reason: reason || 'rental_return_deposit',
        },
      });
    } else if (txn.payment_intent_id) {
      // Refund via payment intent
      stripeRefund = await stripe.refunds.create({
        payment_intent: txn.payment_intent_id,
        amount: refundAmountPaise,
        reason: 'requested_by_customer',
        metadata: {
          booking_id: bookingId,
          damage_deduction: String(damageDeduction || 0),
          deposit_amount: String(depositAmount || 0),
          refund_reason: reason || 'rental_return_deposit',
        },
      });
    } else {
      return NextResponse.json({ error: 'No charge or payment intent found for refund' }, { status: 400 });
    }

    // Update booking and transaction status
    await Promise.all([
      supabase
        .from('bookings')
        .update({
          payment_status: 'refunded',
          booking_status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', bookingId),
      supabase
        .from('payment_transactions')
        .update({ payment_status: 'refunded' })
        .eq('booking_id', bookingId),
    ]);

    return NextResponse.json({
      success: true,
      method: 'stripe',
      refundId: stripeRefund.id,
      refundStatus: stripeRefund.status,
      refundAmount,
      message: `Refund of ₹${refundAmount.toLocaleString('en-IN')} initiated successfully`,
    });
  } catch (err: any) {
    console.error('Refund API error:', err);

    if (err.type === 'StripeInvalidRequestError') {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Refund processing failed' }, { status: 500 });
  }
}
