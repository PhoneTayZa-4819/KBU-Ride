import type {
  CampusStop,
  LatLngPoint,
  ScheduleSlot,
  ServiceHoursStatus,
  ShuttleReminder,
  ShuttleState,
  ShuttleStatus,
  ShuttleTelemetry,
} from '../types/kbu';

/** Service operating hours in Asia/Bangkok (07:00 to 18:00 inclusive) */
export const SERVICE_START_HOUR = 7;
export const SERVICE_END_HOUR = 18;
export const SCHEDULE_INTERVAL_MINUTES = 15;

/** Fallback closed-loop timing for the local Romklao 3-stop shuttle loop */
export const DEFAULT_LOOP_MINUTES = 12;
export const DEFAULT_LOOP_KM = 3.6;

/**
 * Kasem Bundit University Romklao local shuttle stops (3 places only).
 * Real-world coordinates and formatted addresses are resolved dynamically
 * at runtime via Google Maps Places API (New) — Place.searchByText().
 */
export const KBU_STOPS: CampusStop[] = [
  {
    id: 'stop-romklao-dorm',
    name: 'Kasem Bundit Romklao Dormitory',
    nameTh: 'หอพัก ม.เกษมบัณฑิต ร่มเกล้า',
    shortLabel: 'Romklao Dormitory',
    campus: 'Dormitory',
    placeQuery: 'หอพักมหาวิทยาลัยเกษมบัณฑิต วิทยาเขตร่มเกล้า มีนบุรี กรุงเทพมหานคร',
    fallbackQuery: 'Kasem Bundit University Residence Hall Romklao Min Buri Bangkok',
    routeProgress: 0.02,
    location: null,
  },
  {
    id: 'stop-khaosoi-ngernlan',
    name: 'ข้าวซอยเงินล้าน',
    nameTh: 'ข้าวซอยเงินล้าน',
    shortLabel: 'ข้าวซอยเงินล้าน',
    campus: 'Local Stop',
    placeQuery: 'ข้าวซอยเงินล้าน ร่มเกล้า มีนบุรี กรุงเทพมหานคร',
    fallbackQuery: 'ข้าวซอย ถนนร่มเกล้า มีนบุรี กรุงเทพมหานคร',
    routeProgress: 0.36,
    location: null,
  },
  {
    id: 'stop-romklao-campus',
    name: 'Kasem Bundit University Romklao Campus',
    nameTh: 'ม.เกษมบัณฑิต วิทยาเขตร่มเกล้า',
    shortLabel: 'KBU Romklao Campus',
    campus: 'Campus',
    placeQuery: 'Kasem Bundit University Romklao Campus, Min Buri, Bangkok, Thailand',
    routeProgress: 0.68,
    location: null,
  },
];

/**
 * Bus 1 and Bus 2 run the exact same 3-stop Romklao loop, staggered 50% apart.
 */
export const INITIAL_SHUTTLES: ShuttleState[] = [
  {
    id: 'shuttle-1',
    number: 1,
    name: 'Shuttle 1',
    routeLabel: 'Dormitory → ข้าวซอยเงินล้าน → Romklao Campus',
    plateNumber: 'KBU-01 · 32-8412',
    driverName: 'Somchai K.',
    // Approaching ข้าวซอยเงินล้าน along the Romklao loop (~2 min away)
    progress: 0.18,
    speedPerSec: 0.0022,
    dwellRemainingSec: 0,
    speedKmh: 26,
    occupancyPercent: 42,
    updatedSecondsAgo: 4,
    accent: 'orange',
  },
  {
    id: 'shuttle-2',
    number: 2,
    name: 'Shuttle 2',
    routeLabel: 'Dormitory → ข้าวซอยเงินล้าน → Romklao Campus',
    plateNumber: 'KBU-02 · 32-8419',
    driverName: 'Prasert W.',
    // Staggered half a loop apart from Shuttle 1 (at Romklao Campus heading back to Dormitory)
    progress: 0.68,
    speedPerSec: 0.0022,
    dwellRemainingSec: 0,
    speedKmh: 28,
    occupancyPercent: 58,
    updatedSecondsAgo: 6,
    accent: 'amber',
  },
];

