import { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { BusIllustration } from './BusIllustration';
import {
  DEMO_OTP_CODE,
  MAX_OTP_ATTEMPTS,
  formatPhoneInput,
  validatePhoneNumber,
  verifyOtpAttempt,
} from '../utils/authHelpers';
import type { TranslationStrings } from '../utils/i18n';

interface AuthScreenProps {
  t: TranslationStrings;
  initialName?: string;
  initialCountryCode?: string;
  initialPhone?: string;
  onAuthenticated: (payload: { name: string; countryCode: string; phoneNumber: string }) => void;
}

const COUNTRY_CODES = [
  { code: '+66', label: '+66 (TH)' },
  { code: '+95', label: '+95 (MM)' },
  { code: '+856', label: '+856 (LA)' },
  { code: '+855', label: '+855 (KH)' },
];

export function AuthScreen({
  t,
  initialName = '',
  initialCountryCode = '+66',
  initialPhone = '',
  onAuthenticated,
}: AuthScreenProps) {
  const [nameInput, setNameInput] = useState(initialName);
  const [nameError, setNameError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(true);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_OTP_ATTEMPTS);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(42);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  const digitRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!otpSent || resendSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setResendSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [otpSent, resendSeconds]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedName = nameInput.trim();
    if (cleanedName.length < 2) {
      setNameError(t.nameRequiredError);
      return;
    }
    setNameError(null);

    const result = validatePhoneNumber(phoneInput);
    if (!result.valid) {
      setPhoneError(result.error ?? 'Please enter a valid phone number.');
      return;
    }
    setPhoneError(null);
    setOtpSent(true);
    setOtpError(null);
    setAttemptsLeft(MAX_OTP_ATTEMPTS);
    setResendSeconds(42);
    setResendFeedback('Verification SMS sent.');

    // If user already entered 6 digits, validate immediately
    const code = otpDigits.join('');
    if (code.length === 6) {
      handleVerifyCode(code);
    } else {
      window.setTimeout(() => digitRefs.current[0]?.focus(), 50);
    }
  };

  const handleVerifyCode = (code: string) => {
    const cleanedName = nameInput.trim();
    if (cleanedName.length < 2) {
      setNameError(t.nameRequiredError);
      return;
    }
    setNameError(null);

    const phoneCheck = validatePhoneNumber(phoneInput);
    if (!phoneCheck.valid) {
      setPhoneError(phoneCheck.error ?? 'Please enter a valid phone number.');
      return;
    }

    const res = verifyOtpAttempt(code, DEMO_OTP_CODE, attemptsLeft);
    if (res.success) {
      setOtpError(null);
      onAuthenticated({
        name: cleanedName,
        countryCode,
        phoneNumber: phoneCheck.cleaned,
      });
    } else {
      setAttemptsLeft(res.attemptsRemaining);
      setOtpError(res.error ?? 'Incorrect verification code.');
    }
  };

  const handleDigitChange = (index: number, rawVal: string) => {
    const cleaned = rawVal.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      setOtpError(null);
      return;
    }

    // Handle paste of multiple digits
    if (cleaned.length > 1) {
      const next = [...otpDigits];
      for (let i = 0; i < cleaned.length && index + i < 6; i++) {
        next[index + i] = cleaned[i];
      }
      setOtpDigits(next);
      setOtpError(null);
      const focusIdx = Math.min(5, index + cleaned.length);
      digitRefs.current[focusIdx]?.focus();
      const joined = next.join('');
      if (joined.length === 6) {
        handleVerifyCode(joined);
      }
      return;
    }

    const next = [...otpDigits];
    next[index] = cleaned;
    setOtpDigits(next);
    setOtpError(null);

    if (index < 5) {
      digitRefs.current[index + 1]?.focus();
    }

    const joined = next.join('');
    if (joined.length === 6) {
      handleVerifyCode(joined);
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setResendSeconds(42);
    setAttemptsLeft(MAX_OTP_ATTEMPTS);
    setOtpError(null);
    setOtpDigits(['', '', '', '', '', '']);
    setResendFeedback(`New SMS code sent (${DEMO_OTP_CODE}).`);
    digitRefs.current[0]?.focus();
  };

  const handleFillDemoCode = () => {
    const digits = DEMO_OTP_CODE.split('');
    setOtpDigits(digits);
    setOtpError(null);
    handleVerifyCode(DEMO_OTP_CODE);
  };

  const formattedCountdown = `0:${String(resendSeconds).padStart(2, '0')}`;

  return (
    <div className="min-h-screen w-full bg-[#0E0A08] text-[#FAF7F5] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Desktop Brand Context Panel */}
        <aside className="hidden lg:flex lg:col-span-5 flex-col rounded-3xl bg-[#16100D] border border-[#2B221D] p-8">
          <div className="flex items-center gap-2.5 text-white font-extrabold text-xl tracking-tight">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6D24]" aria-hidden="true" />
            KBU Ride
          </div>
          <div className="my-8 flex justify-center">
            <BusIllustration className="w-60 h-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white leading-snug text-balance">
            Kasem Bundit University Student Shuttle Portal
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#A69B94]">
            Verify with your student mobile number to track Shuttle 1 &amp; Shuttle 2 between Romklao Dormitory, ข้าวซอยเงินล้าน, and Romklao Campus (07:00 – 18:00).
          </p>
          <div className="mt-6 pt-5 border-t border-[#2B221D] flex items-center gap-2.5 text-xs text-[#A69B94]">
            <ShieldCheck className="w-4 h-4 text-[#34C77B] shrink-0" aria-hidden="true" />
            <span>Student phone privacy protected · Verified KBU access</span>
          </div>
        </aside>

        {/* Sign In & OTP Verification Card matching Image 03 */}
        <main className="lg:col-span-7 w-full max-w-md mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {t.welcomeTitle}
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-[#A69B94]">{t.welcomeSubtitle}</p>

          <form onSubmit={handleContinue} noValidate className="mt-6 space-y-3">
            {/* Blank Full Name Input so each student enters their own name */}
            <div>
              <label htmlFor="kbu-student-name" className="sr-only">
                {t.fullNameLabel}
              </label>
              <input
                id="kbu-student-name"
                type="text"
                autoComplete="name"
                placeholder={t.fullNamePlaceholder}
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  if (nameError) setNameError(null);
                }}
                aria-invalid={Boolean(nameError)}
                className={`w-full h-[52px] rounded-2xl bg-[#1A1411] border px-4 text-base font-medium text-white placeholder-[#6D625B] focus:outline-none transition-colors ${
                  nameError
                    ? 'border-[#F16565]'
                    : 'border-[#352B25] focus:border-[#FF6D24] focus:ring-2 focus:ring-[#FF6D24]/30'
                }`}
              />
              {nameError && (
                <p role="alert" className="mt-1.5 text-xs font-medium text-[#F16565]">
                  {nameError}
                </p>
              )}
            </div>

            <div className="flex items-stretch gap-3">
              <div className="w-24 shrink-0">
                <label htmlFor="kbu-country-code" className="sr-only">
                  Country code
                </label>
                <select
                  id="kbu-country-code"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full h-[52px] rounded-2xl bg-[#1A1411] border border-[#352B25] px-3 text-base font-medium text-white focus:border-[#FF6D24] focus:outline-none cursor-pointer"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-[#1A1411] text-white">
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label htmlFor="kbu-phone-input" className="sr-only">
                  Phone number
                </label>
                <input
                  id="kbu-phone-input"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder=""
                  value={phoneInput}
                  onChange={(e) => {
                    setPhoneInput(formatPhoneInput(e.target.value));
                    if (phoneError) setPhoneError(null);
                  }}
                  aria-invalid={Boolean(phoneError)}
                  className={`w-full h-[52px] rounded-2xl bg-[#1A1411] border px-4 text-base font-medium text-white placeholder-[#6D625B] focus:outline-none transition-colors tabular-nums ${
                    phoneError
                      ? 'border-[#F16565]'
                      : 'border-[#FF6D24] focus:ring-2 focus:ring-[#FF6D24]/30'
                  }`}
                />
              </div>
            </div>

            {phoneError && (
              <p role="alert" className="mt-2 text-xs font-medium text-[#F16565]">
                {phoneError}
              </p>
            )}

            <button
              type="submit"
              className="mt-4 w-full min-h-[52px] rounded-2xl bg-[#FF6D24] hover:bg-[#FF7F3F] active:scale-[0.99] text-[#140E0A] font-bold text-base transition-all cursor-pointer"
            >
              {t.continueBtn}
            </button>
          </form>

          {/* Verify your number card matching Image 03 */}
          {otpSent && (
            <section
              aria-label="OTP Verification"
              className="mt-6 rounded-3xl bg-[#1A1411] border border-[#2D241E] p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white">{t.verifyNumberTitle}</h2>
                  <p className="mt-1 text-sm text-[#A69B94]">{t.verifyNumberSubtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoCode}
                  className="text-xs font-semibold text-[#FF6D24] hover:text-[#FF8D52] underline underline-offset-4 whitespace-nowrap shrink-0 min-h-[36px]"
                >
                  Use demo code
                </button>
              </div>

              {/* 6-digit OTP inputs */}
              <div className="mt-5 grid grid-cols-6 gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      digitRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    aria-label={`Verification digit ${idx + 1}`}
                    disabled={attemptsLeft === 0}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    className={`h-14 w-full rounded-2xl bg-[#221B17] border text-center text-xl font-bold text-white tabular-nums focus:outline-none focus:border-[#FF6D24] transition-colors disabled:opacity-50 ${
                      otpError ? 'border-[#F16565]/70' : 'border-[#3A2F29]'
                    }`}
                  />
                ))}
              </div>

              {otpError && (
                <p role="alert" className="mt-3 text-sm font-medium text-[#F16565]">
                  {otpError}
                </p>
              )}

              {resendFeedback && !otpError && (
                <p className="mt-3 text-xs font-medium text-[#34C77B]">{resendFeedback}</p>
              )}

              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-sm text-[#A69B94] tabular-nums">
                  {resendSeconds > 0
                    ? `${t.resendIn} ${formattedCountdown}`
                    : 'Ready to resend code'}
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendSeconds > 0 && attemptsLeft > 0}
                  className="min-h-[44px] px-5 rounded-2xl border border-[#3A2F29] bg-[#221B17] text-sm font-semibold text-[#D6CDC7] hover:border-[#FF6D24]/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {t.resendBtn}
                </button>
              </div>
            </section>
          )}

          <p className="mt-5 text-xs leading-relaxed text-[#8C8078]">
            Demo SMS verification code:{' '}
            <span className="font-mono font-semibold text-[#D6CDC7] tabular-nums">
              {DEMO_OTP_CODE}
            </span>
            . Standard KBU student accounts connect to university SMS OTP delivery.
          </p>
        </main>
      </div>
    </div>
  );
}
