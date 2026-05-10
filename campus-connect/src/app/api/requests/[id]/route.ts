import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/authMiddleware';
import { updateLocalData } from '@/lib/dataStore';

// PATCH: Only Faculty or Admin can approve/reject requests
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = requireRole(req, ['Faculty', 'Admin']);
  if (error) return error;

  try {
    const { id } = await params;
    const body = await req.json();

    // Validate allowed status values
    const allowedStatuses = ['Approved', 'Rejected', 'Pending'];
    if (!body.status || !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` }, { status: 400 });
    }

    try {
      const connectDB = (await import('@/lib/mongodb')).default;
      const PermissionRequest = (await import('@/models/PermissionRequest')).default;
      await connectDB();
      const updated = await PermissionRequest.findOneAndUpdate(
        { id },
        { status: body.status },
        { new: true }
      );
      if (updated) return NextResponse.json(updated);
      return NextResponse.json({ error: 'Request not found in Database' }, { status: 404 });
    } catch (dbErr: any) {
      console.warn('MongoDB unavailable, updating locally:', dbErr.message);
      const updatedLocal = updateLocalData('requests', id, { status: body.status });
      if (updatedLocal) return NextResponse.json(updatedLocal);
      return NextResponse.json({ error: 'Request not found locally' }, { status: 404 });
    }
  } catch (err: any) {
    console.error('Request PATCH Error:', err.message || err);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
