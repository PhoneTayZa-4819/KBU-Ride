import { Clock, Eye, EyeOff } from 'lucide-react';
import type { ServiceHoursStatus } from '../types/kbu';
import type { TranslationStrings } from '../utils/i18n';

interface ServiceHoursBarProps {
  t: TranslationStrings;
  serviceStatus: ServiceHoursStatus;
  previewLive: boolean;
  onTogglePreview: () => void;
  compact?: boolean;
}

export function ServiceHoursBar({
  t,
  serviceStatus,
  previewLive,
  onTogglePreview,
  compact = false,
}: ServiceHoursBarProps) {
  if (serviceStatus.isOperating) {
    return (
      <div
        role="status"
        className={`rounded-2xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#2C231E] flex flex-wrap items-center justify-between gap-2 ${
          compact ? 'px-3.5 py-2.5' : 'px-4 py-3'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 text-xs sm:text-sm text-[#5C4F48] dark:text-[#C4BAB4]">
          <Clock className="w-4 h-4 text-[#FF6D24] shrink-0" aria-hidden="true" />
          <span className="font-semibold text-[#1A120E] dark:text-white truncate">
            {t.serviceActiveBanner}
          </span>
        </div>
        <span className="text-xs font-semibold text-[#766962] dark:text-[#A69B94] tabular-nums whitespace-nowrap">
          {t.bangkokTimeLabel} {serviceStatus.bangkokTimeLabel}
        </span>
      </div>
    );
  }

  return (
    <div
      role="status"
      data-testid="service-hours-bar"
      className={`rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        previewLive
          ? 'bg-[#FFF5EE] dark:bg-[#241811] border-[#FF6D24]/50'
          : 'bg-white dark:bg-[#1A1411] border-[#E5DBD3] dark:border-[#322721]'
      } ${compact ? 'px-3.5 py-2.5' : 'px-4 py-3.5'}`}
    >
      <div className="flex items-start sm:items-center gap-2.5 min-w-0">
        <Clock
          className={`w-4 h-4 shrink-0 mt-0.5 sm:mt-0 ${
            previewLive ? 'text-[#FF6D24]' : 'text-[#8C8078] dark:text-[#A69B94]'
          }`}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-bold text-[#1A120E] dark:text-white leading-snug">
            {previewLive ? t.livePreviewActive : t.offHoursBannerTitle}
          </p>
          <p className="text-xs text-[#766962] dark:text-[#A69B94] tabular-nums leading-snug">
            {t.offHoursBannerDesc} · {t.bangkokTimeLabel} {serviceStatus.bangkokTimeLabel} ·{' '}
            {t.nextBusAt} {serviceStatus.nextServiceLabel}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onTogglePreview}
        aria-pressed={previewLive}
        data-testid="live-preview-toggle"
        className={`min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
          previewLive
            ? 'bg-white dark:bg-[#17110D] border border-[#FF6D24] text-[#D85312] dark:text-[#FF8D52] hover:bg-[#FF6D24]/10'
            : 'bg-[#FF6D24] hover:bg-[#FF7F3F] text-[#140E0A]'
        }`}
      >
        {previewLive ? (
          <>
            <EyeOff className="w-4 h-4" aria-hidden="true" />
            <span>{t.exitPreviewBtn}</span>
          </>
        ) : (
          <>
            <Eye className="w-4 h-4" aria-hidden="true" />
            <span>{t.previewLiveBtn}</span>
          </>
        )}
      </button>
    </div>
  );
}
