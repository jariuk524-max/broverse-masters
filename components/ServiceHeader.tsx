import { ArrowLeft } from 'lucide-react';
import type { DomainConfig } from '@/config/ecosystem';

interface ServiceHeaderProps {
  config: DomainConfig;
}

export default function ServiceHeader({ config }: ServiceHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-2xl">
      <div className="mx-auto flex h-14 sm:h-16 max-w-lg items-center justify-between px-4 sm:px-5">
        <a
          href="http://localhost:3001"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          BroVerse
        </a>
        <span
          className="text-[10px] sm:text-xs font-bold tracking-wider uppercase"
          style={{ color: config.color }}
        >
          {config.title}
        </span>
      </div>
    </header>
  );
}
