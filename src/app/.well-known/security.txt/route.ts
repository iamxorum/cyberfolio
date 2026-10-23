import { siteConfig } from '@/config';
import { siteUrl } from '@/lib/seo';

// Read at request time, so SECURITY_CONTACT can be changed without a rebuild and Expires always looks a year ahead.
export const dynamic = 'force-dynamic';

// RFC 9116. Kept apart from CONTACT_EMAIL on purpose: that one is only revealed after Turnstile, while a
// security contact has to be readable by anyone (and by scanners) without solving a challenge.
const toContactUri = (value: string) => (/^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `mailto:${value}`);

export function GET() {
  const contact = process.env.SECURITY_CONTACT?.trim();
  // Contact is mandatory in the standard, so without one there is no file to publish.
  if (!contact) return new Response('Not found', { status: 404 });

  const expires = new Date();
  expires.setUTCFullYear(expires.getUTCFullYear() + 1);
  expires.setUTCDate(expires.getUTCDate() - 1);

  const pgp = (siteConfig.social.professional ?? []).find((link) => /pgp/i.test(link.name));

  const lines = [
    `Contact: ${toContactUri(contact)}`,
    `Expires: ${expires.toISOString()}`,
    ...(pgp ? [`Encryption: ${pgp.url}`] : []),
    'Preferred-Languages: en',
    `Canonical: ${siteUrl}/.well-known/security.txt`,
  ];

  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
