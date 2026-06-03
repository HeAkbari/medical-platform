export type MessageCategory =
  | 'gp'
  | 'hospital'
  | 'screening'
  | 'vaccination';

export interface HealthMessage {
  id: string;
  subject: string;
  preview: string;
  body: string;
  sender: string;
  category: MessageCategory;
  receivedAt: string;
  read: boolean;
}

export const MOCK_HEALTH_MESSAGES: HealthMessage[] = [
  {
    id: 'msg-1',
    subject: 'Hospital appointment reminder',
    preview: 'Your outpatient appointment is confirmed for next Tuesday at 10:30.',
    body: 'Your outpatient appointment at Victoria General Hospital is confirmed for Tuesday, 10:30. Please arrive 15 minutes early and bring photo ID.',
    sender: 'Victoria General Hospital',
    category: 'hospital',
    receivedAt: '2026-05-28T09:12:00.000Z',
    read: false,
  },
  {
    id: 'msg-2',
    subject: 'Breast screening invitation',
    preview: 'You are invited to attend breast screening. Tap to choose a time.',
    body: 'Our records show you are due for routine breast screening. You can book a convenient appointment through this message or call the screening office.',
    sender: 'CHS Screening Programme',
    category: 'screening',
    receivedAt: '2026-05-26T14:40:00.000Z',
    read: false,
  },
  {
    id: 'msg-3',
    subject: 'Message from your GP practice',
    preview: 'Your repeat prescription request has been approved.',
    body: 'Your GP practice has approved your repeat prescription. Your chosen pharmacy will contact you when it is ready to collect.',
    sender: 'Oak Bay Medical Clinic',
    category: 'gp',
    receivedAt: '2026-05-24T11:05:00.000Z',
    read: true,
  },
  {
    id: 'msg-4',
    subject: 'Flu vaccination available',
    preview: 'Book your seasonal flu vaccination at a local clinic.',
    body: 'Seasonal flu vaccinations are now available. Book online or visit a participating pharmacy near you.',
    sender: 'Public Health Unit',
    category: 'vaccination',
    receivedAt: '2026-05-20T08:30:00.000Z',
    read: true,
  },
];

export function countUnreadMessages(messages: HealthMessage[]): number {
  return messages.filter((message) => !message.read).length;
}
