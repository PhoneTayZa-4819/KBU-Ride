import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_SHUTTLES,
  KBU_SCHEDULE,
  KBU_STOPS,
  advanceShuttles,
  computeHaversineKm,
  computePathDistanceKm,
  computeShuttleTelemetry,
  evaluateBangkokServiceHours,
  evaluateReminderTriggers,
  findNextScheduledSlotId,
  forwardLoopDelta,
  interpolateGeoPath,
  normalizeProgress,
  projectStopProgressAlongPath,
} from './shuttleEngine';
import {
  DEMO_OTP_CODE,
  getInitials,
  maskPhoneNumber,
  validatePhoneNumber,
  verifyOtpAttempt,
} from './authHelpers';
import type { LatLngPoint, ShuttleReminder } from '../types/kbu';

const SYNTHETIC_LOOP_PATH: LatLngPoint[] = [
  { lat: 0.0, lng: 0.0 },
  { lat: 0.02, lng: 0.01 },
  { lat: 0.03, lng: 0.03 },
  { lat: 0.0, lng: 0.0 },
];

test('KBU_STOPS contains only the 3 Romklao loop places in exact order', () => {
  assert.equal(KBU_STOPS.length, 3);
  assert.equal(KBU_STOPS[0].name, 'Kasem Bundit Romklao Dormitory');
  assert.equal(KBU_STOPS[1].name, 'ข้าวซอยเงินล้าน');
  assert.equal(KBU_STOPS[2].name, 'Kasem Bundit University Romklao Campus');
});

test('INITIAL_SHUTTLES stagger Bus 1 and Bus 2 by 50% on the same loop', () => {
  assert.equal(INITIAL_SHUTTLES.length, 2);
  assert.equal(INITIAL_SHUTTLES[0].routeLabel, INITIAL_SHUTTLES[1].routeLabel);
  const gap = forwardLoopDelta(INITIAL_SHUTTLES[0].progress, INITIAL_SHUTTLES[1].progress);
  assert.equal(Number(gap.toFixed(2)), 0.5);
});

test('KBU_SCHEDULE generates every 15 minutes from 07:00 to 18:00 (45 departures)', () => {
  assert.equal(KBU_SCHEDULE.length, 45);
  assert.equal(KBU_SCHEDULE[0].time, '07:00');
  assert.equal(KBU_SCHEDULE[1].time, '07:15');
  assert.equal(KBU_SCHEDULE[KBU_SCHEDULE.length - 1].time, '18:00');
  assert.equal(KBU_SCHEDULE[0].shuttleNumber, 1);
  assert.equal(KBU_SCHEDULE[1].shuttleNumber, 2);
});

test('evaluateBangkokServiceHours enforces 07:00 to 18:00 Asia/Bangkok boundary', () => {
  // 06:59 Bangkok = 23:59 UTC previous day
  const beforeOpen = new Date('2026-05-10T23:59:00.000Z');
  assert.equal(evaluateBangkokServiceHours(beforeOpen).isOperating, false);
  assert.equal(evaluateBangkokServiceHours(beforeOpen).bangkokTimeLabel, '06:59');

  // 07:00 Bangkok = 00:00 UTC
  const atOpen = new Date('2026-05-11T00:00:00.000Z');
  assert.equal(evaluateBangkokServiceHours(atOpen).isOperating, true);
  assert.equal(evaluateBangkokServiceHours(atOpen).bangkokTimeLabel, '07:00');

  // 18:00 Bangkok = 11:00 UTC
  const atClose = new Date('2026-05-11T11:00:00.000Z');
  assert.equal(evaluateBangkokServiceHours(atClose).isOperating, true);
  assert.equal(evaluateBangkokServiceHours(atClose).bangkokTimeLabel, '18:00');

  // 18:01 Bangkok = 11:01 UTC
  const afterClose = new Date('2026-05-11T11:01:00.000Z');
  assert.equal(evaluateBangkokServiceHours(afterClose).isOperating, false);
  assert.equal(evaluateBangkokServiceHours(afterClose).bangkokTimeLabel, '18:01');

  // Next scheduled slot lookup at 07:10 Bangkok -> 07:15 slot
  const midMorning = evaluateBangkokServiceHours(new Date('2026-05-11T00:10:00.000Z'));
  assert.equal(findNextScheduledSlotId(KBU_SCHEDULE, midMorning), 'sch-02');
  assert.equal(findNextScheduledSlotId(KBU_SCHEDULE, evaluateBangkokServiceHours(afterClose)), null);
});

