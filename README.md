# Portfolio Website

A modern, terminal-inspired portfolio website built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Terminal-style UI aesthetic
- Interactive terminal component with command system
- Dynamic project showcase
- Skills visualization with radar charts
- Responsive design for all devices
- Configurable content through config files

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Anime.js
- **Font**: JetBrains Mono (monospace)

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Configuration

All content is configurable through the `config/` directory. Copy config.example to config and configure the portfolio (see `config/README.md` for detailed configuration options).

## Project Structure

- `app/` - Next.js app router pages and components
- `config/` - Configuration files for content, projects, skills, etc.
- `public/` - Static assets
- `app/components/` - Reusable React components

## Build

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## License - MIT

Open source - feel free to use and modify as needed (Please, if used, mention the GitHub repository)
