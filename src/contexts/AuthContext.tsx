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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const supabase = createClient();

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (!error && data) {
        setUserProfile(data);
        setUserRole(data.role || 'buyer');
      }
    } catch {
      // silently fail — profile may not exist yet
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setUserRole(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Email/Password Sign Up
  const signUp = async (email: string, password: string, metadata: Record<string, string> = {}) => {
    const role = metadata?.role || 'buyer';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata?.fullName || '',
          avatar_url: metadata?.avatarUrl || '',
          phone: metadata?.phone || '',
          role,
        },
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`
      }
    });
    if (error) throw error;
    // Upsert user_profiles with the chosen role
    if (data.user) {
      await supabase.from('user_profiles').upsert({
        id: data.user.id,
        email,
        full_name: metadata?.fullName || '',
        role,
      }, { onConflict: 'id' });
      await loadUserProfile(data.user.id);
    }
    return data;
  };

  // Email/Password Sign In
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    if (data.user) {
      await loadUserProfile(data.user.id);
    }
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
    const res = await fetch('/api/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });
    const verifyData = await res.json();
    if (!res.ok) throw new Error(verifyData.error || 'Invalid OTP');

    const normalizedPhone = phone.replace(/\D/g, '');
    const phoneEmail = `${normalizedPhone}@kisansetu.phone`;
    const phonePassword = `KS_${normalizedPhone}_2026!`;

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: phoneEmail,
      password: phonePassword,
    });

    if (!signInError && signInData.user) {
      await loadUserProfile(signInData.user.id);
      return signInData;
    }

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

    if (!signUpData.session) {
      const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
        email: phoneEmail,
        password: phonePassword,
      });
      if (retryError) throw retryError;
      if (retrySignIn.user) await loadUserProfile(retrySignIn.user.id);
      return retrySignIn;
    }

    if (signUpData.user) await loadUserProfile(signUpData.user.id);
    return signUpData;
  };

  // Sign Out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUserRole(null);
    setUserProfile(null);
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
    setUserProfile(data);
    if (updates.role) setUserRole(updates.role as string);
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
        role: 'supplier',
      })
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    setUserProfile(data);
    setUserRole('supplier');
    return data;
  };

  // Helper: check if user is a supplier/provider
  const isSupplier = () => {
    return userRole === 'supplier' || userRole === 'provider' || userProfile?.is_provider === true;
  };

  // Helper: check if user is a farmer/buyer
  const isFarmer = () => {
    return userRole === 'farmer' || userRole === 'buyer';
  };

  const value = {
    user,
    session,
    loading,
    userRole,
    userProfile,
    isSupplier,
    isFarmer,
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
