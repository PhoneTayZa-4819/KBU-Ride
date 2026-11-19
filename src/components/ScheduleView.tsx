import { useState } from 'react';
import { ArrowLeft, Bell, Clock, MapPin } from 'lucide-react';
import type { ScheduleSlot, ServiceHoursStatus } from '../types/kbu';
import { KBU_SCHEDULE, findNextScheduledSlotId } from '../utils/shuttleEngine';
import type { TranslationStrings } from '../utils/i18n';
import { ServiceHoursBar } from './ServiceHoursBar';

interface ScheduleViewProps {
  t: TranslationStrings;
  serviceStatus: ServiceHoursStatus;
  previewLive: boolean;
  onTogglePreview: () => void;
  onTrackShuttle: (shuttleId: string) => void;
  onSetReminder: (shuttleId: string) => void;
  onBack?: () => void;
}

type PeriodFilter = 'All' | 'Morning' | 'Midday' | 'Evening';

export function ScheduleView({
  t,
  serviceStatus,
  previewLive,
  onTogglePreview,
  onTrackShuttle,
  onSetReminder,
  onBack,
}: ScheduleViewProps) {
  const [period, setPeriod] = useState<PeriodFilter>('All');
  const [shuttleFilter, setShuttleFilter] = useState<'all' | 1 | 2>('all');

  const nextSlotId = findNextScheduledSlotId(KBU_SCHEDULE, serviceStatus);

  const filtered: ScheduleSlot[] = KBU_SCHEDULE.filter((slot) => {
    const matchPeriod = period === 'All' || slot.period === period;
    const matchShuttle = shuttleFilter === 'all' || slot.shuttleNumber === shuttleFilter;
    return matchPeriod && matchShuttle;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-12">
      <div className="flex items-center gap-3 mb-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to Home"
            className="lg:hidden w-11 h-11 rounded-2xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#2C231E] flex items-center justify-center text-[#1A120E] dark:text-white cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1A120E] dark:text-white">
            {t.scheduleTitle}
          </h1>
          <p className="mt-1 text-sm text-[#766962] dark:text-[#A69B94]">
            {t.scheduleSubtitle}
          </p>
        </div>
      </div>

      {/* Operating Hours Status Bar */}
      <div className="mt-4">
        <ServiceHoursBar
          t={t}
          serviceStatus={serviceStatus}
          previewLive={previewLive}
          onTogglePreview={onTogglePreview}
          compact
        />
      </div>

      {/* Filters Row */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Filter schedule by time of day"
          className="inline-flex p-1 rounded-2xl bg-[#EFE7E0] dark:bg-[#17110D] border border-[#E2D6CC] dark:border-[#2A211C]"
        >
          {(['All', 'Morning', 'Midday', 'Evening'] as const).map((item) => {
            const active = period === item;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPeriod(item)}
                className={`min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#FF6D24] text-[#140E0A]'
                    : 'text-[#6B5E57] dark:text-[#A69B94] hover:text-[#1A120E] dark:hover:text-white'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div
          role="tablist"
          aria-label="Filter schedule by shuttle"
          className="inline-flex p-1 rounded-2xl bg-[#EFE7E0] dark:bg-[#17110D] border border-[#E2D6CC] dark:border-[#2A211C]"
        >
          {(
            [
              { key: 'all', label: 'All Shuttles' },
              { key: 1, label: 'Shuttle 1' },
              { key: 2, label: 'Shuttle 2' },
            ] as const
          ).map((item) => {
            const active = shuttleFilter === item.key;
            return (
              <button
                key={String(item.key)}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setShuttleFilter(item.key)}
                className={`min-h-[44px] px-3.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#FF6D24] text-[#140E0A]'
                    : 'text-[#6B5E57] dark:text-[#A69B94] hover:text-[#1A120E] dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Count */}
      <p className="mt-3 text-xs text-[#766962] dark:text-[#9E928A] tabular-nums">
        Showing {filtered.length} of {KBU_SCHEDULE.length} daily departures · 07:00 – 18:00 (every 15 min)
      </p>

      {/* Timetable List */}
      <div className="mt-3 rounded-3xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#2C231E] divide-y divide-[#EFE7E0] dark:divide-[#2A211C] overflow-hidden">
        {filtered.map((slot) => {
          const shuttleId = slot.shuttleNumber === 1 ? 'shuttle-1' : 'shuttle-2';
          const isNext = slot.id === nextSlotId;
          return (
            <div
              key={slot.id}
              className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                isNext
                  ? 'bg-[#FFF5EE] dark:bg-[#241811]'
                  : 'hover:bg-[#FAF7F4] dark:hover:bg-[#201915]'
              }`}
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <div
                  className={`min-w-[74px] text-center rounded-2xl border px-3 py-2 ${
                    isNext
                      ? 'bg-[#FF6D24] border-[#FF6D24] text-[#140E0A]'
                      : 'bg-[#FAF7F4] dark:bg-[#241C18] border-[#E5DBD3] dark:border-[#322721] text-[#1A120E] dark:text-white'
                  }`}
                >
                  <span className="text-lg font-extrabold tabular-nums">
                    {slot.time}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base font-bold text-[#1A120E] dark:text-white">
                    <span>Shuttle {slot.shuttleNumber}</span>
                    <span className="text-[#9E928A]" aria-hidden="true">·</span>
                    <span>{slot.route}</span>
                    {isNext && (
                      <>
                        <span className="text-[#9E928A]" aria-hidden="true">·</span>
                        <span className="text-xs font-extrabold text-[#D85312] dark:text-[#FF8D52]">
                          {t.nextDeparture}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#766962] dark:text-[#A69B94]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#FF6D24]" aria-hidden="true" />
                      {slot.departureStop} → ข้าวซอยเงินล้าน → Romklao Campus
                    </span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      ~{slot.estimatedDurationMin} min loop
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onTrackShuttle(shuttleId)}
                  className="min-h-[44px] px-4 rounded-xl bg-[#FF6D24] hover:bg-[#FF7F3F] text-[#140E0A] font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  {t.viewLocation}
                </button>
                <button
                  type="button"
                  onClick={() => onSetReminder(shuttleId)}
                  aria-label={`Set reminder for ${slot.time} Shuttle ${slot.shuttleNumber}`}
                  className="min-h-[44px] px-3.5 rounded-xl border border-[#DDD2C9] dark:border-[#3A2F29] bg-transparent hover:border-[#FF6D24] text-[#1A120E] dark:text-white font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Bell className="w-3.5 h-3.5 text-[#FF6D24]" aria-hidden="true" />
                  {t.setReminder}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-[#766962] dark:text-[#9E928A]">
        Bus 1 &amp; Bus 2 operate exclusively on the 3-stop Romklao loop (Kasem Bundit Romklao Dormitory ↔ ข้าวซอยเงินล้าน ↔ Kasem Bundit University Romklao Campus) from 07:00 to 18:00 (Bangkok time) only.
      </p>
    </div>
  );
}
