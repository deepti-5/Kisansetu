'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ChevronRight, RotateCcw, Shield, CheckCircle, AlertTriangle, Camera, IndianRupee, Phone, Star, Clock, Truck, XCircle, Eye, RefreshCw, ChevronLeft } from 'lucide-react';

type ReturnStep = 'request' | 'otp' | 'inspection' | 'damage' | 'deposit' | 'refund';
type UserRole = 'farmer' | 'provider';

interface DamageItem {
  id: string;
  label: string;
  checked: boolean;
  severity: 'minor' | 'moderate' | 'major';
  cost: number;
}

const DAMAGE_CHECKLIST: DamageItem[] = [
  { id: 'd1', label: 'Scratches / Paint damage', checked: false, severity: 'minor', cost: 500 },
  { id: 'd2', label: 'Dents or body damage', checked: false, severity: 'moderate', cost: 2000 },
  { id: 'd3', label: 'Missing parts / accessories', checked: false, severity: 'moderate', cost: 1500 },
  { id: 'd4', label: 'Engine / mechanical issue', checked: false, severity: 'major', cost: 5000 },
  { id: 'd5', label: 'Tyre damage', checked: false, severity: 'moderate', cost: 1800 },
  { id: 'd6', label: 'Hydraulic / electrical fault', checked: false, severity: 'major', cost: 4000 },
  { id: 'd7', label: 'Fuel tank damage', checked: false, severity: 'major', cost: 3000 },
  { id: 'd8', label: 'Excessive dirt / not cleaned', checked: false, severity: 'minor', cost: 300 },
];

const MOCK_BOOKING = {
  id: 'BKG82341',
  equipmentName: 'Mahindra 575 DI Tractor',
  equipmentImage: 'https://images.unsplash.com/photo-1708417134916-234bb4b33881',
  supplierName: 'Ramesh Agro Services',
  farmerName: 'Suresh Yadav',
  startDate: '2026-08-10',
  endDate: '2026-08-14',
  deposit: 2000,
  rentalAmount: 8500,
  platformFee: 170,
};

const STEP_CONFIG: { key: ReturnStep; label: string; farmerLabel?: string; providerLabel?: string }[] = [
  { key: 'request', label: 'Return Request' },
  { key: 'otp', label: 'OTP Handover' },
  { key: 'inspection', label: 'Inspection' },
  { key: 'damage', label: 'Damage Check' },
  { key: 'deposit', label: 'Deposit Calc' },
  { key: 'refund', label: 'Refund' },
];

