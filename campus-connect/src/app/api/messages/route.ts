import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authMiddleware';
import fs from 'fs';
import path from 'path';

function getLocalData(key: string) {
  try {
    const dataPath = path.join(process.cwd(), 'src', 'lib', 'data.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    return data[key] || [];
  } catch { return []; }
}

function saveLocalData(key: string, item: any) {
  try {
    const dataPath = path.join(process.cwd(), 'src', 'lib', 'data.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    if (!data[key]) data[key] = [];
    data[key].push(item);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch {}
}

export const dynamic = 'force-dynamic';

// GET: Any logged-in user can view messages/doubts
export async function GET(req: NextRequest) {
  const { error } = requireAuth(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'message';

  try {
    const connectDB = (await import('@/lib/mongodb')).default;
    const Message = (await import('@/models/Message')).default;
    await connectDB();
    const messages = await Message.find({ type }).sort({ createdAt: -1 });
    return NextResponse.json(messages);
  } catch (err: any) {
    console.warn('MongoDB unavailable, using local data:', err.message);
    const messages = getLocalData('messages').filter((m: any) => m.type === type);
    return NextResponse.json(messages);
  }
}

// POST: Any logged-in user can post a message/doubt
export async function POST(req: NextRequest) {
  const { error, user } = requireAuth(req);
  if (error) return error;

  try {
    const data = await req.json();
    const newMsg = {
      id: 'msg_' + Date.now(),
      ...data,
      authorId: user!.id,       // Always use authenticated user's ID
      authorName: user!.name,   // Always use authenticated user's name
      authorRole: user!.role,   // Always use authenticated user's role
      timestamp: new Date().toISOString()
    };

    try {
      const connectDB = (await import('@/lib/mongodb')).default;
      const Message = (await import('@/models/Message')).default;
      await connectDB();
      const saved = await Message.create(newMsg);
      return NextResponse.json(saved);
    } catch (dbErr: any) {
      console.warn('MongoDB unavailable, saving locally:', dbErr.message);
      saveLocalData('messages', newMsg);
      return NextResponse.json(newMsg);
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
