import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

    let user = null;

    // Try MongoDB first
    try {
      const connectDB = (await import('@/lib/mongodb')).default;
      const User = (await import('@/models/User')).default;
      await connectDB();
      user = await User.findOne({ email, password, role });
    } catch (dbErr: any) {
      console.warn('MongoDB unavailable, falling back to local data:', dbErr.message);
      // Fallback to local JSON
      const users = getLocalUsers();
      user = users.find((u: any) => u.email === email && u.password === password && u.role === role);
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials or role' }, { status: 401 });
    }

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        details: user.details
      }
    });
  } catch (error: any) {
    console.error('Login Error:', error.message || error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

