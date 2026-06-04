import { Badge, Card, CardHeader } from '@/components/ui';
import {
  MOCK_ALLERGIES,
  MOCK_HEALTH_CONDITIONS,
  MOCK_MEDICINE_REACTIONS,
} from '@/features/app-home/data/mock-patient-services';
import type {
  AllergySeverity,
  ConditionStatus,
  MockAllergy,
  MockHealthCondition,
  MockMedicineReaction,
} from '@/features/app-home/types/patient-services';
import { ServiceBackLink } from '@/features/app-home/ui/service-back-link';
import { ServiceMockNotice } from '@/features/app-home/ui/service-mock-notice';
import { formatServiceDate } from '@/features/app-home/utils/service-formatters';

function conditionStatusVariant(
  status: ConditionStatus
): 'default' | 'success' | 'warning' | 'muted' {
  switch (status) {
    case 'active':
      return 'default';
    case 'monitored':
      return 'warning';
    case 'resolved':
      return 'muted';
  }
}

function conditionStatusLabel(status: ConditionStatus): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'monitored':
      return 'Monitored';
    case 'resolved':
      return 'Resolved';
  }
}

function allergySeverityVariant(
  severity: AllergySeverity
): 'default' | 'success' | 'warning' | 'muted' {
  switch (severity) {
    case 'severe':
      return 'warning';
    case 'moderate':
      return 'default';
    case 'mild':
      return 'muted';
  }
}

function ConditionRow({ condition }: { condition: MockHealthCondition }) {
  return (
    <article className="rounded-xl border border-slate-200 p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p className="font-medium text-slate-900">{condition.name}</p>
        <Badge variant={conditionStatusVariant(condition.status)}>
          {conditionStatusLabel(condition.status)}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        Diagnosed {formatServiceDate(condition.diagnosedAt)} ·{' '}
        {condition.recordedBy}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{condition.notes}</p>
    </article>
  );
}

function AllergyRow({ allergy }: { allergy: MockAllergy }) {
  return (
    <article className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <p className="font-medium text-slate-900">{allergy.allergen}</p>
        <Badge variant={allergySeverityVariant(allergy.severity)}>
          {allergy.severity}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-slate-600">Reaction: {allergy.reaction}</p>
      <p className="mt-1 text-xs text-slate-500">
        On record since {formatServiceDate(allergy.recordedAt)}
      </p>
    </article>
  );
}

function MedicineReactionRow({ reaction }: { reaction: MockMedicineReaction }) {
  return (
    <article className="rounded-xl border border-slate-200 p-3 sm:p-4">
      <p className="font-medium text-slate-900">{reaction.medicine}</p>
      <p className="mt-1 text-sm text-slate-600">{reaction.reaction}</p>
      <p className="mt-1 text-xs text-slate-500">
        Recorded {formatServiceDate(reaction.recordedAt)}
      </p>
    </article>
  );
}

export function HealthConditionsServicePage() {
  return (
    <div className="space-y-4">
      <ServiceBackLink />

      <Card>
        <CardHeader
          title="Health conditions"
          description="Conditions, allergies, and medicine reactions on record."
        />

        <section className="space-y-3">
          <h3 className="text-sm font-medium text-slate-700">Conditions</h3>
          {MOCK_HEALTH_CONDITIONS.map((condition) => (
            <ConditionRow key={condition.id} condition={condition} />
          ))}
        </section>

        <section className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-slate-700">Allergies</h3>
          {MOCK_ALLERGIES.map((allergy) => (
            <AllergyRow key={allergy.id} allergy={allergy} />
          ))}
        </section>

        <section className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-slate-700">
            Medicine reactions
          </h3>
          {MOCK_MEDICINE_REACTIONS.map((reaction) => (
            <MedicineReactionRow key={reaction.id} reaction={reaction} />
          ))}
        </section>
      </Card>

      <ServiceMockNotice />
    </div>
  );
}
