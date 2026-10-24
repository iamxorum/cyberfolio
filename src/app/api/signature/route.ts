import { NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { features, siteConfig } from '@/config';
import { isRateLimited, getClientKey } from '@/lib/rate-limit';
import { isAllowedOrigin } from '@/lib/origin';
import { devOrigins, isDevelopment } from '@/lib/env';
import { notFoundResponse } from '@/lib/http';

const MAX_PASSWORD_LENGTH = 256;
// Kept in private/ (never public/), so the image is only reachable through this route.
const SIGNATURE_FILE = path.join(process.cwd(), 'private', 'signature.png');

const fail = (error: string, status: number) =>
  NextResponse.json({ success: false, error }, { status, headers: { 'Cache-Control': 'no-store' } });

// Hashing both sides gives equal-length buffers, so the comparison takes the same time whatever the password length.
// The file is named .png whatever it holds, so the type comes from its first bytes: react-pdf rejects a JPEG labelled as PNG.
const mimeType = (bytes: Buffer) => (bytes[0] === 0xff && bytes[1] === 0xd8 ? 'image/jpeg' : 'image/png');

const sha256 = (value: string) => createHash('sha256').update(value).digest();

export async function POST(request: Request) {
  const password = process.env.SIGNATURE_PASSWORD;
  // Off, or no password configured: the endpoint does not exist.
  if (!features.signature || !password) return notFoundResponse();

  if (!isDevelopment && !isAllowedOrigin(request, siteConfig.domain, devOrigins)) {
    return fail('Access Denied: Invalid Origin', 403);
  }

  // Per caller, plus one shared bucket so a botnet cannot guess in parallel.
  if (isRateLimited(`signature:${getClientKey(request)}`, 6, 60_000) || isRateLimited('signature:all', 60, 60_000)) {
    return fail('Too many requests', 429);
  }

  let given: unknown;
  try {
    ({ password: given } = await request.json());
  } catch {
    return fail('Invalid request', 400);
  }

  if (typeof given !== 'string' || given.length === 0 || given.length > MAX_PASSWORD_LENGTH) {
    return fail('Invalid request', 400);
  }

  if (!timingSafeEqual(sha256(given), sha256(password))) {
    console.warn('[SIGNATURE] Wrong password');
    return fail('Wrong password', 403);
  }

  try {
    const image = await readFile(/*turbopackIgnore: true*/ SIGNATURE_FILE);
    return NextResponse.json(
      { success: true, image: `data:${mimeType(image)};base64,${image.toString('base64')}` },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('[SIGNATURE] Cannot read private/signature.png:', error);
    return fail('Signature file missing', 500);
  }
}

export async function GET() {
  return notFoundResponse();
}
