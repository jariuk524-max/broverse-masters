'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export type Lead = {
  id: string;
  service_name: string;
  client_name: string;
  client_phone: string;
  address: string;
  lat: number;
  lng: number;
  status: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type LeadsContextType = {
  leads: Lead[];
  activeLead: Lead | null;
  paused: boolean;
  setPaused: (v: boolean) => void;
  acceptLead: (id: string) => void;
  completeLead: (id: string) => void;
};

const LeadsContext = createContext<LeadsContextType | null>(null);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [paused, setPaused] = useState(false);

  // Fetch initial orders + subscribe to realtime
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!cancelled && data) {
          setLeads(data as Lead[]);
        }
        if (error) {
          console.error('[LeadsContext] Fetch error:', error);
        }
      } catch (e) {
        console.error('[LeadsContext] Init error:', e);
      }
    }

    init();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('[LeadsContext] New order:', payload.new);
          setLeads((prev) => [payload.new as Lead, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updated = payload.new as Lead;
          setLeads((prev) =>
            prev.map((l) => (l.id === updated.id ? updated : l))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'orders' },
        (payload) => {
          const deleted = payload.old as Lead;
          setLeads((prev) => prev.filter((l) => l.id !== deleted.id));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      channel.unsubscribe();
    };
  }, []);

  const acceptLead = useCallback((id: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'accepted' } : l))
    );
    // Update in Supabase
    supabase.from('orders').update({ status: 'accepted' }).eq('id', id);
  }, []);

  const completeLead = useCallback((id: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'completed' } : l))
    );
    setActiveLead(null);
    // Update in Supabase
    supabase.from('orders').update({ status: 'completed' }).eq('id', id);
  }, []);

  return (
    <LeadsContext.Provider
      value={{
        leads,
        activeLead,
        paused,
        setPaused,
        acceptLead,
        completeLead,
      }}
    >
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider');
  return ctx;
}

export const SOURCE_COLORS: Record<string, string> = {
  BroWash: '#4285F4',
  BroMove: '#EA4335',
  BroFrame: '#FBBC05',
  BroBuild: '#34A853',
  BroRent: '#007AFF',
  BroCare: '#8B5CF6',
};
