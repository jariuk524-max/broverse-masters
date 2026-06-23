import { supabase, supabaseAdmin } from './supabase';

export const PROFIT_RATE = 0.8;

export type OrderStatus = 'success' | 'error';

export type ServiceType = 'cleaning' | 'assembly' | 'plumbing';

export type Order = {
  id: string | number;
  coords: [number, number];
  status: OrderStatus;
  price: number;
  title: string;
  service: ServiceType;
  address: string;
};

export type DbOrder = {
  id: string;
  created_at: string;
  title: string;
  service: string;
  address: string;
  price: number;
  lat: number;
  lng: number;
  status: string;
  client_name: string;
  client_phone: string;
  client_comment: string;
  master_id: string;
};

function dbOrderToOrder(db: DbOrder): Order {
  return {
    id: db.id,
    coords: [db.lat, db.lng],
    status: db.status === 'completed' ? 'success' : 'error',
    price: db.price,
    title: db.title,
    service: db.service as ServiceType,
    address: db.address,
  };
}

/** Profit = Total × 0.8 */
export function calcProfit(total: number) {
  return Math.round(total * PROFIT_RATE);
}

export function calcMasterProfit(orders: Order[]) {
  return orders
    .filter((o) => o.status === 'success')
    .reduce((sum, o) => sum + calcProfit(o.price), 0);
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

  return data.map(dbOrderToOrder);
}

export async function createOrderInSupabase(payload: {
  title: string;
  service?: string;
  address?: string;
  price?: number;
  lat?: number;
  lng?: number;
  client_name?: string;
  client_phone?: string;
  client_comment?: string;
}) {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      title: payload.title,
      service: payload.service || 'cleaning',
      address: payload.address || '',
      price: payload.price || 0,
      lat: payload.lat || 55.7558,
      lng: payload.lng || 37.6173,
      client_name: payload.client_name || '',
      client_phone: payload.client_phone || '',
      client_comment: payload.client_comment || '',
      status: 'new',
    })
    .select()
    .single();

  if (error) {
    console.error('[BroVerse] Supabase insert error:', error);
    return null;
  }

  return data as DbOrder;
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

/** Каталог для /orders — 3 реальных услуги */
export const CATALOG_ORDERS: Order[] = [
  {
    id: 101,
    coords: [55.7278, 37.5747],
    status: 'success',
    price: 12000,
    title: 'Химчистка дивана',
    service: 'cleaning',
    address: 'Москва, ул. Новый Арбат, 15',
  },
  {
    id: 102,
    coords: [55.7494, 37.5356],
    status: 'success',
    price: 8500,
    title: 'Сборка шкафа',
    service: 'assembly',
    address: 'Москва, Кутузовский просп., 36',
  },
  {
    id: 103,
    coords: [55.7539, 37.6208],
    status: 'success',
    price: 15000,
    title: 'Ремонт сантехники',
    service: 'plumbing',
    address: 'Москва, ул. Мясницкая, 24',
  },
];

/** Базовые точки на карте: зелёные + 1 красный Issue */
export const BASE_MAP_ORDERS: Order[] = [
  {
    id: 1,
    coords: [55.7644, 37.6057],
    status: 'success',
    price: 12000,
    title: 'Химчистка дивана',
    service: 'cleaning',
    address: 'Москва, ул. Маросейка, 11',
  },
  {
    id: 2,
    coords: [55.7494, 37.5356],
    status: 'success',
    price: 8500,
    title: 'Сборка шкафа',
    service: 'assembly',
    address: 'Москва, Кутузовский просп., 36',
  },
  {
    id: 3,
    coords: [55.7539, 37.6208],
    status: 'success',
    price: 15000,
    title: 'Ремонт сантехники',
    service: 'plumbing',
    address: 'Москва, ул. Мясницкая, 24',
  },
  {
    id: 900,
    coords: [55.7411, 37.6202],
    status: 'error',
    price: 3500,
    title: 'Инцидент — срыв сроков',
    service: 'cleaning',
    address: 'Москва, ул. Пятницкая, 2/38',
  },
];

export function getFirstErrorOrder(orders: Order[]): Order | undefined {
  return orders.find((o) => o.status === 'error');
}

export type ClientOrderPayload = {
  title?: string;
  price?: number;
  service?: ServiceType;
  address?: string;
  domain?: string;
  brand?: string;
  tagline?: string;
};
