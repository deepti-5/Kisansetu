'use client';

import React, { useState, FormEvent } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements,
} from '@stripe/react-stripe-js';
import { getStripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Lock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  bookingRef: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentForm({ clientSecret, amount, bookingRef, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation?id=${bookingRef}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment failed. Please try again.');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        const { error: confirmError } = await supabase.functions.invoke('confirm-payment', {
          body: { paymentIntentId: paymentIntent.id },
        });

        if (confirmError) {
          console.error('Backend confirm error:', confirmError);
        }

        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Payment failed. Please try again.');
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
        <Lock size={12} />
        <span>Secured by Stripe. Your payment info is encrypted.</span>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 btn-primary py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isProcessing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock size={14} />
              Pay ₹{amount.toLocaleString('en-IN')}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

interface StripePaymentModalProps {
  isOpen: boolean;
  clientSecret: string;
  amount: number;
  bookingRef: string;
  onSuccess: () => void;
  onClose: () => void;
}

const stripePromise = getStripe();

export default function StripePaymentModal({
  isOpen,
  clientSecret,
  amount,
  bookingRef,
  onSuccess,
  onClose,
}: StripePaymentModalProps) {
  const [paid, setPaid] = useState(false);

  if (!isOpen) return null;

  function handleSuccess() {
    setPaid(true);
    setTimeout(() => {
      onSuccess();
    }, 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl">
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-foreground">Complete Payment</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Booking {bookingRef}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="font-extrabold text-lg text-primary">₹{amount.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {paid ? (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle size={32} className="text-success" />
              </div>
              <p className="font-bold text-foreground">Payment Successful!</p>
              <p className="text-sm text-muted-foreground">Redirecting...</p>
            </div>
          ) : clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#16a34a',
                    borderRadius: '8px',
                  },
                },
              }}
            >
              <PaymentForm
                clientSecret={clientSecret}
                amount={amount}
                bookingRef={bookingRef}
                onSuccess={handleSuccess}
                onCancel={onClose}
              />
            </Elements>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
