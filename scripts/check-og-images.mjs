// Checks that every page in the sitemap has a social card (og:image, twitter:image) that actually loads.
// Run against a running site: `npm run check:og` (http://localhost:3000) or `npm run check:og -- https://iamxorum.ro`.
// Absolute URLs in the sitemap and meta tags point at the production domain; they are rewritten to the base
// given here, so a local server can be checked before deploying. Exits 1 if any card is missing or broken.
const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');

const local = (url) => `${base}${new URL(url, base).pathname}${new URL(url, base).search}`;

async function pageUrls() {
  const res = await fetch(`${base}/sitemap.xml`);
  if (!res.ok) throw new Error(`${base}/sitemap.xml returned ${res.status}`);
  return [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => local(m[1]));
}

function metaImages(html) {
  const images = new Map();
  for (const tag of html.match(/<meta[^>]+>/g) ?? []) {
    const name = tag.match(/(?:property|name)="((?:og|twitter):image)"/)?.[1];
    const content = tag.match(/content="([^"]+)"/)?.[1];
    if (name && content) images.set(name, content.replaceAll('&amp;', '&'));
  }
  return images;
}

async function checkImage(url) {
  const res = await fetch(local(url));
  const type = res.headers.get('content-type') ?? '';
  const bytes = (await res.arrayBuffer()).byteLength;
  if (!res.ok) return `HTTP ${res.status}`;
  if (!type.startsWith('image/')) return `content-type ${type || 'missing'}`;
  if (bytes === 0) return 'empty body';
  return null;
}

const failures = [];
const checked = new Set();
const pages = await pageUrls();

for (const page of pages) {
  const res = await fetch(page);
  const path = new URL(page).pathname;
  if (!res.ok) {
    failures.push(`${path}: page returned ${res.status}`);
    continue;
  }
  const images = metaImages(await res.text());
  if (images.size === 0) failures.push(`${path}: no og:image or twitter:image`);
  for (const [name, url] of images) {
    const error = checked.has(url) ? null : await checkImage(url);
    checked.add(url);
    if (error) failures.push(`${path}: ${name} ${url} -> ${error}`);
  }
}

console.log(`Checked ${pages.length} pages, ${checked.size} distinct images.`);
if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n${failures.map((f) => `  - ${f}`).join('\n')}`);
  process.exit(1);
}
console.log('All social cards load.');