/**
 * Generates the complete 15-minute daily schedule from 07:00 to 18:00 (45 trips),
 * alternating Shuttle 1 and Shuttle 2 along the 3-stop Romklao loop.
 */
export function generateRomklaoSchedule(): ScheduleSlot[] {
  const slots: ScheduleSlot[] = [];
  const startMinutes = SERVICE_START_HOUR * 60;
  const endMinutes = SERVICE_END_HOUR * 60;

  let index = 0;
  for (let totalMin = startMinutes; totalMin <= endMinutes; totalMin += SCHEDULE_INTERVAL_MINUTES) {
    const hour = Math.floor(totalMin / 60);
    const minute = totalMin % 60;
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const shuttleNumber: 1 | 2 = index % 2 === 0 ? 1 : 2;
    const period: ScheduleSlot['period'] =
      hour < 12 ? 'Morning' : hour < 16 ? 'Midday' : 'Evening';

    slots.push({
      id: `sch-${String(index + 1).padStart(2, '0')}`,
      time,
      shuttleNumber,
      route: 'Romklao 3-Stop Loop',
      period,
      departureStop: 'Kasem Bundit Romklao Dormitory',
      estimatedDurationMin: DEFAULT_LOOP_MINUTES,
    });
    index += 1;
  }

  return slots;
}

export const KBU_SCHEDULE: ScheduleSlot[] = generateRomklaoSchedule();

/**
 * Evaluates whether the KBU Romklao shuttle is currently operating in Asia/Bangkok time
 * (07:00 to 18:00 inclusive).
 */
export function evaluateBangkokServiceHours(now: Date = new Date()): ServiceHoursStatus {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const rawHour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const bangkokHour = rawHour === 24 ? 0 : rawHour;
  const bangkokMinute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  const totalMinutes = bangkokHour * 60 + bangkokMinute;

  const isOperating =
    totalMinutes >= SERVICE_START_HOUR * 60 && totalMinutes <= SERVICE_END_HOUR * 60;

  return {
    isOperating,
    bangkokHour,
    bangkokMinute,
    bangkokTimeLabel: `${String(bangkokHour).padStart(2, '0')}:${String(bangkokMinute).padStart(2, '0')}`,
    operatingHoursLabel: '07:00 – 18:00',
    nextServiceLabel: '07:00',
  };
}

/**
 * Returns the ID of the next upcoming scheduled departure at or after the current Bangkok time,
 * or null when outside operating hours.
 */
export function findNextScheduledSlotId(
  slots: ScheduleSlot[],
  serviceStatus: ServiceHoursStatus
): string | null {
  if (!serviceStatus.isOperating) return null;
  const nowMinutes = serviceStatus.bangkokHour * 60 + serviceStatus.bangkokMinute;
  for (const slot of slots) {
    const [h, m] = slot.time.split(':').map(Number);
    if (h * 60 + m >= nowMinutes) {
      return slot.id;
    }
  }
  return null;
}

/**
 * Wraps progress strictly into [0, 1).
 */
export function normalizeProgress(progress: number): number {
  const mod = progress % 1;
  return mod < 0 ? mod + 1 : mod;
}

/**
 * Forward circular distance from progressA to progressB in [0, 1).
 */
export function forwardLoopDelta(fromProgress: number, toProgress: number): number {
  const a = normalizeProgress(fromProgress);
  const b = normalizeProgress(toProgress);
  const diff = b - a;
  return diff >= 0 ? diff : diff + 1;
}

/**
 * Haversine great-circle distance in kilometers between two LatLng points.
 */
export function computeHaversineKm(a: LatLngPoint, b: LatLngPoint): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Total road length in kilometers of a geographic polyline path.
 */
export function computePathDistanceKm(path: LatLngPoint[]): number {
  if (path.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += computeHaversineKm(path[i], path[i + 1]);
  }
  return total;
}

