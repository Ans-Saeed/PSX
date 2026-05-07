export default async function handler(req, res) {
  const { symbol, news, q, sector } = req.query;

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // === NEWS ENDPOINT ===
  if (news === 'true') {
    if (!q) {
      return res.status(400).json({ error: "Query parameter 'q' required for news" });
    }

    try {
      const CURRENTS_API_KEY = process.env.CURRENTS_API_KEY || '';

      if (CURRENTS_API_KEY) {
        const searchQueries = [
          `${q} Pakistan stock`,
          `${q} PSX`,
          `${sector || ''} Pakistan economy`
        ].filter(Boolean);

        const newsPromises = searchQueries.map(query => 
          fetch(`https://api.currentsapi.services/v1/search?keywords=${encodeURIComponent(query)}&language=en&page_size=3`, {
            headers: { 'Authorization': CURRENTS_API_KEY },
            timeout: 5000
          }).then(r => r.ok ? r.json() : null).catch(() => null)
        );

        const results = await Promise.all(newsPromises);

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

        if (allArticles.length > 0) {
          return res.status(200).json({ 
            articles: allArticles.slice(0, 6),
            fallback: false 
          });
        }
      }

      return res.status(200).json({ 
        articles: generateFallbackNews(q, sector),
        fallback: true 
      });

    } catch (error) {
      return res.status(200).json({ 
        articles: generateFallbackNews(q, sector),
        fallback: true,
        error: error.message 
      });
    }
  }

  // === PSX DATA + FUNDAMENTALS ENDPOINT ===
  if (!symbol) {
    return res.status(400).json({ error: "Symbol required" });
  }

  try {
    // Fetch EOD price data
    const priceRes = await fetch(
      `https://dps.psx.com.pk/timeseries/eod/${symbol}`,
      { headers: { 'Accept': 'application/json' }, timeout: 15000 }
    );

    if (!priceRes.ok) {
      throw new Error(`PSX API returned ${priceRes.status}`);
    }

    const priceData = await priceRes.json();

    // Fetch company page for fundamentals (HTML scraping)
    let fundamentals = null;
    try {
      const companyRes = await fetch(`https://dps.psx.com.pk/company/${symbol}`, {
        headers: { 'Accept': 'text/html' },
        timeout: 10000
      });

      if (companyRes.ok) {
        const html = await companyRes.text();
        fundamentals = scrapeFundamentals(html, symbol);
      }
    } catch (e) {
      console.log('Fundamentals scrape failed:', e.message);
    }

    res.status(200).json({
      ...priceData,
      fundamentals
    });

  } catch (error) {
    console.error("PSX fetch error:", error);
    res.status(500).json({ error: error.message || "PSX fetch failed" });
  }
}

