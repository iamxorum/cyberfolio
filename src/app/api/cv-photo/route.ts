import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { features } from '@/config';
import { hasAccess } from '@/lib/access';
import { notFoundResponse } from '@/lib/http';

// In private/, never public/: only reachable here, behind the same gate as /cv.
const PHOTO_FILE = path.join(process.cwd(), 'private', 'cv-photo.jpg');

// Trust the bytes, not the .jpg name: react-pdf rejects a mislabelled image.
const mimeType = (bytes: Buffer) => (bytes[0] === 0x89 && bytes[1] === 0x50 ? 'image/png' : 'image/jpeg');

export async function GET() {
  if (!features.cv || !(await hasAccess())) return notFoundResponse();

  try {
    const image = await readFile(/*turbopackIgnore: true*/ PHOTO_FILE);
    return new Response(new Uint8Array(image), {
      headers: { 'Content-Type': mimeType(image), 'Cache-Control': 'private, no-store' },
    });
  } catch {
    return notFoundResponse();
  }
}
