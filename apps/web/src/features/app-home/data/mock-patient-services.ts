import type {
  MockAllergy,
  MockHealthCondition,
  MockHealthDocument,
  MockMedicineReaction,
  MockPrescription,
  MockTestResult,
  MockVaccination,
} from '@/features/app-home/types/patient-services';

/** Mock patient record — Jane Rivera (dev auth default). */
export const MOCK_PATIENT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

export const MOCK_PRESCRIPTIONS: MockPrescription[] = [
  {
    id: 'rx-001',
    medication: 'Atorvastatin',
    dosage: '20 mg · once daily',
    prescribedBy: 'Dr. Emily Nguyen · Fairfield Family Medical',
    pharmacy: 'Shoppers Drug Mart — Hillside Ave',
    status: 'active',
    lastIssuedAt: '2026-04-02T00:00:00.000Z',
    repeatsRemaining: 3,
    nextOrderEligibleAt: '2026-05-20T00:00:00.000Z',
    instructions: 'Take in the evening with food.',
  },
  {
    id: 'rx-002',
    medication: 'Levothyroxine',
    dosage: '50 mcg · once daily',
    prescribedBy: 'Dr. Emily Nguyen · Fairfield Family Medical',
    pharmacy: 'Save-On-Foods Pharmacy — Fairfield',
    status: 'active',
    lastIssuedAt: '2026-03-15T00:00:00.000Z',
    repeatsRemaining: 5,
    nextOrderEligibleAt: '2026-06-01T00:00:00.000Z',
    instructions: 'Take on an empty stomach, 30 minutes before breakfast.',
  },
  {
    id: 'rx-003',
    medication: 'Salbutamol inhaler',
    dosage: '100 mcg · 2 puffs when needed',
    prescribedBy: 'Dr. Emily Nguyen · Fairfield Family Medical',
    pharmacy: 'London Drugs — Uptown',
    status: 'processing',
    lastIssuedAt: '2026-05-22T00:00:00.000Z',
    repeatsRemaining: 2,
    instructions: 'Use for shortness of breath or wheeze. Max 8 puffs in 24 hours.',
  },
  {
    id: 'rx-004',
    medication: 'Metformin',
    dosage: '500 mg · twice daily',
    prescribedBy: 'Dr. Emily Nguyen · Fairfield Family Medical',
    pharmacy: 'Shoppers Drug Mart — Hillside Ave',
    status: 'needs-review',
    lastIssuedAt: '2025-11-08T00:00:00.000Z',
    repeatsRemaining: 0,
    instructions: 'Repeat prescription expired — book a GP review to renew.',
  },
];

export const MOCK_TEST_RESULTS: MockTestResult[] = [
  {
    id: 'lab-001',
    testName: 'Complete blood count (CBC)',
    orderedBy: 'Dr. Emily Nguyen',
    facility: 'LifeLabs — Victoria Downtown',
    sampleDate: '2026-05-10T09:30:00.000Z',
    resultDate: '2026-05-11T14:20:00.000Z',
    status: 'available',
    summary: 'All values within normal range.',
    flag: 'normal',
  },
  {
    id: 'lab-002',
    testName: 'Lipid panel',
    orderedBy: 'Dr. Emily Nguyen',
    facility: 'LifeLabs — Victoria Downtown',
    sampleDate: '2026-05-10T09:30:00.000Z',
    resultDate: '2026-05-11T14:20:00.000Z',
    status: 'available',
    summary: 'LDL slightly above target — continue current management plan.',
    flag: 'high',
  },
  {
    id: 'lab-003',
    testName: 'HbA1c',
    orderedBy: 'Dr. Emily Nguyen',
    facility: 'LifeLabs — Victoria Downtown',
    sampleDate: '2026-05-10T09:30:00.000Z',
    resultDate: '2026-05-11T16:05:00.000Z',
    status: 'available',
    summary: '6.8% — improved from previous reading. Follow-up in 3 months.',
    flag: 'review',
  },
  {
    id: 'lab-004',
    testName: 'Urinalysis',
    orderedBy: 'Dr. Emily Nguyen',
    facility: 'LifeLabs — Victoria Downtown',
    sampleDate: '2026-05-24T08:15:00.000Z',
    status: 'pending',
    summary: 'Sample received — results usually within 2 business days.',
  },
  {
    id: 'lab-005',
    testName: 'Chest X-ray',
    orderedBy: 'Dr. David Brooks',
    facility: 'Royal Jubilee Hospital',
    sampleDate: '2026-04-18T11:00:00.000Z',
    resultDate: '2026-04-19T09:45:00.000Z',
    status: 'available',
    summary: 'No acute cardiopulmonary abnormality identified.',
    flag: 'normal',
  },
];

