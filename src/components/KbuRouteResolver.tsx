import { useEffect, useRef } from 'react';
import type { CampusStop, LatLngPoint, LiveRouteState } from '../types/kbu';
import {
  DEFAULT_LOOP_KM,
  DEFAULT_LOOP_MINUTES,
  DEFAULT_ROMKLAO_LOOP_PATH,
  KBU_STOPS,
  computePathDistanceKm,
  projectStopProgressAlongPath,
} from '../utils/shuttleEngine';

interface KbuRouteResolverProps {
  onStopsResolved: (stops: CampusStop[]) => void;
  onRouteResolved: (route: LiveRouteState) => void;
}

/**
 * Resolves the exact OpenStreetMap road-snapped closed loop along KBU Romklao Campus Avenue
 * (Way 249681391 + Dormitory canal loop Way 382356626 / Way 694570517) and projects the
 * 3 Romklao stops monotonically onto the loop without external routing detours.
 */
export function KbuRouteResolver({
  onStopsResolved,
  onRouteResolved,
}: KbuRouteResolverProps) {
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;

    const validStops = KBU_STOPS.filter(
      (s): s is CampusStop & { location: LatLngPoint } => s.location !== null
    );
    if (validStops.length < 3) return;

    const pathPoints = DEFAULT_ROMKLAO_LOOP_PATH;
    const distanceKm = Number(
      Math.max(DEFAULT_LOOP_KM, computePathDistanceKm(pathPoints)).toFixed(1)
    );

    const stop2Progress = projectStopProgressAlongPath(
      pathPoints,
      validStops[1].location,
      0.12,
      0.42
    );
    const stop3Progress = projectStopProgressAlongPath(
      pathPoints,
      validStops[2].location,
      Math.min(0.45, stop2Progress + 0.08),
      0.56
    );

    onStopsResolved([
      { ...validStops[0], routeProgress: 0.02 },
      { ...validStops[1], routeProgress: stop2Progress },
      { ...validStops[2], routeProgress: stop3Progress },
    ]);

    onRouteResolved({
      path: pathPoints,
      distanceKm,
      durationMinutes: DEFAULT_LOOP_MINUTES,
      loading: false,
      error: null,
    });
  }, [onStopsResolved, onRouteResolved]);

  return null;
}
