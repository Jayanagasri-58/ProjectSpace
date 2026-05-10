import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/authMiddleware';
import fs from 'fs';
import path from 'path';

// PATCH: Only Faculty or Admin can approve/reject requests
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = requireRole(req, ['Faculty', 'Admin']);
  if (error) return error;

  try {
    const { id } = await params;
    const body = await req.json();

    // Validate allowed status values
    const allowedStatuses = ['Approved', 'Rejected', 'Pending'];
    if (!allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
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
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    } catch (dbErr: any) {
      // Fallback: update in local JSON
      console.warn('MongoDB unavailable, updating locally:', dbErr.message);
      const dataPath = path.join(process.cwd(), 'src', 'lib', 'data.json');
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      const idx = data.requests?.findIndex((r: any) => r.id === id);
      if (idx !== undefined && idx >= 0) {
        data.requests[idx].status = body.status;
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        return NextResponse.json(data.requests[idx]);
      }
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
