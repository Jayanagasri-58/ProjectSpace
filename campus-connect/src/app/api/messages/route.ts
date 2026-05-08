import { NextResponse } from 'next/server';
import { getMessages, saveMessage } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'message';
  const allMessages = getMessages();
  return NextResponse.json(allMessages.filter((m: any) => m.type === type));
}

export async function POST(req: Request) {
  const data = await req.json();
  const newMsg = {
    id: 'msg_' + Date.now(),
    ...data,
    timestamp: new Date().toISOString()
  };
  saveMessage(newMsg);
  return NextResponse.json(newMsg);
}
