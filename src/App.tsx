import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { BellRing, X } from 'lucide-react';
import type {
  AppPhase,
  AppTab,
  AppearanceMode,
  CampusStop,
  LanguageCode,
  LiveRouteState,
  NotificationItem,
  ShuttleReminder,
  ShuttleState,
  ShuttleTelemetry,
  StudentProfile,
} from './types/kbu';
import { TRANSLATIONS } from './utils/i18n';
import {
  DEFAULT_LOOP_KM,
  DEFAULT_LOOP_MINUTES,
  INITIAL_SHUTTLES,
  KBU_STOPS,
  advanceShuttles,
  computeShuttleTelemetry,
  evaluateBangkokServiceHours,
  evaluateReminderTriggers,
} from './utils/shuttleEngine';
import { playReminderSound } from './utils/sound';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { AuthScreen } from './components/AuthScreen';
import { DesktopTopBar, MobileBottomNav } from './components/NavigationChrome';
import { HomeDashboard } from './components/HomeDashboard';
import { LiveLocationView } from './components/LiveLocationView';
import { RemindersView } from './components/RemindersView';
import { ScheduleView } from './components/ScheduleView';
import { AboutMeView } from './components/AboutMeView';
import { TermsModal } from './components/TermsModal';
import { ChangePhoneModal } from './components/ChangePhoneModal';
import { KbuRouteResolver } from './components/KbuRouteResolver';
import { OfflineIndicator } from './components/OfflineIndicator';

const MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ?? '';

const STORAGE_KEYS = {
  AUTH: 'kbu_ride_authenticated',
  PROFILE: 'kbu_ride_profile',
  REMINDERS: 'kbu_ride_reminders',
  APPEARANCE: 'kbu_ride_appearance',
  LANGUAGE: 'kbu_ride_language',
  SELECTED_STOP: 'kbu_ride_stop_v3',
};

const DEFAULT_PROFILE: StudentProfile = {
  name: 'Mint Narong',
  studentId: '',
  faculty: '',
  countryCode: '+66',
  phoneNumber: '8123456789',
  verified: true,
};

const DEFAULT_REMINDERS: ShuttleReminder[] = [
  {
    id: 'rem-default-1',
    shuttleId: 'shuttle-2',
    stopId: KBU_STOPS[1].id,
    minutesBefore: 5,
    sound: 'Chime',
    enabled: true,
    createdAt: Date.now() - 1000 * 60 * 30,
  },
];

