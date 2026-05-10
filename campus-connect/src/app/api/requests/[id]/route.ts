import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PermissionRequest from '@/models/PermissionRequest';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    
    const updated = await PermissionRequest.findOneAndUpdate(
      { id: id },
      { status: body.status },
      { new: true }
    );
    
    if (updated) {
      return NextResponse.json(updated);
    }
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
