import { useState } from 'react';
import { Check, Pencil } from 'lucide-react';
import type { AppearanceMode, LanguageCode, StudentProfile } from '../types/kbu';
import { getInitials, maskPhoneNumber } from '../utils/authHelpers';
import type { TranslationStrings } from '../utils/i18n';

interface AboutMeViewProps {
  t: TranslationStrings;
  profile: StudentProfile;
  appearance: AppearanceMode;
  language: LanguageCode;
  onChangeAppearance: (mode: AppearanceMode) => void;
  onChangeLanguage: (lang: LanguageCode) => void;
  onUpdateName: (name: string) => void;
  onUpdateStudentDetails: (details: { studentId?: string; faculty?: string }) => void;
  onOpenChangePhone: () => void;
  onOpenTerms: () => void;
  onLogOut: () => void;
}

export function AboutMeView({
  t,
  profile,
  appearance,
  language,
  onChangeAppearance,
  onChangeLanguage,
  onUpdateName,
  onUpdateStudentDetails,
  onOpenChangePhone,
  onOpenTerms,
  onLogOut,
}: AboutMeViewProps) {
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(profile.name);

  const [editingStudentId, setEditingStudentId] = useState(false);
  const [draftStudentId, setDraftStudentId] = useState(profile.studentId);

  const [editingFaculty, setEditingFaculty] = useState(false);
  const [draftFaculty, setDraftFaculty] = useState(profile.faculty);

  const initials = getInitials(profile.name);
  const maskedPhone = maskPhoneNumber(profile.countryCode, profile.phoneNumber);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draftName.trim();
    if (cleaned.length >= 2) {
      onUpdateName(cleaned);
    } else {
      setDraftName(profile.name);
    }
    setEditingName(false);
  };

  const handleSaveStudentId = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStudentDetails({ studentId: draftStudentId.trim() });
    setEditingStudentId(false);
  };

  const handleSaveFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStudentDetails({ faculty: draftFaculty.trim() });
    setEditingFaculty(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-12">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1A120E] dark:text-white mb-6">
        {t.aboutMe}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Profile Card matching Image 08 */}
        <section
          aria-label="Student profile"
          className="lg:col-span-5 rounded-3xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#2C231E] p-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#FF6D24] text-[#140E0A] font-extrabold text-xl flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              {editingName ? (
                <form onSubmit={handleSaveName} className="flex items-center gap-2">
                  <label htmlFor="edit-student-name" className="sr-only">
                    Student name
                  </label>
                  <input
                    id="edit-student-name"
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    autoFocus
                    className="w-full h-10 rounded-xl bg-[#FAF7F4] dark:bg-[#221B17] border border-[#FF6D24] px-3 text-sm font-bold text-[#1A120E] dark:text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Save name"
                    className="w-10 h-10 rounded-xl bg-[#FF6D24] text-[#140E0A] flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-[#1A120E] dark:text-white truncate">
                    {profile.name}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftName(profile.name);
                      setEditingName(true);
                    }}
                    aria-label="Edit display name"
                    className="w-8 h-8 rounded-lg text-[#8C8078] hover:text-[#FF6D24] flex items-center justify-center cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <p className="text-sm text-[#766962] dark:text-[#A69B94] tabular-nums">
                {maskedPhone}
              </p>

              {profile.verified && (
                <span className="mt-2 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-[#34C77B] text-[#0A1F12]">
                  {t.verified}
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#EFE7E0] dark:border-[#2C231E] space-y-2.5 text-xs text-[#766962] dark:text-[#A69B94]">
            <div className="flex items-center justify-between gap-3 min-h-[32px]">
              <span>University</span>
              <span className="font-semibold text-[#1A120E] dark:text-[#EAE3DF] text-right">
                Kasem Bundit University
              </span>
            </div>

            {/* Editable Student ID Row */}
            <div className="flex items-center justify-between gap-3 min-h-[36px]">
              <span className="shrink-0">Student ID</span>
              {editingStudentId ? (
                <form onSubmit={handleSaveStudentId} className="flex items-center gap-1.5 flex-1 justify-end">
                  <label htmlFor="edit-student-id" className="sr-only">
                    Student ID
                  </label>
                  <input
                    id="edit-student-id"
                    type="text"
                    inputMode="numeric"
                    value={draftStudentId}
                    onChange={(e) => setDraftStudentId(e.target.value)}
                    placeholder="Enter student ID"
                    autoFocus
                    className="w-full max-w-[170px] h-9 rounded-xl bg-[#FAF7F4] dark:bg-[#221B17] border border-[#FF6D24] px-2.5 text-xs font-mono font-semibold text-[#1A120E] dark:text-white tabular-nums focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Save Student ID"
                    className="w-9 h-9 rounded-xl bg-[#FF6D24] text-[#140E0A] flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDraftStudentId(profile.studentId);
                    setEditingStudentId(true);
                  }}
                  aria-label="Edit Student ID"
                  className="inline-flex items-center gap-1.5 min-h-[36px] px-2 -mr-2 rounded-lg hover:bg-[#F5EFEA] dark:hover:bg-[#241C18] transition-colors cursor-pointer text-right"
                >
                  {profile.studentId ? (
                    <span className="font-mono font-semibold text-[#1A120E] dark:text-[#EAE3DF] tabular-nums">
                      {profile.studentId}
                    </span>
                  ) : (
                    <span className="text-[#8C8078] dark:text-[#968A82]">Add Student ID</span>
                  )}
                  <Pencil className="w-3 h-3 text-[#8C8078] shrink-0" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Editable Faculty / Major Row */}
            <div className="flex items-center justify-between gap-3 min-h-[36px]">
              <span className="shrink-0">Faculty / Major</span>
              {editingFaculty ? (
                <form onSubmit={handleSaveFaculty} className="flex items-center gap-1.5 flex-1 justify-end">
                  <label htmlFor="edit-student-faculty" className="sr-only">
                    Faculty or Major
                  </label>
                  <input
                    id="edit-student-faculty"
                    type="text"
                    value={draftFaculty}
                    onChange={(e) => setDraftFaculty(e.target.value)}
                    placeholder="Enter faculty or major"
                    autoFocus
                    className="w-full max-w-[190px] h-9 rounded-xl bg-[#FAF7F4] dark:bg-[#221B17] border border-[#FF6D24] px-2.5 text-xs font-semibold text-[#1A120E] dark:text-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    aria-label="Save Faculty or Major"
                    className="w-9 h-9 rounded-xl bg-[#FF6D24] text-[#140E0A] flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDraftFaculty(profile.faculty);
                    setEditingFaculty(true);
                  }}
                  aria-label="Edit Faculty or Major"
                  className="inline-flex items-center gap-1.5 min-h-[36px] px-2 -mr-2 rounded-lg hover:bg-[#F5EFEA] dark:hover:bg-[#241C18] transition-colors cursor-pointer text-right max-w-[220px]"
                >
                  {profile.faculty ? (
                    <span className="font-semibold text-[#1A120E] dark:text-[#EAE3DF] truncate">
                      {profile.faculty}
                    </span>
                  ) : (
                    <span className="text-[#8C8078] dark:text-[#968A82]">Add Faculty / Major</span>
                  )}
                  <Pencil className="w-3 h-3 text-[#8C8078] shrink-0" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Settings Controls matching Image 08 */}
        <section aria-label="Preferences and account settings" className="lg:col-span-7 space-y-5">
          {/* Appearance Segmented Control: Dark / Light / System */}
          <div>
            <h2 className="text-sm font-bold text-[#1A120E] dark:text-white mb-2.5">
              {t.appearance}
            </h2>
            <div
              role="radiogroup"
              aria-label={t.appearance}
              className="grid grid-cols-3 p-1.5 rounded-2xl bg-[#EFE7E0] dark:bg-[#17110D] border border-[#E2D6CC] dark:border-[#2A211C]"
            >
              {(
                [
                  { value: 'dark', label: t.dark },
                  { value: 'light', label: t.light },
                  { value: 'system', label: t.system },
                ] as const
              ).map((opt) => {
                const active = appearance === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onChangeAppearance(opt.value)}
                    className={`min-h-[44px] rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#FF6D24] text-[#140E0A]'
                        : 'text-[#6B5E57] dark:text-[#A69B94] hover:text-[#1A120E] dark:hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language Segmented Control: English / Thai */}
          <div>
            <h2 className="text-sm font-bold text-[#1A120E] dark:text-white mb-2.5">
              {t.language}
            </h2>
            <div
              role="radiogroup"
              aria-label={t.language}
              className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#EFE7E0] dark:bg-[#17110D] border border-[#E2D6CC] dark:border-[#2A211C]"
            >
              {(
                [
                  { value: 'en', label: t.english },
                  { value: 'th', label: t.thai },
                ] as const
              ).map((opt) => {
                const active = language === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onChangeLanguage(opt.value)}
                    className={`min-h-[44px] rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#FF6D24] text-[#140E0A]'
                        : 'text-[#6B5E57] dark:text-[#A69B94] hover:text-[#1A120E] dark:hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Rows matching Image 08 */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={onOpenChangePhone}
              className="w-full min-h-[58px] px-5 rounded-2xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#2C231E] hover:border-[#FF6D24]/70 flex items-center justify-between gap-3 transition-colors cursor-pointer"
            >
              <span className="text-sm sm:text-base font-bold text-[#1A120E] dark:text-white">
                {t.changePhone}
              </span>
              <span className="text-xs sm:text-sm font-medium text-[#766962] dark:text-[#A69B94] whitespace-nowrap">
                {t.verifyByOtp}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenTerms}
              className="w-full min-h-[58px] px-5 rounded-2xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#2C231E] hover:border-[#FF6D24]/70 flex items-center justify-between gap-3 transition-colors cursor-pointer"
            >
              <span className="text-sm sm:text-base font-bold text-[#1A120E] dark:text-white">
                {t.termsAndConditions}
              </span>
              <span className="text-xs sm:text-sm font-medium text-[#766962] dark:text-[#A69B94] whitespace-nowrap">
                {t.read}
              </span>
            </button>

            {/* Red-outlined Log Out CTA matching Image 08 */}
            <button
              type="button"
              onClick={onLogOut}
              className="w-full min-h-[56px] px-5 rounded-2xl bg-transparent border border-[#F16565] hover:bg-[#F16565]/10 text-[#F16565] font-bold text-base transition-colors cursor-pointer"
            >
              {t.logOut}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
