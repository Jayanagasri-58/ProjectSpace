import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/authMiddleware';
import { getLocalData, saveLocalData } from '@/lib/dataStore';

export const dynamic = 'force-dynamic';

// GET: Faculty and Admin can view faculty requests
export async function GET(req: NextRequest) {
  const { error } = requireRole(req, ['Faculty', 'Admin']);
  if (error) return error;

  try {
    try {
      const connectDB = (await import('@/lib/mongodb')).default;
      const FacultyRequest = (await import('@/models/FacultyRequest')).default;
      await connectDB();
      const requests = await FacultyRequest.find().sort({ createdAt: -1 });
      return NextResponse.json(requests);
    } catch (dbErr: any) {
      console.warn('MongoDB unavailable, using local data:', dbErr.message);
      return NextResponse.json(getLocalData('facultyRequests'));
    }
  } catch (err: any) {
    console.error('Faculty Requests GET Error:', err.message || err);
    return NextResponse.json({ error: 'Failed to fetch faculty requests' }, { status: 500 });
  }
}

// POST: Only Faculty can create faculty requests
export async function POST(req: NextRequest) {
  const { error, user } = requireRole(req, ['Faculty']);
  if (error) return error;

  try {
    const body = await req.json();
    
    if (!body.type || !body.reason) {
      return NextResponse.json({ error: 'Request type and reason are required' }, { status: 400 });
    }

    const newRequest = {
      id: "fac_req_" + Date.now(),
      ...body,
      facultyId: user!.id,
      facultyName: user!.name,
      status: "Pending",
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      priority: body.priority || "Medium"
    };

    try {
      const connectDB = (await import('@/lib/mongodb')).default;
      const FacultyRequest = (await import('@/models/FacultyRequest')).default;
      await connectDB();
      const saved = await FacultyRequest.create(newRequest);
      return NextResponse.json(saved, { status: 201 });
    } catch (dbErr: any) {
      console.warn('MongoDB unavailable, saving locally:', dbErr.message);
      const savedLocal = saveLocalData('facultyRequests', newRequest);
      return NextResponse.json(savedLocal, { status: 201 });
    }
  } catch (err: any) {
    console.error('Faculty Requests POST Error:', err.message || err);
    return NextResponse.json({ error: 'Failed to create faculty request' }, { status: 500 });
  }
}
