import React, { Suspense } from 'react';
import AuthScreen from '@/app/sign-up-login-screen/components/AuthScreen';

export default function SignUpLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <AuthScreen />
    </Suspense>
  );
}
