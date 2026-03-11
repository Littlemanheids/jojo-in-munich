# ADR — Architecture Decisions for jojo-in-munich

**Date**: 2026-03-11
**Status**: Proposed
**Author**: Architect

---

## ADR-001: Vercel AI SDK for Claude Integration

**Context**: Need streaming chat responses with Claude. Options: raw Anthropic SDK or Vercel AI SDK (@ai-sdk/anthropic).

**Decision**: Vercel AI SDK with @ai-sdk/anthropic provider.

**Trade-offs**:
| Factor | Vercel AI SDK | Raw Anthropic SDK |
|--------|--------------|-------------------|
| Streaming | Built-in useChat() hook | Manual SSE handling |
| Boilerplate | Minimal | Significant |
| Tool support | Supported | Native |
| Lock-in | Vercel ecosystem | None |
| Flexibility | Adapter constraints | Full control |

**Rationale**: useChat() eliminates ~200 lines of streaming + state management code on the client. Single user app — vendor lock-in risk is negligible. If web_search tool has adapter issues, we fall back to raw SDK for that route only.

---

## ADR-002: Client-Side Onboarding State

**Context**: Onboarding is 4 chapters (~8-10 min). Need to manage state across chapters.

**Decision**: React context + localStorage backup. No server persistence during onboarding.

**Trade-offs**:
| Factor | Client-only | Server-persisted |
|--------|-------------|------------------|
| Complexity | Low | Medium |
| Resume on crash | localStorage only | Full resume |
| Network calls | Zero during flow | Per-chapter saves |
| Speed | Instant transitions | Network latency |

**Rationale**: Single user, short flow. localStorage provides adequate crash recovery. Server persistence adds complexity for minimal benefit. The synthesis call at the end is the only server interaction.

---

## ADR-003: Feed Caching Strategy

**Context**: Feed generation requires multiple Claude web searches — slow and expensive. Need caching.

**Decision**: Supabase-backed cache with 4-hour TTL. On-demand generation in V1, cron pre-generation in V3.

**Trade-offs**:
| Factor | On-demand + cache | Cron only | No cache |
|--------|-------------------|-----------|----------|
| First load | Slow (generation) | Fast (pre-cached) | Always slow |
| Freshness | 4h stale max | Depends on cron | Always fresh |
| Complexity | Low | Medium (cron setup) | Lowest |
| Cost | Pay per view (cached) | Fixed schedule | Pay per view |

**Rationale**: On-demand with cache is the simplest V1 approach. First load is slow but subsequent loads are instant. Cron adds marginal value for a single user and can be layered on later.

---

## ADR-004: Profile as Natural Language (No Scoring Algorithm)

**Context**: Need to match recommendations to user preferences. Options: scoring algorithm or Claude reasoning from prose.

**Decision**: Claude synthesizes a 150-200 word profile_text from onboarding answers. This prose blob is injected into every system prompt. No numeric scoring.

**Trade-offs**:
| Factor | Profile prose | Scoring algorithm |
|--------|--------------|-------------------|
| Flexibility | Captures nuance | Rigid categories |
| Accuracy | Claude reasons holistically | Deterministic match |
| Debuggability | Read the prose | Check the scores |
| Maintenance | Zero code | Algorithm updates |
| Cost | Adds ~200 tokens per call | Zero per call |

**Rationale**: This is the core product insight. Claude is better at reasoning about "she likes minimal Scandinavian-feeling cafes but wants to find the underground scene" than a scoring system is. 200 extra tokens per call is negligible cost for single user.

---

## ADR-005: Supabase for Auth + Database

**Context**: Need auth (magic link) and a database. Options: Supabase, separate auth (NextAuth) + separate DB, Firebase.

**Decision**: Supabase for both auth and database.

**Trade-offs**:
| Factor | Supabase | NextAuth + separate DB | Firebase |
|--------|----------|----------------------|----------|
| Magic link | Built-in | Plugin needed | Built-in |
| Postgres | Native | Separate setup | No (Firestore) |
| RLS | Native | Manual middleware | Security rules |
| Cost (single user) | Free tier | Depends on DB | Free tier |
| Type generation | supabase gen types | Manual | Manual |

**Rationale**: Magic link auth + Postgres in one managed service. Free tier is more than sufficient for single user. Type generation from schema keeps TypeScript types in sync. RLS provides defense-in-depth even though we only have one user.

---

## ADR-006: Mobile-First with Bottom Navigation

**Context**: Primary usage is on phone. Need mobile-optimized layout.

**Decision**: Mobile-first responsive design. Bottom navigation bar with 4 tabs: Feed, Chat, Bookmarks, Profile. No hamburger menu.

**Rationale**: Bottom nav is the standard mobile pattern. Four tabs map to the four core features. No need for desktop optimization — single user, phone-primary. Responsive enough to work on tablet/desktop but not designed for it.

---

## ADR-007: shadcn/ui for Component Library

**Context**: Need polished UI components quickly. Options: shadcn/ui, Radix primitives, Material UI, custom.

**Decision**: shadcn/ui (copy-paste components built on Radix + Tailwind).

**Rationale**: Components are owned (not a dependency), fully customizable, Tailwind-native. Perfect for a project where we want polished defaults but need to customize for the onboarding experience. No version lock-in — components live in our codebase.
