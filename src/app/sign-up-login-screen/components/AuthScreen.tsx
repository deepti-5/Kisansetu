'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import AppLogo from '@/components/ui/AppLogo';
import AppImage from '@/components/ui/AppImage';
import { Eye, EyeOff, Phone, Mail, Lock, User, MapPin, Loader2, CheckCircle, RefreshCw, Copy, ChevronDown, ArrowLeft, Shield } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'login' | 'signup';
type LoginMethod = 'phone' | 'email';

interface LoginFormData { phone?: string; email?: string; password?: string; }
interface SignupFormData { fullName: string; phone: string; email: string; password: string; confirmPassword: string; role: string; state: string; }

const ROLES = [
  { id: 'farmer', label: '🌾 Farmer', desc: 'Buy/Rent equipment, hire labour, buy supplies' },
  { id: 'supplier', label: '🚜 Equipment Owner', desc: 'List equipment for rent/sale, manage bookings' },
  { id: 'labour', label: '👨‍🌾 Labour Provider', desc: 'Find farm work, manage your schedule' },
];

const DEMO_ACCOUNTS = [
  { role: 'Farmer', email: 'raju.shinde@kisansetu.in', password: 'Kisan@2026', color: 'bg-secondary border-primary/30' },
  { role: 'Supplier', email: 'rajesh.patil@kisansetu.in', password: 'Supplier@2026', color: 'bg-warning-bg border-warning/30' },
  { role: 'Labour', email: 'ramesh.yadav@kisansetu.in', password: 'Labour@2026', color: 'bg-info-bg border-info/30' },
  { role: 'Admin', email: 'admin@kisansetu.in', password: 'Admin@2026!', color: 'bg-danger-bg border-danger/30' },
];

const INDIAN_STATES = ['Maharashtra', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'Uttar Pradesh', 'Punjab', 'Haryana', 'Bihar', 'West Bengal', 'Odisha', 'Kerala'];

