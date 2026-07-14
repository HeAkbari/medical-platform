/** Assigned by clinic/system — not patient-selectable. */
export const DEFAULT_FAMILY_PHYSICIAN_ID =
  'd4e5f6a7-b8c9-0123-def0-234567890123';

/** Seed team members the patient can manage (add/remove). */
export const DEFAULT_TEAM_MEMBER_IDS = [
  'e5f6a7b8-c9d0-1234-ef01-345678901234', // Dr. David Brooks · Cardiology
];

export const VISIT_DELIVERY_METHODS = [
  'In-Clinic / Walk-in',
  'Telephone Call',
  'Virtual Video Consultation',
] as const;

export interface HealthConditionMilestone {
  id: string;
  label: string;
  /** Shown when complete, e.g. "Apr 3, 2026". Null = show "add" link. */
  lastVisitAt: string | null;
  complete: boolean;
}

export const HEALTH_CONDITION_MILESTONES: HealthConditionMilestone[] = [
  {
    id: 'annual-checkup',
    label: 'Annual checkup',
    lastVisitAt: 'Apr 3, 2026',
    complete: true,
  },
  {
    id: 'skin-check',
    label: 'Skin check',
    lastVisitAt: null,
    complete: false,
  },
  {
    id: 'teeth-cleaning',
    label: 'Teeth cleaning',
    lastVisitAt: null,
    complete: false,
  },
  {
    id: 'eye-exam',
    label: 'Eye exam',
    lastVisitAt: null,
    complete: false,
  },
  {
    id: 'hearing-test',
    label: 'Hearing test',
    lastVisitAt: null,
    complete: false,
  },
];

export interface RebookingHistoryItem {
  id: string;
  providerName: string;
  visitType: string;
  visitedAt: string;
  reason: string;
}

export const MOCK_REBOOKING_HISTORY: RebookingHistoryItem[] = [
  {
    id: 'rebook-1',
    providerName: 'Dr. Emily Nguyen',
    visitType: 'In-Clinic / Walk-in',
    visitedAt: '2026-05-14T15:30:00.000Z',
    reason: 'Prescription renewal',
  },
  {
    id: 'rebook-2',
    providerName: 'Dr. Emily Nguyen',
    visitType: 'Virtual Video Consultation',
    visitedAt: '2026-03-02T10:00:00.000Z',
    reason: 'Follow-up — blood pressure',
  },
  {
    id: 'rebook-3',
    providerName: 'Dr. David Brooks',
    visitType: 'Telephone Call',
    visitedAt: '2026-01-20T14:15:00.000Z',
    reason: 'Cardiology consult results',
  },
];

export const MOCK_PROVIDER_VISIT_HISTORY: RebookingHistoryItem[] =
  MOCK_REBOOKING_HISTORY.filter((item) =>
    item.providerName.includes('Nguyen')
  );

/** Mock availability slots shown on the family physician panel. */
export const MOCK_AVAILABILITY_SLOTS = [
  'Today · 2:30 PM',
  'Tomorrow · 9:00 AM',
  'Thu · 11:15 AM',
];
