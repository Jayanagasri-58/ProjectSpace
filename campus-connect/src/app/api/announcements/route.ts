import { NextResponse } from 'next/server';
import { getAnnouncements, saveAnnouncement } from '@/lib/db';

export async function GET() {
  return NextResponse.json(getAnnouncements());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newAnnouncement = {
      id: "an_" + Date.now(),
      ...body,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    
    saveAnnouncement(newAnnouncement);
    return NextResponse.json(newAnnouncement);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
