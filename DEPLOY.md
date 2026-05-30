# Deploy Food-Delivery

## GitHub

```bash
git add .
git commit -m "your message"
git push origin paymentTest
```

Open a PR to `main` on [RedaAwwad/Food-Delivery](https://github.com/RedaAwwad/Food-Delivery) if needed.

## Netlify (landing app)

1. [Netlify](https://app.netlify.com) → **Add new site** → **Import from Git** → choose **Food-Delivery**.
2. Settings are read from `netlify.toml` at repo root:
   - **Base directory:** `client` (set automatically)
   - **Build:** `npm ci && npm run build`
   - **Publish:** `client/dist`
3. **Environment variables** (Site settings → Environment variables):
   - `VITE_API_URL` = `https://YOUR-BACKEND-HOST/api/v1` (after you deploy the Node API)
4. Deploy. Your site will be at `https://something.netlify.app/landing/`.

Without `VITE_API_URL`, the landing UI loads but login and restaurant data need a running API.

## Full stack (shop + dashboard + API)

Deploy the Node server (`src/server.ts`) + PostgreSQL on [Render](https://render.com), Railway, or a VPS. Then set `VITE_API_URL` on Netlify to that API URL.

Do **not** commit `.env` — use host environment variables only.
