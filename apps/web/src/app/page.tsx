import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/lib/env';
import { dashboardPath } from '@/lib/routes';

export default function HomePage() {
  redirect(dashboardPath(DEFAULT_LOCALE));
}
