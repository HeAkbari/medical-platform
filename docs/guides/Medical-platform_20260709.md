# DrFinder Product Requirement Document (PRD)

*Version: 0.6 (UX Revision 3) --- Builds on v0.5. Adds a per-physician Physician Info screen (P9) and a Book an Appointment screen (P10); a uniform "tap a physician name or photo → Physician Info" rule across all screens; an Appointments screen restructured into stacked Upcoming (near→far) and Past (new→old) sections with relative Yesterday/Tomorrow dates, expertise under each name, and Book Again on past entries; visit-type on/off filters and a standard calendar in booking; and a tap-to-open detail popup on Alerts. System Scope: Patient View Application Wireframe & Functional Specification*

This document establishes the functional parameters, navigation layout, and procedural workflows for the DrFinder platform. As a private-sector consumer application operating in British Columbia, DrFinder's handling of personal information is primarily governed by BC's Personal Information Protection Act (PIPA), with the federal Personal Information Protection and Electronic Documents Act (PIPEDA) applying to any data that crosses provincial or national borders. (FIPPA applies to public-sector bodies, e.g. health authorities, and is referenced only where DrFinder integrates with public EMR/MSP systems.)

## Document Change Log (v0.1 → v0.2)

The following corrections and additions were made to the original draft:

| #  | Change |
|----|--------|
| 1  | Added missing screen definitions: Appointments (P6), Notifications (P7), and Symptom Checker / AI Triage Advisor (P8) --- previously referenced but never specified. |
| 2  | Added a Page ID Map (below) so every referenced screen has a unique, traceable ID. |
| 3  | Unified visit-delivery terminology across the document to: In-Clinic / Walk-in, Telephone Call, Virtual Video Consultation. |
| 4  | Unified location logic: GPS device location is now the primary signal for "Find Physician" and "Near Me"; IP-based location is documented only as a low-precision fallback when GPS permission is denied. |
| 5  | Corrected privacy/compliance framing from "FIPPA/PIPA" to PIPA (primary, private sector) and PIPEDA (cross-border), with FIPPA scoped to public-sector integrations only. |
| 6  | Added a "Download / Export My Data" feature to Settings (P2) to satisfy PIPA data-access/portability rights, alongside the existing Account Destruction Portal. |
| 7  | Corrected Legal Sex field options from [Male / Female / Other] to [M / F / X], matching BC vital statistics designations. |
| 8  | Standardized PHN display as a plain masked 10-digit string (••••••••81) rather than a dashed/grouped format not used anywhere else in the spec. |
| 9  | Added Doctor's Office / Clinic as a pin category on the Map & Clinic Locator (P5) --- previously omitted from an app centered on physician discovery. |
| 10 | Promoted the Mandatory Medical Safety Triage Warning to also appear on the Symptom Checker (P8) entry screen and at Step 1 of the booking workflow, not only at Step 3. |
| 11 | Linked the Home (P0) "My Healthcare Team" banner and footer nav explicitly to P4, and added P4 to the hamburger drawer for discoverability. |

## Page ID Map

Quick-reference index of every screen and its unique ID. Use these IDs in wireframe file names and dev tickets.

| ID  | Screen |
|-----|--------|
| P0  | Home / Dashboard |
| P1  | Profile Management |
| P2  | Application Settings |
| P3  | Secure Authentication & Onboarding Loop |
| P4  | Your Healthcare Team Dashboard |
| P5  | Map & Clinic Locator |
| P6  | Appointments (NEW) |
| P7  | Notifications (NEW) |
| P8  | Symptom Checker / AI Triage Advisor (NEW) |

---

# PART I: GLOBAL LAYOUT & INFRASTRUCTURE

## 1. Home Screen / Dashboard (P0)

The main entry landing page containing universal navigation, immediate search triage, and structural component layouts.

### Global Top Bar Components

- **Logo (Top Right):** Fixed brand placement across all app-wide interfaces, anchored to the top-right of the global chrome. The DrFinder logo mark (location pin + medical cross with magnifier/pulse glyph + stethoscope) is stacked directly above the "DrFinder" wordmark.

