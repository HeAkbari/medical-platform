'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Badge, Button, Card, CardHeader } from '@/components/ui';
import {
  getSymptomTopic,
  SYMPTOM_CHECKER_911_WARNING,
  SYMPTOM_CHECKER_DISCLAIMER,
  SYMPTOM_TOPICS,
} from '@/features/app-home/data/mock-symptom-checker';
import type {
  SymptomOutcome,
  SymptomTopic,
  SymptomUrgency,
} from '@/features/app-home/types/health-information';
import { ServiceBackLink } from '@/features/app-home/ui/service-back-link';
import { ServiceMockNotice } from '@/features/app-home/ui/service-mock-notice';

type CheckerStep = 'select' | 'follow-up' | 'result';

function urgencyVariant(
  urgency: SymptomUrgency
): 'default' | 'success' | 'warning' | 'muted' {
  switch (urgency) {
    case 'self-care':
      return 'success';
    case 'gp':
      return 'default';
    case 'urgent-care':
      return 'warning';
    case 'emergency':
      return 'warning';
  }
}

function urgencyLabel(urgency: SymptomUrgency): string {
  switch (urgency) {
    case 'self-care':
      return 'Self-care';
    case 'gp':
      return 'See GP / walk-in';
    case 'urgent-care':
      return 'Urgent care today';
    case 'emergency':
      return 'Emergency — 911';
  }
}

function OutcomeCard({
  outcome,
  onRestart,
}: {
  outcome: SymptomOutcome;
  onRestart: () => void;
}) {
  const showMapLink =
    outcome.urgency === 'gp' ||
    outcome.urgency === 'urgent-care' ||
    outcome.urgency === 'self-care';

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant={urgencyVariant(outcome.urgency)}>
            {urgencyLabel(outcome.urgency)}
          </Badge>
        </div>
        <h3 className="text-base font-semibold text-slate-900">{outcome.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{outcome.guidance}</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-700">
          {outcome.actions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {showMapLink ? (
          <Link href="/home/map" className="inline-flex flex-1">
            <Button variant="secondary" fullWidth>
              Find care on map
            </Button>
          </Link>
        ) : null}
        <Button type="button" fullWidth onClick={onRestart}>
          Check another symptom
        </Button>
      </div>
    </div>
  );
}

function FollowUpStep({
  topic,
  onSelect,
  onSkip,
}: {
  topic: SymptomTopic;
  onSelect: (outcome: SymptomOutcome) => void;
  onSkip: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-brand-subtle bg-brand-muted/50 px-4 py-3">
        <p className="text-sm font-medium text-brand-dark">{topic.label}</p>
        <p className="mt-1 text-sm text-slate-600">{topic.summary}</p>
      </div>

      <p className="text-sm font-medium text-slate-800">{topic.followUp.prompt}</p>

      <div className="space-y-2">
        {topic.followUp.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.outcome)}
            className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-800 transition hover:border-brand-subtle hover:bg-brand-muted/30 active:scale-[0.99]"
          >
            {option.label}
          </button>
        ))}
      </div>

      <Button type="button" variant="secondary" fullWidth onClick={onSkip}>
        Skip — show general guidance
      </Button>
    </div>
  );
}

export function SymptomCheckerPage() {
  const [step, setStep] = useState<CheckerStep>('select');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<SymptomOutcome | null>(null);

  const selectedTopic = selectedTopicId ? getSymptomTopic(selectedTopicId) : null;

  function handleSelectTopic(topicId: string) {
    setSelectedTopicId(topicId);
    setStep('follow-up');
    setOutcome(null);
  }

  function handleRestart() {
    setStep('select');
    setSelectedTopicId(null);
    setOutcome(null);
  }

  function handleShowResult(result: SymptomOutcome) {
    setOutcome(result);
    setStep('result');
  }

  function handleSkipFollowUp() {
    if (selectedTopic) {
      handleShowResult(selectedTopic.defaultOutcome);
    }
  }

  return (
    <div className="space-y-4">
      <ServiceBackLink />

      <Card>
        <CardHeader
          title="Symptom checker"
          description="Get general guidance based on your symptoms."
        />

        <p className="mb-3 rounded-xl border border-red-300 bg-red-50 px-3 py-3 text-sm font-semibold leading-relaxed text-red-800">
          {SYMPTOM_CHECKER_911_WARNING}
        </p>

        <p className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
          {SYMPTOM_CHECKER_DISCLAIMER}
        </p>

        {step === 'select' ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              What is your main symptom today?
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SYMPTOM_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic.id)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-sm font-medium text-slate-800 transition hover:border-brand-subtle hover:bg-brand-muted/30 active:scale-[0.99]"
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 'follow-up' && selectedTopic ? (
          <FollowUpStep
            topic={selectedTopic}
            onSelect={handleShowResult}
            onSkip={handleSkipFollowUp}
          />
        ) : null}

        {step === 'result' && outcome ? (
          <OutcomeCard outcome={outcome} onRestart={handleRestart} />
        ) : null}
      </Card>

      <ServiceMockNotice />
    </div>
  );
}
