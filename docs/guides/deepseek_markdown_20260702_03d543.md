# DrFinder Product Requirement Document (PRD)

*Version: 0.3 (Merged) --- Reconciles the corrected v0.2 specification with the original v0.0 author brief (v0.0 prevails on conflict) and re-attaches the v0.0 reference wireframes. System Scope: Patient View Application Wireframe & Functional Specification*

This document establishes the functional parameters, navigation layout, and procedural workflows for the DrFinder platform. As a private-sector consumer application operating in British Columbia, DrFinder's handling of personal information is primarily governed by BC's Personal Information Protection Act (PIPA), with the federal Personal Information Protection and Electronic Documents Act (PIPEDA) applying to any data that crosses provincial or national borders. (FIPPA applies to public-sector bodies, e.g. health authorities, and is referenced only where DrFinder integrates with public EMR/MSP systems.)

# Document Change Log (v0.1 → v0.2)

The following corrections and additions were made to the original draft:

| # | Change |
| :--- | :--- |
| 1 | Added missing screen definitions: Appointments (P6), Notifications (P7), and Symptom Checker / AI Triage Advisor (P8) --- previously referenced but never specified. |
| 2 | Added a Page ID Map (below) so every referenced screen has a unique, traceable ID. |
| 3 | Unified visit-delivery terminology across the document to: In-Clinic / Walk-in, Telephone Call, Virtual Video Consultation. |
| 4 | Unified location logic: GPS device location is now the primary signal for "Find Physician" and "Near Me"; IP-based location is documented only as a low-precision fallback when GPS permission is denied. |
| 5 | Corrected privacy/compliance framing from "FIPPA/PIPA" to PIPA (primary, private sector) and PIPEDA (cross-border), with FIPPA scoped to public-sector integrations only. |
| 6 | Added a "Download / Export My Data" feature to Settings (P2) to satisfy PIPA data-access/portability rights, alongside the existing Account Destruction Portal. |
| 7 | Corrected Legal Sex field options from [Male / Female / Other] to [M / F / X], matching BC vital statistics designations. |
| 8 | Standardized PHN display as a plain masked 10-digit string (••••••••81) rather than a dashed/grouped format not used anywhere else in the spec. |
| 9 | Added Doctor's Office / Clinic as a pin category on the Map & Clinic Locator (P5) --- previously omitted from an app centered on physician discovery. |
| 10 | Promoted the Mandatory Medical Safety Triage Warning to also appear on the Symptom Checker (P8) entry screen and at Step 1 of the booking workflow, not only at Step 3. |
| 11 | Linked the Home (P0) "My Healthcare Team" banner and footer nav explicitly to P4, and added P4 to the hamburger drawer for discoverability. |

# Page ID Map

Quick-reference index of every screen and its unique ID. Use these IDs in wireframe file names and dev tickets.

| ID | Screen |
| :--- | :--- |
| P0 | Home / Dashboard |
| P1 | Profile Management |
| P2 | Application Settings |
| P3 | Secure Authentication & Onboarding Loop |
| P4 | My Healthcare Team Dashboard |
| P5 | Map & Clinic Locator |
| P6 | Appointments (NEW) |
| P7 | Notifications (NEW) |
| P8 | Symptom Checker / AI Triage Advisor (NEW) |

# PART I: GLOBAL LAYOUT & INFRASTRUCTURE

## 1. Home Screen / Dashboard (P0)

The main entry landing page containing universal navigation, immediate search triage, and structural component layouts.

### Global Top Bar Components

- **Logo (Top Left):** Fixed brand placement across all app-wide interfaces.
- **Hamburger Menu (☰):** Tapping activates a sliding drawer containing: Profile/Login (P1), My Healthcare Team (P4), Settings (P2), Map View (P5), and a secure Logout switch.

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

# PART II: PAGE DEFINITIONS & STATE LOGIC

## 2. Profile Management Screen (P1)

Manages user demographics, contact metrics, and identity validation layers divided strictly by system state logic.

**Profile (P1) - Authenticated State**

- **User Avatar / Photo Field**
- **Personal Details:**
  - Email Address: f*******@gmail.com
  - Phone Number: +1 (604) XXX-XXXX
  - Legal Sex: [ M / F / X ]
  - Date of Birth: January 1, 1999
- **Healthcare Identifiers:**
  - Personal Health Number (PHN): ••••••••81 [eye icon]
  - Family Physician: Dr. [Name] (or add+)

> **Inline Banner:** Missing fields impact booking speed

- **State A --- Guest / Unauthenticated:** Automatically shifts user context into the secure Onboarding and Verification Loop (P3).
- **State B --- Authenticated / Logged In:** Populates complete data entries and enables standard field modification for Email, Verified Mobile Number, Legal Sex, Date of Birth (DOB), Personal Health Number (PHN), and designated Family Physician.
- **UX Pattern Requirement:** For any empty field parameter, an inline notice or visual reminder badge encourages input completion to streamline digital triage at local clinics.
- **Data Format Note:** PHN is a plain 10-digit provincial number with no internal grouping; the masked display should follow suit (e.g. ••••••••81), not a dashed/grouped format.

