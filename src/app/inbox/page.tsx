'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  Mail, MessageSquare, Filter, Search, CheckCheck, Trash2,
  RotateCcw, KeyRound, ClipboardCheck, AlertTriangle, IndianRupee,
  ChevronRight, Clock, User, Package, Inbox
} from 'lucide-react';

type Channel = 'all' | 'email' | 'sms';
type Stage = 'all' | 'return_approval' | 'otp_handover' | 'inspection' | 'damage_assessment' | 'refund';
type Role = 'all' | 'farmer' | 'provider';

interface InboxMessage {
  id: string;
  channel: 'email' | 'sms';
  stage: Exclude<Stage, 'all'>;
  role: 'farmer' | 'provider';
  subject: string;
  preview: string;
  body: string;
  recipient: string;
  bookingId: string;
  equipmentName: string;
  timestamp: string;
  read: boolean;
}

const STAGE_META: Record<Exclude<Stage, 'all'>, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  return_approval: { label: 'Return Approval', icon: RotateCcw, color: 'text-info', bg: 'bg-info-bg' },
  otp_handover: { label: 'OTP Handover', icon: KeyRound, color: 'text-accent', bg: 'bg-warning-bg' },
  inspection: { label: 'Inspection', icon: ClipboardCheck, color: 'text-success', bg: 'bg-success-bg' },
  damage_assessment: { label: 'Damage Assessment', icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger-bg' },
  refund: { label: 'Refund Processed', icon: IndianRupee, color: 'text-primary', bg: 'bg-secondary' },
};

