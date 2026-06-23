'use client';

import { useState } from 'react';
import { TrendingUp, X, ShoppingCart } from 'lucide-react';

interface DailyEarningsProps {
  profit: number;
  onTakeOrder: () => void;
}

export default function DailyEarnings({ profit, onTakeOrder }: DailyEarningsProps) {
  const [expanded, setExpanded] = useState(false);

  if (expanded) {
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-[20px] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/40 max-w-[260px]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-emerald-500">
              <TrendingUp size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[9px] text-zinc-400 leading-none">Сегодня</p>
              <p className="text-[18px] font-black text-zinc-900 leading-tight">{profit.toLocaleString('ru-RU')} ₽</p>
            </div>
          </div>
          <button onClick={() => setExpanded(false)} className="p-1 rounded-full bg-zinc-100 active:scale-90 transition-transform">
            <X size={12} className="text-zinc-400" />
          </button>
        </div>

        <div className="mb-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <div className="flex h-full">
              <div className="bg-emerald-500 rounded-l-full" style={{ width: '80%' }} />
              <div className="bg-zinc-200 rounded-r-full" style={{ width: '20%' }} />
            </div>
          </div>
          <div className="flex justify-between mt-1 text-[9px] text-zinc-400">
            <span>Мастер 80%</span>
            <span>Комиссия 20%</span>
          </div>
        </div>

        <button
          onClick={() => { setExpanded(false); onTakeOrder(); }}
          className="w-full py-2.5 bg-zinc-900 text-white rounded-[12px] font-bold text-[12px] active:scale-95 transition-transform flex items-center justify-center gap-1.5"
        >
          <ShoppingCart size={13} />
          Взять заказ
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setExpanded(true)}
      className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-3 py-2 shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-white/30 active:scale-95 transition-transform"
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
        <TrendingUp size={11} className="text-white" />
      </div>
      <div className="text-left">
        <p className="text-[8px] font-medium text-zinc-400 leading-none">Сегодня</p>
        <p className="text-[13px] font-bold text-zinc-900 leading-tight">{profit.toLocaleString('ru-RU')} ₽</p>
      </div>
    </button>
  );
}
