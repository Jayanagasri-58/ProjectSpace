import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/authMiddleware';
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
    data[key].unshift(item);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch {}
}

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
      return NextResponse.json(saved);
    } catch (dbErr: any) {
      console.warn('MongoDB unavailable, saving locally:', dbErr.message);
      saveLocalData('announcements', newAnnouncement);
      return NextResponse.json(newAnnouncement);
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
