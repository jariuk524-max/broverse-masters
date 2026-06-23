import { NextResponse } from 'next/server';
import { createOrderInSupabase, fetchOrdersFromSupabase } from '@/lib/orders';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const order = await createOrderInSupabase({
      service_name: body.service_name || body.title || 'Новый заказ',
      address: body.address || '',
      lat: body.lat || 55.7558 + (Math.random() - 0.5) * 0.04,
      lng: body.lng || 37.6173 + (Math.random() - 0.5) * 0.04,
      client_name: body.client_name || body.name || '',
      client_phone: body.client_phone || body.phone || '',
      metadata: body.metadata || null,
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Supabase insert failed' }, { status: 500 });
    }

    console.log('[API] New order saved to Supabase:', order.id);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('[API] Order error:', error);
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET() {
  try {
    const orders = await fetchOrdersFromSupabase();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('[API] Fetch error:', error);
    return NextResponse.json({ orders: [] });
  }
}
