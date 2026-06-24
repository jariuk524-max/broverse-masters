'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { CreditCard, Building2, Smartphone, CheckCircle2, Edit3, Save, UserCheck, Camera, Info, Star, Shield, TrendingUp, MapPin, Clock, Phone, Globe, Send as SendIcon, ChevronRight, Wallet, Power, Zap, Navigation } from 'lucide-react';
import DailyEarnings from '../components/DailyEarnings';
import ShiftToggle from '../components/ShiftToggle';
import OrderBar from '../components/OrderBar';
import Orders from '../components/Orders';
import TabBar, { type TabId } from '../components/TabBar';
import { LeadsProvider, useLeads, SOURCE_COLORS, type Lead } from '@/lib/leads-context';

const MapView = dynamic(() => import('../components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
      <span className="text-gray-400 font-medium">Загрузка карты Москвы...</span>
    </div>
  ),
});

type OrderStatus = 'success' | 'error';
type OrderSource = 'Брокер' | 'Телефон' | 'Сайт' | 'Telegram';

type Order = {
  id: number;
  coords: [number, number];
  status: OrderStatus;
  price: number;
  title: string;
  address: string;
  source: OrderSource;
  dist: string;
  date: string;
};

const PROFIT_RATE = 0.8;

const SOURCE_MAP: Record<string, OrderSource> = {
  BroWash: 'Брокер', BroMove: 'Телефон', BroFrame: 'Сайт',
  BroBuild: 'Telegram', BroRent: 'Брокер', BroCare: 'Телефон',
};

function leadToOrder(lead: Lead): Order {
  return {
    id: typeof lead.id === 'string' ? parseInt(lead.id, 10) || 0 : lead.id,
    coords: lead.coords || [55.7558, 37.6173],
    status: lead.status === 'completed' ? 'success' : lead.status === 'new' || lead.status === 'accepted' ? 'error' : 'error',
    price: lead.price || 0,
    title: lead.title || 'Заказ',
    address: lead.address || '',
    source: SOURCE_MAP[lead.source] || 'Брокер',
    dist: '',
    date: lead.timestamp ? new Date(lead.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
      status === 'success'
        ? 'bg-emerald-500/10 text-emerald-600'
        : 'bg-red-500/10 text-red-500'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {status === 'success' ? 'Выполнен' : 'Проблема'}
    </span>
  );
}

function SourceIcon({ source }: { source: OrderSource }) {
  const iconClass = "h-3.5 w-3.5";
  switch (source) {
    case 'Брокер': return <Globe className={iconClass} />;
    case 'Телефон': return <Phone className={iconClass} />;
    case 'Сайт': return <Globe className={iconClass} />;
    case 'Telegram': return <SendIcon className={iconClass} />;
  }
}

function getWeekLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return 'Эта неделя';
  if (diffDays < 14) return 'Прошлая неделя';
  if (diffDays < 21) return '2 недели назад';
  return 'Ранее';
}

function getWeekRange(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => `${d.getDate()}.${d.getMonth() + 1}`;
  return `${fmt(monday)} — ${fmt(sunday)}`;
}

type WeekData = {
  label: string;
  range: string;
  orders: Order[];
  totalRevenue: number;
  totalProfit: number;
  totalCommission: number;
};

function groupByWeeks(orders: Order[]): WeekData[] {
  const completed = orders.filter(o => o.status === 'success');
  const grouped = new Map<string, Order[]>();

  for (const order of completed) {
    const week = getWeekLabel(order.date);
    if (!grouped.has(week)) grouped.set(week, []);
    grouped.get(week)!.push(order);
  }

  const weeks: WeekData[] = [];
  for (const [label, weekOrders] of grouped) {
    const totalRevenue = weekOrders.reduce((s, o) => s + o.price, 0);
    const totalProfit = Math.round(totalRevenue * PROFIT_RATE);
    weeks.push({
      label,
      range: getWeekRange(weekOrders[0].date),
      orders: weekOrders,
      totalRevenue,
      totalProfit,
      totalCommission: totalRevenue - totalProfit,
    });
  }

  return weeks;
}

