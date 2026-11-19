import { useState } from 'react';
import { X } from 'lucide-react';
import {
  DEMO_OTP_CODE,
  MAX_OTP_ATTEMPTS,
  formatPhoneInput,
  validatePhoneNumber,
  verifyOtpAttempt,
} from '../utils/authHelpers';

interface ChangePhoneModalProps {
  open: boolean;
  currentCountryCode: string;
  onClose: () => void;
  onSuccess: (payload: { countryCode: string; phoneNumber: string }) => void;
}

export function ChangePhoneModal({
  open,
  currentCountryCode,
  onClose,
  onSuccess,
}: ChangePhoneModalProps) {
  const [countryCode, setCountryCode] = useState(currentCountryCode);
  const [phoneInput, setPhoneInput] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otpInput, setOtpInput] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_OTP_ATTEMPTS);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const resetAndClose = () => {
    setStep('phone');
    setPhoneInput('');
    setOtpInput('');
    setError(null);
    setAttemptsLeft(MAX_OTP_ATTEMPTS);
    onClose();
  };

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validatePhoneNumber(phoneInput);
    if (!res.valid) {
      setError(res.error ?? 'Enter a valid phone number.');
      return;
    }
    setError(null);
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneCheck = validatePhoneNumber(phoneInput);
    const res = verifyOtpAttempt(otpInput, DEMO_OTP_CODE, attemptsLeft);
    if (res.success && phoneCheck.valid) {
      onSuccess({ countryCode, phoneNumber: phoneCheck.cleaned });
      resetAndClose();
    } else {
      setAttemptsLeft(res.attemptsRemaining);
      setError(res.error ?? 'Invalid code.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-phone-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={resetAndClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A1411] border border-[#E5DBD3] dark:border-[#322721] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2
            id="change-phone-title"
            className="text-xl font-extrabold text-[#1A120E] dark:text-white"
          >
            Change Phone Number
          </h2>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close phone update dialog"
            className="w-10 h-10 rounded-xl bg-[#FAF7F4] dark:bg-[#241C18] text-[#6B5E57] dark:text-[#A69B94] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleRequestOtp} noValidate className="space-y-4">
            <p className="text-sm text-[#766962] dark:text-[#A69B94]">
              Enter your new mobile number. We will verify it using a 6-digit OTP.
            </p>
            <div className="flex gap-2.5">
              <select
                aria-label="New country code"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="w-24 h-12 rounded-2xl bg-[#FAF7F4] dark:bg-[#221B17] border border-[#DDD2C9] dark:border-[#352B25] px-3 text-sm font-semibold text-[#1A120E] dark:text-white"
              >
                <option value="+66">+66</option>
                <option value="+95">+95</option>
                <option value="+856">+856</option>
                <option value="+855">+855</option>
              </select>
              <input
                type="tel"
                inputMode="numeric"
                aria-label="New mobile number"
                placeholder=""
                value={phoneInput}
                onChange={(e) => {
                  setPhoneInput(formatPhoneInput(e.target.value));
                  setError(null);
                }}
                className="flex-1 h-12 rounded-2xl bg-[#FAF7F4] dark:bg-[#221B17] border border-[#FF6D24] px-4 text-sm font-semibold text-[#1A120E] dark:text-white tabular-nums focus:outline-none"
              />
            </div>
            {error && (
              <p role="alert" className="text-xs font-medium text-[#F16565]">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full min-h-[48px] rounded-2xl bg-[#FF6D24] hover:bg-[#FF7F3F] text-[#140E0A] font-bold text-sm cursor-pointer"
            >
              Send Verification Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
            <p className="text-sm text-[#766962] dark:text-[#A69B94]">
              Enter the 6-digit SMS code sent to {countryCode} {phoneInput}. (Demo code:{' '}
              <span className="font-mono font-bold text-[#1A120E] dark:text-white">
                {DEMO_OTP_CODE}
              </span>
              )
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              aria-label="6-digit OTP code"
              placeholder="427890"
              value={otpInput}
              onChange={(e) => {
                setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6));
                setError(null);
              }}
              className="w-full h-12 rounded-2xl bg-[#FAF7F4] dark:bg-[#221B17] border border-[#FF6D24] px-4 text-center text-lg font-extrabold tracking-[0.35em] text-[#1A120E] dark:text-white tabular-nums focus:outline-none"
            />
            {error && (
              <p role="alert" className="text-xs font-medium text-[#F16565]">
                {error}
              </p>
            )}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="flex-1 min-h-[48px] rounded-2xl border border-[#DDD2C9] dark:border-[#3A2F29] text-sm font-semibold text-[#1A120E] dark:text-white cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 min-h-[48px] rounded-2xl bg-[#FF6D24] hover:bg-[#FF7F3F] text-[#140E0A] font-bold text-sm cursor-pointer"
              >
                Verify & Update
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
