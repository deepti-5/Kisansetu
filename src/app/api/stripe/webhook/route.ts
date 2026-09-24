import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

// Use service-role client for webhook (bypasses RLS)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  // Verify webhook signature if secret is configured
  if (webhookSecret && sig) {
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } else {
    // Parse without verification (dev mode)
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
  }

  const supabase = getAdminClient();

  try {
    switch (event.type) {
      // ── Payment succeeded ─────────────────────────────────────────────────
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = pi.metadata?.booking_id;

        if (bookingId) {
          await supabase
            .from('payment_transactions')
            .update({ payment_status: 'succeeded', stripe_charge_id: pi.latest_charge as string })
            .eq('payment_intent_id', pi.id);

          await supabase
            .from('bookings')
            .update({ payment_status: 'paid', booking_status: 'accepted' })
            .eq('id', bookingId);
        }
        break;
      }

      // ── Payment failed ────────────────────────────────────────────────────
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const bookingId = pi.metadata?.booking_id;

        if (bookingId) {
          await supabase
            .from('payment_transactions')
            .update({ payment_status: 'failed' })
            .eq('payment_intent_id', pi.id);

          await supabase
            .from('bookings')
            .update({ payment_status: 'failed' })
            .eq('id', bookingId);
        }
        break;
      }

      // ── Refund created (auto-triggered from damage assessment approval) ───
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;

        if (paymentIntentId) {
          // Find booking via payment transaction
          const { data: txn } = await supabase
            .from('payment_transactions')
            .select('booking_id')
            .eq('payment_intent_id', paymentIntentId)
            .maybeSingle();

          if (txn?.booking_id) {
            const refundedAmount = charge.amount_refunded / 100; // Stripe uses paise

            await supabase
              .from('bookings')
              .update({
                payment_status: 'refunded',
                booking_status: 'completed',
                updated_at: new Date().toISOString(),
              })
              .eq('id', txn.booking_id);

            await supabase
              .from('payment_transactions')
              .update({ payment_status: 'refunded' })
              .eq('payment_intent_id', paymentIntentId);

            console.log(`Refund processed for booking ${txn.booking_id}: ₹${refundedAmount}`);
          }
        }
        break;
      }

      // ── Refund updated ────────────────────────────────────────────────────
      case 'refund.updated': {
        const refund = event.data.object as Stripe.Refund;
        if (refund.status === 'succeeded' && refund.payment_intent) {
          const { data: txn } = await supabase
            .from('payment_transactions')
            .select('booking_id')
            .eq('payment_intent_id', refund.payment_intent as string)
            .maybeSingle();

          if (txn?.booking_id) {
            await supabase
              .from('bookings')
              .update({ payment_status: 'refunded', updated_at: new Date().toISOString() })
              .eq('id', txn.booking_id);
          }
        }
        break;
      }

      default:
        // Unhandled event type — log and return 200
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Webhook handler error:', err.message);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
