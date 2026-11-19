import { useCallback, useEffect, useRef, useState } from 'react';
import {
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  useApiIsLoaded,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { LocateFixed, Minus, Plus } from 'lucide-react';
import type {
  CampusStop,
  LanguageCode,
  LatLngPoint,
  LiveRouteState,
  ShuttleState,
  ShuttleTelemetry,
} from '../types/kbu';

interface LiveMapCanvasProps {
  shuttles: ShuttleState[];
  telemetries: Record<string, ShuttleTelemetry>;
  stops: CampusStop[];
  routeState: LiveRouteState;
  selectedShuttleId: string;
  selectedStopId: string;
  lang: LanguageCode;
  isDark: boolean;
  isLiveActive?: boolean;
  compact?: boolean;
  onSelectShuttle: (shuttleId: string) => void;
  onSelectStop: (stopId: string) => void;
}

// Generic Thailand metro viewport center before real KBU Places coordinates resolve
const INITIAL_FALLBACK_CENTER: LatLngPoint = { lat: 13.75, lng: 100.65 };

interface RoutePolylineLayerProps {
  path: LatLngPoint[];
}

function RoutePolylineLayer({ path }: RoutePolylineLayerProps) {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const haloRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !mapsLib || path.length < 2) return;

    haloRef.current?.setMap(null);
    polylineRef.current?.setMap(null);

    const halo = new mapsLib.Polyline({
      path,
      geodesic: true,
      strokeColor: '#FF6D24',
      strokeOpacity: 0.25,
      strokeWeight: 11,
      zIndex: 1,
      map,
    });

    const line = new mapsLib.Polyline({
      path,
      geodesic: true,
      strokeColor: '#D95D1E',
      strokeOpacity: 0.95,
      strokeWeight: 5,
      zIndex: 2,
      map,
    });

    haloRef.current = halo;
    polylineRef.current = line;

    return () => {
      halo.setMap(null);
      line.setMap(null);
    };
  }, [map, mapsLib, path]);

  return null;
}

interface MapCameraControllerProps {
  stops: CampusStop[];
  routePath: LatLngPoint[];
  selectedShuttleId: string;
  telemetries: Record<string, ShuttleTelemetry>;
  compact: boolean;
  userLocation: LatLngPoint | null;
  onRequestUserLocation: () => void;
}

function MapCameraController({
  stops,
  routePath,
  selectedShuttleId,
  telemetries,
  compact,
  userLocation,
  onRequestUserLocation,
}: MapCameraControllerProps) {
  const map = useMap();
  const coreLib = useMapsLibrary('core');
  const hasFittedRef = useRef(false);

  // Fit bounds smoothly once real Google Maps campus stops or route polyline load
  useEffect(() => {
    if (!map || !coreLib || hasFittedRef.current) return;
    const points = routePath.length >= 2
      ? routePath
      : stops.map((s) => s.location).filter((loc): loc is LatLngPoint => loc !== null);

    if (points.length === 0) return;

    const bounds = new coreLib.LatLngBounds();
    points.forEach((pt) => bounds.extend(pt));
    const isMobileViewport = typeof window !== 'undefined' && window.innerWidth < 1024;
    const padding: google.maps.Padding = compact
      ? { top: 28, right: 68, bottom: 36, left: 28 }
      : isMobileViewport
        ? { top: 96, right: 68, bottom: 320, left: 28 }
        : { top: 88, right: 84, bottom: 220, left: 48 };
    map.fitBounds(bounds, padding);
    hasFittedRef.current = true;
  }, [map, coreLib, routePath, stops, compact]);

  const handleZoomIn = useCallback(() => {
    if (!map) return;
    const current = map.getZoom() ?? 13;
    map.setZoom(Math.min(19, current + 1));
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (!map) return;
    const current = map.getZoom() ?? 13;
    map.setZoom(Math.max(10, current - 1));
  }, [map]);

  const handleRecenter = useCallback(() => {
    if (!map) return;
    const activeTel = telemetries[selectedShuttleId];
    if (activeTel?.position) {
      map.panTo(activeTel.position);
      map.setZoom(14);
    } else if (userLocation) {
      map.panTo(userLocation);
      map.setZoom(14);
    } else {
      const firstLoc = stops.find((s) => s.location)?.location;
      if (firstLoc) {
        map.panTo(firstLoc);
        map.setZoom(13);
      }
    }
    onRequestUserLocation();
  }, [map, telemetries, selectedShuttleId, userLocation, stops, onRequestUserLocation]);

  return (
    <div
      className={`absolute right-4 z-20 flex flex-col gap-2.5 ${
        compact ? 'top-1/2 -translate-y-1/2' : 'top-24 sm:top-28 lg:top-1/2 lg:-translate-y-1/2'
      }`}
    >
      <button
        type="button"
        onClick={handleRecenter}
        aria-label="Center map on selected shuttle"
        title="Center on shuttle & locate me"
        className="w-11 h-11 rounded-2xl bg-white/95 dark:bg-[#1C1511]/95 border border-[#DDD2C9] dark:border-[#3A2E27] text-[#1A120E] dark:text-white flex items-center justify-center hover:border-[#FF6D24] transition-colors cursor-pointer shadow-md"
      >
        <LocateFixed className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={handleZoomIn}
        aria-label="Zoom in map"
        title="Zoom in"
        className="w-11 h-11 rounded-2xl bg-white/95 dark:bg-[#1C1511]/95 border border-[#DDD2C9] dark:border-[#3A2E27] text-[#1A120E] dark:text-white flex items-center justify-center hover:border-[#FF6D24] transition-colors cursor-pointer shadow-md"
      >
        <Plus className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={handleZoomOut}
        aria-label="Zoom out map"
        title="Zoom out"
        className="w-11 h-11 rounded-2xl bg-white/95 dark:bg-[#1C1511]/95 border border-[#DDD2C9] dark:border-[#3A2E27] text-[#1A120E] dark:text-white flex items-center justify-center hover:border-[#FF6D24] transition-colors cursor-pointer shadow-md"
      >
        <Minus className="w-5 h-5" />
      </button>
    </div>
  );
}

