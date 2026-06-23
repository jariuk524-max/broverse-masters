'use client';

import { useState, useMemo } from 'react';
import { Wallet, TrendingUp, MapPin, Clock, Phone, ChevronRight, Filter, Calendar, Star, CheckCircle2, XCircle, BarChart3, ArrowUpRight } from 'lucide-react';
import { useLeads, SOURCE_COLORS, type Lead } from '@/lib/leads-context';

type FilterType = 'all' | 'completed' | 'active' | 'error';

const PROFIT_RATE = 0.8;

function getWeekLabel(dateStr: number): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return 'Сегодня';
  if (diffDays < 7) return 'Эта неделя';
  if (diffDays < 14) return 'Прошлая неделя';
  if (diffDays < 30) return 'Этот месяц';
  return 'Ранее';
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${day}.${month} ${hours}:${mins}`;
}

export default function Orders() {
  const { leads, activeLead } = useLeads();
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allOrders = useMemo(() => {
    return [...leads].sort((a, b) => b.timestamp - a.timestamp);
  }, [leads]);

  const filteredOrders = useMemo(() => {
    switch (filter) {
      case 'completed': return allOrders.filter((o) => o.status === 'completed');
      case 'active': return allOrders.filter((o) => o.status === 'new' || o.status === 'accepted');
      case 'error': return allOrders.filter((o) => o.status === 'error' as any);
      default: return allOrders;
    }
  }, [allOrders, filter]);

  const stats = useMemo(() => {
    const completed = allOrders.filter((o) => o.status === 'completed' || o.status === 'accepted');
    const totalRevenue = completed.reduce((s, o) => s + o.price, 0);
    const totalProfit = Math.round(totalRevenue * PROFIT_RATE);
    const active = allOrders.filter((o) => o.status === 'new').length;
    return { totalRevenue, totalProfit, active, completedCount: completed.length };
  }, [allOrders]);

  return (
    <div className="px-4 pb-24 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-[20px] font-bold text-gray-900">Заказы</h2>
          <p className="text-[13px] text-gray-400 mt-0.5">{stats.completedCount} выполнено</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <Wallet size={18} className="text-gray-600" />
        </div>
      </div>

      {/* Stats Card */}
      <div className="rounded-[24px] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[13px] text-gray-400">Общая прибыль</p>
            <p className="text-[28px] font-black text-gray-900 tracking-tight">
              {stats.totalProfit.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-emerald-500/10">
            <TrendingUp size={24} className="text-emerald-500" />
          </div>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 mb-3">
          <div className="flex h-full">
            <div className="bg-emerald-500 rounded-l-full" style={{ width: '80%' }} />
            <div className="bg-gray-200 rounded-r-full" style={{ width: '20%' }} />
          </div>
        </div>

        <div className="flex items-center justify-between text-[12px] mb-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-gray-500">Ваше <span className="font-bold text-gray-700">80%</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-200" />
            <span className="text-gray-500">Комиссия <span className="font-bold text-gray-700">20%</span></span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-[10px] text-gray-400">Заказов</p>
            <p className="text-[15px] font-bold text-gray-900">{stats.completedCount}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400">Выручка</p>
            <p className="text-[15px] font-bold text-gray-900">{stats.totalRevenue.toLocaleString('ru-RU')} ₽</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-400">Активных</p>
            <p className="text-[15px] font-bold text-gray-900">{stats.active}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {[
          { id: 'all' as FilterType, label: 'Все', count: allOrders.length },
          { id: 'active' as FilterType, label: 'Активные', count: allOrders.filter((o) => o.status === 'new').length },
          { id: 'completed' as FilterType, label: 'Выполнены', count: allOrders.filter((o) => o.status === 'completed' || o.status === 'accepted').length },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-semibold transition-all ${
              filter === f.id
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-500 shadow-sm'
            }`}
          >
            {f.label}
            {f.count > 0 && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                filter === f.id ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-2">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center">
              <Wallet size={24} className="text-gray-300" />
            </div>
            <p className="text-[14px] font-bold text-gray-400">Нет заказов</p>
            <p className="text-[12px] text-gray-300 mt-1">Заказы появятся здесь после выполнения</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, expanded, onToggle }: { order: Lead; expanded: boolean; onToggle: () => void }) {
  const color = SOURCE_COLORS[order.source];
  const profit = Math.floor(order.price * PROFIT_RATE);
  const commission = order.price - profit;

  const statusConfig = {
    new: { label: 'Новый', icon: <Clock size={10} />, color: 'bg-blue-500/10 text-blue-600' },
    accepted: { label: 'В работе', icon: <Clock size={10} />, color: 'bg-amber-500/10 text-amber-600' },
    completed: { label: 'Выполнен', icon: <CheckCircle2 size={10} />, color: 'bg-emerald-500/10 text-emerald-600' },
  };

  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.new;

  return (
    <div className="bg-white rounded-[18px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 text-left active:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${status.color}`}>
                {status.icon} {status.label}
              </span>
              <span className="text-[9px] text-gray-300">{formatDate(order.timestamp)}</span>
            </div>
            <p className="text-[13px] font-bold text-gray-900 truncate">{order.title}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={10} className="text-gray-300" />
              <p className="text-[11px] text-gray-400 truncate">{order.address}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[15px] font-black text-gray-900">{order.price.toLocaleString('ru-RU')} ₽</p>
            <div className="flex items-center gap-0.5 justify-end mt-1">
              <ArrowUpRight size={10} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-600">{profit.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 space-y-3 border-t border-gray-50">
          {/* Address */}
          <div className="flex items-start gap-2 pt-3">
            <MapPin size={12} className="text-gray-300 mt-0.5 shrink-0" />
            <p className="text-[11px] text-gray-500">{order.address}</p>
          </div>

          {/* Phone */}
          {order.phone && (
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-gray-300 shrink-0" />
              <a href={`tel:${order.phone}`} className="text-[11px] font-semibold text-blue-600">{order.phone}</a>
            </div>
          )}

          {/* Comment */}
          {order.comment && (
            <p className="text-[11px] text-gray-400 italic bg-gray-50 p-2 rounded-lg">{order.comment}</p>
          )}

          {/* Financial */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">Сумма заказа</span>
              <span className="font-bold text-gray-900">{order.price.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">Комиссия (20%)</span>
              <span className="font-bold text-red-400">-{commission.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between text-[11px] pt-2 border-t border-gray-200">
              <span className="font-bold text-gray-700">Ваша доля</span>
              <span className="font-bold text-emerald-600">{profit.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <a
              href={`tel:${order.phone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-[11px] font-bold active:scale-95 transition-transform"
            >
              <Phone size={12} /> Позвонить
            </a>
            <a
              href={`https://yandex.ru/maps/?rtext=${order.coords[0]},${order.coords[1]}&rtt=auto`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-500 text-white rounded-xl text-[11px] font-bold active:scale-95 transition-transform"
            >
              <MapPin size={12} /> Маршрут
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
