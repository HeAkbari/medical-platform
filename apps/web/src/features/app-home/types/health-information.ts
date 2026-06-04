export type SymptomUrgency = 'self-care' | 'gp' | 'urgent-care' | 'emergency';

export interface SymptomOutcome {
  urgency: SymptomUrgency;
  title: string;
  guidance: string;
  actions: string[];
}

export interface SymptomFollowUpOption {
  id: string;
  label: string;
  outcome: SymptomOutcome;
}

export interface SymptomFollowUpQuestion {
  id: string;
  prompt: string;
  options: SymptomFollowUpOption[];
}

export interface SymptomTopic {
  id: string;
  label: string;
  summary: string;
  followUp: SymptomFollowUpQuestion;
  defaultOutcome: SymptomOutcome;
}

export type HealthTopicCategory =
  | 'condition'
  | 'symptom'
  | 'treatment'
  | 'wellness'
  | 'service';

export interface HealthTopicSection {
  heading: string;
  body: string;
}

export interface HealthTopic {
  id: string;
  title: string;
  category: HealthTopicCategory;
  letter: string;
  summary: string;
  sections: HealthTopicSection[];
  relatedTopicIds: string[];
}
