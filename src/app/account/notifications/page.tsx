'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Bell, CheckCheck, Trash2, ShoppingBag, UserCheck, CreditCard, AlertTriangle, Star, Megaphone } from 'lucide-react';
import Icon from '../../../../kisansetu-main/src/components/ui/AppIcon';


type NotifCategory = 'all' | 'orders' | 'labour' | 'payments' | 'alerts' | 'promotions';
interface Notification { id: string; category: Exclude<NotifCategory, 'all'>; title: string; message: string; time: string; read: boolean; icon: React.ElementType; iconColor: string; iconBg: string; actionLabel?: string; actionHref?: string; }

const INITIAL_NOTIFS: Notification[] = [
  { id: 'n-001', category: 'orders', title: 'Booking Confirmed', message: 'Your rental booking for Mahindra Yuvo 575 DI Tractor has been confirmed. Booking ID: KS-2024-001.', time: '5 min ago', read: false, icon: ShoppingBag, iconColor: 'text-primary', iconBg: 'bg-secondary', actionLabel: 'View Booking', actionHref: '/account/bookings' },
  { id: 'n-002', category: 'labour', title: 'Labour Request Accepted', message: 'Kavita Jadhav has accepted your hire request for seed sowing. She will arrive on 15 Aug at 7:00 AM.', time: '1 hour ago', read: false, icon: UserCheck, iconColor: 'text-success', iconBg: 'bg-success-bg', actionLabel: 'View Details', actionHref: '/account/bookings' },
  { id: 'n-003', category: 'payments', title: 'Payment Successful', message: 'Payment of ₹2,500 received for Tractor Rental. Razorpay ID: pay_QXjk8Lm2Np.', time: '2 hours ago', read: false, icon: CreditCard, iconColor: 'text-info', iconBg: 'bg-info-bg', actionLabel: 'View Receipt', actionHref: '/account/payments' },
  { id: 'n-004', category: 'alerts', title: 'Weather Alert — Heavy Rain', message: 'Heavy rainfall expected in Pune district on 14–15 Aug. Consider postponing field operations.', time: '5 hours ago', read: false, icon: AlertTriangle, iconColor: 'text-danger', iconBg: 'bg-danger-bg' },
  { id: 'n-005', category: 'promotions', title: '🎉 Monsoon Sale — Up to 30% Off', message: 'Get up to 30% off on fertilizers and seeds this monsoon season. Offer valid till 20 Aug 2026.', time: '1 day ago', read: true, icon: Megaphone, iconColor: 'text-accent', iconBg: 'bg-warning-bg', actionLabel: 'Shop Now', actionHref: '/agri' },
  { id: 'n-006', category: 'orders', title: 'Review Your Experience', message: 'How was your rental of John Deere W70 Combine Harvester? Share your feedback.', time: '3 days ago', read: true, icon: Star, iconColor: 'text-accent', iconBg: 'bg-warning-bg', actionLabel: 'Write Review', actionHref: '/account/bookings' },
];

const CATEGORY_TABS: { key: NotifCategory; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'All', icon: Bell }, { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'labour', label: 'Labour', icon: UserCheck }, { key: 'payments', label: 'Payments', icon: CreditCard },
  { key: 'alerts', label: 'Alerts', icon: AlertTriangle }, { key: 'promotions', label: 'Offers', icon: Megaphone },
];

function NotifCard({ notif, onRead, onDelete }: { notif: Notification; onRead: (id: string) => void; onDelete: (id: string) => void }) {
  const Icon = notif.icon;
  return (
    <div onClick={() => !notif.read && onRead(notif.id)} className={`card-base p-4 flex gap-4 cursor-pointer transition-all hover:shadow-md ${!notif.read ? 'border-primary/30 bg-secondary/30' : ''}`}>
      <div className={`w-10 h-10 rounded-full ${notif.iconBg} flex items-center justify-center shrink-0 mt-0.5`}><Icon size={18} className={notif.iconColor} /></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2"><h4 className={`text-sm font-semibold ${!notif.read ? 'text-foreground' : 'text-foreground/80'}`}>{notif.title}</h4>{!notif.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}</div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">{notif.time}</span>
            <button suppressHydrationWarning onClick={e => { e.stopPropagation(); onDelete(notif.id); }} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-danger transition-colors"><Trash2 size={13} /></button>
          </div>
        </div>
        <p className={`text-sm mt-0.5 leading-relaxed ${!notif.read ? 'text-foreground/80' : 'text-muted-foreground'}`}>{notif.message}</p>
        {notif.actionLabel && <a href={notif.actionHref} onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary hover:underline transition-colors">{notif.actionLabel} →</a>}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFS);
  const [activeTab, setActiveTab] = useState<NotifCategory>('all');
  const unreadCount = notifs.filter(n => !n.read).length;
  const filtered = activeTab === 'all' ? notifs : notifs.filter(n => n.category === activeTab);
  const tabUnread = (tab: NotifCategory) => tab === 'all' ? unreadCount : notifs.filter(n => n.category === tab && !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="relative"><Bell size={22} className="text-foreground" />{unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center leading-none">{unreadCount}</span>}</div>
              <h1 className="text-2xl font-extrabold text-foreground">Notifications</h1>
            </div>
            <p className="text-sm text-muted-foreground">{unreadCount > 0 ? <><span className="font-semibold text-primary">{unreadCount} unread</span> · {notifs.length} total</> : `${notifs.length} notifications`}</p>
          </div>
          {notifs.length > 0 && (
            <div className="flex items-center gap-3">
              {unreadCount > 0 && <button suppressHydrationWarning onClick={() => setNotifs(p => p.map(n => ({ ...n, read: true })))} className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"><CheckCheck size={15} />Mark all read</button>}
              <button suppressHydrationWarning onClick={() => setNotifs([])} className="flex items-center gap-1.5 text-sm font-medium text-danger hover:text-danger/80"><Trash2 size={15} />Clear all</button>
            </div>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
          {CATEGORY_TABS.map(tab => {
            const count = tabUnread(tab.key);
            return (
              <button suppressHydrationWarning key={tab.key} onClick={() => setActiveTab(tab.key)} className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${activeTab === tab.key ? 'gradient-green text-white border-transparent' : 'border-border text-muted-foreground bg-card hover:border-primary hover:text-primary'}`}>
                <tab.icon size={14} />{tab.label}
                {count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-danger text-white'}`}>{count}</span>}
              </button>
            );
          })}
        </div>
        {filtered.length === 0 ? (
          <div className="card-base p-16 text-center"><Bell size={48} className="text-muted-foreground mx-auto mb-4" /><h3 className="font-bold text-xl text-foreground mb-2">No notifications</h3><p className="text-muted-foreground text-sm">You&apos;re all caught up!</p></div>
        ) : (
          <div className="space-y-2">
            {filtered.some(n => !n.read) && (<><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">New</p>{filtered.filter(n => !n.read).map(notif => <NotifCard key={notif.id} notif={notif} onRead={(id) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n))} onDelete={(id) => setNotifs(p => p.filter(n => n.id !== id))} />)}</>)}
            {filtered.some(n => n.read) && (<><p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mt-5 mb-2">Earlier</p>{filtered.filter(n => n.read).map(notif => <NotifCard key={notif.id} notif={notif} onRead={(id) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n))} onDelete={(id) => setNotifs(p => p.filter(n => n.id !== id))} />)}</>)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
