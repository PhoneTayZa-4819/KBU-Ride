import type { ReminderSound } from '../types/kbu';

export function playReminderSound(sound: ReminderSound): void {
  if (sound === 'Silent' || typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, duration: number, type: OscillatorType = 'sine') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.14, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    };

    if (sound === 'Chime') {
      playTone(587.33, now, 0.25, 'sine');
      playTone(880, now + 0.14, 0.35, 'sine');
    } else if (sound === 'Bell') {
      playTone(1046.5, now, 0.4, 'triangle');
      playTone(1318.5, now + 0.12, 0.45, 'triangle');
    } else if (sound === 'Pulse') {
      playTone(440, now, 0.16, 'sine');
      playTone(440, now + 0.22, 0.16, 'sine');
    }
  } catch {
    // Audio playback may be restricted before user gesture
  }
}
