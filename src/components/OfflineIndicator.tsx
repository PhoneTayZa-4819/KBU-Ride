import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import type { TranslationStrings } from '../utils/i18n';

export function OfflineIndicator({ t }: { t: TranslationStrings }) {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-24 lg:bottom-5 left-4 z-50 flex items-center gap-2 rounded-2xl bg-[#1A1411] border border-[#F5C14A] px-3.5 py-2 text-xs font-semibold text-[#FAF7F5] shadow-xl"
    >
      <WifiOff className="w-3.5 h-3.5 text-[#F5C14A] shrink-0" aria-hidden="true" />
      <span>{t.offlineBanner}</span>
    </div>
  );
}
