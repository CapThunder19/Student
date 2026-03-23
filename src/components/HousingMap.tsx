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
  latitude: number;
  longitude: number;
}

// Fix for Leaflet marker icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.setIcon(DefaultIcon);

interface HousingMapProps {
  listings: PG[];
}

export default function HousingMap({ listings }: HousingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView([12.9716, 77.5946], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        className: 'map-tiles',
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    listings.forEach(listing => {
      const marker = L.marker([listing.latitude, listing.longitude], { icon: DefaultIcon })
        .bindPopup(`
          <div class="p-2">
            <h3 class="font-bold text-sm">${listing.name}</h3>
            <p class="text-xs text-gray-600">${listing.area}</p>
            <p class="font-semibold text-sm">₹${listing.price}/month</p>
          </div>
        `)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });

    // Fit bounds if there are listings
    if (listings.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(
        listings.map(l => [l.latitude, l.longitude] as L.LatLngExpression)
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [listings]);

  return (
    <div ref={containerRef} className="w-full h-full" />
  );
}
