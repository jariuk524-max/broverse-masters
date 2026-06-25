'use client';

import { User, ClipboardList, Map, History } from 'lucide-react';

export type TabId = 'map' | 'orders' | 'profile' | 'history';

interface TabBarProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export default function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-black/[0.06] bg-white/70 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {[
          { id: 'map' as TabId, label: 'Карта', icon: Map },
          { id: 'orders' as TabId, label: 'Заказы', icon: ClipboardList },
          { id: 'history' as TabId, label: 'История', icon: History },
          { id: 'profile' as TabId, label: 'Профиль', icon: User },
        ].map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-[24px] py-2 transition-opacity active:opacity-60"
            >
              <Icon
                size={24}
                strokeWidth={isActive ? 2.25 : 2}
                className={isActive ? 'text-[#007AFF]' : 'text-[#8E8E93]'}
              />
              <span className={`text-[10px] font-medium tracking-tight ${isActive ? 'text-[#007AFF]' : 'text-[#8E8E93]'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
