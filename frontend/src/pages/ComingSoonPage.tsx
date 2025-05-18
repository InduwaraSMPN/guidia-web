
import { ComingSoonScroll } from '@/components/ui/coming-soon-scroll';

export function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
      <ComingSoonScroll />
    </div>
  );
}