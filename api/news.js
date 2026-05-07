// api/news.js  —  Vercel Serverless Function
// GET /api/news?q=FCCL&sector=Cement

const FEEDS = [
  "https://www.brecorder.com/feeds/markets",
  "https://www.dawn.com/feeds/business-finance",
  "https://tribune.com.pk/feeds/business",
  "https://www.thenews.com.pk/rss/2/8",
];
const RSS2JSON = "https://api.rss2json.com/v1/api.json?rss_url=";

const SECTOR_KEYWORDS = {
  Energy:     ["oil","gas","petroleum","opec","energy","ogdc","ppl","mari","exploration"],
  Banking:    ["bank","sbp","interest rate","imf","financial","hbl","mcb","ubl","monetary policy"],
  Cement:     ["cement","construction","housing","coal","luck","fccl","dgkc","dispatches"],
  Power:      ["power","electricity","circular debt","hubco","kel","tariff","nepra","lesco"],
  Fertilizer: ["fertilizer","urea","dap","engro","ffbl","agriculture","urea offtake"],
  Textile:    ["textile","cotton","export","gsp","yarn","nml","knitwear"],
  Telecom:    ["telecom","ptcl","5g","mobile","broadband","pta","spectrum"],
  Consumer:   ["consumer","food","inflation","fmcg","unity","edible","packaged"],
};

const DOMAIN_MAP = {
  "brecorder.com": "Business Recorder",
  "dawn.com": "Dawn",
  "tribune.com.pk": "Express Tribune",
  "thenews.com.pk": "The News",
  "geo.tv": "Geo News",
  "samaa.tv": "Samaa",
};

function stripHtml(html) {
  return (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").trim();
}
function getDomain(url) {
  try { const h = new URL(url).hostname.replace("www.", ""); return DOMAIN_MAP[h] || h; } catch { return "News"; }
}
async function fetchFeed(url) {
  try {
    const r = await fetch(`${RSS2JSON}${encodeURIComponent(url)}&count=25`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) return [];
    const j = await r.json();
    return j.items || [];
  } catch { return []; }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600"); // 15 min cache
  if (req.method === "OPTIONS") return res.status(200).end();

  const { q, sector } = req.query;
  if (!q) return res.status(400).json({ error: "q required" });

  const keyword = q.toLowerCase();
  const sectorWords = SECTOR_KEYWORDS[sector] || [];

  try {
    const allFeeds = await Promise.all(FEEDS.map(fetchFeed));
    const allItems = allFeeds.flat().filter((item) => item.title && item.link);

    const scored = allItems.map((item) => {
      const text = (item.title + " " + stripHtml(item.description || "")).toLowerCase();
      let score = 0;
      if (text.includes(keyword)) score += 4;
      sectorWords.forEach((w) => { if (text.includes(w)) score += 1; });
      return { ...item, _score: score };
    });

    let relevant = scored.filter((i) => i._score > 0)
      .sort((a, b) => b._score !== a._score ? b._score - a._score : new Date(b.pubDate) - new Date(a.pubDate))
      .slice(0, 6);

    // Pad with general recent news if fewer than 3
    if (relevant.length < 3) {
      const general = allItems
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
        .slice(0, 6 - relevant.length);
      relevant = [...relevant, ...general];
    }

    const articles = relevant.map((item) => ({
      title: item.title.trim(),
      source: getDomain(item.link),
      date: item.pubDate || new Date().toISOString(),
      url: item.link,
      description: stripHtml(item.description || item.title).slice(0, 200),
      relevanceScore: item._score,
    }));

    return res.status(200).json({ articles, fallback: false, count: articles.length });
  } catch (err) {
    return res.status(200).json({ articles: fallbackNews(keyword, sector), fallback: true, error: err.message });
  }
}

function fallbackNews(symbol, sector) {
  const today = new Date().toISOString();
  const s = sector || "Energy";
  return [
    { title: `Pakistan market update — ${s} sector in focus`, source: "Business Recorder", date: today, url: "https://brecorder.com", description: "Latest PSX market activity." },
    { title: `SBP monetary policy impact on ${s} companies`, source: "Dawn", date: today, url: "https://dawn.com/business-finance", description: "Rate decisions affect valuations." },
    { title: `PSX market wrap — ${s} stocks performance`, source: "Express Tribune", date: today, url: "https://tribune.com.pk/business", description: "Daily market summary." },
  ];
}