export default function AuthScreen() {
  const [tab, setTab] = useState<Tab>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [selectedRole, setSelectedRole] = useState('farmer');

  // Login OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Signup OTP state
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [signupOtpVerified, setSignupOtpVerified] = useState(false);
  const [signupOtpDigits, setSignupOtpDigits] = useState(['', '', '', '', '', '']);
  const [signupOtpTimer, setSignupOtpTimer] = useState(0);
  const [signupOtpError, setSignupOtpError] = useState('');
  const [loadingSignupOtp, setLoadingSignupOtp] = useState(false);

  const loginForm = useForm<LoginFormData>();
  const signupForm = useForm<SignupFormData>({ defaultValues: { role: 'farmer' } });

  function startTimer(setter: React.Dispatch<React.SetStateAction<number>>) {
    setter(60);
    const interval = setInterval(() => {
      setter((t) => { if (t <= 1) { clearInterval(interval); return 0; } return t - 1; });
    }, 1000);
  }

  // ── Send OTP (Login) ──────────────────────────────────────────────────────
  async function handleSendOtp() {
    const phone = loginForm.getValues('phone');
    if (!phone || !/^\d{10}$/.test(phone)) {
      loginForm.setError('phone', { message: 'Enter a valid 10-digit mobile number' });
      return;
    }
    setLoadingOtp(true);
    setOtpError('');
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to send OTP');
        setOtpError(data.error || 'Failed to send OTP');
      } else {
        setOtpSent(true);
        setOtpDigits(['', '', '', '', '', '']);
        startTimer(setOtpTimer);
        toast.success(`OTP sent to +91 ${phone}`);
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoadingOtp(false);
    }
  }

  // ── Verify OTP digit input (Login) ────────────────────────────────────────
  async function handleOtpInput(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value;
    setOtpDigits(next);
    setOtpError('');

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    // Auto-verify when all 6 digits entered
    if (next.every((d) => d !== '')) {
      const enteredOtp = next.join('');
      await verifyLoginOtp(enteredOtp);
    }
  }

  async function verifyLoginOtp(enteredOtp: string) {
    const phone = loginForm.getValues('phone') || '';
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: enteredOtp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpVerified(true);
        setOtpError('');
        toast.success('OTP verified successfully!');
      } else {
        setOtpError(data.error || 'Incorrect OTP');
        // Clear digits on wrong OTP
        setOtpDigits(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
        if (data.error?.includes('Too many') || data.error?.includes('expired')) {
          setOtpSent(false);
          setOtpDigits(['', '', '', '', '', '']);
        }
      }
    } catch {
      setOtpError('Verification failed. Please try again.');
    }
  }

  // ── Send OTP (Signup) ─────────────────────────────────────────────────────
  async function handleSendSignupOtp() {
    const phone = signupForm.getValues('phone');
    if (!phone || !/^\d{10}$/.test(phone)) {
      signupForm.setError('phone', { message: 'Enter a valid 10-digit mobile number' });
      return;
    }
    setLoadingSignupOtp(true);
    setSignupOtpError('');
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to send OTP');
        setSignupOtpError(data.error || 'Failed to send OTP');
      } else {
        setSignupOtpSent(true);
        setSignupOtpDigits(['', '', '', '', '', '']);
        startTimer(setSignupOtpTimer);
        toast.success(`OTP sent to +91 ${phone}`);
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setLoadingSignupOtp(false);
    }
  }

  // ── Verify OTP digit input (Signup) ───────────────────────────────────────
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
      const enteredOtp = next.join('');
      await verifySignupOtp(enteredOtp);
    }
  }

  async function verifySignupOtp(enteredOtp: string) {
    const phone = signupForm.getValues('phone') || '';
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: enteredOtp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSignupOtpVerified(true);
        setSignupOtpError('');
        toast.success('Phone verified!');
      } else {
        setSignupOtpError(data.error || 'Incorrect OTP');
        setSignupOtpDigits(['', '', '', '', '', '']);
        document.getElementById('sotp-0')?.focus();
        if (data.error?.includes('Too many') || data.error?.includes('expired')) {
          setSignupOtpSent(false);
          setSignupOtpDigits(['', '', '', '', '', '']);
        }
      }
    } catch {
      setSignupOtpError('Verification failed. Please try again.');
    }
  }

  function handleLoginSubmit(data: LoginFormData) {
    if (loginMethod === 'phone' && !otpVerified) { toast.error('Please verify OTP first'); return; }
    setLoadingSubmit(true);
    setTimeout(() => {
      setLoadingSubmit(false);
      if (loginMethod === 'email') {
        const demoMatch = DEMO_ACCOUNTS.find((acc) => acc.email === data.email && acc.password === data.password);
        const stored = localStorage.getItem('kisansetu_users');
        const users: SignupFormData[] = stored ? JSON.parse(stored) : [];
        const localMatch = users.find((u) => u.email === data.email && u.password === data.password);
        if (!demoMatch && !localMatch) { toast.error('Invalid email or password.'); setLoadingSubmit(false); return; }
        const user = localMatch || { fullName: demoMatch!.role, email: demoMatch!.email, role: demoMatch!.role.toLowerCase(), phone: '', state: '' };
        localStorage.setItem('kisansetu_current_user', JSON.stringify(user));
      } else {
        localStorage.setItem('kisansetu_current_user', JSON.stringify({ phone: data.phone, role: 'farmer' }));
      }
      toast.success('Login successful! Redirecting...');
      setTimeout(() => { window.location.href = '/'; }, 1000);
    }, 800);
  }

  function handleSignupSubmit(data: SignupFormData) {
    if (!signupOtpVerified) { toast.error('Please verify your phone number first'); return; }
    if (data.password !== data.confirmPassword) { signupForm.setError('confirmPassword', { message: 'Passwords do not match' }); return; }
    setLoadingSubmit(true);
    setTimeout(() => {
      setLoadingSubmit(false);
      const stored = localStorage.getItem('kisansetu_users');
      const users: SignupFormData[] = stored ? JSON.parse(stored) : [];
      const exists = users.find((u) => u.email === data.email);
      if (exists) { toast.error('An account with this email already exists.'); setLoadingSubmit(false); return; }
      const newUser = { ...data, role: selectedRole, createdAt: new Date().toISOString() };
      users.push(newUser);
      localStorage.setItem('kisansetu_users', JSON.stringify(users));
      localStorage.setItem('kisansetu_current_user', JSON.stringify(newUser));
      toast.success('Account created! Welcome to KisanSetu 🌾');
      setTimeout(() => { window.location.href = '/'; }, 1200);
    }, 1200);
  }

  function autofillDemo(email: string, password: string) {
    setLoginMethod('email'); loginForm.setValue('email', email); loginForm.setValue('password', password);
    toast.success('Demo credentials filled — click Login');
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied!`));
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card px-4 lg:px-8 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <AppLogo size={32} />
            <span className="font-extrabold text-lg text-primary">KisanSetu</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={15} />Back to Home
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-stretch">
        <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative overflow-hidden gradient-hero flex-col justify-between p-12">
          <div className="absolute inset-0 opacity-15">
            <AppImage src="https://img.rocket.new/generatedImages/rocket_gen_img_1ae1933df-1781417520026.png" alt="Vast green agricultural farmland with crops under blue sky in India" fill className="object-cover" priority />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <AppLogo size={48} />
              <div>
                <span className="font-extrabold text-2xl text-white">KisanSetu</span>
                <p className="text-white/70 text-sm">Smart Farming Platform</p>
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">Find Equipment.<br />Hire Labour.<br /><span className="text-accent">Get Agri Supplies.</span></h2>
            <p className="text-white/75 text-base leading-relaxed mb-8">India&apos;s most trusted agricultural marketplace. Connecting farmers with equipment, skilled workers, and quality supplies — all near you.</p>
            <div className="grid grid-cols-2 gap-3">
              {[{ label: 'Equipment', value: '2,345+', emoji: '🚜' }, { label: 'Workers', value: '3,210+', emoji: '👨‍🌾' }, { label: 'Products', value: '1,845+', emoji: '🌱' }, { label: 'Farmers', value: '12,540+', emoji: '😊' }].map((s) => (
                <div key={`auth-stat-${s.label}`} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-3">
                  <div className="text-xl mb-0.5">{s.emoji}</div>
                  <div className="text-xl font-bold text-white font-tabular">{s.value}</div>
                  <div className="text-xs text-white/65">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <Shield size={14} />SSL Secured · Razorpay Verified · Twilio OTP
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="flex bg-muted rounded-xl p-1 mb-6">
              <button onClick={() => setTab('login')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === 'login' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Login</button>
              <button onClick={() => setTab('signup')} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${tab === 'signup' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Sign Up</button>
            </div>

            {tab === 'login' && (
              <div className="slide-up">
                <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
                <p className="text-sm text-muted-foreground mb-6">Sign in to your KisanSetu account</p>
                <div className="flex bg-muted rounded-lg p-1 mb-5">
                  <button onClick={() => setLoginMethod('phone')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${loginMethod === 'phone' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}><Phone size={13} /> Phone + OTP</button>
                  <button onClick={() => setLoginMethod('email')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${loginMethod === 'email' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}><Mail size={13} /> Email + Password</button>
                </div>

                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                  {loginMethod === 'phone' ? (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-1.5">Mobile Number</label>
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-input bg-muted text-sm font-medium text-foreground shrink-0">🇮🇳 +91</div>
                          <input type="tel" maxLength={10} placeholder="98765 43210" className="input-field flex-1" {...loginForm.register('phone', { required: 'Mobile number is required', pattern: { value: /^\d{10}$/, message: 'Enter a valid 10-digit number' } })} />
                        </div>
                        {loginForm.formState.errors.phone && <p className="text-danger text-xs mt-1">{loginForm.formState.errors.phone.message}</p>}
                      </div>
                      {!otpSent ? (
                        <button type="button" onClick={handleSendOtp} disabled={loadingOtp} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                          {loadingOtp ? <><Loader2 size={16} className="animate-spin" /> Sending OTP...</> : 'Send OTP via SMS'}
                        </button>
                      ) : (
                        <div>
                          <label className="block text-sm font-semibold text-foreground mb-1.5">
                            Enter 6-digit OTP {otpVerified && <CheckCircle size={14} className="inline ml-2 text-success" />}
                          </label>
                          <p className="text-xs text-muted-foreground mb-2">OTP sent to +91 {loginForm.getValues('phone')} via SMS</p>
                          <div className="flex gap-2 mb-2">
                            {otpDigits.map((digit, i) => (
                              <input
                                key={`otp-box-${i}`}
                                id={`otp-${i}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpInput(i, e.target.value)}
                                className={`w-full h-12 text-center text-lg font-bold rounded-lg border transition-all duration-150 outline-none ${
                                  otpVerified
                                    ? 'border-success bg-success-bg text-success'
                                    : otpError
                                    ? 'border-danger bg-danger-bg' :'border-input bg-white focus:border-primary focus:ring-2 focus:ring-ring'
                                }`}
                              />
                            ))}
                          </div>
                          {otpError && <p className="text-danger text-xs mb-2">{otpError}</p>}
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                            <span>OTP expires in 10 minutes</span>
                            {otpTimer > 0 ? (
                              <span>Resend in {otpTimer}s</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => { setOtpDigits(['', '', '', '', '', '']); setOtpError(''); handleSendOtp(); }}
                                className="flex items-center gap-1 text-primary font-semibold"
                              >
                                <RefreshCw size={11} /> Resend OTP
                              </button>
                            )}
                          </div>
                          <button type="submit" disabled={!otpVerified || loadingSubmit} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                            {loadingSubmit ? <><Loader2 size={16} className="animate-spin" /> Logging in...</> : 'Login'}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="email" placeholder="raju@example.com" className="input-field pl-9" {...loginForm.register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} />
                        </div>
                        {loginForm.formState.errors.email && <p className="text-danger text-xs mt-1">{loginForm.formState.errors.email.message}</p>}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm font-semibold text-foreground">Password</label>
                          <Link href="/forgot-password" className="text-xs text-primary font-medium hover:underline">Forgot Password?</Link>
                        </div>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type={showPass ? 'text' : 'password'} placeholder="Enter your password" className="input-field pl-9 pr-10" {...loginForm.register('password', { required: 'Password is required' })} />
                          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        </div>
                        {loginForm.formState.errors.password && <p className="text-danger text-xs mt-1">{loginForm.formState.errors.password.message}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="remember" className="w-4 h-4 rounded accent-primary" />
                        <label htmlFor="remember" className="text-sm text-muted-foreground">Remember me for 30 days</label>
                      </div>
                      <button type="submit" disabled={loadingSubmit} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                        {loadingSubmit ? <><Loader2 size={16} className="animate-spin" /> Logging in...</> : 'Login'}
                      </button>
                    </>
                  )}
                </form>
                <p className="text-center text-sm text-muted-foreground mt-4">Don&apos;t have an account? <button onClick={() => setTab('signup')} className="text-primary font-semibold hover:underline">Sign Up Free</button></p>
              </div>
            )}

            {tab === 'signup' && (
              <div className="slide-up">
                <h1 className="text-2xl font-bold text-foreground mb-1">Create Account</h1>
                <p className="text-sm text-muted-foreground mb-5">Join 12,540+ farmers on KisanSetu</p>
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-foreground mb-2">I am a...</label>
                  <div className="space-y-2">
                    {ROLES.map((role) => (
                      <button key={`role-${role.id}`} type="button" onClick={() => setSelectedRole(role.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-150 ${selectedRole === role.id ? 'border-primary bg-secondary' : 'border-border bg-card hover:border-primary/40 hover:bg-muted/50'}`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedRole === role.id ? 'border-primary' : 'border-muted-foreground'}`}>
                          {selectedRole === role.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <div><p className="text-sm font-semibold text-foreground">{role.label}</p><p className="text-xs text-muted-foreground">{role.desc}</p></div>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="text" placeholder="Raju Shinde" className="input-field pl-9" {...signupForm.register('fullName', { required: 'Full name is required', minLength: { value: 3, message: 'Name must be at least 3 characters' } })} />
                    </div>
                    {signupForm.formState.errors.fullName && <p className="text-danger text-xs mt-1">{signupForm.formState.errors.fullName.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Mobile Number</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-input bg-muted text-sm font-medium shrink-0">🇮🇳 +91</div>
                      <input type="tel" maxLength={10} placeholder="98765 43210" className="input-field flex-1" {...signupForm.register('phone', { required: 'Mobile number is required', pattern: { value: /^\d{10}$/, message: 'Enter 10-digit number' } })} />
                      <button
                        type="button"
                        onClick={handleSendSignupOtp}
                        disabled={loadingSignupOtp || signupOtpVerified}
                        className={`px-3 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all btn-press ${signupOtpVerified ? 'bg-success-bg text-success border border-success' : 'gradient-green text-white hover:opacity-90'}`}
                      >
                        {signupOtpVerified ? <CheckCircle size={14} /> : loadingSignupOtp ? <Loader2 size={14} className="animate-spin" /> : 'Send OTP'}
                      </button>
                    </div>
                    {signupForm.formState.errors.phone && <p className="text-danger text-xs mt-1">{signupForm.formState.errors.phone.message}</p>}
                  </div>

                  {signupOtpSent && !signupOtpVerified && (
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Enter 6-digit OTP</label>
                      <p className="text-xs text-muted-foreground mb-2">OTP sent to +91 {signupForm.getValues('phone')} via SMS</p>
                      <div className="flex gap-2 mb-1.5">
                        {signupOtpDigits.map((digit, i) => (
                          <input
                            key={`sotp-box-${i}`}
                            id={`sotp-${i}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleSignupOtpInput(i, e.target.value)}
                            className={`w-full h-11 text-center text-lg font-bold rounded-lg border outline-none transition-all ${
                              signupOtpError
                                ? 'border-danger bg-danger-bg' :'border-input bg-white focus:border-primary focus:ring-2 focus:ring-ring'
                            }`}
                          />
                        ))}
                      </div>
                      {signupOtpError && <p className="text-danger text-xs mb-1">{signupOtpError}</p>}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>OTP expires in 10 minutes</span>
                        {signupOtpTimer > 0 ? (
                          <span>Resend in {signupOtpTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setSignupOtpDigits(['', '', '', '', '', '']); setSignupOtpError(''); handleSendSignupOtp(); }}
                            className="text-primary font-semibold flex items-center gap-1"
                          >
                            <RefreshCw size={11} /> Resend
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type="email" placeholder="raju@gmail.com" className="input-field pl-9" {...signupForm.register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} />
                    </div>
                    {signupForm.formState.errors.email && <p className="text-danger text-xs mt-1">{signupForm.formState.errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type={showPass ? 'text' : 'password'} placeholder="Min 8 chars, 1 uppercase, 1 number" className="input-field pl-9 pr-10" {...signupForm.register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' }, pattern: { value: /^(?=.*[A-Z])(?=.*\d)/, message: 'Must have 1 uppercase and 1 number' } })} />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                    {signupForm.formState.errors.password && <p className="text-danger text-xs mt-1">{signupForm.formState.errors.password.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input type={showConfirmPass ? 'text' : 'password'} placeholder="Re-enter your password" className="input-field pl-9 pr-10" {...signupForm.register('confirmPassword', { required: 'Please confirm your password' })} />
                      <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">{showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                    {signupForm.formState.errors.confirmPassword && <p className="text-danger text-xs mt-1">{signupForm.formState.errors.confirmPassword.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">State</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <select className="input-field pl-9 pr-8 appearance-none" {...signupForm.register('state', { required: 'Please select your state' })}>
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((s) => <option key={`state-${s}`} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                    {signupForm.formState.errors.state && <p className="text-danger text-xs mt-1">{signupForm.formState.errors.state.message}</p>}
                  </div>

                  <div className="flex items-start gap-2">
                    <input type="checkbox" id="terms" required className="mt-0.5 w-4 h-4 rounded accent-primary" />
                    <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                      I agree to KisanSetu&apos;s <Link href="/policies" className="text-primary font-medium hover:underline">Terms of Use</Link> and <Link href="/policies" className="text-primary font-medium hover:underline">Privacy Policy</Link>
                    </label>
                  </div>

                  <button type="submit" disabled={loadingSubmit || !signupOtpVerified} className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-60">
                    {loadingSubmit ? <><Loader2 size={16} className="animate-spin" /> Creating Account...</> : 'Create Account'}
                  </button>
                  {!signupOtpVerified && (
                    <p className="text-xs text-muted-foreground text-center">Verify your phone number to create account</p>
                  )}
                </form>
                <p className="text-center text-sm text-muted-foreground mt-4">Already have an account? <button onClick={() => setTab('login')} className="text-primary font-semibold hover:underline">Login</button></p>
              </div>
            )}

            <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={14} className="text-primary" />
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">Demo Accounts</p>
                <span className="badge-amber text-xs ml-auto">EMAIL LOGIN</span>
              </div>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <div key={`demo-${acc.role}`} className={`flex items-center gap-2 p-2.5 rounded-lg border ${acc.color}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground">{acc.role}</p>
                      <p className="text-xs text-muted-foreground font-tabular truncate">{acc.email}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => copyToClipboard(acc.email, 'Email')} className="p-1.5 rounded hover:bg-white/60 transition-colors" title="Copy email"><Copy size={11} className="text-muted-foreground" /></button>
                      <button onClick={() => autofillDemo(acc.email, acc.password)} className="px-2.5 py-1 rounded-md gradient-green text-white text-xs font-semibold hover:opacity-90 transition-opacity">Use</button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">Phone OTP login sends a real SMS via Twilio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
