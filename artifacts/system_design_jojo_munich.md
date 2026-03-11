# System Design — jojo-in-munich

## Overview

A personal Munich city intelligence agent for one user (Johanna). Two modes: conversational chat with real-time web search, and a curated home feed. Every Claude call is filtered through a natural-language taste profile generated during onboarding.

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    Vercel (Next.js)                       │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  App Shell   │  │  Onboarding  │  │   Auth Pages   │  │
│  │  (feed/chat/ │  │  (4 chapters │  │  (magic link)  │  │
│  │   bookmarks) │  │   + synth)   │  │                │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬────────┘  │
│         │                 │                   │           │
│  ┌──────┴─────────────────┴───────────────────┴────────┐ │
│  │                   API Routes                         │ │
│  │  POST /api/chat          — streaming chat            │ │
│  │  GET  /api/feed          — feed (cached/generated)   │ │
│  │  POST /api/feed/refresh  — cron refresh (V3)         │ │
│  │  POST /api/onboarding/synthesize — profile synthesis │ │
│  │  POST /api/bookmarks     — bookmark CRUD             │ │
│  └──────┬──────────────────────────┬────────────────────┘ │
└─────────┼──────────────────────────┼─────────────────────┘
          │                          │
          ▼                          ▼
┌──────────────────┐    ┌─────────────────────────┐
│  Anthropic API   │    │       Supabase           │
│  claude-sonnet   │    │                          │
│  + web_search    │    │  auth.users (magic link) │
│                  │    │  public.users             │
│                  │    │  public.user_profile      │
│                  │    │  public.conversations     │
│                  │    │  public.messages           │
│                  │    │  public.bookmarks          │
│                  │    │  public.feed_cache         │
└──────────────────┘    └─────────────────────────┘
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout, fonts, metadata
│   ├── page.tsx                      # Landing → redirect to /feed or /onboarding
│   ├── (auth)/
│   │   ├── login/page.tsx            # Magic link login form
│   │   └── callback/route.ts        # Supabase auth callback handler
│   ├── (app)/                        # Authenticated route group
│   │   ├── layout.tsx                # App shell: bottom nav, auth guard
│   │   ├── feed/page.tsx             # Home feed
│   │   ├── chat/page.tsx             # New chat / conversation list
│   │   ├── chat/[id]/page.tsx        # Conversation thread
│   │   ├── bookmarks/page.tsx        # Saved spots
│   │   └── profile/page.tsx          # Profile view (V3: edit)
│   ├── onboarding/
│   │   ├── layout.tsx                # Progress bar layout
│   │   ├── page.tsx                  # Welcome / entry
│   │   ├── [chapter]/page.tsx        # Chapter 1-4 (dynamic route)
│   │   └── synthesis/page.tsx        # Free text + synthesis loading
│   └── api/
│       ├── chat/route.ts             # Streaming chat
│       ├── feed/route.ts             # Feed generation/cache
│       ├── feed/refresh/route.ts     # Cron endpoint (V3)
│       ├── onboarding/synthesize/route.ts
│       └── bookmarks/route.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client
│   │   ├── server.ts                 # Server Supabase client (cookies)
│   │   └── middleware.ts             # Auth middleware helper
│   ├── claude/
│   │   ├── client.ts                 # Anthropic SDK instance
│   │   └── prompts.ts                # System prompts + Munich context
│   └── types/
│       ├── database.ts               # Supabase generated types
│       └── onboarding.ts             # Onboarding answer types
├── components/
│   ├── chat/                         # ChatMessage, ChatInput, etc.
│   ├── feed/                         # FeedCard, FeedSkeleton, etc.
│   ├── onboarding/                   # QuestionCard, Slider, CategoryGrid, etc.
│   └── ui/                           # shadcn/ui primitives
└── hooks/                            # useProfile, useChat, useBookmarks, etc.
```

## Database Schema

```sql
-- Extends Supabase auth.users
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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
```

### Row Level Security

All tables use RLS scoped to `auth.uid() = user_id`. Single user, but enforced by default.

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_cache ENABLE ROW LEVEL SECURITY;

-- Example policy (apply similar to all tables)
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
```

## API Design

### POST /api/chat

Streaming chat endpoint using Vercel AI SDK.

```
Request:
  POST /api/chat
  Body: { messages: Message[], conversationId?: string }

Response:
  Content-Type: text/event-stream
  Streamed Claude response with web search results
```

Flow:
1. Authenticate via Supabase session cookie
2. Load profile_text from user_profile
3. Build system prompt (Munich context + profile_text)
4. If no conversationId, create new conversation
5. Call Claude (claude-sonnet) with web_search tool enabled
6. Stream response to client
7. On stream completion, persist messages to Supabase

### GET /api/feed

```
Request:
  GET /api/feed?category=food

Response:
  {
    items: FeedItem[],
    generatedAt: string,
    cached: boolean
  }
```