const MOCK_MESSAGES: InboxMessage[] = [
  {
    id: 'msg-001', channel: 'email', stage: 'return_approval', role: 'farmer', read: false,
    subject: 'Return Request Approved — BKG82341',
    preview: 'Your return request for Mahindra 575 DI Tractor has been approved by the provider.',
    body: 'Dear Suresh Yadav,\n\nYour return request for Mahindra 575 DI Tractor (Booking ID: BKG82341) has been approved by Ramesh Agro Services.\n\nPlease arrange to return the equipment by 5:00 PM today. An OTP will be shared at the time of handover to confirm the return.\n\nThank you for using KisanSetu.',
    recipient: 'suresh.yadav@example.com', bookingId: 'BKG82341', equipmentName: 'Mahindra 575 DI Tractor',
    timestamp: '2026-09-24T09:15:00',
  },
  {
    id: 'msg-002', channel: 'sms', stage: 'return_approval', role: 'farmer', read: false,
    subject: 'SMS: Return Approved',
    preview: '[KisanSetu] Return approved for Mahindra 575 DI Tractor (BKG82341). Return by 5 PM today.',
    body: '[KisanSetu] Return approved for Mahindra 575 DI Tractor (BKG82341). Return by 5 PM today. OTP will be shared at handover.',
    recipient: '+91 98765 43210', bookingId: 'BKG82341', equipmentName: 'Mahindra 575 DI Tractor',
    timestamp: '2026-09-24T09:15:30',
  },
  {
    id: 'msg-003', channel: 'email', stage: 'return_approval', role: 'provider', read: true,
    subject: 'Return Request Received — BKG82341',
    preview: 'Suresh Yadav has submitted a return request for Mahindra 575 DI Tractor.',
    body: 'Dear Ramesh Agro Services,\n\nSuresh Yadav has submitted a return request for Mahindra 575 DI Tractor (Booking ID: BKG82341).\n\nPlease log in to your dashboard to approve or schedule the return pickup.\n\nKisanSetu Team',
    recipient: 'ramesh.agro@example.com', bookingId: 'BKG82341', equipmentName: 'Mahindra 575 DI Tractor',
    timestamp: '2026-09-24T08:50:00',
  },
  {
    id: 'msg-004', channel: 'email', stage: 'otp_handover', role: 'farmer', read: false,
    subject: 'OTP for Equipment Handover — BKG82341',
    preview: 'Your one-time password for confirming the equipment return handover is 847291.',
    body: 'Dear Suresh Yadav,\n\nYour OTP for confirming the return handover of Mahindra 575 DI Tractor (Booking ID: BKG82341) is:\n\n  847291\n\nShare this OTP with the provider at the time of handover. This OTP is valid for 30 minutes.\n\nDo not share this OTP with anyone else.',
    recipient: 'suresh.yadav@example.com', bookingId: 'BKG82341', equipmentName: 'Mahindra 575 DI Tractor',
    timestamp: '2026-09-24T14:00:00',
  },
  {
    id: 'msg-005', channel: 'sms', stage: 'otp_handover', role: 'farmer', read: false,
    subject: 'SMS: Handover OTP',
    preview: '[KisanSetu] OTP: 847291 for BKG82341 handover. Valid 30 min. Do not share.',
    body: '[KisanSetu] OTP: 847291 for BKG82341 handover. Valid 30 min. Do not share with anyone.',
    recipient: '+91 98765 43210', bookingId: 'BKG82341', equipmentName: 'Mahindra 575 DI Tractor',
    timestamp: '2026-09-24T14:00:15',
  },
  {
    id: 'msg-006', channel: 'sms', stage: 'otp_handover', role: 'provider', read: true,
    subject: 'SMS: OTP Verified',
    preview: '[KisanSetu] OTP verified for BKG82341. Handover confirmed. Proceed to inspection.',
    body: '[KisanSetu] OTP verified for BKG82341. Handover confirmed. Proceed to equipment inspection.',
    recipient: '+91 91234 56789', bookingId: 'BKG82341', equipmentName: 'Mahindra 575 DI Tractor',
    timestamp: '2026-09-24T14:35:00',
  },
  {
    id: 'msg-007', channel: 'email', stage: 'inspection', role: 'provider', read: true,
    subject: 'Inspection Report Submitted — BKG82341',
    preview: 'Equipment inspection for Mahindra 575 DI Tractor has been completed. Minor issues found.',
    body: 'Dear Ramesh Agro Services,\n\nThe inspection for Mahindra 575 DI Tractor (Booking ID: BKG82341) has been completed.\n\nInspection Result: Minor issues found\n- Scratches / Paint damage\n- Excessive dirt / not cleaned\n\nTotal deduction: ₹800\n\nThe damage assessment is now in progress. You will be notified once the final deposit calculation is complete.',
    recipient: 'ramesh.agro@example.com', bookingId: 'BKG82341', equipmentName: 'Mahindra 575 DI Tractor',
    timestamp: '2026-09-24T15:10:00',
  },
  {
    id: 'msg-008', channel: 'sms', stage: 'inspection', role: 'farmer', read: true,
    subject: 'SMS: Inspection Complete',
    preview: '[KisanSetu] Inspection done for BKG82341. Minor issues noted. Damage assessment in progress.',
    body: '[KisanSetu] Inspection done for BKG82341. Minor issues noted. Damage assessment in progress. You will be notified shortly.',
    recipient: '+91 98765 43210', bookingId: 'BKG82341', equipmentName: 'Mahindra 575 DI Tractor',
    timestamp: '2026-09-24T15:10:30',
  },
  {
    id: 'msg-009', channel: 'email', stage: 'damage_assessment', role: 'farmer', read: true,
    subject: 'Damage Assessment Result — BKG82341',
    preview: 'Damage assessment completed. Deduction of ₹800 applied to your security deposit.',
    body: 'Dear Suresh Yadav,\n\nThe damage assessment for Mahindra 575 DI Tractor (Booking ID: BKG82341) has been completed.\n\nDamage Summary:\n- Scratches / Paint damage: ₹500\n- Excessive dirt / not cleaned: ₹300\n\nTotal Deduction: ₹800\nOriginal Deposit: ₹2,000\nRefundable Amount: ₹1,200\n\nYour refund will be processed within 3–5 business days.',
    recipient: 'suresh.yadav@example.com', bookingId: 'BKG82341', equipmentName: 'Mahindra 575 DI Tractor',
    timestamp: '2026-09-24T16:00:00',
  },
  {
    id: 'msg-010', channel: 'sms', stage: 'damage_assessment', role: 'farmer', read: true,
    subject: 'SMS: Damage Assessment',
    preview: '[KisanSetu] Damage: ₹800 deducted from deposit (BKG82341). Refund ₹1,200 in 3-5 days.',
    body: '[KisanSetu] Damage: ₹800 deducted from deposit (BKG82341). Refund ₹1,200 in 3-5 business days.',
    recipient: '+91 98765 43210', bookingId: 'BKG82341', equipmentName: 'Mahindra 575 DI Tractor',
    timestamp: '2026-09-24T16:00:20',
  },
  {
    id: 'msg-011', channel: 'email', stage: 'damage_assessment', role: 'provider', read: true,
    subject: 'Damage Assessment Finalized — BKG82341',
    preview: 'Damage assessment for Mahindra 575 DI Tractor finalized. ₹800 compensation approved.',
    body: 'Dear Ramesh Agro Services,\n\nThe damage assessment for Mahindra 575 DI Tractor (Booking ID: BKG82341) has been finalized.\n\nApproved Compensation: ₹800\n\nThis amount will be credited to your registered bank account within 5–7 business days.',
    recipient: 'ramesh.agro@example.com', bookingId: 'BKG82341', equipmentName: 'Mahindra 575 DI Tractor',
    timestamp: '2026-09-24T16:05:00',
  },
  {
    id: 'msg-012', channel: 'email', stage: 'refund', role: 'farmer', read: true,
    subject: 'Refund Processed — ₹1,200 — BKG82341',
    preview: 'Your security deposit refund of ₹1,200 has been successfully processed.',
    body: 'Dear Suresh Yadav,\n\nYour security deposit refund for Booking ID BKG82341 has been successfully processed.\n\nRefund Details:\n- Amount: ₹1,200\n- Method: Original payment method\n- Reference: REF-2026-09-24-001\n\nThe amount should reflect in your account within 3–5 business days depending on your bank.\n\nThank you for using KisanSetu!',
    recipient: 'suresh.yadav@example.com', bookingId: 'BKG82341', equipmentName: 'Mahindra 575 DI Tractor',
    timestamp: '2026-09-24T17:30:00',
  },
  {
    id: 'msg-013', channel: 'sms', stage: 'refund', role: 'farmer', read: true,
    subject: 'SMS: Refund Processed',
    preview: '[KisanSetu] Refund of ₹1,200 processed for BKG82341. Ref: REF-2026-09-24-001.',
    body: '[KisanSetu] Refund of ₹1,200 processed for BKG82341. Ref: REF-2026-09-24-001. Allow 3-5 business days.',
    recipient: '+91 98765 43210', bookingId: 'BKG82341', equipmentName: 'Mahindra 575 DI Tractor',
    timestamp: '2026-09-24T17:30:15',
  },
  {
    id: 'msg-014', channel: 'email', stage: 'refund', role: 'provider', read: true,
    subject: 'Rental Cycle Closed — BKG82341',
    preview: 'The rental cycle for Mahindra 575 DI Tractor has been closed. Payout processed.',
    body: 'Dear Ramesh Agro Services,\n\nThe rental cycle for Mahindra 575 DI Tractor (Booking ID: BKG82341) has been successfully closed.\n\nPayout Summary:\n- Rental Amount: ₹8,500\n- Platform Fee (2%): ₹170\n- Net Payout: ₹8,330\n- Damage Compensation: ₹800\n- Total Credited: ₹9,130\n\nThank you for listing on KisanSetu!',
    recipient: 'ramesh.agro@example.com', bookingId: 'BKG82341', equipmentName: 'Mahindra 575 DI Tractor',
    timestamp: '2026-09-24T17:35:00',
  },
];

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function MessageCard({
  msg,
  selected,
  onSelect,
  onRead,
  onDelete,
}: {
  msg: InboxMessage;
  selected: boolean;
  onSelect: () => void;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const meta = STAGE_META[msg.stage];
  const StageIcon = meta.icon;
  return (
    <div
      onClick={() => { onSelect(); if (!msg.read) onRead(msg.id); }}
      className={`flex gap-3 p-4 cursor-pointer border-b border-border transition-all hover:bg-secondary/40 ${selected ? 'bg-secondary/60 border-l-2 border-l-primary' : ''} ${!msg.read ? 'bg-secondary/20' : ''}`}
    >
      <div className={`w-9 h-9 rounded-full ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}>
        <StageIcon size={16} className={meta.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {!msg.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
            <span className={`text-sm font-semibold truncate ${!msg.read ? 'text-foreground' : 'text-foreground/80'}`}>{msg.subject}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
            <button
              suppressHydrationWarning
              onClick={e => { e.stopPropagation(); onDelete(msg.id); }}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-danger transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground truncate mb-1.5">{msg.preview}</p>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
            <StageIcon size={9} />{meta.label}
          </span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${msg.channel === 'email' ? 'bg-info-bg text-info' : 'bg-success-bg text-success'}`}>
            {msg.channel === 'email' ? <Mail size={9} /> : <MessageSquare size={9} />}
            {msg.channel === 'email' ? 'Email' : 'SMS'}
          </span>
          <span className="text-[10px] text-muted-foreground capitalize">{msg.role}</span>
        </div>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const [messages, setMessages] = useState<InboxMessage[]>(MOCK_MESSAGES);
  const [channel, setChannel] = useState<Channel>('all');
  const [stage, setStage] = useState<Stage>('all');
  const [role, setRole] = useState<Role>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_MESSAGES[0]?.id ?? null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = messages.filter(m => {
    if (channel !== 'all' && m.channel !== channel) return false;
    if (stage !== 'all' && m.stage !== stage) return false;
    if (role !== 'all' && m.role !== role) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.subject.toLowerCase().includes(q) && !m.preview.toLowerCase().includes(q) && !m.bookingId.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const selected = messages.find(m => m.id === selectedId) ?? null;
  const unreadCount = messages.filter(m => !m.read).length;

  function markRead(id: string) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
  }
  function deleteMsg(id: string) {
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedId === id) setSelectedId(filtered.find(m => m.id !== id)?.id ?? null);
  }
  function markAllRead() {
    setMessages(prev => prev.map(m => ({ ...m, read: true })));
  }

  const STAGE_TABS: { key: Stage; label: string }[] = [
    { key: 'all', label: 'All Stages' },
    { key: 'return_approval', label: 'Return Approval' },
    { key: 'otp_handover', label: 'OTP Handover' },
    { key: 'inspection', label: 'Inspection' },
    { key: 'damage_assessment', label: 'Damage' },
    { key: 'refund', label: 'Refund' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 lg:px-8 xl:px-10 2xl:px-16 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="relative">
                <Inbox size={22} className="text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center leading-none">{unreadCount}</span>
                )}
              </div>
              <h1 className="text-2xl font-extrabold text-foreground">Notification Inbox</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0
                ? <><span className="font-semibold text-primary">{unreadCount} unread</span> · {messages.length} total messages</>
                : `${messages.length} messages across all rental lifecycle stages`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button suppressHydrationWarning onClick={markAllRead} className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                <CheckCheck size={15} />Mark all read
              </button>
            )}
            <Link href="/rental-return" className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">
              <RotateCcw size={14} />Rental Return
            </Link>
          </div>
        </div>

        {/* Stage Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
          {STAGE_TABS.map(tab => {
            const count = tab.key === 'all'
              ? messages.filter(m => !m.read).length
              : messages.filter(m => m.stage === tab.key && !m.read).length;
            const meta = tab.key !== 'all' ? STAGE_META[tab.key] : null;
            return (
              <button
                suppressHydrationWarning
                key={tab.key}
                onClick={() => setStage(tab.key)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${stage === tab.key ? 'gradient-green text-white border-transparent' : 'border-border text-muted-foreground bg-card hover:border-primary hover:text-primary'}`}
              >
                {meta && <meta.icon size={13} />}
                {tab.label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${stage === tab.key ? 'bg-white/20 text-white' : 'bg-danger text-white'}`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main Split Layout */}
        <div className="flex gap-4 h-[calc(100vh-320px)] min-h-[500px]">
          {/* Left: Message List */}
          <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col border border-border rounded-xl overflow-hidden bg-card">
            {/* Search + Filter Bar */}
            <div className="p-3 border-b border-border flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search messages…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <button
                suppressHydrationWarning
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'border-primary bg-secondary text-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}
              >
                <Filter size={14} />
              </button>
            </div>

            {/* Inline Filters */}
            {showFilters && (
              <div className="px-3 py-2.5 border-b border-border bg-secondary/30 flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground font-medium">Channel:</span>
                  {(['all', 'email', 'sms'] as Channel[]).map(c => (
                    <button suppressHydrationWarning key={c} onClick={() => setChannel(c)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${channel === c ? 'gradient-green text-white border-transparent' : 'border-border text-muted-foreground bg-card hover:border-primary hover:text-primary'}`}>
                      {c === 'all' ? 'All' : c === 'email' ? 'Email' : 'SMS'}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground font-medium">Role:</span>
                  {(['all', 'farmer', 'provider'] as Role[]).map(r => (
                    <button suppressHydrationWarning key={r} onClick={() => setRole(r)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${role === r ? 'gradient-green text-white border-transparent' : 'border-border text-muted-foreground bg-card hover:border-primary hover:text-primary'}`}>
                      {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message List */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center px-6">
                  <Inbox size={40} className="text-muted-foreground mb-3" />
                  <p className="font-semibold text-foreground mb-1">No messages found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                filtered.map(msg => (
                  <MessageCard
                    key={msg.id}
                    msg={msg}
                    selected={selectedId === msg.id}
                    onSelect={() => setSelectedId(msg.id)}
                    onRead={markRead}
                    onDelete={deleteMsg}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right: Message Detail */}
          <div className="hidden lg:flex flex-1 flex-col border border-border rounded-xl overflow-hidden bg-card">
            {selected ? (
              <>
                {/* Detail Header */}
                <div className="p-5 border-b border-border">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-base font-bold text-foreground leading-snug">{selected.subject}</h2>
                    <div className="flex items-center gap-2 shrink-0">
                      {!selected.read && (
                        <button suppressHydrationWarning onClick={() => markRead(selected.id)} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                          <CheckCheck size={13} />Mark read
                        </button>
                      )}
                      <button suppressHydrationWarning onClick={() => deleteMsg(selected.id)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-danger transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {selected.channel === 'email' ? <Mail size={12} /> : <MessageSquare size={12} />}
                      <span className="font-medium text-foreground">{selected.recipient}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Package size={12} />{selected.equipmentName}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Clock size={12} />{new Date(selected.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {(() => {
                      const meta = STAGE_META[selected.stage];
                      const StageIcon = meta.icon;
                      return (
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.bg} ${meta.color}`}>
                          <StageIcon size={11} />{meta.label}
                        </span>
                      );
                    })()}
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${selected.channel === 'email' ? 'bg-info-bg text-info' : 'bg-success-bg text-success'}`}>
                      {selected.channel === 'email' ? <Mail size={11} /> : <MessageSquare size={11} />}
                      {selected.channel === 'email' ? 'Email' : 'SMS'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                      <User size={11} />{selected.role.charAt(0).toUpperCase() + selected.role.slice(1)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                      Booking: {selected.bookingId}
                    </span>
                  </div>
                </div>

                {/* Message Body */}
                <div className="flex-1 overflow-y-auto p-5">
                  <div className="bg-secondary/30 rounded-xl p-5 border border-border">
                    <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">{selected.body}</pre>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-border flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Sent via KisanSetu automated notification system</p>
                  <Link href="/rental-return" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                    View Rental Return <ChevronRight size={14} />
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <Inbox size={48} className="text-muted-foreground mb-4" />
                <h3 className="font-bold text-lg text-foreground mb-2">Select a message</h3>
                <p className="text-sm text-muted-foreground">Choose a message from the list to read its full content.</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Selected message detail (below list) */}
        {selected && (
          <div className="lg:hidden mt-4 border border-border rounded-xl overflow-hidden bg-card">
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-bold text-foreground mb-2">{selected.subject}</h2>
              <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1">{selected.channel === 'email' ? <Mail size={11} /> : <MessageSquare size={11} />}{selected.recipient}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock size={11} />{new Date(selected.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(() => {
                  const meta = STAGE_META[selected.stage];
                  const StageIcon = meta.icon;
                  return (
                    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                      <StageIcon size={9} />{meta.label}
                    </span>
                  );
                })()}
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {selected.bookingId}
                </span>
              </div>
            </div>
            <div className="p-4">
              <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">{selected.body}</pre>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
