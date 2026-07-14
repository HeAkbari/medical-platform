'use client';

import { Button } from '@/components/ui';
import { cn } from '@/components/ui/cn';
import type { HealthConditionMilestone } from '@/features/healthcare-team/data/mock-healthcare-team';

const RING_SIZE = 88;
const RING_STROKE = 9;

function ScreeningProgressRing({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total === 0 ? 0 : completed / total;
  const offset = circumference * (1 - progress);

  return (
    <div
      className="relative shrink-0"
      style={{ width: RING_SIZE, height: RING_SIZE }}
      role="progressbar"
      aria-valuenow={completed}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={`${completed} of ${total} screening visits complete`}
    >
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={RING_STROKE}
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          fill="none"
          className="stroke-brand transition-[stroke-dashoffset]"
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none text-foreground">
          {completed}/{total}
        </span>
        <span className="mt-0.5 text-[11px] text-muted-foreground">visits</span>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HealthConditionMeter({
  milestones,
  onBook,
}: {
  milestones: HealthConditionMilestone[];
  onBook?: (milestoneId: string) => void;
}) {
  const completedCount = milestones.filter((item) => item.complete).length;
  const total = milestones.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <ScreeningProgressRing completed={completedCount} total={total} />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Preventative care
          </p>
          <h2 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-foreground">
            Health Screening
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Stay ahead with routine check-ins
          </p>
        </div>
      </div>

      <div className="border-t border-border" />

      <div>
        <h3 className="mb-3 text-base font-semibold text-foreground">
          Your recommendations
        </h3>
        <ul className="space-y-1">
          {milestones.map((milestone) => (
            <li
              key={milestone.id}
              className="flex items-center gap-3 py-2.5"
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  milestone.complete
                    ? 'bg-brand text-brand-foreground'
                    : 'border border-dashed border-border bg-transparent text-transparent'
                )}
                aria-hidden="true"
              >
                {milestone.complete ? <CheckIcon /> : null}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {milestone.label}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Last visit:{' '}
                  {milestone.lastVisitAt ? (
                    milestone.lastVisitAt
                  ) : (
                    <button
                      type="button"
                      className="underline underline-offset-2 transition hover:text-foreground"
                      onClick={() => onBook?.(milestone.id)}
                    >
                      add
                    </button>
                  )}
                </p>
              </div>

              {milestone.complete ? (
                <span className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 px-4 py-2 text-sm font-medium text-subtle-foreground">
                  Done
                </span>
              ) : (
                <Button
                  type="button"
                  className="min-h-9 shrink-0 rounded-xl px-4 py-2 text-sm"
                  onClick={() => onBook?.(milestone.id)}
                >
                  Book
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
