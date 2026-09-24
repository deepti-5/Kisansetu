'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, MessageCircle, Loader2, ChevronLeft, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingType: 'equipment' | 'labour';
  listingId: string;
  listingName: string;
  listingImage?: string;
  providerId: string;
  providerName: string;
  bookingId?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  buyer_id: string;
  provider_id: string;
  listing_type: string;
  listing_id: string;
  listing_name: string;
  last_message: string;
  last_message_at: string;
}

export default function MessagingModal({
  isOpen,
  onClose,
  listingType,
  listingId,
  listingName,
  listingImage = '',
  providerId,
  providerName,
  bookingId,
}: MessagingModalProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  // Get or create conversation
  const initConversation = useCallback(async () => {
    if (!user || !isOpen) return;
    setLoading(true);
    setError('');

    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('*')
        .eq('buyer_id', user.id)
        .eq('provider_id', providerId)
        .eq('listing_type', listingType)
        .eq('listing_id', listingId)
        .maybeSingle();

      let conv = existing;

      if (!conv) {
        // Create new conversation
        const { data: created, error: createErr } = await supabase
          .from('conversations')
          .insert({
            buyer_id: user.id,
            provider_id: providerId,
            listing_type: listingType,
            listing_id: listingId,
            listing_name: listingName,
            listing_image: listingImage,
            booking_id: bookingId || null,
          })
          .select()
          .single();

        if (createErr) throw createErr;
        conv = created;
      }

      setConversation(conv);

      // Load messages
      const { data: msgs, error: msgsErr } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });

      if (msgsErr) throw msgsErr;
      setMessages(msgs || []);

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conv.id)
        .neq('sender_id', user.id);

      // Reset unread count for current user
      if (user.id === conv.buyer_id) {
        await supabase
          .from('conversations')
          .update({ buyer_unread_count: 0 })
          .eq('id', conv.id);
      } else {
        await supabase
          .from('conversations')
          .update({ provider_unread_count: 0 })
          .eq('id', conv.id);
      }

      // Subscribe to real-time messages
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      channelRef.current = supabase
        .channel(`messages:${conv.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conv.id}`,
          },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages((prev) => {
              if (prev.find((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
            // Mark as read if from other party
            if (newMsg.sender_id !== user.id) {
              supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', newMsg.id)
                .then(() => {});
            }
          }
        )
        .subscribe();
    } catch (err: any) {
      setError(err.message || 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [user, isOpen, providerId, listingType, listingId, listingName, listingImage, bookingId, supabase]);

  useEffect(() => {
    if (isOpen && user) {
      initConversation();
    }
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isOpen, user]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation || !user || sending) return;
    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const { error: sendErr } = await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        content,
        message_type: 'text',
      });
      if (sendErr) throw sendErr;
    } catch (err: any) {
      setError('Failed to send message');
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: Message[] }[] = [];
  messages.forEach((msg) => {
    const date = formatDate(msg.created_at);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === date) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date, msgs: [msg] });
    }
  });

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50">
        <div className="bg-card rounded-2xl shadow-modal p-8 max-w-sm w-full text-center">
          <MessageCircle size={40} className="text-primary mx-auto mb-4" />
          <h3 className="font-bold text-lg text-foreground mb-2">Sign in to Message</h3>
          <p className="text-sm text-muted-foreground mb-4">Please sign in to contact the provider.</p>
          <button onClick={onClose} className="btn-primary w-full py-3">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
      <div className="bg-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-modal flex flex-col h-[90vh] sm:h-[600px] fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border shrink-0">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-foreground truncate">{providerName}</p>
            <p className="text-xs text-muted-foreground truncate">{listingName}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-success bg-success/10 px-2 py-1 rounded-full shrink-0">
            <Shield size={11} />
            <span>Protected</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Privacy notice */}
        <div className="px-4 py-2 bg-primary/5 border-b border-border shrink-0">
          <p className="text-xs text-primary text-center">
            🔒 Phone numbers are hidden. Communicate safely through KisanSetu.
          </p>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={28} className="text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <p className="text-sm text-danger">{error}</p>
              <button onClick={initConversation} className="btn-primary px-4 py-2 text-sm">Retry</button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle size={28} className="text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Start the conversation</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ask about {listingName} — no phone number needed
                </p>
              </div>
              {/* Quick starters */}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {[
                  `Is ${listingName} available?`,
                  'What is the delivery charge?',
                  'Can I see more photos?',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => setNewMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            groupedMessages.map((group) => (
              <div key={group.date}>
                <div className="flex items-center gap-2 my-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground px-2">{group.date}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                {group.msgs.map((msg) => {
                  const isMine = msg.sender_id === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex mb-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMine
                            ? 'bg-primary text-white rounded-br-sm' :'bg-muted text-foreground rounded-bl-sm'
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        <p
                          className={`text-[10px] mt-1 text-right ${
                            isMine ? 'text-white/70' : 'text-muted-foreground'
                          }`}
                        >
                          {formatTime(msg.created_at)}
                          {isMine && (
                            <span className="ml-1">{msg.is_read ? '✓✓' : '✓'}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="px-4 py-3 border-t border-border shrink-0">
          {error && !loading && (
            <p className="text-xs text-danger mb-2">{error}</p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-24"
              style={{ minHeight: '44px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending || loading}
              className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
