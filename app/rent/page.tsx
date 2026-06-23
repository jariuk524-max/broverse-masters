'use client';

import { useState } from 'react';
import ServiceHeader from '@/components/ServiceHeader';
import ServiceFooter from '@/components/ServiceFooter';
import GlassCard from '@/components/GlassCard';
import SmartOrderForm from '@/components/SmartOrderForm';
import { BroVerseConfig } from '@/config/ecosystem';
import { Leaf, Truck, Shield, Clock } from 'lucide-react';

const config = BroVerseConfig.rent;

const TOOLS = [
  { id: 'puzzi', name: 'Karcher Puzzi', icon: '🧹', price: 1500, desc: 'Моющий пылесос', specs: ['2100 Вт', '10 л'] },
  { id: 'se', name: 'Karcher SE', icon: '🧹', price: 1200, desc: 'Универсальный', specs: ['1400 Вт', '4 л'] },
  { id: 'bor', name: 'Bosch GBH', icon: '🔨', price: 800, desc: 'Перфоратор', specs: ['800 Вт', 'SDS'] },
  { id: 'mak', name: 'Makita HR', icon: '🔨', price: 700, desc: 'Перфоратор', specs: ['780 Вт', '3 режима'] },
  { id: 'karch', name: 'Karcher K4', icon: '💧', price: 1000, desc: 'Мойка выс.давления', specs: ['180 бар', '6 м'] },
  { id: 'laser', name: 'Bosch GLL', icon: '📐', price: 600, desc: 'Лазерный уровень', specs: ['3 плоскости'] },
];

function ToolCatalog({ onPriceChange }: { onPriceChange: (price: number) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    setSelected(next);
    const total = TOOLS.filter((t) => next.includes(t.id)).reduce((s, t) => s + t.price, 0);
    onPriceChange(total);
  };
  const total = TOOLS.filter((t) => selected.includes(t.id)).reduce((s, t) => s + t.price, 0);

  return (
    <GlassCard glow="#228B22" className="mx-4">
      <div className="p-5">
        <h3 className="text-sm font-bold text-white mb-1">Профессиональный инструмент</h3>
        <p className="text-[10px] text-white/40 mb-4">Берите напрокат — не покупайте</p>
        <div className="space-y-2">
          {TOOLS.map((t) => (
            <button key={t.id} type="button" onClick={() => toggle(t.id)}
              className={`w-full text-left p-3 rounded-[20px] border transition-all flex items-center gap-3 ${selected.includes(t.id) ? 'bg-white/15 border-white/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
              <span className="text-xl">{t.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{t.name}</span>
                  <span className="text-xs font-black text-[#228B22]">{t.price} ₽/сутки</span>
                </div>
                <p className="text-[9px] text-white/40">{t.desc} · {t.specs.join(' · ')}</p>
              </div>
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="mt-3 p-3 rounded-[16px] bg-white/10 border border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-white/60">{selected.length} {selected.length === 1 ? 'инструмент' : 'инструмента'}</span>
              <span className="text-lg font-black text-white">{total} ₽/сутки</span>
            </div>
            <p className="text-[10px] text-white/40 mt-1">Доставим бесплатно, химия в комплекте</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

function TrustBadges() {
  return (
    <div className="px-4 grid grid-cols-3 gap-2">
      {[{ icon: <Truck size={18} />, label: 'Доставка', sub: 'Привезём и заберём' }, { icon: <Shield size={18} />, label: 'Химия', sub: 'Всё в комплекте' }, { icon: <Clock size={18} />, label: 'Минимум', sub: 'От 4 часов' }].map((b) => (
        <GlassCard key={b.label} glow="#228B22"><div className="flex flex-col items-center gap-2 p-4 text-center"><span className="text-[#228B22]">{b.icon}</span><span className="text-[11px] font-bold text-white">{b.label}</span><span className="text-[9px] text-white/40 leading-tight">{b.sub}</span></div></GlassCard>
      ))}
    </div>
  );
}

function EcoBanner() {
  return (
    <GlassCard glow="#228B22" className="mx-4">
      <div className="p-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#228B22]/10"><Leaf size={18} className="text-[#228B22]" /></div>
        <div>
          <h3 className="text-sm font-bold text-white">Экономьте с умом</h3>
          <p className="text-[10px] text-[#228B22]">Один пылесос на 10 хозяйств — зачем покупать?</p>
        </div>
      </div>
    </GlassCard>
  );
}

export default function RentPage() {
  const [orderOpen, setOrderOpen] = useState(false);
  const [rentPrice, setRentPrice] = useState(0);

  return (
    <div className="min-h-[100dvh]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
      <div className="fixed inset-0 -z-10 bg-black" />
      <div className="fixed inset-0 -z-10"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#228B22]/10 blur-[120px]" /></div>
      <ServiceHeader config={config} />
      <main className="mx-auto max-w-lg pb-32 pt-4 space-y-4">
        <ToolCatalog onPriceChange={setRentPrice} />
        <TrustBadges />
        <EcoBanner />
      </main>
      <ServiceFooter config={config} onOrder={() => setOrderOpen(true)} />
      <SmartOrderForm isOpen={orderOpen} onClose={() => setOrderOpen(false)} domainId="rent" price={rentPrice} />
    </div>
  );
}
