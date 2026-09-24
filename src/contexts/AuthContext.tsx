'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '../lib/supabase/client';

const AuthContext = createContext<any>({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Email/Password Sign Up
  const signUp = async (email: string, password: string, metadata: Record<string, string> = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata?.fullName || '',
          avatar_url: metadata?.avatarUrl || '',
          phone: metadata?.phone || '',
          role: metadata?.role || 'buyer',
        },
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`
      }
    });
    if (error) throw error;
    return data;
  };

  // Email/Password Sign In
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  // Phone OTP — Step 1: Send OTP via Twilio (our custom API)
  const sendPhoneOtp = async (phone: string) => {
    const res = await fetch('/api/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
    return data;
  };

  // Phone OTP — Step 2: Verify OTP, then sign in/up via Supabase anonymous + link
  const verifyPhoneOtp = async (phone: string, otp: string, fullName?: string) => {
    // First verify OTP with our Twilio-backed API
    const res = await fetch('/api/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });
    const verifyData = await res.json();
    if (!res.ok) throw new Error(verifyData.error || 'Invalid OTP');

    // OTP verified — now sign in with Supabase using phone+OTP (Supabase phone auth)
    // We use a deterministic email derived from phone for Supabase Auth
    const normalizedPhone = phone.replace(/\D/g, '');
    const phoneEmail = `${normalizedPhone}@kisansetu.phone`;
    const phonePassword = `KS_${normalizedPhone}_2026!`;

    // Try sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: phoneEmail,
      password: phonePassword,
    });

    if (!signInError && signInData.user) {
      return signInData;
    }

    // User doesn't exist — create account
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: phoneEmail,
      password: phonePassword,
      options: {
        data: {
          full_name: fullName || `Farmer ${normalizedPhone.slice(-4)}`,
          phone: `+91${normalizedPhone}`,
          role: 'buyer',
        }
      }
    });

    if (signUpError) throw signUpError;

    // If email confirmation required, sign in immediately
    if (!signUpData.session) {
      const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
        email: phoneEmail,
        password: phonePassword,
      });
      if (retryError) throw retryError;
      return retrySignIn;
    }

    return signUpData;
  };

  // Sign Out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Get Current User
  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  };

  // Check if Email is Verified
  const isEmailVerified = () => {
    return user?.email_confirmed_at !== null;
  };

  // Get User Profile from Database
  const getUserProfile = async () => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (error) return null;
    return data;
  };

  // Update User Profile
  const updateUserProfile = async (updates: Record<string, unknown>) => {
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  // Enable provider mode
  const enableProviderMode = async (providerType: string, businessName?: string) => {
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        is_provider: true,
        provider_type: providerType,
        business_name: businessName || '',
      })
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    sendPhoneOtp,
    verifyPhoneOtp,
    signOut,
    getCurrentUser,
    isEmailVerified,
    getUserProfile,
    updateUserProfile,
    enableProviderMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
