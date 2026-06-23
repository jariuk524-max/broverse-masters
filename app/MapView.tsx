'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Order = {
  id: number;
  coords: [number, number];
  status: 'success' | 'error';
  price: number;
  title: string;
  address: string;
};

const PROFIT_RATE = 0.8;

function makeIcon(color: string) {
  return L.divIcon({
    className: '',
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -36],
    html: `<div style="position:relative;width:28px;height:40px;">
      <svg viewBox="0 0 28 40" width="28" height="40"><path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.27 21.73 0 14 0z" fill="${color}"/><circle cx="14" cy="13" r="5" fill="white" opacity="0.9"/></svg>
    </div>`,
  });
}

const greenIcon = makeIcon('#10b981');
const redIcon = makeIcon('#ef4444');

interface MapViewProps {
  center: [number, number];
  zoom: number;
  orders: Order[];
  selectedId: number | null;
  onSelect: (order: Order | null) => void;
}

export default function MapView({ center, zoom, orders, selectedId, onSelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center,
      zoom,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    orders.forEach((order) => {
      const icon = order.status === 'success' ? greenIcon : redIcon;
      const marker = L.marker(order.coords, { icon }).addTo(map);

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelect(null);
      });

      markersRef.current.set(order.id, marker);
    });
  }, [orders, onSelect]);

  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const order = orders.find((o) => o.id === id);
      if (!order) return;

      if (id === selectedId) {
        const popupContent = `
          <div style="width:224px;border-radius:16px;border:1px solid #27272a;background:#18181b;padding:16px;box-shadow:0 25px 50px -12px rgba(0,0,0,.5);font-family:system-ui,-apple-system,sans-serif;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
              <span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#71717a;">#${order.id}</span>
              <button onclick="document.querySelector('.leaflet-popup-close-button')?.click()" style="background:none;border:none;cursor:pointer;padding:4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#fafafa;line-height:1.3;">${order.title}</p>
            <p style="margin:0 0 8px;font-size:11px;color:#71717a;">${order.address}</p>
            <div style="border-top:1px solid #27272a;padding-top:12px;">
              <p style="margin:0;font-size:18px;font-weight:900;color:#fafafa;">${order.price.toLocaleString('ru-RU')} ₽</p>
              <p style="margin:4px 0 0;font-size:11px;font-weight:700;color:#34d399;">
                Мастеру (80%): ${Math.round(order.price * PROFIT_RATE).toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent, { closeButton: false, className: '' }).openPopup();
      } else {
        marker.closePopup();
        marker.unbindPopup();
      }
    });
  }, [selectedId, orders]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    map.on('click', () => onSelect(null));
  }, [onSelect]);

  return (
    <div ref={mapRef} className="h-full w-full" />
  );
}
