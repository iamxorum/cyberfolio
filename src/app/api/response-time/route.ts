import { NextResponse } from 'next/server';
import { guardStatsRequest } from '@/lib/http';

// The visitor's browser times this request, so the body can stay empty.
export async function GET(request: Request) {
  return guardStatsRequest(request) ?? NextResponse.json({ ok: true });
}
