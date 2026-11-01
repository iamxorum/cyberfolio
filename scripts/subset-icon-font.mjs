// Regenerates src/app/fonts/MaterialSymbolsOutlined.woff2 as a subset containing only the
// Material Symbols icons referenced in the source. Run after adding a new icon name anywhere
// (components or src/config): `npm run icons`. Needs network access to fonts.google.com.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['src', 'config.example', 'public'];
const EXTENSIONS = ['.ts', '.tsx', '.json', '.md', '.mdx'];
const OUT = 'src/app/fonts/MaterialSymbolsOutlined.woff2';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (EXTENSIONS.some((ext) => path.endsWith(ext))) yield path;
  }
}

const metadata = await (await fetch('https://fonts.google.com/metadata/icons?key=material_symbols&incomplete=true')).text();
const valid = new Set(JSON.parse(metadata.slice(metadata.indexOf('{'))).icons.map((icon) => icon.name));

// An icon name is any whole string literal, or JSX text, that is a real Material Symbols name.
const literal = /['"`]([a-z][a-z0-9_]*)['"`]|>\s*([a-z][a-z0-9_]*)\s*</g;
const used = new Set();
for (const root of ROOTS) {
  for (const file of walk(root)) {
    for (const match of readFileSync(file, 'utf8').matchAll(literal)) {
      const name = match[1] ?? match[2];
      if (valid.has(name)) used.add(name);
    }
  }
}

const names = [...used].sort().join(',');
const cssUrl = `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0&icon_names=${names}&display=block`;
const css = await (await fetch(cssUrl, { headers: { 'User-Agent': UA } })).text();
const fontUrl = css.match(/url\((https[^)]+)\)/)?.[1];
if (!fontUrl) throw new Error('Could not find the font URL in the Google Fonts response');

const font = Buffer.from(await (await fetch(fontUrl)).arrayBuffer());
writeFileSync(OUT, font);
console.log(`Wrote ${OUT}: ${used.size} icons, ${(font.length / 1024).toFixed(1)}KB`);
