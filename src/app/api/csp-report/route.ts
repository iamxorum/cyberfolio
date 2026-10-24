import { getClientKey, isRateLimited } from '@/lib/rate-limit';

const MAX_BODY_BYTES = 8 * 1024;
const MAX_FIELD_LENGTH = 300;

// Violations caused by the visitor's own browser extensions say nothing about this site.
const EXTENSION_SOURCE = /^(chrome|moz|safari(-web)?)-extension:/;

type Fields = Record<string, unknown>;

const text = (value: unknown) => (typeof value === 'string' ? value.slice(0, MAX_FIELD_LENGTH) : undefined);

/** Normalises both report formats: the legacy `csp-report` object and the Reporting API's `csp-violation` list. */
function violationsFrom(payload: unknown): Fields[] {
  const entries = Array.isArray(payload) ? payload : [payload];
  return entries.flatMap((entry): Fields[] => {
    if (!entry || typeof entry !== 'object') return [];
    const { 'csp-report': legacy, type, body } = entry as Fields;
    const report = legacy ?? (type === 'csp-violation' ? body : null);
    return report && typeof report === 'object' ? [report as Fields] : [];
  });
}

// Browsers post here when the CSP blocks something, so injected or unexpected scripts show up in the log
// instead of being guessed at. Anyone can call it, so the body is capped, rate-limited and logged as plain JSON.
export async function POST(request: Request) {
  const done = () => new Response(null, { status: 204 });

  if (isRateLimited(`csp:${getClientKey(request)}`, 20, 60_000)) return done();
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return done();

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return done();
  }
  if (raw.length > MAX_BODY_BYTES) return done();

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return done();
  }

  for (const report of violationsFrom(payload)) {
    const blocked = text(report['blocked-uri'] ?? report.blockedURL);
    const source = text(report['source-file'] ?? report.sourceFile);
    if (EXTENSION_SOURCE.test(blocked ?? '') || EXTENSION_SOURCE.test(source ?? '')) continue;

    console.warn('[CSP]', JSON.stringify({
      directive: text(report['effective-directive'] ?? report.effectiveDirective ?? report['violated-directive']),
      blocked,
      page: text(report['document-uri'] ?? report.documentURL),
      source,
      line: typeof (report['line-number'] ?? report.lineNumber) === 'number' ? (report['line-number'] ?? report.lineNumber) : undefined,
    }));
  }

  return done();
}
