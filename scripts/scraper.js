// scripts/scraper.js
// Run: node scripts/scraper.js
//
// Sources (priority order per symbol):
//   1. financials.psx.com.pk API  (multiple endpoint patterns tried)
//   2. financials.psx.com.pk HTML page scrape
//   3. Yahoo Finance quoteSummary  (HBL.KA suffix)
//
// Output: data/fundamentals.json

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR   = path.resolve(__dirname, "../data");
const OUT_FILE   = path.resolve(DATA_DIR, "fundamentals.json");
const SYMBOLS_FILE = path.resolve(DATA_DIR, "symbols.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DELAY_MS = 600;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Sector normalisation ─────────────────────────────────────────────────
const SECTOR_MAP = {
  "E&P": "Energy", "Oil & Gas": "Energy", "Refinery": "Energy",
  "Power": "Power", "Electric": "Power",
  "Commercial Banks": "Banking", "Insurance": "Banking", "Investment": "Banking",
  "Cement": "Cement",
  "Fertilizer": "Fertilizer",
  "Textile": "Textile",
  "Food": "Consumer", "Sugar": "Consumer",
  "Pharma": "Healthcare",
  "Technology": "Telecom", "Communication": "Telecom", "Telecom": "Telecom",
  "Automobile": "Auto",
  "Chemical": "Chemical",
  "Engineering": "Engineering",
};
function normalizeSector(raw) {
  if (!raw || typeof raw !== "string") return "Unknown";
  for (const [k, v] of Object.entries(SECTOR_MAP)) {
    if (raw.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return raw || "Unknown";
}

// ── Generic JSON fetch ───────────────────────────────────────────────────
async function fetchJson(url, headers = {}) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://financials.psx.com.pk/",
        ...headers,
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || text.trim()[0] === "<") return null;
    return JSON.parse(text);
  } catch { return null; }
}

