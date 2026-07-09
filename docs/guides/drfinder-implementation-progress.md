# DrFinder — Implementation Progress & Phase Plan

> **PRD source of truth:** [`Medical-platform_20260709.md`](./Medical-platform_20260709.md) (v0.6)  
> **App codebase:** `apps/web/src` (patient view, locale routes `/en/*`, `/fa/*`)  
> **Last updated:** 2026-07-09 (Fresh start — aligned to PRD v0.6)

This document tracks phased implementation against DrFinder PRD v0.6. All phases have been reset to reflect the new spec. Code from the earlier v0.3 run (Phases 1–2) exists in the codebase and may be reused, but must be audited and updated against v0.6 requirements before being considered done.

---

## Quick resume

| Field | Value |
| :--- | :--- |
| **Current phase** | Phase 1 — **complete** · Phase 2 — not started |
| **Start next session at** | **Phase 2 — §2.1** (P0 unified search bar + chips) |
| **Build status** | `nx run web:build` passing (2026-07-09) |

---

## Page ID Map (v0.6)

| ID | Screen | v0.6 Status |
| :---: | :--- | :--- |
| P0 | Home / Dashboard | Updated (drawer, logo, chips) |
| P1 | Profile Management | Updated (Healthcare Number, Extended Health Insurance, Gender) |
| P2 | Application Settings | Updated (surfaced inside hamburger drawer) |
| P3 | Secure Authentication & Onboarding Loop | Updated (Create account / Log in split; Extended Health Insurance in Step 4) |
| P4 | Your Healthcare Team Dashboard | Renamed + Health Screening + Add a Physician layout |
| P5 | Map & Clinic Locator | Updated (search bar, category chips, 911 notice, header) |
| P6 | Appointments | Restructured (stacked sections, relative dates, expertise, tap→P9) |
| P7 | Notifications / Alerts | Updated (tap→bottom-sheet popup) |
| P8 | Symptom Checker / AI Triage Advisor | Updated (handoff→P10, ER deep-link, audit log) |
| P9 | **Physician Info** | ✨ NEW in v0.6 |
| P10 | **Book an Appointment** | ✨ NEW in v0.6 |

---

## Key terminology changes (v0.3 → v0.6)

| Old (v0.3) | New (v0.6) |
| :--- | :--- |
| PHN / Personal Health Number | **Healthcare Number** |
| Legal Sex | **Gender** |
| My Healthcare Team | **Your Healthcare Team** |
| Health Condition Meter | **Health Screening** |
| Add a provider | **Add a Physician** |
| Family Medicine | **Family Physician** |
| Notifications (footer tab) | **Alerts** |
| Settings (standalone page) | **Settings (inside hamburger drawer)** |

---

## Phase plan (overview)

| Phase | Focus | PRD pages / areas | Status |
| :---: | :--- | :--- | :---: |
| **1** | Global chrome & shell | P0 top bar, overlay drawer, footer nav, RTL, P8 route | ✅ Done |
| **2** | Home & map | P0 search/chips/banner, P5 v0.4 header/chips/search | ⬜ Not started |
| **3** | Your Healthcare Team & Settings | P4 (renamed+Health Screening), P2 (in-drawer) | ⬜ Not started |
| **4** | Profile & authentication | P1 v0.4 fields + Extended Health Insurance, P3 updated flow | ⬜ Not started |
| **5** | Physician Info & Booking screens | P9, P10, global tap-physician rule | ⬜ Not started |
| **6** | Appointments & booking workflow | P6 restructure, §10 full 6-step pipeline | ⬜ Not started |
| **7** | Notifications/Alerts & P8 enhancements | P7 popup, P8 handoff/audit/ER | ⬜ Not started |
| **8** | Find Physician & product polish | P0 physician list, Near Me GPS, terminology audit | ⬜ Not started |

---

## Phase 1 — Global chrome & navigation shell ✅

**Goal:** Implement v0.6 global chrome on every screen: logo top-right, overlay drawer, footer Alerts tab, centered greeting.

> **Note for v0.3 code:** `app-top-bar.tsx`, `nav-drawer.tsx`, `app-tab-shell.tsx` all exist but need the changes below.

### Scope checklist

