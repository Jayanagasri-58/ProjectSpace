import { NextResponse } from 'next/server';
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

export async function GET() {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newAnnouncement = {
      id: "an_" + Date.now(),
      ...body,
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
