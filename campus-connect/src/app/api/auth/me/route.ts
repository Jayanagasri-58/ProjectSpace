import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authMiddleware';

export async function GET(req: NextRequest) {
  const { error, user } = requireAuth(req);
  if (error) return error;

  return NextResponse.json({
    user: {
      id: user!.id,
      name: user!.name,
      email: user!.email,
      role: user!.role
    }
  });
}
