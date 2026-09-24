import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { paymentData, customerInfo, bookingId } = await req.json();

    // Create or update Stripe Customer
    const customerData: Stripe.CustomerCreateParams = {
      name: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
      email: customerInfo.email,
      phone: customerInfo.phone || undefined,
      address: {
        line1: customerInfo.billing?.address_line_1 || 'India',
        city: customerInfo.billing?.city || 'Mumbai',
        state: customerInfo.billing?.state || 'Maharashtra',
        postal_code: customerInfo.billing?.postal_code || '400001',
        country: 'IN',
      },
    };

    let stripeCustomer: Stripe.Customer;
    if (customerInfo.stripeCustomerId) {
      stripeCustomer = await stripe.customers.update(customerInfo.stripeCustomerId, customerData) as Stripe.Customer;
    } else {
      stripeCustomer = await stripe.customers.create(customerData);
    }

    // Update stripe_customer_id in user_profiles if userId provided
    if (customerInfo.userId) {
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: stripeCustomer.id })
        .eq('id', customerInfo.userId);
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(paymentData.amount * 100),
      currency: 'inr',
      customer: stripeCustomer.id,
      description: paymentData.description || 'KisanSetu Equipment Rental',
      metadata: {
        booking_id: bookingId || '',
        user_id: customerInfo.userId || 'guest',
        equipment: paymentData.equipmentName || '',
      },
    });

    // Save transaction record
    const { data: txRecord, error: txError } = await supabase
      .from('payment_transactions')
      .insert({
        booking_id: bookingId || null,
        user_id: customerInfo.userId || null,
        payment_intent_id: paymentIntent.id,
        stripe_customer_id: stripeCustomer.id,
        amount: paymentData.amount,
        currency: 'INR',
        payment_status: 'pending',
        description: paymentData.description || 'KisanSetu Equipment Rental',
      })
      .select()
      .single();

    if (txError) {
      console.error('Transaction record error:', txError);
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        transactionId: txRecord?.id,
        stripeCustomerId: stripeCustomer.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Payment setup failed';
    console.error('create-payment-intent error:', e);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
