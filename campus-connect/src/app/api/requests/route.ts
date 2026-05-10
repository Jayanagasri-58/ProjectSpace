import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/authMiddleware';
import { getLocalData, saveLocalData } from '@/lib/dataStore';

export const dynamic = 'force-dynamic';

// GET: Logged-in users only.
export async function GET(req: NextRequest) {
  const { error, user } = requireAuth(req);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    let studentId = searchParams.get('studentId');
    const facultyId = searchParams.get('facultyId');

    // Security: Students can ONLY see their own requests
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
    } catch (dbErr: any) {
      console.warn('MongoDB unavailable, using local data:', dbErr.message);
      let requests = getLocalData('requests');
      if (studentId) requests = requests.filter((r: any) => r.studentId === studentId);
      if (facultyId) requests = requests.filter((r: any) => r.targetFaculty?.includes(facultyId));
      return NextResponse.json(requests);
    }
  } catch (err: any) {
    console.error('Requests GET Error:', err.message || err);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

// POST: Only Students can submit permission requests
export async function POST(req: NextRequest) {
  const { error, user } = requireRole(req, ['Student']);
  if (error) return error;

  try {
    const body = await req.json();
    
    // Validation
    if (!body.title || !body.reason) {
      return NextResponse.json({ error: 'Title and Reason are required' }, { status: 400 });
    }

    const newRequest = {
      id: "req_" + Date.now(),
      ...body,
      studentId: user!.id,       
      studentName: user!.name,   
      status: "Pending",
      submittedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    try {
      const connectDB = (await import('@/lib/mongodb')).default;
      const PermissionRequest = (await import('@/models/PermissionRequest')).default;
      await connectDB();
      const saved = await PermissionRequest.create(newRequest);
      return NextResponse.json(saved, { status: 201 });
    } catch (dbErr: any) {
      console.warn('MongoDB unavailable, saving locally:', dbErr.message);
      const savedLocal = saveLocalData('requests', newRequest);
      return NextResponse.json(savedLocal, { status: 201 });
    }
  } catch (err: any) {
    console.error('Requests POST Error:', err.message || err);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}
