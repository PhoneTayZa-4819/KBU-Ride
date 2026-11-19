import { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
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

// Centered on Kasem Bundit University Romklao Campus avenue (Way 249681391)
const KBU_ROMKLAO_CENTER: [number, number] = [13.8029, 100.7365];

const OSM_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildStopIcon(stopLabel: string, isSelected: boolean, compact: boolean): L.DivIcon {
  const dotClass = isSelected
    ? 'w-5 h-5 bg-white border-[4px] border-[#FF6D24] shadow-md scale-110'
    : 'w-4 h-4 bg-[#FAF7F5] border-2 border-[#6E3415] shadow-sm hover:scale-110';

  const labelHtml =
    !compact && isSelected
      ? `<span class="ml-2 px-2.5 py-1 rounded-lg bg-[#FF6D24] text-[#140E0A] text-xs font-extrabold whitespace-nowrap shadow-md">${escapeHtml(stopLabel)}</span>`
      : '';

  return L.divIcon({
    className: 'kbu-leaflet-div-icon',
    html: `<div class="relative flex items-center" style="transform: translate(-10px, -10px);">
      <span class="block rounded-full transition-transform shrink-0 ${dotClass}"></span>
      ${labelHtml}
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function buildShuttleIcon(
  shuttleNumber: 1 | 2,
  isSelected: boolean,
  isLiveActive: boolean
): L.DivIcon {
  const isShuttle1 = shuttleNumber === 1;
  const size = isShuttle1 ? 44 : 40;
  const half = size / 2;
  const shapeClass = isShuttle1 ? 'w-11 h-11 rounded-full text-lg' : 'w-10 h-10 rounded-xl text-lg';
  const colorClass = !isLiveActive
    ? 'bg-[#6E625B] text-white'
    : isShuttle1
      ? 'bg-[#FF6D24] text-[#140E0A]'
      : 'bg-[#F5C14A] text-[#140E0A]';
  const ringClass = isSelected ? 'ring-2 ring-white' : 'ring-1 ring-[#120D0A]';
  const pulseHtml =
    isSelected && isLiveActive
      ? `<span class="absolute -inset-2.5 animate-kbu-pulse ${
          isShuttle1 ? 'rounded-full bg-[#FF6D24]/35' : 'rounded-2xl bg-[#F5C14A]/35'
        }"></span>`
      : '';

  return L.divIcon({
    className: 'kbu-leaflet-div-icon',
    html: `<div data-testid="shuttle-marker-${shuttleNumber}" class="relative flex items-center justify-center cursor-pointer ${
      isLiveActive ? '' : 'opacity-75'
    }" style="width:${size}px;height:${size}px;">
      ${pulseHtml}
      <div class="relative flex items-center justify-center font-extrabold shadow-lg transition-transform hover:scale-105 ${shapeClass} ${colorClass} ${ringClass}">
        ${shuttleNumber}
      </div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [half, half],
  });
}

function buildUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: 'kbu-leaflet-div-icon',
    html: `<div class="relative flex items-center justify-center w-8 h-8">
      <span class="absolute inset-0 rounded-full bg-[#34C77B]/35 animate-kbu-pulse"></span>
      <span class="w-4 h-4 rounded-full bg-[#34C77B] border-2 border-white shadow-md"></span>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function LiveMapCanvas({
  shuttles,
  telemetries,
  stops,
  routeState,
  selectedShuttleId,
  selectedStopId,
  lang,
  isLiveActive = true,
  compact = false,
  onSelectShuttle,
  onSelectStop,
}: LiveMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const haloPolylineRef = useRef<L.Polyline | null>(null);
  const corePolylineRef = useRef<L.Polyline | null>(null);
  const stopMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const shuttleMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const lastRouteSignatureRef = useRef<string>('');

  const onSelectStopRef = useRef(onSelectStop);
  const onSelectShuttleRef = useRef(onSelectShuttle);
  onSelectStopRef.current = onSelectStop;
  onSelectShuttleRef.current = onSelectShuttle;

  const [userLocation, setUserLocation] = useState<LatLngPoint | null>(null);

  // Initialize Leaflet map with CartoDB Dark Matter tiles (no API key required)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: KBU_ROMKLAO_CENTER,
      zoom: compact ? 15 : 16,
      minZoom: 12,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer(OSM_TILE_URL, {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(map);

    map.attributionControl.setPrefix(false);
    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      haloPolylineRef.current = null;
      corePolylineRef.current = null;
      stopMarkersRef.current.clear();
      shuttleMarkersRef.current.clear();
      userMarkerRef.current = null;
      lastRouteSignatureRef.current = '';
    };
  }, [compact]);

  // Render glowing Romklao closed-loop route polyline & fit map viewport cleanly
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    haloPolylineRef.current?.remove();
    corePolylineRef.current?.remove();
    haloPolylineRef.current = null;
    corePolylineRef.current = null;

    const latLngs: [number, number][] = routeState.path.map((pt) => [pt.lat, pt.lng]);
    if (latLngs.length >= 2) {
      haloPolylineRef.current = L.polyline(latLngs, {
        color: '#FF6D24',
        weight: 11,
        opacity: 0.28,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(map);

      corePolylineRef.current = L.polyline(latLngs, {
        color: '#FF6D24',
        weight: 4.5,
        opacity: 0.95,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(map);
    }

    const fitPoints: [number, number][] =
      latLngs.length >= 2
        ? latLngs
        : stops
            .filter((s): s is CampusStop & { location: LatLngPoint } => s.location !== null)
            .map((s) => [s.location.lat, s.location.lng]);

    const signature = `${fitPoints.length}:${fitPoints[0]?.[0] ?? 0}:${fitPoints[0]?.[1] ?? 0}`;
    if (fitPoints.length >= 2 && lastRouteSignatureRef.current !== signature) {
      lastRouteSignatureRef.current = signature;
      const bounds = L.latLngBounds(fitPoints);
      const isMobileViewport = typeof window !== 'undefined' && window.innerWidth < 1024;
      const paddingTopLeft: [number, number] = compact
        ? [28, 28]
        : isMobileViewport
          ? [28, 108]
          : [48, 92];
      const paddingBottomRight: [number, number] = compact
        ? [68, 36]
        : isMobileViewport
          ? [68, 320]
          : [84, 220];

      map.fitBounds(bounds, {
        paddingTopLeft,
        paddingBottomRight,
        maxZoom: compact ? 16 : 17,
        animate: false,
      });
    }
  }, [routeState.path, stops, compact]);

  // Render & sync the 3 Romklao stop markers and address popups
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const activeIds = new Set<string>();

    for (const stop of stops) {
      if (!stop.location) continue;
      activeIds.add(stop.id);

      const isSelected = stop.id === selectedStopId;
      const stopLabel = lang === 'th' ? stop.nameTh : stop.shortLabel;
      const fullName = lang === 'th' ? stop.nameTh : stop.name;
      const icon = buildStopIcon(stopLabel, isSelected, compact);

      const popupHtml = `<div class="kbu-popup-inner">
        <p class="text-xs font-extrabold text-[#FAF7F5]">${escapeHtml(fullName)}</p>
        ${
          stop.formattedAddress
            ? `<p class="mt-1 text-[11px] text-[#BFB5AE] leading-snug">${escapeHtml(stop.formattedAddress)}</p>`
            : ''
        }
      </div>`;

      const existing = stopMarkersRef.current.get(stop.id);
      if (existing) {
        existing.setLatLng([stop.location.lat, stop.location.lng]);
        existing.setIcon(icon);
        existing.setZIndexOffset(isSelected ? 400 : 200);
        if (!compact) {
          existing.bindPopup(popupHtml, { closeButton: true, offset: [0, -8] });
        }
      } else {
        const marker = L.marker([stop.location.lat, stop.location.lng], {
          icon,
          title: fullName,
          zIndexOffset: isSelected ? 400 : 200,
        }).addTo(map);

        if (!compact) {
          marker.bindPopup(popupHtml, { closeButton: true, offset: [0, -8] });
        }

        marker.on('click', () => {
          onSelectStopRef.current(stop.id);
        });

        stopMarkersRef.current.set(stop.id, marker);
      }
    }

    for (const [id, marker] of stopMarkersRef.current.entries()) {
      if (!activeIds.has(id)) {
        marker.remove();
        stopMarkersRef.current.delete(id);
      }
    }
  }, [stops, selectedStopId, lang, compact]);

  // Render & smoothly update Shuttle 1 & Shuttle 2 markers along the Romklao loop
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const activeIds = new Set<string>();

    for (const shuttle of shuttles) {
      const tel = telemetries[shuttle.id];
      if (!tel?.position) continue;
      activeIds.add(shuttle.id);

      const isSelected = shuttle.id === selectedShuttleId;
      const markerTitle = isLiveActive
        ? `${shuttle.name} · ${tel.etaMinutes} min away`
        : `${shuttle.name} · Off hours (Next bus 07:00)`;
      const icon = buildShuttleIcon(shuttle.number, isSelected, isLiveActive);

      const existing = shuttleMarkersRef.current.get(shuttle.id);
      if (existing) {
        existing.setLatLng([tel.position.lat, tel.position.lng]);
        existing.setIcon(icon);
        existing.setZIndexOffset(isSelected ? 700 : 550);
        if (existing.getElement()) {
          existing.getElement()!.title = markerTitle;
        }
      } else {
        const marker = L.marker([tel.position.lat, tel.position.lng], {
          icon,
          title: markerTitle,
          zIndexOffset: isSelected ? 700 : 550,
        }).addTo(map);

        marker.on('click', () => {
          onSelectShuttleRef.current(shuttle.id);
        });

        shuttleMarkersRef.current.set(shuttle.id, marker);
      }
    }

    for (const [id, marker] of shuttleMarkersRef.current.entries()) {
      if (!activeIds.has(id)) {
        marker.remove();
        shuttleMarkersRef.current.delete(id);
      }
    }
  }, [shuttles, telemetries, selectedShuttleId, isLiveActive]);

  // Render opt-in student geolocation marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!userLocation) {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      return;
    }

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: buildUserLocationIcon(),
        title: 'Your location',
        zIndexOffset: 500,
      }).addTo(map);
    }
  }, [userLocation]);

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

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn();
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut();
  }, []);

  const handleRecenter = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const activeTel = telemetries[selectedShuttleId];
    if (activeTel?.position) {
      map.flyTo([activeTel.position.lat, activeTel.position.lng], 16, { duration: 0.6 });
    } else if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 16, { duration: 0.6 });
    } else {
      const firstLoc = stops.find((s) => s.location)?.location;
      if (firstLoc) {
        map.flyTo([firstLoc.lat, firstLoc.lng], 16, { duration: 0.6 });
      }
    }
    handleRequestUserLocation();
  }, [telemetries, selectedShuttleId, userLocation, stops, handleRequestUserLocation]);

  return (
    <div
      data-testid="live-shuttle-map"
      className={`relative w-full overflow-hidden bg-[#110C09] ${
        compact
          ? 'h-[320px] rounded-3xl border border-[#E5DBD3] dark:border-[#2C231E]'
          : 'h-full min-h-[560px]'
      }`}
    >
      {/* Isolated Leaflet Canvas keeps Leaflet's internal z-indexes beneath app overlays */}
      <div
        ref={containerRef}
        className="relative isolate z-0 w-full h-full"
        aria-label="KBU Live Campus Map powered by OpenStreetMap"
      />

      {/* Right-Side Map Controls matching Image 07 (Recenter, Zoom In, Zoom Out) */}
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
    </div>
  );
}
