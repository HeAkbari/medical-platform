import type { SymptomTopic } from '@/features/app-home/types/health-information';

const SELF_CARE_ACTIONS = [
  'Rest and monitor your symptoms for 24–48 hours.',
  'Use over-the-counter options as directed on the label.',
  'Call HealthLink BC at 811 if you are unsure.',
];

const GP_ACTIONS = [
  'Book a GP or walk-in appointment within the next few days.',
  'Use the map to find primary care or walk-in clinics near you.',
  'Call 811 for nurse advice if symptoms worsen.',
];

const URGENT_ACTIONS = [
  'Go to an urgent care centre or walk-in clinic today.',
  'Use the map to find urgent care near you.',
  'Call 811 if you need help deciding where to go.',
];

const EMERGENCY_ACTIONS = [
  'Call 911 now — do not drive yourself if you feel unsafe.',
  'This tool does not replace emergency care.',
];

export const SYMPTOM_CHECKER_911_WARNING =
  'If you are experiencing chest pain, severe shortness of breath, sudden numbness, or any life-threatening health crisis, stop using this tool immediately. Close this application and dial 911.';

export const SYMPTOM_CHECKER_DISCLAIMER =
  'This symptom checker gives general guidance only. It does not diagnose conditions and is not a substitute for professional medical advice. In BC, call 811 (HealthLink BC) for 24/7 nurse advice.';

