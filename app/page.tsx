'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { LeadsProvider, useLeads, type Lead } from '@/lib/leads-context';
import { calcMasterProfit } from '@/lib/orders';

const MapView = dynamic(() => import('../components/MapView'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#9ca3af', fontWeight: 500 }}>Загрузка карты Москвы...</span>
    </div>
  ),
});

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string; label: string }> = {
    new: { bg: '#FEF3C7', text: '#D97706', label: 'Новый' },
    pending: { bg: '#FEF3C7', text: '#D97706', label: 'Новый' },
    accepted: { bg: '#DBEAFE', text: '#2563EB', label: 'Принят' },
    completed: { bg: '#D1FAE5', text: '#059669', label: 'Выполнен' },
    cancelled: { bg: '#FEE2E2', text: '#DC2626', label: 'Отменён' },
  };
  const c = colors[status] || colors.new;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 9999, backgroundColor: c.bg, color: c.text, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: c.text }} />
      {c.label}
    </span>
  );
}

function ProfileScreen() {
  return (
    <div style={{ position: 'absolute', inset: 0, bottom: 56, zIndex: 20, overflowY: 'auto', backgroundColor: '#F2F2F7', padding: '80px 16px 112px' }}>
      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <div style={{ borderRadius: 20, border: '1px solid rgba(0,0,0,0.06)', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', padding: 24, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Профиль мастера</h2>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Настройки и статистика</p>
        </div>
        <div style={{ borderRadius: 20, border: '1px solid rgba(0,0,0,0.06)', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Профиль будет доработан позже.</p>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const [activeTab, setActiveTab] = useState<'map' | 'orders' | 'profile'>('map');
  const { leads, paused, setPaused, acceptLead, completeLead } = useLeads();

  const activeLeads = leads.filter((l) => l.status === 'new' || l.status === 'accepted');
  const completedLeads = leads.filter((l) => l.status === 'completed');

  return (
    <main style={{ height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', position: 'relative' }}>
      {/* MAP */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <MapView />
      </div>

      {/* HEADER */}
      <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', borderRadius: 12, padding: '8px 14px' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>BroVerse</span>
          <span style={{ fontSize: 10, color: '#9ca3af' }}>Мастер</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', borderRadius: 12, padding: '8px 14px', cursor: 'pointer' }} onClick={() => setPaused(!paused)}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: paused ? '#EF4444' : '#10B981' }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{paused ? 'Оффлайн' : 'Онлайн'}</span>
        </div>
      </div>

      {/* ORDERS PANEL */}
      {activeTab === 'orders' && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 56, top: '40%', zIndex: 20, overflowY: 'auto', borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#F2F2F7', boxShadow: '0 -8px 32px rgba(0,0,0,0.15)' }}>
          <div style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 8, backgroundColor: 'rgba(242,242,247,0.9)', backdropFilter: 'blur(20px)', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#d1d5db' }} />
          </div>
          <div style={{ padding: '0 16px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E' }}>Заказы ({activeLeads.length})</h2>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>Выполнено: {completedLeads.length}</span>
            </div>
            {leads.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af' }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>📡</p>
                <p style={{ fontSize: 14, fontWeight: 500 }}>Ожидание заказов...</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Новый заказ появится здесь автоматически</p>
              </div>
            )}
            {leads.map((lead) => (
              <div key={lead.id} style={{ marginBottom: 12, borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', backgroundColor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1C1C1E', margin: 0 }}>{lead.service_name}</p>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>{lead.client_name || 'Клиент'}</p>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
                  <p style={{ margin: '1px 0' }}>📞 {lead.client_phone || '—'}</p>
                  <p style={{ margin: '1px 0' }}>📍 {lead.address || '—'}</p>
                  {((lead.metadata as any)?.description) && (
                    <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: 12 }}>{String((lead.metadata as any).description)}</p>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#d1d5db', marginBottom: 8 }}>
                  {new Date(lead.created_at).toLocaleString('ru-RU')}
                </div>
                {lead.status === 'new' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => acceptLead(lead.id)} style={{ flex: 1, borderRadius: 12, padding: '8px 0', backgroundColor: '#007AFF', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Принять</button>
                  </div>
                )}
                {lead.status === 'accepted' && (
                  <button type="button" onClick={() => completeLead(lead.id)} style={{ width: '100%', borderRadius: 12, padding: '8px 0', backgroundColor: '#10B981', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Выполнено ✓</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFILE */}
      {activeTab === 'profile' && <ProfileScreen />}

      {/* BOTTOM NAV */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30, display: 'flex', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderTop: '0.5px solid rgba(0,0,0,0.08)', padding: '8px 0', paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        {[
          { id: 'map' as const, icon: '🗺', label: 'Карта' },
          { id: 'orders' as const, icon: '📋', label: 'Заказы' },
          { id: 'profile' as const, icon: '👤', label: 'Профиль' },
        ].map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', color: activeTab === tab.id ? '#007AFF' : '#9ca3af', fontSize: 10, fontWeight: 600 }}>
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </main>
  );
}

export default function HomeWrapper() {
  return (
    <LeadsProvider>
      <Home />
    </LeadsProvider>
  );
}
