'use client';

import { useFacilityDetailQuery } from '../hooks/use-facility-detail-query';
import type {
  FacilityAvailableTime,
  FacilityServiceDetail,
} from '../data/facility-detail';

const DAY_LABEL: Record<string, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

function formatTime(time?: string): string {
  if (!time) {
    return '';
  }
  const [h, m] = time.split(':');
  const hour = Number(h);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m ?? '00'} ${suffix}`;
}

function formatAvailableTime(time: FacilityAvailableTime): string {
  const days = time.days.map((day) => DAY_LABEL[day] ?? day).join(', ');
  if (time.allDay) {
    return `${days}: 24 hours`;
  }
  return `${days}: ${formatTime(time.start)} – ${formatTime(time.end)}`;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-faint-foreground">
        {title}
      </p>
      <div className="mt-1 space-y-1 text-sm text-accent-foreground">{children}</div>
    </div>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function ServiceCard({ service }: { service: FacilityServiceDetail }) {
  return (
    <div className="rounded-lg border border-border p-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-foreground">{service.name}</p>
        {service.appointmentRequired !== undefined ? (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              service.appointmentRequired
                ? 'bg-warning-subtle text-warning-foreground'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {service.appointmentRequired ? 'Appointment' : 'Walk-in'}
          </span>
        ) : null}
      </div>

      {service.comment ? (
        <p className="mt-1 text-sm text-muted-foreground">{service.comment}</p>
      ) : null}

      {service.specialties.length > 0 ? (
        <p className="mt-1.5 text-xs text-muted-foreground">
          <span className="font-medium">Specialties:</span>{' '}
          {service.specialties.join(', ')}
        </p>
      ) : null}

      {service.eligibility.length > 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="font-medium">Eligibility:</span>{' '}
          {service.eligibility.join('; ')}
        </p>
      ) : null}

      {service.referralMethods.length > 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="font-medium">Referral:</span>{' '}
          {service.referralMethods.join(', ')}
        </p>
      ) : null}

      {service.programs.length > 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="font-medium">Coverage:</span>{' '}
          {service.programs.join(', ')}
        </p>
      ) : null}

      {service.languages.length > 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="font-medium">Languages:</span>{' '}
          {service.languages.join(', ')}
        </p>
      ) : null}

      {service.availableTimes.length > 0 ? (
        <ul className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
          {service.availableTimes.map((time, index) => (
            <li key={index}>{formatAvailableTime(time)}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function FacilityDetailSection({ facilityId }: { facilityId: string }) {
  const { data, isLoading, isError } = useFacilityDetailQuery(facilityId);

  if (isLoading) {
    return (
      <p className="border-t border-border pt-2 text-xs text-faint-foreground">
        Loading clinic details…
      </p>
    );
  }

  if (isError || !data) {
    return null;
  }

  return (
    <div className="space-y-3 border-t border-border pt-3">
      {data.organization ? (
        <Section title="Operated by">
          <p>{data.organization.name}</p>
          {data.organization.website ? (
            <a
              href={data.organization.website}
              target="_blank"
              rel="noreferrer"
              className="text-brand underline"
            >
              {data.organization.website.replace(/^https?:\/\//, '')}
            </a>
          ) : null}
        </Section>
      ) : null}

      {data.services.length > 0 ? (
        <Section title="Services">
          {data.services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </Section>
      ) : null}

      {data.practitioners.length > 0 ? (
        <Section title="Practitioners">
          {data.practitioners.map((practitioner) => (
            <div key={practitioner.id}>
              <span className="font-medium text-foreground">
                {practitioner.name}
              </span>
              {practitioner.role ? (
                <span className="text-muted-foreground"> · {practitioner.role}</span>
              ) : null}
              {practitioner.specialties.length > 0 ? (
                <div className="mt-0.5">
                  <Chips items={practitioner.specialties} />
                </div>
              ) : null}
            </div>
          ))}
        </Section>
      ) : null}

      {data.website && !data.organization?.website ? (
        <a
          href={data.website}
          target="_blank"
          rel="noreferrer"
          className="block text-sm text-brand underline"
        >
          Visit website
        </a>
      ) : null}
    </div>
  );
}