export function LiveMapCanvas({
  shuttles,
  telemetries,
  stops,
  routeState,
  selectedShuttleId,
  selectedStopId,
  lang,
  isDark,
  isLiveActive = true,
  compact = false,
  onSelectShuttle,
  onSelectStop,
}: LiveMapCanvasProps) {
  const isLoaded = useApiIsLoaded();
  const apiStatus = useApiLoadingStatus();
  const [infoStopId, setInfoStopId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LatLngPoint | null>(null);

  const handleRequestUserLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        // User declined or geolocation unavailable; keep functioning cleanly
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
    );
  }, []);

  const infoStop = infoStopId ? stops.find((s) => s.id === infoStopId) : null;
  const hasApiFailure =
    apiStatus === APILoadingStatus.FAILED || apiStatus === APILoadingStatus.AUTH_FAILURE;

  return (
    <div
      data-testid="live-shuttle-map"
      className={`relative w-full overflow-hidden bg-[#F3ECE6] dark:bg-[#110C09] ${
        compact
          ? 'h-[320px] rounded-3xl border border-[#E5DBD3] dark:border-[#2C231E]'
          : 'h-full min-h-[560px]'
      }`}
    >
      {hasApiFailure ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
          <p className="text-sm font-bold text-[#1A120E] dark:text-white">
            Unable to load Google Maps right now
          </p>
          <p className="mt-1.5 text-xs text-[#766962] dark:text-[#A69B94] max-w-xs">
            Please verify your network connection or Google Maps API configuration.
          </p>
        </div>
      ) : (
        <GoogleMap
          id={compact ? 'kbu-preview-map' : 'kbu-live-map'}
          mapId="DEMO_MAP_ID"
          defaultCenter={INITIAL_FALLBACK_CENTER}
          defaultZoom={12}
          gestureHandling="greedy"
          disableDefaultUI={true}
          colorScheme={isDark ? 'DARK' : 'LIGHT'}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Real Google Maps Driving Route Polyline */}
          <RoutePolylineLayer path={routeState.path} />

          {/* Camera bounds fitting & custom right-side controls matching Image 07 */}
          <MapCameraController
            stops={stops}
            routePath={routeState.path}
            selectedShuttleId={selectedShuttleId}
            telemetries={telemetries}
            compact={compact}
            userLocation={userLocation}
            onRequestUserLocation={handleRequestUserLocation}
          />

          {/* Campus Stop Markers (white dots with orange active ring, matching Image 07) */}
          {stops.map((stop) => {
            if (!stop.location) return null;
            const isSelected = stop.id === selectedStopId;
            const stopLabel = lang === 'th' ? stop.nameTh : stop.shortLabel;

            return (
              <AdvancedMarker
                key={stop.id}
                position={stop.location}
                title={stop.name}
                zIndex={isSelected ? 20 : 10}
                onClick={() => {
                  onSelectStop(stop.id);
                  if (!compact) setInfoStopId(stop.id);
                }}
              >
                <div className="relative flex items-center">
                  <span
                    className={`block rounded-full transition-transform ${
                      isSelected
                        ? 'w-5 h-5 bg-white border-[4px] border-[#FF6D24] shadow-md scale-110'
                        : 'w-4 h-4 bg-[#FAF7F5] border-2 border-[#6E3415] shadow-sm hover:scale-110'
                    }`}
                  />
                  {!compact && isSelected && (
                    <span className="ml-2 px-2.5 py-1 rounded-lg bg-[#FF6D24] text-[#140E0A] text-xs font-extrabold whitespace-nowrap shadow-md">
                      {stopLabel}
                    </span>
                  )}
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Stop InfoWindow displaying Google Maps formatted address */}
          {!compact && infoStop?.location && (
            <InfoWindow
              position={infoStop.location}
              onCloseClick={() => setInfoStopId(null)}
            >
              <div className="p-1 max-w-[220px] text-[#1A120E]">
                <p className="text-xs font-extrabold">
                  {lang === 'th' ? infoStop.nameTh : infoStop.name}
                </p>
                {infoStop.formattedAddress && (
                  <p className="mt-1 text-[11px] text-[#5C4F48] leading-snug">
                    {infoStop.formattedAddress}
                  </p>
                )}
              </div>
            </InfoWindow>
          )}

          {/* Opt-In Real Student Location Green Pulsing Dot matching Image 07 */}
          {userLocation && (
            <AdvancedMarker position={userLocation} title="Your location" zIndex={25}>
              <div className="relative flex items-center justify-center w-8 h-8">
                <span className="absolute inset-0 rounded-full bg-[#34C77B]/35 animate-kbu-pulse" />
                <span className="w-4 h-4 rounded-full bg-[#34C77B] border-2 border-white shadow-md" />
              </div>
            </AdvancedMarker>
          )}

          {/* Real-Time Moving Shuttle Markers (1 = Orange Circle, 2 = Amber Square) */}
          {shuttles.map((shuttle) => {
            const tel = telemetries[shuttle.id];
            if (!tel?.position) return null;
            const isSelected = shuttle.id === selectedShuttleId;
            const isShuttle1 = shuttle.number === 1;
            const markerTitle = isLiveActive
              ? `${shuttle.name} · ${tel.etaMinutes} min away`
              : `${shuttle.name} · Off hours (Next bus 07:00)`;

            return (
              <AdvancedMarker
                key={shuttle.id}
                position={tel.position}
                title={markerTitle}
                zIndex={isSelected ? 40 : 30}
                onClick={() => onSelectShuttle(shuttle.id)}
              >
                <div
                  data-testid={`shuttle-marker-${shuttle.number}`}
                  className={`relative flex items-center justify-center cursor-pointer ${
                    isLiveActive ? '' : 'opacity-75'
                  }`}
                >
                  {isSelected && isLiveActive && (
                    <span
                      className={`absolute -inset-2.5 animate-kbu-pulse ${
                        isShuttle1
                          ? 'rounded-full bg-[#FF6D24]/30'
                          : 'rounded-2xl bg-[#F5C14A]/30'
                      }`}
                    />
                  )}
                  <div
                    className={`relative flex items-center justify-center font-extrabold shadow-lg transition-transform hover:scale-105 ${
                      isShuttle1
                        ? 'w-11 h-11 rounded-full text-lg'
                        : 'w-10 h-10 rounded-xl text-lg'
                    } ${
                      !isLiveActive
                        ? 'bg-[#6E625B] text-white'
                        : isShuttle1
                          ? 'bg-[#FF6D24] text-[#140E0A]'
                          : 'bg-[#F5C14A] text-[#140E0A]'
                    } ${isSelected ? 'ring-2 ring-white' : 'ring-1 ring-[#120D0A]'}`}
                  >
                    {shuttle.number}
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}
        </GoogleMap>
      )}

      {/* Subtle Loading Overlay while Google Maps JS SDK / Routes initialize */}
      {(!isLoaded || routeState.loading) && !hasApiFailure && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center z-20">
          <span className="px-3.5 py-1.5 rounded-full bg-[#1A1411]/90 text-xs font-semibold text-[#FAF7F5] border border-[#352B25] shadow-md">
            Loading live Google Maps campus corridor…
          </span>
        </div>
      )}
    </div>
  );
}