function ProfileScreen() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const handlePhotoClick = () => fileInputRef.current?.click();
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const [name, setName] = useState('Евгений');
  const [editingName, setEditingName] = useState(false);

  const [bio, setBio] = useState('Мастер по ремонту и обслуживанию. Более 10 лет опыта. Работаю чисто, быстро и с гарантией.');
  const [editingBio, setEditingBio] = useState(false);

  const [selfEmployed, setSelfEmployed] = useState(false);
  const [selfEmployedInn, setSelfEmployedInn] = useState('');
  const [editingSelfEmployed, setEditingSelfEmployed] = useState(false);

  const [experience, setExperience] = useState('5');
  const [editingExperience, setEditingExperience] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [sbpPhone, setSbpPhone] = useState('');
  const [editingRequisites, setEditingRequisites] = useState(false);

  const filledFields = [
    !!photo,
    name.length > 0,
    bio.length > 10,
    selfEmployed && selfEmployedInn.length === 12,
    cardNumber.length > 0 || bankAccount.length > 0 || sbpPhone.length > 0,
    experience.length > 0,
  ];
  const completionPercent = Math.round((filledFields.filter(Boolean).length / filledFields.length) * 100);

  return (
    <div className="absolute inset-x-0 bottom-14 top-0 z-20 overflow-y-auto bg-gradient-to-b from-[#F2F2F7] via-[#E8E8ED] to-[#F2F2F7]">
      <div className="px-4 pb-28 pt-20">
        {/* Прогресс заполнения */}
        <section className="mb-4 overflow-hidden rounded-[20px] border border-white/60 bg-white/50 p-4 shadow-[0_4px_16px_rgba(0,0,0,0.03)] backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[12px] font-bold text-[#8E8E93]">Заполненность профиля</p>
            <p className="text-[12px] font-bold text-[#007AFF]">{completionPercent}%</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#E5E5EA]/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#007AFF] to-[#5856D6] transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          {completionPercent < 100 && (
            <p className="mt-2 text-[11px] text-[#C7C7CC]">
              {completionPercent < 50 ? 'Заполните больше данных для лучшего доверия клиентов' : 'Почти готово! Осталось немного'}
            </p>
          )}
        </section>

        {/* Hero Card */}
        <section className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/50 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-[#007AFF]/20 to-[#5856D6]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-tr from-[#34C759]/15 to-[#30D158]/10 blur-2xl" />
          <div className="relative flex items-center gap-5">
            <button
              type="button"
              onClick={handlePhotoClick}
              className="group relative flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1C1C1E] to-[#3A3A3C] text-[36px] font-bold text-white shadow-lg active:scale-95 transition-transform"
            >
              {photo ? (
                <img src={photo} alt="Фото профиля" className="h-full w-full object-cover" />
              ) : (
                name.charAt(0)
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <div className="min-w-0 flex-1">
              {editingName ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-[12px] border border-[#E5E5EA] bg-[#F2F2F7]/80 px-3 py-2 text-[28px] font-bold text-[#1C1C1E] outline-none focus:border-[#007AFF]/40"
                />
              ) : (
                <h1
                  onClick={() => setEditingName(true)}
                  className="truncate text-[28px] font-bold leading-tight tracking-tight text-[#1C1C1E]"
                >
                  {name}
                </h1>
              )}
              <p className="mt-0.5 text-[15px] font-semibold text-[#007AFF]">Founder</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-[#34C759]/12 px-3 py-1 text-[12px] font-semibold text-[#34C759]">
                  <CheckCircle2 size={13} strokeWidth={2.5} />
                  Верифицирован
                </span>
                {selfEmployed && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FF9500]/12 px-3 py-1 text-[12px] font-semibold text-[#FF9500]">
                    <Shield size={12} />
                    Самозанятый
                  </span>
                )}
              </div>
            </div>
          </div>
          {!photo && (
            <div className="relative mt-4 flex items-center gap-2 rounded-[12px] bg-[#007AFF]/8 px-3 py-2.5">
              <Info size={14} className="shrink-0 text-[#007AFF]" />
              <p className="text-[12px] text-[#007AFF]">Добавьте фото — клиенты доверяют мастерам с аватаром в 3 раза больше</p>
            </div>
          )}
        </section>

        {/* Рейтинг */}
        <section className="mt-4 overflow-hidden rounded-[24px] border border-white/60 bg-white/50 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#FF9500]/10">
                <Star size={22} className="text-[#FF9500]" fill="#FF9500" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#8E8E93]">Рейтинг</p>
                <div className="flex items-center gap-1">
                  <p className="text-[22px] font-black text-[#1C1C1E]">5.0</p>
                  <p className="text-[12px] text-[#8E8E93]">/ 5.0</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-[#8E8E93]">Заказов</p>
              <p className="text-[18px] font-bold text-[#1C1C1E]">47</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-[12px] bg-[#34C759]/8 px-3 py-2.5">
            <TrendingUp size={14} className="text-[#34C759]" />
            <p className="text-[12px] text-[#34C759]">Ваш рейтинг выше 85% мастеров в сети</p>
          </div>
        </section>

        {/* Bio */}
        <section className="mt-4 overflow-hidden rounded-[24px] border border-white/60 bg-white/50 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">О себе</h2>
            <button
              type="button"
              onClick={() => setEditingBio(!editingBio)}
              className="flex items-center gap-1 rounded-full bg-[#007AFF]/10 px-3 py-1 text-[12px] font-semibold text-[#007AFF] active:bg-[#007AFF]/20"
            >
              {editingBio ? <Save size={13} /> : <Edit3 size={13} />}
              {editingBio ? 'Сохранить' : 'Изменить'}
            </button>
          </div>
          {editingBio ? (
            <>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-[16px] border border-[#E5E5EA] bg-[#F2F2F7]/80 p-3 text-[15px] leading-relaxed text-[#1C1C1E] outline-none focus:border-[#007AFF]/40 focus:bg-white"
                placeholder="Расскажите о себе клиентам..."
              />
              <div className="mt-3 space-y-1.5 rounded-[12px] bg-[#F2F2F7]/60 p-3">
                <p className="text-[11px] font-bold text-[#8E8E93]">Рекомендации:</p>
                <p className="text-[11px] text-[#C7C7CC]">• Укажите специализацию и стаж работы</p>
                <p className="text-[11px] text-[#C7C7CC]">• Опишите гарантии, которые даёте</p>
                <p className="text-[11px] text-[#C7C7CC]">• Отметите лицензии или сертификаты</p>
                <p className="text-[11px] text-[#C7C7CC]">• Оптимальная длина — 2–3 предложения</p>
              </div>
            </>
          ) : (
            <p className="text-[15px] leading-relaxed text-[#3A3A3C]">{bio || 'Не указано'}</p>
          )}
        </section>

        {/* Опыт работы */}
        <section className="mt-4 overflow-hidden rounded-[24px] border border-white/60 bg-white/50 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">Стаж работы</h2>
            <button
              type="button"
              onClick={() => setEditingExperience(!editingExperience)}
              className="flex items-center gap-1 rounded-full bg-[#007AFF]/10 px-3 py-1 text-[12px] font-semibold text-[#007AFF] active:bg-[#007AFF]/20"
            >
              {editingExperience ? <Save size={13} /> : <Edit3 size={13} />}
              {editingExperience ? 'Сохранить' : 'Изменить'}
            </button>
          </div>
          {editingExperience ? (
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                min="0"
                max="50"
                className="w-20 rounded-[12px] border border-[#E5E5EA] bg-[#F2F2F7]/80 px-3 py-2.5 text-center text-[18px] font-bold text-[#1C1C1E] outline-none focus:border-[#007AFF]/40"
              />
              <span className="text-[15px] text-[#8E8E93]">лет</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-[18px] font-bold text-[#1C1C1E]">{experience || '—'} лет</p>
              {Number(experience) >= 5 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#34C759]/12 px-2 py-0.5 text-[10px] font-bold text-[#34C759]">
                  Опытный
                </span>
              )}
            </div>
          )}
        </section>

        {/* Самозанятый */}
        <section className="mt-4 overflow-hidden rounded-[24px] border border-white/60 bg-white/50 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">Самозанятый</h2>
            <button
              type="button"
              onClick={() => setEditingSelfEmployed(!editingSelfEmployed)}
              className="flex items-center gap-1 rounded-full bg-[#007AFF]/10 px-3 py-1 text-[12px] font-semibold text-[#007AFF] active:bg-[#007AFF]/20"
            >
              {editingSelfEmployed ? <Save size={13} /> : <Edit3 size={13} />}
              {editingSelfEmployed ? 'Сохранить' : 'Изменить'}
            </button>
          </div>
          {editingSelfEmployed ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-[16px] bg-[#F2F2F7]/80 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#34C759]/10">
                    <UserCheck size={20} className="text-[#34C759]" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-[15px] font-medium text-[#1C1C1E]">Статус самозанятого</p>
                    <p className="text-[12px] text-[#8E8E93]">НПД — налог на профессиональный доход</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelfEmployed(!selfEmployed)}
                  className={`relative h-7 w-12 rounded-full transition-colors ${selfEmployed ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${selfEmployed ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              {selfEmployed && (
                <div className="flex items-center gap-3 rounded-[16px] bg-[#F2F2F7]/80 p-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#FF9500]/10">
                    <Building2 size={20} className="text-[#FF9500]" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[#8E8E93]">ИНН самозанятого</p>
                    <input
                      type="text"
                      value={selfEmployedInn}
                      onChange={(e) => setSelfEmployedInn(e.target.value)}
                      placeholder="ИНН (12 цифр)"
                      maxLength={12}
                      className="mt-1 w-full border-b border-[#C7C7CC] bg-transparent py-0.5 text-[15px] text-[#1C1C1E] outline-none focus:border-[#007AFF]"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 rounded-[12px] bg-[#FF9500]/8 px-3 py-2.5">
                <Info size={14} className="shrink-0 text-[#FF9500]" />
                <p className="text-[11px] text-[#FF9500]">Статус самозанятого повышает доверие клиентов и упрощает налоговый учёт</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-[16px] bg-[#F2F2F7]/80 p-4">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${selfEmployed ? 'bg-[#34C759]/10' : 'bg-[#E5E5EA]/60'}`}>
                <UserCheck size={20} className={selfEmployed ? 'text-[#34C759]' : 'text-[#C7C7CC]'} strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-medium text-[#1C1C1E]">Самозанятый</p>
                  {selfEmployed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#34C759]/12 px-2 py-0.5 text-[11px] font-semibold text-[#34C759]">
                      <CheckCircle2 size={11} strokeWidth={2.5} />
                      Подтвержден
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-[#E5E5EA]/80 px-2 py-0.5 text-[11px] font-semibold text-[#8E8E93]">Не подключен</span>
                  )}
                </div>
                {selfEmployed && selfEmployedInn && (
                  <p className="mt-0.5 text-[13px] text-[#8E8E93]">ИНН: {selfEmployedInn}</p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Реквизиты для оплаты */}
        <section className="mt-4 overflow-hidden rounded-[24px] border border-white/60 bg-white/50 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[#8E8E93]">Реквизиты для оплаты</h2>
            <button
              type="button"
              onClick={() => setEditingRequisites(!editingRequisites)}
              className="flex items-center gap-1 rounded-full bg-[#007AFF]/10 px-3 py-1 text-[12px] font-semibold text-[#007AFF] active:bg-[#007AFF]/20"
            >
              {editingRequisites ? <Save size={13} /> : <Edit3 size={13} />}
              {editingRequisites ? 'Сохранить' : 'Изменить'}
            </button>
          </div>
          {editingRequisites && (
            <div className="mb-4 flex items-center gap-2 rounded-[12px] bg-[#007AFF]/8 px-3 py-2.5">
              <Info size={14} className="shrink-0 text-[#007AFF]" />
              <p className="text-[11px] text-[#007AFF]">Укажите хотя бы один способ оплаты. Клиент увидит данные после завершения заказа</p>
            </div>
          )}
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-[16px] bg-[#F2F2F7]/80 p-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#007AFF]/10">
                <CreditCard size={20} className="text-[#007AFF]" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[#8E8E93]">Банковская карта</p>
                {editingRequisites ? (
                  <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="Номер карты (16 цифр)" maxLength={16} className="mt-1 w-full border-b border-[#C7C7CC] bg-transparent py-0.5 text-[15px] text-[#1C1C1E] outline-none focus:border-[#007AFF]" />
                ) : (
                  <p className="text-[15px] font-medium text-[#1C1C1E]">{cardNumber ? `**** ${cardNumber.slice(-4)}` : 'Не указано'}</p>
                )}
              </div>
              {cardNumber && <CheckCircle2 size={16} className="text-[#34C759]" />}
            </div>
            <div className="flex items-center gap-3 rounded-[16px] bg-[#F2F2F7]/80 p-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#FF9500]/10">
                <Building2 size={20} className="text-[#FF9500]" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[#8E8E93]">Расчётный счёт (ИНН/КПП)</p>
                {editingRequisites ? (
                  <input type="text" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} placeholder="Расчётный счёт / ИНН" className="mt-1 w-full border-b border-[#C7C7CC] bg-transparent py-0.5 text-[15px] text-[#1C1C1E] outline-none focus:border-[#007AFF]" />
                ) : (
                  <p className="text-[15px] font-medium text-[#1C1C1E]">{bankAccount || 'Не указано'}</p>
                )}
              </div>
              {bankAccount && <CheckCircle2 size={16} className="text-[#34C759]" />}
            </div>
            <div className="flex items-center gap-3 rounded-[16px] bg-[#F2F2F7]/80 p-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#34C759]/10">
                <Smartphone size={20} className="text-[#34C759]" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-[#8E8E93]">СБП (по номеру телефона)</p>
                {editingRequisites ? (
                  <input type="tel" value={sbpPhone} onChange={(e) => setSbpPhone(e.target.value)} placeholder="+7 (999) 123-45-67" className="mt-1 w-full border-b border-[#C7C7CC] bg-transparent py-0.5 text-[15px] text-[#1C1C1E] outline-none focus:border-[#007AFF]" />
                ) : (
                  <p className="text-[15px] font-medium text-[#1C1C1E]">{sbpPhone || 'Не указано'}</p>
                )}
              </div>
              {sbpPhone && <CheckCircle2 size={16} className="text-[#34C759]" />}
            </div>
          </div>
        </section>

        <p className="mt-10 text-center text-[11px] font-medium tracking-wide text-[#C7C7CC]">
          BroVerse ID · Экосистема профессионального братства
        </p>
      </div>
    </div>
  );
}

function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('map');
  const [activeWeek, setActiveWeek] = useState<string>('all');
  const [orderTimer, setOrderTimer] = useState<string>('');
  const { leads, activeLead } = useLeads();

  const orders = useMemo(() => leads.map(leadToOrder), [leads]);
  const weeks = useMemo(() => groupByWeeks(orders), [orders]);
  const allCompleted = orders.filter(o => o.status === 'success');

  const displayOrders = activeWeek === 'all'
    ? allCompleted
    : weeks.find(w => w.label === activeWeek)?.orders ?? [];

  const displayRevenue = displayOrders.reduce((s, o) => s + o.price, 0);
  const displayProfit = Math.round(displayRevenue * PROFIT_RATE);
  const displayCommission = displayRevenue - displayProfit;

  const stats = useMemo(() => {
    const success = orders.filter((o) => o.status === 'success');
    const errors = orders.filter((o) => o.status === 'error');
    const totalRevenue = orders.reduce((s, o) => s + o.price, 0);
    const profit = success.reduce((s, o) => s + Math.round(o.price * PROFIT_RATE), 0);
    return {
      profit,
      errorCount: errors.length,
      hosting: Math.round(totalRevenue * (1 - PROFIT_RATE)),
    };
  }, [orders]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black font-sans">
      {/* КАРТА */}
      <div className="absolute inset-0 z-0">
        <MapView />
      </div>

      {/* СМЕНА — правый верх */}
      <div className="absolute top-4 right-4 z-10">
        <ShiftToggle />
      </div>

      {/* ЗАКАЗ — левый низ */}
      <OrderBar onTimerUpdate={setOrderTimer} />

      {/* ЗАКАЗЫ (bottom sheet) */}
      {activeTab === 'orders' && (
        <div className="absolute inset-x-0 bottom-14 top-[40%] z-20 overflow-y-auto rounded-t-[32px] bg-[#F2F2F7] shadow-[0_-12px_40px_rgba(0,0,0,0.15)]">
          <div className="sticky top-0 z-10 flex justify-center pt-3 pb-2 bg-[#F2F2F7]/90 backdrop-blur-xl rounded-t-[32px]">
            <div className="h-1 w-10 rounded-full bg-zinc-300" />
          </div>
          <Orders />
        </div>
      )}

      {/* ПРОФИЛЬ */}
      {activeTab === 'profile' && (
        <ProfileScreen />
      )}

      {/* НАВИГАЦИЯ */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <TabBar active={activeTab} onChange={setActiveTab} />
      </div>
    </main>
  );
}

export default function HomeWrapper() {
  return (
    <LeadsProvider>
      <Home />
    </LeadsProvider>
  );
}
