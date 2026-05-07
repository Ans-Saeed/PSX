// api/psx-price.js  —  Vercel Serverless Function
// GET /api/psx-price?symbol=OGDC
// GET /api/psx-price?symbol=OGDC&limit=30

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { symbol, limit } = req.query;
  if (!symbol) return res.status(400).json({ error: "symbol required" });

  const sym = symbol.toUpperCase().trim();
  const lim = parseInt(limit) || 365;

  try {
    const url = `https://dps.psx.com.pk/timeseries/eod/${sym}`;
    const r = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (r.status === 404) return res.status(404).json({ error: `Symbol ${sym} not found on PSX` });
    if (!r.ok) throw new Error(`PSX returned ${r.status}`);

    const json = await r.json();
    if (!json?.data?.length) return res.status(404).json({ error: "No price data" });

    const rows = json.data.slice(0, lim);
    const prices = rows.map((row) => row[1]);
    const latest = rows[0];
    const prev = rows[1];

    return res.status(200).json({
      symbol: sym,
      price: latest[1],
      open: latest[3],
      volume: latest[2],
      date: latest[0],
      change: prev ? latest[1] - prev[1] : 0,
      changePct: prev ? ((latest[1] - prev[1]) / prev[1]) * 100 : 0,
      week52High: Math.max(...prices),
      week52Low: Math.min(...prices),
      data: rows,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
