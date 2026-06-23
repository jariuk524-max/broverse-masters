'use client';

import { useEffect, useRef } from 'react';
import { useLeads, type Lead } from '@/lib/leads-context';

const STATUS_COLORS: Record<string, string> = {
  new: '#F59E0B',
  pending: '#F59E0B',
  accepted: '#3B82F6',
  completed: '#10B981',
  cancelled: '#EF4444',
};

const center: [number, number] = [55.7558, 37.6173];

function createLeadIcon(status: string) {
  const color = STATUS_COLORS[status] || '#F59E0B';
  return `
    <div style="width:36px;height:36px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:white;box-shadow:0 2px 12px ${color}44;border:3px solid white;">!</div>
  `;
}

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const initRef = useRef(false);
  const { leads } = useLeads();

  // Init map
  useEffect(() => {
    if (!mapRef.current || initRef.current) return;
    initRef.current = true;

    import('leaflet').then((L) => {
      if (!mapRef.current || leafletMapRef.current) return;

      const map = L.map(mapRef.current!, {
        center,
        zoom: 11,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CartoDB © OSM',
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);
      leafletMapRef.current = map;

      // Add existing leads
      leads.forEach((lead) => addMarker(L, map, lead));
    });
  }, []);

  // Sync markers with leads
  useEffect(() => {
    if (!leafletMapRef.current) return;

    import('leaflet').then((L) => {
      const map = leafletMapRef.current;
      if (!map) return;

      const seenIds = new Set(leads.map((l) => l.id));
      markersRef.current.forEach((marker, id) => {
        if (!seenIds.has(id)) {
          map.removeLayer(marker);
          markersRef.current.delete(id);
        }
      });

      leads.forEach((lead) => {
        if (!markersRef.current.has(lead.id)) {
          addMarker(L, map, lead);
        }
      });
    });
  }, [leads]);

  function addMarker(L: any, map: any, lead: Lead) {
    if (!lead.lat || !lead.lng) return;

    const html = createLeadIcon(lead.status);
    const icon = L.divIcon({
      className: '',
      html,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const marker = L.marker([lead.lat, lead.lng], { icon }).addTo(map);

    const desc = lead.metadata?.description ? `<p style="font-size:12px;color:#888;margin:4px 0 0">${lead.metadata.description}</p>` : '';

    marker.bindPopup(`
      <div style="font-family:-apple-system,sans-serif;min-width:180px">
        <p style="font-weight:700;font-size:14px;margin:0 0 4px">${lead.service_name}</p>
        <p style="font-size:12px;color:#666;margin:0 0 4px">${lead.client_name || 'Клиент'} · ${lead.client_phone || ''}</p>
        <p style="font-size:12px;color:#666;margin:0 0 4px">${lead.address}</p>
        ${desc}
        <p style="font-size:11px;color:${STATUS_COLORS[lead.status] || '#F59E0B'};font-weight:600;margin:4px 0 0">${lead.status}</p>
      </div>
    `);

    markersRef.current.set(lead.id, marker);
  }

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
  );
}
