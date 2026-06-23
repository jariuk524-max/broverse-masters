'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, Phone, MessageSquare, Navigation, CheckCircle2, Timer,
  Wrench, Square, Camera, Image as ImageIcon, List,
  Receipt, Send, X, Plus, Minus, RotateCcw, Sparkles, Check,
  Eye, ChevronRight, AlertCircle
} from 'lucide-react';
import { useLeads, SOURCE_COLORS } from '@/lib/leads-context';

type Step = 'route' | 'arrived' | 'photo' | 'service' | 'receipt' | 'working' | 'done';

const STEPS_CONFIG: { id: Step; label: string; icon: string; color: string }[] = [
  { id: 'route', label: 'Маршрут', icon: '🚗', color: '#3B82F6' },
  { id: 'arrived', label: 'На месте', icon: '📍', color: '#F59E0B' },
  { id: 'photo', label: 'Фото', icon: '📷', color: '#8B5CF6' },
  { id: 'service', label: 'Услуга', icon: '🔧', color: '#007AFF' },
  { id: 'receipt', label: 'Чек', icon: '🧾', color: '#10B981' },
  { id: 'working', label: 'Работа', icon: '⚙️', color: '#10B981' },
  { id: 'done', label: 'Готово', icon: '✅', color: '#6B7280' },
];

const SERVICES = [
  { id: 'diag', name: 'Диагностика', price: 500, icon: '🔍', tip: 'Сфотографируйте проблему крупным планом' },
  { id: 'clean', name: 'Химчистка', price: 3000, icon: '🧹', tip: 'Сфотографируйте загрязнение ДО' },
  { id: 'repair', name: 'Ремонт', price: 2500, icon: '🔧', tip: 'Зафиксируйте повреждения до работ' },
  { id: 'install', name: 'Установка', price: 1500, icon: '📐', tip: 'Покажите место установки' },
  { id: 'move', name: 'Переезд', price: 5000, icon: '📦', tip: 'Оцените объём груза' },
  { id: 'wash', name: 'Мытьё окон', price: 800, icon: '🪟', tip: 'Покажите степень загрязнения' },
];

const SURCHARGES = [
  { id: 'materials', label: 'Материалы', percent: 0, fixed: 500 },
  { id: 'urgent', label: 'Срочно', percent: 20, fixed: 0 },
  { id: 'evening', label: 'Вечер', percent: 15, fixed: 0 },
  { id: 'weekend', label: 'Выходной', percent: 25, fixed: 0 },
];

