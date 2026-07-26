import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { education } from '@/config';
import { isRateLimited, getClientKey } from '@/lib/rate-limit';

function toWebStream(nodeStream: fs.ReadStream): ReadableStream {
  return Readable.toWeb(nodeStream) as ReadableStream;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (isRateLimited(getClientKey(request), 20, 60_000)) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  const { id } = await params;

  const eduItem = education.find((item) => item.id === id);

  if (!eduItem || !eduItem.thesisFileName) {
    return new NextResponse('File not found or not configured', { status: 404 });
  }

  const fileName = eduItem.thesisFileName;
  const filePath = path.join(process.cwd(), 'private', fileName);

  let stat: fs.Stats;
  try {
    stat = fs.statSync(filePath);
  } catch (error) {
    console.error(`Error reading file: ${filePath}`, error);
    return new NextResponse('File not found', { status: 404 });
  }

  const etag = `"${stat.size}-${stat.mtimeMs}"`;

  if (request.headers.get('if-none-match') === etag) {
    return new NextResponse(null, { status: 304 });
  }

  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="${fileName}"`,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=86400',
    ETag: etag,
    'Last-Modified': stat.mtime.toUTCString(),
  };

  const range = request.headers.get('range');

  if (!range) {
    return new NextResponse(toWebStream(fs.createReadStream(filePath)), {
      headers: { ...baseHeaders, 'Content-Length': String(stat.size) },
    });
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  const rangeStart = match?.[1] ? parseInt(match[1], 10) : undefined;
  const rangeEnd = match?.[2] ? parseInt(match[2], 10) : undefined;

  if (!match || (rangeStart === undefined && rangeEnd === undefined)) {
    return new NextResponse('Invalid Range', {
      status: 416,
      headers: { 'Content-Range': `bytes */${stat.size}` },
    });
  }

  // suffix range (e.g. "bytes=-500" = last 500 bytes) vs. normal "start-end"/"start-"
  let start = rangeStart;
  let end = rangeEnd;
  if (start === undefined) {
    start = Math.max(stat.size - (end as number), 0);
    end = stat.size - 1;
  } else if (end === undefined || end >= stat.size) {
    end = stat.size - 1;
  }

  if (start > end || start >= stat.size) {
    return new NextResponse('Invalid Range', {
      status: 416,
      headers: { 'Content-Range': `bytes */${stat.size}` },
    });
  }

  return new NextResponse(toWebStream(fs.createReadStream(filePath, { start, end })), {
    status: 206,
    headers: {
      ...baseHeaders,
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Content-Length': String(end - start + 1),
    },
  });
}