// ── PSX Symbols ──────────────────────────────────────────────────────────
async function fetchSymbols() {
  if (fs.existsSync(SYMBOLS_FILE)) {
    const c = JSON.parse(fs.readFileSync(SYMBOLS_FILE, "utf8"));
    if (c.symbols?.length && Date.now() - new Date(c._updated) < 86400000 * 7) {
      console.log(`Cached symbols: ${c.symbols.length}`); return c.symbols;
    }
  }
  const res = await fetch("https://dps.psx.com.pk/symbols", {
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error("Symbols fetch failed: " + res.status);
  const raw = await res.json();
  const arr = Array.isArray(raw) ? raw : (raw.data || []);
  const symbols = arr.map(row => {
    if (Array.isArray(row)) return { symbol: row[0], name: row[1], sector: normalizeSector(row[2] || "") };
    return { symbol: row.symbol || row.code, name: row.name || row.company_name, sector: normalizeSector(row.sector || "") };
  }).filter(s => s.symbol && /^[A-Z0-9]{1,10}$/.test(s.symbol));
  fs.writeFileSync(SYMBOLS_FILE, JSON.stringify({ _updated: new Date().toISOString(), symbols }, null, 2));
  console.log(`Fetched ${symbols.length} symbols from PSX`);
  return symbols;
}

// ── PSX Financial Portal ─────────────────────────────────────────────────
// Multiple URL patterns tried — PSX has changed these in the past
async function fetchPSXFinancials(symbol) {
  const S = symbol;
  const s = symbol.toLowerCase();

  // Try JSON API endpoints (discovered via DevTools on financials.psx.com.pk)
  const apiUrls = [
    `https://financials.psx.com.pk/api/companies/${S}/financial-highlights`,
    `https://financials.psx.com.pk/api/companies/${s}/financial-highlights`,
    `https://financials.psx.com.pk/api/companies/${S}/ratios`,
    `https://financials.psx.com.pk/companies/${S}/financials.json`,
    `https://financials.psx.com.pk/${S}/highlights`,
    `https://dps.psx.com.pk/financials/${S}`,
    `https://dps.psx.com.pk/company/${S}/financials`,
  ];

  for (const url of apiUrls) {
    const data = await fetchJson(url);
    if (data && Object.keys(data).length > 2) {
      // Parse whatever structure we get
      const parsed = parseFinancialData(data, "psx_api");
      if (parsed.eps !== null || parsed.bvps !== null) return parsed;
    }
  }

  // Fallback: HTML scrape of the PSX financial page
  return fetchPSXPageHTML(symbol);
}

function parseFinancialData(data, source) {
  // Handle array response (annual data array)
  const d = Array.isArray(data) ? (data[0] || {}) : (data.data ? (Array.isArray(data.data) ? data.data[0] : data.data) : data);
  const g = (k, ...aliases) => {
    for (const key of [k, ...aliases]) {
      const v = d[key] ?? d[key?.toLowerCase()] ?? d[key?.toUpperCase()];
      if (v != null) { const n = parseFloat(v); if (!isNaN(n)) return n; }
    }
    return null;
  };
  const r1 = g("revenue", "netSales", "net_sales", "netRevenue", "sales");
  const r2 = g("prevRevenue", "previousRevenue", "prev_revenue");
  return {
    eps:           g("eps", "EPS", "earningsPerShare", "earnings_per_share"),
    bvps:          g("bvps", "BVPS", "bookValuePerShare", "book_value_per_share", "bookValue"),
    pe:            g("pe", "PE", "priceEarnings", "p_e", "peRatio"),
    roe:           g("roe", "ROE", "returnOnEquity", "return_on_equity"),
    debtEq:        g("debtEquity", "debt_equity", "de_ratio", "debtToEquity"),
    profitMargin:  g("netProfitMargin", "profit_margin", "netMargin", "profitMargin"),
    divY:          g("dividendYield", "div_yield", "yield", "dividendYield"),
    divPerShare:   g("dividendPerShare", "div_per_share", "cashDividend", "amount") || 0,
    revenueGrowth: r1 && r2 ? ((r1 - r2) / Math.abs(r2)) * 100 : null,
    revenue:       r1,
    netProfit:     g("netProfit", "net_profit", "profitAfterTax", "pat"),
    sharesOut:     g("sharesOutstanding", "shares_outstanding", "shares"),
    source,
    dataQuality:   "real",
  };
}

async function fetchPSXPageHTML(symbol) {
  try {
    const res = await fetch(`https://financials.psx.com.pk/companies/${symbol}`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", Accept: "text/html" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Extract inline JSON state (Nuxt/Vue/Next apps embed data in script tags)
    const jsonMatches = [...html.matchAll(/<script[^>]*>\s*window\.__(?:NUXT|INITIAL_STATE|DATA)__\s*=\s*(\{[\s\S]+?\})\s*;?\s*<\/script>/gi)];
    for (const m of jsonMatches) {
      try {
        const obj = JSON.parse(m[1]);
        const str = JSON.stringify(obj);
        const parsed = {};
        for (const [key, rx] of [["eps","eps"], ["bvps","bvps"], ["roe","roe"], ["pe","peRatio|p_e|priceEarning"]]) {
          const match = str.match(new RegExp(`"(?:${rx})"\\s*:\\s*([-\\d.]+)`));
          if (match) parsed[key] = parseFloat(match[1]);
        }
        if (parsed.eps || parsed.bvps) return { ...parsed, source: "psx_html_state", dataQuality: "real" };
      } catch {}
    }

    // Direct regex on HTML tables
    const patterns = [
      ["eps",          /(?:EPS|Earnings Per Share)[^<]{0,30}<[^>]+>\s*(?:Rs\.?|PKR)?\s*([\d.]+)/i],
      ["bvps",         /Book Value(?:\s*Per Share)?[^<]{0,30}<[^>]+>\s*(?:Rs\.?|PKR)?\s*([\d.]+)/i],
      ["pe",           /P\s*[/\\]\s*E[^<]{0,20}<[^>]+>\s*([\d.]+)/i],
      ["roe",          /Return on Equity[^<]{0,30}<[^>]+>\s*([\d.]+)/i],
      ["profitMargin", /Net Profit Margin[^<]{0,30}<[^>]+>\s*([\d.]+)/i],
      ["debtEq",       /Debt[^<]{0,15}Equity[^<]{0,20}<[^>]+>\s*([\d.]+)/i],
      ["divY",         /Dividend Yield[^<]{0,20}<[^>]+>\s*([\d.]+)/i],
    ];
    const result = {};
    for (const [key, rx] of patterns) {
      const m = html.match(rx);
      if (m) result[key] = parseFloat(m[1]);
    }
    return Object.keys(result).length > 0 ? { ...result, source: "psx_html", dataQuality: "real" } : null;
  } catch { return null; }
}

// ── Yahoo Finance ─────────────────────────────────────────────────────────
let _yfSession = null;
async function getYahooSession() {
  if (_yfSession) return _yfSession;
  try {
    // Get cookie
    const r1 = await fetch("https://finance.yahoo.com/", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
      redirect: "follow",
    });
    const raw = r1.headers.get("set-cookie") || "";
    // Extract all cookies
    const cookie = raw.split(/,(?=\s*\w+=)/).map(c => c.split(";")[0].trim()).join("; ");

    // Get crumb
    const r2 = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: { "User-Agent": "Mozilla/5.0", "Cookie": cookie },
    });
    if (!r2.ok) return null;
    const crumb = (await r2.text()).trim();
    _yfSession = { cookie, crumb };
    return _yfSession;
  } catch { return null; }
}

