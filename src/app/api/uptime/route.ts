import { NextResponse } from 'next/server';
import { guardStatsRequest } from '@/lib/http';

export async function GET(request: Request) {
  const blocked = guardStatsRequest(request);
  if (blocked) return blocked;

  const seconds = process.uptime();
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  let uptime = `${minutes}m`;
  if (days > 0) uptime = `${days}d ${hours}h ${minutes}m`;
  else if (hours > 0) uptime = `${hours}h ${minutes}m`;

  return NextResponse.json({ uptime });
}
