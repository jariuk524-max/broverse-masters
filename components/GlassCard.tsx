'use client';

import { type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: string;
}

export default function GlassCard({ children, className = '', glow }: GlassCardProps) {
  return (
    <div className={`relative rounded-[40px] bg-white/5 backdrop-blur-3xl border border-white/10 overflow-hidden ${className}`}>
      {glow && (
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full blur-[80px] opacity-20"
          style={{ background: glow }}
        />
      )}
      {glow && (
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full blur-[60px] opacity-15"
          style={{ background: glow }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