export const MOCK_HEALTH_CONDITIONS: MockHealthCondition[] = [
  {
    id: 'cond-001',
    name: 'Type 2 diabetes',
    status: 'active',
    diagnosedAt: '2020-06-14T00:00:00.000Z',
    recordedBy: 'Dr. Emily Nguyen',
    notes: 'Managed with diet, metformin, and quarterly HbA1c monitoring.',
  },
  {
    id: 'cond-002',
    name: 'Hypothyroidism',
    status: 'active',
    diagnosedAt: '2019-03-22T00:00:00.000Z',
    recordedBy: 'Dr. Emily Nguyen',
    notes: 'Stable on levothyroxine. TSH checked annually.',
  },
  {
    id: 'cond-003',
    name: 'Seasonal allergic rhinitis',
    status: 'monitored',
    diagnosedAt: '2015-04-01T00:00:00.000Z',
    recordedBy: 'Dr. Emily Nguyen',
    notes: 'Spring pollen — antihistamines as needed.',
  },
  {
    id: 'cond-004',
    name: 'Childhood asthma',
    status: 'resolved',
    diagnosedAt: '1998-09-10T00:00:00.000Z',
    recordedBy: 'Dr. Sarah Kim',
    notes: 'No exacerbations in 5+ years. Salbutamol kept for occasional use.',
  },
];

export const MOCK_ALLERGIES: MockAllergy[] = [
  {
    id: 'allergy-001',
    allergen: 'Penicillin',
    reaction: 'Hives and swelling',
    severity: 'severe',
    recordedAt: '2012-08-05T00:00:00.000Z',
  },
  {
    id: 'allergy-002',
    allergen: 'Tree pollen (birch)',
    reaction: 'Sneezing, itchy eyes',
    severity: 'mild',
    recordedAt: '2015-04-01T00:00:00.000Z',
  },
];

export const MOCK_MEDICINE_REACTIONS: MockMedicineReaction[] = [
  {
    id: 'react-001',
    medicine: 'Codeine',
    reaction: 'Nausea and dizziness',
    recordedAt: '2018-02-12T00:00:00.000Z',
  },
];

export const MOCK_VACCINATIONS: MockVaccination[] = [
  {
    id: 'vac-001',
    vaccine: 'Influenza (2025–26 season)',
    date: '2025-10-14T00:00:00.000Z',
    provider: 'Public Health — Victoria',
    status: 'completed',
    doseLabel: 'Annual dose',
  },
  {
    id: 'vac-002',
    vaccine: 'COVID-19 booster',
    date: '2025-11-03T00:00:00.000Z',
    provider: 'London Drugs — Uptown',
    status: 'completed',
    doseLabel: 'XBB.1.5 formulation',
  },
  {
    id: 'vac-003',
    vaccine: 'Tdap (Tetanus, diphtheria, pertussis)',
    date: '2022-06-20T00:00:00.000Z',
    provider: 'Fairfield Family Medical',
    status: 'completed',
  },
  {
    id: 'vac-004',
    vaccine: 'Tetanus booster',
    provider: 'Your GP or pharmacy',
    status: 'due',
    dueDate: '2027-06-20T00:00:00.000Z',
    doseLabel: 'Next due in ~14 months',
  },
  {
    id: 'vac-005',
    vaccine: 'Shingles (Shingrix)',
    provider: 'Book at pharmacy or clinic',
    status: 'scheduled',
    dueDate: '2026-09-01T00:00:00.000Z',
    doseLabel: 'Dose 1 of 2 — eligible at age 50+',
  },
];

export const MOCK_HEALTH_DOCUMENTS: MockHealthDocument[] = [
  {
    id: 'doc-001',
    title: 'Referral to Endocrinology',
    type: 'referral',
    from: 'Dr. Emily Nguyen · Fairfield Family Medical',
    date: '2026-05-05T00:00:00.000Z',
    summary: 'Referral for diabetes management review. Bring recent lab results.',
  },
  {
    id: 'doc-002',
    title: 'Medical certificate — sick leave',
    type: 'sick-note',
    from: 'Dr. Emily Nguyen · Fairfield Family Medical',
    date: '2026-04-28T00:00:00.000Z',
    summary: 'Unfit for work 28 Apr – 30 Apr 2026 (3 days).',
  },
  {
    id: 'doc-003',
    title: 'Lab requisition — HbA1c & lipid panel',
    type: 'lab-requisition',
    from: 'Dr. Emily Nguyen · Fairfield Family Medical',
    date: '2026-05-08T00:00:00.000Z',
    summary: 'Fasting blood work. Valid at LifeLabs locations in BC.',
  },
  {
    id: 'doc-004',
    title: 'Discharge summary — Royal Jubilee Hospital',
    type: 'discharge',
    from: 'Royal Jubilee Hospital · Emergency Department',
    date: '2026-03-12T00:00:00.000Z',
    summary: 'Treated for migraine with aura. Follow up with GP if symptoms return.',
  },
  {
    id: 'doc-005',
    title: 'Travel medication letter',
    type: 'letter',
    from: 'Dr. Emily Nguyen · Fairfield Family Medical',
    date: '2026-01-20T00:00:00.000Z',
    summary: 'Letter confirming prescribed medications for international travel.',
  },
];
