# PSX Research Platform — Backend Setup

## Architecture

```
GitHub Repo
├── data/
│   ├── fundamentals.json     ← scraped daily, committed by Actions
│   └── symbols.json          ← PSX symbol list cache
├── api/
│   ├── psx-price.js          ← /api/psx-price?symbol=OGDC
│   ├── fundamentals.js       ← /api/fundamentals?symbol=OGDC
│   ├── news.js               ← /api/news?q=FCCL&sector=Cement
│   ├── search.js             ← /api/search?q=ogd
│   └── cron-scrape.js        ← /api/cron-scrape (Vercel cron, top 50)
├── scripts/
│   └── scraper.js            ← full scraper, run via GitHub Actions
├── fetchRealFundamentals.js  ← paste into script.js (replaces AI fetch)
├── vercel.json
└── package.json
```

**Data flow:**
1. GitHub Actions runs `scraper.js` daily → commits `data/fundamentals.json`
2. Vercel reads `fundamentals.json` at request time (cold file read, ~1ms)
3. Frontend calls `/api/fundamentals`, `/api/psx-price`, `/api/news`
4. No AI, no paid APIs, no live scraping during user requests

---

## Setup

### 1. Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

### 2. GitHub Actions (daily scraper)

The workflow at `.github/workflows/scrape.yml` runs automatically.

No secrets needed unless your repo is private. If private, ensure
`Settings → Actions → Workflow permissions` is set to **Read and write**.

### 3. Vercel Cron (optional, lightweight top-50 update)

Add to Vercel env vars:
```
CRON_SECRET=any_random_string_you_choose
```

Vercel will call `/api/cron-scrape` daily at 1:30 AM UTC automatically.

### 4. Update script.js

Replace the `fetchRealFundamentals` and `fetchNews` functions in your
existing `script.js` with the contents of `fetchRealFundamentals.js`.

Remove any calls to `fetchFundamentalsViaAI()`.

---

## API Reference

### GET /api/psx-price?symbol=OGDC
```json
{
  "symbol": "OGDC",
  "price": 232.5,
  "change": 1.5,
  "changePct": 0.65,
  "week52High": 285.0,
  "week52Low": 195.0,
  "volume": 4200000,
  "data": [[date, close, volume, open], ...]
}
```

### GET /api/fundamentals?symbol=OGDC
```json
{
  "symbol": "OGDC",
  "name": "Oil & Gas Development Company",
  "sector": "Energy",
  "eps": 35.2,
  "pe": 6.6,
  "bvps": 145.0,
  "roe": 24.0,
  "divY": 11.0,
  "debtEq": 0.05,
  "profitMargin": 42.0,
  "revenueGrowth": 8.5,
  "_meta": {
    "dataSource": "psx_portal",
    "dataQuality": "real",
    "lastUpdated": "2026-05-07"
  }
}
```

### GET /api/news?q=OGDC&sector=Energy
```json
{
  "articles": [
    { "title": "...", "source": "Business Recorder", "date": "...", "url": "...", "description": "..." }
  ],
  "fallback": false
}
```

### GET /api/search?q=ogd
```json
{
  "results": [
    { "symbol": "OGDC", "name": "Oil & Gas Development Company", "sector": "Energy", "dataQuality": "real" }
  ]
}
```

---

## Data Quality

| `dataQuality` | Meaning |
|---|---|
| `real` | EPS + BVPS confirmed from PSX portal |
| `partial` | Some fields missing (e.g. only price available) |
| `unavailable` | Symbol found on PSX but no financial data |

---

## Running the scraper manually

```bash
node scripts/scraper.js
```

This writes/updates `data/fundamentals.json`. Commit and push when done.

---

## Cost

| Service | Cost |
|---|---|
| Vercel (Hobby) | Free |
| GitHub Actions | Free (2,000 min/month) |
| PSX DPS API | Free |
| PSX Financial Portal | Free |
| rss2json | Free (10K req/day) |
| Total | **$0** |
