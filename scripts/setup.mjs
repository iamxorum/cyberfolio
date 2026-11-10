// First-run setup: copies the example config, blog content, placeholder images, env file and threat feed into place.
// `npm run setup`. Never overwrites a file or folder that already exists.
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const STEPS = [
  { from: 'config.example', to: 'src/config', label: 'site config' },
  { from: 'content.example', to: 'content', label: 'example blog posts' },
  { from: 'assets.example', to: 'public/assets', label: 'placeholder images' },
  { from: '.env.example', to: '.env', label: 'environment file' },
  { from: 'public/data/banned_ips.example.json', to: 'public/data/banned_ips.json', label: 'sample threat feed' },
];

for (const { from, to, label } of STEPS) {
  if (!existsSync(from)) {
    console.error(`Missing ${from}. Run this from the project root.`);
    process.exit(1);
  }
  if (existsSync(to)) {
    console.log(`skip  ${to} (already there)`);
    continue;
  }
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
  console.log(`copy  ${from} -> ${to} (${label})`);
}

console.log('\nNext: edit src/config and .env, then run `npm run dev`.');
