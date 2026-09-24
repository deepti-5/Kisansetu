'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Package, Truck, RotateCcw, Search } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

type BookingStatus = 'confirmed' | 'preparing' | 'received' | 'rental_active' | 'returned' | 'cancelled';
type BookingType = 'rental' | 'purchase';

interface Booking {id: string;type: BookingType;equipmentName: string;equipmentCategory: string;equipmentImage: string;supplierName: string;location: string;startDate: string;endDate?: string;status: BookingStatus;paymentMethod: string;amountPaid: number;deposit?: number;createdAt: string;}

const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: 'text-info bg-info/10 border-info/20', preparing: 'text-warning bg-warning/10 border-warning/20',
  received: 'text-primary bg-primary/10 border-primary/20', rental_active: 'text-success bg-success/10 border-success/20',
  returned: 'text-muted-foreground bg-muted border-border', cancelled: 'text-danger bg-danger/10 border-danger/20'
};

const MOCK_BOOKINGS: Booking[] = [
{ id: 'BKG82341', type: 'rental', equipmentName: 'Mahindra 575 DI Tractor', equipmentCategory: 'Tractor', equipmentImage: 'https://images.unsplash.com/photo-1708417134916-234bb4b33881', supplierName: 'Ramesh Agro Services', location: 'Pune, Maharashtra', startDate: '2026-08-10', endDate: '2026-08-14', status: 'rental_active', paymentMethod: 'UPI', amountPaid: 8500, deposit: 2000, createdAt: '2026-08-09' },
{ id: 'BKG71209', type: 'rental', equipmentName: 'Rotavator 7-Feet Heavy Duty', equipmentCategory: 'Tillage Equipment', equipmentImage: "https://img.rocket.new/generatedImages/rocket_gen_img_163ecef60-1784222686661.png", supplierName: 'Singh Farm Machinery', location: 'Nashik, Maharashtra', startDate: '2026-07-20', endDate: '2026-07-22', status: 'returned', paymentMethod: 'Net Banking', amountPaid: 3200, deposit: 1000, createdAt: '2026-07-19' },
{ id: 'BKG65890', type: 'rental', equipmentName: 'Paddy Transplanter 8-Row', equipmentCategory: 'Planting Equipment', equipmentImage: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d', supplierName: 'Green Fields Equipment', location: 'Kolhapur, Maharashtra', startDate: '2026-08-15', endDate: '2026-08-17', status: 'confirmed', paymentMethod: 'Credit Card', amountPaid: 4800, deposit: 1500, createdAt: '2026-08-11' },
{ id: 'BKG43210', type: 'rental', equipmentName: 'Mini Power Tiller 7HP', equipmentCategory: 'Tiller', equipmentImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1e7a72901-1768249566100.png', supplierName: 'Kisan Tools Hub', location: 'Aurangabad, Maharashtra', startDate: '2026-08-12', endDate: '2026-08-13', status: 'preparing', paymentMethod: 'UPI', amountPaid: 1800, deposit: 500, createdAt: '2026-08-11' }];


const FILTER_TABS = [{ key: 'all', label: 'All Bookings' }, { key: 'rental', label: 'Rentals' }, { key: 'purchase', label: 'Purchases' }, { key: 'active', label: 'Active' }, { key: 'completed', label: 'Completed' }];

export default function BookingsPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const STATUS_LABELS: Record<BookingStatus, string> = {
    confirmed: t('statusConfirmed'),
    preparing: t('statusPreparing'),
    received: t('statusReceived'),
    rental_active: t('statusRentalActive'),
    returned: t('statusReturned'),
    cancelled: t('statusCancelled'),
  };

  const filtered = MOCK_BOOKINGS.filter((b) => {
    const matchTab = activeTab === 'all' || activeTab === 'rental' && b.type === 'rental' || activeTab === 'purchase' && b.type === 'purchase' || activeTab === 'active' && ['confirmed', 'preparing', 'received', 'rental_active'].includes(b.status) || activeTab === 'completed' && ['returned', 'cancelled'].includes(b.status);
    const matchSearch = !search || b.equipmentName.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-lg mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{t('myBookingsTitle')}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-foreground mb-6">{t('myBookingsTitle')}</h1>

        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm mb-4">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('searchBookings')} className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6">
          {FILTER_TABS.map((tab) => <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${activeTab === tab.key ? 'gradient-green text-white border-transparent' : 'border-border text-muted-foreground bg-card hover:border-primary hover:text-primary'}`}>{tab.label}</button>)}
        </div>

        {filtered.length === 0 ?
        <div className="card-base p-16 text-center"><Package size={48} className="text-muted-foreground mx-auto mb-4" /><h3 className="font-bold text-xl text-foreground mb-2">{t('noBookingsFound')}</h3><p className="text-muted-foreground text-sm mb-6">{t('noBookingsDesc')}</p><Link href="/equipment-listing-page" className="btn-primary">{t('browseEquipment')}</Link></div> :

        <div className="space-y-4">
            {filtered.map((booking) =>
          <div key={booking.id} className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img src={booking.equipmentImage} alt={booking.equipmentName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                      <div>
                        <p className="font-bold text-foreground">{booking.equipmentName}</p>
                        <p className="text-xs text-muted-foreground">{booking.equipmentCategory} · {booking.supplierName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">#{booking.id} · {booking.paymentMethod}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_COLORS[booking.status]}`}>{STATUS_LABELS[booking.status]}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span>{booking.startDate}{booking.endDate ? ` → ${booking.endDate}` : ''}</span>
                      <span className="font-bold text-primary">₹{booking.amountPaid.toLocaleString('en-IN')}</span>
                      {booking.deposit && <span className="text-warning">Deposit: ₹{booking.deposit.toLocaleString('en-IN')}</span>}
                    </div>
                    <div className="flex gap-2 mt-3">
                      {['confirmed', 'preparing', 'received', 'rental_active'].includes(booking.status) && <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"><Truck size={13} /> {t('track')}</button>}
                      {booking.status === 'rental_active' && (
                        <Link href="/rental-return" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-semibold hover:bg-warning/20 transition-colors"><RotateCcw size={13} /> {t('return')}</Link>
                      )}
                      {booking.status === 'returned' && <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors">{t('writeReview')}</button>}
                    </div>
                  </div>
                </div>
              </div>
          )}
          </div>
        }
      </main>
      <Footer />
    </div>);

}