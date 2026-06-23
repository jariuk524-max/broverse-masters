'use client';

import { useState, useEffect } from 'react';
import { Power, MapPin, Phone, MessageSquare, Navigation, CheckCircle2, Timer, Wrench, Square, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useLeads, SOURCE_COLORS } from '@/lib/leads-context';

type Step = 'idle' | 'route' | 'arrived' | 'working' | 'done';

const STEPS: { id: Step; label: string; color: string }[] = [
  { id: 'route', label: 'Едешь к клиенту', color: '#3B82F6' },
  { id: 'arrived', label: 'На месте', color: '#F59E0B' },
  { id: 'working', label: 'В работе', color: '#34C759' },
  { id: 'done', label: 'Завершён', color: '#8E8E93' },
];

function formatTime(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

interface ShiftButtonProps {
  onShift: boolean;
  onToggle: () => void;
}

export default function ShiftButton({ onShift, onToggle }: ShiftButtonProps) {
  const { activeLead, completeLead } = useLeads();
  const [expanded, setExpanded] = useState(false);
  const [step, setStep] = useState<Step>('idle');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (step !== 'working') return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (activeLead && step === 'idle') setStep('route');
    if (!activeLead && step !== 'idle') {
      setStep('idle');
      setTimer(0);
      setExpanded(false);
    }
  }, [activeLead, step]);

  const handleRoute = () => {
    if (!activeLead) return;
    const [lat, lng] = activeLead.coords;
    window.open(`https://yandex.ru/maps/?rtext=${lat},${lng}&rtt=auto`, '_blank');
  };

  const handleComplete = () => {
    setStep('done');
    setTimeout(() => completeLead(), 2000);
  };

  const stepInfo = STEPS.find((s) => s.id === step);
  const currentColor = step === 'idle' ? (onShift ? '#34C759' : '#8E8E93') : (stepInfo?.color ?? '#8E8E93');
  const currentLabel = step === 'idle' ? (onShift ? 'На смене' : 'Оффлайн') : (stepInfo?.label ?? '');

  if (!expanded) {
    return (
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => {
            if (!onShift && step === 'idle') { onToggle(); return; }
            if (activeLead) { setExpanded(true); return; }
            onToggle();
          }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 backdrop-blur-md border transition-all active:scale-95 ${
            onShift || activeLead
              ? 'border-white/30 shadow-[0_2px_12px_rgba(0,0,0,0.12)]'
              : 'bg-white/80 border-white/30 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
          }`}
          style={onShift || activeLead ? { background: `${currentColor}E6` } : undefined}
        >
          <div className={`flex h-5 w-5 items-center justify-center rounded-full ${
            onShift || activeLead ? 'bg-white/20' : 'bg-zinc-100'
          }`}>
            {step === 'idle' ? (
              <Power size={10} className={onShift ? 'text-white' : 'text-zinc-400'} />
            ) : (
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            )}
          </div>
          <span className={`text-[11px] font-bold ${onShift || activeLead ? 'text-white' : 'text-zinc-500'}`}>
            {step === 'working' ? formatTime(timer) : currentLabel}
          </span>
          {step !== 'idle' && <ChevronUp size={12} className="text-white/60" />}
        </button>
      </div>
    );
  }

  if (!activeLead) return null;

  const color = SOURCE_COLORS[activeLead.source];
  const masterShare = Math.floor(activeLead.price * 0.8);

  return (
    <div className="absolute top-4 right-4 left-4 z-10">
      <div className="bg-white rounded-[18px] shadow-[0_8px_40px_rgba(0,0,0,0.2)] overflow-hidden">
        {/* Шапка */}
        <div className="px-3.5 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[8px]" style={{ background: `${color}15` }}>
                <div className="h-2 w-2 rounded-full" style={{ background: color }} />
              </div>
              <div>
                <p className="text-[8px] text-zinc-400 leading-none">{activeLead.domain}</p>
                <p className="text-[12px] font-bold text-zinc-900 leading-tight">{activeLead.title}</p>
              </div>
            </div>
            <button onClick={() => setExpanded(false)} className="p-1 rounded-full bg-zinc-100 active:scale-90">
              <X size={11} className="text-zinc-400" />
            </button>
          </div>

          {/* Прогресс */}
          <div className="flex gap-0.5 mb-2">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className="h-0.5 flex-1 rounded-full transition-colors duration-300"
                style={{ background: STEPS.findIndex((x) => x.id === step) >= i ? currentColor : '#E5E5EA' }}
              />
            ))}
          </div>

          {/* Статус */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-[8px]" style={{ background: `${currentColor}08` }}>
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: currentColor }} />
            <p className="text-[10px] font-semibold flex-1" style={{ color: currentColor }}>{currentLabel}</p>
            {step === 'working' && (
              <span className="flex items-center gap-0.5 bg-zinc-900 text-white px-1.5 py-0.5 rounded-full">
                <Timer size={8} />
                <span className="text-[9px] font-bold">{formatTime(timer)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Инфо */}
        <div className="px-3.5 py-1.5 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <MapPin size={10} className="text-zinc-400 shrink-0" />
            <p className="text-[10px] text-zinc-600 truncate">{activeLead.address}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone size={10} className="text-zinc-400 shrink-0" />
            <a href={`tel:${activeLead.phone}`} className="text-[10px] font-semibold text-blue-600">{activeLead.phone}</a>
          </div>
          {activeLead.comment && (
            <div className="flex items-start gap-1.5">
              <MessageSquare size={10} className="text-zinc-400 mt-0.5 shrink-0" />
              <p className="text-[9px] text-zinc-500 leading-relaxed line-clamp-2">{activeLead.comment}</p>
            </div>
          )}

          {/* Расчёт */}
          <div className="flex items-center gap-2 p-1.5 bg-zinc-50 rounded-[8px]">
            <div className="flex-1">
              <p className="text-[8px] text-zinc-400">Заказ</p>
              <p className="text-[11px] font-bold text-zinc-900">{activeLead.price.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="w-px h-4 bg-zinc-200" />
            <div className="flex-1 text-right">
              <p className="text-[8px] text-zinc-400">Ваше 80%</p>
              <p className="text-[11px] font-bold text-emerald-600">{masterShare.toLocaleString('ru-RU')} ₽</p>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="px-3.5 pb-3 pt-1">
          {step === 'route' && (
            <div className="space-y-1">
              <button onClick={handleRoute} className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-500 text-white rounded-[10px] text-[11px] font-bold active:scale-95 transition-transform">
                <Navigation size={12} /> Маршрут
              </button>
              <button onClick={() => setStep('arrived')} className="w-full flex items-center justify-center gap-1.5 py-2 bg-zinc-100 text-zinc-700 rounded-[10px] text-[10px] font-bold active:scale-95 transition-transform">
                <CheckCircle2 size={11} /> Я на месте
              </button>
            </div>
          )}
          {step === 'arrived' && (
            <div className="space-y-1">
              <button onClick={() => setStep('working')} className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 text-white rounded-[10px] text-[11px] font-bold active:scale-95 transition-transform">
                <Wrench size={12} /> Начать работу
              </button>
              <a href={`tel:${activeLead.phone}`} className="w-full flex items-center justify-center gap-1.5 py-2 bg-zinc-100 text-zinc-700 rounded-[10px] text-[10px] font-bold active:scale-95 transition-transform">
                <Phone size={11} /> Позвонить
              </a>
            </div>
          )}
          {step === 'working' && (
            <div className="space-y-1">
              <button onClick={handleComplete} className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-zinc-900 text-white rounded-[10px] text-[11px] font-bold active:scale-95 transition-transform">
                <Square size={11} /> Завершить
              </button>
              <a href={`tel:${activeLead.phone}`} className="w-full flex items-center justify-center gap-1.5 py-2 bg-zinc-100 text-zinc-700 rounded-[10px] text-[10px] font-bold active:scale-95 transition-transform">
                <Phone size={11} /> Позвонить
              </a>
            </div>
          )}
          {step === 'done' && (
            <div className="text-center py-1">
              <CheckCircle2 size={22} className="mx-auto text-emerald-500 mb-0.5" />
              <p className="text-[11px] font-bold text-zinc-900">Выполнено!</p>
              <p className="text-[9px] text-zinc-400">+{masterShare.toLocaleString('ru-RU')} ₽</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
