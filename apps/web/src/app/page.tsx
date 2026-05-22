import { redirect } from 'next/navigation';
import { DASHBOARD_BASE_PATH } from '@/config';

export default function HomePage() {
  redirect(DASHBOARD_BASE_PATH);
}
