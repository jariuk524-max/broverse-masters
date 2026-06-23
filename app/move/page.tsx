'use client';

import { useState } from 'react';
import ServiceHeader from '@/components/ServiceHeader';
import ServiceHero from '@/components/ServiceHero';
import ServiceFooter from '@/components/ServiceFooter';
import GlassCard from '@/components/GlassCard';
import SmartOrderForm from '@/components/SmartOrderForm';
import { BroVerseConfig } from '@/config/ecosystem';
import { MapPin, ArrowRight, Weight, Users, Shield, Clock } from 'lucide-react';

const config = BroVerseConfig.move;

const VEHICLES = [
  { id: 'gazelle', name: 'Газель', cap: '1.5 т', icon: '🚛', price: 2500, movers: 2 },
  { id: 'gazelle_far', name: 'Фургон', cap: '2 т', icon: '🚛', price: 3500, movers: 2 },
  { id: 'kamaz', name: 'КАМАЗ', cap: '5 т', icon: '🚚', price: 6000, movers: 4 },
  { id: 'manipulator', name: 'Манипулятор', cap: '3 т', icon: '🏗️', price: 5000, movers: 2 },
];

function VehicleSelector({ onPriceChange }: { onPriceChange: (price: number) => void }) {
  const [selected, setSelected] = useState('gazelle');
  const selectVehicle = (id: string) => {
    setSelected(id);
    const v = VEHICLES.find((x) => x.id === id);
    if (v) onPriceChange(v.price);
  };
  return (
    <GlassCard glow="#A0522D" className="mx-4">
      <div className="p-5">
        <h3 className="text-sm font-bold text-white mb-1">Какой транспорт нужен?</h3>
        <p className="text-[10px] text-white/40 mb-4">Подберём машину под объём вещей</p>
        <div className="space-y-2">
          {VEHICLES.map((v) => (
            <button key={v.id} type="button" onClick={() => selectVehicle(v.id)}
              className={`w-full text-left p-3 rounded-[20px] border transition-all flex items-center gap-3 ${selected === v.id ? 'bg-white/15 border-white/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
              <span className="text-2xl">{v.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{v.name}</span>
                  <span className="text-xs font-black text-[#A0522D]">{v.price.toLocaleString()} ₽</span>
                </div>
                <div className="flex gap-3 mt-1">
                  <span className="text-[9px] text-white/40 flex items-center gap-0.5"><Weight size={8} />{v.cap}</span>
                  <span className="text-[9px] text-white/40 flex items-center gap-0.5"><Users size={8} />{v.movers} грузчика</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function RouteCalculator() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  return (
    <GlassCard glow="#A0522D" className="mx-4">
      <div className="p-5">
        <h3 className="text-sm font-bold text-white mb-1">Откуда — Куда?</h3>
        <p className="text-[10px] text-white/40 mb-4">Рассчитаем стоимость по маршруту</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20"><MapPin size={12} className="text-emerald-400" /></div>
            <input type="text" placeholder="Откуда" value={from} onChange={(e) => setFrom(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-[14px] px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500/20"><MapPin size={12} className="text-red-400" /></div>
            <input type="text" placeholder="Куда" value={to} onChange={(e) => setTo(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-[14px] px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none" />
          </div>
        </div>
        <button type="button" className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-[16px] bg-white text-black text-xs font-bold">Посчитать стоимость <ArrowRight size={12} /></button>
      </div>
    </GlassCard>
  );
}

function TrustStats() {
  return (
    <div className="px-4 grid grid-cols-3 gap-2">
      {[{ icon: <Shield size={18} />, label: 'Гарантия', sub: 'Ничего не разобьём' }, { icon: <Clock size={18} />, label: 'Выезд', sub: 'Приедем сегодня' }, { icon: <MapPin size={18} />, label: '450+ т', sub: 'перевезли в месяце' }].map((b) => (
        <GlassCard key={b.label} glow="#A0522D"><div className="flex flex-col items-center gap-2 p-4 text-center"><span className="text-[#A0522D]">{b.icon}</span><span className="text-[11px] font-bold text-white">{b.label}</span><span className="text-[9px] text-white/40 leading-tight">{b.sub}</span></div></GlassCard>
      ))}
    </div>
  );
}

export default function MovePage() {
  const [orderOpen, setOrderOpen] = useState(false);
  const [vehiclePrice, setVehiclePrice] = useState(2500);

  return (
    <div className="min-h-[100dvh]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
      <div className="fixed inset-0 -z-10 bg-black" />
      <div className="fixed inset-0 -z-10"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#A0522D]/10 blur-[120px]" /></div>
      <ServiceHeader config={config} />
      <main className="mx-auto max-w-lg pb-32 pt-4 space-y-4">
        <ServiceHero config={config} price={vehiclePrice} />
        <VehicleSelector onPriceChange={setVehiclePrice} />
        <RouteCalculator />
        <TrustStats />
      </main>
      <ServiceFooter config={config} onOrder={() => setOrderOpen(true)} />
      <SmartOrderForm isOpen={orderOpen} onClose={() => setOrderOpen(false)} domainId="move" price={vehiclePrice} />
    </div>
  );
}
