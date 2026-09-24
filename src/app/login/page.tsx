'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { Mail, Lock, Eye, EyeOff, Loader2, Tractor, Wrench } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type Role = 'farmer' | 'provider';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('farmer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your email and password');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success(`Welcome back! Signed in as ${role === 'farmer' ? 'Farmer' : 'Provider'} 🌾`);
      setTimeout(() => router.push('/inbox'), 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid email or password';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Logo + heading */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <AppLogo className="h-10 mx-auto" />
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Sign in to KisanSetu
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Access your rental dashboard and notifications
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-7">

          {/* Role selector */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
              I am a
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${
                  role === 'farmer' ?'border-primary bg-primary/5 text-primary' :'border-border text-muted-foreground hover:border-primary/40 hover:bg-muted'
                }`}
              >
                <Tractor size={22} />
                <span className="text-sm font-semibold">Farmer</span>
                <span className="text-[11px] text-center leading-tight opacity-70">Rent equipment &amp; hire labour</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${
                  role === 'provider' ?'border-primary bg-primary/5 text-primary' :'border-border text-muted-foreground hover:border-primary/40 hover:bg-muted'
                }`}
              >
                <Wrench size={22} />
                <span className="text-sm font-semibold">Provider</span>
                <span className="text-[11px] text-center leading-tight opacity-70">List &amp; manage your equipment</span>
              </button>
            </div>
          </div>

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-field pl-9 text-sm w-full"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <Link
                  href="/sign-up-login-screen"
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-9 pr-10 text-sm w-full"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Signing in...</>
              ) : (
                `Sign in as ${role === 'farmer' ? 'Farmer' : 'Provider'}`
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Sign-up link */}
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/sign-up-login-screen"
              className="text-primary font-semibold hover:underline"
            >
              Create one free
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            ← Back to KisanSetu home
          </Link>
        </p>
      </div>
    </div>
  );
}