test('normalizeProgress and forwardLoopDelta handle loop wrap-around cleanly', () => {
  assert.equal(normalizeProgress(0.25), 0.25);
  assert.equal(Number(normalizeProgress(1.3).toFixed(4)), 0.3);
  assert.equal(Number(normalizeProgress(-0.2).toFixed(4)), 0.8);
  assert.equal(Number(forwardLoopDelta(0.8, 0.1).toFixed(2)), 0.3);
});

test('computeHaversineKm, interpolateGeoPath, and windowed projection work on closed loop', () => {
  const dist = computeHaversineKm({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });
  assert.ok(dist > 110 && dist < 112);

  const totalDist = computePathDistanceKm(SYNTHETIC_LOOP_PATH);
  assert.ok(totalDist > 8 && totalDist < 12);

  const mid = interpolateGeoPath(SYNTHETIC_LOOP_PATH, 0.5);
  assert.ok(mid !== null);

  const projected = projectStopProgressAlongPath(
    SYNTHETIC_LOOP_PATH,
    { lat: 0.02, lng: 0.01 },
    0.06,
    0.65
  );
  assert.ok(projected >= 0.06 && projected <= 0.65);
});

test('computeShuttleTelemetry handles both live staggered loop and off-hours paused state', () => {
  const stopMid = KBU_STOPS[1];
  const tel1 = computeShuttleTelemetry(INITIAL_SHUTTLES[0], KBU_STOPS, stopMid.id, SYNTHETIC_LOOP_PATH);
  const tel2 = computeShuttleTelemetry(INITIAL_SHUTTLES[1], KBU_STOPS, stopMid.id, SYNTHETIC_LOOP_PATH);

  assert.equal(tel1.etaMinutes, 3);
  assert.equal(tel1.status, 'Approaching');
  assert.equal(tel1.targetStop.id, stopMid.id);
  assert.ok(tel1.position !== null);

  assert.equal(tel2.etaMinutes, 9);
  assert.equal(tel2.status, 'On route');

  const offHoursTel = computeShuttleTelemetry(
    INITIAL_SHUTTLES[0],
    KBU_STOPS,
    stopMid.id,
    SYNTHETIC_LOOP_PATH,
    1.4,
    12,
    false
  );
  assert.equal(offHoursTel.status, 'Off hours');
  assert.equal(offHoursTel.etaMinutes, 0);
});

test('advanceShuttles moves shuttles forward and evaluateReminderTriggers respects live state', () => {
  const next = advanceShuttles(INITIAL_SHUTTLES, KBU_STOPS, 5);
  assert.ok(next[0].progress > INITIAL_SHUTTLES[0].progress);
  assert.ok(next[1].progress > INITIAL_SHUTTLES[1].progress);

  const reminder: ShuttleReminder = {
    id: 'rem-1',
    shuttleId: 'shuttle-1',
    stopId: KBU_STOPS[1].id,
    minutesBefore: 5,
    sound: 'Chime',
    enabled: true,
    createdAt: Date.now(),
  };

  const triggeredLive = evaluateReminderTriggers(
    INITIAL_SHUTTLES,
    [reminder],
    KBU_STOPS,
    new Set(),
    SYNTHETIC_LOOP_PATH,
    3.6,
    12,
    true
  );
  assert.equal(triggeredLive.length, 1);

  const triggeredOffHours = evaluateReminderTriggers(
    INITIAL_SHUTTLES,
    [reminder],
    KBU_STOPS,
    new Set(),
    SYNTHETIC_LOOP_PATH,
    3.6,
    12,
    false
  );
  assert.equal(triggeredOffHours.length, 0);
});

test('authHelpers validate phone numbers, mask numbers, initials, and OTP attempts', () => {
  assert.equal(validatePhoneNumber('').valid, false);
  assert.equal(validatePhoneNumber('9 123 456 789').valid, true);
  assert.equal(maskPhoneNumber('+66', '812345678'), '+66 8•• ••• 678');
  assert.equal(getInitials('Mint Narong'), 'MN');
  const wrong = verifyOtpAttempt('111111', DEMO_OTP_CODE, 3);
  assert.equal(wrong.success, false);
  assert.equal(wrong.attemptsRemaining, 2);
  const ok = verifyOtpAttempt(DEMO_OTP_CODE, DEMO_OTP_CODE, 2);
  assert.equal(ok.success, true);
});