async function fetchYahoo(symbol) {
  const ySymbol = `${symbol}.KA`;
  try {
    const session = await getYahooSession();
    const crumb = session?.crumb ? `&crumb=${session.crumb}` : "";
    const cookie = session?.cookie || "";
    const modules = "defaultKeyStatistics,financialData,summaryDetail,assetProfile,incomeStatementHistory";
    const res = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ySymbol}?modules=${modules}${crumb}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
          ...(cookie ? { Cookie: cookie } : {}),
        },
        signal: AbortSignal.timeout(12000),
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const r = json?.quoteSummary?.result?.[0];
    if (!r) return null;
    const ks = r.defaultKeyStatistics || {};
    const fd = r.financialData || {};
    const sd = r.summaryDetail || {};
    const ap = r.assetProfile || {};
    const is = r.incomeStatementHistory?.incomeStatementHistory || [];
    let revenueGrowth = null;
    if (is.length >= 2) {
      const a = is[0]?.totalRevenue?.raw, b = is[1]?.totalRevenue?.raw;
      if (a && b) revenueGrowth = ((a - b) / Math.abs(b)) * 100;
    }
    return {
      eps:           ks.trailingEps?.raw          ?? null,
      bvps:          ks.bookValue?.raw             ?? null,
      pe:            sd.trailingPE?.raw            ?? null,
      forwardPE:     sd.forwardPE?.raw             ?? null,
      roe:           fd.returnOnEquity?.raw != null ? fd.returnOnEquity.raw * 100 : null,
      debtEq:        fd.debtToEquity?.raw != null   ? fd.debtToEquity.raw / 100   : null,
      profitMargin:  fd.profitMargins?.raw != null  ? fd.profitMargins.raw * 100  : null,
      divY:          sd.dividendYield?.raw != null  ? sd.dividendYield.raw * 100  : null,
      divPerShare:   sd.dividendRate?.raw           ?? 0,
      revenueGrowth,
      revenue:       fd.totalRevenue?.raw           ?? null,
      netProfit:     fd.grossProfits?.raw           ?? null,
      sharesOut:     ks.sharesOutstanding?.raw      ?? null,
      marketCap:     sd.marketCap?.raw              ?? null,
      sectorRaw:     ap.sector                      || null,
      source:        "yahoo_finance",
      dataQuality:   "real",
    };
  } catch { return null; }
}

