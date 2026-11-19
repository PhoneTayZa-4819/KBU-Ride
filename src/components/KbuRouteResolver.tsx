import { useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import type { CampusStop, LatLngPoint, LiveRouteState } from '../types/kbu';
import {
  DEFAULT_LOOP_KM,
  DEFAULT_LOOP_MINUTES,
  KBU_STOPS,
  computeHaversineKm,
  computePathDistanceKm,
  projectStopProgressAlongPath,
} from '../utils/shuttleEngine';

interface KbuRouteResolverProps {
  onStopsResolved: (stops: CampusStop[]) => void;
  onRouteResolved: (route: LiveRouteState) => void;
}

const MAX_LOCAL_STOP_DISTANCE_KM = 6.5;

function isQuotaError(err: unknown): boolean {
  const text = String(err ?? '');
  return (
    text.includes('OVER_QUERY_LIMIT') ||
    text.includes('RESOURCE_EXHAUSTED') ||
    text.includes('QuotaExceeded') ||
    text.includes('429')
  );
}

/**
 * Resolves the 3 real-world Romklao shuttle stops dynamically via Google Maps Places API (New)
 * using two-stage proximity biasing anchored on Kasem Bundit University Romklao Campus,
 * then computes a continuous closed driving loop via Routes API (Route.computeRoutes).
 */
export function KbuRouteResolver({
  onStopsResolved,
  onRouteResolved,
}: KbuRouteResolverProps) {
  const placesLib = useMapsLibrary('places');
  const routesLib = useMapsLibrary('routes');
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (!placesLib || !routesLib || resolvedRef.current) return;
    resolvedRef.current = true;

    let cancelled = false;

    const searchPlace = async (
      textQuery: string,
      anchorLocation?: LatLngPoint | null,
      radiusMeters: number = 3500
    ): Promise<{
      placeId?: string;
      formattedAddress?: string;
      location: LatLngPoint;
    } | null> => {
      try {
        const request: google.maps.places.SearchByTextRequest = {
          textQuery,
          fields: ['id', 'displayName', 'formattedAddress', 'location'],
          maxResultCount: 3,
          region: 'TH',
          ...(anchorLocation
            ? {
                locationBias: {
                  center: anchorLocation,
                  radius: radiusMeters,
                },
              }
            : {}),
        };

        const { places } = await placesLib.Place.searchByText(request);
        if (!places || places.length === 0) return null;

        // If anchored on Romklao Campus, pick the closest match within local Romklao radius
        if (anchorLocation) {
          let closestMatch: {
            placeId?: string;
            formattedAddress?: string;
            location: LatLngPoint;
            distKm: number;
          } | null = null;

          for (const candidate of places) {
            if (!candidate.location) continue;
            const loc: LatLngPoint = {
              lat: candidate.location.lat(),
              lng: candidate.location.lng(),
            };
            const distKm = computeHaversineKm(anchorLocation, loc);
            if (!closestMatch || distKm < closestMatch.distKm) {
              closestMatch = {
                placeId: candidate.id ?? undefined,
                formattedAddress: candidate.formattedAddress ?? undefined,
                location: loc,
                distKm,
              };
            }
          }

          if (closestMatch && closestMatch.distKm <= MAX_LOCAL_STOP_DISTANCE_KM) {
            return {
              placeId: closestMatch.placeId,
              formattedAddress: closestMatch.formattedAddress,
              location: closestMatch.location,
            };
          }
          return null;
        }

        const first = places[0];
        if (!first?.location) return null;
        return {
          placeId: first.id ?? undefined,
          formattedAddress: first.formattedAddress ?? undefined,
          location: {
            lat: first.location.lat(),
            lng: first.location.lng(),
          },
        };
      } catch (err) {
        if (isQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        console.error(`Place lookup failed for "${textQuery}":`, err);
        return null;
      }
    };

    const resolveRomklaoLoop = async () => {
      onRouteResolved({
        path: [],
        distanceKm: DEFAULT_LOOP_KM,
        durationMinutes: DEFAULT_LOOP_MINUTES,
        loading: true,
        error: null,
      });

      try {
        // Stage 1: Resolve anchor stop (Kasem Bundit University Romklao Campus) first
        const campusTemplate = KBU_STOPS[2];
        const campusMatch = await searchPlace(campusTemplate.placeQuery);
        if (cancelled) return;

        const campusLocation = campusMatch?.location ?? null;

        // Stage 2: Resolve Dormitory and ข้าวซอยเงินล้าน tightly biased to Romklao Campus
        const resolveLocalStop = async (stop: CampusStop): Promise<CampusStop> => {
          const primary = await searchPlace(stop.placeQuery, campusLocation, 3000);
          if (primary) {
            return {
              ...stop,
              placeId: primary.placeId,
              formattedAddress: primary.formattedAddress,
              location: primary.location,
            };
          }

          if (stop.fallbackQuery) {
            const fallback = await searchPlace(stop.fallbackQuery, campusLocation, 3500);
            if (fallback) {
              return {
                ...stop,
                placeId: fallback.placeId,
                formattedAddress: fallback.formattedAddress,
                location: fallback.location,
              };
            }
          }

          return stop;
        };

        const [resolvedDorm, resolvedKhaoSoi] = await Promise.all([
          resolveLocalStop(KBU_STOPS[0]),
          resolveLocalStop(KBU_STOPS[1]),
        ]);

        if (cancelled) return;

        const resolvedCampus: CampusStop = campusMatch
          ? {
              ...campusTemplate,
              placeId: campusMatch.placeId,
              formattedAddress: campusMatch.formattedAddress,
              location: campusMatch.location,
            }
          : campusTemplate;

        const resolvedStops: CampusStop[] = [resolvedDorm, resolvedKhaoSoi, resolvedCampus];
        const validStops = resolvedStops.filter((s) => s.location !== null);
        onStopsResolved(resolvedStops);

        if (validStops.length < 2) {
          onRouteResolved({
            path: validStops.map((s) => s.location!).filter(Boolean),
            distanceKm: DEFAULT_LOOP_KM,
            durationMinutes: DEFAULT_LOOP_MINUTES,
            loading: false,
            error: 'Unable to resolve Romklao shuttle stops. Please check map connectivity.',
          });
          return;
        }

        // Stage 3: Compute true closed-loop driving route via Routes API (Dorm -> ข้าวซอยเงินล้าน -> Campus -> Dorm)
        const originStop = validStops[0];
        const intermediateStops = validStops.slice(1);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const RouteClass = (routesLib as any).Route;
        if (RouteClass && typeof RouteClass.computeRoutes === 'function') {
          try {
            const request: Record<string, unknown> = {
              origin: originStop.location,
              destination: originStop.location,
              intermediates: intermediateStops.map((s) => s.location),
              travelMode: 'DRIVING',
              fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
            };

            const result = await RouteClass.computeRoutes(request);
            if (cancelled) return;

            const primaryRoute = result?.routes?.[0];
            const rawPath: google.maps.LatLng[] = primaryRoute?.path ?? [];

            if (rawPath.length >= 2) {
              const pathPoints: LatLngPoint[] = rawPath.map((pt) => ({
                lat: typeof pt.lat === 'function' ? pt.lat() : Number(pt.lat),
                lng: typeof pt.lng === 'function' ? pt.lng() : Number(pt.lng),
              }));

              const distanceKm = primaryRoute.distanceMeters
                ? Number((primaryRoute.distanceMeters / 1000).toFixed(1))
                : Number(computePathDistanceKm(pathPoints).toFixed(1));
              const durationMinutes = primaryRoute.durationMillis
                ? Math.max(8, Math.round(primaryRoute.durationMillis / 60000))
                : DEFAULT_LOOP_MINUTES;

              // Project each stop onto monotonic windows along the closed loop
              const stop2Progress = resolvedStops[1].location
                ? projectStopProgressAlongPath(pathPoints, resolvedStops[1].location, 0.08, 0.62)
                : 0.36;
              const stop3Progress = resolvedStops[2].location
                ? projectStopProgressAlongPath(
                    pathPoints,
                    resolvedStops[2].location,
                    Math.min(0.85, stop2Progress + 0.08),
                    0.92
                  )
                : 0.68;

              const stopsWithProgress: CampusStop[] = [
                { ...resolvedStops[0], routeProgress: 0.02 },
                { ...resolvedStops[1], routeProgress: stop2Progress },
                { ...resolvedStops[2], routeProgress: stop3Progress },
              ];

              onStopsResolved(stopsWithProgress);
              onRouteResolved({
                path: pathPoints,
                distanceKm,
                durationMinutes,
                loading: false,
                error: null,
              });
              return;
            }
          } catch (err) {
            if (isQuotaError(err)) {
              window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
            }
            console.error('Routes API closed-loop fallback:', err);
          }
        }

        // Graceful fallback connecting resolved Places coordinates in a closed loop
        const directLoop = [...validStops.map((s) => s.location!), validStops[0].location!];
        onRouteResolved({
          path: directLoop,
          distanceKm: Number(Math.max(DEFAULT_LOOP_KM, computePathDistanceKm(directLoop)).toFixed(1)),
          durationMinutes: DEFAULT_LOOP_MINUTES,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (isQuotaError(err)) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        if (!cancelled) {
          onRouteResolved({
            path: [],
            distanceKm: DEFAULT_LOOP_KM,
            durationMinutes: DEFAULT_LOOP_MINUTES,
            loading: false,
            error: 'Unable to load route data. Please check your network or API quota.',
          });
        }
      }
    };

    void resolveRomklaoLoop();

    return () => {
      cancelled = true;
    };
  }, [placesLib, routesLib, onStopsResolved, onRouteResolved]);

  return null;
}
