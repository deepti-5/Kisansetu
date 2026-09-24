'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Inbox, MessageCircle, Package, Bell, ChevronRight, Loader2, Tractor, RotateCcw, IndianRupee, CheckCircle2, ArrowRight, Search, Star, Users, ShoppingBag, Zap, TrendingUp, Calendar } from 'lucide-react';
import Icon from '../../../kisansetu-main/src/components/ui/AppIcon';


// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'all' | 'rental_requests' | 'messages' | 'booking_updates';

interface InboxItem {
  id: string;
  type: 'rental_request' | 'message' | 'booking_update' | 'payment';
  title: string;
  subtitle: string;
  meta: string;
  timestamp: string;
  read: boolean;
  priority: 'high' | 'normal' | 'low';
  actionLabel?: string;
  actionHref?: string;
  avatarIcon: React.ElementType;
  avatarBg: string;
  avatarColor: string;
  badge?: string;
  badgeColor?: string;
}

interface QuickAction {
  label: string;
  href: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  description: string;
}

interface SummaryCard {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  href: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ITEMS: InboxItem[] = [
  {
    id: 'ri-001', type: 'rental_request', read: false, priority: 'high',
    title: 'New Rental Request — Mahindra 575 DI Tractor',
    subtitle: 'Suresh Yadav wants to rent your tractor for 4 days (Aug 10–14)',
    meta: 'Booking #BKG82341 · ₹8,500 + ₹2,000 deposit',
    timestamp: '2026-09-24T09:15:00',
    avatarIcon: Tractor, avatarBg: 'bg-primary/10', avatarColor: 'text-primary',
    actionLabel: 'Review Request', actionHref: '/account/bookings',
    badge: 'Pending Approval', badgeColor: 'bg-warning/10 text-warning border-warning/20',
  },
  {
    id: 'ri-002', type: 'rental_request', read: false, priority: 'high',
    title: 'Rental Request — Rotavator 7-Feet Heavy Duty',
    subtitle: 'Priya Sharma is requesting your rotavator for 2 days',
    meta: 'Booking #BKG71209 · ₹3,200 + ₹1,000 deposit',
    timestamp: '2026-09-24T08:40:00',
    avatarIcon: Package, avatarBg: 'bg-accent/10', avatarColor: 'text-accent',
    actionLabel: 'Review Request', actionHref: '/account/bookings',
    badge: 'Pending Approval', badgeColor: 'bg-warning/10 text-warning border-warning/20',
  },
  {
    id: 'msg-001', type: 'message', read: false, priority: 'normal',
    title: 'Ramesh Agro Services',
    subtitle: 'Is the tractor available for the 15th? I need it for paddy transplanting.',
    meta: 'Mahindra 575 DI Tractor · Equipment enquiry',
    timestamp: '2026-09-24T11:30:00',
    avatarIcon: MessageCircle, avatarBg: 'bg-info/10', avatarColor: 'text-info',
    actionLabel: 'Reply', actionHref: '/messages',
    badge: '3 unread', badgeColor: 'bg-danger/10 text-danger border-danger/20',
  },
  {
    id: 'msg-002', type: 'message', read: true, priority: 'normal',
    title: 'Singh Farm Machinery',
    subtitle: 'Your booking is confirmed. Please arrive by 8 AM for equipment pickup.',
    meta: 'Rotavator 7-Feet · Booking confirmation',
    timestamp: '2026-09-24T07:20:00',
    avatarIcon: MessageCircle, avatarBg: 'bg-info/10', avatarColor: 'text-info',
    actionLabel: 'View', actionHref: '/messages',
  },
  {
    id: 'bu-001', type: 'booking_update', read: false, priority: 'high',
    title: 'Payment Received — BKG82341',
    subtitle: 'Suresh Yadav completed payment of ₹8,500 for Mahindra 575 DI Tractor',
    meta: 'Stripe · Paid in full · Deposit ₹2,000 held',
    timestamp: '2026-09-24T10:05:00',
    avatarIcon: IndianRupee, avatarBg: 'bg-success/10', avatarColor: 'text-success',
    actionLabel: 'View Booking', actionHref: '/account/bookings',
    badge: 'Payment Confirmed', badgeColor: 'bg-success/10 text-success border-success/20',
  },
  {
    id: 'bu-002', type: 'booking_update', read: false, priority: 'normal',
    title: 'Pickup Scheduled — BKG65890',
    subtitle: 'Paddy Transplanter 8-Row pickup confirmed for Aug 15 at 9:00 AM',
    meta: 'Green Fields Equipment · Kolhapur, Maharashtra',
    timestamp: '2026-09-24T06:45:00',
    avatarIcon: Calendar, avatarBg: 'bg-primary/10', avatarColor: 'text-primary',
    actionLabel: 'View Details', actionHref: '/order-confirmation',
    badge: 'Pickup Today', badgeColor: 'bg-primary/10 text-primary border-primary/20',
  },
  {
    id: 'bu-003', type: 'booking_update', read: true, priority: 'normal',
    title: 'Return Approved — BKG82341',
    subtitle: 'Your return request for Mahindra 575 DI Tractor has been approved',
    meta: 'Ramesh Agro Services · Return by 5 PM today',
    timestamp: '2026-09-23T17:00:00',
    avatarIcon: RotateCcw, avatarBg: 'bg-success/10', avatarColor: 'text-success',
    actionLabel: 'Start Return', actionHref: '/rental-return',
  },
  {
    id: 'pay-001', type: 'payment', read: true, priority: 'low',
    title: 'Refund Processed — ₹1,200',
    subtitle: 'Security deposit refund for BKG82341 has been processed',
    meta: 'Ref: REF-2026-09-24-001 · 3–5 business days',
    timestamp: '2026-09-23T14:30:00',
    avatarIcon: CheckCircle2, avatarBg: 'bg-success/10', avatarColor: 'text-success',
    actionLabel: 'View Receipt', actionHref: '/account/payments',
    badge: 'Refund Sent', badgeColor: 'bg-success/10 text-success border-success/20',
  },
];

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Browse Equipment', href: '/equipment-listing-page', icon: Tractor, color: 'text-primary', bg: 'bg-primary/10', description: 'Find tractors, tillers & more' },
  { label: 'My Rentals', href: '/farmer/rentals', icon: Package, color: 'text-accent', bg: 'bg-accent/10', description: 'Track active rentals' },
  { label: 'Messages', href: '/messages', icon: MessageCircle, color: 'text-info', bg: 'bg-info/10', description: 'Chat with suppliers' },
  { label: 'My Bookings', href: '/account/bookings', icon: ShoppingBag, color: 'text-success', bg: 'bg-success/10', description: 'View all bookings' },
  { label: 'Supplier Hub', href: '/supplier/hub', icon: TrendingUp, color: 'text-warning', bg: 'bg-warning/10', description: 'Manage your listings' },
  { label: 'Hire Labour', href: '/labour', icon: Users, color: 'text-primary', bg: 'bg-primary/10', description: 'Find farm workers' },
];

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'all', label: 'All', icon: Inbox },
  { key: 'rental_requests', label: 'Rental Requests', icon: Tractor },
  { key: 'messages', label: 'Messages', icon: MessageCircle },
  { key: 'booking_updates', label: 'Booking Updates', icon: Bell },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InboxItemCard({
  item,
  onRead,
}: {
  item: InboxItem;
  onRead: (id: string) => void;
}) {
  const Icon = item.avatarIcon;
  return (
    <div
      onClick={() => { if (!item.read) onRead(item.id); }}
      className={`group flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer hover:border-primary/30 hover:shadow-sm ${
        !item.read
          ? 'bg-primary/[0.03] border-primary/20'
          : 'bg-card border-border'
      }`}
    >
      {/* Avatar */}
      <div className={`w-11 h-11 rounded-xl ${item.avatarBg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon size={20} className={item.avatarColor} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            {!item.read && (
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            )}
            <p className={`text-sm font-semibold truncate ${!item.read ? 'text-foreground' : 'text-foreground/80'}`}>
              {item.title}
            </p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{formatTime(item.timestamp)}</span>
        </div>

        <p className="text-sm text-muted-foreground mb-1.5 line-clamp-1">{item.subtitle}</p>
        <p className="text-xs text-muted-foreground/70 mb-2.5 truncate">{item.meta}</p>

        <div className="flex items-center gap-2 flex-wrap">
          {item.badge && (
            <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
              {item.badge}
            </span>
          )}
          {item.actionLabel && item.actionHref && (
            <Link
              href={item.actionHref}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              {item.actionLabel} <ArrowRight size={10} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UnifiedInboxPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<InboxItem[]>(MOCK_ITEMS);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');
  const [convCount, setConvCount] = useState<number>(0);
  const supabase = createClient();

  // Load real conversation count from Supabase
  useEffect(() => {
    if (!user) return;
    supabase
      .from('conversations')
      .select('id', { count: 'exact', head: true })
      .or(`buyer_id.eq.${user.id},provider_id.eq.${user.id}`)
      .then(({ count }) => {
        if (count !== null) setConvCount(count);
      });
  }, [user, supabase]);

  function markRead(id: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, read: true } : i)));
  }

  function markAllRead() {
    setItems((prev) => prev.map((i) => ({ ...i, read: true })));
  }

  const filtered = items.filter((item) => {
    if (activeTab === 'rental_requests' && item.type !== 'rental_request') return false;
    if (activeTab === 'messages' && item.type !== 'message') return false;
    if (activeTab === 'booking_updates' && item.type !== 'booking_update' && item.type !== 'payment') return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !item.title.toLowerCase().includes(q) &&
        !item.subtitle.toLowerCase().includes(q) &&
        !item.meta.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const unreadCount = items.filter((i) => !i.read).length;
  const rentalRequestCount = items.filter((i) => i.type === 'rental_request' && !i.read).length;
  const messageCount = items.filter((i) => i.type === 'message' && !i.read).length;
  const bookingUpdateCount = items.filter((i) => (i.type === 'booking_update' || i.type === 'payment') && !i.read).length;

  const SUMMARY_CARDS: SummaryCard[] = [
    { label: 'Rental Requests', value: rentalRequestCount, icon: Tractor, color: 'text-primary', bg: 'bg-primary/10', href: '/account/bookings' },
    { label: 'Unread Messages', value: messageCount || convCount, icon: MessageCircle, color: 'text-info', bg: 'bg-info/10', href: '/messages' },
    { label: 'Booking Updates', value: bookingUpdateCount, icon: Bell, color: 'text-warning', bg: 'bg-warning/10', href: '/account/bookings' },
    { label: 'Notifications', value: unreadCount, icon: Zap, color: 'text-success', bg: 'bg-success/10', href: '/inbox' },
  ];

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Farmer';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Inbox size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Your Unified Inbox</h1>
          <p className="text-muted-foreground mb-6">Sign in to view your rental requests, messages, and booking updates all in one place.</p>
          <Link href="/sign-up-login-screen" className="btn-primary px-8 py-3 rounded-xl font-semibold inline-flex items-center gap-2">
            Sign In to Continue <ArrowRight size={16} />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 xl:px-10 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">Inbox</span>
        </div>

        {/* Page Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="relative">
                <Inbox size={24} className="text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-extrabold text-foreground">
                Welcome back, {displayName.split(' ')[0]}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0
                ? <><span className="font-semibold text-primary">{unreadCount} unread item{unreadCount !== 1 ? 's' : ''}</span> · Your rental activity at a glance</>
                : 'All caught up · Your rental activity at a glance'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                suppressHydrationWarning
                onClick={markAllRead}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {SUMMARY_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <Icon size={18} className={card.color} />
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-2xl font-extrabold text-foreground mb-0.5">{card.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
              </Link>
            );
          })}
        </div>

        {/* Main Grid: Feed + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-5">

          {/* ── Left: Inbox Feed ── */}
          <div>
            {/* Tabs + Search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {TABS.map((tab) => {
                  const TabIcon = tab.icon;
                  const count =
                    tab.key === 'all' ? unreadCount
                    : tab.key === 'rental_requests' ? rentalRequestCount
                    : tab.key === 'messages' ? messageCount
                    : bookingUpdateCount;
                  return (
                    <button
                      suppressHydrationWarning
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold border transition-all ${
                        activeTab === tab.key
                          ? 'gradient-green text-white border-transparent' :'border-border text-muted-foreground bg-card hover:border-primary hover:text-primary'
                      }`}
                    >
                      <TabIcon size={13} />
                      {tab.label}
                      {count > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-danger text-white'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Search */}
              <div className="relative sm:ml-auto sm:w-52">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search inbox…"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Items */}
            {filtered.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Inbox size={28} className="text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">
                  {search ? 'No results found' : 'All caught up!'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {search ? 'Try a different search term.' : 'No new rental requests, messages, or updates.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filtered.map((item) => (
                  <InboxItemCard key={item.id} item={item} onRead={markRead} />
                ))}
              </div>
            )}

            {/* View More Links */}
            {filtered.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/inbox" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  <Bell size={14} /> All Notifications <ArrowRight size={12} />
                </Link>
                <Link href="/messages" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  <MessageCircle size={14} /> All Messages <ArrowRight size={12} />
                </Link>
                <Link href="/account/bookings" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  <ShoppingBag size={14} /> All Bookings <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>

          {/* ── Right: Sidebar ── */}
          <div className="space-y-4">

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-primary" />
                <h2 className="text-sm font-bold text-foreground">Quick Actions</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-center group"
                    >
                      <div className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center`}>
                        <ActionIcon size={17} className={action.color} />
                      </div>
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {action.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Active Rental Status */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tractor size={16} className="text-primary" />
                  <h2 className="text-sm font-bold text-foreground">Active Rental</h2>
                </div>
                <Link href="/farmer/rentals" className="text-xs text-primary font-medium hover:underline">View all</Link>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Tractor size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">Mahindra 575 DI Tractor</p>
                    <p className="text-xs text-muted-foreground">Ramesh Agro Services</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                        <CheckCircle2 size={9} /> Active
                      </span>
                      <span className="text-[10px] text-muted-foreground">Aug 10–14</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link href="/rental-return" className="flex-1 text-center text-xs font-semibold py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">
                    Initiate Return
                  </Link>
                  <Link href="/messages" className="flex-1 text-center text-xs font-semibold py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors">
                    Message
                  </Link>
                </div>
              </div>
            </div>

            {/* Pending Payment */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <IndianRupee size={16} className="text-warning" />
                <h2 className="text-sm font-bold text-foreground">Pending Payment</h2>
              </div>
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-3.5">
                <p className="text-sm font-semibold text-foreground mb-0.5">Paddy Transplanter 8-Row</p>
                <p className="text-xs text-muted-foreground mb-2">Booking #BKG65890 · ₹4,800 due</p>
                <Link
                  href="/rental-payment"
                  className="w-full block text-center text-xs font-semibold py-2 rounded-lg bg-warning text-white hover:bg-warning/90 transition-colors"
                >
                  Complete Payment
                </Link>
              </div>
            </div>

            {/* Supplier Tip */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star size={15} className="text-primary" />
                <h2 className="text-sm font-bold text-foreground">Supplier Tip</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Respond to rental requests within 2 hours to increase your booking rate by 40%.
              </p>
              <Link href="/supplier/hub" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                Go to Supplier Hub <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