- **Hamburger Menu (☰):** Tapping the top-left hamburger opens a sliding drawer as an overlay on top of the current screen (the underlying screen is dimmed, not replaced). While the drawer is open the hamburger icon changes to a close (X) control; tapping the X --- or the drawer's in-header close, or the dimmed backdrop --- dismisses the drawer and returns the user to the exact screen they were on. The drawer is available on every page. Its contents are: (1) Map View (P5); (2) Your Healthcare Team (P4); (3) Settings --- surfaced here inside the menu rather than as a standalone destination --- App view [Notification, Dark/Light Mode], App Security [Two-step Verification, FaceID/Passcode, Delete Account], Legal [Terms of Use, Privacy Policy]; (4) Contact --- Contact Us [Call, Email], App Feedback [Rate]; (5) Log out. Selecting Settings expands its groups inline within the drawer.

### Search and Triage Panel

- **Unified Search Bar:** Text entry allowing direct searches for healthcare provider names, specialties, or medical topics.

- **Horizontal Scrollable Filter Chips:** Rapid filter modifiers positioned directly below the search bar:

  - *Urgent Appointment:* Dynamically targets real-time calendar openings and immediate walk-in options.

  - *Find Physician:* Populates all physicians ordered by IP-based location and sponsored placement, per the original v0.0 definition (see Reconciliation note 1). Sponsored practitioners are clearly labelled. (GPS device location is used as the primary signal for the "Near Me" map shortcut, not for this list.)

  - *Near Me:* A navigational shortcut redirecting to the geospatial Map View (P5), using the same device GPS signal as Find Physician.

### Core Functional Modules

- **"My Healthcare Team" Primary Banner (P4):** If unauthenticated, triggers a login gate prompt. If authenticated, links directly to P4 and shows the user's primary care physician and history.

- **Core Grid Framework:** A balanced layout containing four major service paths:

  - *Appointments → P6:* Direct link to schedule and manage active bookings.

  - *Test Results (Phase 2):* Placeholder for laboratory and diagnostic records data.

  - *Advices (Phase 2):* Educational and provider advice archives.

  - *Documents (Phase 2):* Secure file locker for clinical notes, records, and practitioner letters.

- **Symptom Checker Entry Point → P8:** A descriptive graphic block driving engagement toward the automated AI diagnostic advisor tool (see P8 for full spec and required safety disclaimer).

### Global Footer Navigation Tab Bar

- Maintains bottom-anchored structural tabs for high-frequency switching: Home (P0) | Appointments (P6) | Notifications (P7) | Profile (P1).

---

# PART II: PAGE DEFINITIONS & STATE LOGIC

## 2. Profile Management Screen (P1)

Manages user demographics, contact metrics, and identity validation layers divided strictly by system state logic.

**Profile (P1) - Authenticated State**

[ User Avatar / Photo Field ]

**Personal Details:**

- First Name: Aanya
- Last Name: Sharma
- Gender: [ M / F / X ]
- Date of Birth: May 12, 1991

**Healthcare & Contact:**

- Healthcare Number: ••••••••81 [eye icon]
- Phone: +1 (604) XXX-XX42
- Email: aanya.s@email.com

**Extended Health Insurance:**

- Carrier Number: 610047
- Contract Number: 302199-A
- Member's ID Number: •••••4471

[Inline Banner: Missing fields impact booking speed]

- **State A --- Guest / Unauthenticated:** Presents the "Create an account" and "Log in" options and, on selection, shifts the user into the secure Onboarding and Verification Loop (P3).

