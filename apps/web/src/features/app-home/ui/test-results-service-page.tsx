import { Badge, Card, CardHeader } from '@/components/ui';
import { MOCK_TEST_RESULTS } from '@/features/app-home/data/mock-patient-services';
import type {
  MockTestResult,
  TestResultFlag,
  TestResultStatus,
} from '@/features/app-home/types/patient-services';
import { ServiceBackLink } from '@/features/app-home/ui/service-back-link';
import { ServiceMockNotice } from '@/features/app-home/ui/service-mock-notice';
import {
  formatServiceDate,
  formatServiceDateTime,
} from '@/features/app-home/utils/service-formatters';

function testStatusVariant(
  status: TestResultStatus
): 'default' | 'success' | 'warning' | 'muted' {
  switch (status) {
    case 'available':
      return 'success';
    case 'pending':
      return 'warning';
    case 'abnormal':
      return 'muted';
  }
}

function testStatusLabel(status: TestResultStatus): string {
  switch (status) {
    case 'available':
      return 'Results available';
    case 'pending':
      return 'Pending';
    case 'abnormal':
      return 'Needs follow-up';
  }
}

function flagLabel(flag: TestResultFlag): string {
  switch (flag) {
    case 'normal':
      return 'Normal';
    case 'high':
      return 'Above target';
    case 'low':
      return 'Below range';
    case 'review':
      return 'Review with GP';
  }
}

function flagVariant(
  flag: TestResultFlag
): 'default' | 'success' | 'warning' | 'muted' {
  switch (flag) {
    case 'normal':
      return 'success';
    case 'high':
    case 'review':
      return 'warning';
    case 'low':
      return 'muted';
  }
}

function TestResultRow({ result }: { result: MockTestResult }) {
  return (
    <article className="rounded-xl border border-slate-200 p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{result.testName}</p>
          <p className="mt-0.5 text-sm text-slate-500">
            {result.facility}
          </p>
        </div>
        <Badge variant={testStatusVariant(result.status)}>
          {testStatusLabel(result.status)}
        </Badge>
      </div>

      <dl className="mt-3 space-y-1.5 text-sm text-slate-600">
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
          <dt className="text-slate-500">Ordered by</dt>
          <dd>{result.orderedBy}</dd>
        </div>
        <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
          <dt className="text-slate-500">Sample date</dt>
          <dd>{formatServiceDateTime(result.sampleDate)}</dd>
        </div>
        {result.resultDate ? (
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
            <dt className="text-slate-500">Result date</dt>
            <dd>{formatServiceDate(result.resultDate)}</dd>
          </div>
        ) : null}
      </dl>

      {result.summary ? (
        <p className="mt-3 text-sm leading-6 text-slate-700">{result.summary}</p>
      ) : null}

      {result.flag ? (
        <div className="mt-3">
          <Badge variant={flagVariant(result.flag)}>{flagLabel(result.flag)}</Badge>
        </div>
      ) : null}
    </article>
  );
}

export function TestResultsServicePage() {
  const pendingCount = MOCK_TEST_RESULTS.filter(
    (item) => item.status === 'pending'
  ).length;

  return (
    <div className="space-y-4">
      <ServiceBackLink />

      <Card>
        <CardHeader
          title="Test results"
          description="View results from your GP or hospital tests."
          action={
            pendingCount > 0 ? (
              <p className="text-sm text-amber-700">
                {pendingCount} pending
              </p>
            ) : undefined
          }
        />

        <div className="space-y-3">
          {MOCK_TEST_RESULTS.map((result) => (
            <TestResultRow key={result.id} result={result} />
          ))}
        </div>
      </Card>

      <ServiceMockNotice />
    </div>
  );
}