// ── Current price from PSX ───────────────────────────────────────────────
async function fetchPrice(symbol) {
  try {
    const res = await fetch(`https://dps.psx.com.pk/timeseries/eod/${symbol}?limit=2`, {
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const j = await res.json();
    return j?.data?.[0]?.[1] ?? null;
  } catch { return null; }
}

// ── Combine sources ──────────────────────────────────────────────────────
function coalesce(...vals) { return vals.find(v => v !== null && v !== undefined) ?? null; }

// ── Main scrape loop ─────────────────────────────────────────────────────
async function scrapeAll() {
  console.log("=== PSX Fundamentals Scraper v2 ===\n");
  const symbols = await fetchSymbols();

  let existing = {};
  if (fs.existsSync(OUT_FILE)) {
    try { existing = JSON.parse(fs.readFileSync(OUT_FILE, "utf8")); } catch {}
  }

  const result = { ...existing };
  const today  = new Date().toISOString().slice(0, 10);
  let real = 0, partial = 0;

  // Prime Yahoo session once
  process.stdout.write("Initialising Yahoo Finance session... ");
  await getYahooSession();
  console.log(_yfSession ? "OK\n" : "failed (will still try per-symbol)\n");

  for (let i = 0; i < symbols.length; i++) {
    const { symbol, name: sName, sector: sSector } = symbols[i];

    // Skip if already real data from today
    if (result[symbol]?.lastUpdated === today && result[symbol]?.dataQuality === "real") {
      console.log(`[${i+1}/${symbols.length}] ${symbol} — already up to date`);
      continue;
    }

    process.stdout.write(`[${i+1}/${symbols.length}] ${symbol.padEnd(10)}`);

    const [psxData, yahooData, price] = await Promise.all([
      fetchPSXFinancials(symbol),
      fetchYahoo(symbol),
      fetchPrice(symbol),
    ]);

    const P = psxData || {};
    const Y = yahooData || {};

    const eps          = coalesce(P.eps,          Y.eps);
    const bvps         = coalesce(P.bvps,         Y.bvps);
    const roe          = coalesce(P.roe,           Y.roe);
    const debtEq       = coalesce(P.debtEq,        Y.debtEq);
    const profitMargin = coalesce(P.profitMargin,  Y.profitMargin);
    const divY         = coalesce(P.divY,          Y.divY) || (price && (P.divPerShare || Y.divPerShare) ? ((P.divPerShare || Y.divPerShare) / price) * 100 : null);
    const divPerShare  = coalesce(P.divPerShare,   Y.divPerShare) || 0;
    const revenueGrowth= coalesce(P.revenueGrowth, Y.revenueGrowth);
    const revenue      = coalesce(P.revenue,       Y.revenue);
    const netProfit    = coalesce(P.netProfit,     Y.netProfit);
    const sharesOut    = coalesce(P.sharesOut,     Y.sharesOut);
    const marketCap    = coalesce(Y.marketCap, sharesOut && price ? sharesOut * price : null);
    const pe           = coalesce(P.pe, Y.pe, eps && price ? price / eps : null);
    const sector       = normalizeSector(coalesce(P.sectorRaw, Y.sectorRaw, sSector) || "");
    const hasReal      = eps !== null || bvps !== null || roe !== null;

    result[symbol] = {
      name:         sName || symbol,
      sector,
      price,
      eps,
      pe,
      forwardPE:    coalesce(P.forwardPE, Y.forwardPE),
      bvps,
      roe,
      divY,
      divPerShare,
      debtEq,
      profitMargin,
      revenueGrowth,
      revenue,
      netProfit,
      sharesOut,
      marketCap,
      dataSource:   hasReal ? (P.source || Y.source || "unknown") : "eod_only",
      dataQuality:  hasReal ? "real" : "partial",
      lastUpdated:  today,
    };

    if (hasReal) real++; else partial++;
    console.log(hasReal
      ? `✓ [${result[symbol].dataSource}] EPS=${eps?.toFixed(2)} PE=${pe?.toFixed(1)} ROE=${roe?.toFixed(1)}`
      : `~ price only: PKR ${price}`
    );

    if ((i + 1) % 25 === 0) {
      fs.writeFileSync(OUT_FILE, JSON.stringify(result, null, 2));
      console.log(`  ↳ Checkpoint saved\n`);
    }
    await sleep(DELAY_MS);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(result, null, 2));
  console.log(`\n${"=".repeat(40)}`);
  console.log(`Total symbols : ${Object.keys(result).length}`);
  console.log(`Real data     : ${real}`);
  console.log(`Price only    : ${partial}`);
  console.log(`Output        : ${OUT_FILE}`);
}

scrapeAll().catch(err => { console.error("Fatal:", err); process.exit(1); });