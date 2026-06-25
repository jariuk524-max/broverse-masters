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

function getWeekLabel(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return 'Эта неделя';
  if (diffDays < 14) return 'Прошлая неделя';
  if (diffDays < 30) return 'Этот месяц';
  return 'Ранее';
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}`;
}

const PROFIT_RATE = 0.8;

export async function sendHistoryReport(chatId: number, orders: {
  id: string;
  service_name: string;
  status: string;
  price: number;
  created_at: string;
}[]) {
  if (!MASTERS_BOT_TOKEN) return;

  const completed = orders
    .filter((o) => o.status === 'completed' || o.status === 'accepted')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (completed.length === 0) {
    await fetch(`https://api.telegram.org/bot${MASTERS_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '📋 <b>История заказов</b>\n\nПока нет выполненных заказов.',
        parse_mode: 'HTML',
      }),
    });
    return;
  }

  const totalProfit = completed.reduce((s, o) => s + Math.floor(o.price * PROFIT_RATE), 0);
  const recent = completed.slice(0, 10);

  const grouped = new Map<string, typeof completed>();
  for (const order of recent) {
    const week = getWeekLabel(new Date(order.created_at).getTime());
    if (!grouped.has(week)) grouped.set(week, []);
    grouped.get(week)!.push(order);
  }

  const lines: string[] = [
    '📋 <b>История заказов</b>',
    '',
    `💰 <b>Общий заработок:</b> ${totalProfit.toLocaleString('ru-RU')} ₽`,
    `✅ <b>Выполнено:</b> ${completed.length} заказов`,
    '',
  ];

  for (const [weekLabel, weekOrders] of grouped) {
    const weekProfit = weekOrders.reduce((s, o) => s + Math.floor(o.price * PROFIT_RATE), 0);
    lines.push(`<b>📅 ${weekLabel}</b> — ${weekProfit.toLocaleString('ru-RU')} ₽`);

    for (const order of weekOrders) {
      const date = formatDate(new Date(order.created_at).getTime());
      const profit = Math.floor(order.price * PROFIT_RATE);
      lines.push(
        `  ${date}  ${order.service_name}  <b>${order.price.toLocaleString('ru-RU')} ₽</b>  → ${profit.toLocaleString('ru-RU')} ₽`
      );
    }
    lines.push('');
  }

  const text = lines.join('\n');

  try {
    await fetch(`https://api.telegram.org/bot${MASTERS_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📱 Открыть кабинет', web_app: { url: 'https://broverse-masters.vercel.app' } }],
          ],
        },
      }),
    });
  } catch (err) {
    console.error('[masters-bot] Failed to send history report:', err);
  }
}
