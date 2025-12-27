import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  
  
  await new Promise(resolve => setTimeout(resolve, 1));
  
  const responseTime = Date.now() - startTime;
  
  return NextResponse.json({
    responseTime: `${responseTime}ms`,
    ms: responseTime
  });
}

