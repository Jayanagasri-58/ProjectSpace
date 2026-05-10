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
    return { error: NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 }), user: null };
  }
  return { error: null, user };
}

export function requireRole(req: NextRequest, allowedRoles: string[]) {
  const user = getAuthUser(req);
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 }), user: null };
  }
  if (!allowedRoles.map(r => r.toLowerCase()).includes(user.role.toLowerCase())) {
    return {
      error: NextResponse.json(
        { error: `Access denied. Only ${allowedRoles.join(' or ')} can perform this action.` },
        { status: 403 }
      ),
      user: null
    };
  }
  return { error: null, user };
}

