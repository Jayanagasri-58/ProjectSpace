import { NextResponse } from 'next/server';
import { getFacultyRequests } from '@/lib/db';

export async function GET() {
  return NextResponse.json(getFacultyRequests());
}