## 3. Application Settings Screen (P2)

Provides standardized administrative utilities and system preferences control layers.

- **Notification Preferences:** Independent toggles mapping out Push alerts, SMS notifications, and Email updates for appointment bookings or message drops.
- **Privacy & Security Configuration:** Toggles to regulate explicit third-party data-sharing permissions and behavioral logging metrics.
- **Download / Export My Data (NEW):** Generates a portable export (e.g. PDF/CSV) of the user's profile, healthcare-team, and appointment-history data, satisfying PIPA data-access and portability rights.
- **Biometrics Integration:** Step-2 validation configuration setting allowing automated Face ID / Touch ID authentication during app start or checkout validation.
- **Visual Theme Manager:** Dark Mode / Light Mode interface toggles.
- **Compliance Documentation:** Links to Canadian healthcare guidelines, Terms of Use, and the PIPA-based Privacy Policy.
- **Account Destruction Portal:** Secure double-confirmation process enabling quick and irreversible account deletion requests.

## 4. My Healthcare Team Dashboard (P4)

The centralized medical home screen outlining practitioner links and long-term wellness metrics.

- **Family Physician Management Anchor:** Renders the primary profile block of the patient's primary practitioner. In a null state, replaces it with an "Add Family Physician" primary button.
- **Physician Hub Sub-Views (Modules A & B):** Provider-specific data panels featuring:
  - Real-time practitioner booking availability calendars.
  - Supported visit delivery methods: In-Clinic / Walk-in, Telephone Call, or Virtual Video Consultation.
  - A primary action button: "Book an Appointment with This Provider."
  - A history log filtering historical patient visits tied exclusively to that single doctor.
- **Re-Booking History List:** A vertical checklist summarizing historic appointments, allowing a one-tap renewal booking experience.
- **Health Condition Meter:** An interactive progress element evaluating care-plan checkpoints:
  1. Designation and validation of an active Family Physician.
  2. Completion status of routine baseline lab tests (e.g., annual blood panels).
  3. Age-standardized preventative milestone screenings.
  4. Scalable slot configuration to integrate additional custom metrics in later version rollouts.

## 5. Map & Clinic Locator Screen (P5)

Geospatial search component to source nearby healthcare infrastructure.

- **Geospatial Mapping Interface:** Map display pinning validated regional walk-in clinics, doctor's offices / clinics (NEW), operational ER centers, and pharmacies based on device GPS telemetry.
- **Clinic Context Slider Card:** Selecting a pin slides a bottom pane context window highlighting:
  - Clinic Status indicators (e.g., "Open" / "Closed" / "At Capacity").
  - Live Wait Time Estimates: public or clinic-reported wait lengths (e.g., "Estimated Clinic Wait: 45 Minutes").
  - A primary action link feeding immediately into the core Appointment Booking Workflow.

## 6. Appointments Screen (P6) --- NEW

A dedicated screen for managing all upcoming and past appointments, accessible from the Home grid and the global footer nav.

- **Tab Switcher:** "Upcoming" and "Past" segmented control at the top of the screen.
- **Upcoming List:** Chronological cards showing provider name/photo, visit type icon (In-Clinic / Telephone / Virtual), date & time, and clinic/location if applicable.
- **Appointment Card Actions:** Reschedule, Cancel (surfaces the 12-hour/$50 CAD cancellation policy before confirming), Join Video Call (active only within a pre-set time window of the appointment), Get Directions (for in-clinic visits, deep-links to Map View P5).
- **Past List:** Read-only history with a "Book Again" one-tap action per entry, mirroring the Re-Booking History List on P4.
- **Empty State:** If no appointments exist, shows a prompt directing the user into the booking workflow (Find Physician or Symptom Checker).

## 7. Notifications Screen (P7) --- NEW

A centralized notification feed, accessible from the global footer nav (bell icon).