export const SYMPTOM_TOPICS: SymptomTopic[] = [
  {
    id: 'headache',
    label: 'Headache',
    summary: 'Head pain with or without other symptoms.',
    followUp: {
      id: 'headache-severity',
      prompt: 'How would you describe your headache today?',
      options: [
        {
          id: 'headache-mild',
          label: 'Mild — usual tension headache',
          outcome: {
            urgency: 'self-care',
            title: 'Self-care may be enough',
            guidance:
              'Many headaches improve with rest, fluids, and simple pain relief. Avoid screens if light sensitivity is present.',
            actions: SELF_CARE_ACTIONS,
          },
        },
        {
          id: 'headache-worse',
          label: 'Sudden severe or “worst ever” headache',
          outcome: {
            urgency: 'emergency',
            title: 'Seek emergency care now',
            guidance:
              'A sudden, severe headache can be serious. Do not wait for online advice.',
            actions: EMERGENCY_ACTIONS,
          },
        },
        {
          id: 'headache-frequent',
          label: 'Frequent headaches affecting daily life',
          outcome: {
            urgency: 'gp',
            title: 'Speak with your GP',
            guidance:
              'Ongoing or worsening headaches should be reviewed by a clinician, especially if new for you.',
            actions: GP_ACTIONS,
          },
        },
      ],
    },
    defaultOutcome: {
      urgency: 'self-care',
      title: 'Monitor at home',
      guidance:
        'If your headache is mild and familiar, rest and hydration may help. Seek care if it becomes severe or unusual.',
      actions: SELF_CARE_ACTIONS,
    },
  },
  {
    id: 'fever',
    label: 'Fever',
    summary: 'Feeling hot, chills, or measured temperature above normal.',
    followUp: {
      id: 'fever-duration',
      prompt: 'How long have you had a fever?',
      options: [
        {
          id: 'fever-short',
          label: 'Less than 3 days, otherwise well',
          outcome: {
            urgency: 'self-care',
            title: 'Self-care and monitoring',
            guidance:
              'Adults often recover with rest and fluids. Track temperature and symptoms.',
            actions: SELF_CARE_ACTIONS,
          },
        },
        {
          id: 'fever-long',
          label: 'More than 3 days or getting worse',
          outcome: {
            urgency: 'gp',
            title: 'Book a clinical assessment',
            guidance:
              'Persistent fever should be assessed, especially with other symptoms such as cough or pain.',
            actions: GP_ACTIONS,
          },
        },
        {
          id: 'fever-breathing',
          label: 'Fever with difficulty breathing',
          outcome: {
            urgency: 'emergency',
            title: 'Emergency care needed',
            guidance:
              'Fever with breathing difficulty needs urgent assessment — call 911 if severe.',
            actions: EMERGENCY_ACTIONS,
          },
        },
      ],
    },
    defaultOutcome: {
      urgency: 'gp',
      title: 'Consider speaking with a clinician',
      guidance:
        'If you are unsure about fever in yourself or a child, HealthLink BC (811) can help triage next steps.',
      actions: GP_ACTIONS,
    },
  },
  {
    id: 'sore-throat',
    label: 'Sore throat',
    summary: 'Pain or irritation when swallowing.',
    followUp: {
      id: 'sore-throat-signs',
      prompt: 'Do you have any of these with your sore throat?',
      options: [
        {
          id: 'throat-mild',
          label: 'Mild pain, no breathing trouble',
          outcome: {
            urgency: 'self-care',
            title: 'Try self-care first',
            guidance:
              'Warm fluids, throat lozenges, and rest often help. Strep testing may be needed if pain persists.',
            actions: SELF_CARE_ACTIONS,
          },
        },
        {
          id: 'throat-swallow',
          label: 'Painful to swallow liquids or drooling',
          outcome: {
            urgency: 'urgent-care',
            title: 'Visit urgent care today',
            guidance:
              'Difficulty swallowing or severe throat pain should be assessed the same day.',
            actions: URGENT_ACTIONS,
          },
        },
        {
          id: 'throat-breath',
          label: 'Difficulty breathing or noisy breathing',
          outcome: {
            urgency: 'emergency',
            title: 'Call 911',
            guidance: 'Breathing difficulty is an emergency.',
            actions: EMERGENCY_ACTIONS,
          },
        },
      ],
    },
    defaultOutcome: {
      urgency: 'gp',
      title: 'Walk-in or GP if not improving',
      guidance:
        'Most sore throats are viral. See a clinician if symptoms last more than a week or you have high fever.',
      actions: GP_ACTIONS,
    },
  },
  {
    id: 'back-pain',
    label: 'Back pain',
    summary: 'Lower or upper back pain, with or without leg symptoms.',
    followUp: {
      id: 'back-red-flags',
      prompt: 'Which best describes your back pain?',
      options: [
        {
          id: 'back-strain',
          label: 'Muscle strain after activity',
          outcome: {
            urgency: 'self-care',
            title: 'Self-care and gentle movement',
            guidance:
              'Short rest, heat/cold packs, and gradual movement often help within a few days.',
            actions: SELF_CARE_ACTIONS,
          },
        },
        {
          id: 'back-radiating',
          label: 'Pain shooting down leg or numbness',
          outcome: {
            urgency: 'gp',
            title: 'Book GP or physiotherapy',
            guidance:
              'Radiating pain or numbness should be assessed. Physiotherapy is often direct-access in BC.',
            actions: [
              ...GP_ACTIONS,
              'Search the map for physiotherapy clinics near you.',
            ],
          },
        },
        {
          id: 'back-bladder',
          label: 'Numbness in groin or loss of bladder control',
          outcome: {
            urgency: 'emergency',
            title: 'Emergency assessment needed',
            guidance:
              'These can be signs of a serious spinal condition — seek emergency care.',
            actions: EMERGENCY_ACTIONS,
          },
        },
      ],
    },
    defaultOutcome: {
      urgency: 'self-care',
      title: 'Monitor for a few days',
      guidance:
        'Avoid heavy lifting. Seek care if pain is severe, persistent, or follows a fall.',
      actions: SELF_CARE_ACTIONS,
    },
  },
  {
    id: 'chest-pain',
    label: 'Chest pain',
    summary: 'Pressure, tightness, or pain in the chest area.',
    followUp: {
      id: 'chest-character',
      prompt: 'How would you describe the chest pain?',
      options: [
        {
          id: 'chest-cardiac',
          label: 'Heavy pressure, spreads to arm/jaw, breathless',
          outcome: {
            urgency: 'emergency',
            title: 'Call 911 immediately',
            guidance:
              'These symptoms may indicate a heart attack. Chew aspirin only if already prescribed and not allergic.',
            actions: EMERGENCY_ACTIONS,
          },
        },
        {
          id: 'chest-sharp',
          label: 'Sharp pain worse when breathing deeply',
          outcome: {
            urgency: 'urgent-care',
            title: 'Same-day assessment',
            guidance:
              'Pleurisy or muscle pain is possible, but chest pain always needs clinical review.',
            actions: URGENT_ACTIONS,
          },
        },
        {
          id: 'chest-burn',
          label: 'Burning after meals, mild',
          outcome: {
            urgency: 'gp',
            title: 'Non-urgent review',
            guidance:
              'Reflux can cause burning chest pain. See GP if frequent or if you also have cardiac risk factors.',
            actions: GP_ACTIONS,
          },
        },
      ],
    },
    defaultOutcome: {
      urgency: 'emergency',
      title: 'Treat chest pain as urgent until assessed',
      guidance:
        'When in doubt about chest pain, call 911 or go to the nearest emergency department.',
      actions: EMERGENCY_ACTIONS,
    },
  },
  {
    id: 'rash',
    label: 'Skin rash',
    summary: 'New or spreading rash, itch, or skin changes.',
    followUp: {
      id: 'rash-spread',
      prompt: 'What best matches your rash?',
      options: [
        {
          id: 'rash-local',
          label: 'Small area, mild itch',
          outcome: {
            urgency: 'self-care',
            title: 'Monitor and soothe',
            guidance:
              'Avoid scratching. Fragrance-free moisturizer or antihistamine may help minor rashes.',
            actions: SELF_CARE_ACTIONS,
          },
        },
        {
          id: 'rash-spreading',
          label: 'Spreading quickly or with fever',
          outcome: {
            urgency: 'urgent-care',
            title: 'Visit a clinic today',
            guidance:
              'Spreading rash with fever should be assessed — especially after new medicines.',
            actions: URGENT_ACTIONS,
          },
        },
        {
          id: 'rash-face',
          label: 'Swelling of face/lips or trouble breathing',
          outcome: {
            urgency: 'emergency',
            title: 'Possible allergic reaction — call 911',
            guidance: 'Facial swelling with breathing symptoms is an emergency.',
            actions: EMERGENCY_ACTIONS,
          },
        },
      ],
    },
    defaultOutcome: {
      urgency: 'gp',
      title: 'GP or walk-in if not improving',
      guidance:
        'Take photos to track changes. Mention any new medications when you see a clinician.',
      actions: GP_ACTIONS,
    },
  },
  {
    id: 'mental-health',
    label: 'Anxiety or low mood',
    summary: 'Feeling anxious, low, or overwhelmed.',
    followUp: {
      id: 'mental-safety',
      prompt: 'Which statement fits best right now?',
      options: [
        {
          id: 'mental-mild',
          label: 'Stress or low mood but coping day to day',
          outcome: {
            urgency: 'self-care',
            title: 'Self-care and support resources',
            guidance:
              'Sleep, routine, and talking to someone you trust can help. BC mental health resources are available online.',
            actions: [
              'Visit HealthLink BC mental health resources.',
              'Search the map for counselling services (direct access).',
              'Call 811 for guidance on local supports.',
            ],
          },
        },
        {
          id: 'mental-gp',
          label: 'Symptoms affecting work, sleep, or relationships',
          outcome: {
            urgency: 'gp',
            title: 'Speak with your GP or counsellor',
            guidance:
              'Persistent anxiety or depression responds well to support and treatment — you do not need to wait for a crisis.',
            actions: [
              ...GP_ACTIONS,
              'Search the map for mental health services near you.',
            ],
          },
        },
        {
          id: 'mental-crisis',
          label: 'Thoughts of harming yourself or others',
          outcome: {
            urgency: 'emergency',
            title: 'Crisis support now',
            guidance:
              'You deserve immediate help. In Canada, call or text 988 for suicide crisis support.',
            actions: [
              'Call or text 988 (Suicide Crisis Helpline).',
              'Call 911 if you are in immediate danger.',
              'Go to the nearest emergency department.',
            ],
          },
        },
      ],
    },
    defaultOutcome: {
      urgency: 'gp',
      title: 'Reach out for support',
      guidance:
        'Mental health concerns are common and treatable. Start with your GP or a counsellor on the map.',
      actions: GP_ACTIONS,
    },
  },
  {
    id: 'stomach-pain',
    label: 'Stomach pain',
    summary: 'Abdominal pain, nausea, or digestive upset.',
    followUp: {
      id: 'stomach-type',
      prompt: 'Where is the pain mainly?',
      options: [
        {
          id: 'stomach-upper',
          label: 'Upper abdomen, mild, after meals',
          outcome: {
            urgency: 'self-care',
            title: 'Try self-care',
            guidance:
              'Smaller meals, hydration, and rest may help mild indigestion. Avoid alcohol temporarily.',
            actions: SELF_CARE_ACTIONS,
          },
        },
        {
          id: 'stomach-lower',
          label: 'Lower abdomen, cramping, ongoing',
          outcome: {
            urgency: 'gp',
            title: 'Book clinical review',
            guidance:
              'Ongoing lower abdominal pain should be assessed, especially in women of childbearing age.',
            actions: GP_ACTIONS,
          },
        },
        {
          id: 'stomach-severe',
          label: 'Severe pain, rigid abdomen, or vomiting blood',
          outcome: {
            urgency: 'emergency',
            title: 'Emergency care',
            guidance: 'Severe abdominal pain or vomiting blood needs urgent assessment.',
            actions: EMERGENCY_ACTIONS,
          },
        },
      ],
    },
    defaultOutcome: {
      urgency: 'gp',
      title: 'See a clinician if pain persists',
      guidance:
        'Seek urgent care if pain is severe, sudden, or accompanied by fever.',
      actions: GP_ACTIONS,
    },
  },
];

export function getSymptomTopic(id: string): SymptomTopic | undefined {
  return SYMPTOM_TOPICS.find((topic) => topic.id === id);
}
