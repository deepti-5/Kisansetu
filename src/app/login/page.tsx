'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { Mail, Lock, Eye, EyeOff, Loader2, Tractor, Wrench } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const data = await signIn(email, password);
      // Determine role from user metadata or user_profiles (loaded by signIn)
      const role = data?.user?.user_metadata?.role || 'buyer';
      toast.success(`Welcome back! 🌾`);
      const isSupplierRole = role === 'supplier' || role === 'provider';
      setTimeout(() => router.push(isSupplierRole ? '/supplier/hub' : '/unified-inbox'), 600);
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

          {/* Role info */}
          <div className="mb-5 flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-background border border-border rounded-lg px-2.5 py-1.5">
                <Tractor size={13} /> Farmer
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-background border border-border rounded-lg px-2.5 py-1.5">
                <Wrench size={13} /> Supplier
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-tight">
              Sign in — you&apos;ll be directed to your dashboard automatically
            </p>
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
                'Sign In'
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
              href="/signup"
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
