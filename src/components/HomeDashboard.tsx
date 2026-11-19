import { useState } from 'react';
import {
  Bell,
  CalendarCheck2,
  ChevronDown,
  ChevronUp,
  LogOut,
  MapPin,
  Navigation,
  User,
} from 'lucide-react';
import type {
  AppTab,
  CampusStop,
  LanguageCode,
  LiveRouteState,
  ServiceHoursStatus,
  ShuttleState,
  ShuttleTelemetry,
  StudentProfile,
} from '../types/kbu';
import { getInitials, maskPhoneNumber } from '../utils/authHelpers';
import { getTimeGreeting, type TranslationStrings } from '../utils/i18n';
import { LiveMapCanvas } from './LiveMapCanvas';
import { ServiceHoursBar } from './ServiceHoursBar';
import { PWAInstallButton } from './PWAInstallButton';

interface HomeDashboardProps {
  t: TranslationStrings;
  lang: LanguageCode;
  profile: StudentProfile;
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
  unreadNotifications: number;
  onTogglePreview: () => void;
  onSelectShuttle: (id: string) => void;
  onSelectStop: (id: string) => void;
  onViewLocation: (shuttleId: string) => void;
  onSetReminder: (shuttleId: string) => void;
  onNavigate: (tab: AppTab) => void;
  onLogOut: () => void;
}

