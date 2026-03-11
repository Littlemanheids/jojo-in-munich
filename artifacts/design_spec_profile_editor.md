# Design Spec: Profile Editor

## Overview

Transform the read-only profile page into an editable taste profile hub. Users can adjust all onboarding preferences, add a neighborhood, and re-synthesize their AI profile.

## Layout (Mobile-First, 430px max)

```
┌─────────────────────────────────┐
│  Your Taste Profile             │  ← Display font, 28px
│  ─────────────────              │
│                                 │
│  ┌─────────────────────────────┐│
│  │ "You're a slow-morning..."  ││  ← AI profile text card
│  │                             ││     bg-card, 14px body
│  │            Regenerate ↻     ││  ← subtle button, bottom-right
│  └─────────────────────────────┘│
│                                 │
│  PREFERENCES                    │  ← Section label, uppercase, 11px
│                                 │
│  ┌ Energy & Pace ──────── ▾ ──┐│  ← Collapsible section
│  │ [slider: 1─────●────5]     ││
│  │ [pace cards: Full/Flow/..] ││
│  └────────────────────────────┘│
│                                 │
│  ┌ Your Aesthetic ──────── ▾ ─┐│
│  │ [chips: minimal, cozy...]  ││
│  └────────────────────────────┘│
│                                 │
│  ┌ Dealbreakers ────────── ▾ ─┐│
│  │ [chips: tourist traps...]  ││
│  └────────────────────────────┘│
│                                 │
│  ┌ Social Scene ────────── ▾ ─┐│
│  │ [option cards]             ││
│  │ [crowd chips]              ││
│  └────────────────────────────┘│
│                                 │
│  ┌ Activities ─────────── ▾ ──┐│
│  │ [activity grid]            ││
│  └────────────────────────────┘│
│                                 │
│  ┌ Scenarios ──────────── ▾ ──┐│
│  │ [scenario cards per Q]     ││
│  └────────────────────────────┘│
│                                 │
│  NEIGHBORHOOD                   │  ← Section label
│  ┌────────────────────────────┐│
│  │ [chip grid of Munich       ││
│  │  neighborhoods]            ││
│  └────────────────────────────┘│
│                                 │
│  ┌────────────────────────────┐│
│  │  Anything else?            ││  ← Free text textarea
│  └────────────────────────────┘│
│                                 │
│  ┌════════════════════════════┐│
│  ║   Update my profile        ║│  ← Primary CTA, fixed bottom
│  └════════════════════════════┘│     Shows only when dirty
│                                 │
│  Sign out                       │  ← Subtle link, bottom
│                                 │
└─────────────────────────────────┘
```

## Component Specifications

### Header
- Title: "Your Taste Profile" — Cormorant Garamond, 28px, weight 400
- No subtitle; the profile text speaks for itself
- Padding: 48px top, 28px horizontal

### Profile Text Card
- Background: var(--bg-card)
- Border: 1.5px solid var(--border-light)
- Border-radius: 14px
- Padding: 20px
- Text: 14px DM Sans, var(--ink), line-height 1.7
- "Regenerate" button: 12px, var(--ink-muted), bottom-right, with ↻ icon

### Collapsible Sections
- Section header: DM Sans 15px, weight 500, var(--ink)
- Chevron indicator: rotates 180° on expand (framer-motion)
- Border-bottom: 1px solid var(--border-light) when collapsed
- Content padding: 16px 0
- Animate expand/collapse with height transition
- Default state: ALL COLLAPSED (user opens what they want to edit)

### Neighborhood Selector
- Chip grid (same style as ChipSelect)
- Munich neighborhoods: Schwabing, Maxvorstadt, Glockenbachviertel, Haidhausen, Isarvorstadt, Sendling, Neuhausen, Au-Haidhausen, Lehel, Altstadt
- Multi-select (user may frequent multiple neighborhoods)
- "+ somewhere else" custom input option

### Update Button
- Full-width, 52px height
- Background: var(--ink), text: var(--bg)
- Border-radius: 12px
- Only visible when answers have been modified (dirty state)
- Sticky to bottom of scroll area (not fixed — scrolls into view)
- Loading state: "Updating..." with subtle pulse

### Sign Out
- Text button, 14px, var(--ink-muted), underline
- Below the update button, 24px margin
- Centered

## Interaction Patterns

1. **Load**: Page fetches profile + onboarding_answers from server
2. **Browse**: User scrolls, all sections collapsed by default
3. **Edit**: Tap section header → expands with animation → edit with same components as onboarding
4. **Dirty detection**: Compare current answers to saved answers → show "Update" button
5. **Save**: Tap "Update my profile" → loading state → re-synthesis API → success toast → profile text updates
6. **Regenerate**: Tap "Regenerate" on profile card → re-runs synthesis with CURRENT saved answers (no edits needed)

## Accessibility

- All sections keyboard-navigable (Enter/Space to toggle)
- aria-expanded on collapsible headers
- Focus management: expanding a section focuses the first interactive element
- Color contrast: all text meets WCAG 2.1 AA (verified against design tokens)
- Touch targets: minimum 44px

## Responsive Notes

- Max-width: 430px (matches onboarding flow)
- Centered on larger screens
- No layout changes needed — mobile-first is the primary target
