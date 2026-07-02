'use client';

import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui';

const SETTINGS_SECTIONS = [
  {
    title: 'Notification preferences',
    description: 'Push alerts, SMS, and email for appointments and updates.',
  },
  {
    title: 'Privacy & security',
    description: 'Third-party data sharing and behavioural logging controls.',
  },
  {
    title: 'Download / export my data',
    description: 'Portable export of profile, care team, and appointment history.',
  },
  {
    title: 'Biometrics',
    description: 'Face ID or Touch ID for sign-in and checkout validation.',
  },
  {
    title: 'Visual theme',
    description: 'Light mode and dark mode.',
  },
  {
    title: 'Compliance documentation',
    description: 'Terms of use, privacy policy, and Canadian healthcare guidelines.',
  },
  {
    title: 'Account destruction portal',
    description: 'Request permanent deletion of your account and data.',
  },
] as const;

export function SettingsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage preferences, privacy, and account controls.
        </p>
      </header>

      <Card>
        <CardHeader
          title="Application settings"
          description="Full settings controls will be connected in a later phase."
        />
        <p className="text-sm leading-6 text-slate-600">
          Planned sections align with the DrFinder patient app specification
          (PIPA-compliant data export, notification toggles, and account
          deletion).
        </p>
      </Card>

      <ul className="space-y-2">
        {SETTINGS_SECTIONS.map((section) => (
          <li key={section.title}>
            <Card className="opacity-90">
              <p className="font-medium text-slate-900">{section.title}</p>
              <p className="mt-1 text-sm text-slate-500">{section.description}</p>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                Coming soon
              </p>
            </Card>
          </li>
        ))}
      </ul>

      <Link
        href="/home"
        scroll={false}
        className="inline-flex min-h-11 items-center text-sm font-medium text-brand"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
