'use client';

import { useState } from 'react';
import ServiceHeader from '@/components/ServiceHeader';
import ServiceHero from '@/components/ServiceHero';
import ServiceFooter from '@/components/ServiceFooter';
import GlassCard from '@/components/GlassCard';
import SmartOrderForm from '@/components/SmartOrderForm';
import { BroVerseConfig } from '@/config/ecosystem';
import { Mic, CheckCircle2, Shield, Clock, Zap } from 'lucide-react';

const config = BroVerseConfig.frame;

const CATEGORIES = [
  { id: 'phone', name: 'Смартфон', icon: '📱' },
  { id: 'laptop', name: 'Ноутбук', icon: '💻' },
  { id: 'washer', name: 'Стиральная', icon: '🫧' },
  { id: 'coffee', name: 'Кофемашина', icon: '☕' },
  { id: 'fridge', name: 'Холодильник', icon: '❄️' },
  { id: 'robot', name: 'Робот', icon: '🤖' },
];

const BRANDS = ['Apple', 'Samsung', 'Bosch', 'LG', 'DeLonghi', 'Xiaomi', 'Liebherr', 'Jura'];

function CategoryGrid() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <GlassCard glow="#DAA520" className="mx-4">
      <div className="p-5">
        <h3 className="text-sm font-bold text-white mb-1">Что сломалось?</h3>
        <p className="text-[10px] text-white/40 mb-4">Выберите тип техники — поможем</p>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((c) => (
            <button key={c.id} type="button" onClick={() => setSelected(selected === c.id ? null : c.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-[20px] transition-all ${selected === c.id ? 'bg-white/15 border border-white/30' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}>
              <span className="text-xl">{c.icon}</span>
              <span className="text-[9px] font-bold text-white">{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function AudioDiagnostic() {
  const [recording, setRecording] = useState(false);
  const [done, setDone] = useState(false);
  const toggle = () => { if (recording) { setRecording(false); setDone(true); } else { setRecording(true); setDone(false); } };
  return (
    <GlassCard glow="#DAA520" className="mx-4">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#DAA520]/10"><Mic size={18} className="text-[#DAA520]" /></div>
          <div><h3 className="text-sm font-bold text-white">Слышите странный звук?</h3><p className="text-[10px] text-white/40">Запишите — поймём что не так</p></div>
        </div>
        <p className="text-[11px] text-white/50 mb-3">Если техника стучит, гудит или щёлкает — запишите звук. Наш мастер определит проблему по аудио ещё до выезда. Это сэкономит ваше время.</p>
        <button type="button" onClick={toggle}
          className={`w-full py-3 rounded-[16px] text-xs font-bold transition-all flex items-center justify-center gap-2 ${recording ? 'bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse' : done ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' : 'bg-[#DAA520]/20 border border-[#DAA520]/40 text-[#DAA520]'}`}>
          <Mic size={14} />{recording ? 'Записываем... нажмите когда хватит' : done ? 'Готово! Мастер прослушает' : 'Начать запись звука'}
        </button>
      </div>
    </GlassCard>
  );
}

function PartsStock() {
  return (
    <GlassCard glow="#DAA520" className="mx-4">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3"><CheckCircle2 size={14} className="text-[#DAA520]" /><h3 className="text-xs font-bold text-white">Запчасти в наличии</h3></div>
        <p className="text-[10px] text-white/40 mb-3">Держим на складе запчасти для самых частых поломок. Не ждём доставку — чиним сегодня.</p>
        <div className="flex flex-wrap gap-1.5">
          {BRANDS.map((b) => <span key={b} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/50">{b}</span>)}
        </div>
      </div>
    </GlassCard>
  );
}

function TrustBadges() {
  return (
    <div className="px-4 grid grid-cols-3 gap-2">
      {[{ icon: <Shield size={18} />, label: 'Гарантия', sub: '6 месяцев на ремонт' }, { icon: <Clock size={18} />, label: 'Диагностика', sub: 'Бесплатно, 15 мин' }, { icon: <Zap size={18} />, label: 'Запчасти', sub: 'Всегда на складе' }].map((b) => (
        <GlassCard key={b.label} glow="#DAA520"><div className="flex flex-col items-center gap-2 p-4 text-center"><span className="text-[#DAA520]">{b.icon}</span><span className="text-[11px] font-bold text-white">{b.label}</span><span className="text-[9px] text-white/40 leading-tight">{b.sub}</span></div></GlassCard>
      ))}
    </div>
  );
}

export default function FramePage() {
  const [orderOpen, setOrderOpen] = useState(false);
  return (
    <div className="min-h-[100dvh]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
      <div className="fixed inset-0 -z-10 bg-black" />
      <div className="fixed inset-0 -z-10"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#DAA520]/10 blur-[120px]" /></div>
      <ServiceHeader config={config} />
      <main className="mx-auto max-w-lg pb-32 pt-4 space-y-4">
        <ServiceHero config={config} />
        <CategoryGrid />
        <TrustBadges />
        <AudioDiagnostic />
        <PartsStock />
      </main>
      <ServiceFooter config={config} onOrder={() => setOrderOpen(true)} />
      <SmartOrderForm isOpen={orderOpen} onClose={() => setOrderOpen(false)} domainId="frame" />
    </div>
  );
}
