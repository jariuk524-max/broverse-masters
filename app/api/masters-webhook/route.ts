import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { answerCallback, sendHistoryReport } from '@/lib/masters-bot';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const CLIENT_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

const STATUS_LABELS: Record<string, { text: string; emoji: string }> = {
  new: { text: 'Новый', emoji: '🆕' },
  pending: { text: 'Новый', emoji: '🆕' },
  accepted: { text: 'В работе', emoji: '🔧' },
  completed: { text: 'Выполнен', emoji: '✅' },
  cancelled: { text: 'Отменён', emoji: '❌' },
};

async function notifyClientStatusChange(
  clientChatId: number,
  orderId: string,
  serviceName: string,
  status: string,
) {
  if (!CLIENT_BOT_TOKEN) return;

  const statusInfo = STATUS_LABELS[status] || { text: status, emoji: '📋' };

  const text = [
    `${statusInfo.emoji} *Обновление заказа*`,
    ``,
    `📋 *${serviceName}*`,
    `Статус: ${statusInfo.text}`,
    ``,
    `Заказ #${orderId.slice(0, 8)}`,
  ].join('\n');

  try {
    await fetch(`https://api.telegram.org/bot${CLIENT_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: clientChatId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🏠 Открыть BroVerse', web_app: { url: 'https://broverse-client.vercel.app' } }],
          ],
        },
      }),
    });
  } catch {
    return;
  }
}

async function fetchAndNotifyClient(orderId: string, status: string) {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('service_name, metadata')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      console.error('[masters-webhook] Failed to fetch order for client notification:', error);
      return;
    }

    const clientChatId = (order.metadata as any)?.client_chat_id;
    if (clientChatId) {
      await notifyClientStatusChange(clientChatId, orderId, order.service_name, status);
    }
  } catch (err) {
    console.error('[masters-webhook] Error fetching order:', err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.callback_query) {
      const { id, data, message } = body.callback_query;

      if (!data) {
        await answerCallback(id);
        return NextResponse.json({ ok: true });
      }

      const [action, orderId] = data.split(':');

      if (action === 'accept') {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'accepted' })
          .eq('id', orderId);

        if (error) {
          console.error('[masters-webhook] Update error:', error);
          await answerCallback(id, 'Ошибка при обновлении статуса');
        } else {
          await answerCallback(id, '✅ Заказ принят');
          await fetchAndNotifyClient(orderId, 'accepted');
        }
      } else if (action === 'cancel') {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId);

        if (error) {
          console.error('[masters-webhook] Update error:', error);
          await answerCallback(id, 'Ошибка при обновлении статуса');
        } else {
          await answerCallback(id, '❌ Заказ отклонён');
          await fetchAndNotifyClient(orderId, 'cancelled');
        }
      } else {
        await answerCallback(id);
      }

      return NextResponse.json({ ok: true });
    }

    if (body.message) {
      const text = body.message?.text || '';
      const chatId = body.message.chat.id;

      if (text === '/start') {
        const MASTERS_BOT_TOKEN = process.env.MASTERS_BOT_TOKEN;
        if (MASTERS_BOT_TOKEN) {
          await fetch(`https://api.telegram.org/bot${MASTERS_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '🔧 BroVerse Masters Bot\n\nЭтот бот присылает уведомления о новых заказах.\n\nНажмите «Кабинет» в меню для открытия панели управления.',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '📱 Открыть кабинет', web_app: { url: 'https://broverse-masters.vercel.app' } }],
                ],
              },
            }),
          });
        }
      }

      if (text === '/history') {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('id, service_name, status, created_at, metadata')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('[masters-webhook] History fetch error:', error);
        } else {
          const enriched = (orders || []).map((o) => ({
            id: o.id,
            service_name: o.service_name,
            status: o.status,
            price: (o.metadata as any)?.price ? Number((o.metadata as any).price) : 0,
            created_at: o.created_at,
          }));
          await sendHistoryReport(chatId, enriched);
        }
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[masters-webhook] Error:', error);
    return NextResponse.json({ ok: true });
  }
}