- **Feed List:** Reverse-chronological list of system events: appointment reminders, booking confirmations, cancellations, waitlist callbacks, and care-plan milestone alerts from the Health Condition Meter (P4).
- **Read / Unread State:** Unread items are visually distinguished (e.g., dot indicator); the footer nav badge count reflects unread totals (the original wireframe's "17" badge is illustrative only, not a fixed spec value).
- **Tap Behavior:** Tapping a notification deep-links to the relevant screen (e.g., an appointment reminder opens that appointment's card on P6).
- **Notification Source Control:** A settings shortcut link back to the Notification Preferences toggles on P2.

## 8. Symptom Checker / AI Triage Advisor (P8) --- NEW

An AI-assisted, non-diagnostic triage tool that helps users describe symptoms and decide on a next step (self-care, book an appointment, or seek urgent/emergency care). Accessible from the Home (P0) entry point.

> **MANDATORY MEDICAL SAFETY TRIAGE WARNING (must appear at the top of this screen, in high-visibility red typography, before any input is collected):**
>
> *"If you are experiencing chest pain, severe shortness of breath, sudden numbness, or any life-threatening health crisis, stop using this tool immediately. Close this application and dial 911."*

- **Disclaimer Banner:** Persistent text clarifying this tool does not provide a medical diagnosis and is not a substitute for professional medical advice.
- **Guided Symptom Input:** Structured, conversational prompts (body area, symptom description, duration, severity) rather than free-text-only input, to keep responses bounded and auditable.
- **Triage Outcome Tiers:** The advisor routes to one of three outcomes:
  - Self-Care Guidance: general, non-prescriptive information with a link to book a routine appointment if symptoms persist.
  - Book an Appointment: hands off directly into Step 1 of the Appointment Booking Workflow, pre-filling "Reason for Visit" with the symptom summary.
  - Urgent / Emergency Escalation: surfaces the same red safety warning above and directs the user to call 911 or visit the nearest ER (deep-link to Map View P5 filtered to ER pins).
- **Audit Log:** Each session summary is stored against the user's profile (consistent with PIPA data-minimization principles) and is exportable via the Settings (P2) data-export feature.

# PART III: WORKFLOWS & PROCEDURAL PIPELINES

## 9. Secure Authentication & Onboarding Loop (P3)

Standardized progression pipeline designed to securely verify user credentials and build records.

- **Step 1 --- Primary Identity Selection:** User inputs traditional credentials (Email & Password) or executes federated identity protocols via OAuth (Sign in with Google / Sign in with Apple).
- **Step 2 --- Canadian Legal Compliance Consent:** Mandates active checkbox confirmation to accept Terms of Service and the PIPA-based Privacy Policy, explicitly addressing data housing across Canadian infrastructure.
- **Step 3 --- Multi-Factor Phone Validation:** User submits their active mobile number, triggering an automated 6-digit OTP via SMS to establish an identity confirmation anchor.
- **Step 4 --- Optional Health Demographic Profiling:** An onboarding screen allowing optional input of: Legal Sex (M/F/X), Date of Birth, 10-digit provincial PHN, and active Family Physician name.

## 10. Canadian-Compliant Appointment Booking Workflow

An intuitive multi-tier booking system built to respect Canadian provincial healthcare architectures and EMR integration logic.

> **MANDATORY MEDICAL SAFETY TRIAGE WARNING (must also appear here, at Step 1, in addition to the Symptom Checker P8):**
>
> *"If you are experiencing chest pain, severe shortness of breath, sudden numbness, or any life-threatening health crisis, stop this booking instantly. Close this application and dial 911 immediately."*

- **Step 1 --- Selection & Context Initializer:** The booking pipeline triggers via the "Book" button on Home (P0), a Health Condition Meter milestone on P4, a locator card on Map View (P5), or a routed outcome from the Symptom Checker (P8).
- **Step 2 --- Delivery Mode Selection:** The system prompts the user to define their care delivery approach:
  - *In-Clinic / Walk-in:* Injects an inline notification: "Please remember to bring physical photo ID and your provincial health services card to the clinic site."
  - *Virtual Video Consultation:* Launches an automated device diagnostic check confirming camera/microphone state and alerts: "Private network connection recommended; do not access telemedicine appointments via open public Wi-Fi channels."
  - *Telephone Call:* Validates the target confirmation phone number matches the primary device payload.
- **Step 3 --- Medical Sorting & Reason for Visit:** Presents a clean intake interface categorizing the treatment context via drop-down tags (e.g., Prescription Renewal, Acute Care Symptom, Chronic Disease Follow-up, Routine Physical). If arriving from the Symptom Checker (P8), this field is pre-filled with the symptom summary for the user to confirm or edit.
- **Step 4 --- Public vs. Private Insurance Validation:** Evaluates provincial insurance funding structures prior to reserving calendar slots:
  - *Provincial Health Coverage:* Pulls the masked 10-digit provincial PHN on file to route the booking through public medical plan frameworks (e.g., BC MSP billing codes).
  - *Uninsured / Private / Out-of-Province:* If the PHN field is empty, displays an alert modal: "No active provincial health registry found. Out-of-province or private uninsured consulting rates apply ($95.00 CAD per session)."
- **Step 5 --- Calendar Allocation Interface:** Shows time configurations syncing with the provider's back-end EMR software. For dynamic walk-in environments, shifts to show real-time wait placement queues (e.g., "Join Waitlist Queue. Estimated practitioner callback window: 11:45 AM").
- **Step 6 --- Attendance Policies & Confirmation Screen:** Presents a final transactional layout requiring explicit acknowledgement: "Cancellations under 12 hours or missed appointments are subject to a $50.00 CAD clinic fee, which cannot be billed to public provincial insurance plans." On submission, outputs a confirmation card with one-tap calendar syncing links and a native launch pathway for secure video-consult rooms --- the resulting appointment then appears on the Appointments screen (P6).

# Document Change Log (v0.2 → v0.3)

Version 0.3 merges the original author brief (v0.0) into the corrected specification (v0.2). Per the reconciliation rule for this revision, wherever v0.0 and v0.2 conflict, the original v0.0 intent prevails. Version 0.3 also re-attaches the reference wireframe screenshots that were present in v0.0 but dropped from v0.2 (see the Reference Wireframes appendix).

## Reconciliation with v0.0 (original author intent prevails)

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