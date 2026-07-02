# DrFinder — Implementation Progress & Phase Plan

> **PRD source of truth:** [`deepseek_markdown_20260702_03d543.md`](./deepseek_markdown_20260702_03d543.md) (v0.3)  
> **App codebase:** `apps/web/src` (patient view, locale routes `/en/*`, `/fa/*`)  
> **Last updated:** 2026-07-02 (Phase 2 complete)

This document tracks phased implementation against the DrFinder PRD. Update it at the end of each work session so the next session knows exactly where to resume.

---

## Quick resume

| Field | Value |
| :--- | :--- |
| **Current phase** | Phase 2 — **complete** |
| **Start next session at** | **Phase 3 — §3.1** (P1 authenticated profile fields) |
| **Build status** | `nx run web:build` passing (as of 2026-07-02) |

---

## Phase plan (overview)

| Phase | Focus | PRD pages / areas | Status |
| :---: | :--- | :--- | :---: |
| **1** | Shell & navigation foundation | P0 partial, P2 stub, P7 stub, P8 wired, footer, drawer, grid, RTL | ✅ Done |
| **2** | Core missing screens | P4, P2 full, P0 banner & search shell | ✅ Done |
| **3** | Profile & authentication | P1, P3 | ⬜ Not started |
| **4** | Appointments & booking workflows | P6, Booking §10 | ⬜ Not started |
| **5** | P0 advanced & polish | Search chips, Find Physician, Near Me, sponsored list, terminology (BC/PIPA) | ⬜ Not started |

---

## Phase 1 — Shell & navigation foundation ✅

**Goal:** Align patient app chrome with PRD v0.3 before building deeper page logic.

### Scope checklist

| # | Task | PRD ref | Status |
| :---: | :--- | :--- | :---: |
| 1.1 | Footer nav: Home \| Appointments \| Notifications \| Profile | P0 footer | ✅ |
| 1.2 | Profile tab shows user first name when authenticated | P0 reconciliation §5 | ✅ |
| 1.3 | Home service grid → 4 items (Appointments, Test results, Advices, Documents) | P0 grid v0.3 | ✅ |
| 1.4 | Remove Prescriptions & Vaccinations from home grid (legacy routes kept) | P0 reconciliation §4 | ✅ |
| 1.5 | Global top bar with logo + hamburger drawer | P0 top bar | ✅ |
| 1.6 | Drawer items: Profile/Sign in, Settings, Map, Logout | P3 drawer v0.3 | ✅ |
| 1.7 | Settings placeholder page (P2 stub) | P2 | ✅ |
| 1.8 | Notifications page with mock feed (P7 stub) | P7 | ✅ |
| 1.9 | Wire Symptom Checker route → real page (not generic placeholder) | P8 | ✅ |
| 1.10 | Symptom Checker 911 red safety warning before input | P8 | ✅ |
| 1.11 | RTL/LTR: menu icon on inline-start, drawer slides from same edge | i18n `fa` | ✅ |

### Not in Phase 1 (deferred)

- P0 unified search bar & filter chips (Urgent / Find Physician / Near Me)
- P0 "My Healthcare Team" banner → P4
- P4 dashboard, P2 full settings, P7 live notification source
- P1 demographics (PHN, M/F/X, family physician)
- P3 OAuth, consent checkbox, full onboarding fields
- P6 Upcoming/Past tabs, cancellation policy, Join Video, Get Directions
- Booking workflow 6 steps + 911 warning at Step 1
- P8 booking handoff with pre-filled reason, audit log, ER map deep-link

---

## Phase 2 — Core missing screens ✅

**Goal:** Add the main screens that Phase 1 only stubbed or skipped.

| # | Task | PRD ref | Status |
| :---: | :--- | :--- | :---: |
| 2.1 | **My Healthcare Team** primary banner on Home (login gate if guest) | P0, P4 | ✅ |
| 2.2 | P4 Healthcare Team dashboard (family physician, re-booking, health condition meter) | P4 | ✅ |
| 2.3 | P2 Settings — notification preference toggles | P2 | ✅ |
| 2.4 | P2 Settings — theme (dark/light), compliance links | P2 | ✅ |
| 2.5 | P2 Settings — export data + account deletion flows (UI; API later) | P2 | ✅ |
| 2.6 | P7 Notifications — sync unread badge with read state (shared store) | P7 | ✅ |
| 2.7 | P0 unified search bar (UI shell; API later) | P0 | ✅ |
| 2.8 | P0 filter chips row (Urgent / Find Physician / Near Me — navigation stubs) | P0 | ✅ |

**Start here next session:** Phase 3 — §3.1

---

## Phase 3 — Profile & authentication ⬜

**Goal:** Match P1 field spec and P3 onboarding loop.

