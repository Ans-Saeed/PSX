export default async function handler(req, res) {
  const { symbol } = req.query;

  try {
    const response = await fetch(
      `https://dps.psx.com.pk/timeseries/eod/${symbol}`
    );

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "PSX fetch failed" });
  }
}