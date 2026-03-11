-- Initial schema for jojo-in-munich
-- Run this in Supabase SQL Editor or via CLI

-- Users table (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profile with taste data
CREATE TABLE public.user_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  profile_text TEXT,
  energy_level SMALLINT CHECK (energy_level BETWEEN 1 AND 5),
  social_context TEXT CHECK (social_context IN ('solo', 'building_social', 'with_partner', 'mixed')),
  penalty_flags TEXT[] DEFAULT '{}',
  active_categories TEXT[] DEFAULT '{}',
  home_neighborhood TEXT,
  onboarding_done BOOLEAN DEFAULT FALSE,
  onboarding_answers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookmarked spots
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id),
  name TEXT NOT NULL,
  category TEXT,
  address TEXT,
  notes TEXT,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cached feed items
CREATE TABLE public.feed_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  category TEXT DEFAULT 'all',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX idx_feed_cache_user ON public.feed_cache(user_id, category, generated_at DESC);
CREATE INDEX idx_bookmarks_user ON public.bookmarks(user_id, created_at DESC);
CREATE INDEX idx_conversations_user ON public.conversations(user_id, updated_at DESC);

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own data" ON public.users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own profile" ON public.user_profile
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own conversations" ON public.conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own messages" ON public.messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own feed cache" ON public.feed_cache
  FOR ALL USING (auth.uid() = user_id);

-- Auto-create user record + profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO public.user_profile (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
