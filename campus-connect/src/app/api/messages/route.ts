import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authMiddleware';
import { getLocalData, saveLocalData } from '@/lib/dataStore';

export const dynamic = 'force-dynamic';

// GET: Any logged-in user can view messages/doubts
export async function GET(req: NextRequest) {
  const { error } = requireAuth(req);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'message';

    try {
      const connectDB = (await import('@/lib/mongodb')).default;
      const Message = (await import('@/models/Message')).default;
      await connectDB();
      const messages = await Message.find({ type }).sort({ createdAt: -1 });
      return NextResponse.json(messages);
    } catch (dbErr: any) {
      console.warn('MongoDB unavailable, using local data:', dbErr.message);
      const messages = getLocalData('messages').filter((m: any) => m.type === type);
      return NextResponse.json(messages);
    }
  } catch (err: any) {
    console.error('Messages GET Error:', err.message || err);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST: Any logged-in user can post a message/doubt
export async function POST(req: NextRequest) {
  const { error, user } = requireAuth(req);
  if (error) return error;

  try {
    const data = await req.json();
    
    if (!data.text) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const newMsg = {
      id: 'msg_' + Date.now(),
      ...data,
      authorId: user!.id,       
      authorName: user!.name,   
      authorRole: user!.role,   
      timestamp: new Date().toISOString()
    };

    try {
      const connectDB = (await import('@/lib/mongodb')).default;
      const Message = (await import('@/models/Message')).default;
      await connectDB();
      const saved = await Message.create(newMsg);
      return NextResponse.json(saved, { status: 201 });
    } catch (dbErr: any) {
      console.warn('MongoDB unavailable, saving locally:', dbErr.message);
      const savedLocal = saveLocalData('messages', newMsg);
      return NextResponse.json(savedLocal, { status: 201 });
    }
  } catch (err: any) {
    console.error('Messages POST Error:', err.message || err);
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
  }
}
