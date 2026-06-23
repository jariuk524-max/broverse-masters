'use client';

import { useState, useEffect } from 'react';
import { Power, Coffee, X } from 'lucide-react';
import { useLeads } from '@/lib/leads-context';

const BREAK_OPTIONS = [5, 10, 15, 20, 30];

function formatBreakTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function ShiftToggle() {
  const { paused, setPaused } = useLeads();
  const [onShift, setOnShift] = useState(false);
  const [breakRemaining, setBreakRemaining] = useState(0);
  const [breakMinutes, setBreakMinutes] = useState(0);
  const [showPicker, setShowPicker] = useState(false);

  const onBreak = breakRemaining > 0;

  useEffect(() => {
    if (!onBreak) return;
    const id = setInterval(() => {
      setBreakRemaining((r) => {
        if (r <= 1) {
          setPaused(false);
          setBreakMinutes(0);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onBreak, setPaused]);

  const startBreak = (minutes: number) => {
    setBreakMinutes(minutes);
    setBreakRemaining(minutes * 60);
    setPaused(true);
    setShowPicker(false);
  };

  const endBreak = () => {
    setBreakRemaining(0);
    setBreakMinutes(0);
    setPaused(false);
  };

  const toggleShift = () => {
    if (onShift && !onBreak) {
      setOnShift(false);
      return;
    }
    setOnShift(true);
  };

  if (showPicker) {
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-[16px] p-3 shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/40">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <p className="text-[11px] font-bold text-zinc-900">Перерыв</p>
          <button onClick={() => setShowPicker(false)} className="p-0.5 rounded-full bg-zinc-100 active:scale-90">
            <X size={10} className="text-zinc-400" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {BREAK_OPTIONS.map((min) => (
            <button
              key={min}
              onClick={() => startBreak(min)}
              className="flex flex-col items-center py-2 rounded-[10px] bg-zinc-50 active:bg-emerald-50 active:scale-95 transition-all"
            >
              <span className="text-[16px] font-black text-zinc-900">{min}</span>
              <span className="text-[8px] text-zinc-400">мин</span>
            </button>
          ))}
        </div>
        <button
          onClick={toggleShift}
          className="w-full mt-2 py-1.5 text-[10px] font-bold text-red-500 rounded-[8px] bg-red-50 active:bg-red-100 transition-colors"
        >
          Завершить смену
        </button>
      </div>
    );
  }

  if (onBreak) {
    const progress = breakRemaining / (breakMinutes * 60);
    return (
      <div className="bg-amber-500/90 backdrop-blur-md rounded-full px-3 py-1.5 border border-amber-400/40 shadow-[0_2px_12px_rgba(245,158,11,0.3)]">
        <div className="flex items-center gap-1.5">
          <div className="relative flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
            <Coffee size={10} className="text-white" />
            <svg className="absolute inset-0 h-5 w-5 -rotate-90" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
              <circle cx="10" cy="10" r="8" fill="none" stroke="white" strokeWidth="2"
                strokeDasharray={50.3} strokeDashoffset={50.3 * (1 - progress)}
                strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-[9px] text-white/60 leading-none">Перерыв</p>
            <p className="text-[12px] font-bold text-white leading-tight">{formatBreakTime(breakRemaining)}</p>
          </div>
          <button onClick={endBreak} className="ml-1 h-5 w-5 rounded-full bg-white/20 flex items-center justify-center active:scale-90">
            <X size={10} className="text-white" />
          </button>
        </div>
      </div>
    );
  }

  if (!onShift) {
    return (
      <button
        onClick={toggleShift}
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/80 backdrop-blur-md border border-white/30 shadow-[0_2px_8px_rgba(0,0,0,0.08)] active:scale-95 transition-all"
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100">
          <Power size={10} className="text-zinc-400" />
        </div>
        <span className="text-[11px] font-bold text-zinc-500">Оффлайн</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setShowPicker(true)}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-emerald-500/90 backdrop-blur-md border border-emerald-400/40 shadow-[0_2px_12px_rgba(52,199,89,0.3)] active:scale-95 transition-all"
    >
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
        <Power size={10} className="text-white" />
      </div>
      <span className="text-[11px] font-bold text-white">На смене</span>
      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
    </button>
  );
}
