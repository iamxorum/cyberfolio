import { readFile } from 'node:fs/promises';
import path from 'node:path';

const reads = new Map<string, Promise<Buffer>>();

/**
 * Reads a file from private/ once per server process and hands every later caller the same bytes.
 * A failed read is forgotten, so a file added after startup is picked up; replacing an existing file needs a restart.
 */
export function readPrivateFile(name: string): Promise<Buffer> {
  let read = reads.get(name);
  if (!read) {
    read = readFile(/*turbopackIgnore: true*/ path.join(process.cwd(), 'private', name));
    read.catch(() => reads.delete(name));
    reads.set(name, read);
  }
  return read;
}
