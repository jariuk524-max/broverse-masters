'use client';

import { type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ServiceHeader from './ServiceHeader';
import ServiceFooter from './ServiceFooter';
import { type DomainConfig, getPriceForChannel, type OrderSource } from '@/config/ecosystem';

interface ServiceLayoutProps {
  config: DomainConfig;
  children: ReactNode;
}

function ServiceLayoutInner({ config, children }: ServiceLayoutProps) {
  const searchParams = useSearchParams();
  const from = (searchParams.get('from') as OrderSource) || 'web';
  const price = getPriceForChannel(config.id, from);

  return (
    <div className="min-h-[100dvh] font-sans" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif' }}>
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse at top, ${config.color}20 0%, transparent 50%), radial-gradient(ellipse at bottom right, ${config.color}10 0%, transparent 50%), #000000`,
        }}
      />

      <ServiceHeader config={config} />

      <main className="mx-auto max-w-lg pb-24">
        {children}
      </main>

      <ServiceFooter config={config} />
    </div>
  );
}

export default function ServiceLayout({ config, children }: ServiceLayoutProps) {
  return (
    <Suspense>
      <ServiceLayoutInner config={config}>{children}</ServiceLayoutInner>
    </Suspense>
  );
}
