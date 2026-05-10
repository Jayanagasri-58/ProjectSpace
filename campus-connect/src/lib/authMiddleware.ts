import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export function getAuthUser(req: NextRequest) {
  const token = req.cookies.get('auth_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null };
  }
  return { error: null, user };
}
