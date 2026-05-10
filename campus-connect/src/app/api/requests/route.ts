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

// GET: Logged-in users only. Students see their own, Faculty/Admin see all or filtered
export async function GET(req: NextRequest) {
  const { error, user } = requireAuth(req);
  if (error) return error;

  const { searchParams } = new URL(req.url);
  let studentId = searchParams.get('studentId');
  const facultyId = searchParams.get('facultyId');

  // Students can only see their own requests
  if (user!.role === 'Student') {
    studentId = user!.id;
  }

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

// POST: Only Students can submit permission requests
export async function POST(req: NextRequest) {
  const { error, user } = requireRole(req, ['Student']);
  if (error) return error;

  try {
    const body = await req.json();
    const newRequest = {
      id: "req_" + Date.now(),
      ...body,
      studentId: user!.id,       // Always use the authenticated user's ID
      studentName: user!.name,   // Always use the authenticated user's name
      status: "Pending",
      submittedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
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
