import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    const facultyCount = await User.countDocuments({ role: 'Faculty' });
    const studentCount = await User.countDocuments({ role: 'Student' });
    const allUsers = await User.find({}, { password: 0 });
    return NextResponse.json({ facultyCount, studentCount, users: allUsers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
