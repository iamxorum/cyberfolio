import { NextResponse } from 'next/server';

export async function GET() {
  try {
    
    const processUptime = process.uptime();
    const days = Math.floor(processUptime / 86400);
    const hours = Math.floor((processUptime % 86400) / 3600);
    const minutes = Math.floor((processUptime % 3600) / 60);
    
    let uptimeString = '';
    if (days > 0) {
      uptimeString = `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      uptimeString = `${hours}h ${minutes}m`;
    } else {
      uptimeString = `${minutes}m`;
    }
    
    return NextResponse.json({
      uptime: uptimeString,
      days,
      hours,
      minutes,
      totalHours: Math.floor(processUptime / 3600)
    });
  } catch (error) {
    
    return NextResponse.json({
      uptime: '0h 0m',
      days: 0,
      hours: 0,
      minutes: 0,
      totalHours: 0
    });
  }
}

