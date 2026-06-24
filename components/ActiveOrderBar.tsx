'use client';

import { useState, useEffect } from 'react';
import { MapPin, Phone, MessageSquare, Navigation, CheckCircle2, Clock, ChevronUp, ChevronDown, Timer, Wrench, Square, Send, CreditCard, Copy, Check } from 'lucide-react';
import { useLeads, SOURCE_COLORS } from '@/lib/leads-context';

type Step = 'route' | 'arrived' | 'working' | 'done' | 'receipt';

const STEP_LABELS: Record<Step, { title: string; sub: string; color: string }> = {
  route: { title: 'Едешь к клиенту', sub: 'Построй маршрут', color: '#3B82F6' },
  arrived: { title: 'Вы на месте', sub: 'Начните работу', color: '#F59E0B' },
  working: { title: 'Заказ в работе', sub: 'Выполняете заказ', color: '#34C759' },
  done: { title: 'Заказ завершён', sub: 'Отправьте чек клиенту', color: '#8E8E93' },
  receipt: { title: 'Чек отправлен', sub: 'Клиент получил реквизиты', color: '#34C759' },
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function ActiveOrderBar() {
  const { activeLead, completeLead } = useLeads();
  const [expanded, setExpanded] = useState(false);
  const [step, setStep] = useState<Step>('route');
  const [timer, setTimer] = useState(0);
  const [receiptSent, setReceiptSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const MASTER_NAME = 'Евгений';
  const CARD_NUMBER = '2202 2084 7654 3210';
  const CARD_HOLDER = 'Евгений И.';
  const SBP_PHONE = '+7 (900) 123-45-67';

  useEffect(() => {
    if (step !== 'working') return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    setStep('route');
    setTimer(0);
    setExpanded(false);
  }, [activeLead?.id]);

  if (!activeLead) return null;

  const color = SOURCE_COLORS[activeLead.source];
  const masterShare = Math.floor(activeLead.price * 0.8);
  const info = STEP_LABELS[step];

  const handleRoute = () => {
    const [lat, lng] = activeLead.coords;
    window.open(`https://yandex.ru/maps/?rtext=${lat},${lng}&rtt=auto`, '_blank');
  };

  const handleComplete = () => {
    setStep('done');
  };

  const handleSendReceipt = () => {
    setReceiptSent(true);
    setStep('receipt');
    setTimeout(() => completeLead(), 3000);
  };

  const handleCopyReceipt = () => {
    const text = `Чек BroVerse\n\nУслуга: ${activeLead.title}\nСумма: ${activeLead.price.toLocaleString('ru-RU')} ₽\nМастер: ${MASTER_NAME}\n\nОплата:\nКарта: ${CARD_NUMBER}\nДержатель: ${CARD_HOLDER}\n\nСБП: ${SBP_PHONE}\n\nСпасибо за доверие! 💙`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendSMS = () => {
    const text = encodeURIComponent(`Чек BroVerse\n\nУслуга: ${activeLead.title}\nСумма: ${activeLead.price.toLocaleString('ru-RU')} ₽\nМастер: ${MASTER_NAME}\n\nКарта: ${CARD_NUMBER}\nДержатель: ${CARD_HOLDER}\nСБП: ${SBP_PHONE}\n\nСпасибо за доверие!`);
    window.open(`sms:${activeLead.phone}?body=${text}`, '_blank');
  };

  const handleSendTelegram = () => {
    const text = encodeURIComponent(`Чек BroVerse\n\nУслуга: ${activeLead.title}\nСумма: ${activeLead.price.toLocaleString('ru-RU')} ₽\nМастер: ${MASTER_NAME}\n\nКарта: ${CARD_NUMBER}\nДержатель: ${CARD_HOLDER}\nСБП: ${SBP_PHONE}\n\nСпасибо за доверие!`);
    window.open(`https://t.me/share/url?text=${text}`, '_blank');
  };

  if (!expanded) {
    return (
      <div className="absolute bottom-20 left-4 z-30">
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2.5 bg-white rounded-[14px] shadow-[0_4px_20px_rgba(0,0,0,0.12)] pr-3.5 pl-2.5 py-2 active:scale-95 transition-transform"
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]" style={{ background: `${info.color}15` }}>
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: info.color }} />
            {step !== 'done' && (
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white animate-pulse" style={{ background: info.color }} />
            )}
          </div>
          <div className="text-left">
            <p className="text-[11px] font-bold text-zinc-900 leading-tight">{info.title}</p>
            <p className="text-[9px] text-zinc-400">{step === 'working' ? formatTime(timer) : info.sub}</p>
          </div>
          <ChevronUp size={14} className="text-zinc-300" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-20 left-4 right-4 z-30">
      <div className="bg-white rounded-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.18)] overflow-hidden">
        {/* Шапка */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[8px]" style={{ background: `${color}15` }}>
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              </div>
              <div>
                <p className="text-[9px] text-zinc-400 leading-none">{activeLead.domain}</p>
                <p className="text-[13px] font-bold text-zinc-900 leading-tight">{activeLead.title}</p>
              </div>
            </div>
            <button onClick={() => setExpanded(false)} className="p-1 rounded-full bg-zinc-100 active:scale-90">
              <ChevronDown size={12} className="text-zinc-400" />
            </button>
          </div>

          {/* Прогресс-бар шагов */}
          <div className="flex gap-1 mb-2">
            {(['route', 'arrived', 'working', 'done'] as Step[]).map((s, i) => (
              <div
                key={s}
                className="h-1 flex-1 rounded-full transition-colors duration-300"
                style={{
                  background: (['route', 'arrived', 'working', 'done'].indexOf(step) >= i)
                    ? info.color
                    : '#E5E5EA',
                }}
              />
            ))}
          </div>

          {/* Статус */}
          <div className="flex items-center gap-2 p-2 rounded-[10px]" style={{ background: `${info.color}08` }}>
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: info.color }} />
            <div>
              <p className="text-[11px] font-semibold" style={{ color: info.color }}>{info.title}</p>
              <p className="text-[9px] text-zinc-400">{info.sub}</p>
            </div>
            {step === 'working' && (
              <div className="ml-auto flex items-center gap-1 bg-zinc-900 text-white px-2 py-0.5 rounded-full">
                <Timer size={10} />
                <span className="text-[10px] font-bold">{formatTime(timer)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Инфо */}
        <div className="px-4 py-2 space-y-2">
          <div className="flex items-start gap-2">
            <MapPin size={12} className="text-zinc-400 mt-0.5 shrink-0" />
            <p className="text-[12px] text-zinc-600">{activeLead.address}</p>
          </div>
          <div className="flex items-start gap-2">
            <Phone size={12} className="text-zinc-400 mt-0.5 shrink-0" />
            <a href={`tel:${activeLead.phone}`} className="text-[12px] font-semibold text-blue-600">{activeLead.phone}</a>
          </div>
          {activeLead.comment && (
            <div className="flex items-start gap-2">
              <MessageSquare size={12} className="text-zinc-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-zinc-500 leading-relaxed">{activeLead.comment}</p>
            </div>
          )}

          {/* Расчёт */}
          <div className="flex items-center gap-2 p-2 bg-zinc-50 rounded-[10px]">
            <div className="flex-1">
              <p className="text-[9px] text-zinc-400">Заказ</p>
              <p className="text-[13px] font-bold text-zinc-900">{activeLead.price.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="w-px h-6 bg-zinc-200" />
            <div className="flex-1 text-right">
              <p className="text-[9px] text-zinc-400">Ваше 80%</p>
              <p className="text-[13px] font-bold text-emerald-600">{masterShare.toLocaleString('ru-RU')} ₽</p>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="px-4 pb-4 pt-1">
          {step === 'route' && (
            <div className="space-y-1.5">
              <button
                onClick={handleRoute}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-[12px] text-[13px] font-bold active:scale-95 transition-transform"
              >
                <Navigation size={15} />
                Маршрут к клиенту
              </button>
              <button
                onClick={() => setStep('arrived')}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-100 text-zinc-700 rounded-[12px] text-[12px] font-bold active:scale-95 transition-transform"
              >
                <CheckCircle2 size={14} />
                Я на месте
              </button>
            </div>
          )}

          {step === 'arrived' && (
            <div className="space-y-1.5">
              <button
                onClick={() => setStep('working')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-[12px] text-[13px] font-bold active:scale-95 transition-transform"
              >
                <Wrench size={15} />
                Начать работу
              </button>
              <a
                href={`tel:${activeLead.phone}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-100 text-zinc-700 rounded-[12px] text-[12px] font-bold active:scale-95 transition-transform"
              >
                <Phone size={14} />
                Позвонить клиенту
              </a>
            </div>
          )}

          {step === 'working' && (
            <div className="space-y-1.5">
              <button
                onClick={handleComplete}
                className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 text-white rounded-[12px] text-[13px] font-bold active:scale-95 transition-transform"
              >
                <Square size={14} />
                Завершить заказ
              </button>
              <a
                href={`tel:${activeLead.phone}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-100 text-zinc-700 rounded-[12px] text-[12px] font-bold active:scale-95 transition-transform"
              >
                <Phone size={14} />
                Позвонить клиенту
              </a>
            </div>
          )}

          {step === 'done' && (
            <div className="space-y-2">
              <div className="text-center py-2">
                <CheckCircle2 size={28} className="mx-auto text-emerald-500 mb-1" />
                <p className="text-[13px] font-bold text-zinc-900">Заказ выполнен!</p>
                <p className="text-[11px] text-zinc-400">Отправьте чек клиенту</p>
              </div>

              <div className="p-3 bg-zinc-50 rounded-[12px]">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard size={12} className="text-zinc-400" />
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">Реквизиты для оплаты</p>
                </div>
                <p className="text-[12px] font-bold text-zinc-900">{CARD_NUMBER}</p>
                <p className="text-[10px] text-zinc-500">{CARD_HOLDER}</p>
                <p className="text-[10px] text-zinc-400 mt-1">СБП: {SBP_PHONE}</p>
                <p className="text-[13px] font-black text-zinc-900 mt-2">Сумма: {activeLead.price.toLocaleString('ru-RU')} ₽</p>
              </div>

              <button
                onClick={handleSendReceipt}
                className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 text-white rounded-[12px] text-[13px] font-bold active:scale-95 transition-transform"
              >
                <Send size={14} />
                Отправить чек клиенту
              </button>
            </div>
          )}

          {step === 'receipt' && (
            <div className="space-y-2">
              <div className="text-center py-2">
                <CheckCircle2 size={28} className="mx-auto text-emerald-500 mb-1" />
                <p className="text-[13px] font-bold text-zinc-900">Чек отправлен!</p>
                <p className="text-[11px] text-zinc-400">Выберите способ доставки</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleCopyReceipt}
                  className="flex flex-col items-center gap-1.5 p-3 bg-zinc-50 rounded-[12px] active:scale-95 transition-transform"
                >
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-zinc-400" />}
                  <span className="text-[10px] font-bold text-zinc-600">{copied ? 'Скопировано' : 'Копировать'}</span>
                </button>
                <button
                  onClick={handleSendSMS}
                  className="flex flex-col items-center gap-1.5 p-3 bg-zinc-50 rounded-[12px] active:scale-95 transition-transform"
                >
                  <MessageSquare size={18} className="text-zinc-400" />
                  <span className="text-[10px] font-bold text-zinc-600">SMS</span>
                </button>
                <button
                  onClick={handleSendTelegram}
                  className="flex flex-col items-center gap-1.5 p-3 bg-zinc-50 rounded-[12px] active:scale-95 transition-transform"
                >
                  <Send size={18} className="text-zinc-400" />
                  <span className="text-[10px] font-bold text-zinc-600">Telegram</span>
                </button>
              </div>

              <a
                href={`tel:${activeLead.phone}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-zinc-100 text-zinc-700 rounded-[12px] text-[12px] font-bold active:scale-95 transition-transform"
              >
                <Phone size={14} />
                Позвонить клиенту
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
