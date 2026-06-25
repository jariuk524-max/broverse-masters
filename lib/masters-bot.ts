const MASTERS_BOT_TOKEN = process.env.MASTERS_BOT_TOKEN!;
const MASTERS_CHAT_ID = process.env.NEXT_PUBLIC_MASTERS_CHAT_ID!;

const STATUS_LABELS: Record<string, string> = {
  new: '🆕 Новый',
  pending: '🆕 Новый',
  accepted: '🔧 В работе',
  completed: '✅ Выполнен',
  cancelled: '❌ Отменён',
};

export async function notifyMastersNewOrder(order: {
  id: string;
  service_name: string;
  client_name: string;
  client_phone: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  metadata?: Record<string, unknown>;
}) {
  if (!MASTERS_BOT_TOKEN || !MASTERS_CHAT_ID) {
    console.error('[masters-bot] MASTERS_BOT_TOKEN or MASTERS_CHAT_ID not set');
    return;
  }

  const price = (order.metadata as any)?.price;
  const description = (order.metadata as any)?.description;

  const lines = [
    `🔔 *Новый заказ*`,
    ``,
    `📋 *${order.service_name}*`,
    ``,
    `👤 ${order.client_name || 'Не указано'}`,
    `📞 ${order.client_phone || 'Не указано'}`,
    `📍 ${order.address || 'Не указано'}`,
  ];

  if (price) lines.push(`💰 ${Number(price).toLocaleString('ru-RU')} ₽`);
  if (description) lines.push(`📝 ${description}`);

  const mapUrl = order.lat && order.lng
    ? `https://yandex.ru/maps/?rtext=${order.lat},${order.lng}&rtt=auto`
    : null;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Принять', callback_data: `accept:${order.id}` },
        { text: '❌ Отклонить', callback_data: `cancel:${order.id}` },
      ],
      ...(mapUrl ? [[{ text: '🗺 Маршрут', url: mapUrl }]] : []),
      [{ text: '📱 Открыть кабинет', web_app: { url: 'https://broverse-masters.vercel.app' } }],
    ],
  };

  const text = lines.join('\n');

  try {
    const res = await fetch(`https://api.telegram.org/bot${MASTERS_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: MASTERS_CHAT_ID,
        text,
        parse_mode: 'Markdown',
        reply_markup: keyboard,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[masters-bot] Telegram API error:', err);
    } else {
      console.log(`[masters-bot] Notification sent for order ${order.id}`);
    }
  } catch (err) {
    console.error('[masters-bot] Failed to send notification:', err);
  }
}

export async function updateMastersOrderStatus(
  orderId: string,
  status: string,
  chatId: number,
  messageId: number,
) {
  if (!MASTERS_BOT_TOKEN) return;

  const label = STATUS_LABELS[status] || status;

  try {
    await fetch(`https://api.telegram.org/bot${MASTERS_BOT_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: `Статус заказа ${orderId.slice(0, 8)} обновлён: ${label}`,
      }),
    });
  } catch (err) {
    console.error('[masters-bot] Failed to update message:', err);
  }
}

export async function setMastersBotWebApp() {
  if (!MASTERS_BOT_TOKEN) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${MASTERS_BOT_TOKEN}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        menu_button: {
          type: 'web_app',
          text: '🏠 Кабинет',
          web_app: { url: 'https://broverse-masters.vercel.app' },
        },
      }),
    });

    const data = await res.json();
    console.log('[masters-bot] Menu button set:', data);
    return data;
  } catch (err) {
    console.error('[masters-bot] Failed to set menu button:', err);
  }
}

export async function answerCallback(callbackQueryId: string, text?: string) {
  if (!MASTERS_BOT_TOKEN) return;

  try {
    await fetch(`https://api.telegram.org/bot${MASTERS_BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || '',
        show_alert: !!text,
      }),
    });
  } catch (err) {
    console.error('[masters-bot] Failed to answer callback:', err);
  }
}
