# Contributing

Bug fixes, new config fields and cleaner components are welcome.

## Setup

```bash
npm install
npm run setup
npm run dev
```

`src/config/` and `content/` are gitignored. CI runs against `config.example/` and `content.example/`, so a new feature must work with placeholder content, not only with yours.

## Before opening a pull request

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## Guidelines

- Add new config fields to `config.example/` with a placeholder value and a one-line doc comment, and document them in `config.example/README.md`.
- Keep secrets and contact details in `.env`, never in config.
- Comments explain why, not what. Keep them short.
- Use conventional commit prefixes: `feat:`, `fix:`, `docs:`, `chore:`.
- Add a test when you change logic in `src/lib/`.

## Releases

The changelog lives in `src/lib/changelog.ts`. `CHANGELOG.md` is generated from it: run `npm run changelog` after editing, and CI fails if the two differ. Version bumps and tags are handled by the maintainer with `npm run release`.
