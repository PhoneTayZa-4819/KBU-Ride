export const DEMO_OTP_CODE = '427890';
export const MAX_OTP_ATTEMPTS = 3;

export interface PhoneValidationResult {
  valid: boolean;
  cleaned: string;
  error?: string;
}

export function cleanPhoneDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function validatePhoneNumber(raw: string): PhoneValidationResult {
  const cleaned = cleanPhoneDigits(raw);
  if (!cleaned) {
    return {
      valid: false,
      cleaned,
      error: 'Please enter your phone number to continue.',
    };
  }
  if (cleaned.length < 8 || cleaned.length > 12) {
    return {
      valid: false,
      cleaned,
      error: 'Enter a valid 8–12 digit mobile number.',
    };
  }
  return { valid: true, cleaned };
}

export function formatPhoneInput(raw: string): string {
  const digits = cleanPhoneDigits(raw).slice(0, 10);
  if (digits.length <= 1) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 1)} ${digits.slice(1)}`;
  if (digits.length <= 7) return `${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 1)} ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

export function maskPhoneNumber(countryCode: string, rawPhone: string): string {
  const digits = cleanPhoneDigits(rawPhone);
  if (digits.length < 4) {
    return `${countryCode} ${digits}`;
  }
  const first = digits.slice(0, 1);
  const lastThree = digits.slice(-3);
  return `${countryCode} ${first}•• ••• ${lastThree}`;
}

export function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'KB';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export interface OtpCheckResult {
  success: boolean;
  attemptsRemaining: number;
  locked: boolean;
  error?: string;
}

export function verifyOtpAttempt(
  enteredCode: string,
  expectedCode: string,
  attemptsRemaining: number
): OtpCheckResult {
  const cleaned = cleanPhoneDigits(enteredCode);
  if (cleaned.length < 6) {
    return {
      success: false,
      attemptsRemaining,
      locked: false,
      error: 'Enter all 6 digits from your SMS code.',
    };
  }
  if (cleaned === expectedCode) {
    return {
      success: true,
      attemptsRemaining: MAX_OTP_ATTEMPTS,
      locked: false,
    };
  }
  const nextRemaining = Math.max(0, attemptsRemaining - 1);
  if (nextRemaining === 0) {
    return {
      success: false,
      attemptsRemaining: 0,
      locked: true,
      error: 'Too many incorrect attempts. Please tap Resend for a new code.',
    };
  }
  return {
    success: false,
    attemptsRemaining: nextRemaining,
    locked: false,
    error: `Incorrect code. ${nextRemaining} ${nextRemaining === 1 ? 'attempt' : 'attempts'} left.`,
  };
}