- **State B --- Authenticated / Logged In:** Populates complete data entries and enables standard field modification for First Name, Last Name, Gender, Date of Birth (DOB), Healthcare Number, Phone, Email, and Extended Health Insurance details (Carrier Number, Contract Number, and Member's ID Number).

- **UX Pattern Requirement:** For any empty field parameter, an inline notice or visual reminder badge encourages input completion to streamline digital triage at local clinics.

- **Data Format Note:** The Healthcare Number is a plain 10-digit provincial number with no internal grouping; the masked display should follow suit (e.g. ••••••••81), not a dashed/grouped format.

## 3. Application Settings Screen (P2)

Provides standardized administrative utilities and system preferences control layers.

- **Notification Preferences:** Independent toggles mapping out Push alerts, SMS notifications, and Email updates for appointment bookings or message drops.

- **Privacy & Security Configuration:** Toggles to regulate explicit third-party data-sharing permissions and behavioral logging metrics.

- **Download / Export My Data (NEW):** Generates a portable export (e.g. PDF/CSV) of the user's profile, healthcare-team, and appointment-history data, satisfying PIPA data-access and portability rights.

- **Biometrics Integration:** Step-2 validation configuration setting allowing automated Face ID / Touch ID authentication during app start or checkout validation.

- **Visual Theme Manager:** Dark Mode / Light Mode interface toggles.

- **Compliance Documentation:** Links to Canadian healthcare guidelines, Terms of Use, and the PIPA-based Privacy Policy.

- **Account Destruction Portal:** Secure double-confirmation process enabling quick and irreversible account deletion requests.

## 4. Your Healthcare Team Dashboard (P4)

The centralized medical home screen outlining practitioner links and long-term wellness metrics.

- **Family Physician Management Anchor:** Renders the primary profile block of the patient's primary practitioner. In a null state, replaces it with an "Add Family Physician" primary button.

- **Physician Hub Sub-Views (Modules A & B):** Provider-specific data panels featuring:

  - Real-time practitioner booking availability calendars.

  - Supported visit delivery methods: In-Clinic / Walk-in, Telephone Call, or Virtual Video Consultation.

  - A primary action button: "Book an Appointment with This Provider."

  - A history log filtering historical patient visits tied exclusively to that single doctor.

- **Re-Booking History List:** A vertical checklist summarizing historic appointments, allowing a one-tap renewal booking experience.

- **Health Screening:** An interactive progress element evaluating care-plan checkpoints:

  1. Designation and validation of an active Family Physician.
  2. Completion status of routine baseline lab tests (e.g., annual blood panels).
  3. Age-standardized preventative milestone screenings.
  4. Scalable slot configuration to integrate additional custom metrics in later version rollouts.

## 5. Map & Clinic Locator Screen (P5)

Geospatial search component to source nearby healthcare infrastructure.

- **Screen Header & Filters (v0.4):** A top control row shows a "← Home" button (left), the centered title "Find care near you," and a filter icon (right). Directly beneath sits a horizontal category filter chip row: All, Urgent & walk-in, Pharmacy, Primary care, and Therapy. The bottom of the screen carries a persistent notice: "For life-threatening emergencies, call 911. This map shows care you can access directly without a specialist referral."

- **Map Search Bar (v0.4):** A search field is placed on the map (below the header) allowing the user to search for a clinic, pharmacy, provider, or place name and re-center the map on the result, complementing the category chips and device-GPS pins.

- **Geospatial Mapping Interface:** Map display pinning validated regional walk-in clinics, doctor's offices / clinics (NEW), operational ER centers, and pharmacies based on device GPS telemetry.

- **Clinic Context Slider Card:** Selecting a pin slides a bottom pane context window highlighting:

  - Clinic Status indicators (e.g., "Open" / "Closed" / "At Capacity").
  - Live Wait Time Estimates: public or clinic-reported wait lengths (e.g., "Estimated Clinic Wait: 45 Minutes").
  - A primary action link feeding immediately into the core Appointment Booking Workflow.

## 6. Appointments Screen (P6) --- NEW

A dedicated screen for managing all upcoming and past appointments, accessible from the Home grid and the global footer nav.

- **Sectioned Layout (v0.6):** Upcoming and Past appointments are shown as two stacked sections on a single scroll (no tab switcher). Upcoming appears first, ordered nearest→farthest into the future; Past follows, ordered newest→oldest.

- **Upcoming List:** Cards show provider name/photo, the physician's expertise directly beneath the name, visit type icon (In-Clinic / Telephone / Virtual), and date & time. Dates within one day of today render as "Yesterday" or "Tomorrow"; anything further away shows the calendar date (e.g. "Jul 14"). Tapping the provider name or photo opens that physician's Physician Info page (P9).

- **Appointment Card Actions:** Reschedule, Cancel (surfaces the 12-hour/$50 CAD cancellation policy before confirming), Join Video Call (active only within a pre-set time window of the appointment), Get Directions (for in-clinic visits, deep-links to Map View P5).

- **Past List:** Read-only history (newest→oldest) with a "Book Again" one-tap action enabled on every past entry, which hands off into the Booking page (P10) pre-scoped to that physician. Upcoming cards keep their existing actions (Reschedule / Cancel / Join Video Call / Get Directions) unchanged. Provider name/photo taps open Physician Info (P9).

- **Empty State:** If no appointments exist, shows a prompt directing the user into the booking workflow (Find Physician or Symptom Checker).

## 7. Notifications Screen (P7) --- NEW

A centralized notification feed, accessible from the global footer nav (bell icon).

- **Feed List:** Reverse-chronological list of system events: appointment reminders, booking confirmations, cancellations, waitlist callbacks, and care-plan milestone alerts from the Health Condition Meter (P4).

- **Read / Unread State:** Unread items are visually distinguished (e.g., dot indicator); the footer nav badge count reflects unread totals (the original wireframe's "17" badge is illustrative only, not a fixed spec value).

- **Tap Behavior:** Tapping any notification opens a detail popup (a bottom sheet) presenting the full text and a structured detail block (e.g., physician, visit type, date/time, confirmation code). The sheet dismisses via its close control or the dimmed backdrop, returning the user to the feed; where relevant the detail includes a primary action that deep-links to the related screen (e.g., an appointment reminder to P6).

- **Notification Source Control:** A settings shortcut link back to the Notification Preferences toggles on P2.

## 8. Symptom Checker / AI Triage Advisor (P8) --- NEW

An AI-assisted, non-diagnostic triage tool that helps users describe symptoms and decide on a next step (self-care, book an appointment, or seek urgent/emergency care). Accessible from the Home (P0) entry point.

**MANDATORY MEDICAL SAFETY TRIAGE WARNING (must appear at the top of this screen, in high-visibility red typography, before any input is collected):**

*"If you are experiencing chest pain, severe shortness of breath, sudden numbness, or any life-threatening health crisis, stop using this tool immediately. Close this application and dial 911."*

- **Disclaimer Banner:** Persistent text clarifying this tool does not provide a medical diagnosis and is not a substitute for professional medical advice.

- **Guided Symptom Input:** Structured, conversational prompts (body area, symptom description, duration, severity) rather than free-text-only input, to keep responses bounded and auditable.

- **Triage Outcome Tiers:** The advisor routes to one of three outcomes:

  - Self-Care Guidance: general, non-prescriptive information with a link to book a routine appointment if symptoms persist.
  - Book an Appointment: hands off directly into Step 1 of the Appointment Booking Workflow, pre-filling "Reason for Visit" with the symptom summary.
  - Urgent / Emergency Escalation: surfaces the same red safety warning above and directs the user to call 911 or visit the nearest ER (deep-link to Map View P5 filtered to ER pins).

- **Audit Log:** Each session summary is stored against the user's profile (consistent with PIPA data-minimization principles) and is exportable via the Settings (P2) data-export feature.

## 8a. Physician Info Screen (P9) --- NEW

A dedicated per-physician detail screen. It is reachable from anywhere a physician appears: tapping a physician's name or photo on Home (P0), the Recommended Physicians list, Your Healthcare Team (P4), an Appointment card (P6), or the Booking header (P10) opens this screen for that physician. This global "name/photo → Physician Info" rule is uniform across the app.

- **Primary Actions:** "Book appointment" (opens the Booking page, P10) and "Add to your Healthcare Team" (toggles the physician into/out of the P4 Your Healthcare Team list; when already a member the control reads "In your team").

- **Photo:** Displays the physician's photo. If no photo has been added yet, a gender-based silhouette placeholder is shown (derived from the physician's recorded gender).

- **Full Name & Expertise:** The physician's full name and their area of expertise (specialty), plus overall rating and years of experience.

- **Clinic Address:** The clinic name and address. Tapping the address opens turn-by-turn navigation to that location.

- **Languages:** The languages the physician can speak, shown as tags.

- **Working Hours:** A day-by-day schedule of the physician's working hours, with closed days clearly marked.

- **Reviews & Rating:** At the end of the screen, review comments from patients are listed, together with an overall numeric rating and star summary.

## 8b. Book an Appointment Screen (P10) --- NEW

The booking screen for a selected physician. It replaces the earlier generic entry point into the booking workflow and feeds the Canadian-Compliant Appointment Booking Workflow (Section 10).

- **Physician Header:** Full name and expertise at the top; tapping either the name or the photo opens the physician's Physician Info page (P9).

- **Visit-Type Filters:** Three on/off toggles --- Walk-in, Virtual, and Phone --- using the same control style as the Notification toggle on the Settings screen. All three default to On. The selected combination determines which availability is shown.

- **First Availability:** Based on the active filters, the screen surfaces the physician's first available time. If all visit types are toggled off, availability is hidden and the user is prompted to enable at least one.

- **Calendar & Timeslots:** A standard month calendar highlights available days (with the selected day emphasized) alongside a scrollable list of that day's timeslots in the clinic's timezone (PDT), with the chosen slot highlighted. A legend distinguishes available vs. unavailable days.

- **Reason for Visit / Symptom Note:** A free-text note field titled "Reason for visit / Symptom" with placeholder (watermark) text "e.g., stomach pain, doctor's note, etc." The placeholder disappears as soon as the first character is typed.

---

# PART III: WORKFLOWS & PROCEDURAL PIPELINES

## 9. Secure Authentication & Onboarding Loop (P3)

Standardized progression pipeline designed to securely verify user credentials and build records.

- **Step 1 --- Primary Identity Selection:** The unauthenticated Profile entry point presents two choices --- "Create an account" and "Log in." Both support federated sign-in via OAuth (Continue with Google / Continue with Apple / other providers) alongside traditional Email & Password credentials.

- **Step 2 --- Canadian Legal Compliance Consent:** Mandates active checkbox confirmation to accept Terms of Service and the PIPA-based Privacy Policy, explicitly addressing data housing across Canadian infrastructure.

- **Step 3 --- Multi-Factor Phone Validation:** User submits their active mobile number, triggering an automated 6-digit OTP via SMS to establish an identity confirmation anchor.

- **Step 4 --- Optional Health Demographic Profiling:** An onboarding screen allowing optional input of: Gender (M/F/X), Date of Birth, 10-digit Healthcare Number, and Extended Health Insurance details.

## 10. Canadian-Compliant Appointment Booking Workflow

An intuitive multi-tier booking system built to respect Canadian provincial healthcare architectures and EMR integration logic.

**MANDATORY MEDICAL SAFETY TRIAGE WARNING (must also appear here, at Step 1, in addition to the Symptom Checker P8):**

*"If you are experiencing chest pain, severe shortness of breath, sudden numbness, or any life-threatening health crisis, stop this booking instantly. Close this application and dial 911 immediately."*

- **Step 1 --- Selection & Context Initializer:** The booking pipeline triggers via the "Book" button on Home (P0), a Health Condition Meter milestone on P4, a locator card on Map View (P5), or a routed outcome from the Symptom Checker (P8).

- **Step 2 --- Delivery Mode Selection:** The system prompts the user to define their care delivery approach:

  - *In-Clinic / Walk-in:* Injects an inline notification: "Please remember to bring physical photo ID and your provincial health services card to the clinic site."
  - *Virtual Video Consultation:* Launches an automated device diagnostic check confirming camera/microphone state and alerts: "Private network connection recommended; do not access telemedicine appointments via open public Wi-Fi channels."
  - *Telephone Call:* Validates the target confirmation phone number matches the primary device payload.

- **Step 3 --- Medical Sorting & Reason for Visit:** Presents a clean intake interface categorizing the treatment context via drop-down tags (e.g., Prescription Renewal, Acute Care Symptom, Chronic Disease Follow-up, Routine Physical). If arriving from the Symptom Checker (P8), this field is pre-filled with the symptom summary for the user to confirm or edit.

- **Step 4 --- Public vs. Private Insurance Validation:** Evaluates provincial insurance funding structures prior to reserving calendar slots:

  - *Provincial Health Coverage:* Pulls the masked 10-digit Healthcare Number on file to route the booking through public medical plan frameworks (e.g., BC MSP billing codes).
  - *Uninsured / Private / Out-of-Province:* If the Healthcare Number field is empty, displays an alert modal: "No active provincial health registry found. Out-of-province or private uninsured consulting rates apply ($95.00 CAD per session)."

- **Step 5 --- Calendar Allocation Interface:** Shows time configurations syncing with the provider's back-end EMR software. For dynamic walk-in environments, shifts to show real-time wait placement queues (e.g., "Join Waitlist Queue. Estimated practitioner callback window: 11:45 AM").

- **Step 6 --- Attendance Policies & Confirmation Screen:** Presents a final transactional layout requiring explicit acknowledgement: "Cancellations under 12 hours or missed appointments are subject to a $50.00 CAD clinic fee, which cannot be billed to public provincial insurance plans." On submission, outputs a confirmation card with one-tap calendar syncing links and a native launch pathway for secure video-consult rooms --- the resulting appointment then appears on the Appointments screen (P6).

---

# Document Change Log (v0.5 → v0.6)

Version 0.6 adds physician-detail and booking screens and refines the appointment and alert experiences. The following changes are authoritative:

### 1. Physician Info screen (P9) and global tap rule

Added a per-physician Physician Info screen showing photo (gender-based silhouette when none is set), full name, expertise, tappable clinic address (opens navigation), languages, working hours, and reviews with an overall rating --- plus "Book appointment" and "Add to your Healthcare Team." A uniform rule now applies everywhere: tapping a physician's name or photo opens this screen. Adding a physician here inserts them into the Your Healthcare Team list (P4).

### 2. Book an Appointment screen (P10)

Added a booking screen with the physician's name and expertise (both tap through to P9), Walk-in / Virtual / Phone visit-type on/off toggles (same control as the Settings Notification toggle; all default On), a first-availability line driven by the active filters, a standard month calendar with a timeslot column, and a "Reason for visit / Symptom" note whose placeholder ("e.g., stomach pain, doctor's note, etc.") clears on the first keystroke.

### 3. Appointments screen restructure (P6)

Replaced the Upcoming/Past tab switcher with two stacked sections on one scroll: Upcoming first (nearest→farthest), Past next (newest→oldest). Each card shows the physician's expertise beneath the name; dates within one day render as "Yesterday"/"Tomorrow," otherwise the calendar date. Past entries expose "Book Again" (into P10); Upcoming actions are unchanged. Name/photo taps open P9.

### 4. Alerts detail popup (P7)

Tapping an alert now opens a detail popup (bottom sheet) with the full text and a structured detail block, dismissible via its close control or the backdrop.

---

# Document Change Log (v0.4 → v0.5)

Version 0.5 applies a second round of UX revisions on top of v0.4. The following changes are authoritative:

### 1. Settings surfaced inside the hamburger menu

Application Settings (P2) is now reached through the Settings item in the hamburger drawer rather than as a standalone navigation destination. Selecting Settings expands its groups --- App view, App Security, and Legal --- inline within the drawer. The P2 screen definition itself is retained unchanged as the canonical description of those controls.

### 2. Overlay drawer with close (X) toggle and return-to-origin

Opening the hamburger menu now presents the drawer as an overlay above the current screen (which is dimmed, not replaced). While open, the hamburger icon changes to a close (X) control. Tapping the X --- or the drawer's in-header close control, or the dimmed backdrop --- dismisses the drawer and returns the user to the exact screen they were viewing when they opened it.

### 3. Logo mark relocated above the wordmark (top-right)

The DrFinder logo icon (location pin + medical cross with magnifier/pulse glyph + stethoscope, in the brand teals) is placed directly above the "DrFinder" wordmark in the top-right of the global chrome. All other chrome elements are unchanged.

### 4. "PHN" renamed to "Healthcare Number"

All patient-facing displays that previously read "PHN" or "Personal Health Number" now read "Healthcare Number," including the Profile screen, drawer header, and booking/eligibility flows. The underlying value remains the masked 10-digit provincial number (e.g. ••••••••81).

---

# Document Change Log (v0.3 → v0.4)

Version 0.4 applies a round of UX and terminology revisions on top of the v0.3 merged specification. The following changes are authoritative:

### 1. Global navigation chrome (all screens)

Every screen now uses the same chrome: a hamburger menu in the top-left, a centered greeting ("Hi [First Name]!" when signed in; empty when signed out), and the DrFinder logo in the top-right. The bottom navigation bar is present on every screen with four items: Home, Appointments, Alerts, and Profile. The hamburger is available on every page.

### 2. Expanded hamburger menu

The drawer contents are now: (1) Map View; (2) Your Healthcare Team; (3) Settings --- App view [Notification; Dark/Light Mode], App Security [Two-step Verification; FaceID/Passcode; Delete Account], Legal [Terms of Use; Privacy Policy]; (4) Contact --- Contact Us [Call; Email], App Feedback [Rate]; (5) Log out.

### 3. Profile field set (P1)

Signed-in Profile now contains: First Name, Last Name, Gender, Date of Birth, Healthcare Number, Phone, Email, and Extended Health Insurance (Carrier Number, Contract Number, Member's ID Number). Signed-out Profile presents two entry points --- "Create an account" (sign-up, with Google / Apple / other OAuth providers alongside Email & Password) and "Log in."

### 4. Terminology updates

"Well Guide" / "Health Condition Meter" → Health Screening. "My Providers" / "My Healthcare Team" screen → Your Healthcare Team. "Add a provider" → Add a Physician. "Family Medicine" → Family Physician throughout.

### 5. Map screen (P5)

Added a search bar to the Map screen and aligned the header, category filter chips (All / Urgent & walk-in / Pharmacy / Primary care / Therapy), coloured pins, and the persistent 911 notice with the supplied reference design.

### 6. "Add a Physician" layout

The physician-category picker on Your Healthcare Team (P4) is laid out two boxes per row and flows vertically, removing the previous left/right horizontal scroll.

---

# Reconciliation with v0.0 (original author intent prevails)

Version 0.3 merges the original author brief (v0.0) into the corrected specification (v0.2). Per the reconciliation rule for this revision, wherever v0.0 and v0.2 conflict, the original v0.0 intent prevails. Version 0.3 also re-attaches the reference wireframe screenshots that were present in v0.0 but dropped from v0.2 (see the Reference Wireframes appendix).

The following points in v0.2 were reconciled against the original v0.0 brief. In each case the v0.0 position is now authoritative:

### 1. "Find Physician" ranking signal

v0.2 had re-framed "Find Physician" so that GPS device location was the primary signal and IP location only a low-precision fallback. The original v0.0 brief defines "Find physician" as returning all physicians based on IP and sponsorship. v0.3 restores the v0.0 definition: the "Find Physician" result set is ordered by IP-based location and sponsored placement. (GPS remains the primary signal for the "Near Me" map shortcut only.)

### 2. Hamburger drawer contents

v0.2 added "My Healthcare Team (P4)" into the hamburger drawer. The original v0.0 drawer lists Profile/Login (P1), Settings (P2), Map View (P5), and Logout only. v0.3 treats the v0.0 set as canonical; P4 in the drawer is optional and secondary, with the primary entry point to P4 remaining the Home-screen banner.

### 3. Health Condition Meter naming

v0.2 rebranded the wellness element as the "Health Condition Meter (Wellness Tracker)". The original v0.0 term is simply "health condition meter"; v0.3 keeps the original name and drops the "Wellness Tracker" label.

### 4. Home service grid (per the v0.0 annotated wireframe)

The annotated v0.0 wireframe (see Reference Wireframe F) marks the Home service grid directly: "Prescriptions" and "Vaccinations" are struck out, "Health conditions" is changed to "Advices" (Phase 2), and "Documents" is retained. v0.3 adopts this as the authoritative Home grid: Appointments (P6, live), Test Results (Phase 2), Advices (Phase 2, formerly "Health conditions"), and Documents (Phase 2). Prescriptions and Vaccinations are removed from the Patient View scope.

### 5. Footer Profile label

Per v0.0, the footer "Profile" tab displays the signed-in user's name when logged in, and the generic "Profile" label (routing to the P1 login flow) when logged out.

---

# Reference Wireframes (carried over from v0.0)

The following reference screenshots were included in the original v0.0 brief as visual examples ("grab the idea" references from other apps and the annotated template). They are re-attached here for v0.3. The final image is the original author's marked-up template wireframe and carries the annotations referenced in the reconciliation notes above.

## A. App logo mark

![](media/image4.png){width="0.45in" height="0.36in"}

## B. Appointments --- empty / preventive-care state

![](media/image1.png){width="2.9in" height="6.304882983377078in"}

## C. My Health --- profile, history, insurance & Well Guide

![](media/image2.png){width="2.9in" height="6.304882983377078in"}

## D. Provider search & Well Guide recommendations

![](media/image3.png){width="2.9in" height="6.304882983377078in"}

## E. Well Guide card (detail)

![](media/image5.jpg){width="3.0in" height="4.497512029746281in"}

## F. Annotated Home template (original author markup)

Author annotations on this wireframe are authoritative for v0.3: "Prescriptions" and "Vaccinations" are struck out (removed from scope), "Health conditions" is relabeled "Advices" (Phase 2), and the "My Healthcare team" banner is emphasized.

![](media/image6.png){width="3.1in" height="6.6in"}