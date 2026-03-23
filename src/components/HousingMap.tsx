'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PG {
  id: string;
  name: string;
  type: 'pg' | 'flat' | 'hostel';
  area: string;
  price: number;
  beds: number;
  verified: boolean;
  genderPreference?: string;
  furnishing?: string;
  latitude: number;
  longitude: number;
}

const typeColors: Record<string, string> = {
  pg: '#f97316',
  flat: '#3b82f6',
  hostel: '#a855f7',
};

function createColoredIcon(type: string, verified: boolean) {
  const color = typeColors[type] || '#6b7280';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
      </filter>
      <path d="M16 0C8.268 0 2 6.268 2 14c0 10.5 14 26 14 26S30 24.5 30 14C30 6.268 23.732 0 16 0z" fill="${color}" filter="url(#shadow)"/>
      <circle cx="16" cy="14" r="7" fill="white" opacity="0.95"/>
      ${verified ? `<path d="M12 14 L15 17 L20 11" stroke="${color}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : `<circle cx="16" cy="14" r="3" fill="${color}"/>`}
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

function createPickerIcon() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C8.268 0 2 6.268 2 14c0 10.5 14 26 14 26S30 24.5 30 14C30 6.268 23.732 0 16 0z" fill="#22c55e"/>
      <circle cx="16" cy="14" r="7" fill="white" opacity="0.95"/>
      <path d="M16 9 v10 M11 14 h10" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
}

interface HousingMapProps {
  listings: PG[];
  onMapClick?: (lat: number, lng: number) => void;
  pickedLocation?: { lat: number; lng: number } | null;
  selectedPGId?: string | null;
  onMarkerClick?: (pg: PG) => void;
}

export default function HousingMap({
  listings,
  onMapClick,
  pickedLocation,
  selectedPGId,
  onMarkerClick,
}: HousingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([12.9716, 77.5946], 12);

    // Light map tiles (CartoDB Positron)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      maxZoom: 19,
    }).addTo(mapRef.current);

    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update click handler when onMapClick changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.off('click');
    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });
  }, [onMapClick]);

  // Manage listing markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove stale markers
    const listingIds = new Set(listings.map((l) => l.id));
    markersRef.current.forEach((marker, id) => {
      if (!listingIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add/update markers
    listings.forEach((listing) => {
      if (markersRef.current.has(listing.id)) return;

      const marker = L.marker([listing.latitude, listing.longitude], {
        icon: createColoredIcon(listing.type, listing.verified),
      });

      const typeLabel = listing.type.charAt(0).toUpperCase() + listing.type.slice(1);
      const genderLabel = listing.genderPreference === 'any' ? 'Any' : listing.genderPreference === 'male' ? '♂ Male' : '♀ Female';

      marker.bindPopup(
        `<div style="font-family:sans-serif;min-width:160px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${listing.name}</div>
          <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">📍 ${listing.area}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;">
            <span style="background:#1e293b;color:#94a3b8;padding:2px 6px;border-radius:4px;font-size:11px;">${typeLabel}</span>
            <span style="background:#1e293b;color:#94a3b8;padding:2px 6px;border-radius:4px;font-size:11px;">${listing.beds} bed${listing.beds > 1 ? 's' : ''}</span>
            <span style="background:#1e293b;color:#94a3b8;padding:2px 6px;border-radius:4px;font-size:11px;">${genderLabel}</span>
          </div>
          <div style="font-weight:700;font-size:15px;color:#f97316;">₹${listing.price.toLocaleString()}<span style="font-size:11px;font-weight:400;color:#9ca3af;">/mo</span></div>
          ${listing.verified ? '<div style="color:#22c55e;font-size:11px;margin-top:4px;">✓ Verified</div>' : ''}
        </div>`,
        { maxWidth: 220 }
      );

      marker.on('click', () => {
        if (onMarkerClick) onMarkerClick(listing);
      });

      marker.addTo(mapRef.current!);
      markersRef.current.set(listing.id, marker);
    });

    // Fit bounds
    if (listings.length > 0) {
      const bounds = L.latLngBounds(listings.map((l) => [l.latitude, l.longitude] as L.LatLngExpression));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [listings, onMarkerClick]);

  // Fly to selected PG
  useEffect(() => {
    if (!mapRef.current || !selectedPGId) return;
    const pg = listings.find((l) => l.id === selectedPGId);
    if (pg) {
      mapRef.current.flyTo([pg.latitude, pg.longitude], 15, { animate: true, duration: 1.2 });
      markersRef.current.get(pg.id)?.openPopup();
    }
  }, [selectedPGId, listings]);

  // Manage picker marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (pickedLocation) {
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng([pickedLocation.lat, pickedLocation.lng]);
      } else {
        pickerMarkerRef.current = L.marker([pickedLocation.lat, pickedLocation.lng], {
          icon: createPickerIcon(),
        })
          .bindPopup('<div style="font-size:12px;font-weight:600;">📌 Selected location</div>')
          .addTo(mapRef.current);
        pickerMarkerRef.current.openPopup();
      }
      mapRef.current.panTo([pickedLocation.lat, pickedLocation.lng]);
    } else {
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.remove();
        pickerMarkerRef.current = null;
      }
    }
  }, [pickedLocation]);

  return (
    <div style={{ isolation: 'isolate', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', cursor: onMapClick ? 'crosshair' : 'grab' }}
      />
    </div>
  );
}
