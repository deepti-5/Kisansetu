import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EquipmentListingContent from '@/app/equipment-listing-page/components/EquipmentListingContent';

export default function EquipmentListingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <EquipmentListingContent />
      </main>
      <Footer />
    </div>
  );
}
