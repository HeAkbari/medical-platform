'use client';

import { Card, CardHeader } from '@/components/ui';

export function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-6 sm:p-6">
      <Card className="w-full max-w-md">
        <CardHeader
          title="Login"
          description="Authentication placeholder — mock MVP runs without login."
        />
        <p className="text-sm text-slate-600">
          JWT + cookie auth will be wired when the NestJS API is implemented.
        </p>
      </Card>
    </div>
  );
}