/**
 * Interpolates a real-world { lat, lng } coordinate along a closed road loop polyline for progress in [0, 1).
 */
export function interpolateGeoPath(
  path: LatLngPoint[],
  rawProgress: number
): LatLngPoint | null {
  if (path.length === 0) return null;
  if (path.length === 1) return path[0];

  const t = normalizeProgress(rawProgress);
  const segLengths: number[] = [];
  let totalLen = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const len = computeHaversineKm(path[i], path[i + 1]);
    segLengths.push(len);
    totalLen += len;
  }

  if (totalLen === 0) return path[0];

  let remaining = t * totalLen;
  for (let i = 0; i < segLengths.length; i++) {
    const seg = segLengths[i];
    if (remaining <= seg || i === segLengths.length - 1) {
      const ratio = seg > 0 ? remaining / seg : 0;
      return {
        lat: path[i].lat + (path[i + 1].lat - path[i].lat) * ratio,
        lng: path[i].lng + (path[i + 1].lng - path[i].lng) * ratio,
      };
    }
    remaining -= seg;
  }

  return path[path.length - 1];
}

/**
 * Finds the normalized progress [minProgress, maxProgress] along a polyline closest to a given stop coordinate.
 * Windowing ensures closed-loop stops preserve monotonic order (Dormitory -> ข้าวซอยเงินล้าน -> Romklao Campus).
 */
export function projectStopProgressAlongPath(
  path: LatLngPoint[],
  stopLocation: LatLngPoint,
  minProgress: number = 0.02,
  maxProgress: number = 0.98
): number {
  if (path.length < 2) return minProgress;
  const cumulative: number[] = [0];
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    total += computeHaversineKm(path[i], path[i + 1]);
    cumulative.push(total);
  }
  if (total === 0) return minProgress;

  let bestProgress = minProgress;
  let bestDist = Infinity;
  for (let i = 0; i < path.length; i++) {
    const frac = cumulative[i] / total;
    if (frac < minProgress || frac > maxProgress) continue;
    const d = computeHaversineKm(path[i], stopLocation);
    if (d < bestDist) {
      bestDist = d;
      bestProgress = frac;
    }
  }
  return Math.max(minProgress, Math.min(maxProgress, bestProgress));
}

/**
 * Computes real-time ETA, status, next stop, distance, and geographic position for a shuttle.
 * When isLiveActive is false (off-hours without live preview), returns Off hours state with parked depot position.
 */
export function computeShuttleTelemetry(
  shuttle: ShuttleState,
  stops: CampusStop[],
  targetStopId: string,
  routePath: LatLngPoint[] = [],
  totalRouteKm: number = DEFAULT_LOOP_KM,
  totalRouteMinutes: number = DEFAULT_LOOP_MINUTES,
  isLiveActive: boolean = true
): ShuttleTelemetry {
  const targetStop = stops.find((s) => s.id === targetStopId) ?? stops[0];

  if (!isLiveActive) {
    const depotStop = shuttle.number === 1 ? stops[0] : (stops[stops.length - 1] ?? stops[0]);
    const parkedPosition =
      depotStop?.location ?? interpolateGeoPath(routePath, depotStop?.routeProgress ?? 0);

    return {
      shuttleId: shuttle.id,
      etaMinutes: 0,
      status: 'Off hours',
      nextStop: stops[0],
      targetStop,
      distanceKm: 0,
      position: parkedPosition,
    };
  }

  const deltaToTarget = forwardLoopDelta(shuttle.progress, targetStop.routeProgress);
  const loopMinutes = Math.max(6, totalRouteMinutes);
  const loopKm = Math.max(1.2, totalRouteKm);

  const rawMinutes = deltaToTarget * loopMinutes;
  const etaMinutes = Math.max(1, Math.round(rawMinutes));
  const distanceKm = Number((deltaToTarget * loopKm).toFixed(1));

  let status: ShuttleStatus = 'On route';
  if (rawMinutes <= 1.2) {
    status = 'Arriving now';
  } else if (etaMinutes <= 5) {
    status = 'Approaching';
  }

  // Immediate next stop ahead of the shuttle along the 3-stop loop
  let nextStop = stops[0];
  let smallestDelta = Infinity;
  for (const stop of stops) {
    const d = forwardLoopDelta(shuttle.progress, stop.routeProgress);
    if (d < smallestDelta) {
      smallestDelta = d;
      nextStop = stop;
    }
  }

  const position = interpolateGeoPath(routePath, shuttle.progress);

  return {
    shuttleId: shuttle.id,
    etaMinutes,
    status,
    nextStop,
    targetStop,
    distanceKm,
    position,
  };
}

