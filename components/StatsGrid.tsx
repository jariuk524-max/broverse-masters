'use client';

import { useState } from 'react';
import { TrendingUp, AlertTriangle, Server, Zap, ChevronDown, ChevronUp, ShoppingCart, X } from 'lucide-react';

interface StatsGridProps {
  profit: number;
  errorCount: number;
  hosting: number;
  leadsCount: number;
  onFinanceClick: () => void;
  onIssuesClick: () => void;
  onResourcesClick: () => void;
}

type ExpandedCard = 'profit' | 'issues' | 'resources' | 'live' | null;

export default function StatsGrid({
  profit,
  errorCount,
  hosting,
  leadsCount,
  onFinanceClick,
  onIssuesClick,
  onResourcesClick,
}: StatsGridProps) {
  const [expanded, setExpanded] = useState<ExpandedCard>(null);

  const toggle = (card: ExpandedCard) => {
    setExpanded((prev) => (prev === card ? null : card));
  };

  return (
    <div className="space-y-2">
      {/* Основные плашки */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => toggle('profit')}
          className={`flex items-center gap-2 backdrop-blur-md rounded-full shadow-lg shadow-black/10 border border-white/20 transition-all active:scale-95 ${
            expanded === 'profit' ? 'bg-white px-4 py-3' : 'bg-white/80 px-3 py-2'
          }`}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500">
            <TrendingUp size={14} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-medium text-emerald-600 leading-none">Финансы</p>
            <p className="text-sm font-bold text-zinc-900 leading-tight">{profit.toLocaleString('ru-RU')} ₽</p>
          </div>
          {expanded === 'profit' ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
        </button>

        <button
          onClick={() => toggle('live')}
          className={`flex items-center gap-1.5 backdrop-blur-md rounded-full shadow-lg shadow-black/10 border border-white/20 transition-all ${
            expanded === 'live' ? 'bg-white px-4 py-3' : 'bg-white/80 px-3 py-2'
          }`}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500">
            <Zap size={14} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-medium text-violet-600 leading-none">Live</p>
            <p className="text-sm font-bold text-zinc-900 leading-tight">{leadsCount}</p>
          </div>
        </button>

        <button
          onClick={() => toggle('issues')}
          className={`flex items-center gap-2 backdrop-blur-md rounded-full shadow-lg shadow-black/10 border border-white/20 transition-all active:scale-95 ${
            expanded === 'issues' ? 'bg-white px-4 py-3' : 'bg-white/80 px-3 py-2'
          }`}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500">
            <AlertTriangle size={14} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-medium text-red-600 leading-none">Issues</p>
            <p className="text-sm font-bold text-zinc-900 leading-tight">{errorCount}</p>
          </div>
        </button>

        <button
          onClick={() => toggle('resources')}
          className={`flex items-center gap-2 backdrop-blur-md rounded-full shadow-lg shadow-black/10 border border-white/20 transition-all active:scale-95 ${
            expanded === 'resources' ? 'bg-white px-4 py-3' : 'bg-white/80 px-3 py-2'
          }`}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500">
            <Server size={14} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-medium text-blue-600 leading-none">Ресурсы</p>
            <p className="text-sm font-bold text-zinc-900 leading-tight">{hosting.toLocaleString('ru-RU')} ₽</p>
          </div>
        </button>
      </div>

      {/* Раскрытая карточка — Финансы */}
      {expanded === 'profit' && (
        <div className="mx-auto max-w-sm bg-white rounded-[40px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-emerald-500/10">
                <TrendingUp size={20} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-[11px] text-zinc-400">Чистая прибыль</p>
                <p className="text-[22px] font-black text-zinc-900">{profit.toLocaleString('ru-RU')} ₽</p>
              </div>
            </div>
            <button onClick={() => setExpanded(null)} className="p-1.5 rounded-full bg-zinc-100">
              <X size={14} className="text-zinc-500" />
            </button>
          </div>

          <div className="mb-4">
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
              <div className="flex h-full">
                <div className="bg-emerald-500 rounded-l-full" style={{ width: '80%' }} />
                <div className="bg-zinc-200 rounded-r-full" style={{ width: '20%' }} />
              </div>
            </div>
            <div className="flex justify-between mt-1.5 text-[10px]">
              <span className="text-zinc-400">Мастер 80%</span>
              <span className="text-zinc-400">Комиссия 20%</span>
            </div>
          </div>

          <button
            onClick={onFinanceClick}
            className="w-full py-3 bg-emerald-500 text-white rounded-[14px] font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <ShoppingCart size={16} />
            Взять заказ
          </button>
        </div>
      )}

      {/* Раскрытая карточка — Issues */}
      {expanded === 'issues' && (
        <div className="mx-auto max-w-sm bg-white rounded-[40px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-red-500/10">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <p className="text-[11px] text-zinc-400">Проблемные заказы</p>
                <p className="text-[22px] font-black text-zinc-900">{errorCount} {errorCount === 1 ? 'заказ' : 'заказа'}</p>
              </div>
            </div>
            <button onClick={() => setExpanded(null)} className="p-1.5 rounded-full bg-zinc-100">
              <X size={14} className="text-zinc-500" />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-[12px]">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-zinc-900">Срыв сроков</p>
                <p className="text-[11px] text-zinc-400">Требует внимания</p>
              </div>
            </div>
          </div>

          <button
            onClick={onIssuesClick}
            className="w-full py-3 bg-red-500 text-white rounded-[14px] font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <ShoppingCart size={16} />
            Взять заказ
          </button>
        </div>
      )}

      {/* Раскрытая карточка — Ресурсы */}
      {expanded === 'resources' && (
        <div className="mx-auto max-w-sm bg-white rounded-[40px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-blue-500/10">
                <Server size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[11px] text-zinc-400">Ресурсы / Хостинг</p>
                <p className="text-[22px] font-black text-zinc-900">{hosting.toLocaleString('ru-RU')} ₽</p>
              </div>
            </div>
            <button onClick={() => setExpanded(null)} className="p-1.5 rounded-full bg-zinc-100">
              <X size={14} className="text-zinc-500" />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-[12px]">
              <span className="text-[12px] text-zinc-500">Mapbox API</span>
              <span className="text-[12px] font-bold text-zinc-700">Активен</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-[12px]">
              <span className="text-[12px] text-zinc-500">Turbopack</span>
              <span className="text-[12px] font-bold text-zinc-700">Активен</span>
            </div>
          </div>

          <button
            onClick={onResourcesClick}
            className="w-full py-3 bg-blue-500 text-white rounded-[14px] font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <ShoppingCart size={16} />
            Взять заказ
          </button>
        </div>
      )}
    </div>
  );
}
