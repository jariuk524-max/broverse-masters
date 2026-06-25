'use client';

import { useState, useMemo } from 'react';
import { History, Calendar, CheckCircle2, Clock, MapPin, Phone, Wallet, TrendingUp } from 'lucide-react';
import { useLeads, SOURCE_COLORS, type Lead } from '@/lib/leads-context';

const PROFIT_RATE = 0.8;

function formatDate(ts: number): string {
  const d = new Date(ts);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}`;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function getWeekGroup(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return 'Эта неделя';
  if (diffDays < 14) return 'Прошлая неделя';
  if (diffDays < 30) return 'Этот месяц';
  return 'Ранее';
}

export default function OrderHistory() {
  const { leads } = useLeads();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const completedOrders = useMemo(
    () => leads.filter((l) => l.status === 'completed').sort((a, b) => b.timestamp - a.timestamp),
    [leads]
  );

  const grouped = useMemo(() => {
    const groups = new Map<string, Lead[]>();
    for (const order of completedOrders) {
      const week = getWeekGroup(order.timestamp);
      if (!groups.has(week)) groups.set(week, []);
      groups.get(week)!.push(order);
    }
    return Array.from(groups.entries());
  }, [completedOrders]);

  const totalProfit = useMemo(
    () => completedOrders.reduce((s, o) => s + Math.floor(o.price * PROFIT_RATE), 0),
    [completedOrders]
  );

  return (
    <div className="px-4 pb-24 space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-[20px] font-bold text-gray-900">История</h2>
          <p className="text-[13px] text-gray-400 mt-0.5">{completedOrders.length} выполнено</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <History size={18} className="text-gray-600" />
        </div>
      </div>

      {completedOrders.length > 0 && (
        <div className="rounded-[20px] bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-gray-400">Общий заработок</p>
              <p className="text-[24px] font-black text-gray-900 tracking-tight">
                {totalProfit.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-emerald-500/10">
              <TrendingUp size={22} className="text-emerald-500" />
            </div>
          </div>
        </div>
      )}

      {completedOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center">
            <History size={24} className="text-gray-300" />
          </div>
          <p className="text-[14px] font-bold text-gray-400">Нет выполненных заказов</p>
          <p className="text-[12px] text-gray-300 mt-1">История появится здесь после завершения заказов</p>
        </div>
      ) : (
        grouped.map(([weekLabel, orders]) => (
          <div key={weekLabel}>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">{weekLabel}</p>
            <div className="space-y-2">
              {orders.map((order) => {
                const color = SOURCE_COLORS[order.source];
                const profit = Math.floor(order.price * PROFIT_RATE);
                const isExpanded = expandedId === order.id;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="w-full p-4 text-left active:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${color}15` }}
                        >
                          <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600">
                              <CheckCircle2 size={9} /> Выполнен
                            </span>
                            <span className="text-[9px] text-gray-300">
                              {formatDate(order.timestamp)} · {formatTime(order.timestamp)}
                            </span>
                          </div>
                          <p className="text-[13px] font-bold text-gray-900 truncate">{order.title}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <MapPin size={10} className="text-gray-300" />
                            <p className="text-[11px] text-gray-400 truncate">{order.address}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[14px] font-black text-gray-900">{order.price.toLocaleString('ru-RU')} ₽</p>
                          <div className="flex items-center gap-0.5 justify-end mt-1">
                            <TrendingUp size={10} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-600">{profit.toLocaleString('ru-RU')} ₽</span>
                          </div>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-0 space-y-2 border-t border-gray-50">
                        <div className="flex items-start gap-2 pt-3">
                          <MapPin size={12} className="text-gray-300 mt-0.5 shrink-0" />
                          <p className="text-[11px] text-gray-500">{order.address}</p>
                        </div>
                        {order.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={12} className="text-gray-300 shrink-0" />
                            <a href={`tel:${order.phone}`} className="text-[11px] font-semibold text-blue-600">{order.phone}</a>
                          </div>
                        )}
                        {order.comment && (
                          <p className="text-[11px] text-gray-400 italic bg-gray-50 p-2 rounded-lg">{order.comment}</p>
                        )}
                        <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-gray-400">Сумма</span>
                            <span className="font-bold text-gray-900">{order.price.toLocaleString('ru-RU')} ₽</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-gray-400">Комиссия (20%)</span>
                            <span className="font-bold text-red-400">-{(order.price - profit).toLocaleString('ru-RU')} ₽</span>
                          </div>
                          <div className="flex justify-between text-[11px] pt-1.5 border-t border-gray-200">
                            <span className="font-bold text-gray-700">Ваше</span>
                            <span className="font-bold text-emerald-600">{profit.toLocaleString('ru-RU')} ₽</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
