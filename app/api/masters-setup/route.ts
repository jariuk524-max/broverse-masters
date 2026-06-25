import { NextResponse } from 'next/server';
import { setMastersBotWebApp } from '@/lib/masters-bot';

const MASTERS_BOT_TOKEN = process.env.MASTERS_BOT_TOKEN!;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'set-webhook') {
      const baseUrl = body.url || 'https://broverse-masters.vercel.app';
      const webhookUrl = `${baseUrl}/api/masters-webhook`;

      const res = await fetch(`https://api.telegram.org/bot${MASTERS_BOT_TOKEN}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['callback_query', 'message'],
        }),
      });

      const data = await res.json();
      return NextResponse.json({ webhook: data });
    }

    if (action === 'set-menu') {
      const data = await setMastersBotWebApp();
      return NextResponse.json({ menu: data });
    }

    if (action === 'set-chat-id') {
      const chatId = body.chat_id;
      if (!chatId) {
        return NextResponse.json({ error: 'chat_id required' }, { status: 400 });
      }
      return NextResponse.json({
        message: `Set NEXT_PUBLIC_MASTERS_CHAT_ID=${chatId} in Vercel env vars`,
        chat_id: chatId,
      });
    }

    if (action === 'get-info') {
      const res = await fetch(`https://api.telegram.org/bot${MASTERS_BOT_TOKEN}/getMe`);
      const data = await res.json();
      return NextResponse.json({ bot: data });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[setup] Error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    usage: 'POST with { action: "set-webhook" | "set-menu" | "get-info" | "set-chat-id" }',
  });
}
