import { useEffect, useState } from 'react';
import { BusIllustration } from './BusIllustration';
import type { TranslationStrings } from '../utils/i18n';

interface SplashScreenProps {
  t: TranslationStrings;
  onComplete: () => void;
}

export function SplashScreen({ t, onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(28);

  useEffect(() => {
    const t1 = window.setTimeout(() => setProgress(65), 250);
    const t2 = window.setTimeout(() => setProgress(100), 900);
    const t3 = window.setTimeout(() => onComplete(), 1400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 relative overflow-hidden bg-[#120D0A] text-[#FAF7F5]"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 42%, rgba(124, 52, 16, 0.42) 0%, rgba(18, 13, 10, 0.96) 62%, #0E0A08 100%)',
      }}
    >
      <div className="flex flex-col items-center text-center max-w-md w-full">
        <div className="mb-8">
          <BusIllustration className="w-60 sm:w-72 h-auto" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          KBU Ride
        </h1>

        <p className="mt-3 text-xs sm:text-sm font-medium tracking-[0.26em] text-[#B5ABA4]">
          {t.tagline}
        </p>

        <p className="mt-2 text-xs text-[#7E746E]">
          Kasem Bundit University Campus Shuttle
        </p>

        {/* Orange progress track matching Screen 01 */}
        <div
          className="mt-10 w-36 h-1.5 rounded-full bg-[#2A221D] overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Loading KBU Ride"
        >
          <div
            className="h-full rounded-full bg-[#FF6D24] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          type="button"
          onClick={onComplete}
          className="mt-8 text-xs font-medium text-[#A69B94] hover:text-white transition-colors min-h-[44px] px-4"
        >
          Tap to continue
        </button>
      </div>
    </div>
  );
}