/**
 * Advances all shuttles forward along the closed Romklao loop by deltaSec seconds.
 */
export function advanceShuttles(
  shuttles: ShuttleState[],
  stops: CampusStop[],
  deltaSec: number
): ShuttleState[] {
  return shuttles.map((shuttle) => {
    const updatedAgo =
      shuttle.updatedSecondsAgo + deltaSec >= 15
        ? 1
        : Math.round(shuttle.updatedSecondsAgo + deltaSec);

    if (shuttle.dwellRemainingSec > 0) {
      const remaining = Math.max(0, shuttle.dwellRemainingSec - deltaSec);
      return {
        ...shuttle,
        dwellRemainingSec: remaining,
        speedKmh: remaining > 0 ? 0 : 24,
        updatedSecondsAgo: updatedAgo,
      };
    }

    const prevProgress = shuttle.progress;
    const nextProgress = normalizeProgress(prevProgress + shuttle.speedPerSec * deltaSec);

    let crossedStop = false;
    for (const stop of stops) {
      const distBefore = forwardLoopDelta(prevProgress, stop.routeProgress);
      const stepDist = shuttle.speedPerSec * deltaSec;
      if (distBefore > 0 && distBefore <= stepDist) {
        crossedStop = true;
        break;
      }
    }

    const wave = Math.sin(nextProgress * Math.PI * 6) * 4;
    const baseSpeed = shuttle.number === 1 ? 25 : 27;

    return {
      ...shuttle,
      progress: nextProgress,
      dwellRemainingSec: crossedStop ? 3 : 0,
      speedKmh: crossedStop ? 0 : Math.max(14, Math.round(baseSpeed + wave)),
      updatedSecondsAgo: updatedAgo,
    };
  });
}

/**
 * Evaluates active reminders against current shuttle ETAs and returns newly triggered reminders.
 */
export function evaluateReminderTriggers(
  shuttles: ShuttleState[],
  reminders: ShuttleReminder[],
  stops: CampusStop[],
  alreadyTriggeredIds: Set<string>,
  routePath: LatLngPoint[] = [],
  totalRouteKm: number = DEFAULT_LOOP_KM,
  totalRouteMinutes: number = DEFAULT_LOOP_MINUTES,
  isLiveActive: boolean = true
): Array<{ reminder: ShuttleReminder; telemetry: ShuttleTelemetry; shuttle: ShuttleState }> {
  if (!isLiveActive) return [];

  const triggered: Array<{
    reminder: ShuttleReminder;
    telemetry: ShuttleTelemetry;
    shuttle: ShuttleState;
  }> = [];

  for (const reminder of reminders) {
    if (!reminder.enabled || alreadyTriggeredIds.has(reminder.id)) {
      continue;
    }
    const shuttle = shuttles.find((s) => s.id === reminder.shuttleId);
    if (!shuttle) continue;

    const telemetry = computeShuttleTelemetry(
      shuttle,
      stops,
      reminder.stopId,
      routePath,
      totalRouteKm,
      totalRouteMinutes,
      isLiveActive
    );
    if (telemetry.etaMinutes > 0 && telemetry.etaMinutes <= reminder.minutesBefore) {
      triggered.push({ reminder, telemetry, shuttle });
    }
  }

  return triggered;
}
