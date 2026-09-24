-- ============================================================
-- KisanSetu Messaging Module
-- Timestamp: 20260924220000
-- ============================================================

-- 1. Conversations table (one per buyer+provider+listing combo)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  listing_type TEXT NOT NULL DEFAULT 'equipment' CHECK (listing_type IN ('equipment', 'labour')),
  listing_id TEXT NOT NULL,
  listing_name TEXT NOT NULL DEFAULT '',
  listing_image TEXT NOT NULL DEFAULT '',
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  last_message TEXT NOT NULL DEFAULT '',
  last_message_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  buyer_unread_count INTEGER NOT NULL DEFAULT 0,
  provider_unread_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_provider_id ON public.conversations(provider_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing ON public.conversations(listing_type, listing_id);
CREATE INDEX IF NOT EXISTS idx_conversations_booking_id ON public.conversations(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Unique conversation per buyer+provider+listing
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique
  ON public.conversations(buyer_id, provider_id, listing_type, listing_id);

-- 4. Function: update conversation on new message
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conv RECORD;
BEGIN
  SELECT buyer_id, provider_id INTO conv
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  UPDATE public.conversations
  SET
    last_message = LEFT(NEW.content, 100),
    last_message_at = NEW.created_at,
    buyer_unread_count = CASE
      WHEN NEW.sender_id = conv.provider_id THEN buyer_unread_count + 1
      ELSE buyer_unread_count
    END,
    provider_unread_count = CASE
      WHEN NEW.sender_id = conv.buyer_id THEN provider_unread_count + 1
      ELSE provider_unread_count
    END,
    updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$;

-- 5. Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for conversations
DROP POLICY IF EXISTS "conversations_participant_select" ON public.conversations;
CREATE POLICY "conversations_participant_select"
ON public.conversations
FOR SELECT
TO authenticated
USING (buyer_id = auth.uid() OR provider_id = auth.uid());

DROP POLICY IF EXISTS "conversations_buyer_insert" ON public.conversations;
CREATE POLICY "conversations_buyer_insert"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (buyer_id = auth.uid() OR provider_id = auth.uid());

DROP POLICY IF EXISTS "conversations_participant_update" ON public.conversations;
CREATE POLICY "conversations_participant_update"
ON public.conversations
FOR UPDATE
TO authenticated
USING (buyer_id = auth.uid() OR provider_id = auth.uid())
WITH CHECK (buyer_id = auth.uid() OR provider_id = auth.uid());

-- 7. RLS Policies for messages
DROP POLICY IF EXISTS "messages_participant_select" ON public.messages;
CREATE POLICY "messages_participant_select"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.buyer_id = auth.uid() OR c.provider_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "messages_participant_insert" ON public.messages;
CREATE POLICY "messages_participant_insert"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.buyer_id = auth.uid() OR c.provider_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "messages_participant_update" ON public.messages;
CREATE POLICY "messages_participant_update"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.buyer_id = auth.uid() OR c.provider_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.buyer_id = auth.uid() OR c.provider_id = auth.uid())
  )
);

-- 8. Trigger: auto-update conversation on new message
DROP TRIGGER IF EXISTS on_message_inserted ON public.messages;
CREATE TRIGGER on_message_inserted
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_message();
