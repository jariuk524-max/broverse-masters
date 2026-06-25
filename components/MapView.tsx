'use client';

import { useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLeads, SOURCE_COLORS, type Lead } from '@/lib/leads-context';

const center: [number, number] = [55.7558, 37.6173];

const ICON_CACHE = new Map<string, L.DivIcon>();
const POPUP_CACHE = new Map<string, string>();

function getIconKey(price: number, color: string) {
  return `${price}|${color}`;
}

function getCachedIcon(price: number, color: string): L.DivIcon {
  const key = getIconKey(price, color);
  let icon = ICON_CACHE.get(key);
  if (icon) return icon;

  const formatted = price >= 1000 ? `${Math.round(price / 1000)}K` : `${price}`;
  icon = L.divIcon({
    className: '',
    html: `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
      <div style="padding:6px 10px;border-radius:20px;background:${color};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px ${color}66;border:2px solid white;">
        <span style="font-size:12px;font-weight:800;color:white;white-space:nowrap;">${formatted} ₽</span>
      </div>
      <div style="width:2px;height:6px;background:${color};opacity:0.5;"></div>
      <div style="width:6px;height:6px;border-radius:50%;background:${color};opacity:0.3;"></div>
    </div>`,
    iconSize: [60, 40],
    iconAnchor: [30, 40],
  });
  ICON_CACHE.set(key, icon);
  return icon;
}

function getCachedPopup(lead: Lead): string {
  let html = POPUP_CACHE.get(lead.id);
  if (html) return html;

  const color = SOURCE_COLORS[lead.source];
  const masterShare = Math.floor(lead.price * 0.8);
  html = `<div style="font-family:-apple-system,sans-serif;min-width:200px;padding:2px;">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
      <div style="width:28px;height:28px;border-radius:8px;background:${color};display:flex;align-items:center;justify-content:center;">
        <span style="font-size:8px;font-weight:800;color:white;">${lead.source.replace('Bro','')}</span>
      </div>
      <div>
        <div style="font-size:12px;font-weight:700;color:#1C1C1E;">${lead.domain}</div>
        <div style="font-size:9px;color:#34C759;font-weight:600;">● Новый</div>
      </div>
    </div>
    <div style="font-size:13px;font-weight:600;color:#1C1C1E;margin-bottom:2px;">${lead.title}</div>
    <div style="font-size:10px;color:#8E8E93;margin-bottom:8px;">${lead.address}</div>
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid #E5E5EA;border-bottom:1px solid #E5E5EA;margin-bottom:10px;">
      <div><div style="font-size:9px;color:#8E8E93;">Заказ</div><div style="font-size:14px;font-weight:800;color:#1C1C1E;">${lead.price.toLocaleString('ru-RU')} ₽</div></div>
      <div style="text-align:right;"><div style="font-size:9px;color:#8E8E93;">Ваше 80%</div><div style="font-size:12px;font-weight:800;color:#34C759;">${masterShare.toLocaleString('ru-RU')} ₽</div></div>
    </div>
    <div onclick="window.postMessage({type:'BROVERSE_TAKE_ORDER',leadId:'${lead.id}'},'*')" style="padding:10px;background:#1C1C1E;border-radius:12px;text-align:center;cursor:pointer;font-size:13px;font-weight:700;color:white;">Взять заказ</div>
  </div>`;
  POPUP_CACHE.set(lead.id, html);
  return html;
}

const MapView = (function MapViewInner() {
  function MapView() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const markersRef = useRef<Map<string, L.Marker>>(new Map());
    const leadsRef = useRef<Lead[]>([]);
    const activeLeadRef = useRef<Lead | null>(null);
    const { leads, activeLead, acceptLead } = useLeads();

    const leadIds = useMemo(() => leads.map((l) => l.id).join(','), [leads]);
    const activeLeadId = activeLead?.id ?? null;

    useEffect(() => {
      leadsRef.current = leads;
    }, [leads]);

    useEffect(() => {
      activeLeadRef.current = activeLead;
    }, [activeLead]);

    useEffect(() => {
      if (!mapRef.current || mapInstance.current) return;

      const map = L.map(mapRef.current, {
        center,
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
      }).addTo(map);

      mapInstance.current = map;

      return () => {
        map.remove();
        mapInstance.current = null;
      };
    }, []);

    useEffect(() => {
      const handler = (e: MessageEvent) => {
        if (e.data?.type === 'BROVERSE_TAKE_ORDER' && e.data.leadId) {
          acceptLead(e.data.leadId);
        }
      };
      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
    }, [acceptLead]);

    useEffect(() => {
      const map = mapInstance.current;
      if (!map) return;

      if (activeLead) {
        for (const [id, marker] of markersRef.current) {
          map.removeLayer(marker);
          markersRef.current.delete(id);
        }
        const color = SOURCE_COLORS[activeLead.source];
        const icon = getCachedIcon(activeLead.price, color);
        const marker = L.marker(activeLead.coords, { icon })
          .addTo(map)
          .bindPopup(getCachedPopup(activeLead), { maxWidth: 260, className: 'lead-popup' });
        markersRef.current.set(activeLead.id, marker);
        map.flyTo(activeLead.coords, 15, { duration: 0.8 });
        return;
      }

      const currentIds = new Set(leads.map((l) => l.id));

      for (const [id, marker] of markersRef.current) {
        if (!currentIds.has(id)) {
          map.removeLayer(marker);
          markersRef.current.delete(id);
        }
      }

      for (const lead of leads) {
        if (markersRef.current.has(lead.id)) continue;

        const color = SOURCE_COLORS[lead.source];
        const icon = getCachedIcon(lead.price, color);
        const marker = L.marker(lead.coords, { icon })
          .addTo(map)
          .bindPopup(getCachedPopup(lead), { maxWidth: 260, className: 'lead-popup' });

        marker.on('click', () => {
          map.flyTo(lead.coords, 15, { duration: 0.8 });
        });

        markersRef.current.set(lead.id, marker);
      }
    }, [leadIds, activeLeadId, leads, activeLead]);

    return (
      <div ref={mapRef} className="h-full w-full" />
    );
  }

  return MapView;
})();

export default MapView;
