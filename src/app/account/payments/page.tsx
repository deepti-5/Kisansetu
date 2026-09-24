'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { CreditCard, ChevronRight, ArrowDownLeft, ArrowUpRight, CheckCircle, Clock, XCircle, RefreshCw, Download, Search, IndianRupee, Calendar, Shield } from 'lucide-react';

type TxType = 'all' | 'payment' | 'refund';
type TxStatus = 'success' | 'pending' | 'failed' | 'refunded';
interface Transaction { id: string; paymentId: string; type: 'payment' | 'refund'; description: string; amount: number; date: string; status: TxStatus; method: string; bookingId?: string; }

const TRANSACTIONS: Transaction[] = [
  { id: 't1', paymentId: 'pay_QxR1234567', type: 'payment', description: 'Mahindra Yuvo 575 DI Tractor — 3 days rental', amount: 7500, date: '2026-08-10', status: 'success', method: 'UPI', bookingId: 'BKG12340' },
  { id: 't2', paymentId: 'pay_QxR2345678', type: 'payment', description: 'Rotavator 7 Feet — 2 days rental', amount: 2400, date: '2026-08-05', status: 'success', method: 'Debit Card', bookingId: 'BKG12338' },
  { id: 't3', paymentId: 'rfnd_QxR3456789', type: 'refund', description: 'Refund: Paddy Transplanter — Booking cancelled', amount: 10500, date: '2026-08-03', status: 'refunded', method: 'UPI', bookingId: 'BKG12335' },
  { id: 't4', paymentId: 'pay_QxR4567890', type: 'payment', description: 'Combine Harvester — 1 day rental', amount: 8000, date: '2026-07-28', status: 'success', method: 'Net Banking', bookingId: 'BKG12330' },
  { id: 't5', paymentId: 'pay_QxR5678901', type: 'payment', description: 'Drip Irrigation Kit — Purchase', amount: 45000, date: '2026-07-20', status: 'success', method: 'Credit Card', bookingId: 'ORD00098' },
  { id: 't6', paymentId: 'pay_QxR6789012', type: 'payment', description: 'Labour Booking — 2 workers, 1 day', amount: 1200, date: '2026-07-15', status: 'failed', method: 'UPI' },
  { id: 't7', paymentId: 'rfnd_QxR7890123', type: 'refund', description: 'Security deposit refund — Tractor returned', amount: 10000, date: '2026-07-12', status: 'refunded', method: 'UPI', bookingId: 'BKG12310' },
];

const STATUS_CONFIG: Record<TxStatus, { label: string; color: string; icon: React.FC<{ size?: number; className?: string }> }> = {
  success: { label: 'Success', color: 'text-success bg-success/10', icon: CheckCircle },
  pending: { label: 'Pending', color: 'text-warning bg-warning/10', icon: Clock },
  failed: { label: 'Failed', color: 'text-danger bg-danger/10', icon: XCircle },
  refunded: { label: 'Refunded', color: 'text-primary bg-primary/10', icon: RefreshCw },
};

export default function PaymentsPage() {
  const [filter, setFilter] = useState<TxType>('all');
  const [search, setSearch] = useState('');

  const filtered = TRANSACTIONS.filter(t => {
    const matchType = filter === 'all' || t.type === filter;
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.paymentId.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const totalPaid = TRANSACTIONS.filter(t => t.type === 'payment' && t.status === 'success').reduce((s, t) => s + t.amount, 0);
  const totalRefunded = TRANSACTIONS.filter(t => t.type === 'refund').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-lg mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">Payment & Refund History</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-foreground">Payment & Refund History</h1>
          <button onClick={() => {}} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"><Download size={14} /> Export CSV</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center"><ArrowUpRight size={16} className="text-success" /></div><span className="text-sm text-muted-foreground">Total Paid</span></div>
            <p className="text-2xl font-extrabold text-foreground">₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><ArrowDownLeft size={16} className="text-primary" /></div><span className="text-sm text-muted-foreground">Total Refunded</span></div>
            <p className="text-2xl font-extrabold text-foreground">₹{totalRefunded.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center"><Clock size={16} className="text-warning" /></div><span className="text-sm text-muted-foreground">Pending</span></div>
            <p className="text-2xl font-extrabold text-foreground">0</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
            {(['all', 'payment', 'refund'] as TxType[]).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${filter === f ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                {f === 'all' ? 'All' : f === 'payment' ? 'Payments' : 'Refunds'}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." className="input-field pl-9 text-sm w-full" />
          </div>
        </div>
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><IndianRupee size={40} className="mx-auto mb-3 opacity-30" /><p className="font-semibold">No transactions found</p></div>
          ) : filtered.map(t => {
            const sc = STATUS_CONFIG[t.status]; const StatusIcon = sc.icon;
            return (
              <div key={t.id} className="bg-card rounded-2xl border border-border p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.type === 'refund' ? 'bg-primary/10' : 'bg-success/10'}`}>
                    {t.type === 'refund' ? <ArrowDownLeft size={18} className="text-primary" /> : <ArrowUpRight size={18} className="text-success" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{t.description}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-muted-foreground font-mono">{t.paymentId}</span>
                          {t.bookingId && <Link href="/account/bookings" className="text-xs text-primary hover:underline font-semibold">#{t.bookingId}</Link>}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar size={11} /> {t.date}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground"><CreditCard size={11} /> {t.method}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-lg font-extrabold ${t.type === 'refund' ? 'text-primary' : t.status === 'failed' ? 'text-danger' : 'text-foreground'}`}>
                          {t.type === 'refund' ? '+' : t.status === 'failed' ? '' : '-'}₹{t.amount.toLocaleString('en-IN')}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold mt-1 ${sc.color}`}><StatusIcon size={11} /> {sc.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 bg-muted/40 rounded-2xl p-4 flex gap-3">
          <Shield size={18} className="text-primary shrink-0 mt-0.5" />
          <div><p className="font-semibold text-sm text-foreground mb-1">Refund Policy</p><p className="text-xs text-muted-foreground leading-relaxed">Security deposits are refunded within 48 hours of equipment return. For disputes, contact 1800-123-KISAN.</p></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
