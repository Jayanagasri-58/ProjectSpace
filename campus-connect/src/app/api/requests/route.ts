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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');
  const facultyId = searchParams.get('facultyId');

  try {
    const connectDB = (await import('@/lib/mongodb')).default;
    const PermissionRequest = (await import('@/models/PermissionRequest')).default;
    await connectDB();

    let query: any = {};
    if (studentId) query.studentId = studentId;
    if (facultyId) query.targetFaculty = facultyId;

    const requests = await PermissionRequest.find(query).sort({ createdAt: -1 });
    return NextResponse.json(requests);
  } catch (err: any) {
    console.warn('MongoDB unavailable, using local data:', err.message);
    let requests = getLocalData('requests');
    if (studentId) requests = requests.filter((r: any) => r.studentId === studentId);
    if (facultyId) requests = requests.filter((r: any) => r.targetFaculty?.includes(facultyId));
    return NextResponse.json(requests);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newRequest = {
      id: "req_" + Date.now(),
      ...body,
      status: "Pending",
      submittedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      priority: Math.random() > 0.5 ? "High" : "Medium"
    };

    try {
      const connectDB = (await import('@/lib/mongodb')).default;
      const PermissionRequest = (await import('@/models/PermissionRequest')).default;
      await connectDB();
      const saved = await PermissionRequest.create(newRequest);
      return NextResponse.json(saved);
    } catch (dbErr: any) {
      console.warn('MongoDB unavailable, saving locally:', dbErr.message);
      saveLocalData('requests', newRequest);
      return NextResponse.json(newRequest);
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}
