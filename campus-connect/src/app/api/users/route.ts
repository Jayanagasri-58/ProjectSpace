import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getLocalData(key: string) {
  try {
    const dataPath = path.join(process.cwd(), 'src', 'lib', 'data.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    return data[key] || [];
  } catch { return []; }
}

export async function GET() {
  try {
    const connectDB = (await import('@/lib/mongodb')).default;
    const User = (await import('@/models/User')).default;
    await connectDB();
    const users = await User.find();
    return NextResponse.json(users);
  } catch (err: any) {
    console.warn('MongoDB unavailable, using local data:', err.message);
    return NextResponse.json(getLocalData('users'));
  }
}
