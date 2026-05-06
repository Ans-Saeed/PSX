export default async function handler(req, res) {
  const { symbol } = req.query;
  
  if (!symbol) {
    return res.status(400).json({ error: "Symbol required" });
  }

  try {
    const response = await fetch(
      `https://dps.psx.com.pk/timeseries/eod/${symbol}`
    );
    
    if (!response.ok) {
      throw new Error(`PSX API returned ${response.status}`);
    }

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);

  } catch (error) {
    console.error("PSX fetch error:", error);
    res.status(500).json({ error: error.message || "PSX fetch failed" });
  }
}