import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/authMiddleware';
import { getLocalData, saveLocalData } from '@/lib/dataStore';

export const dynamic = 'force-dynamic';

// GET: All logged-in users can view announcements
export async function GET(req: NextRequest) {
  const { error } = requireAuth(req);
  if (error) return error;

  try {
    const connectDB = (await import('@/lib/mongodb')).default;
    const Announcement = (await import('@/models/Announcement')).default;
    await connectDB();
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    return NextResponse.json(announcements);
  } catch (err: any) {
    console.warn('MongoDB unavailable, using local data:', err.message);
    return NextResponse.json(getLocalData('announcements'));
  }
}

// POST: Only Admin can create announcements
export async function POST(req: NextRequest) {
  const { error, user } = requireRole(req, ['Admin']);
  if (error) return error;

  try {
    const body = await req.json();
    
    // Basic validation
    if (!body.title || !body.content) {
      return NextResponse.json({ error: 'Title and Content are required' }, { status: 400 });
    }

    const newAnnouncement = {
      id: "an_" + Date.now(),
      ...body,
      authorName: user!.name,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    try {
      const connectDB = (await import('@/lib/mongodb')).default;
      const Announcement = (await import('@/models/Announcement')).default;
      await connectDB();
      const saved = await Announcement.create(newAnnouncement);
      return NextResponse.json(saved, { status: 201 });
    } catch (dbErr: any) {
      console.warn('MongoDB unavailable, saving locally:', dbErr.message);
      const savedLocal = saveLocalData('announcements', newAnnouncement);
      return NextResponse.json(savedLocal, { status: 201 });
    }
  } catch (err: any) {
    console.error('Announcements POST Error:', err.message || err);
    return NextResponse.json({ error: 'Failed to create announcement', details: err.message }, { status: 500 });
  }
}
