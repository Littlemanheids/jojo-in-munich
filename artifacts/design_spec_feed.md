# Design Spec — Phase 5: Feed

## Overview

Personalized Munich feed powered by Claude + web search. Shows 6-10 curated items (events, new openings, picks, tips) filtered through Johanna's taste profile. Results cached for 4 hours to balance freshness and cost.

## API Design

### GET /api/feed

Query params:
- `refresh=true` — bypass cache, force regeneration

Response:
```json
{
  "items": FeedItem[],
  "generatedAt": "2026-03-11T14:00:00Z",
  "cached": true
}
```

FeedItem shape (matches existing `buildFeedSystemPrompt` output):
```typescript
type FeedItem = {
  id: string;           // generated client-side or via crypto.randomUUID()
  title: string;
  description: string;
  category: "event" | "opening" | "pick" | "tip";
  relevance: string;
  location?: string;
  neighborhood?: string;
  date?: string;
  url?: string;
};
```

### Flow

1. Auth check → 401 if unauthenticated
2. Fetch `profile_text` → 400 if missing ("Complete onboarding first")
3. Unless `?refresh=true`: check `feed_cache` for `user_id + category='all'` where `expires_at > now()`
4. Cache hit → return `{ items, generatedAt, cached: true }`
5. Cache miss → call Claude via `generateText()` with `buildFeedSystemPrompt(profileText)`
   - Enable web search tool for current Munich data
   - Parse JSON response (handle markdown fence wrapping)
   - Add `id` field to each item (crypto.randomUUID)
6. Insert into `feed_cache`: `{ user_id, items, category: 'all', generated_at: now, expires_at: now + 4hrs }`
7. Return `{ items, generatedAt, cached: false }`

### Error Handling

| Scenario | Status | Response |
|----------|--------|----------|
| Not authenticated | 401 | `{ error: "Unauthorized" }` |
| No profile | 400 | `{ error: "Complete onboarding first" }` |
| Claude call fails | 500 | `{ error: "Failed to generate feed" }` |
| JSON parse fails | 500 | `{ error: "Failed to parse feed data" }` |
| Cache write fails | — | Log, still return items (non-critical) |

### Cache Strategy

- **Single generation** for category "all" — Claude produces mixed categories in one call
- **Client-side filtering** via category chips — no separate Claude calls per category
- **4-hour TTL** — balances freshness (events change daily) vs cost (one Claude call per refresh)
- **Manual refresh** via `?refresh=true` — deletes old cache entry, generates fresh

## UI Design

### Feed Page

Container: `maxWidth: 430px`, `margin: 0 auto`, `padding: 52px 20px 100px` (matches bookmarks page pattern).

**Header row** (flex, space-between, like Chat page):
- Left: "Your Munich" — Cormorant 28px, weight 400, `var(--ink)`
- Right: Refresh button — 40x40, borderRadius 10, `bg: var(--ink)`, `color: var(--bg)`, contains RefreshCw icon (18px). Same size/shape as Chat's "+" button. `aria-label="Refresh feed"`. During refresh: icon spins via CSS animation.

**Category filter chips** (horizontal flex row, gap 8, marginTop 16, marginBottom 6):
- Options: All / Events / Openings / Picks / Tips
- Active chip: `background: var(--ink)`, `color: var(--bg)`, borderRadius 20, padding `8px 16px`, fontSize 13, fontWeight 500
- Inactive chip: `background: transparent`, `border: 1.5px solid var(--border)`, `color: var(--ink-muted)`, borderRadius 20, padding `8px 16px`, fontSize 13, fontWeight 500
- Touch target: chips are ~36px effective height (adequate for mobile)
- Filtering is instant (client-side from cached items)

**Freshness indicator** (below chips, marginBottom 16):
- "Updated X ago" — fontSize 12, `var(--ink-muted)`, subtle and non-intrusive

**Feed cards list:**
- Staggered entrance: `staggerContainer` + `staggerItem` (from animations.ts)
- Gap: 12px between cards
- Loading state: 3 skeleton cards with pulse animation
- Two-phase loading text (manages perception of 10-30s generation):
  - Phase 1 (0-3s): "Loading your feed..."
  - Phase 2 (3s+): "Searching Munich for you..."
- Filter empty state: category-matching icon + "No [category] items in this batch" + "Try refreshing or check back later" (13px, ink-muted)
- Global empty state (no items at all): same pattern as bookmarks empty state — centered icon + message

