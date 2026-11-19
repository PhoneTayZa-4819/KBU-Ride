import { Gauge, MapPin, Users } from 'lucide-react';
import type {
  CampusStop,
  LanguageCode,
  LiveRouteState,
  ServiceHoursStatus,
  ShuttleState,
  ShuttleTelemetry,
} from '../types/kbu';
import { computeShuttleTelemetry } from '../utils/shuttleEngine';
import type { TranslationStrings } from '../utils/i18n';
import { LiveMapCanvas } from './LiveMapCanvas';
import { ServiceHoursBar } from './ServiceHoursBar';

interface LiveLocationViewProps {
  t: TranslationStrings;
  lang: LanguageCode;
  shuttles: ShuttleState[];
  telemetries: Record<string, ShuttleTelemetry>;
  stops: CampusStop[];
  routeState: LiveRouteState;
  serviceStatus: ServiceHoursStatus;
  previewLive: boolean;
  isLiveActive: boolean;
  isDark: boolean;
  selectedShuttleId: string;
  selectedStopId: string;
  onTogglePreview: () => void;
  onSelectShuttle: (id: string) => void;
  onSelectStop: (id: string) => void;
  onSetReminder: (shuttleId: string) => void;
}

export function LiveLocationView({
  t,
  lang,
  shuttles,
  telemetries,
  stops,
  routeState,
  serviceStatus,
  previewLive,
  isLiveActive,
  isDark,
  selectedShuttleId,
  selectedStopId,
  onTogglePreview,
  onSelectShuttle,
  onSelectStop,
  onSetReminder,
}: LiveLocationViewProps) {
  const activeShuttle = shuttles.find((s) => s.id === selectedShuttleId) ?? shuttles[0];
  const activeTel = telemetries[activeShuttle.id];
  const targetStop = stops.find((s) => s.id === selectedStopId) ?? stops[0];
  const isOffHours = activeTel?.status === 'Off hours';
  const isApproaching =
    activeTel?.status === 'Approaching' || activeTel?.status === 'Arriving now';

  const statusText =
    activeTel?.status === 'Off hours'
      ? t.offHours
      : activeTel?.status === 'Arriving now'
        ? t.arrivingNow
        : activeTel?.status === 'Approaching'
          ? t.approaching
          : t.onRoute;

  return (
    <div className="w-full lg:max-w-7xl lg:mx-auto lg:px-8 lg:py-6">
      {/* Desktop Operating Hours Bar above map + telemetry grid */}
      <div className="hidden lg:block mb-5">
        <ServiceHoursBar
          t={t}
          serviceStatus={serviceStatus}
          previewLive={previewLive}
          onTogglePreview={onTogglePreview}
          compact
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6">
        {/* Interactive Map Viewport matching Image 07 */}
        <section
          aria-label="Live Shuttle Map"
          className="lg:col-span-8 relative h-[100dvh] min-h-[640px] lg:h-[720px] lg:rounded-3xl overflow-hidden lg:border lg:border-[#E5DBD3] lg:dark:border-[#2C231E]"
        >
          {/* Floating Top Segmented Shuttle Switcher matching Image 07 */}
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-col items-center gap-2 pointer-events-none">
            <div
              role="tablist"
              aria-label="Select shuttle to track"
              className="pointer-events-auto w-full max-w-md grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-white/90 dark:bg-[#17110D]/90 backdrop-blur-md border border-[#E5DBD3] dark:border-[#2F251F]"
            >
              {shuttles.map((shuttle) => {
                const active = shuttle.id === activeShuttle.id;
                return (
                  <button
                    key={shuttle.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => onSelectShuttle(shuttle.id)}
                    className={`min-h-[44px] rounded-xl text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#FF6D24] text-[#140E0A]'
                        : 'text-[#6B5E57] dark:text-[#B5ABA4] hover:text-[#1A120E] dark:hover:text-white'
                    }`}
                  >
                    {shuttle.name}
                  </button>
                );
              })}
            </div>

            {/* Mobile Off-Hours Quick Toggle Pill inside map header when outside 07:00-18:00 */}
            {!serviceStatus.isOperating && (
              <div className="lg:hidden pointer-events-auto w-full max-w-md flex items-center justify-between gap-2 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-[#17110D]/95 backdrop-blur-md border border-[#E5DBD3] dark:border-[#322721] text-xs shadow-sm">
                <span className="font-semibold text-[#5C4F48] dark:text-[#C4BAB4] truncate tabular-nums">
                  {previewLive
                    ? `Live preview · ${serviceStatus.bangkokTimeLabel}`
                    : `${t.offHours} (07:00–18:00)`}
                </span>
                <button
                  type="button"
                  onClick={onTogglePreview}
                  className="min-h-[34px] px-3 rounded-xl bg-[#FF6D24] text-[#140E0A] font-bold text-xs whitespace-nowrap cursor-pointer"
                >
                  {previewLive ? t.exitPreviewBtn : t.previewLiveBtn}
                </button>
              </div>
            )}
          </div>

          {/* Live Google Map Canvas */}
          <LiveMapCanvas
            shuttles={shuttles}
            telemetries={telemetries}
            stops={stops}
            routeState={routeState}
            selectedShuttleId={activeShuttle.id}
            selectedStopId={selectedStopId}
            lang={lang}
            isDark={isDark}
            isLiveActive={isLiveActive}
            onSelectShuttle={onSelectShuttle}
            onSelectStop={onSelectStop}
          />

          {/* Floating Bottom Shuttle Info Card matching Image 07 */}
          {activeTel && (
            <div className="absolute bottom-24 lg:bottom-5 left-4 right-4 z-20 max-w-md mx-auto lg:mx-0">
              <div className="rounded-3xl bg-white/95 dark:bg-[#1A1411]/95 backdrop-blur-md border border-[#E2D6CC] dark:border-[#342923] p-5 shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="text-lg font-extrabold text-[#1A120E] dark:text-white">
                      {activeShuttle.name}
                    </h1>
                    <p className="text-xs text-[#766962] dark:text-[#A69B94] truncate">
                      {isOffHours
                        ? activeShuttle.routeLabel
                        : `${activeShuttle.routeLabel} · ${activeTel.distanceKm} km away`}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap shrink-0 ${
                      isOffHours
                        ? 'bg-[#E9E1DA] dark:bg-[#2E2621] text-[#5C4F48] dark:text-[#C4BAB4]'
                        : isApproaching
                          ? 'bg-[#34C77B] text-[#0A1F12]'
                          : 'bg-[#F5C14A] text-[#1F1605]'
                    }`}
                  >
                    {statusText}
                  </span>
                </div>

                {isOffHours ? (
                  <div className="mt-3 flex items-baseline gap-2.5 flex-wrap">
                    <span className="text-4xl font-extrabold text-[#1A120E] dark:text-white tabular-nums leading-none">
                      {serviceStatus.nextServiceLabel}
                    </span>
                    <span className="text-xs sm:text-sm text-[#766962] dark:text-[#A69B94]">
                      {t.nextBusAt} {serviceStatus.nextServiceLabel} · {t.serviceHoursWindow}
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 flex items-baseline gap-2.5 flex-wrap">
                    <span className="text-4xl font-extrabold text-[#1A120E] dark:text-white tabular-nums leading-none">
                      {activeTel.etaMinutes}
                    </span>
                    <span className="text-xs sm:text-sm text-[#766962] dark:text-[#A69B94] tabular-nums">
                      {t.minTo} {lang === 'th' ? targetStop.nameTh : targetStop.shortLabel} (estimate) ·{' '}
                      {t.updated} {activeShuttle.updatedSecondsAgo} {t.sAgo}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => onSetReminder(activeShuttle.id)}
                  className="mt-4 w-full min-h-[48px] rounded-2xl bg-[#FF6D24] hover:bg-[#FF7F3F] active:scale-[0.99] text-[#140E0A] font-bold text-sm transition-all cursor-pointer"
                >
                  {t.setReminder}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Desktop Stop-by-Stop Live ETA & Vehicle Telemetry Sidebar */}
        <aside className="hidden lg:flex lg:col-span-4 flex-col gap-5">
          {/* Vehicle Telemetry Summary */}
          <div className="rounded-3xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#2C231E] p-5">
            <h2 className="text-base font-bold text-[#1A120E] dark:text-white">
              {activeShuttle.name} Telemetry
            </h2>
            <p className="mt-1 text-xs text-[#766962] dark:text-[#A69B94]">
              Driver {activeShuttle.driverName} · Plate {activeShuttle.plateNumber}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#FAF7F4] dark:bg-[#221B17] p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-[#766962] dark:text-[#A69B94]">
                  <Gauge className="w-3.5 h-3.5 text-[#FF6D24]" aria-hidden="true" />
                  <span>Speed</span>
                </div>
                <p className="mt-1.5 text-xl font-extrabold text-[#1A120E] dark:text-white tabular-nums">
                  {isLiveActive ? `${activeShuttle.speedKmh} km/h` : '0 km/h'}
                </p>
              </div>
              <div className="rounded-2xl bg-[#FAF7F4] dark:bg-[#221B17] p-3.5">
                <div className="flex items-center gap-1.5 text-xs text-[#766962] dark:text-[#A69B94]">
                  <Users className="w-3.5 h-3.5 text-[#FF6D24]" aria-hidden="true" />
                  <span>Capacity</span>
                </div>
                <p className="mt-1.5 text-xl font-extrabold text-[#1A120E] dark:text-white tabular-nums">
                  {isLiveActive ? `${activeShuttle.occupancyPercent}% full` : 'Parked'}
                </p>
              </div>
            </div>
          </div>

          {/* 3 Romklao Loop Stops ETA Timeline */}
          <div className="rounded-3xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#2C231E] p-5 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#1A120E] dark:text-white">
                Romklao Loop Stops (3)
              </h2>
              <span className="text-xs text-[#766962] dark:text-[#A69B94]">Tap stop</span>
            </div>

            <div className="space-y-2">
              {stops.map((stop) => {
                const stopTel = computeShuttleTelemetry(
                  activeShuttle,
                  stops,
                  stop.id,
                  routeState.path,
                  routeState.distanceKm,
                  routeState.durationMinutes,
                  isLiveActive
                );
                const isSelected = stop.id === selectedStopId;
                return (
                  <button
                    key={stop.id}
                    type="button"
                    onClick={() => onSelectStop(stop.id)}
                    className={`w-full min-h-[54px] px-3.5 py-2.5 rounded-2xl border flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#FF6D24]/12 border-[#FF6D24] text-[#1A120E] dark:text-white'
                        : 'bg-[#FAF7F4] dark:bg-[#201915] border-transparent hover:border-[#3A2F29] text-[#1A120E] dark:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin
                        className={`w-4 h-4 shrink-0 ${
                          isSelected ? 'text-[#FF6D24]' : 'text-[#8C8078]'
                        }`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {lang === 'th' ? stop.nameTh : stop.name}
                        </p>
                        <p className="text-xs text-[#766962] dark:text-[#9E928A] truncate">
                          {stop.formattedAddress
                            ? `${stop.campus} · ${stop.formattedAddress}`
                            : `${stop.campus} · ${stopTel.distanceKm} km`}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold tabular-nums whitespace-nowrap text-[#FF6D24]">
                      {isLiveActive ? `${stopTel.etaMinutes} min` : '07:00'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
