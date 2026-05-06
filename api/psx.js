// Vercel Serverless API - handles both PSX data and News (Currents API)
export default async function handler(req, res) {
  const { symbol, news } = req.query;

  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // === NEWS ENDPOINT ===
  if (news === 'true') {
    const { q, sector } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' required for news" });
    }

    try {
      // Use Currents API - free tier, CORS-friendly, 1000 req/day
      // Get free API key from https://currentsapi.services/
      const CURRENTS_API_KEY = process.env.CURRENTS_API_KEY || '7CfHKtYOQN7JKhZwulgA3ceVMHKSKVIMWTaJWdx9T83971ZE';
      
      const searchQueries = [
        `${q} Pakistan stock`,
        `${q} PSX`,
        `${sector || ''} Pakistan economy`
      ].filter(Boolean);

      // Fetch from Currents API
      const newsPromises = searchQueries.map(query => 
        fetch(`https://api.currentsapi.services/v1/search?keywords=${encodeURIComponent(query)}&language=en&page_size=3`, {
          headers: { 'Authorization': CURRENTS_API_KEY }
        }).then(r => r.ok ? r.json() : null).catch(() => null)
      );

      const results = await Promise.all(newsPromises);
      
      // Combine and deduplicate articles
      const allArticles = [];
      const seen = new Set();
      
      results.forEach(result => {
        if (result?.news) {
          result.news.forEach(article => {
            if (!seen.has(article.id)) {
              seen.add(article.id);
              allArticles.push({
                title: article.title,
                source: article.author || article.source?.name || 'News Source',
                date: article.published,
                url: article.url,
                description: article.description
              });
            }
          });
        }
      });

      // If no real news or API key not set, return contextual fallback
      if (allArticles.length === 0) {
        return res.status(200).json({ 
          articles: generateFallbackNews(q, sector),
          fallback: true 
        });
      }

      return res.status(200).json({ 
        articles: allArticles.slice(0, 6),
        fallback: false 
      });

    } catch (error) {
      return res.status(200).json({ 
        articles: generateFallbackNews(q, sector),
        fallback: true,
        error: error.message 
      });
    }
  }

  // === PSX DATA ENDPOINT ===
  if (!symbol) {
    return res.status(400).json({ error: "Symbol required" });
  }

  try {
    const response = await fetch(
      `https://dps.psx.com.pk/timeseries/eod/${symbol}`,
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!response.ok) {
      throw new Error(`PSX API returned ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error("PSX fetch error:", error);
    res.status(500).json({ error: error.message || "PSX fetch failed" });
  }
}

// Fallback news generator when API fails or no key
function generateFallbackNews(symbol, sector) {
  const today = new Date().toISOString();
  
  const sectorNews = {
    Energy: [
      { title: "Global oil prices fluctuate amid Middle East tensions", source: "Reuters", date: today },
      { title: "Pakistan explores new gas reserves in Sindh", source: "Dawn", date: today },
      { title: "OPEC+ maintains production cuts, crude stabilizes", source: "Bloomberg", date: today },
      { title: "Middle East conflict raises supply disruption fears", source: "Al Jazeera", date: today, sentiment: -3 }
    ],
    Banking: [
      { title: "SBP holds policy rate steady at 12%", source: "Express Tribune", date: today },
      { title: "Pakistan banking sector sees 15% profit growth", source: "Business Recorder", date: today },
      { title: "Digital banking transformation accelerates in Pakistan", source: "The News", date: today }
    ],
    Cement: [
      { title: "Construction activity picks up ahead of budget", source: "Dawn", date: today },
      { title: "Coal prices impact cement sector margins", source: "Business Recorder", date: today, sentiment: -1 },
      { title: "Housing sector stimulus expected in new budget", source: "The Nation", date: today }
    ],
    Power: [
      { title: "Circular debt crosses Rs2.9 trillion mark", source: "Dawn", date: today, sentiment: -3 },
      { title: "New solar projects approved under renewable policy", source: "Express Tribune", date: today },
      { title: "Power tariff hike expected next quarter", source: "The News", date: today }
    ],
    Fertilizer: [
      { title: "Kharif season drives urea demand", source: "Business Recorder", date: today },
      { title: "Gas supply issues persist for fertilizer plants", source: "Dawn", date: today, sentiment: -2 },
      { title: "Government considers fertilizer subsidy extension", source: "The Nation", date: today }
    ]
  };

  return (sectorNews[sector] || sectorNews.Energy).map(n => ({
    ...n,
    description: n.title
  }));
}