| # | Task | PRD ref | Status |
| :---: | :--- | :--- | :---: |
| 3.1 | P1 authenticated fields: masked email/phone, legal sex M/F/X, DOB | P1 | ⬜ |
| 3.2 | P1 PHN masked display + reveal toggle | P1 | ⬜ |
| 3.3 | P1 family physician field + inline "missing fields" banner | P1 | ⬜ |
| 3.4 | P1 guest state → redirect/open P3 onboarding | P1, P3 | ⬜ |
| 3.5 | P3 Step 2 — Terms + PIPA privacy consent checkbox | P3 | ⬜ |
| 3.6 | P3 Step 4 — optional demographics (sex, DOB, PHN, family physician) | P3 | ⬜ |
| 3.7 | P3 OAuth stubs (Google / Apple) or explicit defer note | P3 | ⬜ |

---

## Phase 4 — Appointments & booking ⬜

**Goal:** Full P6 management UI and 6-step Canadian booking pipeline.

| # | Task | PRD ref | Status |
| :---: | :--- | :--- | :---: |
| 4.1 | P6 Upcoming / Past tab switcher | P6 | ⬜ |
| 4.2 | P6 card actions: Reschedule, Cancel (+ 12h/$50 policy modal) | P6 | ⬜ |
| 4.3 | P6 Join Video (time window), Get Directions → P5 | P6 | ⬜ |
| 4.4 | P6 empty state → Find Physician / Symptom Checker CTAs | P6 | ⬜ |
| 4.5 | Booking Step 1 — 911 safety warning | §10 | ⬜ |
| 4.6 | Booking Step 2 — delivery mode (in-clinic / virtual / phone) + notices | §10 | ⬜ |
| 4.7 | Booking Step 3 — reason for visit categories + P8 pre-fill | §10, P8 | ⬜ |
| 4.8 | Booking Step 4 — PHN / provincial vs private ($95) insurance | §10 | ⬜ |
| 4.9 | Booking Step 5 — calendar / waitlist (EMR integration or mock) | §10 | ⬜ |
| 4.10 | Booking Step 6 — cancellation policy ack + confirm card | §10 | ⬜ |
| 4.11 | P8 — handoff to booking with symptom summary | P8 | ⬜ |
| 4.12 | P8 — emergency outcome deep-link to P5 ER pins | P8 | ⬜ |

---

## Phase 5 — P0 advanced & product polish ⬜

**Goal:** Remaining P0 discovery features and BC/PIPA terminology alignment.

| # | Task | PRD ref | Status |
| :---: | :--- | :--- | :---: |
| 5.1 | Find Physician list (IP + sponsored ordering per v0.3 reconciliation) | P0 | ⬜ |
| 5.2 | Near Me → P5 with GPS | P0, P5 | ⬜ |
| 5.3 | Urgent Appointment chip behaviour | P0 | ⬜ |
| 5.4 | Replace NHS/CHS copy with BC/MSP/PIPA terminology where applicable | Global | ⬜ |
| 5.5 | Optional: remove or hide legacy Messages tab/route if fully replaced by P7 | — | ⬜ |

---

## Page ID completion matrix

Rough % = UI/feature alignment with PRD v0.3 (not test coverage).

| ID | Screen | % | Notes |
| :---: | :--- | :---: | :--- |
| P0 | Home / Dashboard | ~70% | Search/chips/banner done; live Find Physician list deferred to Phase 5 |
| P1 | Profile Management | ~25% | Hub + phone auth only |
| P2 | Application Settings | ~75% | Toggles, theme, export/delete UI; API not connected |
| P3 | Auth & Onboarding | ~50% | Phone OTP; no consent/OAuth/full demographics |
| P4 | My Healthcare Team | ~70% | Dashboard + banner; EMR calendar is mock |
| P5 | Map & Clinic Locator | ~85% | Strongest existing page |
| P6 | Appointments | ~45% | List/detail/cancel; no tabs/policies/rich actions |
| P7 | Notifications | ~55% | Shared store + badge sync; mock feed |
| P8 | Symptom Checker | ~65% | Routed + 911 warning; no booking handoff/audit |

---

## Work log

Append-only session history. Newest entries at the top.

### 2026-07-02 — Phase 2 complete

**Phase:** 2 (complete)

**Summary:** Built P4 Healthcare Team (banner + dashboard), full Settings UI, Home search/chips shell, Find Physician stub page, and synced notification badge via shared store.

**Delivered:**

1. **P0 Home search & triage** (`home-search-panel.tsx`, `home-search.ts`)
   - Unified search bar → `/home/find-physician?q=…`
   - Filter chips: Urgent (auth) → appointments, Find Physician → list stub, Near Me → map

2. **P4 My Healthcare Team**
   - Banner on Home with login gate for guests (`healthcare-team-banner.tsx`)
   - Dashboard at `/healthcare-team`: family physician panel, visit methods, mock availability, provider history, re-booking list, health condition meter
   - Zustand store for family physician selection (persisted)

