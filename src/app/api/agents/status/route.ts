import { NextResponse } from 'next/server';

export async function GET() {
  const agents = [
    { name: 'Trading Agent', status: 'running', pid: 1234, uptime: 45231 },
    { name: 'Risk Manager', status: 'running', pid: 2345, uptime: 38912 },
    { name: 'Model Router', status: 'stopped', pid: 0, uptime: 0 },
    { name: 'Report Generator', status: 'running', pid: 3456, uptime: 21234 },
  ];
  return NextResponse.json(agents);
}
