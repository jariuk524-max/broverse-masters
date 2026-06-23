'use client';

import { Phone, Zap } from 'lucide-react';
import type { DomainConfig } from '@/config/ecosystem';

interface ServiceFooterProps {
  config: DomainConfig;
  onOrder?: () => void;
}

export default function ServiceFooter({ config, onOrder }: ServiceFooterProps) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/60 backdrop-blur-2xl"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto max-w-lg flex gap-3 p-4">
        <a
          href="tel:+79001234567"
          className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-4 rounded-[20px] border border-white/20 bg-white/10 text-white text-xs sm:text-sm font-bold hover:bg-white/20 transition-colors"
        >
          <Phone size={16} />
          Позвонить
        </a>
        <button
          type="button"
          onClick={onOrder}
          className="flex-[1.5] flex items-center justify-center gap-2 py-3 sm:py-4 rounded-[20px] bg-white text-black text-xs sm:text-sm font-black transition-all hover:bg-white/90 active:scale-[0.98]"
        >
          <Zap size={16} />
          Заказать {config.title}
        </button>
      </div>
    </div>
  );
}
