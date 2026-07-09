'use client';

import { cn } from '@/components/ui/cn';
import type { HealthConditionMilestone } from '@/features/healthcare-team/data/mock-healthcare-team';

export function HealthConditionMeter({
  milestones,
}: {
  milestones: HealthConditionMilestone[];
}) {
  const completedCount = milestones.filter((item) => item.complete).length;
  const progress = Math.round((completedCount / milestones.length) * 100);

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">
            Health Screening
          </p>
          <span className="text-sm font-medium text-brand">
            {completedCount}/{milestones.length}
          </span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Health screening progress"
        >
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <ul className="space-y-2">
        {milestones.map((milestone) => (
          <li
            key={milestone.id}
            className={cn(
              'rounded-xl border px-3 py-3 sm:px-4',
              milestone.complete
                ? 'border-brand-subtle/80 bg-brand-muted/40'
                : 'border-border bg-card'
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  milestone.complete
                    ? 'bg-brand text-brand-foreground'
                    : 'bg-muted text-faint-foreground'
                )}
                aria-hidden="true"
              >
                {milestone.complete ? '✓' : '·'}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {milestone.label}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {milestone.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
