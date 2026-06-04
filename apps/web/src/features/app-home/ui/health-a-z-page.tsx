'use client';

import { useMemo, useState } from 'react';
import { Badge, Card, CardHeader } from '@/components/ui';
import { inputClassName } from '@/components/ui/input-styles';
import {
  getHealthTopic,
  HEALTH_AZ_DISCLAIMER,
  HEALTH_TOPIC_LETTERS,
  HEALTH_TOPICS,
  searchHealthTopics,
} from '@/features/app-home/data/mock-health-a-z';
import type {
  HealthTopic,
  HealthTopicCategory,
} from '@/features/app-home/types/health-information';
import { ServiceBackLink } from '@/features/app-home/ui/service-back-link';
import { ServiceMockNotice } from '@/features/app-home/ui/service-mock-notice';

function categoryLabel(category: HealthTopicCategory): string {
  switch (category) {
    case 'condition':
      return 'Condition';
    case 'symptom':
      return 'Symptom';
    case 'treatment':
      return 'Treatment';
    case 'wellness':
      return 'Wellness';
    case 'service':
      return 'BC service';
  }
}

function categoryVariant(
  category: HealthTopicCategory
): 'default' | 'success' | 'warning' | 'muted' {
  switch (category) {
    case 'condition':
      return 'default';
    case 'symptom':
      return 'warning';
    case 'treatment':
      return 'success';
    case 'wellness':
      return 'muted';
    case 'service':
      return 'default';
  }
}

function TopicListItem({
  topic,
  isSelected,
  onSelect,
}: {
  topic: HealthTopic;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(topic.id)}
      className={`w-full rounded-xl border px-4 py-3 text-left transition active:scale-[0.99] ${
        isSelected
          ? 'border-brand-light bg-brand-muted'
          : 'border-slate-200 bg-white hover:border-brand-subtle hover:bg-brand-muted/30'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-slate-900">{topic.title}</p>
        <Badge variant={categoryVariant(topic.category)}>
          {categoryLabel(topic.category)}
        </Badge>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{topic.summary}</p>
    </button>
  );
}

function TopicDetail({
  topic,
  onSelectRelated,
}: {
  topic: HealthTopic;
  onSelectRelated: (id: string) => void;
}) {
  const related = topic.relatedTopicIds
    .map((id) => getHealthTopic(id))
    .filter((item): item is HealthTopic => Boolean(item));

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant={categoryVariant(topic.category)}>
          {categoryLabel(topic.category)}
        </Badge>
        <span className="text-xs text-slate-500">{topic.letter}</span>
      </div>

      <h3 className="text-lg font-semibold text-slate-900">{topic.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{topic.summary}</p>

      <div className="mt-4 space-y-4">
        {topic.sections.map((section) => (
          <section key={section.heading}>
            <h4 className="text-sm font-semibold text-slate-800">
              {section.heading}
            </h4>
            <p className="mt-1 text-sm leading-6 text-slate-600">{section.body}</p>
          </section>
        ))}
      </div>

      {related.length > 0 ? (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Related topics
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {related.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectRelated(item.id)}
                className="rounded-full border border-brand-subtle bg-white px-3 py-1 text-sm text-brand-dark transition hover:bg-brand-muted"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function HealthAzPage() {
  const [query, setQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    HEALTH_TOPICS[0]?.id ?? ''
  );

  const filteredTopics = useMemo(() => {
    const searched = searchHealthTopics(query);

    if (!activeLetter) {
      return searched;
    }

    return searched.filter((topic) => topic.letter === activeLetter);
  }, [activeLetter, query]);

  const selectedTopic =
    getHealthTopic(selectedTopicId) ?? filteredTopics[0] ?? HEALTH_TOPICS[0];

  return (
    <div className="space-y-4">
      <ServiceBackLink />

      <Card>
        <CardHeader
          title="Health A–Z"
          description="Information about conditions, symptoms, and treatments."
        />

        <p className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
          {HEALTH_AZ_DISCLAIMER}
        </p>

        <label className="mb-4 block">
          <span className="sr-only">Search health topics</span>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveLetter(null);
            }}
            placeholder="Search conditions, symptoms, treatments…"
            className={inputClassName}
          />
        </label>

        <div className="map-need-scroll mb-4 flex gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveLetter(null)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium ${
              activeLetter === null
                ? 'border-brand-light bg-brand text-brand-foreground'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            All
          </button>
          {HEALTH_TOPIC_LETTERS.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => setActiveLetter(letter)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium ${
                activeLetter === letter
                  ? 'border-brand-light bg-brand text-brand-foreground'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {filteredTopics.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                No topics match your search.
              </p>
            ) : (
              filteredTopics.map((topic) => (
                <TopicListItem
                  key={topic.id}
                  topic={topic}
                  isSelected={selectedTopic?.id === topic.id}
                  onSelect={setSelectedTopicId}
                />
              ))
            )}
          </div>

          {selectedTopic ? (
            <div className="lg:sticky lg:top-4 lg:self-start">
              <TopicDetail
                topic={selectedTopic}
                onSelectRelated={setSelectedTopicId}
              />
            </div>
          ) : null}
        </div>
      </Card>

      <ServiceMockNotice />
    </div>
  );
}