FeedItem shape:
```typescript
type FeedItem = {
  id: string;
  title: string;
  description: string;
  category: 'event' | 'opening' | 'pick' | 'tip';
  relevance: string;       // Why this fits her profile
  location?: string;
  date?: string;
  url?: string;
  neighborhood?: string;
};
```

Flow:
1. Check feed_cache for non-expired entry matching user + category
2. If cache hit → return cached items
3. If cache miss → call Claude with web_search to find Munich events/picks
4. Claude filters through profile, returns structured JSON
5. Cache results (4-hour TTL) → return

### POST /api/onboarding/synthesize

```
Request:
  POST /api/onboarding/synthesize
  Body: { answers: OnboardingAnswers }

Response:
  { profileText: string }
```

Flow:
1. Validate answers structure
2. Send to Claude with synthesis prompt
3. Claude produces 150-200 word profile_text
4. Save to user_profile (profile_text + structured fields extracted from answers)
5. Set onboarding_done = true

### POST/GET/DELETE /api/bookmarks

Standard CRUD. Bookmark extraction happens client-side from chat message metadata.

## Claude Integration

### System Prompt Pattern

Every Claude call (chat and feed) receives:

```
You are Johanna's Munich local friend...

WHO YOU'RE TALKING TO:
{profile_text}

[Mode-specific instructions: chat behavior or feed generation format]
```

### Web Search

Claude's built-in web_search tool is enabled on all calls. This provides real-time Munich information without external search API dependencies.

### Model

claude-sonnet — balances quality, speed, and cost for a single-user app.

## Onboarding Design

### State Management

Client-side React context + localStorage backup. No server persistence during flow.

```typescript
type OnboardingAnswers = {
  chapter1: {
    energyBaseline: number;
    pacePreference: 'fast' | 'slow' | 'depends';
    aestheticInstincts: string[];
    dealbreakers: string[];
  };
  chapter2: {
    socialContext: 'solo' | 'building_social' | 'with_partner' | 'mixed';
    crowdPreferences: string[];
    densityTolerance: number;
  };
  chapter3: {
    categories: Record<string, {
      active: boolean;
      frequency: 'daily' | 'weekly' | 'monthly' | 'occasionally';
      intent: string;
    }>;
  };
  chapter4: {
    scenarios: Record<string, string>;
  };
  freeText: string;
};
```

### Chapter UX

| Chapter | Theme | Input Types |
|---------|-------|-------------|
| 1 | First Principles | Sliders, multi-select chips |
| 2 | Social Context | Scenario cards, selectable options |
| 3 | Activities | Category grid → expand → frequency/intent |
| 4 | Energy Calibration | "Would you rather" scenario cards |
| Final | Free Text | Full-width text area |

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 15 (App Router) | SSR, API routes, streaming, Vercel native |
| Hosting | Vercel | Zero-config Next.js deployment |
| Database | Supabase (Postgres) | Auth + DB in one, magic link support |
| Auth | Supabase magic link | No password, email-only, simple |
| AI | Anthropic Claude (claude-sonnet) | Web search tool, streaming, profile-aware |
| AI SDK | Vercel AI SDK (@ai-sdk/anthropic) | useChat() hook, streaming helpers |
| Styling | Tailwind CSS + shadcn/ui | Mobile-first, rapid UI development |
| Icons | Lucide React | Consistent, tree-shakeable |
| Linting | Biome | Per tech strategy |
| Package Manager | pnpm | Per tech strategy |

## Implementation Phases

### Phase 1: Foundation
- Next.js scaffolding + Tailwind + shadcn/ui
- Supabase project + schema migration
- Auth flow (magic link → callback → session)
- Auth middleware + route protection
- Vercel deployment

### Phase 2: Onboarding (Critical Path)
- 4-chapter question flow
- Client-side state management
- Profile synthesis API endpoint
- Claude synthesis prompt
- Redirect to app after completion

### Phase 3: Chat
- Chat UI (mobile-optimized, streaming)
- Claude integration with profile + web search
- Conversation persistence
- Conversation list/history

### Phase 4: Bookmarks
- Bookmark extraction from chat
- Bookmark CRUD
- Bookmarks page

### Phase 5: Feed (V2)
- Feed page with cards
- On-demand Claude generation
- Feed caching
- Category filters

### Phase 6: Polish (V3)
- Scheduled feed refresh (Vercel Cron)
- Profile editing
- Neighborhood filter
- Explore/browse tab

## Non-Functional Requirements

| Concern | Approach |
|---------|----------|
| Performance | Streaming responses, feed caching, Vercel edge |
| Security | RLS on all tables, auth middleware, no secrets in client |
| Mobile | Mobile-first responsive design, touch-optimized |
| Cost | Single user = minimal: Supabase free tier, Vercel free tier, Claude pay-per-use |
| Reliability | Supabase managed Postgres, Vercel managed infra |