export default function RentalReturnPage() {
  const [role, setRole] = useState<UserRole>('farmer');
  const [step, setStep] = useState<ReturnStep>('request');
  const [returnReason, setReturnReason] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [damages, setDamages] = useState<DamageItem[]>(DAMAGE_CHECKLIST);
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [conditionRating, setConditionRating] = useState(0);
  const [refundProcessed, setRefundProcessed] = useState(false);

  const MOCK_OTP = '4821';

  useEffect(() => {
    if (otpTimer > 0) {
      const t = setTimeout(() => setOtpTimer((p) => p - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [otpTimer]);

  const totalDamageCost = damages.filter((d) => d.checked).reduce((s, d) => s + d.cost, 0);
  const refundAmount = Math.max(0, MOCK_BOOKING.deposit - totalDamageCost);
  const hasDamage = damages.some((d) => d.checked);

  const stepIndex = STEP_CONFIG.findIndex((s) => s.key === step);

  function handleSendOTP() {
    setOtpSent(true);
    setOtpTimer(60);
  }

  function handleVerifyOTP() {
    if (otpValue === MOCK_OTP) {
      setOtpVerified(true);
    }
  }

  function toggleDamage(id: string) {
    setDamages((prev) => prev.map((d) => d.id === id ? { ...d, checked: !d.checked } : d));
  }

  function goNext() {
    const order: ReturnStep[] = ['request', 'otp', 'inspection', 'damage', 'deposit', 'refund'];
    const idx = order.indexOf(step);
    if (idx < order.length - 1) setStep(order[idx + 1]);
  }

  function goBack() {
    const order: ReturnStep[] = ['request', 'otp', 'inspection', 'damage', 'deposit', 'refund'];
    const idx = order.indexOf(step);
    if (idx > 0) setStep(order[idx - 1]);
  }

  const severityColor = (s: DamageItem['severity']) =>
    s === 'minor' ? 'text-warning bg-warning/10 border-warning/20' :
    s === 'moderate'? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-danger bg-danger/10 border-danger/20';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-md mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={14} />
          <Link href="/account/bookings" className="hover:text-primary">My Bookings</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">Return Equipment</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-foreground">Return Equipment</h1>
          {/* Role toggle */}
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
            {(['farmer', 'provider'] as UserRole[]).map((r) => (
              <button key={r} onClick={() => setRole(r)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${role === r ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}>{r}</button>
            ))}
          </div>
        </div>

        {/* Booking card */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-6 flex items-center gap-4">
          <img src={MOCK_BOOKING.equipmentImage} alt={MOCK_BOOKING.equipmentName} className="w-16 h-16 rounded-xl object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-sm">{MOCK_BOOKING.equipmentName}</p>
            <p className="text-xs text-muted-foreground">{MOCK_BOOKING.supplierName} · #{MOCK_BOOKING.id}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{MOCK_BOOKING.startDate} → {MOCK_BOOKING.endDate}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-muted-foreground">Deposit</p>
            <p className="font-bold text-warning text-sm">₹{MOCK_BOOKING.deposit.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Step progress */}
        <div className="flex items-center mb-8 overflow-x-auto pb-1">
          {STEP_CONFIG.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s.key ? 'gradient-green text-white' : stepIndex > i ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}>
                  {stepIndex > i ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className={`text-[10px] font-medium whitespace-nowrap ${step === s.key ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
              </div>
              {i < STEP_CONFIG.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 transition-colors ${stepIndex > i ? 'bg-success' : 'bg-border'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-card rounded-2xl border border-border p-6">

          {/* STEP 1: Return Request */}
          {step === 'request' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><RotateCcw size={20} className="text-primary" /></div>
                <div>
                  <h2 className="font-bold text-foreground">Initiate Return Request</h2>
                  <p className="text-xs text-muted-foreground">{role === 'farmer' ? 'Tell us why you\'re returning the equipment' : 'Review the farmer\'s return request'}</p>
                </div>
              </div>

              {role === 'farmer' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Return Reason *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Work completed', 'Equipment issue', 'Early return', 'Other'].map((r) => (
                        <button key={r} onClick={() => setReturnReason(r)} className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${returnReason === r ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>{r}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Additional Notes</label>
                    <textarea value={returnNotes} onChange={(e) => setReturnNotes(e.target.value)} placeholder="Describe the equipment condition, any issues..." rows={3} className="input-field text-sm resize-none w-full" />
                  </div>
                  <div className="bg-warning-bg border border-warning/20 rounded-xl p-3 flex items-start gap-2">
                    <AlertTriangle size={15} className="text-warning shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">An OTP will be generated for secure handover. Share it with the provider when returning the equipment.</p>
                  </div>
                  <button disabled={!returnReason} onClick={goNext} className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed">Submit Return Request →</button>
                </>
              ) : (
                <>
                  <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Farmer</span><span className="font-semibold">{MOCK_BOOKING.farmerName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Return Reason</span><span className="font-semibold text-primary">Work completed</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Requested On</span><span className="font-semibold">Today, 10:30 AM</span></div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-success text-white font-bold text-sm hover:bg-success/90 transition-colors"><CheckCircle size={16} /> Accept Return</button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-danger text-white font-bold text-sm hover:bg-danger/90 transition-colors"><XCircle size={16} /> Dispute</button>
                  </div>
                  <button onClick={goNext} className="w-full btn-primary py-3">Proceed to OTP Verification →</button>
                </>
              )}
            </div>
          )}

          {/* STEP 2: OTP Handover */}
          {step === 'otp' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Shield size={20} className="text-primary" /></div>
                <div>
                  <h2 className="font-bold text-foreground">OTP Handover Verification</h2>
                  <p className="text-xs text-muted-foreground">{role === 'farmer' ? 'Share the OTP with the provider to confirm handover' : 'Enter the OTP shared by the farmer to confirm receipt'}</p>
                </div>
              </div>

              {role === 'farmer' ? (
                <>
                  {!otpSent ? (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"><Phone size={28} className="text-primary" /></div>
                      <p className="text-sm text-muted-foreground mb-4">An OTP will be sent to your registered mobile number to confirm equipment handover.</p>
                      <button onClick={handleSendOTP} className="btn-primary px-8 py-3">Send OTP to My Mobile</button>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                        <p className="text-xs text-muted-foreground mb-2">Your Handover OTP</p>
                        <p className="text-5xl font-extrabold text-primary tracking-widest font-tabular">{MOCK_OTP}</p>
                        <p className="text-xs text-muted-foreground mt-2">Share this with the equipment provider</p>
                      </div>
                      {otpTimer > 0 ? (
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Clock size={12} /> Resend in {otpTimer}s</p>
                      ) : (
                        <button onClick={handleSendOTP} className="text-xs text-primary font-semibold flex items-center gap-1 mx-auto"><RefreshCw size={12} /> Resend OTP</button>
                      )}
                      <button onClick={goNext} className="w-full btn-primary py-3">OTP Shared — Continue →</button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Ask the farmer for their handover OTP and enter it below to confirm you have received the equipment.</p>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Enter OTP from Farmer</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpValue}
                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter 4-digit OTP"
                        className="input-field text-center text-2xl font-bold tracking-widest font-tabular w-full"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Demo OTP: <span className="font-bold text-primary">{MOCK_OTP}</span></p>
                    </div>
                    {otpVerified && (
                      <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-xl p-3">
                        <CheckCircle size={16} className="text-success" />
                        <p className="text-sm font-semibold text-success">OTP Verified! Equipment handover confirmed.</p>
                      </div>
                    )}
                    {!otpVerified ? (
                      <button onClick={handleVerifyOTP} disabled={otpValue.length < 4} className="w-full btn-primary py-3 disabled:opacity-50">Verify OTP</button>
                    ) : (
                      <button onClick={goNext} className="w-full btn-primary py-3">Proceed to Inspection →</button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3: Inspection */}
          {step === 'inspection' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Eye size={20} className="text-primary" /></div>
                <div>
                  <h2 className="font-bold text-foreground">Equipment Inspection</h2>
                  <p className="text-xs text-muted-foreground">{role === 'provider' ? 'Inspect the returned equipment thoroughly' : 'Awaiting provider inspection'}</p>
                </div>
              </div>

              {role === 'farmer' ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4"><Clock size={28} className="text-warning" /></div>
                  <h3 className="font-bold text-foreground mb-2">Inspection in Progress</h3>
                  <p className="text-sm text-muted-foreground mb-4">The provider is inspecting the equipment. You will be notified once inspection is complete.</p>
                  <div className="bg-muted/40 rounded-xl p-4 text-sm space-y-2">
                    <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="text-warning font-semibold">Under Inspection</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Estimated Time</span><span className="font-semibold">30–60 minutes</span></div>
                  </div>
                  <button onClick={goNext} className="w-full btn-primary py-3 mt-4">View Inspection Result →</button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Overall Condition Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setConditionRating(s)} className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${conditionRating >= s ? 'border-accent bg-accent/10' : 'border-border'}`}>
                          <Star size={18} className={conditionRating >= s ? 'text-accent fill-accent' : 'text-muted-foreground'} />
                        </button>
                      ))}
                      <span className="text-sm font-semibold text-foreground ml-2">{conditionRating > 0 ? ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][conditionRating] : 'Not rated'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Upload Inspection Photos</label>
                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Camera size={28} className="text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Tap to upload photos</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB each</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Inspection Notes</label>
                    <textarea value={inspectionNotes} onChange={(e) => setInspectionNotes(e.target.value)} placeholder="Describe the equipment condition after return..." rows={3} className="input-field text-sm resize-none w-full" />
                  </div>
                  <button disabled={conditionRating === 0} onClick={goNext} className="w-full btn-primary py-3 disabled:opacity-50">Save Inspection & Continue →</button>
                </>
              )}
            </div>
          )}

          {/* STEP 4: Damage Assessment */}
          {step === 'damage' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center"><AlertTriangle size={20} className="text-danger" /></div>
                <div>
                  <h2 className="font-bold text-foreground">Damage Assessment</h2>
                  <p className="text-xs text-muted-foreground">{role === 'provider' ? 'Mark any damages found during inspection' : 'Review damage report from provider'}</p>
                </div>
              </div>

              <div className="space-y-2">
                {damages.map((d) => (
                  <div key={d.id} onClick={() => role === 'provider' && toggleDamage(d.id)} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${role === 'provider' ? 'cursor-pointer' : ''} ${d.checked ? 'border-danger/30 bg-danger/5' : 'border-border hover:border-border/80'}`}>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${d.checked ? 'bg-danger border-danger' : 'border-border'}`}>
                      {d.checked && <CheckCircle size={12} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{d.label}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${severityColor(d.severity)}`}>{d.severity}</span>
                    </div>
                    {d.checked && <span className="text-sm font-bold text-danger font-tabular shrink-0">−₹{d.cost.toLocaleString('en-IN')}</span>}
                  </div>
                ))}
              </div>

              {hasDamage && (
                <div className="bg-danger/5 border border-danger/20 rounded-xl p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Damage Deduction</span>
                    <span className="font-bold text-danger font-tabular">−₹{totalDamageCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Security Deposit</span>
                    <span className="font-semibold font-tabular">₹{MOCK_BOOKING.deposit.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold mt-2 pt-2 border-t border-danger/20">
                    <span className="text-foreground">Refund Amount</span>
                    <span className={`font-tabular ${refundAmount > 0 ? 'text-success' : 'text-danger'}`}>₹{refundAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {!hasDamage && (
                <div className="bg-success/5 border border-success/20 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-success" />
                  <p className="text-sm text-success font-semibold">No damage found — full deposit refundable</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={goBack} className="btn-secondary py-3 px-5"><ChevronLeft size={16} /></button>
                <button onClick={goNext} className="flex-1 btn-primary py-3">Proceed to Deposit Calculation →</button>
              </div>
            </div>
          )}

          {/* STEP 5: Deposit Calculation */}
          {step === 'deposit' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><IndianRupee size={20} className="text-success" /></div>
                <div>
                  <h2 className="font-bold text-foreground">Deposit Calculation</h2>
                  <p className="text-xs text-muted-foreground">Final breakdown of deposit and refund amount</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-muted/40 rounded-xl p-4 space-y-3 text-sm">
                  <p className="font-bold text-foreground text-base mb-1">Rental Summary</p>
                  <div className="flex justify-between"><span className="text-muted-foreground">Equipment</span><span className="font-semibold">{MOCK_BOOKING.equipmentName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Rental Period</span><span className="font-semibold">{MOCK_BOOKING.startDate} → {MOCK_BOOKING.endDate}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Rental Amount</span><span className="font-semibold font-tabular">₹{MOCK_BOOKING.rentalAmount.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Platform Fee</span><span className="font-semibold font-tabular">₹{MOCK_BOOKING.platformFee.toLocaleString('en-IN')}</span></div>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 space-y-3 text-sm">
                  <p className="font-bold text-foreground text-base mb-1">Deposit Breakdown</p>
                  <div className="flex justify-between"><span className="text-muted-foreground">Security Deposit Collected</span><span className="font-semibold font-tabular text-warning">₹{MOCK_BOOKING.deposit.toLocaleString('en-IN')}</span></div>
                  {damages.filter((d) => d.checked).map((d) => (
                    <div key={d.id} className="flex justify-between text-danger">
                      <span>{d.label}</span>
                      <span className="font-semibold font-tabular">−₹{d.cost.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  {!hasDamage && (
                    <div className="flex justify-between text-success">
                      <span>No damage deductions</span>
                      <span className="font-semibold">₹0</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-bold text-foreground">Refund to Farmer</span>
                    <span className={`font-bold text-xl font-tabular ${refundAmount > 0 ? 'text-success' : 'text-danger'}`}>₹{refundAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {role === 'provider' && hasDamage && (
                  <div className="bg-warning-bg border border-warning/20 rounded-xl p-3 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-warning shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">Damage deductions will be reviewed by KisanSetu support before final settlement. Farmer will be notified.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={goBack} className="btn-secondary py-3 px-5"><ChevronLeft size={16} /></button>
                <button onClick={goNext} className="flex-1 btn-primary py-3">Confirm & Process Refund →</button>
              </div>
            </div>
          )}

          {/* STEP 6: Refund */}
          {step === 'refund' && (
            <div className="space-y-5">
              {!refundProcessed ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><Truck size={20} className="text-success" /></div>
                    <div>
                      <h2 className="font-bold text-foreground">Process Refund</h2>
                      <p className="text-xs text-muted-foreground">Confirm refund details and initiate transfer</p>
                    </div>
                  </div>

                  <div className="bg-success/5 border border-success/20 rounded-2xl p-5 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Refund Amount</p>
                    <p className="text-4xl font-extrabold text-success font-tabular">₹{refundAmount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-muted-foreground mt-1">Will be credited within 3–5 business days</p>
                  </div>

                  <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Refund To</span><span className="font-semibold">{MOCK_BOOKING.farmerName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="font-semibold">Original Payment Method</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Timeline</span><span className="font-semibold">3–5 Business Days</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Booking ID</span><span className="font-semibold text-primary">#{MOCK_BOOKING.id}</span></div>
                  </div>

                  {role === 'farmer' && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-foreground">Rate Your Experience</p>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} className="w-10 h-10 rounded-xl border-2 border-border flex items-center justify-center hover:border-accent transition-colors">
                            <Star size={18} className="text-muted-foreground hover:text-accent" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button onClick={() => setRefundProcessed(true)} className="w-full btn-primary py-3 font-bold">
                    {role === 'farmer' ? 'Confirm Return Complete' : 'Initiate Refund Transfer'}
                  </button>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={40} className="text-success" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-foreground mb-2">Return Complete!</h2>
                  <p className="text-sm text-muted-foreground mb-5">
                    {role === 'farmer'
                      ? `Your deposit refund of ₹${refundAmount.toLocaleString('en-IN')} has been initiated and will be credited within 3–5 business days.`
                      : `Refund of ₹${refundAmount.toLocaleString('en-IN')} has been initiated to the farmer's account.`}
                  </p>
                  <div className="bg-muted/40 rounded-xl p-4 text-sm space-y-2 mb-6 text-left">
                    <div className="flex justify-between"><span className="text-muted-foreground">Return ID</span><span className="font-bold text-primary">RTN{Math.floor(Math.random() * 90000 + 10000)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Refund Amount</span><span className="font-bold text-success font-tabular">₹{refundAmount.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="text-success font-semibold">Processing</span></div>
                  </div>
                  <div className="flex gap-3">
                    <Link href="/account/bookings" className="flex-1 btn-secondary py-3 text-center">My Bookings</Link>
                    <Link href="/equipment-listing-page" className="flex-1 btn-primary py-3 text-center">Rent Again</Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
