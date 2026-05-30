# Food Delivery — React landing (shadcn + Tailwind)

This folder is the **React + TypeScript + Tailwind** UI for the WebGL hero and liquid-glass button demo.

## Why `/src/components/ui`?

shadcn/ui expects reusable primitives under `components/ui` so:

- CLI commands (`npx shadcn@latest add …`) know where to write files
- Imports stay consistent: `@/components/ui/...`
- You can grow the design system without mixing page code and UI primitives

## Setup (already scaffolded)

```bash
cd client
npm install
```

Optional — add more shadcn components from the repo root:

```bash
cd client
npx shadcn@latest init   # only if you reset config
npx shadcn@latest add button
```

## Development

```bash
# Terminal 1 — API (port 4000)
npm run dev

# Terminal 2 — React (port 5173, proxies /api)
cd client && npm run dev
```

Open http://localhost:5173/landing/

## Production build (served by Express at `/landing`)

```bash
cd client && npm run build
```

Then restart the Node server. Static files are served from `client/dist` at `/landing`.

## Components

| File | Purpose |
|------|---------|
| `src/components/ui/web-gl-shader.tsx` | Full-screen Three.js shader background |
| `src/components/ui/liquid-glass-button.tsx` | Liquid glass + standard + metal buttons |
| `src/pages/landing.tsx` | Food-Delivery branded home |
| `src/pages/login.tsx` | Sign in + TypewriterEffect |
| `src/pages/register.tsx` | Sign up + TypewriterEffect |
| `src/components/ui/typewriter-effect.tsx` | Aceternity typewriter (framer-motion) |
| `src/components/site-header.tsx` | Nav → shop, dashboard, API |

## Dependencies

- `three` — WebGL shader
- `@radix-ui/react-slot` — `asChild` pattern
- `class-variance-authority` — button variants
- `clsx` + `tailwind-merge` — `cn()` helper in `src/lib/utils.ts`
- `lucide-react` — icons in demo
