import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/authMiddleware';
import { getLocalData } from '@/lib/dataStore';

// GET: Students, Faculty and Admin can see the user list (filtered in the frontend or here)
export async function GET(req: NextRequest) {
  const { error } = requireRole(req, ['Student', 'Faculty', 'Admin']);
  if (error) return error;

  try {
    try {
      const connectDB = (await import('@/lib/mongodb')).default;
      const User = (await import('@/models/User')).default;
      await connectDB();
      // Never return password field
      const users = await User.find({}, { password: 0 });
      return NextResponse.json(users, {
        headers: { 'Cache-Control': 'no-store' }
      });
    } catch (dbErr: any) {
      console.warn('MongoDB unavailable, using local data:', dbErr.message);
      // Strip passwords from local data
      const users = getLocalData('users').map((u: any) => {
        const { password, ...rest } = u;
        return rest;
      });
      return NextResponse.json(users);
    }
  } catch (err: any) {
    console.error('Users GET Error:', err.message || err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
