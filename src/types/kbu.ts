export type AppPhase = 'splash' | 'onboarding' | 'auth' | 'app';

export type AppTab = 'home' | 'location' | 'reminders' | 'schedule' | 'about';

export type AppearanceMode = 'dark' | 'light' | 'system';

export type LanguageCode = 'en' | 'th';

export type ShuttleStatus = 'Arriving now' | 'Approaching' | 'On route' | 'Off hours';

export type ReminderSound = 'Chime' | 'Bell' | 'Pulse' | 'Silent';

export interface LatLngPoint {
  lat: number;
  lng: number;
}

export interface CampusStop {
  id: string;
  name: string;
  nameTh: string;
  shortLabel: string;
  campus: 'Dormitory' | 'Local Stop' | 'Campus';
  /** Places API (New) text query used to resolve real-world coordinates dynamically */
  placeQuery: string;
  /** Optional fallback query scoped to Romklao / Min Buri if primary query resolves far away */
  fallbackQuery?: string;
  /** Optional formatted address returned dynamically from Google Maps Places API */
  formattedAddress?: string;
  /** Optional Google Place ID returned dynamically from Google Maps Places API */
  placeId?: string;
  /** Normalized position [0, 1) along the closed Romklao 3-stop shuttle loop */
  routeProgress: number;
  /** Real-world coordinate resolved dynamically via Google Maps Places API (New) */
  location: LatLngPoint | null;
}

export interface ShuttleState {
  id: string;
  number: 1 | 2;
  name: string;
  routeLabel: string;
  plateNumber: string;
  driverName: string;
  /** Normalized progress along closed 3-stop loop [0, 1) */
  progress: number;
  /** Progress per second along the loop */
  speedPerSec: number;
  /** Seconds remaining if currently dwelling at a stop */
  dwellRemainingSec: number;
  /** Simulated speed in km/h */
  speedKmh: number;
  /** Seat availability percentage (0-100 occupied) */
  occupancyPercent: number;
  /** Seconds elapsed since last GPS telemetry ping */
  updatedSecondsAgo: number;
  /** Theme color key for map pin */
  accent: 'orange' | 'amber';
}

export interface ShuttleTelemetry {
  shuttleId: string;
  etaMinutes: number;
  status: ShuttleStatus;
  nextStop: CampusStop;
  targetStop: CampusStop;
  distanceKm: number;
  /** Real-world lat/lng position interpolated along the Google Maps road loop */
  position: LatLngPoint | null;
}

export interface ShuttleReminder {
  id: string;
  shuttleId: string;
  stopId: string;
  minutesBefore: number;
  sound: ReminderSound;
  enabled: boolean;
  createdAt: number;
}

export interface NotificationItem {
  id: string;
  message: string;
  minutesAgo: number;
  type: 'arrival' | 'info' | 'warning';
  shuttleId?: string;
}

export interface StudentProfile {
  name: string;
  studentId: string;
  faculty: string;
  countryCode: string;
  phoneNumber: string;
  verified: boolean;
}

export interface ScheduleSlot {
  id: string;
  time: string;
  shuttleNumber: 1 | 2;
  route: 'Romklao 3-Stop Loop';
  period: 'Morning' | 'Midday' | 'Evening';
  departureStop: string;
  estimatedDurationMin: number;
}

export interface LiveRouteState {
  path: LatLngPoint[];
  distanceKm: number;
  durationMinutes: number;
  loading: boolean;
  error: string | null;
}

export interface ServiceHoursStatus {
  isOperating: boolean;
  bangkokHour: number;
  bangkokMinute: number;
  bangkokTimeLabel: string;
  operatingHoursLabel: string;
  nextServiceLabel: string;
}
