import { NextResponse } from 'next/server';
import { getRequests, saveRequest } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('studentId');
  const facultyId = searchParams.get('facultyId');
  
  let requests = getRequests();
  if (studentId) {
    requests = requests.filter((r: any) => r.studentId === studentId);
  }
  if (facultyId) {
    requests = requests.filter((r: any) => !r.targetFaculty || r.targetFaculty.includes(facultyId));
  }
  
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newRequest = {
      id: "req_" + Date.now(),
      ...body,
      status: "Pending",
      submittedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      priority: Math.random() > 0.5 ? "High" : "Medium" // Mock AI priority assignment
    };
    
    saveRequest(newRequest);
    return NextResponse.json(newRequest);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}
