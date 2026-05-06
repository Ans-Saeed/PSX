export default async function handler(req, res) {
  const { symbol } = req.query;

  try {
    const r = await fetch(`https://dps.psx.com.pk/timeseries/eod/${symbol}`);
    const data = await r.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch PSX data" });
  }
}