import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { education } from '@/config'; 

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const eduItem = education.find((item) => item.id === id);

  if (!eduItem || !eduItem.thesisFileName) {
    return new NextResponse('File not found or not configured', { status: 404 });
  }

  const fileName = eduItem.thesisFileName;
  const filePath = path.join(process.cwd(), 'private', fileName);

  try {
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error(`Eroare la citirea fișierului: ${filePath}`, error);
    return new NextResponse('Error loading file', { status: 500 });
  }
}