import React from 'react';

const BOOKING_STEPS = [
  { num: 1, label: 'Select Equipment', desc: 'Browse and choose from verified listings near you' },
  { num: 2, label: 'Choose Date & Time', desc: 'Pick your rental start and end dates' },
  { num: 3, label: 'Check Availability', desc: 'Real-time availability check prevents conflicts' },
  { num: 4, label: 'Booking Summary', desc: 'Review total cost including deposit & platform fee' },
  { num: 5, label: 'Payment', desc: 'Pay securely via UPI, Card, Net Banking or COD' },
  { num: 6, label: 'Confirmation', desc: 'Receive OTP for handover and return tracking' },
];

const PAYMENT_METHODS = [
  { name: 'UPI (All Apps)', icon: '📱', popular: true },
  { name: 'Google Pay', icon: '🟡', popular: false },
  { name: 'PhonePe', icon: '🟣', popular: false },
  { name: 'Paytm', icon: '🔵', popular: false },
  { name: 'Amazon Pay', icon: '🟠', popular: false },
  { name: 'Credit/Debit Card', icon: '💳', popular: false },
  { name: 'Net Banking', icon: '🏦', popular: false },
  { name: 'Pay on Delivery', icon: '💵', popular: false },
];

export default function BookingFlowSection() {
  return (
    <section className="py-12 bg-muted/40">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16">
        <div className="text-center mb-10">
          <h2 className="section-title text-3xl mb-2">Equipment Booking Flow</h2>
          <p className="text-muted-foreground">Simple 6-step process to rent any equipment near you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Steps */}
          <div className="lg:col-span-1 card-base p-6">
            <h3 className="font-bold text-base text-foreground mb-4">Booking Steps</h3>
            <div className="space-y-3">
              {BOOKING_STEPS?.map((step) => (
                <div key={`step-${step?.num}`} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full gradient-green text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {step?.num}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{step?.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step?.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1 card-base p-6">
            <h3 className="font-bold text-base text-foreground mb-4">Sample Booking Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Equipment</span>
                <span className="font-semibold text-foreground">Mahindra Yuvo Tractor</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start</span>
                <span className="font-semibold font-tabular">12 May 2025 · 09:00 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">End</span>
                <span className="font-semibold font-tabular">15 May 2025 · 06:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-semibold">3 Days</span>
              </div>
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental Amount</span>
                  <span className="font-tabular">₹7,500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Security Deposit</span>
                  <span className="font-tabular text-warning">₹10,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-tabular">₹150</span>
                </div>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-bold text-foreground">Total Payable</span>
                <span className="font-bold text-xl text-primary font-tabular">₹17,650</span>
              </div>
              <div className="bg-secondary/60 rounded-lg p-2.5 text-xs text-muted-foreground">
                ⚡ Deposit ₹10,000 refunded after equipment return inspection
              </div>
              <button suppressHydrationWarning className="w-full btn-primary py-3 text-sm mt-2">
                Continue to Payment
              </button>
            </div>
          </div>

          {/* Payment Options */}
          <div className="lg:col-span-1 card-base p-6">
            <h3 className="font-bold text-base text-foreground mb-1">Payment Options</h3>
            <p className="text-xs text-muted-foreground mb-4">Powered by Razorpay — 100% Secure</p>
            <div className="space-y-2">
              {PAYMENT_METHODS?.map((method) => (
                <div
                  key={`pay-${method?.name}`}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer hover:border-primary hover:bg-secondary/50 ${
                    method?.popular ? 'border-primary bg-secondary/30' : 'border-border'
                  }`}
                >
                  <span className="text-xl">{method?.icon}</span>
                  <span className="text-sm font-medium text-foreground flex-1">{method?.name}</span>
                  {method?.popular && (
                    <span className="badge-green text-xs">Popular</span>
                  )}
                </div>
              ))}
            </div>
            <button suppressHydrationWarning className="w-full btn-accent py-3 text-sm font-bold mt-4">
              Pay ₹17,650
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}