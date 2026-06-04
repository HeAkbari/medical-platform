import type { HealthTopic } from '@/features/app-home/types/health-information';

export const HEALTH_AZ_DISCLAIMER =
  'General health information for BC residents. Not a substitute for advice from your clinician. For urgent concerns, call 911 or 811 (HealthLink BC).';

export const HEALTH_TOPICS: HealthTopic[] = [
  {
    id: 'asthma',
    title: 'Asthma',
    category: 'condition',
    letter: 'A',
    summary:
      'A long-term condition where airways become inflamed and narrow, causing wheeze and breathlessness.',
    sections: [
      {
        heading: 'Common symptoms',
        body: 'Wheezing, cough (especially at night), chest tightness, and shortness of breath. Symptoms often vary with triggers such as cold air, exercise, or allergens.',
      },
      {
        heading: 'Managing asthma in BC',
        body: 'Work with your GP or respirologist on an action plan. Most controller and reliever inhalers require a prescription. Carry your reliever (e.g. salbutamol) if prescribed. Annual flu vaccination is recommended.',
      },
      {
        heading: 'When to seek help',
        body: 'Use your action plan for worsening symptoms. Call 911 if reliever does not help, lips turn blue, or speaking full sentences is difficult.',
      },
    ],
    relatedTopicIds: ['influenza', 'allergies'],
  },
  {
    id: 'blood-pressure',
    title: 'Blood pressure (hypertension)',
    category: 'condition',
    letter: 'B',
    summary:
      'High blood pressure often has no symptoms but increases risk of stroke and heart disease.',
    sections: [
      {
        heading: 'Understanding readings',
        body: 'Blood pressure is recorded as two numbers (e.g. 120/80 mmHg). Hypertension is usually diagnosed after repeated elevated readings in clinic or with home monitoring.',
      },
      {
        heading: 'Treatment',
        body: 'Lifestyle changes (salt reduction, activity, weight) plus medicines if needed. BC PharmaCare may cover some medications with MSP enrollment.',
      },
      {
        heading: 'Self-care',
        body: 'Monitor as advised by your GP. Many pharmacies offer blood pressure checks.',
      },
    ],
    relatedTopicIds: ['diabetes-type-2', 'heart-health'],
  },
  {
    id: 'covid-19',
    title: 'COVID-19',
    category: 'condition',
    letter: 'C',
    summary:
      'Respiratory illness caused by coronavirus. Guidance evolves — check BC Centre for Disease Control for current advice.',
    sections: [
      {
        heading: 'Symptoms',
        body: 'Fever, cough, sore throat, fatigue, headache, and loss of taste or smell. Symptoms range from mild to severe.',
      },
      {
        heading: 'What to do if you are sick',
        body: 'Stay home while febrile and follow BC CDC isolation guidance. Rest, fluids, and acetaminophen or ibuprofen for fever if appropriate. High-risk patients should contact their GP early.',
      },
      {
        heading: 'Vaccination',
        body: 'Seasonal boosters may be recommended for eligible groups. See Vaccinations in your CHS account or local pharmacy.',
      },
    ],
    relatedTopicIds: ['influenza', 'fever'],
  },
  {
    id: 'diabetes-type-2',
    title: 'Type 2 diabetes',
    category: 'condition',
    letter: 'D',
    summary:
      'A condition where blood sugar is higher than normal, often linked to insulin resistance.',
    sections: [
      {
        heading: 'Symptoms',
        body: 'Increased thirst, frequent urination, fatigue, blurred vision, and slow-healing cuts. Many people are diagnosed through routine blood tests (HbA1c).',
      },
      {
        heading: 'Management',
        body: 'Diet, physical activity, weight management, and medicines such as metformin. Regular HbA1c monitoring and foot/eye checks are important.',
      },
      {
        heading: 'BC resources',
        body: 'Diabetes education centres and dietitian services may be available. Some services require referral; dietitians are often direct-access.',
      },
    ],
    relatedTopicIds: ['blood-pressure', 'healthy-eating'],
  },
  {
    id: 'earache',
    title: 'Earache',
    category: 'symptom',
    letter: 'E',
    summary: 'Pain in or around the ear, common in children and with colds.',
    sections: [
      {
        heading: 'Possible causes',
        body: 'Middle ear infection (otitis media), swimmer’s ear, wax buildup, or referred pain from throat infection.',
      },
      {
        heading: 'Self-care',
        body: 'Pain relief as directed, warm compress on outer ear. Do not insert objects into the ear canal.',
      },
      {
        heading: 'See a clinician if',
        body: 'Severe pain, fever over 39°C, fluid draining from ear, or symptoms in a child under 2.',
      },
    ],
    relatedTopicIds: ['fever', 'sore-throat-info'],
  },
  {
    id: 'influenza',
    title: 'Influenza (flu)',
    category: 'condition',
    letter: 'F',
    summary: 'Viral infection with sudden fever, body aches, and cough.',
    sections: [
      {
        heading: 'Flu vs cold',
        body: 'Flu usually starts abruptly with fever and muscle aches. Colds are milder with more runny nose and less fever.',
      },
      {
        heading: 'Treatment',
        body: 'Rest, fluids, and symptom relief. Antiviral medicines may help if started early in high-risk patients — contact your GP promptly.',
      },
      {
        heading: 'Prevention',
        body: 'Annual flu vaccine is free for many BC residents. Wash hands and stay home when sick.',
      },
    ],
    relatedTopicIds: ['covid-19', 'vaccinations-info'],
  },
  {
    id: 'healthy-eating',
    title: 'Healthy eating',
    category: 'wellness',
    letter: 'H',
    summary: 'Balanced nutrition supports heart health, diabetes management, and overall wellbeing.',
    sections: [
      {
        heading: 'Canada’s food guide',
        body: 'Emphasizes vegetables and fruits, whole grains, and protein foods. Limit highly processed foods and sugary drinks.',
      },
      {
        heading: 'Getting support',
        body: 'Registered dietitians can help with meal planning. Some visits are covered in BC — check eligibility.',
      },
      {
        heading: 'Practical tips',
        body: 'Plan meals, cook at home when possible, and watch portion sizes. Small sustainable changes work best.',
      },
    ],
    relatedTopicIds: ['diabetes-type-2', 'blood-pressure'],
  },
  {
    id: 'heart-health',
    title: 'Heart health',
    category: 'wellness',
    letter: 'H',
    summary: 'Protecting your heart through lifestyle and regular check-ups.',
    sections: [
      {
        heading: 'Risk factors',
        body: 'High blood pressure, smoking, diabetes, high cholesterol, family history, and inactivity.',
      },
      {
        heading: 'Prevention',
        body: '150 minutes of moderate activity weekly, Mediterranean-style diet, no smoking, and knowing your blood pressure and cholesterol.',
      },
      {
        heading: 'Warning signs',
        body: 'Chest pressure, pain spreading to arm or jaw, sudden breathlessness — call 911.',
      },
    ],
    relatedTopicIds: ['blood-pressure', 'physiotherapy'],
  },
  {
    id: 'msp',
    title: 'MSP (BC health insurance)',
    category: 'service',
    letter: 'M',
    summary:
      'Medical Services Plan covers medically necessary physician and hospital services in British Columbia.',
    sections: [
      {
        heading: 'What MSP covers',
        body: 'GP and specialist visits (with referral where required), hospital stays, and medically necessary lab tests when ordered.',
      },
      {
        heading: 'What it usually does not cover',
        body: 'Prescription drugs outside PharmaCare, dentistry, most physiotherapy beyond limits, and routine eye exams for adults.',
      },
      {
        heading: 'Your card',
        body: 'Bring your BC Services Card / CareCard to appointments. Keep your address updated with Health Insurance BC.',
      },
    ],
    relatedTopicIds: ['pharmacy-services', 'walk-in-clinics'],
  },
  {
    id: 'physiotherapy',
    title: 'Physiotherapy',
    category: 'treatment',
    letter: 'P',
    summary:
      'Treatment for muscle, joint, and movement problems — often direct-access in BC.',
    sections: [
      {
        heading: 'What physiotherapists do',
        body: 'Assess movement, prescribe exercises, manual therapy, and education for recovery from injury or surgery.',
      },
      {
        heading: 'Coverage in BC',
        body: 'MSP provides partial coverage with an annual limit for eligible patients. Many use private insurance or pay directly.',
      },
      {
        heading: 'Finding care',
        body: 'No referral required for most physio in BC. Use the CHS map to find clinics and book in-app (mock in MVP).',
      },
    ],
    relatedTopicIds: ['back-pain-info', 'heart-health'],
  },
  {
    id: 'pharmacy-services',
    title: 'Pharmacy services',
    category: 'service',
    letter: 'P',
    summary:
      'Pharmacists in BC can dispense prescriptions and advise on minor ailments.',
    sections: [
      {
        heading: 'Prescriptions',
        body: 'Bring your prescription or use electronic transfer. PharmaCare and private plans may reduce cost.',
      },
      {
        heading: 'Minor ailment prescribing',
        body: 'BC pharmacists can assess and prescribe for selected minor conditions (e.g. UTI, allergies) — ask your pharmacy.',
      },
      {
        heading: 'Vaccinations',
        body: 'Many pharmacies offer flu and COVID vaccines by appointment or walk-in.',
      },
    ],
    relatedTopicIds: ['msp', 'influenza'],
  },
  {
    id: 'sore-throat-info',
    title: 'Sore throat',
    category: 'symptom',
    letter: 'S',
    summary: 'Common with viral infections; strep throat needs testing.',
    sections: [
      {
        heading: 'Causes',
        body: 'Viruses cause most sore throats. Strep (bacterial) is more likely with fever, no cough, and swollen neck glands.',
      },
      {
        heading: 'Self-care',
        body: 'Warm drinks, lozenges, rest, and pain relief. Gargle salt water if tolerated.',
      },
      {
        heading: 'When to test',
        body: 'See walk-in or GP if severe pain, fever, or not improving after 5–7 days. Strep requires antibiotics if positive.',
      },
    ],
    relatedTopicIds: ['fever', 'earache'],
  },
  {
    id: 'fever',
    title: 'Fever',
    category: 'symptom',
    letter: 'F',
    summary: 'Raised body temperature — a sign the body is fighting infection.',
    sections: [
      {
        heading: 'When to measure',
        body: 'Adults: often 38°C (100.4°F) or higher. Children: follow age-specific guidance; call 811 for advice in BC.',
      },
      {
        heading: 'Home care',
        body: 'Fluids, light clothing, acetaminophen or ibuprofen if not contraindicated. Do not overdress children.',
      },
      {
        heading: 'Seek care',
        body: 'Infants under 3 months with fever need urgent assessment. Adults: fever over 3 days or with stiff neck, rash, or confusion.',
      },
    ],
    relatedTopicIds: ['influenza', 'covid-19'],
  },
  {
    id: 'back-pain-info',
    title: 'Back pain',
    category: 'symptom',
    letter: 'B',
    summary: 'Very common; most episodes improve within weeks.',
    sections: [
      {
        heading: 'Stay active',
        body: 'Bed rest beyond 1–2 days is not recommended. Gentle movement and walking aid recovery.',
      },
      {
        heading: 'Red flags',
        body: 'Numbness in groin, leg weakness, bladder problems, fever with back pain, or pain after major trauma — seek urgent care.',
      },
      {
        heading: 'Support',
        body: 'GP, physiotherapy, and sometimes imaging if symptoms persist. Use the map to find physio near you.',
      },
    ],
    relatedTopicIds: ['physiotherapy', 'heart-health'],
  },
  {
    id: 'allergies',
    title: 'Allergies (seasonal)',
    category: 'condition',
    letter: 'A',
    summary: 'Immune reaction to pollen, dust, or other triggers — common in BC spring and summer.',
    sections: [
      {
        heading: 'Symptoms',
        body: 'Sneezing, itchy eyes, runny nose, and congestion. Distinct from cold by itch and lack of fever.',
      },
      {
        heading: 'Treatment',
        body: 'Antihistamines, nasal sprays, and avoiding triggers. Pharmacists can advise on over-the-counter options.',
      },
      {
        heading: 'Severe allergy',
        body: 'Anaphylaxis (swelling, breathing difficulty) requires epinephrine and 911. Carry an EpiPen if prescribed.',
      },
    ],
    relatedTopicIds: ['asthma', 'pharmacy-services'],
  },
  {
    id: 'vaccinations-info',
    title: 'Vaccinations',
    category: 'service',
    letter: 'V',
    summary: 'Immunizations protect against serious infections — many are publicly funded in BC.',
    sections: [
      {
        heading: 'Routine schedules',
        body: 'Childhood, adult, and travel vaccines follow provincial schedules. Check ImmunizeBC for current recommendations.',
      },
      {
        heading: 'Where to get vaccinated',
        body: 'Public health units, pharmacies, and some GP offices. See your CHS Vaccinations section for mock history.',
      },
      {
        heading: 'Records',
        body: 'Keep vaccination records for school, travel, and work requirements.',
      },
    ],
    relatedTopicIds: ['influenza', 'covid-19', 'msp'],
  },
  {
    id: 'walk-in-clinics',
    title: 'Walk-in clinics',
    category: 'service',
    letter: 'W',
    summary:
      'Same-day care for non-emergency problems without an appointment in BC.',
    sections: [
      {
        heading: 'What they treat',
        body: 'Minor illnesses, infections, sprains, prescription renewals (limited), and referrals when needed.',
      },
      {
        heading: 'Coverage',
        body: 'Covered by MSP with valid BC Services Card for medically necessary visits.',
      },
      {
        heading: 'Finding a clinic',
        body: 'Use the CHS map — filter “Urgent & walk-in” for clinics near you in Greater Victoria (mock data in MVP).',
      },
    ],
    relatedTopicIds: ['msp', 'pharmacy-services'],
  },
  {
    id: 'mental-health-info',
    title: 'Mental health support',
    category: 'service',
    letter: 'M',
    summary: 'Resources for anxiety, depression, and crisis support in Canada.',
    sections: [
      {
        heading: 'Talk to someone',
        body: 'Your GP, counsellor, or employee assistance program. BC is expanding publicly funded counselling access — ask about eligibility.',
      },
      {
        heading: 'Crisis lines',
        body: '988 — Suicide Crisis Helpline (call or text). 811 — HealthLink BC for 24/7 nurse line. 911 for immediate danger.',
      },
      {
        heading: 'Finding care',
        body: 'Psychologists and counsellors are often direct-access. Search Mental health on the CHS map.',
      },
    ],
    relatedTopicIds: ['healthy-eating', 'physiotherapy'],
  },
];

export const HEALTH_TOPIC_LETTERS = Array.from(
  new Set(HEALTH_TOPICS.map((topic) => topic.letter))
).sort();

export function getHealthTopic(id: string): HealthTopic | undefined {
  return HEALTH_TOPICS.find((topic) => topic.id === id);
}

export function searchHealthTopics(query: string): HealthTopic[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return HEALTH_TOPICS;
  }

  return HEALTH_TOPICS.filter(
    (topic) =>
      topic.title.toLowerCase().includes(normalized) ||
      topic.summary.toLowerCase().includes(normalized) ||
      topic.sections.some(
        (section) =>
          section.heading.toLowerCase().includes(normalized) ||
          section.body.toLowerCase().includes(normalized)
      )
  );
}

export function filterHealthTopicsByLetter(letter: string): HealthTopic[] {
  return HEALTH_TOPICS.filter((topic) => topic.letter === letter);
}