function formatTime(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

interface OrderBarProps {
  onTimerUpdate?: (time: string) => void;
}

export default function OrderBar({ onTimerUpdate }: OrderBarProps) {
  const { activeLead, completeLead } = useLeads();
  const [step, setStep] = useState<Step>('route');
  const [timer, setTimer] = useState(0);

  // Photo state
  const [photoBefore, setPhotoBefore] = useState<string | null>(null);
  const [photoAfter, setPhotoAfter] = useState<string | null>(null);
  const [showGhostOverlay, setShowGhostOverlay] = useState(false);
  const [ghostOpacity, setGhostOpacity] = useState(50);
  const [photoMode, setPhotoMode] = useState<'before' | 'after' | null>(null);
  const [photoFilter, setPhotoFilter] = useState<'none' | 'bright' | 'contrast'>('none');
  const fileRef = useRef<HTMLInputElement>(null);

  // Service state
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Receipt state
  const [basePrice, setBasePrice] = useState(0);
  const [activeSurcharges, setActiveSurcharges] = useState<string[]>([]);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Timer
  useEffect(() => {
    if (step !== 'working') return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (step === 'working') onTimerUpdate?.(formatTime(timer));
  }, [timer, step, onTimerUpdate]);

  // Reset on new order
  useEffect(() => {
    setStep('route');
    setTimer(0);
    setPhotoBefore(null);
    setPhotoAfter(null);
    setSelectedService(null);
    setBasePrice(0);
    setActiveSurcharges([]);
    setCustomAmount('');
    setShowGhostOverlay(false);
  }, [activeLead?.id]);

  useEffect(() => {
    if (!activeLead && step !== 'route') { setStep('route'); setTimer(0); }
  }, [activeLead]);

  // Set base price when service selected
  useEffect(() => {
    if (selectedService) {
      const svc = SERVICES.find((s) => s.id === selectedService);
      if (svc) setBasePrice(svc.price);
    }
  }, [selectedService]);

  if (!activeLead) return null;

  const color = STEPS_CONFIG.find((s) => s.id === step)?.color ?? '#6B7280';
  const stepIndex = STEPS_CONFIG.findIndex((s) => s.id === step);

  // Calculate total
  const surchargeTotal = activeSurcharges.reduce((sum, id) => {
    const sc = SURCHARGES.find((s) => s.id === id);
    if (!sc) return sum;
    return sum + (sc.fixed || Math.round(basePrice * sc.percent / 100));
  }, 0);
  const totalAmount = customAmount ? (parseInt(customAmount) || basePrice) + surchargeTotal : basePrice + surchargeTotal;
  const masterShare = Math.floor(totalAmount * 0.8);

  const handleRoute = () => {
    const [lat, lng] = activeLead.coords;
    window.open(`https://yandex.ru/maps/?rtext=${lat},${lng}&rtt=auto`, '_blank');
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (photoMode === 'before') setPhotoBefore(url);
      else setPhotoAfter(url);
      setPhotoMode(null);
    };
    reader.readAsDataURL(file);
  };

  const toggleSurchage = (id: string) => {
    setActiveSurcharges((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const getPhotoStyle = () => {
    switch (photoFilter) {
      case 'bright': return { filter: 'brightness(1.2)' };
      case 'contrast': return { filter: 'contrast(1.3)' };
      default: return {};
    }
  };

  const handleSendReceipt = () => setStep('working');
  const handleComplete = () => { setStep('done'); setTimeout(() => completeLead(), 2500); };

  return (
    <div className="absolute inset-x-3 bottom-[68px] z-30">
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />

      <div className="bg-white rounded-[20px] shadow-[0_12px_48px_rgba(0,0,0,0.2)] overflow-hidden">
        {/* === HEADER === */}
        <div className="px-4 pt-3 pb-2 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm" style={{ background: `${SOURCE_COLORS[activeLead.source]}12` }}>
                {STEPS_CONFIG[stepIndex]?.icon}
              </div>
              <div>
                <p className="text-[9px] text-zinc-400 font-medium">{activeLead.domain}</p>
                <p className="text-[13px] font-bold text-zinc-900">{activeLead.title}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-400">{activeLead.price.toLocaleString('ru-RU')} ₽</p>
              {step === 'working' && (
                <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                  <Timer size={8} /> {formatTime(timer)}
                </span>
              )}
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex gap-1">
            {STEPS_CONFIG.map((s, i) => (
              <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full h-1 rounded-full transition-all duration-500 ${
                  stepIndex >= i ? 'opacity-100' : 'opacity-20'
                }`} style={{ background: color }} />
              </div>
            ))}
          </div>
        </div>

        {/* === CONTENT === */}
        <div className="max-h-[55vh] overflow-y-auto">

          {/* 1. МАРШРУТ */}
          {step === 'route' && (
            <div className="p-4 space-y-3">
              <CompactInfo lead={activeLead} />
              <button onClick={handleRoute} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-2xl text-[13px] font-bold active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/20">
                <Navigation size={16} /> Построить маршрут
              </button>
              <button onClick={() => setStep('arrived')} className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-100 text-zinc-700 rounded-2xl text-[12px] font-bold active:scale-[0.98] transition-transform">
                <CheckCircle2 size={14} /> Я приехал
              </button>
            </div>
          )}

          {/* 2. НА МЕСТЕ */}
          {step === 'arrived' && (
            <div className="p-4 space-y-3">
              <CompactInfo lead={activeLead} />
              <div className="p-3 bg-amber-50 rounded-2xl flex items-start gap-2">
                <AlertCircle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-amber-700">Сфотографируйте объект перед началом работ — это защитит вас при спорах</p>
              </div>
              <button onClick={() => setStep('photo')} className="w-full flex items-center justify-center gap-2 py-3 bg-violet-500 text-white rounded-2xl text-[13px] font-bold active:scale-[0.98] transition-transform shadow-lg shadow-violet-500/20">
                <Camera size={16} /> Сделать фото ДО
              </button>
              <a href={`tel:${activeLead.phone}`} className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-100 text-zinc-700 rounded-2xl text-[12px] font-bold active:scale-[0.98] transition-transform">
                <Phone size={14} /> Позвонить клиенту
              </a>
            </div>
          )}

          {/* 3. ФОТО */}
          {step === 'photo' && (
            <div className="p-4 space-y-3">
              {/* Photo slots */}
              <div className="grid grid-cols-2 gap-2.5">
                <PhotoSlot label="ДО" photo={photoBefore} onClick={() => { setPhotoMode('before'); fileRef.current?.click(); }} color="#8B5CF6" />
                <PhotoSlot label="ПОСЛЕ" photo={photoAfter} onClick={() => { setPhotoMode('after'); fileRef.current?.click(); }} color="#10B981" />
              </div>

              {/* Ghost overlay control */}
              {photoBefore && photoAfter && (
                <div className="p-3 bg-zinc-50 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye size={14} className="text-violet-500" />
                      <p className="text-[11px] font-bold text-zinc-700">Ghost Overlay</p>
                    </div>
                    <button onClick={() => setShowGhostOverlay(!showGhostOverlay)}
                      className={`relative w-10 h-6 rounded-full transition-colors ${showGhostOverlay ? 'bg-violet-500' : 'bg-zinc-200'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${showGhostOverlay ? 'translate-x-4' : ''}`} />
                    </button>
                  </div>
                  {showGhostOverlay && (
                    <div className="space-y-2">
                      <input type="range" min="10" max="90" value={ghostOpacity}
                        onChange={(e) => setGhostOpacity(Number(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-violet-500" />
                      <div className="flex justify-between text-[9px] text-zinc-400">
                        <span>ДО {ghostOpacity}%</span>
                        <span>ПОСЛЕ {100 - ghostOpacity}%</span>
                      </div>
                      {/* Ghost preview */}
                      <div className="relative h-32 rounded-xl overflow-hidden">
                        <img src={photoAfter} className="absolute inset-0 w-full h-full object-cover" alt="" />
                        <img src={photoBefore} className="absolute inset-0 w-full h-full object-cover" alt=""
                          style={{ opacity: ghostOpacity / 100, ...getPhotoStyle() }} />
                        <div className="absolute bottom-1 left-1 flex gap-1">
                          {['none', 'bright', 'contrast'].map((f) => (
                            <button key={f} onClick={() => setPhotoFilter(f as any)}
                              className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${photoFilter === f ? 'bg-white text-zinc-900' : 'bg-black/40 text-white'}`}>
                              {f === 'none' ? 'Оригинал' : f === 'bright' ? 'Яркость' : 'Контраст'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button onClick={() => setStep('service')} disabled={!photoBefore}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition-all ${
                  photoBefore ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-zinc-100 text-zinc-300'
                }`}>
                <List size={16} /> Выбрать услугу <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* 4. УСЛУГА */}
          {step === 'service' && (
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {SERVICES.map((svc) => (
                  <button key={svc.id} onClick={() => setSelectedService(svc.id)}
                    className={`p-3 rounded-2xl text-left active:scale-[0.97] transition-all ${
                      selectedService === svc.id
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 ring-2 ring-blue-400'
                        : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
                    }`}>
                    <span className="text-lg">{svc.icon}</span>
                    <p className="text-[11px] font-bold mt-1">{svc.name}</p>
                    <p className={`text-[10px] ${selectedService === svc.id ? 'text-blue-100' : 'text-zinc-400'}`}>
                      от {svc.price.toLocaleString('ru-RU')} ₽
                    </p>
                  </button>
                ))}
              </div>

              {selectedService && (
                <div className="p-3 bg-blue-50 rounded-2xl flex items-start gap-2">
                  <Sparkles size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-blue-700">{SERVICES.find((s) => s.id === selectedService)?.tip}</p>
                </div>
              )}

              <button onClick={() => setStep('receipt')} disabled={!selectedService}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-bold active:scale-[0.98] transition-all ${
                  selectedService ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-100 text-zinc-300'
                }`}>
                <Receipt size={16} /> Сформировать чек <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* 5. ЧЕК */}
          {step === 'receipt' && (
            <div className="p-4 space-y-3">
              {/* Price editor */}
              <div className="p-4 bg-zinc-50 rounded-2xl">
                <p className="text-[10px] text-zinc-400 mb-2 text-center">Стоимость услуги</p>
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => setBasePrice((p) => Math.max(0, p - 100))}
                    className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90">
                    <Minus size={16} className="text-zinc-500" />
                  </button>
                  <div className="text-center">
                    {showCustomInput ? (
                      <input type="number" value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        onBlur={() => setShowCustomInput(false)}
                        className="w-28 text-center text-[28px] font-black text-zinc-900 bg-transparent outline-none"
                        autoFocus />
                    ) : (
                      <button onClick={() => { setCustomAmount(String(basePrice)); setShowCustomInput(true); }}
                        className="text-[28px] font-black text-zinc-900">
                        {basePrice.toLocaleString('ru-RU')} ₽
                      </button>
                    )}
                    <p className="text-[9px] text-zinc-300">Нажмите для ручного ввода</p>
                  </div>
                  <button onClick={() => setBasePrice((p) => p + 100)}
                    className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90">
                    <Plus size={16} className="text-zinc-500" />
                  </button>
                </div>
              </div>

              {/* Surcharges */}
              <div>
                <p className="text-[10px] font-bold text-zinc-500 mb-2">Наценки</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {SURCHARGES.map((sc) => (
                    <button key={sc.id} onClick={() => toggleSurchage(sc.id)}
                      className={`p-2.5 rounded-xl text-left active:scale-[0.97] transition-all ${
                        activeSurcharges.includes(sc.id)
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                          : 'bg-zinc-50 text-zinc-600'
                      }`}>
                      <p className="text-[10px] font-bold">{sc.label}</p>
                      <p className={`text-[9px] ${activeSurcharges.includes(sc.id) ? 'text-amber-100' : 'text-zinc-400'}`}>
                        {sc.fixed ? `+${sc.fixed} ₽` : `+${sc.percent}%`}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="p-3 bg-emerald-50 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-emerald-700">Итого клиенту</span>
                  <span className="text-[18px] font-black text-emerald-700">{totalAmount.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-emerald-100">
                  <span className="text-[10px] text-emerald-600">Ваша доля 80%</span>
                  <span className="text-[13px] font-bold text-emerald-600">{masterShare.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              {/* Photo preview */}
              {(photoBefore || photoAfter) && (
                <div className="flex gap-2 items-center">
                  {photoBefore && <img src={photoBefore} className="h-12 w-12 rounded-xl object-cover border-2 border-violet-200" alt="До" />}
                  {photoAfter && <img src={photoAfter} className="h-12 w-12 rounded-xl object-cover border-2 border-emerald-200" alt="После" />}
                  <div className="flex-1 text-right">
                    <p className="text-[9px] text-zinc-300">{SERVICES.find((s) => s.id === selectedService)?.icon} {SERVICES.find((s) => s.id === selectedService)?.name}</p>
                  </div>
                </div>
              )}

              <button onClick={handleSendReceipt}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-500 text-white rounded-2xl text-[13px] font-bold active:scale-[0.98] transition-transform shadow-lg shadow-emerald-500/20">
                <Send size={16} /> Отправить чек клиенту
              </button>
            </div>
          )}

          {/* 6. В РАБОТЕ */}
          {step === 'working' && (
            <div className="p-4 space-y-3">
              <CompactInfo lead={activeLead} />
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-2xl">
                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[11px] font-bold text-emerald-700">Чек отправлен клиенту • Ожидайте подтверждения</p>
              </div>
              <button onClick={handleComplete} className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 text-white rounded-2xl text-[13px] font-bold active:scale-[0.98] transition-transform">
                <Square size={14} /> Завершить заказ
              </button>
              <a href={`tel:${activeLead.phone}`} className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-100 text-zinc-700 rounded-2xl text-[12px] font-bold active:scale-[0.98] transition-transform">
                <Phone size={14} /> Позвонить клиенту
              </a>
            </div>
          )}

          {/* 7. ЗАВЕРШЁН */}
          {step === 'done' && (
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 size={32} className="text-white" />
              </div>
              <p className="text-[15px] font-bold text-zinc-900">Заказ выполнен!</p>
              <p className="text-[12px] text-zinc-400 mt-1">+{masterShare.toLocaleString('ru-RU')} ₽ на карту</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CompactInfo({ lead }: { lead: any }) {
  return (
    <div className="space-y-2 p-3 bg-zinc-50 rounded-2xl">
      <div className="flex items-center gap-2">
        <MapPin size={12} className="text-zinc-400 shrink-0" />
        <p className="text-[11px] text-zinc-600">{lead.address}</p>
      </div>
      <div className="flex items-center gap-2">
        <Phone size={12} className="text-zinc-400 shrink-0" />
        <a href={`tel:${lead.phone}`} className="text-[11px] font-semibold text-blue-600">{lead.phone}</a>
      </div>
      {lead.comment && (
        <div className="flex items-start gap-2">
          <MessageSquare size={12} className="text-zinc-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-zinc-500 leading-relaxed">{lead.comment}</p>
        </div>
      )}
      <div className="flex items-center gap-3 pt-2 border-t border-zinc-100">
        <div className="flex-1">
          <p className="text-[9px] text-zinc-400">Заказ</p>
          <p className="text-[13px] font-bold text-zinc-900">{lead.price.toLocaleString('ru-RU')} ₽</p>
        </div>
        <div className="w-px h-5 bg-zinc-200" />
        <div className="flex-1 text-right">
          <p className="text-[9px] text-zinc-400">Ваше 80%</p>
          <p className="text-[13px] font-bold text-emerald-600">{Math.floor(lead.price * 0.8).toLocaleString('ru-RU')} ₽</p>
        </div>
      </div>
    </div>
  );
}

function PhotoSlot({ label, photo, onClick, color }: { label: string; photo: string | null; onClick: () => void; color: string }) {
  return (
    <button onClick={onClick}
      className={`relative h-32 rounded-2xl border-2 border-dashed active:scale-[0.97] transition-all overflow-hidden ${
        photo ? 'border-transparent' : 'border-zinc-200 bg-zinc-50'
      }`}>
      {photo ? (
        <>
          <img src={photo} className="absolute inset-0 w-full h-full object-cover" alt={label} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-lg">
            <span className="text-[10px] font-bold text-white">{label}</span>
            <RotateCcw size={10} className="text-white" />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-1.5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${color}15` }}>
            <Camera size={18} style={{ color }} />
          </div>
          <span className="text-[10px] font-bold" style={{ color }}>{label}</span>
        </div>
      )}
    </button>
  );
}
