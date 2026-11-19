import { useState } from 'react';
import { ArrowLeft, Trash2, Volume2 } from 'lucide-react';
import type {
  CampusStop,
  LanguageCode,
  NotificationItem,
  ReminderSound,
  ShuttleReminder,
  ShuttleState,
} from '../types/kbu';
import type { TranslationStrings } from '../utils/i18n';
import { playReminderSound } from '../utils/sound';

interface RemindersViewProps {
  t: TranslationStrings;
  lang: LanguageCode;
  shuttles: ShuttleState[];
  stops: CampusStop[];
  initialShuttleId: string;
  initialStopId: string;
  reminders: ShuttleReminder[];
  history: NotificationItem[];
  onSaveReminder: (reminder: Omit<ShuttleReminder, 'id' | 'createdAt'>, editingId?: string) => void;
  onDeleteReminder: (id: string) => void;
  onToggleReminder: (id: string) => void;
  onBack?: () => void;
}

const PRESET_MINUTES = [5, 10, 15];
const SOUNDS: ReminderSound[] = ['Chime', 'Bell', 'Pulse', 'Silent'];

export function RemindersView({
  t,
  lang,
  shuttles,
  stops,
  initialShuttleId,
  initialStopId,
  reminders,
  history,
  onSaveReminder,
  onDeleteReminder,
  onToggleReminder,
  onBack,
}: RemindersViewProps) {
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [shuttleId, setShuttleId] = useState(initialShuttleId || shuttles[1]?.id || 'shuttle-2');
  const [stopId, setStopId] = useState(initialStopId || stops[1]?.id || stops[0].id);
  const [minutesBefore, setMinutesBefore] = useState<number>(10);
  const [isCustom, setIsCustom] = useState(false);
  const [customInput, setCustomInput] = useState('8');
  const [sound, setSound] = useState<ReminderSound>('Chime');
  const [enabled, setEnabled] = useState(true);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedMinutes = isCustom
      ? Math.max(1, Math.min(30, parseInt(customInput, 10) || 5))
      : minutesBefore;

    onSaveReminder(
      {
        shuttleId,
        stopId,
        minutesBefore: parsedMinutes,
        sound,
        enabled,
      },
      editingId
    );

    const shuttleName = shuttles.find((s) => s.id === shuttleId)?.name ?? 'Shuttle';
    setSavedNotice(
      editingId
        ? `Updated reminder for ${shuttleName} (${parsedMinutes} min before).`
        : `Saved reminder for ${shuttleName} (${parsedMinutes} min before).`
    );
    setEditingId(undefined);
    window.setTimeout(() => setSavedNotice(null), 3500);
  };

  const handleEdit = (rem: ShuttleReminder) => {
    setEditingId(rem.id);
    setShuttleId(rem.shuttleId);
    setStopId(rem.stopId);
    if (PRESET_MINUTES.includes(rem.minutesBefore)) {
      setIsCustom(false);
      setMinutesBefore(rem.minutesBefore);
    } else {
      setIsCustom(true);
      setCustomInput(String(rem.minutesBefore));
    }
    setSound(rem.sound);
    setEnabled(rem.enabled);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStopName = (id: string) => {
    const found = stops.find((s) => s.id === id);
    if (!found) return 'Kasem Bundit Romklao Dormitory';
    return lang === 'th' ? found.nameTh : found.name;
  };

  const getShuttleName = (id: string) =>
    shuttles.find((s) => s.id === id)?.name ?? 'Shuttle';

  return (
    <div className="w-full max-w-5xl mx-auto px-5 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-12">
      {/* Page Title matching Image 06 */}
      <div className="flex items-center gap-3 mb-6">
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
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1A120E] dark:text-white leading-tight text-balance">
          {t.notificationsReminders}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Segmented Switcher + Reminder Builder Form matching Image 06 */}
        <div className="lg:col-span-7 space-y-5">
          {/* Segmented Shuttle 1 / Shuttle 2 Toggle */}
          <div
            role="tablist"
            aria-label="Select shuttle for reminder"
            className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#EFE7E0] dark:bg-[#17110D] border border-[#E2D6CC] dark:border-[#2A211C]"
          >
            {shuttles.map((s) => {
              const active = s.id === shuttleId;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setShuttleId(s.id)}
                  className={`min-h-[44px] rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#FF6D24] text-[#140E0A]'
                      : 'text-[#6B5E57] dark:text-[#A69B94] hover:text-[#1A120E] dark:hover:text-white'
                  }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>

          {/* Reminder Configuration Card matching Image 06 */}
          <form
            onSubmit={handleSave}
            className="rounded-3xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#2C231E] p-5 sm:p-6 space-y-5"
          >
            {/* Boarding stop selector row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label
                htmlFor="reminder-boarding-stop"
                className="text-sm font-medium text-[#766962] dark:text-[#A69B94]"
              >
                {t.boardingStop}
              </label>
              <select
                id="reminder-boarding-stop"
                value={stopId}
                onChange={(e) => setStopId(e.target.value)}
                className="min-h-[40px] rounded-xl bg-[#FAF7F4] dark:bg-[#221B17] border border-[#E2D6CC] dark:border-[#352B25] px-3 py-1.5 text-sm font-bold text-[#1A120E] dark:text-white focus:border-[#FF6D24] focus:outline-none cursor-pointer"
              >
                {stops.map((s) => (
                  <option
                    key={s.id}
                    value={s.id}
                    className="bg-white dark:bg-[#1A1411] text-[#1A120E] dark:text-white"
                  >
                    {lang === 'th' ? s.nameTh : s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Remind me before arrival presets */}
            <div>
              <p className="text-sm font-medium text-[#766962] dark:text-[#A69B94] mb-3">
                {t.remindBefore}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_MINUTES.map((min) => {
                  const active = !isCustom && minutesBefore === min;
                  return (
                    <button
                      key={min}
                      type="button"
                      onClick={() => {
                        setIsCustom(false);
                        setMinutesBefore(min);
                      }}
                      className={`min-h-[44px] rounded-full text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                        active
                          ? 'bg-[#FF6D24] text-[#140E0A]'
                          : 'bg-[#F3ECE6] dark:bg-[#241C18] text-[#4A3E38] dark:text-[#D6CDC7] hover:bg-[#EAE0D7] dark:hover:bg-[#2E241E]'
                      }`}
                    >
                      {min} min
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setIsCustom(true)}
                  className={`min-h-[44px] rounded-full text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    isCustom
                      ? 'bg-[#FF6D24] text-[#140E0A]'
                      : 'bg-[#F3ECE6] dark:bg-[#241C18] text-[#4A3E38] dark:text-[#D6CDC7] hover:bg-[#EAE0D7] dark:hover:bg-[#2E241E]'
                  }`}
                >
                  {t.custom}
                </button>
              </div>

              {isCustom && (
                <div className="mt-3 flex items-center gap-3">
                  <label
                    htmlFor="custom-minutes-input"
                    className="text-xs text-[#766962] dark:text-[#A69B94]"
                  >
                    Custom minutes (1–30):
                  </label>
                  <input
                    id="custom-minutes-input"
                    type="number"
                    min={1}
                    max={30}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="w-24 h-10 rounded-xl bg-[#FAF7F4] dark:bg-[#221B17] border border-[#FF6D24] px-3 text-sm font-bold text-[#1A120E] dark:text-white tabular-nums focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Sound selector row with live Web Audio test */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <label
                htmlFor="reminder-sound"
                className="text-sm font-medium text-[#766962] dark:text-[#A69B94]"
              >
                {t.sound}
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="reminder-sound"
                  value={sound}
                  onChange={(e) => {
                    const nextSound = e.target.value as ReminderSound;
                    setSound(nextSound);
                    playReminderSound(nextSound);
                  }}
                  className="min-h-[40px] rounded-xl bg-[#FAF7F4] dark:bg-[#221B17] border border-[#E2D6CC] dark:border-[#352B25] px-3 text-sm font-bold text-[#1A120E] dark:text-white focus:border-[#FF6D24] focus:outline-none cursor-pointer"
                >
                  {SOUNDS.map((snd) => (
                    <option
                      key={snd}
                      value={snd}
                      className="bg-white dark:bg-[#1A1411] text-[#1A120E] dark:text-white"
                    >
                      {snd}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => playReminderSound(sound)}
                  aria-label={`Preview ${sound} sound`}
                  className="w-10 h-10 rounded-xl bg-[#F3ECE6] dark:bg-[#241C18] text-[#FF6D24] flex items-center justify-center hover:bg-[#FF6D24]/15 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Enabled toggle switch row matching Image 06 */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-[#766962] dark:text-[#A69B94]">
                {t.enabled}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                aria-label="Enable reminder"
                onClick={() => setEnabled((prev) => !prev)}
                className={`relative w-14 h-8 rounded-full transition-colors cursor-pointer flex items-center px-1 ${
                  enabled ? 'bg-[#34C77B]' : 'bg-[#D6CBC3] dark:bg-[#3A2F29]'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full bg-[#120D0A] transition-transform duration-200 ${
                    enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Save Reminder Orange CTA */}
            <button
              type="submit"
              className="w-full min-h-[52px] rounded-2xl bg-[#FF6D24] hover:bg-[#FF7F3F] active:scale-[0.99] text-[#140E0A] font-bold text-base transition-all cursor-pointer"
            >
              {editingId ? 'Update Reminder' : t.saveReminder}
            </button>

            {savedNotice && (
              <p role="status" className="text-xs font-semibold text-[#1F9E5B] dark:text-[#34C77B]">
                {savedNotice}
              </p>
            )}

            <p className="text-xs leading-relaxed text-[#766962] dark:text-[#9E928A]">
              {t.reminderDisclaimer}
            </p>
          </form>
        </div>

        {/* Right Column: Active Reminders & History matching Image 06 */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Reminders List */}
          <section aria-label={t.activeReminders}>
            <h2 className="text-lg font-bold text-[#1A120E] dark:text-white mb-3">
              {t.activeReminders}
            </h2>

            {reminders.length === 0 ? (
              <div className="rounded-3xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#2C231E] p-5 text-sm text-[#766962] dark:text-[#A69B94]">
                {t.noActiveReminders}
              </div>
            ) : (
              <div className="space-y-3">
                {reminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="rounded-3xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#2C231E] p-4 sm:p-5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold text-[#1A120E] dark:text-white truncate tabular-nums">
                        {getShuttleName(rem.shuttleId)} · {rem.minutesBefore} min before
                      </p>
                      <p className="mt-1 text-xs sm:text-sm text-[#766962] dark:text-[#A69B94] truncate">
                        {getStopName(rem.stopId)} ·{' '}
                        <button
                          type="button"
                          onClick={() => onToggleReminder(rem.id)}
                          className="underline underline-offset-2 hover:text-[#FF6D24] cursor-pointer"
                        >
                          {rem.enabled ? 'On' : 'Paused'}
                        </button>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(rem)}
                        className="min-h-[42px] px-4 rounded-2xl border border-[#DDD2C9] dark:border-[#3A2F29] bg-[#FAF7F4] dark:bg-[#201915] text-xs sm:text-sm font-bold text-[#1A120E] dark:text-white hover:border-[#FF6D24] transition-colors cursor-pointer"
                      >
                        {t.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteReminder(rem.id)}
                        aria-label={`Remove ${getShuttleName(rem.shuttleId)} reminder`}
                        className="w-10 h-10 rounded-2xl border border-[#DDD2C9] dark:border-[#3A2F29] text-[#8C8078] hover:text-[#F16565] hover:border-[#F16565]/60 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Notification History matching Image 06 */}
          <section aria-label={t.history}>
            <h2 className="text-lg font-bold text-[#1A120E] dark:text-white mb-3">
              {t.history}
            </h2>
            <div className="rounded-3xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#2C231E] p-5 space-y-3">
              {history.map((item) => (
                <p
                  key={item.id}
                  className="text-sm leading-relaxed text-[#2C211B] dark:text-[#EAE3DF]"
                >
                  {item.message}{' '}
                  <span className="text-[#8C8078] dark:text-[#968A82] tabular-nums">
                    {item.minutesAgo === 0 ? 'Just now' : `${item.minutesAgo} min ago`}
                  </span>
                </p>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