| # | Task | PRD ref | Status |
| :---: | :--- | :--- | :---: |
| 1.1 | Logo mark: DrFinder icon (DF) stacked above "DrFinder" wordmark, anchored **top-right** of global chrome | P0 top bar v0.5 | ✅ |
| 1.2 | Hamburger icon at **top-left** on every screen | P0 top bar v0.4 | ✅ |
| 1.3 | Centered greeting: "Hi [First Name]!" when signed in; empty (no text) when signed out | P0 v0.4 | ✅ |
| 1.4 | Drawer opens as **overlay** (current screen is dimmed, not replaced); hamburger icon changes to X while open | P0 drawer v0.5 | ✅ |
| 1.5 | Dismiss drawer on: X tap, in-header close, or dimmed backdrop — returns user to **exact screen they were on** | P0 drawer v0.5 | ✅ |
| 1.6 | Drawer is available on **every page** | P0 drawer v0.5 | ✅ |
| 1.7 | Drawer contents: (1) Map View → P5; (2) Your Healthcare Team → P4; (3) Settings (expands inline with groups); (4) Contact (Contact Us [Call/Email], App Feedback [Rate]); (5) Log out | P0 drawer v0.5 | ✅ |
| 1.8 | Settings inline groups inside drawer: **App view** [Notification, Dark/Light Mode] · **App Security** [Two-step Verification, FaceID/Passcode, Delete Account] · **Legal** [Terms of Use, Privacy Policy] | P2 v0.5 | ✅ |
| 1.9 | Footer nav: **Home (P0) \| Appointments (P6) \| Alerts (P7) \| Profile (P1)** | P0 footer v0.4 | ✅ |
| 1.10 | Profile tab shows signed-in user's **first name** when authenticated; "Profile" when signed out | P0 reconciliation §5 | ✅ |
| 1.11 | Home service grid → 4 items: Appointments (P6), Test Results (Phase 2), Advices (Phase 2), Documents (Phase 2) | P0 grid v0.3 | ✅ (existing) |
| 1.12 | Remove Prescriptions & Vaccinations from home grid (legacy routes may be kept as-is) | P0 reconciliation §4 | ✅ (existing) |
| 1.13 | Wire Symptom Checker route → P8 (red 911 warning before any input) | P8 | ✅ (existing) |
| 1.14 | RTL/LTR: drawer slides from **inline-start** edge; hamburger at inline-start; logo at inline-end | i18n `fa` | ✅ |

---

## Phase 2 — Home & Map (P0, P5) ⬜

**Goal:** Complete P0 search/triage panel and build the v0.4 Map screen with header, chips, and search.

### Scope checklist

