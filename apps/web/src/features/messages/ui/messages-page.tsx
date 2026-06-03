'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  MOCK_HEALTH_MESSAGES,
  type HealthMessage,
} from '@/features/messages/data/mock-messages';

function formatMessageDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function MessageDetail({
  message,
  onBack,
}: {
  message: HealthMessage;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-11 items-center text-sm font-medium text-brand"
      >
        ← Back to messages
      </button>

      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-brand">
          {message.sender}
        </p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          {message.subject}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {formatMessageDate(message.receivedAt)}
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-700">{message.body}</p>
      </Card>

      <p className="text-xs text-slate-500">
        If notifications are off, important updates may also be sent by SMS.
      </p>
    </div>
  );
}

export function MessagesPage() {
  const [messages, setMessages] = useState(MOCK_HEALTH_MESSAGES);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedMessage =
    messages.find((message) => message.id === selectedId) ?? null;

  function openMessage(id: string) {
    setSelectedId(id);
    setMessages((current) =>
      current.map((message) =>
        message.id === id ? { ...message, read: true } : message
      )
    );
  }

  if (selectedMessage) {
    return (
      <MessageDetail
        message={selectedMessage}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Messages
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Secure messages from your GP, hospital, and screening services.
        </p>
      </header>

      <ul className="space-y-2">
        {messages.map((message) => (
          <li key={message.id}>
            <button
              type="button"
              onClick={() => openMessage(message.id)}
              className="w-full text-start"
            >
              <Card
                className={
                  message.read
                    ? 'transition hover:border-brand-subtle'
                    : 'border-brand-subtle bg-brand-muted/40 transition hover:shadow-sm'
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {message.subject}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {message.sender}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {message.preview}
                    </p>
                  </div>
                  {!message.read ? (
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-brand" />
                  ) : null}
                </div>
              </Card>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
