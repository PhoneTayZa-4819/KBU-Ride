import { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import type { TranslationStrings } from '../utils/i18n';

interface PWAInstallButtonProps {
  t: TranslationStrings;
  variant?: 'banner' | 'settings-row';
}

export function PWAInstallButton({ t, variant = 'settings-row' }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  // Hide automatically when already running as an installed standalone PWA
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuide(true);
  };

  if (variant === 'banner') {
    // Only show the Home banner automatically when the browser can directly install or on iOS Safari
    if (dismissedBanner || (!isInstallable && !isIOS)) {
      return null;
    }

    return (
      <>
        <div className="rounded-2xl bg-[#FF6D24]/10 dark:bg-[#FF6D24]/15 border border-[#FF6D24]/35 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-xl bg-[#FF6D24] text-[#140E0A] flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#1A120E] dark:text-white truncate">
                {t.installAppTitle}
              </p>
              <p className="text-xs text-[#6B5E57] dark:text-[#C4BAB4] truncate">
                {t.installAppDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="min-h-[40px] px-3.5 rounded-xl bg-[#FF6D24] hover:bg-[#FF7F3F] text-[#140E0A] text-xs font-extrabold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {t.installAppBtn}
            </button>
            <button
              type="button"
              onClick={() => setDismissedBanner(true)}
              aria-label="Dismiss install banner"
              className="w-9 h-9 rounded-xl text-[#766962] dark:text-[#A69B94] hover:text-[#1A120E] dark:hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {showGuide && (
          <InstallGuideModal t={t} isIOS={isIOS} onClose={() => setShowGuide(false)} />
        )}
      </>
    );
  }

  // Settings row variant (always available in About Me when not installed)
  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="w-full min-h-[60px] px-5 py-3 rounded-2xl bg-white dark:bg-[#1A1411] border border-[#FF6D24]/60 hover:border-[#FF6D24] flex items-center justify-between gap-3 transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-[#FF6D24]/15 text-[#FF6D24] flex items-center justify-center shrink-0">
            <Download className="w-5 h-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <span className="block text-sm sm:text-base font-bold text-[#1A120E] dark:text-white">
              {t.installAppTitle}
            </span>
            <span className="block text-xs text-[#766962] dark:text-[#A69B94] truncate">
              {t.installAppDesc}
            </span>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-[#FF6D24] text-[#140E0A] text-xs font-extrabold whitespace-nowrap shrink-0">
          {t.installAppBtn}
        </span>
      </button>

      {showGuide && (
        <InstallGuideModal t={t} isIOS={isIOS} onClose={() => setShowGuide(false)} />
      )}
    </>
  );
}

function InstallGuideModal({
  t,
  isIOS,
  onClose,
}: {
  t: TranslationStrings;
  isIOS: boolean;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#2F251F] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#FF6D24] text-[#140E0A] flex items-center justify-center shrink-0">
              {isIOS ? <Share className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
            </span>
            <h3
              id="pwa-install-guide-title"
              className="text-lg font-extrabold text-[#1A120E] dark:text-white"
            >
              {isIOS ? t.installIOSHeading : t.installGeneralHeading}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close install instructions"
            className="w-9 h-9 rounded-xl text-[#8C8078] hover:text-[#1A120E] dark:hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isIOS ? (
          <ol className="mt-4 space-y-2.5 text-sm text-[#5C4F48] dark:text-[#CFC6C0] list-decimal list-inside">
            <li>{t.installIOSStep1}</li>
            <li>{t.installIOSStep2}</li>
            <li>{t.installIOSStep3}</li>
          </ol>
        ) : (
          <ol className="mt-4 space-y-2.5 text-sm text-[#5C4F48] dark:text-[#CFC6C0] list-decimal list-inside">
            <li>{t.installGeneralStep1}</li>
            <li>{t.installGeneralStep2}</li>
            <li>{t.installGeneralStep3}</li>
          </ol>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full min-h-[46px] rounded-2xl bg-[#FF6D24] hover:bg-[#FF7F3F] text-[#140E0A] font-bold text-sm transition-colors cursor-pointer"
        >
          {t.installGotIt}
        </button>
      </div>
    </div>
  );
}