### Feed Card Component

```
┌─────────────────────────────────┐
│ Title of the Place or Event     │
│ [category chip]                 │
│                                 │
│ 2-3 line description in muted  │
│ text about what this is...      │
│                                 │
│ Why it fits you (accent, italic)│
│                                 │
│ 📍 Location · Neighborhood      │
│ 📅 Date             Visit ↗    │
└─────────────────────────────────┘
```

- Background: `var(--bg-card)`, borderRadius 14, padding `16px 16px 14px`
- **Title** (first — primary scan target): DM Sans 15px, weight 500, `var(--ink)`, lineHeight 1.3
- **Category chip** (below title, marginTop 6): colored chip, same palette as bookmark-card.tsx
  - event: `#7B7BA0`, opening: `#D4764E`, pick: `#6B8E6B`, tip: `#B8926A`
  - fontSize 11, fontWeight 500, padding `3px 10px`, borderRadius 20, textTransform capitalize
  - Background: `${color}18` (9.4% opacity tint)
- **Description**: fontSize 14, `var(--ink-muted)`, lineHeight 1.5, marginTop 10
- **Relevance**: fontSize 13, `var(--accent)`, fontStyle italic, marginTop 8. No emoji prefix — accent color is sufficient differentiation. Clean Warm Nordic.
- **Location row** (if location or neighborhood present): MapPin icon 12px + text 13px `var(--ink-muted)`, marginTop 8, flex row, gap 5
  - Format: "Location · Neighborhood" or just one if the other is missing
- **Bottom row** (flex, space-between, alignItems center, marginTop 6):
  - Left: Calendar icon 12px + date text 12px `var(--ink-muted)` (only if date present)
  - Right: If `url` present, small "Visit" link — ExternalLink icon 12px + "Visit" text 12px, `var(--accent)`, cursor pointer. Opens in new tab. NOT entire card as link (avoids accidental taps on mobile, matches card-as-container pattern from bookmarks).

### Loading Skeleton

3 placeholder cards matching card dimensions (bg-card, borderRadius 14, padding 16px):
- Rounded rect for title (70% width, 16px height)
- Rounded rect for category chip (48x20, marginTop 8)
- 2 rounded rects for description lines (100% + 60%, 12px height, marginTop 12, gap 8)
- All skeleton rects: `var(--border-light)` background, borderRadius 6
- Pulse animation via CSS `@keyframes skeleton-pulse` (opacity 0.4 → 1 → 0.4, 1.5s ease infinite)

### Accessibility

- Refresh button: `aria-label="Refresh feed"`
- Filter chips: `role="tablist"` on container, `role="tab"` + `aria-selected` on each chip
- Feed cards: semantic structure with heading for title
- Visit links: `target="_blank"` + `rel="noopener noreferrer"`
- All text colors pass WCAG AA contrast (ink on bg, ink-muted on bg, accent on bg-card)
- Category chip colors: same as bookmark-card (already in production, verified)

## Files

| File | Action | Purpose |
|------|--------|---------|
| `src/app/api/feed/route.ts` | Create | GET endpoint with cache + Claude |
| `src/components/feed/feed-card.tsx` | Create | Individual feed item card |
| `src/app/(app)/feed/page.tsx` | Modify | Replace placeholder with full UI |

## Implementation Order

| Step | What | Commit |
|------|------|--------|
| 1 | `src/app/api/feed/route.ts` — GET with cache + generation | commit + push |
| 2 | `src/components/feed/feed-card.tsx` + `src/app/(app)/feed/page.tsx` | commit + push |

## Open Questions for Builder

1. **Web search with Vercel AI SDK**: Check how `@ai-sdk/anthropic` exposes Anthropic's web search tool. May need `providerOptions` or direct Anthropic SDK fallback.
2. **Generation time**: Web search + Claude can take 10-30s. The skeleton loading UX must feel responsive — consider a progress hint message.

## Verification

1. `npx pnpm run lint:fix` — no new errors in feed files
2. `npx pnpm run build` — succeeds
3. Test: load /feed → skeleton → cards appear with mixed categories
4. Test: tap category chip → instant filter
5. Test: tap refresh → skeleton → fresh cards
6. Test: reload page within 4hrs → instant load (cached)
7. Test: empty onboarding → shows "Complete onboarding first" or redirect
