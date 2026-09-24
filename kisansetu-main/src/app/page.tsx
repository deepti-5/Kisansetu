import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/app/components/HeroSection';
import CategoryCards from '@/app/components/CategoryCards';
import FeaturedEquipment from '@/app/components/FeaturedEquipment';
import FeaturedLabour from '@/app/components/FeaturedLabour';
import FeaturedAgri from '@/app/components/FeaturedAgri';
import BookingFlowSection from '@/app/components/BookingFlowSection';
import HowItWorksSection from '@/app/components/HowItWorksSection';
import KeyFeaturesSection from '@/app/components/KeyFeaturesSection';
import TestimonialsSection from '@/app/components/TestimonialsSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <CategoryCards />
        <FeaturedEquipment />
        <FeaturedLabour />
        <FeaturedAgri />
        <BookingFlowSection />
        <HowItWorksSection />
        <KeyFeaturesSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}