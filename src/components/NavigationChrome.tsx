import { Home, MapPin, User } from 'lucide-react';
import type { AppTab, StudentProfile } from '../types/kbu';
import { getInitials } from '../utils/authHelpers';
import type { TranslationStrings } from '../utils/i18n';

interface NavigationChromeProps {
  t: TranslationStrings;
  activeTab: AppTab;
  profile: StudentProfile;
  onSelectTab: (tab: AppTab) => void;
}

export function DesktopTopBar({
  t,
  activeTab,
  profile,
  onSelectTab,
}: NavigationChromeProps) {
  const navLinks: Array<{ id: AppTab; label: string }> = [
    { id: 'home', label: t.navHome },
    { id: 'location', label: t.navLocation },
    { id: 'reminders', label: t.navReminders },
    { id: 'schedule', label: t.navSchedule },
  ];

  return (
    <header className="hidden lg:block sticky top-0 z-30 w-full bg-[#FAF7F4]/90 dark:bg-[#0E0A08]/90 backdrop-blur-md border-b border-[#E5DBD3] dark:border-[#241C18]">
      {/* Strict 3-zone Top Bar Contract separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-8 h-[68px] flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          aria-label="KBU Ride Home"
          className="text-xl font-extrabold tracking-tight text-[#1A120E] dark:text-white whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2.5"
        >
          <span
            className="w-7 h-5 rounded-md bg-[#FF6D24] inline-flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="w-3.5 h-1.5 rounded-xs bg-[#140E0A]" />
          </span>
          KBU Ride
        </button>

        {/* Zone 2: 4 clean single-line text nav links */}
        <nav aria-label="Primary navigation" className="flex items-center gap-7">
          {navLinks.map((link) => {
            const active = activeTab === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => onSelectTab(link.id)}
                aria-current={active ? 'page' : undefined}
                className={`text-sm font-semibold transition-colors whitespace-nowrap shrink-0 py-2 border-b-2 cursor-pointer ${
                  active
                    ? 'text-[#FF6D24] border-[#FF6D24]'
                    : 'text-[#6B5E57] dark:text-[#A69B94] border-transparent hover:text-[#1A120E] dark:hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action (About Me / Account) */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('about')}
            aria-current={activeTab === 'about' ? 'page' : undefined}
            className={`min-h-[42px] px-4 rounded-xl text-sm font-bold flex items-center gap-2.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'about'
                ? 'bg-[#FF6D24] text-[#140E0A]'
                : 'bg-[#EFE7E0] dark:bg-[#1D1612] border border-[#E2D6CC] dark:border-[#322721] text-[#1A120E] dark:text-white hover:border-[#FF6D24]'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full text-[11px] font-extrabold flex items-center justify-center ${
                activeTab === 'about'
                  ? 'bg-[#140E0A] text-[#FF6D24]'
                  : 'bg-[#FF6D24] text-[#140E0A]'
              }`}
            >
              {getInitials(profile.name)}
            </span>
            {t.navAboutMe}
          </button>
        </div>
      </div>
    </header>
  );
}

export function MobileBottomNav({
  t,
  activeTab,
  onSelectTab,
}: Omit<NavigationChromeProps, 'profile'>) {
  const items: Array<{ id: AppTab; label: string; icon: 'home' | 'location' | 'about' }> = [
    { id: 'home', label: t.navHome, icon: 'home' },
    { id: 'location', label: t.navLocation, icon: 'location' },
    { id: 'about', label: t.navAboutMe, icon: 'about' },
  ];

  // Map sub-views (reminders, schedule) to highlight Home cleanly
  const highlightedId: AppTab =
    activeTab === 'reminders' || activeTab === 'schedule' ? 'home' : activeTab;

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="lg:hidden fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto"
    >
      <div className="h-[64px] px-2.5 rounded-[28px] bg-white/95 dark:bg-[#16100D]/95 backdrop-blur-md border border-[#E2D6CC] dark:border-[#2E241E] shadow-xl flex items-center justify-between gap-2">
        {items.map((item) => {
          const active = highlightedId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={`min-h-[46px] flex items-center justify-center gap-2 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-[#FF6D24] text-[#140E0A] px-5 font-extrabold text-sm flex-1'
                  : 'text-[#766962] dark:text-[#A69B94] hover:text-[#1A120E] dark:hover:text-white px-5'
              }`}
            >
              {item.icon === 'home' && <Home className="w-5 h-5 shrink-0" />}
              {item.icon === 'location' && <MapPin className="w-5 h-5 shrink-0" />}
              {item.icon === 'about' && <User className="w-5 h-5 shrink-0" />}
              {active && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
