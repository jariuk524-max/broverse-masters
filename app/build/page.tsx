'use client';

import { useState } from 'react';
import ServiceHeader from '@/components/ServiceHeader';
import ServiceFooter from '@/components/ServiceFooter';
import GlassCard from '@/components/GlassCard';
import SmartOrderForm from '@/components/SmartOrderForm';
import { BroVerseConfig } from '@/config/ecosystem';
import { AlertTriangle, CheckCircle2, Phone, Shield, Zap } from 'lucide-react';

const config = BroVerseConfig.build;

const SERVICES = [
  { id: 'plumbing', name: 'Сантехника', icon: '🔧', items: ['Смесители', 'Протечки', 'Унитазы', 'Душевые'] },
  { id: 'electric', name: 'Электрика', icon: '⚡', items: ['Проводка', 'Розетки', 'Щиты', 'Диагностика'] },
  { id: 'renovation', name: 'Ремонт', icon: '🔨', items: ['Двери', 'Пол', 'Потолки', 'Обои'] },
  { id: 'appliance', name: 'Техника', icon: '🍳', items: ['Холодильники', 'Кондиционеры', 'Кофемашины'] },
];

function EmergencyButton({ onOrder }: { onOrder: () => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <GlassCard glow="#EF4444" className="mx-4">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-red-500/10"><AlertTriangle size={18} className="text-red-400" /></div>
          <div><h3 className="text-sm font-bold text-white">Затопило? Горит? Течёт?</h3><p className="text-[10px] text-red-400">Приедем за 30-60 минут</p></div>
        </div>
        <p className="text-[11px] text-white/50 mb-3">Аварийный мастер перезвонит через 5 минут и приедет в течение часа. Работаем круглосуточно.</p>
        <button type="button" onClick={() => { setPressed(true); onOrder(); }}
          className={`w-full py-4 rounded-[16px] text-sm font-black transition-all flex items-center justify-center gap-2 ${pressed ? 'bg-red-500 text-white' : 'bg-red-500/20 border-2 border-red-500/40 text-red-400'}`}>
          {pressed ? <><Phone size={16} className="animate-pulse" />Перезвоним через 5 минут</> : <><AlertTriangle size={16} />Вызвать аварийного мастера</>}
        </button>
      </div>
    </GlassCard>
  );
}

function ServicesList() {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <GlassCard glow="#8B4513" className="mx-4">
      <div className="p-5">
        <h3 className="text-sm font-bold text-white mb-1">Что умеем чинить</h3>
        <p className="text-[10px] text-white/40 mb-4">От протечки до сборки мебели — справимся</p>
        <div className="space-y-2">
          {SERVICES.map((s) => (
            <div key={s.id}>
              <button type="button" onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-white/5 hover:bg-white/10 transition-all text-left">
                <span className="text-lg">{s.icon}</span>
                <span className="flex-1 text-xs font-bold text-white">{s.name}</span>
                <span className="text-[10px] text-white/30">{expanded === s.id ? '−' : '+'}</span>
              </button>
              {expanded === s.id && (
                <div className="mt-1 ml-8 space-y-1">
                  {s.items.map((i) => (<div key={i} className="flex items-center gap-2 p-2 rounded-[10px] bg-white/5"><CheckCircle2 size={10} className="text-[#8B4513] shrink-0" /><span className="text-[10px] text-white/60">{i}</span></div>))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function Certificates() {
  return (
    <GlassCard glow="#8B4513" className="mx-4">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3"><Shield size={14} className="text-[#8B4513]" /><h3 className="text-xs font-bold text-white">Наши мастера — профи</h3></div>
        <p className="text-[10px] text-white/40 mb-3">Каждый мастер имеет допуски и сертификаты. Мы делаем фото до и после — видите результат.</p>
        <div className="space-y-2">
          {['Допуск к электромонтажу', 'Сертификат по сантехнике', 'Гарантия 12 месяцев на работы', 'Фотоотчёт скрытых работ'].map((t) => (<div key={t} className="flex items-center gap-2"><CheckCircle2 size={10} className="text-[#8B4513] shrink-0" /><span className="text-[10px] text-white/50">{t}</span></div>))}
        </div>
      </div>
    </GlassCard>
  );
}

export default function BuildPage() {
  const [orderOpen, setOrderOpen] = useState(false);
  return (
    <div className="min-h-[100dvh]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
      <div className="fixed inset-0 -z-10 bg-black" />
      <div className="fixed inset-0 -z-10"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#8B4513]/10 blur-[120px]" /></div>
      <ServiceHeader config={config} />
      <main className="mx-auto max-w-lg pb-32 pt-4 space-y-4">
        <EmergencyButton onOrder={() => setOrderOpen(true)} />
        <ServicesList />
        <Certificates />
      </main>
      <ServiceFooter config={config} onOrder={() => setOrderOpen(true)} />
      <SmartOrderForm isOpen={orderOpen} onClose={() => setOrderOpen(false)} domainId="build" />
    </div>
  );
}
