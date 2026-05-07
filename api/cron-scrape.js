// api/cron-scrape.js  —  Vercel Cron Function
// Configure in vercel.json: { "crons": [{ "path": "/api/cron-scrape", "schedule": "30 1 * * *" }] }
// Secured with CRON_SECRET env variable

import { execSync } from "child_process";

export default async function handler(req, res) {
  // Verify Vercel cron secret
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // NOTE: Vercel functions have a 60s timeout on Pro, 10s on Hobby
    // For full scrape use GitHub Actions instead.
    // This cron does a lightweight update of top 50 most-searched symbols only.
    const TOP_SYMBOLS = [
      "OGDC","PPL","MARI","PSO","ENGRO","FFBL","LUCK","MLCF","DGKC","FCCL",
      "HBL","MCB","UBL","ABL","BAFL","MEBL","BAHL","FABL","NBP","AKBL",
      "HUBCO","KAPCO","NPL","NCPL","KEL","PKGP","SPWL","ATRL","NRL","BYCO",
      "FFC","FATIMA","EFERT","EFOODS","UNITY","NESTLE","COLG","SHFA","AGP",
      "SYS","NETSOL","AVN","PNSC","LOTCHEM","ICI","GHGL","NATF","ASTL","MUGHAL",
    ];

    const results = {};
    const today = new Date().toISOString().slice(0, 10);

    for (const sym of TOP_SYMBOLS) {
      try {
        const [priceRes, finRes] = await Promise.all([
          fetch(`https://dps.psx.com.pk/timeseries/eod/${sym}?limit=2`, {
            headers: { Accept: "application/json" },
          }),
          fetch(`https://financials.psx.com.pk/financials/annual/${sym}`, {
            headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
          }),
        ]);

        let price = null, eps = null, bvps = null, roe = null, pe = null;

        if (priceRes.ok) {
          const pd = await priceRes.json();
          price = pd?.data?.[0]?.[1] || null;
        }
        if (finRes.ok) {
          const fd = await finRes.json();
          const latest = fd?.data?.[0];
          if (latest) {
            eps = parseFloat(latest.eps) || null;
            bvps = parseFloat(latest.bvps) || null;
            roe = parseFloat(latest.roe) || null;
            pe = price && eps ? price / eps : null;
          }
        }

        results[sym] = { price, eps, bvps, roe, pe, lastUpdated: today, dataSource: "cron_update" };
      } catch { /* skip symbol on error */ }
    }

    // In a real deployment, write to Upstash Redis or Supabase here
    // For GitHub-based storage, trigger a repository_dispatch event:
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
      await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/dispatches`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event_type: "cron-data-update", client_payload: { data: results } }),
      });
    }

    return res.status(200).json({ updated: Object.keys(results).length, date: today });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
