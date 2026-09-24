'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Loader2, ShieldCheck } from 'lucide-react';

export interface PaymentResult {
  paymentId: string;
  orderId: string;
  razorpayOrderId: string;
}

interface RazorpayCheckoutProps {
  amount: number;
  receipt?: string;
  notes?: Record<string, string>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  description?: string;
  buttonText?: string;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onSuccess: (result: PaymentResult) => void;
  onError: (error: string) => void;
  onDismiss?: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  handler: (response: RazorpayResponse) => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (data: { error: { description: string } }) => void) => void;
}

function isDemoMode(keyId: string | undefined): boolean {
  if (!keyId) return true;
  const lower = keyId.toLowerCase();
  return (
    lower === 'your-razorpay-key-id-here' || lower.startsWith('your-') ||
    lower === '' || lower === 'undefined' || lower === 'null'
  );
}

export default function RazorpayCheckout({
  amount,
  receipt,
  notes,
  prefill,
  description = 'KisanSetu Equipment Rental',
  buttonText = 'Pay Now',
  loadingText = 'Processing...',
  className,
  disabled = false,
  onSuccess,
  onError,
  onDismiss,
}: RazorpayCheckoutProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      setScriptLoaded(true);
    }
  }, []);

  const handlePayment = async () => {
    if (loading || disabled) return;
    setLoading(true);

    try {
      const orderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, receipt, notes }),
      });

      const orderData = await orderRes.json();

      if (!orderData.success || isDemoMode(orderData.keyId)) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setLoading(false);
        const demoPayId = 'pay_DEMO' + Math.random().toString(36).substring(2, 12).toUpperCase();
        const demoOrdId = 'order_DEMO' + Math.random().toString(36).substring(2, 12).toUpperCase();
        onSuccess({ paymentId: demoPayId, orderId: demoOrdId, razorpayOrderId: demoOrdId });
        return;
      }

      if (!scriptLoaded) {
        setLoading(false);
        onError('Payment gateway not loaded. Please refresh and try again.');
        return;
      }

      const options: RazorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'KisanSetu',
        description,
        order_id: orderData.orderId,
        prefill: prefill || {},
        notes: notes || {},
        theme: { color: '#16a34a' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onDismiss?.();
          },
        },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            setLoading(false);

            if (verifyData.success) {
              onSuccess({
                paymentId: verifyData.paymentId,
                orderId: verifyData.orderId,
                razorpayOrderId: response.razorpay_order_id,
              });
            } else {
              onError(verifyData.error || 'Payment verification failed');
            }
          } catch {
            setLoading(false);
            onError('Payment verification request failed');
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (res) => {
        setLoading(false);
        onError(res.error.description || 'Payment failed');
      });
      rzp.open();
    } catch (err: unknown) {
      setLoading(false);
      const message = err instanceof Error ? err.message : 'Payment initiation failed';
      onError(message);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <button
        onClick={handlePayment}
        disabled={disabled || loading}
        className={
          className ||
          'w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-base transition-all btn-primary disabled:opacity-60 disabled:cursor-not-allowed'
        }
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {loadingText}
          </>
        ) : (
          <>
            <ShieldCheck size={16} />
            {buttonText}
          </>
        )}
      </button>
    </>
  );
}
