'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export type LeadSource = 'BroWash' | 'BroMove' | 'BroFrame' | 'BroBuild' | 'BroRent' | 'BroCare';

export type Lead = {
  id: string | number;
  source: LeadSource;
  domain: string;
  title: string;
  price: number;
  address: string;
  coords: [number, number];
  timestamp: number;
  status: 'new' | 'accepted' | 'completed';
  phone: string;
  comment: string;
};

type LeadsContextType = {
  leads: Lead[];
  activeLead: Lead | null;
  paused: boolean;
  setPaused: (v: boolean) => void;
  addLead: (lead: Omit<Lead, 'id' | 'timestamp' | 'status'>) => void;
  acceptLead: (id: string) => void;
  completeLead: () => void;
};

const LeadsContext = createContext<LeadsContextType | null>(null);

const SOURCE_COLORS: Record<LeadSource, string> = {
  BroWash: '#4285F4',
  BroMove: '#EA4335',
  BroFrame: '#FBBC05',
  BroBuild: '#34A853',
  BroRent: '#007AFF',
  BroCare: '#8B5CF6',
};

function deriveSource(serviceName: string): LeadSource {
  const s = serviceName.toLowerCase();
  if (s.includes('химчист') || s.includes('уборк') || s.includes('мыть') || s.includes('чистк') || s.includes('wash')) return 'BroWash';
  if (s.includes('переезд') || s.includes('груз') || s.includes('move') || s.includes('сборк')) return 'BroMove';
  if (s.includes('ремонт') || s.includes('сантех') || s.includes('электри') || s.includes('build')) return 'BroBuild';
  if (s.includes('телефон') || s.includes('iphone') || s.includes('ноутбук') || s.includes('frame')) return 'BroFrame';
  if (s.includes('инструмент') || s.includes('аренд') || s.includes('rent')) return 'BroRent';
  return 'BroWash';
}

function deriveDomain(source: LeadSource): string {
  const map: Record<LeadSource, string> = {
    BroWash: 'wash', BroMove: 'move', BroFrame: 'frame',
    BroBuild: 'build', BroRent: 'rent', BroCare: 'care',
  };
  return map[source];
}

function dbRowToLead(row: Record<string, unknown>): Lead {
  const source = deriveSource((row.service_name as string) || '');
  return {
    id: row.id as string,
    source,
    domain: deriveDomain(source),
    title: (row.service_name as string) || 'Заказ',
    price: ((row.metadata as Record<string, unknown>)?.price as number) || 0,
    address: (row.address as string) || '',
    coords: [(row.lat as number) || 55.7558, (row.lng as number) || 37.6173],
    timestamp: new Date(row.created_at as string).getTime(),
    status: (row.status as string) === 'completed' ? 'completed' : (row.status as string) === 'accepted' ? 'accepted' : 'new',
    phone: (row.client_phone as string) || '',
    comment: ((row.metadata as Record<string, unknown>)?.description as string) || '',
  };
}

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { data, error } = await getSupabase()
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!cancelled && data) {
          setLeads(data.map(dbRowToLead));
        }
        if (error) console.error('[LeadsContext] Fetch error:', error);
      } catch (e) {
        console.error('[LeadsContext] Init error:', e);
      }
    }

    init();

    const channel = getSupabase()
      .channel('leads-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        if (!cancelled) setLeads((prev) => [dbRowToLead(payload.new as Record<string, unknown>), ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        const updated = dbRowToLead(payload.new as Record<string, unknown>);
        if (!cancelled) setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' }, (payload) => {
        const deleted = payload.old as Record<string, unknown>;
        if (!cancelled) setLeads((prev) => prev.filter((l) => l.id !== deleted.id));
      })
      .subscribe();

    return () => { cancelled = true; channel.unsubscribe(); };
  }, []);

  const addLead = useCallback((lead: Omit<Lead, 'id' | 'timestamp' | 'status'>) => {
    const newLead: Lead = { ...lead, id: Date.now(), timestamp: Date.now(), status: 'new' };
    setLeads((prev) => [newLead, ...prev]);
  }, []);

  const acceptLead = useCallback((id: string) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'accepted' } : l)));
    const lead = leads.find((l) => l.id === id);
    if (lead) {
      getSupabase().from('orders').update({ status: 'accepted' }).eq('id', String(id));
      setActiveLead(lead);
    }
  }, [leads]);

  const completeLead = useCallback(() => {
    if (activeLead) {
      setLeads((prev) => prev.map((l) => (l.id === activeLead.id ? { ...l, status: 'completed' } : l)));
      getSupabase().from('orders').update({ status: 'completed' }).eq('id', String(activeLead.id));
      setActiveLead(null);
    }
  }, [activeLead]);

  return (
    <LeadsContext.Provider value={{ leads, activeLead, paused, setPaused, addLead, acceptLead, completeLead }}>
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider');
  return ctx;
}

export { SOURCE_COLORS };