const DEFAULT_HISTORY: NotificationItem[] = [
  {
    id: 'hist-1',
    message: 'Shuttle 1 is approaching ข้าวซอยเงินล้าน.',
    minutesAgo: 2,
    type: 'arrival',
    shuttleId: 'shuttle-1',
  },
  {
    id: 'hist-2',
    message: 'Shuttle 2 departed Kasem Bundit Romklao Dormitory on schedule.',
    minutesAgo: 15,
    type: 'info',
    shuttleId: 'shuttle-2',
  },
];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const isAutostart = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('autostart') === '1';
  }, []);

  const mockBangkokHour = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const raw = new URLSearchParams(window.location.search).get('bangkokHour');
    if (raw === null) return null;
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed >= 0 && parsed <= 23 ? parsed : null;
  }, []);

  const readCurrentServiceStatus = useCallback(() => {
    if (mockBangkokHour !== null) {
      const utcHour = (mockBangkokHour - 7 + 24) % 24;
      const syntheticDate = new Date(Date.UTC(2026, 4, 15, utcHour, 15, 0));
      return evaluateBangkokServiceHours(syntheticDate);
    }
    return evaluateBangkokServiceHours(new Date());
  }, [mockBangkokHour]);

  const [phase, setPhase] = useState<AppPhase>(() => {
    if (isAutostart) return 'app';
    const hasAuth = readStorage<boolean>(STORAGE_KEYS.AUTH, false);
    return hasAuth ? 'app' : 'splash';
  });

  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const stored = readStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    return {
      ...stored,
      studentId: stored.studentId === '660710428' ? '' : stored.studentId,
      faculty: stored.faculty === 'Faculty of Engineering' ? '' : stored.faculty,
    };
  });
  const [appearance, setAppearance] = useState<AppearanceMode>(() =>
    readStorage(STORAGE_KEYS.APPEARANCE, 'dark')
  );
  const [resolvedDark, setResolvedDark] = useState<boolean>(true);
  const [language, setLanguage] = useState<LanguageCode>(() =>
    readStorage(STORAGE_KEYS.LANGUAGE, 'en')
  );
  const [serviceStatus, setServiceStatus] = useState(() => readCurrentServiceStatus());
  const [previewLive, setPreviewLive] = useState<boolean>(false);
  const [selectedShuttleId, setSelectedShuttleId] = useState<string>('shuttle-1');
  const [reminderShuttleId, setReminderShuttleId] = useState<string>('shuttle-2');
  const [stops, setStops] = useState<CampusStop[]>(KBU_STOPS);
  const [routeState, setRouteState] = useState<LiveRouteState>({
    path: [],
    distanceKm: DEFAULT_LOOP_KM,
    durationMinutes: DEFAULT_LOOP_MINUTES,
    loading: Boolean(MAPS_API_KEY),
    error: null,
  });
  const [selectedStopId, setSelectedStopId] = useState<string>(() => {
    const saved = readStorage<string>(STORAGE_KEYS.SELECTED_STOP, KBU_STOPS[1].id);
    return KBU_STOPS.some((s) => s.id === saved) ? saved : KBU_STOPS[1].id;
  });
  const [shuttles, setShuttles] = useState<ShuttleState[]>(INITIAL_SHUTTLES);
  const [reminders, setReminders] = useState<ShuttleReminder[]>(() => {
    const stored = readStorage(STORAGE_KEYS.REMINDERS, DEFAULT_REMINDERS);
    const validIds = new Set(KBU_STOPS.map((s) => s.id));
    return stored.map((rem) =>
      validIds.has(rem.stopId) ? rem : { ...rem, stopId: KBU_STOPS[1].id }
    );
  });
  const [history, setHistory] = useState<NotificationItem[]>(DEFAULT_HISTORY);
  const [liveAlert, setLiveAlert] = useState<string | null>(null);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState<boolean>(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [changePhoneOpen, setChangePhoneOpen] = useState(false);

  const triggeredReminderIdsRef = useRef<Set<string>>(new Set());

  const t = TRANSLATIONS[language];
  const isLiveActive = serviceStatus.isOperating || previewLive;

  // Refresh Bangkok operating-hours clock (07:00-18:00) every 30 seconds
  useEffect(() => {
    setServiceStatus(readCurrentServiceStatus());
    const timer = window.setInterval(() => {
      setServiceStatus(readCurrentServiceStatus());
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [readCurrentServiceStatus]);

  // Listen to global Google Maps quota / auth failure custom events
  useEffect(() => {
    const handleQuota = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Apply Dark / Light / System class to <html>
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = appearance === 'dark' || (appearance === 'system' && prefersDark);
      root.classList.toggle('dark', shouldBeDark);
      setResolvedDark(shouldBeDark);
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta) {
        themeMeta.setAttribute('content', shouldBeDark ? '#0E0A08' : '#FAF7F4');
      }
    };
    applyTheme();
    window.localStorage.setItem(STORAGE_KEYS.APPEARANCE, JSON.stringify(appearance));

    if (appearance === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', applyTheme);
      return () => mq.removeEventListener('change', applyTheme);
    }
  }, [appearance]);

  // Persist user preferences & reminders (never caching Google Maps lat/lng)
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.LANGUAGE, JSON.stringify(language));
  }, [language]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.SELECTED_STOP, JSON.stringify(selectedStopId));
  }, [selectedStopId]);

  // Real-time shuttle GPS telemetry simulation (updates every 1 second when operating or in Live Preview)
  useEffect(() => {
    if (phase !== 'app' || !isLiveActive) return;
    const interval = window.setInterval(() => {
      setShuttles((prev) => advanceShuttles(prev, stops, 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [phase, stops, isLiveActive]);

  // Evaluate live arrival reminders against moving shuttle telemetry
  useEffect(() => {
    if (phase !== 'app' || !isLiveActive) return;
    const newlyTriggered = evaluateReminderTriggers(
      shuttles,
      reminders,
      stops,
      triggeredReminderIdsRef.current,
      routeState.path,
      routeState.distanceKm,
      routeState.durationMinutes,
      isLiveActive
    );

    if (newlyTriggered.length > 0) {
      newlyTriggered.forEach(({ reminder, telemetry, shuttle }) => {
        triggeredReminderIdsRef.current.add(reminder.id);
        const stopName = telemetry.targetStop.shortLabel;
        const msg = `${shuttle.name} is ${telemetry.etaMinutes} min away from ${stopName}.`;
        setLiveAlert(msg);
        playReminderSound(reminder.sound);
        setHistory((prev) => [
          {
            id: `hist-${Date.now()}-${reminder.id}`,
            message: msg,
            minutesAgo: 0,
            type: 'arrival',
            shuttleId: shuttle.id,
          },
          ...prev.slice(0, 9),
        ]);
      });
    }
  }, [shuttles, reminders, stops, routeState, phase, isLiveActive]);

  // Compute live telemetry map for all shuttles along the real Google Maps road loop
  const telemetries = useMemo(() => {
    const map: Record<string, ShuttleTelemetry> = {};
    for (const shuttle of shuttles) {
      map[shuttle.id] = computeShuttleTelemetry(
        shuttle,
        stops,
        selectedStopId,
        routeState.path,
        routeState.distanceKm,
        routeState.durationMinutes,
        isLiveActive
      );
    }
    return map;
  }, [shuttles, stops, selectedStopId, routeState, isLiveActive]);

  const handleSplashDone = useCallback(() => {
    setPhase((current) => (current === 'splash' ? 'onboarding' : current));
  }, []);

  const handleAuthenticated = (payload: { countryCode: string; phoneNumber: string }) => {
    setProfile((prev) => ({
      ...prev,
      countryCode: payload.countryCode,
      phoneNumber: payload.phoneNumber,
      verified: true,
    }));
    window.localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(true));
    setPhase('app');
    setActiveTab('home');
  };

  const handleLogOut = () => {
    window.localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(false));
    setPhase('auth');
  };

  const handleViewLocation = (shuttleId: string) => {
    setSelectedShuttleId(shuttleId);
    setActiveTab('location');
  };

  const handleOpenReminder = (shuttleId: string) => {
    setSelectedShuttleId(shuttleId);
    setReminderShuttleId(shuttleId);
    setActiveTab('reminders');
  };

  const handleSaveReminder = (
    data: Omit<ShuttleReminder, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      triggeredReminderIdsRef.current.delete(editingId);
      setReminders((prev) =>
        prev.map((item) => (item.id === editingId ? { ...item, ...data } : item))
      );
    } else {
      const created: ShuttleReminder = {
        ...data,
        id: `rem-${Date.now()}`,
        createdAt: Date.now(),
      };
      setReminders((prev) => [created, ...prev]);
    }
  };

  const handleDeleteReminder = (id: string) => {
    triggeredReminderIdsRef.current.delete(id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleToggleReminder = (id: string) => {
    triggeredReminderIdsRef.current.delete(id);
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const activeReminderCount = reminders.filter((r) => r.enabled).length;

  return (
    <div
      data-phase={phase}
      data-tab={activeTab}
      className="min-h-screen w-full bg-[#FAF7F4] dark:bg-[#0E0A08] text-[#1A120E] dark:text-[#FAF7F5] transition-colors duration-200"
    >
      {/* Persistent Tier 1 & Tier 2 Google Maps Platform Quota Notice Banner */}
      {gmpQuotaExceeded && (
        <div
          role="alert"
          className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm"
        >
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {phase === 'splash' && <SplashScreen t={t} onComplete={handleSplashDone} />}

      {phase === 'onboarding' && (
        <OnboardingScreen
          t={t}
          onFinish={() => setPhase('auth')}
          onOpenTerms={() => setTermsOpen(true)}
        />
      )}

      {phase === 'auth' && (
        <AuthScreen
          t={t}
          initialCountryCode={profile.countryCode}
          onAuthenticated={handleAuthenticated}
        />
      )}

      {phase === 'app' && (
        <APIProvider
          apiKey={MAPS_API_KEY}
          language={language === 'th' ? 'th' : 'en'}
          region="TH"
          libraries={['places', 'routes', 'marker']}
        >
          <KbuRouteResolver
            onStopsResolved={setStops}
            onRouteResolved={setRouteState}
          />

          <div className="min-h-screen flex flex-col">
            {/* Desktop 3-Zone Top Navigation Bar */}
            <DesktopTopBar
              t={t}
              activeTab={activeTab}
              profile={profile}
              onSelectTab={setActiveTab}
            />

            {/* Live Triggered Reminder Banner */}
            {liveAlert && (
              <div
                role="status"
                className="fixed top-4 lg:top-20 left-4 right-4 z-50 max-w-md mx-auto rounded-2xl bg-[#1A1411] text-white border border-[#FF6D24] px-4 py-3.5 shadow-2xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-xl bg-[#FF6D24] text-[#140E0A] flex items-center justify-center shrink-0">
                    <BellRing className="w-4 h-4" />
                  </span>
                  <p className="text-xs sm:text-sm font-semibold leading-snug">{liveAlert}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLiveAlert(null)}
                  aria-label="Dismiss arrival alert"
                  className="w-8 h-8 rounded-lg text-[#A69B94] hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Main Active Screen */}
            <main className="flex-1 w-full">
              {activeTab === 'home' && (
                <HomeDashboard
                  t={t}
                  lang={language}
                  profile={profile}
                  shuttles={shuttles}
                  telemetries={telemetries}
                  stops={stops}
                  routeState={routeState}
                  serviceStatus={serviceStatus}
                  previewLive={previewLive}
                  isLiveActive={isLiveActive}
                  isDark={resolvedDark}
                  selectedShuttleId={selectedShuttleId}
                  selectedStopId={selectedStopId}
                  unreadNotifications={Math.max(activeReminderCount, 2)}
                  onTogglePreview={() => setPreviewLive((p) => !p)}
                  onSelectShuttle={setSelectedShuttleId}
                  onSelectStop={setSelectedStopId}
                  onViewLocation={handleViewLocation}
                  onSetReminder={handleOpenReminder}
                  onNavigate={setActiveTab}
                  onLogOut={handleLogOut}
                />
              )}

              {activeTab === 'location' && (
                <LiveLocationView
                  t={t}
                  lang={language}
                  shuttles={shuttles}
                  telemetries={telemetries}
                  stops={stops}
                  routeState={routeState}
                  serviceStatus={serviceStatus}
                  previewLive={previewLive}
                  isLiveActive={isLiveActive}
                  isDark={resolvedDark}
                  selectedShuttleId={selectedShuttleId}
                  selectedStopId={selectedStopId}
                  onTogglePreview={() => setPreviewLive((p) => !p)}
                  onSelectShuttle={setSelectedShuttleId}
                  onSelectStop={setSelectedStopId}
                  onSetReminder={handleOpenReminder}
                />
              )}

              {activeTab === 'reminders' && (
                <RemindersView
                  t={t}
                  lang={language}
                  shuttles={shuttles}
                  stops={stops}
                  initialShuttleId={reminderShuttleId}
                  initialStopId={selectedStopId}
                  reminders={reminders}
                  history={history}
                  onSaveReminder={handleSaveReminder}
                  onDeleteReminder={handleDeleteReminder}
                  onToggleReminder={handleToggleReminder}
                  onBack={() => setActiveTab('home')}
                />
              )}

              {activeTab === 'schedule' && (
                <ScheduleView
                  t={t}
                  serviceStatus={serviceStatus}
                  previewLive={previewLive}
                  onTogglePreview={() => setPreviewLive((p) => !p)}
                  onTrackShuttle={handleViewLocation}
                  onSetReminder={handleOpenReminder}
                  onBack={() => setActiveTab('home')}
                />
              )}

              {activeTab === 'about' && (
                <AboutMeView
                  t={t}
                  profile={profile}
                  appearance={appearance}
                  language={language}
                  onChangeAppearance={setAppearance}
                  onChangeLanguage={setLanguage}
                  onUpdateName={(name) => setProfile((prev) => ({ ...prev, name }))}
                  onUpdateStudentDetails={(details) =>
                    setProfile((prev) => ({ ...prev, ...details }))
                  }
                  onOpenChangePhone={() => setChangePhoneOpen(true)}
                  onOpenTerms={() => setTermsOpen(true)}
                  onLogOut={handleLogOut}
                />
              )}
            </main>

            {/* Mobile Floating Bottom Navigation Bar matching Images 04, 07, 08 */}
            <MobileBottomNav t={t} activeTab={activeTab} onSelectTab={setActiveTab} />
          </div>
        </APIProvider>
      )}

      {/* Modals */}
      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
      <ChangePhoneModal
        open={changePhoneOpen}
        currentCountryCode={profile.countryCode}
        onClose={() => setChangePhoneOpen(false)}
        onSuccess={({ countryCode, phoneNumber }) =>
          setProfile((prev) => ({ ...prev, countryCode, phoneNumber, verified: true }))
        }
      />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator t={t} />
    </div>
  );
}
