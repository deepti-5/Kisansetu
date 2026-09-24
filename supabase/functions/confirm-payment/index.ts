import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe((globalThis as any).Deno.env.get('STRIPE_SECRET_KEY')!);
    const supabase = createClient(
      (globalThis as any).Deno.env.get('SUPABASE_URL')!,
      (globalThis as any).Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { paymentIntentId } = await req.json();

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Find transaction record
    const { data: txRecord, error: txFindError } = await supabase
      .from('payment_transactions')
      .select('*, bookings(*)')
      .eq('payment_intent_id', paymentIntentId)
      .single();

    if (txFindError || !txRecord) {
      throw new Error('Transaction record not found');
    }

    const succeeded = paymentIntent.status === 'succeeded';

    // Update transaction
    await supabase
      .from('payment_transactions')
      .update({
        payment_status: succeeded ? 'succeeded' : 'failed',
        stripe_charge_id: paymentIntent.latest_charge as string || null,
      })
      .eq('payment_intent_id', paymentIntentId);

    // Update booking payment status
    if (txRecord.booking_id && succeeded) {
      const booking = txRecord.bookings;
      const newAmountPaid = (booking?.amount_paid || 0) + txRecord.amount;
      const totalAmount = booking?.total_amount || 0;
      const newPaymentStatus = newAmountPaid >= totalAmount ? 'paid' : 'partial';

      await supabase
        .from('bookings')
        .update({
          amount_paid: newAmountPaid,
          payment_status: newPaymentStatus,
          payment_method: 'Stripe',
        })
        .eq('id', txRecord.booking_id);
    }

    return new Response(
      JSON.stringify({ success: true, status: paymentIntent.status }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Confirmation failed';
    console.error('confirm-payment error:', e);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
