'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { MessageCircle, ChevronRight, Loader2, Search, Package, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import MessagingModal from '@/components/MessagingModal';

interface Conversation {
  id: string;
  buyer_id: string;
  provider_id: string;
  listing_type: string;
  listing_id: string;
  listing_name: string;
  listing_image: string;
  booking_id: string | null;
  last_message: string;
  last_message_at: string;
  buyer_unread_count: number;
  provider_unread_count: number;
  created_at: string;
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [otherPartyNames, setOtherPartyNames] = useState<Record<string, string>>({});

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`buyer_id.eq.${user.id},provider_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);

      // Load names for other parties
      const otherIds = (data || []).map((c: Conversation) =>
        c.buyer_id === user.id ? c.provider_id : c.buyer_id
      );
      const uniqueIds = [...new Set(otherIds)];
      if (uniqueIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .in('id', uniqueIds);
        const nameMap: Record<string, string> = {};
        (profiles || []).forEach((p: any) => {
          nameMap[p.id] = p.full_name || 'Unknown User';
        });
        setOtherPartyNames(nameMap);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) loadConversations();
  }, [user, loadConversations]);

  // Real-time subscription for conversation updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('conversations_inbox')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => loadConversations()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, supabase, loadConversations]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getUnreadCount = (conv: Conversation) => {
    if (!user) return 0;
    return conv.buyer_id === user.id ? conv.buyer_unread_count : conv.provider_unread_count;
  };

  const getOtherPartyName = (conv: Conversation) => {
    if (!user) return 'Unknown';
    const otherId = conv.buyer_id === user.id ? conv.provider_id : conv.buyer_id;
    return otherPartyNames[otherId] || 'Unknown User';
  };

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.listing_name.toLowerCase().includes(q) ||
      getOtherPartyName(c).toLowerCase().includes(q)
    );
  });

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
          <MessageCircle size={48} className="text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Your Messages</h1>
          <p className="text-muted-foreground mb-6">Sign in to view your conversations with equipment and labour providers.</p>
          <Link href="/sign-up-login-screen" className="btn-primary px-8 py-3 rounded-xl font-semibold">Sign In</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Page header */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">Messages</span>
        </div>

        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-extrabold text-foreground">Messages</h1>
          {conversations.length > 0 && (
            <span className="text-sm text-muted-foreground">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Search */}
        {conversations.length > 0 && (
          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}

        {/* Conversations list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={32} className="text-primary" />
            </div>
            <h2 className="font-bold text-lg text-foreground mb-2">
              {search ? 'No results found' : 'No messages yet'}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {search
                ? 'Try a different search term'
                : 'Start a conversation from any equipment or labour listing page'}
            </p>
            {!search && (
              <div className="flex gap-3 justify-center">
                <Link href="/equipment-listing-page" className="btn-primary px-5 py-2.5 text-sm rounded-xl flex items-center gap-2">
                  <Package size={16} /> Browse Equipment
                </Link>
                <Link href="/labour" className="btn-secondary px-5 py-2.5 text-sm rounded-xl flex items-center gap-2">
                  <Users size={16} /> Browse Labour
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((conv) => {
              const unread = getUnreadCount(conv);
              const otherName = getOtherPartyName(conv);
              const isProvider = conv.provider_id === user.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className="w-full bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-primary/30 hover:bg-primary/5 transition-all text-left"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 relative">
                    {conv.listing_image ? (
                      <img src={conv.listing_image} alt={conv.listing_name} className="w-full h-full object-cover rounded-xl" />
                    ) : conv.listing_type === 'equipment' ? (
                      <Package size={22} className="text-primary" />
                    ) : (
                      <Users size={22} className="text-primary" />
                    )}
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className={`text-sm font-semibold truncate ${unread > 0 ? 'text-foreground' : 'text-foreground'}`}>
                        {otherName}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">{formatTime(conv.last_message_at)}</span>
                    </div>
                    <p className="text-xs text-primary font-medium truncate mb-0.5">{conv.listing_name}</p>
                    <p className={`text-xs truncate ${unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {conv.last_message || 'Start the conversation'}
                    </p>
                  </div>

                  {/* Role badge */}
                  <div className="shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isProvider ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
                      {isProvider ? 'Provider' : 'Buyer'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Open conversation modal */}
      {activeConv && user && (
        <MessagingModal
          isOpen={true}
          onClose={() => {
            setActiveConv(null);
            loadConversations();
          }}
          listingType={activeConv.listing_type as 'equipment' | 'labour'}
          listingId={activeConv.listing_id}
          listingName={activeConv.listing_name}
          listingImage={activeConv.listing_image}
          providerId={activeConv.provider_id}
          providerName={
            activeConv.provider_id === user.id
              ? 'You (Provider)'
              : otherPartyNames[activeConv.provider_id] || 'Provider'
          }
          bookingId={activeConv.booking_id || undefined}
        />
      )}

      <Footer />
    </div>
  );
}
