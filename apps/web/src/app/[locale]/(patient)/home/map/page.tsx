import { HomePage } from '@/features/home';
import { APP_CHROME_INSET_REM } from '@/lib/layout/chrome-inset';

export default function MapRoutePage() {
  return (
    <div
      className="fixed inset-x-0 z-10"
      style={{ top: APP_CHROME_INSET_REM, bottom: APP_CHROME_INSET_REM }}
    >
      <HomePage contained />
    </div>
  );
}
