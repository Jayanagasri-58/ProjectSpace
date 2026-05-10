import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { signToken } from '@/lib/jwt';

function getLocalUsers() {
  try {
    const dataPath = path.join(process.cwd(), 'src', 'lib', 'data.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    return data.users || [];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let user: any = null;

    // Try MongoDB first
    try {
      const connectDB = (await import('@/lib/mongodb')).default;
      const User = (await import('@/models/User')).default;
      await connectDB();
      user = await User.findOne({ email, role });
    } catch (dbErr: any) {
      console.warn('MongoDB unavailable, falling back to local data:', dbErr.message);
      const users = getLocalUsers();
      user = users.find((u: any) => u.email === email && u.role === role);
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials or role' }, { status: 401 });
    }

    // Verify password (support both hashed and plain-text for fallback)
    let passwordValid = false;
    if (user.password && user.password.startsWith('$2')) {
      // bcrypt hashed password
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      // plain-text fallback (for local JSON)
      passwordValid = user.password === password;
    }

    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid credentials or role' }, { status: 401 });
    }

    // Sign JWT token
    const token = signToken({
      id: user.id || user._id?.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Build response
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id || user._id?.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        details: user.details,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login Error:', error.message || error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
