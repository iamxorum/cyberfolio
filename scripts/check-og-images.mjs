// Checks that every page in the sitemap has an og:image / twitter:image that loads.
// `npm run check:og` tests localhost:3000, `npm run check:og -- https://iamxorum.ro` another site.
// Sitemap and meta URLs point at production, so they are rewritten to the base given here. Exits 1 on any failure.
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
  if (!res.ok) return `HTTP ${res.status}`;
  const type = res.headers.get('content-type') ?? '';
  if (!type.startsWith('image/')) return `content-type ${type || 'missing'}`;
  if ((await res.arrayBuffer()).byteLength === 0) return 'empty body';
  return null;
}

// Runs at most `max` tasks at once, so the dev server is not hit with every page together.
function limiter(max) {
  const queue = [];
  let active = 0;
  const next = () => {
    if (active >= max || queue.length === 0) return;
    const { task, resolve, reject } = queue.shift();
    active++;
    task().then(resolve, reject).finally(() => {
      active--;
      next();
    });
  };
  return (task) => new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    next();
  });
}

const CONCURRENCY = 4;
const limit = limiter(CONCURRENCY);
const checked = new Set();
const pages = await pageUrls();

// Returns this page's problems. An image is claimed in `checked` before any await, so two pages never test it twice.
async function checkPage(page) {
  const res = await fetch(page);
  const path = new URL(page).pathname;
  if (!res.ok) return [`${path}: page returned ${res.status}`];
  const images = metaImages(await res.text());
  if (images.size === 0) return [`${path}: no og:image or twitter:image`];
  const results = await Promise.all([...images].map(async ([name, url]) => {
    if (checked.has(url)) return null;
    checked.add(url);
    const error = await checkImage(url);
    return error ? `${path}: ${name} ${url} -> ${error}` : null;
  }));
  return results.filter(Boolean);
}

// Results come back in sitemap order, whichever page finishes first.
const failures = (await Promise.all(pages.map((page) => limit(() => checkPage(page))))).flat();

console.log(`Checked ${pages.length} pages, ${checked.size} distinct images.`);
if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n${failures.map((f) => `  - ${f}`).join('\n')}`);
  process.exit(1);
}
console.log('All social cards load.');
