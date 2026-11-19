import { useState } from 'react';
import { Bell, Clock, MapPin } from 'lucide-react';
import { BusIllustration } from './BusIllustration';
import type { TranslationStrings } from '../utils/i18n';

interface OnboardingScreenProps {
  t: TranslationStrings;
  onFinish: () => void;
  onOpenTerms: () => void;
}

interface SlideItem {
  headlineLine1: string;
  headlineLine2: string;
  description: string;
  notice: string;
  icon: 'pin' | 'bell' | 'clock';
}

const SLIDES: SlideItem[] = [
  {
    headlineLine1: 'Your Shuttle.',
    headlineLine2: 'Your Time.',
    description:
      'Track Kasem Bundit University campus shuttles, check arrival times, and travel with confidence.',
    notice:
      'Location is used only to show shuttles near you. You choose in the next system prompt.',
    icon: 'pin',
  },
  {
    headlineLine1: 'Live Campus',
    headlineLine2: 'GPS Tracking.',
    description:
      'Watch Shuttle 1 and Shuttle 2 loop between Romklao Dormitory, ข้าวซอยเงินล้าน, and Romklao Campus in real time.',
    notice:
      'Live arrival estimates refresh automatically as shuttles pass each KBU boarding stop.',
    icon: 'clock',
  },
  {
    headlineLine1: 'Smart Arrival',
    headlineLine2: 'Reminders.',
    description:
      'Set a 5, 10, or 15-minute chime alert before your bus arrives so you never rush to the gate.',
    notice:
      'Reminders notify your browser directly. Selecting a shuttle does not reserve a seat.',
    icon: 'bell',
  },
];

export function OnboardingScreen({ t, onFinish, onOpenTerms }: OnboardingScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const slide = SLIDES[stepIndex];
  const isLast = stepIndex === SLIDES.length - 1;

  const handlePrimaryAction = () => {
    if (isLast) {
      onFinish();
    } else {
      setStepIndex((prev) => prev + 1);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col bg-[#0E0A08] text-[#FAF7F5]"
      style={{
        backgroundImage:
          'radial-gradient(ellipse at 50% 18%, rgba(124, 52, 16, 0.32) 0%, rgba(14, 10, 8, 0.96) 55%, #0E0A08 100%)',
      }}
    >
      {/* Top bar: Step indicator + Skip button matching Image 02 */}
      <header className="w-full max-w-6xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-[#A69B94] tabular-nums">
          {stepIndex + 1} of {SLIDES.length}
        </span>
        <button
          type="button"
          onClick={onFinish}
          className="min-h-[44px] px-5 rounded-2xl border border-[#3A2E27] bg-[#1A1411]/70 text-sm font-semibold text-white hover:border-[#FF6D24]/60 hover:bg-[#231B17] transition-colors whitespace-nowrap shrink-0"
        >
          {t.skip}
        </button>
      </header>

      {/* Main Content: Responsive mobile single-column / desktop 2-column showcase */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-6 lg:py-12 flex flex-col lg:grid lg:grid-cols-12 lg:items-center gap-10 lg:gap-14">
        {/* Left Visual Hero (Bus + Campus Corridor Overview on Desktop) */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-md lg:max-w-lg rounded-3xl lg:bg-[#16100D]/80 lg:border lg:border-[#2B221D] lg:p-10 flex flex-col items-center">
            <BusIllustration className="w-64 sm:w-72 lg:w-80 h-auto" />

            {/* Desktop campus route context card below the bus */}
            <div className="hidden lg:grid grid-cols-[1.4fr_1fr_1fr] gap-4 w-full mt-10 pt-6 border-t border-[#2B221D]">
              <div>
                <p className="text-xs text-[#8C8078]">Route</p>
                <p className="mt-1 text-sm font-semibold text-white whitespace-nowrap">Romklao 3-Stop Loop</p>
              </div>
              <div>
                <p className="text-xs text-[#8C8078]">Active Fleet</p>
                <p className="mt-1 text-sm font-semibold text-white tabular-nums whitespace-nowrap">2 Live Shuttles</p>
              </div>
              <div>
                <p className="text-xs text-[#8C8078]">Service Hours</p>
                <p className="mt-1 text-sm font-semibold text-white tabular-nums whitespace-nowrap">07:00 – 18:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Copy, Progress Dots, Privacy Notice & CTA matching Image 02 */}
        <div className="lg:col-span-6 flex flex-col max-w-lg mx-auto lg:mx-0 w-full">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] text-white text-balance">
            {slide.headlineLine1}
            <br />
            {slide.headlineLine2}
          </h1>

          <p className="mt-4 text-base sm:text-lg leading-relaxed text-[#A69B94]">
            {slide.description}
          </p>

          {/* 3 Interactive Slide Indicator Buttons */}
          <div className="mt-6 flex items-center gap-2.5" role="tablist" aria-label="Onboarding steps">
            {SLIDES.map((item, idx) => {
              const active = idx === stepIndex;
              return (
                <button
                  key={item.headlineLine1}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Step ${idx + 1} of ${SLIDES.length}`}
                  onClick={() => setStepIndex(idx)}
                  className="py-3 px-0.5 flex items-center"
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-200 ${
                      active ? 'w-7 bg-[#FF6D24]' : 'w-2 bg-[#4A3E38] hover:bg-[#7A6A62]'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Location / Feature Notice Card matching Image 02 */}
          <div className="mt-4 rounded-2xl bg-[#1A1411] border border-[#2C231E] px-4 py-4 flex items-start gap-3.5">
            <span className="mt-0.5 shrink-0 text-[#FF6D24]" aria-hidden="true">
              {slide.icon === 'pin' && <MapPin className="w-5 h-5" />}
              {slide.icon === 'clock' && <Clock className="w-5 h-5" />}
              {slide.icon === 'bell' && <Bell className="w-5 h-5" />}
            </span>
            <p className="text-sm leading-relaxed text-[#BDB3AC]">{slide.notice}</p>
          </div>

          {/* Full-width Orange Primary CTA */}
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="mt-6 w-full min-h-[54px] rounded-2xl bg-[#FF6D24] hover:bg-[#FF7F3F] active:scale-[0.99] text-[#140E0A] font-bold text-base transition-all cursor-pointer whitespace-nowrap"
          >
            {isLast ? t.getStarted : t.getStarted}
          </button>

          {/* Terms & Conditions line */}
          <p className="mt-5 text-center text-sm text-[#9B9088]">
            {t.termsAcceptPrefix}
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-[#D4CBC5] underline underline-offset-4 hover:text-white transition-colors"
            >
              {t.termsAndConditions}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
