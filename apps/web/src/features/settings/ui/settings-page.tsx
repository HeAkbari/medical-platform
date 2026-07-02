'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, Card, CardHeader } from '@/components/ui';
import { Switch } from '@/components/ui/switch';
import { COMPLIANCE_LINKS } from '@/features/app-home/data/home-search';
import { useSettingsStore } from '@/features/settings/store/settings-store';
import { useThemeStore } from '@/features/settings/store/theme-store';

export function SettingsPage() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const notifications = useSettingsStore((state) => state.notifications);
  const privacy = useSettingsStore((state) => state.privacy);
  const biometricsEnabled = useSettingsStore((state) => state.biometricsEnabled);
  const setNotificationPref = useSettingsStore(
    (state) => state.setNotificationPref
  );
  const setPrivacyPref = useSettingsStore((state) => state.setPrivacyPref);
  const setBiometricsEnabled = useSettingsStore(
    (state) => state.setBiometricsEnabled
  );

  const [exportOpen, setExportOpen] = useState(false);
  const [exportConfirmed, setExportConfirmed] = useState(false);
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);

  function handleExportConfirm() {
    setExportConfirmed(true);
    setExportOpen(false);
  }

  function handleDeleteConfirm() {
    setDeleteStep(2);
  }

  function resetDeleteFlow() {
    setDeleteStep(0);
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage preferences, privacy, and account controls.
        </p>
      </header>

      <Card>
        <CardHeader
          title="Notification preferences"
          description="Choose how appointment and care updates reach you."
        />
        <div className="space-y-4">
          <Switch
            label="Push alerts"
            description="Booking confirmations, reminders, and waitlist callbacks."
            checked={notifications.push}
            onCheckedChange={(value) => setNotificationPref('push', value)}
          />
          <Switch
            label="SMS notifications"
            description="Text messages for urgent appointment changes."
            checked={notifications.sms}
            onCheckedChange={(value) => setNotificationPref('sms', value)}
          />
          <Switch
            label="Email updates"
            description="Email summaries for bookings and care-plan milestones."
            checked={notifications.email}
            onCheckedChange={(value) => setNotificationPref('email', value)}
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Privacy & security"
          description="Control data sharing and behavioural logging."
        />
        <div className="space-y-4">
          <Switch
            label="Third-party data sharing"
            description="Allow anonymized analytics sharing with approved partners."
            checked={privacy.thirdPartySharing}
            onCheckedChange={(value) =>
              setPrivacyPref('thirdPartySharing', value)
            }
          />
          <Switch
            label="Behavioural logging"
            description="Help improve triage flows with in-app usage metrics."
            checked={privacy.behavioralLogging}
            onCheckedChange={(value) =>
              setPrivacyPref('behavioralLogging', value)
            }
          />
          <Switch
            label="Biometrics"
            description="Use Face ID or Touch ID during sign-in and checkout."
            checked={biometricsEnabled}
            onCheckedChange={setBiometricsEnabled}
          />
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Visual theme"
          description="Switch between light and dark interface modes."
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant={theme === 'light' ? 'primary' : 'secondary'}
            onClick={() => setTheme('light')}
          >
            Light mode
          </Button>
          <Button
            type="button"
            variant={theme === 'dark' ? 'primary' : 'secondary'}
            onClick={() => setTheme('dark')}
          >
            Dark mode
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Download / export my data"
          description="Portable export of profile, healthcare team, and appointment history (PIPA)."
        />
        {exportConfirmed ? (
          <p className="text-sm text-success-foreground">
            Export requested. You will receive a download link when your archive
            is ready. (Mock UI — API not connected.)
          </p>
        ) : (
          <Button type="button" onClick={() => setExportOpen(true)}>
            Request data export
          </Button>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Compliance documentation"
          description="Canadian healthcare guidelines and legal policies."
        />
        <ul className="space-y-2">
          {COMPLIANCE_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-sm font-medium text-brand"
              >
                {link.label} →
              </a>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader
          title="Account destruction portal"
          description="Permanently delete your account and associated personal data."
        />
        {deleteStep === 0 ? (
          <Button type="button" variant="secondary" onClick={() => setDeleteStep(1)}>
            Request account deletion
          </Button>
        ) : deleteStep === 1 ? (
          <div className="space-y-3">
            <p className="text-sm leading-6 text-muted-foreground">
              This action is irreversible. All profile, appointment, and care-team
              data will be scheduled for deletion.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={handleDeleteConfirm}>
                Yes, delete my account
              </Button>
              <Button type="button" variant="secondary" onClick={resetDeleteFlow}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-error-foreground">
            Deletion request submitted. Our team will confirm by email within 48
            hours. (Mock UI — API not connected.)
          </p>
        )}
      </Card>

      <Link
        href="/notifications"
        scroll={false}
        className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline-offset-2 hover:text-brand hover:underline text-faint-foreground"
      >
        Manage notification feed
      </Link>

      <Link
        href="/home"
        scroll={false}
        className="inline-flex min-h-11 items-center text-sm font-medium text-brand"
      >
        ← Back to Home
      </Link>

      {exportOpen ? (
        <div className="fixed inset-0 z-120 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-dialog-title"
            className="w-full max-w-md rounded-2xl bg-card p-4 shadow-xl bg-card"
          >
            <h2
              id="export-dialog-title"
              className="text-lg font-semibold text-foreground"
            >
              Export my data
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              We will compile a PDF/CSV archive of your profile, healthcare team,
              and appointment history. Processing may take up to 24 hours.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={handleExportConfirm}>
                Confirm export
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setExportOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
