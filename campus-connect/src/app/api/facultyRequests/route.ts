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
    const FacultyRequest = (await import('@/models/FacultyRequest')).default;
    await connectDB();
    const requests = await FacultyRequest.find().sort({ createdAt: -1 });
    return NextResponse.json(requests);
  } catch (err: any) {
    console.warn('MongoDB unavailable, using local data:', err.message);
    return NextResponse.json(getLocalData('facultyRequests'));
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newRequest = {
      id: "fac_req_" + Date.now(),
      ...body,
      status: "Pending",
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      priority: "Medium"
    };

    try {
      const connectDB = (await import('@/lib/mongodb')).default;
      const FacultyRequest = (await import('@/models/FacultyRequest')).default;
      await connectDB();
      const saved = await FacultyRequest.create(newRequest);
      return NextResponse.json(saved);
    } catch (dbErr: any) {
      console.warn('MongoDB unavailable, saving locally:', dbErr.message);
      saveLocalData('facultyRequests', newRequest);
      return NextResponse.json(newRequest);
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create faculty request' }, { status: 500 });
  }
}
