# Wix Enter Exam Prep

**Exam date:** June 11, 2026 (2.5 hours, on-site at Wix Campus)
**Format:**
- Part I — Independent coding/DS&A, no AI (use JS)
- Part II — Dive into a React + Node.js app, AI-assisted, fix bugs or add features

**Focus for Part II:** Practice navigating this codebase with Claude Code, making targeted changes end-to-end (API → component → UI), and staying in the driver's seat.

---

## Progress

| # | Type | Difficulty | Task | Status |
|---|------|------------|------|--------|
| 1 | Bug | Easy | [Fix: remove item has no error recovery](#1-fix-remove-item-has-no-error-recovery) | ⬜ Not started |
| 2 | Feature | Easy | [Add "Sort by Rating" to watchlist sidebar](#2-add-sort-by-rating-to-watchlist-sidebar) | ⬜ Not started |
| 3 | Feature | Easy | [Add title search filter to watchlist sidebar](#3-add-title-search-filter-to-watchlist-sidebar) | ⬜ Not started |
| 4 | Feature | Easy | [Add notes field to watchlist items](#4-add-notes-field-to-watchlist-items) | ⬜ Not started |
| 5 | Bug | Medium | [Fix: stats monthly activity uses wrong date field](#5-fix-stats-monthly-activity-uses-wrong-date-field) | ⬜ Not started |
| 6 | Feature | Medium | [Add PATCH route for watchlist item updates](#6-add-patch-route-for-watchlist-item-updates) | ⬜ Not started |
| 7 | Feature | Medium | [Add toast notifications for add/remove actions](#7-add-toast-notifications-for-addremove-actions) | ⬜ Not started |
| 8 | Feature | Medium | [Add "Most Watched Genre" callout to stats page](#8-add-most-watched-genre-callout-to-stats-page) | ⬜ Not started |
| 9 | Feature | Hard | [Add watchlist item count badge to navbar](#9-add-watchlist-item-count-badge-to-navbar) | ⬜ Not started |
| 10 | Feature | Hard | [Add a "Recently Watched" section to home page](#10-add-a-recently-watched-section-to-home-page) | ⬜ Not started |
| 11 | Feature | Hard | [Add pagination to watchlist sidebar](#11-add-pagination-to-watchlist-sidebar) | ⬜ Not started |

**Legend:** ⬜ Not started · 🟡 In progress · ✅ Done

---

## Exercises

### 1. Fix: remove item has no error recovery
**Type:** Bug fix · **Difficulty:** Easy

**The problem:** In `WatchlistAside.tsx`, `removeFromList` deletes the item from local state *before* the API call completes. If the DELETE request fails, the item disappears from the UI permanently — but it's still in the database.

**What to do:** Reorder the logic so the API call happens first. Only remove from local state if the call succeeds. If it fails, keep the item in the list and surface the error somehow (console is fine, a visible message is better).

**Files involved:**
- `src/components/WatchlistAside.tsx` — `removeFromList` function (line ~112)

**Exam skill practiced:** Reading existing code, identifying a subtle async bug, fixing state/side-effect ordering.

---

### 2. Add "Sort by Rating" to watchlist sidebar
**Type:** Feature · **Difficulty:** Easy

**What to build:** Add a new sort option "Rating ↓" (highest rated first) to the sort dropdown in `WatchlistAside`.

**What to do:**
1. Add `"rating-desc"` to the `SortOption` type and `SORT_OPTIONS` array
2. Add the sort logic to the `displayedList` `useMemo` (items with no rating go last)

**Files involved:**
- `src/components/WatchlistAside.tsx`

**Exam skill practiced:** Extending an existing feature by following established patterns.

---

### 3. Add title search filter to watchlist sidebar
**Type:** Feature · **Difficulty:** Easy

**What to build:** A text input above the list that filters items by title (case-insensitive substring match). Should work together with the existing status/type filters.

**What to do:**
1. Add a `searchQuery` state variable
2. Add an `<Input>` component (already exists in `src/components/ui/Input.tsx`) to the sidebar UI
3. Add a filter step to the `displayedList` `useMemo` that filters by `item.title.toLowerCase().includes(searchQuery.toLowerCase())`

**Files involved:**
- `src/components/WatchlistAside.tsx`
- `src/components/ui/Input.tsx` (read to understand the API)

**Exam skill practiced:** Adding UI state + wiring it into existing derived state logic.

---

### 4. Add notes field to watchlist items
**Type:** Feature · **Difficulty:** Easy

**What to build:** Each watchlist item in the sidebar should have an editable textarea for notes. The notes should sync to the DB when the user finishes typing (on blur).

**Context:** The API (`/api/watchlist` POST) already accepts a `notes` field and saves it to the DB. The `WatchLog` Prisma model has a `notes` column. The UI just never exposes it.

**What to do:**
1. Add `notes?: string` to the `ListItem` type
2. Add `updateNotes(itemId, notes)` function (mirrors `updateStatus`/`updateUserRating` pattern)
3. Add a `<textarea>` to each list item in the JSX (use `onBlur` to trigger sync, not `onChange`)
4. Make sure the notes value is included when the watchlist is loaded from the API (check the GET response in `src/app/(main)/movies/page.tsx`)

**Files involved:**
- `src/components/WatchlistAside.tsx`
- `src/app/(main)/movies/page.tsx` and `src/app/(main)/tv/page.tsx` (where the API response is mapped to `ListItem`)

**Exam skill practiced:** Tracing a data field end-to-end from DB → API → component → UI.

---

### 5. Fix: stats monthly activity uses wrong date field
**Type:** Bug fix · **Difficulty:** Medium

**The problem:** In `src/app/api/stats/route.ts`, the monthly activity chart buckets logs by `log.watchedAt`. But the `WatchLog` Prisma model doesn't have a dedicated `watchedAt` field — it has `createdAt` and `updatedAt`. Check the Prisma schema to confirm what field is actually being used and whether it makes sense semantically.

**What to do:**
1. Read `prisma/schema.prisma` to find the actual fields on `WatchLog`
2. Determine whether `watchedAt` is an alias for `updatedAt` or `createdAt`, or if there's a mismatch
3. Fix the field reference if it's wrong, or add a proper `watchedAt` field to the schema if it's missing

**Files involved:**
- `prisma/schema.prisma`
- `src/app/api/stats/route.ts`

**Exam skill practiced:** Reading a schema, tracing a bug from API output back to data model, deciding between a quick fix vs a schema change.

---

### 6. Add PATCH route for watchlist item updates
**Type:** Feature · **Difficulty:** Medium

**What to build:** Add a `PATCH /api/watchlist` route that lets the client update just the `status`, `rating`, or `notes` of an existing item — without re-sending the full media metadata (no TMDB fetch needed).

**Why:** The current approach re-POSTs the entire item on every status/rating change, which triggers a TMDB API call each time. A PATCH is more efficient and correct.

**What to do:**
1. Add an `export async function PATCH(request)` to `src/app/api/watchlist/route.ts`
2. Accept `{ mediaId, status?, rating?, notes? }` in the body
3. Use `prisma.watchLog.update(...)` (not upsert) — return 404 if the record doesn't exist
4. Update `WatchlistAside.tsx` to call PATCH instead of POST for `updateStatus` and `updateUserRating`

**Files involved:**
- `src/app/api/watchlist/route.ts`
- `src/components/WatchlistAside.tsx`

**Exam skill practiced:** Designing a new API route, understanding when to use update vs upsert, refactoring a client to use a better endpoint.

---

### 7. Add toast notifications for add/remove actions
**Type:** Feature · **Difficulty:** Medium

**What to build:** Show a brief success/error message when a user adds or removes an item from their list. No third-party library — build a simple toast component from scratch.

**What to do:**
1. Create `src/components/ui/Toast.tsx` — a fixed-position div that shows a message and auto-dismisses after 3 seconds
2. Add a `useToast` hook or simple state in the page component to control it
3. Trigger a success toast after a successful add (in `MediaSearch.tsx`) and after a successful remove (in `WatchlistAside.tsx`)
4. Trigger an error toast if either fails

**Files involved:**
- `src/components/ui/Toast.tsx` (new file)
- `src/components/MediaSearch.tsx`
- `src/components/WatchlistAside.tsx`

**Exam skill practiced:** Building a reusable UI primitive, lifting state / using a shared notification pattern across sibling components.

---

### 8. Add "Most Watched Genre" callout to stats page
**Type:** Feature · **Difficulty:** Medium

**What to build:** Above the charts on the stats page, show a simple callout: "Your most watched genre is **Action** (12 titles)". Pull this from the existing `/api/stats` response which already returns `topGenres`.

**What to do:**
1. Read `src/app/(main)/stats/page.tsx` to understand how it fetches and renders stats data
2. Add a styled callout card that reads `data.topGenres[0]` and renders the genre name and count
3. Handle the empty state (no genres yet)

**Files involved:**
- `src/app/(main)/stats/page.tsx`

**Exam skill practiced:** Reading an existing data-fetching page, adding a UI element driven by existing API data.

---

### 9. Add watchlist item count badge to navbar
**Type:** Feature · **Difficulty:** Hard

**What to build:** Show a badge on the navbar with the total number of items in the user's watchlist. Should update in real time as items are added/removed.

**The challenge:** `Navbar.tsx` and the watchlist list state live in different parts of the component tree. You'll need to decide how to share this count — lifting state, a context, or a separate API call from the navbar.

**What to do:**
1. Read `src/components/Navbar.tsx` and `src/app/(main)/layout.tsx` to understand the component hierarchy
2. Choose an approach (simplest: have Navbar fetch `/api/watchlist` independently and just use `.length`)
3. Implement the badge — a small circle with a number, positioned on the navbar link

**Files involved:**
- `src/components/Navbar.tsx`
- `src/app/(main)/layout.tsx`
- `src/app/api/watchlist/route.ts` (may need a lightweight count endpoint)

**Exam skill practiced:** Reasoning about component hierarchy and state sharing, choosing the right data-fetching approach.

---

### 10. Add a "Recently Watched" section to home page
**Type:** Feature · **Difficulty:** Hard

**What to build:** On the home page (`src/app/(main)/page.tsx`), show the 5 most recently updated watchlist items with their poster, title, and status badge.

**What to do:**
1. Fetch from `/api/watchlist` (already ordered by `updatedAt desc`) and take the first 5
2. Build a horizontal card row with poster images (use `next/image`, the TMDB image URL helper is in `src/lib/media.ts` — but it's server-only, so construct the URL directly on the client: `https://image.tmdb.org/t/p/w200${poster_path}`)
3. Show a status badge (color-coded: grey/yellow/green for plan-to-watch/watching/watched)
4. Handle loading and empty states

**Files involved:**
- `src/app/(main)/page.tsx`

**Exam skill practiced:** Building a new page section from scratch using an existing API, handling images and loading states.

---

### 11. Add pagination to watchlist sidebar
**Type:** Feature · **Difficulty:** Hard

**What to build:** If the filtered list has more than 10 items, only show 10 at a time with a "Load More" button at the bottom (same pattern as the catalog search uses).

**What to do:**
1. Add a `visibleCount` state (default 10)
2. Slice `displayedList` to `displayedList.slice(0, visibleCount)` for rendering
3. Show a "Load More (N more)" button below the list when there are hidden items
4. Reset `visibleCount` to 10 whenever the filter or sort changes (so you don't stay paginated after switching filters)

**Files involved:**
- `src/components/WatchlistAside.tsx`

**Exam skill practiced:** Adding pagination to an existing list, managing derived/dependent state resets correctly.

---

## Tips for the Exam

- **Read before you write.** Spend the first few minutes understanding how data flows end-to-end before touching anything.
- **Ask Claude good questions.** "Where is X defined?", "What calls this function?", "What's the type of this variable?" — let Claude navigate, you direct.
- **Stay in control.** Accept Claude's code critically. Understand every line before moving on.
- **Test in the browser.** Type-check and lint don't catch everything — actually run the app and click through your change.
- **Keep changes minimal.** Don't refactor things you weren't asked to touch.
