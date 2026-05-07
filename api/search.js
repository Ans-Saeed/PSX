// api/search.js  —  Vercel Serverless Function
// GET /api/search?q=ogdc

import fs from "fs";
import path from "path";

const DATA_FILE = path.resolve(process.cwd(), "data/fundamentals.json");
let _cache = null;

function loadData() {
  if (_cache) return _cache;
  try { _cache = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); return _cache; } catch { return {}; }
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=86400");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { q } = req.query;
  if (!q || q.length < 1) return res.status(400).json({ error: "q required" });

  const data = loadData();
  const query = q.toLowerCase();

  const results = Object.entries(data)
    .filter(([sym, v]) =>
      sym.toLowerCase().includes(query) ||
      (v.name || "").toLowerCase().includes(query) ||
      (v.sector || "").toLowerCase().includes(query)
    )
    .slice(0, 15)
    .map(([sym, v]) => ({
      symbol: sym,
      name: v.name || sym,
      sector: v.sector || "Unknown",
      dataQuality: v.dataQuality || "partial",
    }));

  return res.status(200).json({ results, query: q });
}
