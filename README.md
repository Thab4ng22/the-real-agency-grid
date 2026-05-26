# ⚡ Agency Grid — E-Commerce Analytics SaaS

A full-stack React SaaS dashboard that delivers daily AI-powered insights for DTC e-commerce brands. Built with Vite + React, powered by the Anthropic Claude API.

![Preview](https://img.shields.io/badge/Status-Live-00d4ff?style=flat-square) ![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square) ![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square)

---

## 🚀 Live Demo

👉 **[View Live on GitHub Pages](https://YOUR-USERNAME.github.io/agency-grid/)**

---

## ✨ Features

- **Marketing Landing Page** — Pricing tiers, feature grid, CTA
- **Full Analytics Dashboard** — KPIs, revenue charts, product analytics
- **Agency Grid Tab** — Daily prioritized action items
- **Marketing Intelligence** — Channel ROAS breakdown
- **Cohort & Retention Analysis** — Color-coded retention matrix
- **🧠 Ask AI Chat** — Live Claude-powered assistant answering questions about your store
- **AI Report Generator** — One-click monthly performance report written by Claude

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 5 |
| AI | Anthropic Claude (claude-sonnet-4) |
| Styling | CSS-in-JS (no external CSS library) |
| Deployment | GitHub Pages / Vercel / Netlify |

---

## ⚙️ Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/YOUR-USERNAME/agency-grid.git
cd agency-grid
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your API key

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Anthropic API key:

```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
```

Get your key at [console.anthropic.com](https://console.anthropic.com).

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🌐 Deploy to GitHub Pages

### Step 1 — Update `vite.config.js`

Set the `base` to match your repo name:

```js
base: '/agency-grid/',   // ← must match your GitHub repo name exactly
```

If using a **custom domain**, set `base: '/'` instead.

### Step 2 — Add your API key as a GitHub Secret

1. Go to your repo on GitHub
2. Click **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Name: `VITE_ANTHROPIC_API_KEY`
5. Value: your Anthropic API key (`sk-ant-api03-...`)

### Step 3 — Enable GitHub Pages

1. Go to **Settings → Pages**
2. Under **Source**, select **GitHub Actions**

### Step 4 — Push to main

```bash
git add .
git commit -m "initial commit"
git push origin main
```

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically build and deploy on every push to `main`. Your site will be live at:

```
https://YOUR-USERNAME.github.io/agency-grid/
```

---

## ☁️ Deploy to Vercel (Alternative — Recommended for production)

Vercel is easier for production and handles environment variables securely.

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Under **Environment Variables**, add `VITE_ANTHROPIC_API_KEY`
4. Set `base: '/'` in `vite.config.js`
5. Click **Deploy**

---

## ☁️ Deploy to Netlify (Alternative)

1. Push to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Under **Site settings → Environment variables**, add `VITE_ANTHROPIC_API_KEY`
6. Set `base: '/'` in `vite.config.js`

---

## 🔐 API Key Security Note

> ⚠️ `VITE_` prefixed variables are embedded in the JavaScript bundle and **visible to users in DevTools**.

This is acceptable for:
- Internal tools
- Password-protected dashboards
- Demos and prototypes

For a **production multi-tenant SaaS**, move API calls to a backend proxy:
- **Vercel Edge Function** (simplest)
- **Cloudflare Worker**
- **Express/Fastify server**

The proxy receives requests from your frontend, adds the API key server-side, and forwards to Anthropic.

---

## 📁 Project Structure

```
agency-grid/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Auto-deploy to GitHub Pages
├── src/
│   ├── App.jsx                 # Main application (website + dashboard)
│   └── main.jsx                # React entry point
├── index.html                  # HTML shell
├── vite.config.js              # Vite + base path config
├── package.json                # Dependencies & scripts
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server at localhost:5173 |
| `npm run build` | Build for production into `/dist` |
| `npm run preview` | Preview the production build locally |

---

## 🗺️ Roadmap

- [ ] Real Shopify integration via OAuth
- [ ] Real Stripe webhook listener
- [ ] Google Analytics 4 data pull
- [ ] User authentication (Supabase / Clerk)
- [ ] Multi-tenant brand switching
- [ ] Slack / WhatsApp notification delivery
- [ ] Scheduled daily AI summary emails

---

## 📄 License

MIT — free to use and modify.
