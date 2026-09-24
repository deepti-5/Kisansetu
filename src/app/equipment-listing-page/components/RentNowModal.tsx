'use client';

import React, { useState } from 'react';
import { Equipment } from './EquipmentListingContent';
import { X, Calendar, Clock, ChevronRight, CheckCircle, MapPin, Star, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import RazorpayCheckout, { PaymentResult } from '@/components/RazorpayCheckout';

interface Props { equipment: Equipment; onClose: () => void; }
type Step = 'dates' | 'summary' | 'payment' | 'confirmation';

export default function RentNowModal({ equipment, onClose }: Props) {
  const [step, setStep] = useState<Step>('dates');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [bookingId, setBookingId] = useState('');
  const [paidPaymentId, setPaidPaymentId] = useState('');

  const days = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1) : 1;
  const rentalAmount = days * equipment.rentPerDay;
  const platformFee = Math.round(rentalAmount * 0.02);
  const totalPayable = rentalAmount + equipment.deposit + platformFee;

  const STEPS: { key: Step; label: string }[] = [{ key: 'dates', label: 'Dates' }, { key: 'summary', label: 'Summary' }, { key: 'payment', label: 'Payment' }, { key: 'confirmation', label: 'Done' }];

  function handleProceed() {
    if (step === 'dates') {
      if (!startDate || !endDate) { toast.error('Please select start and end dates'); return; }
      if (new Date(endDate) < new Date(startDate)) { toast.error('End date must be after start date'); return; }
      setStep('summary');
    } else if (step === 'summary') {
      setStep('payment');
    }
  }

  function handlePaymentSuccess(result: PaymentResult) {
    const newBookingId = 'BKG' + Math.floor(Math.random() * 90000 + 10000);
    setBookingId(newBookingId); setPaidPaymentId(result.paymentId); setStep('confirmation');
    toast.success('Booking confirmed! Payment verified ✅');
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
      <div className="bg-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-modal max-h-[95vh] overflow-y-auto fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div><h3 className="font-bold text-base text-foreground">Rent Equipment</h3><p className="text-xs text-muted-foreground line-clamp-1">{equipment.name}</p></div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X size={18} /></button>
        </div>

        <div className="px-5 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <React.Fragment key={`step-ind-${s.key}`}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s.key ? 'gradient-green text-white' : STEPS.findIndex((x) => x.key === step) > i ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}>
                    {STEPS.findIndex((x) => x.key === step) > i ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs font-medium ${step === s.key ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 transition-colors ${STEPS.findIndex((x) => x.key === step) > i ? 'bg-success' : 'bg-border'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="p-5">
          {step === 'dates' && (
            <div className="space-y-4 slide-up">
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
                  <img src={equipment.image} alt={equipment.imageAlt} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{equipment.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Star size={11} className="text-accent fill-accent" />{equipment.rating} · <MapPin size={10} className="text-primary" /> {equipment.distance} km
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5"><Calendar size={13} className="inline mr-1.5 text-primary" />Start Date</label>
                  <input type="date" value={startDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setStartDate(e.target.value)} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5"><Calendar size={13} className="inline mr-1.5 text-primary" />End Date</label>
                  <input type="date" value={endDate} min={startDate || new Date().toISOString().split('T')[0]} onChange={(e) => setEndDate(e.target.value)} className="input-field text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5"><Clock size={13} className="inline mr-1.5 text-primary" />Pickup Time</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5"><Clock size={13} className="inline mr-1.5 text-primary" />Return Time</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="input-field text-sm" />
                </div>
              </div>
              {startDate && endDate && (
                <div className="bg-secondary/60 rounded-xl p-3 text-sm">
                  <div className="flex items-center justify-between"><span className="text-muted-foreground">Duration</span><span className="font-bold text-primary">{days} day{days > 1 ? 's' : ''}</span></div>
                  <div className="flex items-center justify-between mt-1"><span className="text-muted-foreground">Estimated rental</span><span className="font-bold text-foreground font-tabular">₹{rentalAmount.toLocaleString('en-IN')}</span></div>
                </div>
              )}
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-warning-bg rounded-lg p-3">
                <AlertCircle size={14} className="text-warning shrink-0 mt-0.5" />
                Security deposit of ₹{equipment.deposit.toLocaleString('en-IN')} will be collected and refunded after return inspection.
              </div>
            </div>
          )}

          {step === 'summary' && (
            <div className="space-y-4 slide-up">
              <h4 className="font-bold text-sm text-foreground">Booking Summary</h4>
              <div className="space-y-2.5 text-sm">
                {[{ label: 'Equipment', value: equipment.name }, { label: 'Owner', value: equipment.owner }, { label: 'Start', value: `${startDate} · ${startTime}` }, { label: 'End', value: `${endDate} · ${endTime}` }, { label: 'Duration', value: `${days} day${days > 1 ? 's' : ''}` }].map((row) => (
                  <div key={`summary-${row.label}`} className="flex justify-between"><span className="text-muted-foreground">{row.label}</span><span className="font-semibold text-foreground text-right max-w-[200px] font-tabular">{row.value}</span></div>
                ))}
                <div className="border-t border-border pt-2.5 space-y-2">
                  <div className="flex justify-between"><span className="text-muted-foreground">Rental ({days}d × ₹{equipment.rentPerDay.toLocaleString('en-IN')})</span><span className="font-tabular">₹{rentalAmount.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Security Deposit</span><span className="text-warning font-semibold font-tabular">₹{equipment.deposit.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Platform Fee (2%)</span><span className="font-tabular">₹{platformFee.toLocaleString('en-IN')}</span></div>
                </div>
                <div className="border-t border-border pt-2.5 flex justify-between"><span className="font-bold text-foreground text-base">Total Payable</span><span className="font-bold text-xl text-primary font-tabular">₹{totalPayable.toLocaleString('en-IN')}</span></div>
              </div>
              <div className="bg-secondary/60 rounded-lg p-3 text-xs text-muted-foreground flex items-start gap-2">
                <Shield size={13} className="text-primary shrink-0 mt-0.5" />
                Deposit ₹{equipment.deposit.toLocaleString('en-IN')} is fully refundable after equipment return and inspection within 48 hours.
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-4 slide-up">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-foreground">Secure Payment</h4>
                <span className="font-bold text-primary font-tabular">₹{totalPayable.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-muted/40 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex justify-between text-muted-foreground"><span>Rental ({days}d)</span><span className="font-tabular">₹{rentalAmount.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Security Deposit</span><span className="font-tabular text-warning">₹{equipment.deposit.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Platform Fee (2%)</span><span className="font-tabular">₹{platformFee.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-bold text-foreground border-t border-border pt-1.5"><span>Total</span><span className="font-tabular text-primary">₹{totalPayable.toLocaleString('en-IN')}</span></div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                {[{ icon: '📱', label: 'UPI' }, { icon: '💳', label: 'Cards' }, { icon: '🏦', label: 'Net Banking' }].map((m) => (
                  <div key={m.label} className="bg-muted/40 rounded-lg py-2 px-1"><div className="text-lg mb-0.5">{m.icon}</div><div className="font-medium">{m.label}</div></div>
                ))}
              </div>
              <RazorpayCheckout amount={totalPayable} receipt={`kisan_${equipment.id}_${Date.now()}`} notes={{ equipmentId: equipment.id, equipmentName: equipment.name, startDate, endDate }} description={`Rental: ${equipment.name} (${days} day${days > 1 ? 's' : ''})`} buttonText={`Pay ₹${totalPayable.toLocaleString('en-IN')} via Razorpay`} loadingText="Processing Payment..." onSuccess={handlePaymentSuccess} onError={(error) => toast.error(`Payment failed: ${error}`)} onDismiss={() => toast.info('Payment cancelled')} />
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-lg p-2.5">
                <Shield size={13} className="text-success shrink-0" />100% secure payments powered by Razorpay. Supports UPI, Cards &amp; Net Banking.
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="text-center py-4 slide-up">
              <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-success" /></div>
              <h3 className="font-bold text-xl text-foreground mb-2">Booking Confirmed!</h3>
              <p className="text-sm text-muted-foreground mb-4">Your equipment rental has been successfully booked and payment verified.</p>
              <div className="bg-muted/40 rounded-xl p-4 text-left space-y-2 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Booking ID</span><span className="font-bold text-primary font-tabular">{bookingId}</span></div>
                {paidPaymentId && <div className="flex justify-between"><span className="text-muted-foreground">Payment ID</span><span className="font-mono text-xs text-foreground truncate max-w-[160px]">{paidPaymentId}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Equipment</span><span className="font-semibold text-foreground">{equipment.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Paid</span><span className="font-bold text-foreground font-tabular">₹{totalPayable.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="badge-green">Payment Verified ✓</span></div>
              </div>
              <div className="bg-warning-bg border border-warning/20 rounded-lg p-3 text-left mb-4">
                <p className="text-xs font-bold text-warning mb-1">Handover OTP will be sent to your mobile</p>
                <p className="text-xs text-muted-foreground">Share this OTP with the equipment owner at the time of pickup.</p>
              </div>
              <button onClick={onClose} className="w-full btn-primary py-3">View My Bookings</button>
            </div>
          )}
        </div>

        {(step === 'dates' || step === 'summary') && (
          <div className="px-5 pb-5 pt-2 border-t border-border sticky bottom-0 bg-card">
            <div className="flex gap-3">
              {step !== 'dates' && (
                <button onClick={() => { const idx = STEPS.findIndex((s) => s.key === step); setStep(STEPS[idx - 1].key); }} className="btn-secondary py-3 px-5">← Back</button>
              )}
              <button onClick={handleProceed} className="flex-1 btn-primary py-3 text-base font-bold">Continue <ChevronRight size={16} /></button>
            </div>
          </div>
        )}
        {step === 'payment' && (
          <div className="px-5 pb-5 pt-2 border-t border-border sticky bottom-0 bg-card">
            <button onClick={() => setStep('summary')} className="btn-secondary py-3 px-5 w-full">← Back to Summary</button>
          </div>
        )}
      </div>
    </div>
  );
}
