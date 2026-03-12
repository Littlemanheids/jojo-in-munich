-- Feed feedback: stores love/dismiss reactions on feed items
-- Items are ephemeral (generated per session), so we denormalize key fields
-- for use in Phase B prompt injection.

CREATE TABLE public.feed_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_title TEXT NOT NULL,
  item_category TEXT,
  item_neighborhood TEXT,
  item_description TEXT,
  reaction TEXT NOT NULL CHECK (reaction IN ('love', 'dismiss')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.feed_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own feedback"
  ON public.feed_feedback FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_feed_feedback_user
  ON public.feed_feedback(user_id, created_at DESC);