| # | Task | PRD ref | Status |
| :---: | :--- | :--- | :---: |
| 2.1 | P0 unified search bar (UI shell; live API deferred to Phase 8) | P0 search | ⬜ |
| 2.2 | P0 filter chips row: **Urgent Appointment** (auth-gated → appointments), **Find Physician** (stub list), **Near Me** → P5 | P0 chips | ⬜ |
| 2.3 | P0 **"Your Healthcare Team"** primary banner (login gate for guests; authenticated → P4 with primary physician info) | P0 banner, P4 | ⬜ |
| 2.4 | P0 Symptom Checker entry block → P8 | P0 | ⬜ |
| 2.5 | P5 header: **← Home** back button (left), centered title "**Find care near you**", filter icon (right) | P5 v0.4 | ⬜ |
| 2.6 | P5 map search bar (below header, on map) — search clinic/pharmacy/provider/place → re-center map | P5 v0.4 | ⬜ |
| 2.7 | P5 category filter chips: **All \| Urgent & walk-in \| Pharmacy \| Primary care \| Therapy** | P5 v0.4 | ⬜ |
| 2.8 | P5 colored map pins per category (walk-in, doctor's office, ER, pharmacy) | P5 | ⬜ |
| 2.9 | P5 persistent bottom notice: *"For life-threatening emergencies, call 911. This map shows care you can access directly without a specialist referral."* | P5 v0.4 | ⬜ |
| 2.10 | P5 clinic context slider card: status (Open/Closed/At Capacity), live wait time, booking CTA → booking workflow | P5 | ⬜ |

---

## Phase 3 — Your Healthcare Team & Settings (P4, P2) ⬜

**Goal:** Build P4 with v0.4 naming and layout, and P2 (whose controls now live inside the drawer).

### Scope checklist

| # | Task | PRD ref | Status |
| :---: | :--- | :--- | :---: |
| 3.1 | P4 screen title & all labels renamed to **"Your Healthcare Team"** | P4 v0.4 | ⬜ |
| 3.2 | P4 Family Physician management anchor (null state → "Add Family Physician" button) | P4 | ⬜ |
| 3.3 | P4 Physician Hub: real-time booking calendar, visit methods (In-Clinic / Telephone / Virtual), "Book an Appointment with This Provider" button, history log | P4 | ⬜ |
| 3.4 | P4 Re-Booking History List (one-tap renewal → P10) | P4 | ⬜ |
| 3.5 | P4 **Health Screening** (renamed from Health Condition Meter) — 4 checkpoints: family physician, baseline labs, preventive screenings, scalable slots | P4 v0.4 | ⬜ |
| 3.6 | P4 **Add a Physician** picker: **two boxes per row**, vertical flow (not horizontal scroll) | P4 v0.4 | ⬜ |
| 3.7 | P2 notification toggles (push/SMS/email) accessible via drawer Settings | P2 | ⬜ |
| 3.8 | P2 Dark/Light theme toggle accessible via drawer | P2 | ⬜ |
| 3.9 | P2 privacy/security toggles (third-party sharing, behavioral logging, biometrics/Face ID) | P2 | ⬜ |
| 3.10 | P2 Download / Export My Data (PDF/CSV, PIPA portability) | P2 | ⬜ |
| 3.11 | P2 Account Destruction Portal (double-step confirmation) | P2 | ⬜ |
| 3.12 | P2 Compliance links (Terms of Use, Privacy Policy) | P2 | ⬜ |

---

## Phase 4 — Profile & Authentication (P1, P3) ⬜

**Goal:** Match P1 v0.4 field spec (Healthcare Number, Extended Health Insurance, Gender) and update P3 onboarding.

### Scope checklist

| # | Task | PRD ref | Status |
| :---: | :--- | :--- | :---: |
| 4.1 | P1 **guest state**: "Create an account" and "Log in" entry points (Google / Apple OAuth + Email & Password) | P1 v0.4, P3 | ⬜ |
| 4.2 | P1 **Personal Details**: First Name, Last Name, **Gender** (M/F/X), Date of Birth | P1 v0.4 | ⬜ |
| 4.3 | P1 **Healthcare & Contact**: **Healthcare Number** (masked ••••••••81 + eye/reveal toggle), Phone, Email | P1 v0.4, v0.5 | ⬜ |
| 4.4 | P1 **Extended Health Insurance** section: Carrier Number, Contract Number, Member's ID Number (masked) | P1 v0.4 | ⬜ |
| 4.5 | P1 inline banner: *"Missing fields impact booking speed"* for empty field parameters | P1 | ⬜ |
| 4.6 | P1 avatar / photo field | P1 | ⬜ |
| 4.7 | P3 Step 1: explicit "Create an account" / "Log in" split; OAuth (Continue with Google / Apple) + Email & Password | P3 v0.4 | ⬜ |
| 4.8 | P3 Step 2: PIPA-based Privacy Policy + Terms of Service active checkbox consent | P3 | ⬜ |
| 4.9 | P3 Step 3: 6-digit SMS OTP phone verification | P3 | ⬜ |
| 4.10 | P3 Step 4: optional demographics — **Gender** (M/F/X), Date of Birth, **Healthcare Number**, **Extended Health Insurance details** | P3 v0.4 | ⬜ |

---

## Phase 5 — Physician Info & Booking Screens (P9, P10) ⬜

**Goal:** Build both new screens (P9, P10) and wire the global "tap physician name/photo → P9" rule everywhere.

### Scope checklist

| # | Task | PRD ref | Status |
| :---: | :--- | :--- | :---: |
| 5.1 | **P9** — photo field: physician photo; if unset, show **gender-based silhouette placeholder** (derived from physician's recorded gender) | P9 | ⬜ |
| 5.2 | P9 — full name, **expertise/specialty**, overall **rating**, **years of experience** | P9 | ⬜ |
| 5.3 | P9 — **clinic name + address** (tappable → opens turn-by-turn navigation) | P9 | ⬜ |
| 5.4 | P9 — **languages** the physician can speak (displayed as tags) | P9 | ⬜ |
| 5.5 | P9 — **working hours** (day-by-day schedule, closed days clearly marked) | P9 | ⬜ |
| 5.6 | P9 — **reviews & rating** (patient comments list + numeric rating + star summary) | P9 | ⬜ |
| 5.7 | P9 — **"Book appointment"** CTA → opens P10 for this physician | P9 | ⬜ |
| 5.8 | P9 — **"Add to your Healthcare Team"** toggle; reads "In your team" if already added; syncs P4 list bidirectionally | P9 | ⬜ |
| 5.9 | **P10** — physician header: full name + expertise at top; tapping name **or** photo → P9 | P10 | ⬜ |
| 5.10 | P10 — **visit-type toggles**: Walk-in, Virtual, Phone (same on/off control style as P2 notification toggle; **all default On**) | P10 | ⬜ |
| 5.11 | P10 — **first availability** line (updates dynamically based on active filter combination; if all toggled off → hide + prompt to enable at least one) | P10 | ⬜ |
| 5.12 | P10 — **month calendar**: available days highlighted; selected day emphasized; unavailable days grayed; availability legend | P10 | ⬜ |
| 5.13 | P10 — **timeslot column**: scrollable list in clinic timezone **(PDT)**; chosen slot highlighted | P10 | ⬜ |
| 5.14 | P10 — **"Reason for visit / Symptom"** note field; placeholder text *"e.g., stomach pain, doctor's note, etc."* — placeholder clears on first keystroke | P10 | ⬜ |
| 5.15 | **Global rule**: tapping a physician's name **or** photo opens P9 — enforce uniformly on: Home (P0), Recommended list, Your Healthcare Team (P4), Appointment cards (P6), Booking header (P10) | P9, v0.6 changelog §1 | ⬜ |

---

## Phase 6 — Appointments & Booking Workflow (P6, §10) ⬜

**Goal:** Restructure P6 to stacked-section layout and build the full 6-step Canadian booking pipeline.

### Scope checklist

| # | Task | PRD ref | Status |
| :---: | :--- | :--- | :---: |
| 6.1 | P6 — **replace tab switcher** with two stacked sections on a single scroll: **Upcoming** (nearest → farthest) then **Past** (newest → oldest) | P6 v0.6 | ⬜ |
| 6.2 | P6 — cards: physician's **expertise** displayed directly beneath the name | P6 v0.6 | ⬜ |
| 6.3 | P6 — **relative dates**: ±1 day → "Yesterday" / "Tomorrow"; otherwise calendar date (e.g. "Jul 14") | P6 v0.6 | ⬜ |
| 6.4 | P6 — Upcoming card actions: **Reschedule**, **Cancel** (surfaces 12-hour/$50 CAD policy modal before confirming), **Join Video Call** (active only within pre-set window), **Get Directions** (in-clinic → P5) | P6 | ⬜ |
| 6.5 | P6 — Past card actions: **"Book Again"** one-tap → P10 pre-scoped to that physician | P6 v0.6 | ⬜ |
| 6.6 | P6 — provider name/photo tap → P9 | P6 v0.6 | ⬜ |
| 6.7 | P6 — **empty state**: prompt directing to Find Physician or Symptom Checker | P6 | ⬜ |
| 6.8 | §10 Step 1 — **911 red safety warning** (high-visibility red typography, mandatory before any booking input); entry points: P0 "Book" button, P4 Health Screening milestone, P5 clinic card, P8 routed outcome | §10 | ⬜ |
| 6.9 | §10 Step 2 — **delivery mode selection**: In-Clinic/Walk-in (bring ID + health card notice), Virtual (camera/mic check + private Wi-Fi notice), Telephone (phone number validation) | §10 | ⬜ |
| 6.10 | §10 Step 3 — **reason for visit** drop-down tags (Prescription Renewal, Acute Care, Chronic Follow-up, Routine Physical); pre-fill from P8 symptom summary if arriving from Symptom Checker | §10, P8 | ⬜ |
| 6.11 | §10 Step 4 — **Healthcare Number** routing: masked number → BC MSP; if empty → alert modal ("No active provincial health registry found. Out-of-province or private uninsured consulting rates apply ($95.00 CAD per session).") | §10 v0.5 | ⬜ |
| 6.12 | §10 Step 5 — **calendar allocation** (sync with provider EMR or mock); walk-in → show real-time waitlist queue ("Join Waitlist Queue. Estimated practitioner callback window: HH:MM") | §10 | ⬜ |
| 6.13 | §10 Step 6 — **cancellation policy ack** ("Cancellations under 12 hours or missed appointments are subject to a $50.00 CAD clinic fee…"); confirmation card with calendar sync + video-consult launch → result appears on P6 | §10 | ⬜ |

---

## Phase 7 — Notifications/Alerts & P8 Enhancements (P7, P8) ⬜

**Goal:** Add P7 tap-to-popup detail behavior and complete P8 booking handoff, ER deep-link, and audit log.

### Scope checklist

| # | Task | PRD ref | Status |
| :---: | :--- | :--- | :---: |
| 7.1 | P7 — tapping any notification opens a **detail popup (bottom sheet)**: full notification text + structured detail block (physician, visit type, date/time, confirmation code) | P7 v0.6 | ⬜ |
| 7.2 | P7 — sheet dismiss: via sheet close control **or** dimmed backdrop; returns to feed | P7 v0.6 | ⬜ |
| 7.3 | P7 — where relevant, sheet includes a **primary action** that deep-links to related screen (e.g. appointment reminder → P6 card) | P7 v0.6 | ⬜ |
| 7.4 | P7 — **read / unread** visual distinction (dot indicator); footer Alerts badge count = unread total | P7 | ⬜ |
| 7.5 | P7 — settings shortcut link → Notification Preferences in drawer (P2) | P7 | ⬜ |
| 7.6 | P8 — "Book an Appointment" triage outcome → hands off to **P10** with "Reason for visit" **pre-filled** with the symptom summary | P8 | ⬜ |
| 7.7 | P8 — Urgent/Emergency outcome: red warning + "dial 911" + **deep-link → P5 filtered to ER pins** | P8 | ⬜ |
| 7.8 | P8 — **audit log**: store each session summary against user profile (PIPA data-minimization); exportable via P2 Export My Data | P8 | ⬜ |

---

## Phase 8 — Find Physician & Product Polish ⬜

**Goal:** Live physician discovery, GPS Near Me, and global terminology/compliance audit.

### Scope checklist

| # | Task | PRD ref | Status |
| :---: | :--- | :--- | :---: |
| 8.1 | Find Physician list: ordered by **IP-based location + sponsored placement**; sponsored badge clearly visible; client-side search filter | P0 reconciliation §1 | ⬜ |
| 8.2 | **Near Me** chip → P5 using **device GPS** as primary signal | P0 chips | ⬜ |
| 8.3 | **Urgent Appointment** chip behavior: target real-time calendar openings + walk-in options | P0 chips | ⬜ |
| 8.4 | Global terminology audit: replace every remaining instance of PHN / Personal Health Number → **Healthcare Number**; My Healthcare Team → **Your Healthcare Team**; Legal Sex → **Gender**; Health Condition Meter → **Health Screening**; Notifications footer → **Alerts** | Global | ⬜ |
| 8.5 | Verify all PIPA / PIPEDA / BC-MSP legal copy is accurate throughout the app | Global compliance | ⬜ |
| 8.6 | Remove or hide legacy Messages tab/route if fully replaced by P7 Alerts | — | ⬜ |

---

## Page ID completion matrix

Rough % = UI/feature alignment with **PRD v0.6** (not test coverage).  
Baseline reflects v0.3 code that exists but has not yet been audited against v0.6.

| ID | Screen | % (v0.6) | Notes |
| :---: | :--- | :---: | :--- |
| P0 | Home / Dashboard | ~30% | Grid + search shell done (v0.3); drawer/logo/greeting need v0.6 update |
| P1 | Profile Management | ~10% | Basic hub only; Healthcare Number, Gender, Extended Health Insurance not built |
| P2 | Application Settings | ~40% | Controls built; must move into drawer inline groups |
| P3 | Auth & Onboarding | ~30% | Phone OTP; no Create/Log-in split, no Extended Health Insurance in Step 4 |
| P4 | Your Healthcare Team | ~40% | Dashboard built (v0.3 naming); rename + Health Screening + Add-Physician layout needed |
| P5 | Map & Clinic Locator | ~50% | Base map exists; v0.4 header/chips/search bar/911 notice not done |
| P6 | Appointments | ~20% | Basic list; stacked-section restructure, relative dates, expertise, Book Again→P10 not done |
| P7 | Notifications / Alerts | ~35% | Store + badge sync done (v0.3); tap-to-popup, Alerts rename not done |
| P8 | Symptom Checker | ~40% | Route + 911 warning; no P10 handoff, no ER deep-link, no audit log |
| P9 | Physician Info | 0% | New — not built |
| P10 | Book an Appointment | 0% | New — not built |

---

## Work log

Append-only session history. Newest entries at the top.

### 2026-07-09 — Phase 1 complete

**Phase:** 1 (complete)

**Summary:** Rebuilt global chrome to match PRD v0.6: logo top-right (stacked), overlay drawer with X toggle and return-to-origin, restructured drawer contents (Your Healthcare Team, Settings inline accordion, Contact section), footer updated to 4 tabs (Home | Appointments | Alerts | Profile) with dynamic Profile label.

**Delivered:**

1. **`app-top-bar.tsx`** — 3-column layout: hamburger (inline-start, toggles to X when open) | centered "Hi [Name]!" greeting | stacked DF logo + wordmark (inline-end)
2. **`nav-drawer.tsx`** — Overlay drawer; restructured nav: Map View, Your Healthcare Team, Settings accordion (App view toggles + App Security stubs + Legal links), Contact accordion (Call/Email/Rate), Log out; guest header shows "Create an account" + "Log in" buttons
3. **`app-tab-shell.tsx`** — 4-tab footer: Home | Appointments | Alerts (badge) | Profile (shows first name when authenticated); `grid-cols-4`; Profile icon added

**Key files touched:**
```
apps/web/src/components/layout/app-top-bar.tsx
apps/web/src/components/layout/nav-drawer.tsx
apps/web/src/components/layout/app-tab-shell.tsx
```

**Verified:** `nx run web:build` — success.

**Next:** Phase 2 — §2.1 (P0 unified search bar + chips) and §2.4 (P5 header/search/chips/911 notice)

---

### 2026-07-09 — PRD v0.6 review & progress reset

**Phase:** 0 (planning)

**Summary:** Full comparison of PRD v0.3 (`deepseek_markdown_20260702_03d543.md`) vs PRD v0.6 (`Medical-platform_20260709.md`). Identified all changes. Reset implementation progress document to target v0.6. All phases reset to ⬜ Not started.

**Key v0.6 changes identified:**
- 2 new screens: P9 (Physician Info), P10 (Book an Appointment)
- Global "tap physician name/photo → P9" rule across all screens
- Logo repositioned top-right; overlay drawer with X close and return-to-origin
- Drawer restructured: Settings inline groups + Contact section
- Footer renamed "Notifications" → "Alerts"
- PHN → Healthcare Number (patient-facing everywhere)
- Legal Sex → Gender; P1 adds Extended Health Insurance (Carrier / Contract / Member ID)
- P4 renamed "Your Healthcare Team"; Health Condition Meter → Health Screening; Add-Physician layout 2-per-row
- P5: added search bar + category chips (All/Urgent & walk-in/Pharmacy/Primary care/Therapy) + 911 notice + new header
- P6: tab switcher replaced with stacked sections; expertise on cards; relative dates; Book Again → P10
- P7: tap notification → bottom-sheet detail popup (dismiss via close or backdrop)
- P8: booking handoff now targets P10; ER deep-link to P5

**Outcome:** Phase plan rebuilt from scratch. Implementation starts at Phase 1 — §1.1.

---

### 2026-07-02 — Phase 2 complete (v0.3)

**Phase:** 2 (complete against PRD v0.3)

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

**Verified:** `nx run web:build` — success (v0.3 PRD).

---

### 2026-07-02 — Phase 1 complete + RTL nav fix (v0.3)

**Phase:** 1 (complete against PRD v0.3)

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

**Verified:** `nx run web:build` — success (v0.3 PRD).

---

### 2026-07-02 — PRD review (pre-implementation, v0.3)

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