export function HomeDashboard({
  t,
  lang,
  profile,
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
  unreadNotifications,
  onTogglePreview,
  onSelectShuttle,
  onSelectStop,
  onViewLocation,
  onSetReminder,
  onNavigate,
  onLogOut,
}: HomeDashboardProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initials = getInitials(profile.name);
  const maskedPhone = maskPhoneNumber(profile.countryCode, profile.phoneNumber);
  const greeting = getTimeGreeting(new Date(), lang);
  const selectedShuttle = shuttles.find((s) => s.id === selectedShuttleId) ?? shuttles[0];
  const selectedStop = stops.find((s) => s.id === selectedStopId) ?? stops[0];

  const getStatusLabel = (status: ShuttleTelemetry['status']) => {
    if (status === 'Off hours') return t.offHours;
    if (status === 'Arriving now') return t.arrivingNow;
    if (status === 'Approaching') return t.approaching;
    return t.onRoute;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-5 pb-28 lg:pb-12">
      {/* Mobile / Compact Greeting Header matching Images 04 & 05 */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          aria-expanded={dropdownOpen}
          aria-controls="kbu-profile-dropdown"
          className="flex items-center gap-3.5 text-left group cursor-pointer min-h-[48px] flex-1"
        >
          <span className="w-12 h-12 rounded-full bg-[#FF6D24] text-[#140E0A] font-extrabold text-base flex items-center justify-center shrink-0">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-[#766962] dark:text-[#A69B94] truncate">
              {greeting}
            </p>
            <p className="text-base sm:text-lg font-bold text-[#1A120E] dark:text-white truncate">
              {profile.name.trim() || t.addYourName}
            </p>
          </div>
          <span
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
              dropdownOpen
                ? 'text-[#FF6D24]'
                : 'text-[#6E6058] dark:text-[#C4BAB4] group-hover:text-[#FF6D24]'
            }`}
            aria-hidden="true"
          >
            {dropdownOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </span>
        </button>

        {/* Notification Bell Button with Orange Dot matching Images 04 & 05 */}
        <button
          type="button"
          onClick={() => onNavigate('reminders')}
          aria-label={`${t.notificationsReminders} (${unreadNotifications} active)`}
          className="relative w-12 h-12 rounded-2xl bg-white dark:bg-[#1A1411] border border-[#E2D6CC] dark:border-[#322721] flex items-center justify-center text-[#1A120E] dark:text-white hover:border-[#FF6D24] transition-colors shrink-0 cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          {unreadNotifications > 0 && (
            <span
              className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#FF6D24]"
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      {/* Expandable Inline Profile Dropdown Card matching Image 05 */}
      {dropdownOpen && (
        <section
          id="kbu-profile-dropdown"
          aria-label="Account quick menu"
          className="mb-6 max-w-xl rounded-3xl bg-white dark:bg-[#1A1411] border border-[#E2D6CC] dark:border-[#2F251F] p-5 shadow-sm"
        >
          <div className="flex items-center gap-4 pb-4 border-b border-[#EFE7E0] dark:border-[#2C231E]">
            <div className="w-16 h-16 rounded-full p-1 border-2 border-[#FF6D24] shrink-0">
              <div className="w-full h-full rounded-full bg-[#FF6D24] text-[#140E0A] font-extrabold text-lg flex items-center justify-center">
                {initials}
              </div>
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-extrabold text-[#1A120E] dark:text-white truncate">
                {profile.name.trim() || t.addYourName}
              </h2>
              <p className="text-sm text-[#766962] dark:text-[#A69B94] tabular-nums">
                {maskedPhone}
              </p>
              {profile.verified && (
                <span className="mt-1.5 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-[#34C77B] text-[#0A1F12]">
                  {t.verified}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                onNavigate('about');
              }}
              className="w-full min-h-[48px] px-2 rounded-2xl flex items-center justify-between gap-3 hover:bg-[#F5EFEA] dark:hover:bg-[#241C18] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-3.5">
                <span className="w-10 h-10 rounded-xl bg-[#F5EFEA] dark:bg-[#261E19] text-[#FF6D24] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </span>
                <span className="text-sm sm:text-base font-semibold text-[#1A120E] dark:text-white">
                  {t.profileSettings}
                </span>
              </span>
              <span className="text-xs sm:text-sm text-[#766962] dark:text-[#A69B94] whitespace-nowrap">
                {t.navAboutMe}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                onNavigate('reminders');
              }}
              className="w-full min-h-[48px] px-2 rounded-2xl flex items-center justify-between gap-3 hover:bg-[#F5EFEA] dark:hover:bg-[#241C18] transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-3.5">
                <span className="w-10 h-10 rounded-xl bg-[#F5EFEA] dark:bg-[#261E19] text-[#FF6D24] flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </span>
                <span className="text-sm sm:text-base font-semibold text-[#1A120E] dark:text-white">
                  {t.notificationsReminders}
                </span>
              </span>
              <span className="min-w-[28px] h-7 px-2 rounded-full bg-[#FF6D24] text-[#140E0A] text-xs font-extrabold flex items-center justify-center tabular-nums">
                {unreadNotifications}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                onLogOut();
              }}
              className="w-full min-h-[48px] px-2 rounded-2xl flex items-center gap-3.5 hover:bg-[#F16565]/10 transition-colors cursor-pointer"
            >
              <span className="w-10 h-10 rounded-xl bg-[#F5EFEA] dark:bg-[#261E19] text-[#F16565] flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4" />
              </span>
              <span className="text-sm sm:text-base font-semibold text-[#F16565]">
                {t.logOut}
              </span>
            </button>
          </div>
        </section>
      )}

      {/* Operating Hours Status & Off-Hours Live Preview Bar */}
      <div className="mb-5 space-y-3">
        <ServiceHoursBar
          t={t}
          serviceStatus={serviceStatus}
          previewLive={previewLive}
          onTogglePreview={onTogglePreview}
        />
        <PWAInstallButton t={t} variant="banner" />
      </div>

      {/* Main Responsive Grid: Single column on mobile (Image 04), 2-column dashboard on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Primary Column: Your Next Shuttle + Cards + Quick Actions */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section Title Row matching Image 04 */}
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1A120E] dark:text-white whitespace-nowrap">
              {t.yourNextShuttle}
            </h1>

            {/* Boarding Stop Selector */}
            <div className="relative shrink-0">
              <label htmlFor="home-boarding-stop" className="sr-only">
                {t.boardingStop}
              </label>
              <select
                id="home-boarding-stop"
                value={selectedStopId}
                onChange={(e) => onSelectStop(e.target.value)}
                className="appearance-none min-h-[38px] max-w-[168px] sm:max-w-none truncate rounded-full bg-white dark:bg-[#1E1713] border border-[#E2D6CC] dark:border-[#322721] pl-3.5 pr-8 py-1.5 text-xs font-semibold text-[#5C4F48] dark:text-[#C9BFB8] focus:border-[#FF6D24] focus:outline-none cursor-pointer"
              >
                {stops.map((stop) => (
                  <option
                    key={stop.id}
                    value={stop.id}
                    className="bg-white dark:bg-[#1A1411] text-[#1A120E] dark:text-white"
                  >
                    {lang === 'th' ? stop.nameTh : stop.shortLabel}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none w-3.5 h-3.5 text-[#8C8078] absolute right-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Shuttle Cards Stack matching Image 04 */}
          <div className="space-y-4">
            {shuttles.map((shuttle) => {
              const tel = telemetries[shuttle.id];
              if (!tel) return null;
              const isSelected = shuttle.id === selectedShuttleId;
              const isOffHours = tel.status === 'Off hours';
              const isApproaching = tel.status === 'Approaching' || tel.status === 'Arriving now';
              const nextStopLabel = lang === 'th' ? tel.nextStop.nameTh : tel.nextStop.name;

              return (
                <article
                  key={shuttle.id}
                  onClick={() => onSelectShuttle(shuttle.id)}
                  className={`rounded-3xl p-5 sm:p-6 transition-colors cursor-pointer bg-white dark:bg-[#1A1411] ${
                    isSelected
                      ? 'border-2 border-[#FF6D24]'
                      : 'border border-[#E5DBD3] dark:border-[#2C231E] hover:border-[#FF6D24]/50'
                  }`}
                >
                  {/* Top Row: Shuttle Name & Status Badge */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-[#1A120E] dark:text-white">
                        {shuttle.name}
                      </h2>
                      <p className="text-xs text-[#766962] dark:text-[#968A82] truncate">
                        {shuttle.routeLabel} · {shuttle.plateNumber}
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
                      {getStatusLabel(tel.status)}
                    </span>
                  </div>

                  {/* Big Tabular ETA Readout or Off-Hours Next Departure */}
                  {isOffHours ? (
                    <div className="mt-3 flex items-baseline gap-2.5 flex-wrap">
                      <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1A120E] dark:text-white tabular-nums leading-none">
                        {serviceStatus.nextServiceLabel}
                      </span>
                      <span className="text-sm sm:text-base text-[#766962] dark:text-[#A69B94]">
                        {t.nextBusAt} {serviceStatus.nextServiceLabel}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-baseline gap-2.5">
                      <span className="text-5xl font-extrabold tracking-tight text-[#1A120E] dark:text-white tabular-nums leading-none">
                        {tel.etaMinutes}
                      </span>
                      <span className="text-sm sm:text-base text-[#766962] dark:text-[#A69B94]">
                        {t.minAwayEstimate}
                      </span>
                    </div>
                  )}

                  {/* Next Stop & Live Telemetry Timestamp */}
                  <p className="mt-2.5 text-xs sm:text-sm text-[#766962] dark:text-[#A69B94] tabular-nums">
                    {isOffHours
                      ? t.serviceHoursWindow
                      : `${t.nextStop}: ${nextStopLabel} · ${t.updated} ${shuttle.updatedSecondsAgo} ${t.sAgo}`}
                  </p>

                  {/* Action Buttons Row matching Image 04 */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewLocation(shuttle.id);
                      }}
                      className="min-h-[48px] px-4 rounded-2xl bg-[#FF6D24] hover:bg-[#FF7F3F] active:scale-[0.99] text-[#140E0A] font-bold text-sm transition-all cursor-pointer whitespace-nowrap"
                    >
                      {t.viewLocation}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetReminder(shuttle.id);
                      }}
                      className="min-h-[48px] px-4 rounded-2xl bg-[#FAF7F4] dark:bg-[#201915] border border-[#DDD2C9] dark:border-[#3A2F29] hover:border-[#FF6D24]/70 text-[#1A120E] dark:text-white font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {t.setReminder}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* 3 Quick Action Tiles matching Image 04 */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <button
              type="button"
              onClick={() => onViewLocation(selectedShuttle.id)}
              className="rounded-2xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#2C231E] hover:border-[#FF6D24]/70 py-4 px-2 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer min-h-[84px]"
            >
              <MapPin className="w-5 h-5 text-[#FF6D24]" aria-hidden="true" />
              <span className="text-xs sm:text-sm font-bold text-[#1A120E] dark:text-white whitespace-nowrap">
                {t.trackShuttle}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSetReminder(selectedShuttle.id)}
              className="rounded-2xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#2C231E] hover:border-[#FF6D24]/70 py-4 px-2 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer min-h-[84px]"
            >
              <Bell className="w-5 h-5 text-[#FF6D24]" aria-hidden="true" />
              <span className="text-xs sm:text-sm font-bold text-[#1A120E] dark:text-white whitespace-nowrap">
                {t.setReminder}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('schedule')}
              className="rounded-2xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#2C231E] hover:border-[#FF6D24]/70 py-4 px-2 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer min-h-[84px]"
            >
              <CalendarCheck2 className="w-5 h-5 text-[#FF6D24]" aria-hidden="true" />
              <span className="text-xs sm:text-sm font-bold text-[#1A120E] dark:text-white whitespace-nowrap">
                {t.schedule}
              </span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-[#766962] dark:text-[#9E928A]">
            {selectedShuttle.name} {t.seatDisclaimer}
          </p>
        </div>

        {/* Desktop Right Column: Live Campus Corridor Preview & Stop Summary */}
        <aside className="hidden lg:flex lg:col-span-5 flex-col gap-5 sticky top-24">
          <div className="rounded-3xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#2C231E] p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-[#1A120E] dark:text-white">
                  KBU Live Campus Map
                </h2>
                <p className="text-xs text-[#766962] dark:text-[#A69B94]">
                  {lang === 'th' ? selectedStop.nameTh : selectedStop.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onViewLocation(selectedShuttle.id)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6D24] hover:text-[#FF8D52] cursor-pointer min-h-[36px] px-2 whitespace-nowrap"
              >
                <Navigation className="w-3.5 h-3.5" aria-hidden="true" />
                Full map
              </button>
            </div>

            <LiveMapCanvas
              shuttles={shuttles}
              telemetries={telemetries}
              stops={stops}
              routeState={routeState}
              selectedShuttleId={selectedShuttleId}
              selectedStopId={selectedStopId}
              lang={lang}
              isDark={isDark}
              isLiveActive={isLiveActive}
              compact
              onSelectShuttle={onSelectShuttle}
              onSelectStop={onSelectStop}
            />

            {/* Stop List Quick Switcher */}
            <div className="mt-4 pt-4 border-t border-[#EFE7E0] dark:border-[#2C231E]">
              <p className="text-xs font-semibold text-[#766962] dark:text-[#A69B94] mb-2.5">
                3 Romklao Stops · Click to set boarding point
              </p>
              <div className="space-y-1.5">
                {stops.map((stop) => {
                  const active = stop.id === selectedStopId;
                  return (
                    <button
                      key={stop.id}
                      type="button"
                      onClick={() => onSelectStop(stop.id)}
                      className={`w-full min-h-[40px] px-3 rounded-xl flex items-center justify-between text-left text-xs font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#FF6D24]/15 text-[#D85312] dark:text-[#FF8D52] font-bold'
                          : 'text-[#5C4F48] dark:text-[#C4BAB4] hover:bg-[#F5EFEA] dark:hover:bg-[#231B17]'
                      }`}
                    >
                      <span className="truncate">{lang === 'th' ? stop.nameTh : stop.name}</span>
                      <span className="text-[11px] opacity-80 whitespace-nowrap ml-2">
                        {stop.campus}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
