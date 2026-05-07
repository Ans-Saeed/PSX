// api/fundamentals.js  —  Vercel Serverless Function
// GET /api/fundamentals?symbol=OGDC
// GET /api/fundamentals?search=ogd       (search by name/symbol)
// GET /api/fundamentals?all=true         (full dataset, for prefetch)

import fs from "fs";
import path from "path";

const DATA_FILE = path.resolve(process.cwd(), "data/fundamentals.json");
const CACHE_TTL = 3600; // 1 hour CDN cache

let _cache = null;
let _cacheTime = 0;

function loadData() {
  const now = Date.now();
  if (_cache && now - _cacheTime < 60000) return _cache; // 1 min in-memory
  try {
    _cache = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    _cacheTime = now;
    return _cache;
  } catch {
    return {};
  }
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", `s-maxage=${CACHE_TTL}, stale-while-revalidate`);
  if (req.method === "OPTIONS") return res.status(200).end();

  const { symbol, search, all } = req.query;
  const data = loadData();

  if (all === "true") {
    // Return stripped dataset (no price, just meta) for search/autocomplete
    const slim = {};
    for (const [sym, v] of Object.entries(data)) {
      slim[sym] = { name: v.name, sector: v.sector, lastUpdated: v.lastUpdated, dataQuality: v.dataQuality };
    }
    return res.status(200).json({ count: Object.keys(slim).length, data: slim });
  }

  if (search) {
    const q = search.toLowerCase();
    const matches = Object.entries(data)
      .filter(([sym, v]) => sym.toLowerCase().includes(q) || (v.name || "").toLowerCase().includes(q))
      .slice(0, 20)
      .map(([sym, v]) => ({ symbol: sym, name: v.name, sector: v.sector, dataQuality: v.dataQuality }));
    return res.status(200).json({ results: matches });
  }

  if (!symbol) return res.status(400).json({ error: "symbol required" });

  const sym = symbol.toUpperCase().trim();
  const entry = data[sym];

  if (!entry) {
    return res.status(404).json({ error: `No data for ${sym}`, symbol: sym });
  }

  return res.status(200).json({
    symbol: sym,
    ...entry,
    _meta: {
      dataSource: entry.dataSource,
      dataQuality: entry.dataQuality,
      lastUpdated: entry.lastUpdated,
    },
  });
}
