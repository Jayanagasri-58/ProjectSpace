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

// GET: Only Faculty and Admin can see the full user list
export async function GET(req: NextRequest) {
  const { error } = requireRole(req, ['Faculty', 'Admin']);
  if (error) return error;

  try {
    const connectDB = (await import('@/lib/mongodb')).default;
    const User = (await import('@/models/User')).default;
    await connectDB();
    // Never return password field
    const users = await User.find({}, { password: 0 });
    return NextResponse.json(users);
  } catch (err: any) {
    console.warn('MongoDB unavailable, using local data:', err.message);
    // Strip passwords from local data too
    return NextResponse.json(getLocalData('users').map((u: any) => {
      const { password, ...rest } = u;
      return rest;
    }));
  }
}
