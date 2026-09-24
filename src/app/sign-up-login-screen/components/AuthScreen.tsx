'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Phone, Mail, Lock, User, MapPin, Loader2, CheckCircle, RefreshCw, ChevronDown, ArrowLeft, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';

type Tab = 'login' | 'signup';
type LoginMethod = 'phone' | 'email';

interface LoginFormData { phone?: string; email?: string; password?: string; }
interface SignupFormData { fullName: string; phone: string; email: string; password: string; confirmPassword: string; state: string; }

const INDIAN_STATES = [
  'Maharashtra', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu',
  'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh', 'Punjab',
  'Haryana', 'Bihar', 'West Bengal', 'Odisha', 'Kerala', 'Assam',
  'Jharkhand', 'Chhattisgarh', 'Uttarakhand', 'Himachal Pradesh'
];

export default function AuthScreen() {
  const { sendPhoneOtp, verifyPhoneOtp, signIn, signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('returnTo') || '/';

  const [tab, setTab] = useState<Tab>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Login state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Signup state
  const [signupFullName, setSignupFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupState, setSignupState] = useState('');
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupOtpVerified, setSignupOtpVerified] = useState(false);
  const [signupOtpDigits, setSignupOtpDigits] = useState(['', '', '', '', '', '']);
  const [signupOtpTimer, setSignupOtpTimer] = useState(0);
  const [signupOtpError, setSignupOtpError] = useState('');
  const [loadingSignupOtp, setLoadingSignupOtp] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startTimer(setter: React.Dispatch<React.SetStateAction<number>>) {
    setter(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setter((t) => {
        if (t <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  function redirectAfterAuth() {
    toast.success('Welcome to KisanSetu! 🌾');
    setTimeout(() => {
      if (returnTo && returnTo !== '/') {
        router.push(returnTo);
      } else {
        router.push('/buyer/workspace');
      }
    }, 800);
  }

  // ── Send OTP (Login) ──────────────────────────────────────────────────────
  async function handleSendOtp() {
    if (!loginPhone || !/^\d{10}$/.test(loginPhone.replace(/\s/g, ''))) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    setLoadingOtp(true);
    setOtpError('');
    try {
      await sendPhoneOtp(loginPhone);
      setOtpSent(true);
      setOtpDigits(['', '', '', '', '', '']);
      startTimer(setOtpTimer);
      toast.success(`OTP sent to +91 ${loginPhone}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP';
      toast.error(msg);
      setOtpError(msg);
    } finally {
      setLoadingOtp(false);
    }
  }

  // ── OTP digit input (Login) ───────────────────────────────────────────────
  async function handleOtpInput(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    setOtpError('');
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    if (next.every((d) => d !== '')) {
      await verifyLoginOtp(next.join(''));
    }
  }

  async function verifyLoginOtp(enteredOtp: string) {
    setLoadingSubmit(true);
    try {
      await verifyPhoneOtp(loginPhone, enteredOtp);
      setOtpVerified(true);
      setOtpError('');
      redirectAfterAuth();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Incorrect OTP';
      setOtpError(msg);
      setOtpDigits(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setLoadingSubmit(false);
    }
  }

  // ── Email login ───────────────────────────────────────────────────────────
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { toast.error('Enter email and password'); return; }
    setLoadingSubmit(true);
    try {
      await signIn(loginEmail, loginPassword);
      redirectAfterAuth();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password';
      toast.error(msg);
    } finally {
      setLoadingSubmit(false);
    }
  }

  // ── Send OTP (Signup) ─────────────────────────────────────────────────────
  async function handleSendSignupOtp() {
    if (!signupPhone || !/^\d{10}$/.test(signupPhone.replace(/\s/g, ''))) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    setLoadingSignupOtp(true);
    setSignupOtpError('');
    try {
      await sendPhoneOtp(signupPhone);
      setSignupOtpSent(true);
      setSignupOtpDigits(['', '', '', '', '', '']);
      startTimer(setSignupOtpTimer);
      toast.success(`OTP sent to +91 ${signupPhone}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP';
      toast.error(msg);
      setSignupOtpError(msg);
    } finally {
      setLoadingSignupOtp(false);
    }
  }

  // ── OTP digit input (Signup) ──────────────────────────────────────────────
  async function handleSignupOtpInput(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...signupOtpDigits];
    next[index] = value;
    setSignupOtpDigits(next);
    setSignupOtpError('');
    if (value && index < 5) {
      document.getElementById(`sotp-${index + 1}`)?.focus();
    }
    if (next.every((d) => d !== '')) {
      await verifySignupOtp(next.join(''));
    }
  }

  async function verifySignupOtp(enteredOtp: string) {
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: signupPhone, otp: enteredOtp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSignupOtpVerified(true);
        setSignupOtpError('');
        toast.success('Phone verified! ✅');
      } else {
        setSignupOtpError(data.error || 'Incorrect OTP');
        setSignupOtpDigits(['', '', '', '', '', '']);
        document.getElementById('sotp-0')?.focus();
      }
    } catch {
      setSignupOtpError('Verification failed. Please try again.');
    }
  }

  // ── Signup submit ─────────────────────────────────────────────────────────
  async function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signupFullName.trim()) { toast.error('Enter your full name'); return; }
    if (!signupOtpVerified) { toast.error('Please verify your phone number first'); return; }
    if (signupEmail && signupPassword) {
      if (signupPassword !== signupConfirmPassword) { toast.error('Passwords do not match'); return; }
      if (signupPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    }
    setLoadingSubmit(true);
    try {
      if (signupEmail && signupPassword) {
        // Email + phone signup
        await signUp(signupEmail, signupPassword, {
          fullName: signupFullName,
          phone: `+91${signupPhone}`,
          role: 'buyer',
        });
        toast.success('Account created! Signing you in...');
        await signIn(signupEmail, signupPassword);
      } else {
        // Phone-only signup via OTP flow
        await verifyPhoneOtp(signupPhone, signupOtpDigits.join(''), signupFullName);
      }
      redirectAfterAuth();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Signup failed';
      toast.error(msg);
    } finally {
      setLoadingSubmit(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <AppLogo className="h-10 mx-auto mb-3" />
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground">
            {tab === 'login' ? 'Welcome Back' : 'Join KisanSetu'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tab === 'login' ? 'Login to your KisanSetu account' : 'Create your free farmer account'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-muted rounded-xl p-1 mb-6">
          {(['login', 'signup'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === t ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t === 'login' ? 'Login' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* ── LOGIN ── */}
        {tab === 'login' && (
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            {/* Method toggle */}
            <div className="flex gap-2 mb-5">
              {(['phone', 'email'] as LoginMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => { setLoginMethod(m); setOtpSent(false); setOtpVerified(false); setOtpError(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    loginMethod === m
                      ? 'border-primary bg-primary/5 text-primary' :'border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {m === 'phone' ? <><Phone size={15} /> Mobile OTP</> : <><Mail size={15} /> Email</>}
                </button>
              ))}
            </div>

            {loginMethod === 'phone' ? (
              <div className="space-y-4">
                {/* Phone input */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Mobile Number</label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 bg-muted rounded-xl border border-border text-sm font-semibold text-muted-foreground shrink-0">
                      🇮🇳 +91
                    </div>
                    <input
                      type="tel"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit mobile number"
                      className="input-field flex-1 text-sm"
                      disabled={otpSent && !otpVerified}
                    />
                  </div>
                </div>

                {!otpSent ? (
                  <button
                    onClick={handleSendOtp}
                    disabled={loadingOtp || loginPhone.length !== 10}
                    className="w-full btn-primary py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingOtp ? <><Loader2 size={16} className="animate-spin" /> Sending OTP...</> : 'Send OTP'}
                  </button>
                ) : !otpVerified ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-foreground">Enter OTP</label>
                      <span className="text-xs text-muted-foreground">
                        Sent to +91 {loginPhone}
                      </span>
                    </div>
                    <div className="flex gap-2 justify-center">
                      {otpDigits.map((d, i) => (
                        <input
                          key={i}
                          id={`otp-${i}`}
                          type="tel"
                          inputMode="numeric"
                          maxLength={1}
                          value={d}
                          onChange={(e) => handleOtpInput(i, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !d && i > 0) {
                              document.getElementById(`otp-${i - 1}`)?.focus();
                            }
                          }}
                          className="w-11 h-12 text-center text-lg font-bold border-2 rounded-xl focus:border-primary focus:outline-none transition-colors bg-background"
                        />
                      ))}
                    </div>
                    {otpError && <p className="text-xs text-danger text-center">{otpError}</p>}
                    {loadingSubmit && (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 size={14} className="animate-spin" /> Verifying...
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <button
                        onClick={() => { setOtpSent(false); setOtpDigits(['', '', '', '', '', '']); setOtpError(''); }}
                        className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <ArrowLeft size={12} /> Change number
                      </button>
                      {otpTimer > 0 ? (
                        <span className="text-muted-foreground">Resend in {otpTimer}s</span>
                      ) : (
                        <button onClick={handleSendOtp} className="text-primary font-semibold flex items-center gap-1">
                          <RefreshCw size={12} /> Resend OTP
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-success text-sm font-semibold">
                    <CheckCircle size={16} /> Phone verified! Redirecting...
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="input-field pl-9 text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="input-field pl-9 pr-10 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loadingSubmit}
                  className="w-full btn-primary py-3 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingSubmit ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Login'}
                </button>
              </form>
            )}

            <p className="text-center text-xs text-muted-foreground mt-4">
              Don&apos;t have an account?{' '}
              <button onClick={() => setTab('signup')} className="text-primary font-semibold hover:underline">
                Sign Up
              </button>
            </p>
          </div>
        )}

        {/* ── SIGNUP ── */}
        {tab === 'signup' && (
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    placeholder="Your full name"
                    className="input-field pl-9 text-sm"
                    required
                  />
                </div>
              </div>

              {/* Phone + OTP */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Mobile Number *</label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-muted rounded-xl border border-border text-sm font-semibold text-muted-foreground shrink-0">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="input-field flex-1 text-sm"
                    disabled={signupOtpSent}
                  />
                  {!signupOtpVerified && (
                    <button
                      type="button"
                      onClick={handleSendSignupOtp}
                      disabled={loadingSignupOtp || signupPhone.length !== 10 || signupOtpSent}
                      className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold disabled:opacity-50 shrink-0 flex items-center gap-1"
                    >
                      {loadingSignupOtp ? <Loader2 size={12} className="animate-spin" /> : signupOtpSent ? 'Sent' : 'Send OTP'}
                    </button>
                  )}
                  {signupOtpVerified && (
                    <div className="flex items-center px-3 text-success shrink-0">
                      <CheckCircle size={18} />
                    </div>
                  )}
                </div>
              </div>

              {/* OTP input for signup */}
              {signupOtpSent && !signupOtpVerified && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Enter OTP</label>
                  <div className="flex gap-2 justify-center">
                    {signupOtpDigits.map((d, i) => (
                      <input
                        key={i}
                        id={`sotp-${i}`}
                        type="tel"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleSignupOtpInput(i, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !d && i > 0) {
                            document.getElementById(`sotp-${i - 1}`)?.focus();
                          }
                        }}
                        className="w-11 h-12 text-center text-lg font-bold border-2 rounded-xl focus:border-primary focus:outline-none transition-colors bg-background"
                      />
                    ))}
                  </div>
                  {signupOtpError && <p className="text-xs text-danger text-center">{signupOtpError}</p>}
                  <div className="flex justify-end text-xs">
                    {signupOtpTimer > 0 ? (
                      <span className="text-muted-foreground">Resend in {signupOtpTimer}s</span>
                    ) : (
                      <button type="button" onClick={handleSendSignupOtp} className="text-primary font-semibold flex items-center gap-1">
                        <RefreshCw size={12} /> Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Optional email */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Email Address <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-field pl-9 text-sm"
                  />
                </div>
              </div>

              {/* Password (only if email provided) */}
              {signupEmail && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="input-field pl-9 pr-10 text-sm"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="input-field pl-9 pr-10 text-sm"
                      />
                      <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* State */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  State <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <select
                    value={signupState}
                    onChange={(e) => setSignupState(e.target.value)}
                    className="input-field pl-9 text-sm appearance-none"
                  >
                    <option value="">Select your state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingSubmit || !signupOtpVerified || !signupFullName.trim()}
                className="w-full btn-primary py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingSubmit ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : 'Create Account'}
              </button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl p-3">
                <Shield size={14} className="text-success shrink-0" />
                <span>Your data is secure. We never share your information without consent.</span>
              </div>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Already have an account?{' '}
              <button onClick={() => setTab('login')} className="text-primary font-semibold hover:underline">
                Login
              </button>
            </p>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our{' '}
          <Link href="/policies" className="text-primary hover:underline">Terms & Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