// Scrape fundamentals from PSX company page HTML
function scrapeFundamentals(html, symbol) {
  const f = {};

  // Extract EPS from financial tables
  const epsMatch = html.match(/EPS\s*<\/td>\s*<td[^>]*>([\d,.]+)<\/td>/i) ||
                   html.match(/Earnings\s+per\s+Share\s*<\/td>\s*<td[^>]*>([\d,.]+)<\/td>/i);
  if (epsMatch) {
    f.eps = parseFloat(epsMatch[1].replace(/,/g, ''));
  }

  // Extract Net Profit Margin
  const npmMatch = html.match(/Net\s+Profit\s+Margin\s*<\/td>\s*<td[^>]*>([\d.]+)<\/td>/i);
  if (npmMatch) {
    f.profitMargin = parseFloat(npmMatch[1]);
  }

  // Extract Gross Profit Margin
  const gpmMatch = html.match(/Gross\s+Profit\s+Margin\s*<\/td>\s*<td[^>]*>([\d.]+)<\/td>/i);
  if (gpmMatch) {
    f.grossMargin = parseFloat(gpmMatch[1]);
  }

  // Extract Price/Book
  const pbMatch = html.match(/Price\/Book\s*<\/td>\s*<td[^>]*>([\d.]+)<\/td>/i);
  if (pbMatch) {
    f.priceToBook = parseFloat(pbMatch[1]);
  }

  // Extract Price/Sales
  const psMatch = html.match(/Price\/Sales\s*<\/td>\s*<td[^>]*>([\d.]+)<\/td>/i);
  if (psMatch) {
    f.priceToSales = parseFloat(psMatch[1]);
  }

  // Extract ROE
  const roeMatch = html.match(/Return\s+on\s+Equity\s*<\/td>\s*<td[^>]*>([\d.]+)<\/td>/i);
  if (roeMatch) {
    f.roe = parseFloat(roeMatch[1]);
  }

  // Extract ROA
  const roaMatch = html.match(/Return\s+on\s+Assets\s*<\/td>\s*<td[^>]*>([\d.]+)<\/td>/i);
  if (roaMatch) {
    f.roa = parseFloat(roaMatch[1]);
  }

  // Extract Current Ratio
  const crMatch = html.match(/Current\s+Ratio\s*<\/td>\s*<td[^>]*>([\d.]+)<\/td>/i);
  if (crMatch) {
    f.currentRatio = parseFloat(crMatch[1]);
  }

  // Extract Debt to Equity
  const deMatch = html.match(/Debt\s+to\s+Equity\s*<\/td>\s*<td[^>]*>([\d.]+)<\/td>/i) ||
                    html.match(/Long\s+term\s+Debt\s+to\s+Equity\s*<\/td>\s*<td[^>]*>([\d.]+)<\/td>/i);
  if (deMatch) {
    f.debtEq = parseFloat(deMatch[1]);
  }

  // Extract Book Value per Share
  const bvpsMatch = html.match(/Book\s+Value\s+per\s+Share\s*<\/td>\s*<td[^>]*>([\d,.]+)<\/td>/i);
  if (bvpsMatch) {
    f.bvps = parseFloat(bvpsMatch[1].replace(/,/g, ''));
  }

  // Extract Dividend Yield
  const dyMatch = html.match(/Dividend\s+Yield\s*<\/td>\s*<td[^>]*>([\d.]+)<\/td>/i);
  if (dyMatch) {
    f.divY = parseFloat(dyMatch[1]);
  }

  // Extract Dividend per Share
  const dpsMatch = html.match(/Dividend\s+per\s+Share\s*<\/td>\s*<td[^>]*>([\d.]+)<\/td>/i);
  if (dpsMatch) {
    f.dps = parseFloat(dpsMatch[1]);
  }

  // Extract company name from title
  const nameMatch = html.match(/<title>([^<]+)\s+-\s+PSX<\/title>/i) ||
                    html.match(/Stock\s+quote\s+for\s+([^<]+)/i);
  if (nameMatch) {
    f.name = nameMatch[1].trim();
  }

  // Extract sector
  const sectorMatch = html.match(/sector\/([^"]+)/i) ||
                      html.match(/Sector:\s*([^<]+)/i);
  if (sectorMatch) {
    f.sector = sectorMatch[1].trim();
  }

  return f;
}

function generateFallbackNews(symbol, sector) {
  const today = new Date().toISOString();
  const sectorNews = {
    Energy: [
      { title: "Global oil prices fluctuate amid Middle East tensions", source: "Reuters", date: today },
      { title: "Pakistan explores new gas reserves in Sindh", source: "Dawn", date: today },
      { title: "OPEC+ maintains production cuts, crude stabilizes", source: "Bloomberg", date: today },
      { title: "Middle East conflict raises supply disruption fears", source: "Al Jazeera", date: today },
      { title: "US shale production hits record highs", source: "Financial Times", date: today },
      { title: "Iran nuclear talks affect regional oil outlook", source: "Reuters", date: today }
    ],
    Banking: [
      { title: "SBP holds policy rate steady at 12%", source: "Express Tribune", date: today },
      { title: "Pakistan banking sector sees 15% profit growth", source: "Business Recorder", date: today },
      { title: "Digital banking transformation accelerates in Pakistan", source: "The News", date: today },
      { title: "IMF review prompts banking sector reforms", source: "Dawn", date: today },
      { title: "Islamic banking assets cross Rs5 trillion", source: "The Nation", date: today },
      { title: "Fintech partnerships reshape banking landscape", source: "Bloomberg", date: today }
    ],
    Cement: [
      { title: "Construction activity picks up ahead of budget", source: "Dawn", date: today },
      { title: "Coal prices impact cement sector margins", source: "Business Recorder", date: today },
      { title: "Housing sector stimulus expected in new budget", source: "The Nation", date: today },
      { title: "China slowdown affects cement exports", source: "Reuters", date: today },
      { title: "Diamer Bhasha Dam boosts cement demand", source: "Express Tribune", date: today },
      { title: "Cement exports to Afghanistan resume", source: "Dawn", date: today }
    ],
    Power: [
      { title: "Circular debt crosses Rs2.9 trillion mark", source: "Dawn", date: today },
      { title: "New solar projects approved under renewable policy", source: "Express Tribune", date: today },
      { title: "Power tariff hike expected next quarter", source: "The News", date: today },
      { title: "LNG supply crunch affects power generation", source: "Business Recorder", date: today },
      { title: "China offers $10bn for renewable energy projects", source: "Bloomberg", date: today },
      { title: "Nuclear power expansion plans approved", source: "Dawn", date: today }
    ],
    Fertilizer: [
      { title: "Kharif season drives urea demand", source: "Business Recorder", date: today },
      { title: "Gas supply issues persist for fertilizer plants", source: "Dawn", date: today },
      { title: "Government considers fertilizer subsidy extension", source: "The Nation", date: today },
      { title: "Global urea prices surge on supply cuts", source: "Reuters", date: today },
      { title: "India bans fertilizer exports, Pakistan benefits", source: "Financial Times", date: today },
      { title: "DAP imports increase ahead of sowing season", source: "Business Recorder", date: today }
    ],
    Textile: [
      { title: "EU GSP+ status boosts textile exports", source: "Dawn", date: today },
      { title: "Cotton prices rise on global supply concerns", source: "Business Recorder", date: today },
      { title: "Energy costs hurt textile competitiveness", source: "The News", date: today },
      { title: "Bangladesh crisis shifts orders to Pakistan", source: "Reuters", date: today },
      { title: "Sustainable fashion trend opens new markets", source: "Financial Times", date: today },
      { title: "Textile machinery imports surge", source: "Business Recorder", date: today }
    ],
    Telecom: [
      { title: "5G spectrum auction delayed again", source: "Dawn", date: today },
      { title: "Mobile data usage grows 40% YoY", source: "Express Tribune", date: today },
      { title: "Regulator slashes interconnection charges", source: "The News", date: today },
      { title: "Starlink negotiations with Pakistan continue", source: "Bloomberg", date: today },
      { title: "Fiber optic expansion reaches rural areas", source: "Business Recorder", date: today },
      { title: "Satellite internet license applications rise", source: "Dawn", date: today }
    ],
    Consumer: [
      { title: "Inflation slows to 8-year low", source: "Dawn", date: today },
      { title: "Consumer spending rebounds in urban centers", source: "Express Tribune", date: today },
      { title: "Edible oil prices drop on global surplus", source: "Business Recorder", date: today },
      { title: "Pakistan food exports to Middle East surge", source: "The Nation", date: today },
      { title: "Ramadan drives seasonal demand spike", source: "The News", date: today },
      { title: "Modern trade expansion in tier-2 cities", source: "Bloomberg", date: today }
    ]
  };
  return (sectorNews[sector] || sectorNews.Energy).map(n => ({
    ...n,
    description: n.title
  }));
}