3. **P2 Settings (full UI)**
   - Notification toggles (push/SMS/email), privacy toggles, biometrics toggle
   - Light/dark theme with `ThemeProvider` + `html.dark` class
   - Export data dialog + double-step account deletion (mock)
   - Compliance documentation external links

4. **P7 Notifications sync**
   - `notifications-store.ts` (persisted) replaces static mock in page + footer badge
   - Mark read / mark all read updates badge count

5. **Find Physician stub** (`/home/find-physician`)
   - Doctors list with sponsored badge on first result; client-side search filter

6. **Nav drawer** — added optional My Healthcare Team link

**Key files touched:**

```
apps/web/src/features/healthcare-team/
apps/web/src/features/app-home/ui/home-search-panel.tsx
apps/web/src/features/app-home/ui/find-physician-page.tsx
apps/web/src/features/app-home/ui/home-hub-page.tsx
apps/web/src/features/settings/store/
apps/web/src/features/settings/ui/settings-page.tsx
apps/web/src/features/notifications/store/notifications-store.ts
apps/web/src/features/notifications/ui/notifications-page.tsx
apps/web/src/components/ui/switch.tsx
apps/web/src/lib/theme/theme-provider.tsx
apps/web/src/styles/globals.css
apps/web/src/app/[locale]/(patient)/(authenticated)/healthcare-team/page.tsx
apps/web/src/app/[locale]/(patient)/home/find-physician/page.tsx
```

**Verified:** `nx run web:build` — success.

**Next:** Phase 3 — §3.1 (P1 profile fields: PHN, M/F/X, family physician)

---

### 2026-07-02 — Phase 1 complete + RTL nav fix

**Phase:** 1 (complete)

**Summary:** Aligned patient shell navigation and home grid with DrFinder PRD v0.3. Fixed hamburger/drawer direction for LTR and RTL (`fa` locale).

**Delivered:**

1. **Footer navigation** (`app-tab-shell.tsx`)
   - Replaced Messages tab with Appointments + Notifications (4-column footer).
   - Dynamic Profile label (first name when signed in).
   - Unread badge on Notifications (static mock count).

2. **Home grid** (`home-navigation.ts`, `home-hub-page.tsx`)
   - 4 items: appointments, test-results, advices, documents.
   - Removed prescriptions & vaccinations from grid; legacy slugs still resolve in `service-detail-page.tsx`.

3. **Top bar & drawer** (`app-top-bar.tsx`, `nav-drawer.tsx`)
   - DrFinder branding in header.
   - Drawer: Profile/Sign in, Settings, Map view, Log out.

4. **New routes & features**
   - `/notifications` → `features/notifications/` (mock feed).
   - `/settings` → `features/settings/` (placeholder sections per PRD).

5. **Symptom Checker (P8)**
   - `/home/services/symptom-checker` → `SymptomCheckerPage`.
   - Red 911 warning banner before input (`SYMPTOM_CHECKER_911_WARNING`).
   - Bonus: health-a-z route wired to `HealthAzPage`.

6. **RTL / LTR navigation**
   - New hook: `hooks/use-document-direction.ts`.
   - Menu button at inline-start; drawer slides from start edge (`left` in LTR, `right` in RTL).

**Key files touched:**

```
apps/web/src/components/layout/app-tab-shell.tsx
apps/web/src/components/layout/app-top-bar.tsx
apps/web/src/components/layout/nav-drawer.tsx
apps/web/src/features/app-home/data/home-navigation.ts
apps/web/src/features/app-home/ui/home-hub-page.tsx
apps/web/src/features/app-home/ui/service-detail-page.tsx
apps/web/src/features/app-home/ui/symptom-checker-page.tsx
apps/web/src/features/app-home/data/mock-symptom-checker.ts
apps/web/src/features/notifications/
apps/web/src/features/settings/
apps/web/src/hooks/use-document-direction.ts
apps/web/src/app/[locale]/(patient)/(authenticated)/notifications/page.tsx
apps/web/src/app/[locale]/(patient)/settings/page.tsx
```

**Verified:** `nx run web:build` — success.

---

### 2026-07-02 — PRD review (pre-implementation)

**Phase:** 0 (planning)

**Summary:** Full review of PRD v0.3 against codebase. Produced phase plan and gap matrix. No code changes.

**Outcome:** Phase 1 scope defined; implementation started same day.

---

## Conventions for future log entries

When completing work, append a block like:

```markdown
### YYYY-MM-DD — Short title

**Phase:** N (in progress | complete)

**Summary:** One sentence.

**Delivered:**
- Bullet list of what shipped

**Key files touched:**
- paths

**Verified:** build / tests command and result

**Next:** Phase N, §N.N task description
```

Also update the **Quick resume** table and phase checklist statuses at the top of this file.
