import { supabase } from './supabase';

export const PROFIT_RATE = 0.8;

export type OrderStatus = 'new' | 'accepted' | 'completed' | 'cancelled';

export type Order = {
  id: string;
  coords: [number, number];
  status: OrderStatus;
  title: string;
  service_name: string;
  address: string;
  client_name: string;
  client_phone: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

function dbRowToOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    coords: [(row.lat as number) || 55.7558, (row.lng as number) || 37.6173],
    status: (row.status as OrderStatus) || 'new',
    title: (row.service_name as string) || '',
    service_name: (row.service_name as string) || '',
    address: (row.address as string) || '',
    client_name: (row.client_name as string) || '',
    client_phone: (row.client_phone as string) || '',
    metadata: (row.metadata as Record<string, unknown>) || null,
    created_at: (row.created_at as string) || '',
  };
}

export function calcProfit(total: number) {
  return Math.round(total * PROFIT_RATE);
}

export function calcMasterProfit(orders: Order[]) {
  return orders.filter((o) => o.status === 'completed').length;
}

export async function fetchOrdersFromSupabase(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) {
    console.error('[BroVerse] Supabase fetch error:', error);
    return [];
  }

  return data.map(dbRowToOrder);
}

export async function createOrderInSupabase(payload: {
  service_name: string;
  client_name?: string;
  client_phone?: string;
  address?: string;
  lat?: number;
  lng?: number;
  metadata?: Record<string, unknown>;
}) {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      service_name: payload.service_name,
      client_name: payload.client_name || '',
      client_phone: payload.client_phone || '',
      address: payload.address || '',
      lat: payload.lat || 55.7558,
      lng: payload.lng || 37.6173,
      metadata: payload.metadata || null,
      status: 'new',
    })
    .select()
    .single();

  if (error) {
    console.error('[BroVerse] Supabase insert error:', error);
    return null;
  }

  return data;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId);

  if (error) {
    console.error('[BroVerse] Supabase update error:', error);
  }
}
