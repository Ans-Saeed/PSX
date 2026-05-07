// ================= CONFIG =================
const FUNDAMENTALS_FALLBACK = {
  OGDC: { pe: 4.2, eps: 32.5, divY: 12.1, roe: 28.3, bvps: 145, debtEq: 0.15, profitMargin: 35, revenueGrowth: 8, name: "Oil & Gas Development Company", sector: "Energy" },
  HBL: { pe: 5.1, eps: 28.4, divY: 10.2, roe: 22.1, bvps: 128, debtEq: 0.42, profitMargin: 28, revenueGrowth: 12, name: "Habib Bank Limited", sector: "Banking" },
  ENGRO: { pe: 6.5, eps: 35.2, divY: 8.4, roe: 30.5, bvps: 115, debtEq: 0.55, profitMargin: 22, revenueGrowth: 15, name: "Engro Corporation", sector: "Fertilizer" },
  LUCK: { pe: 8.2, eps: 42.1, divY: 6.2, roe: 18.4, bvps: 228, debtEq: 0.38, profitMargin: 18, revenueGrowth: 9, name: "Lucky Cement Limited", sector: "Cement" },
  FCCL: { pe: 5.8, eps: 15.3, divY: 9.1, roe: 20.2, bvps: 76, debtEq: 0.28, profitMargin: 16, revenueGrowth: 11, name: "Fauji Cement Company", sector: "Cement" },
  MCB: { pe: 4.5, eps: 38.7, divY: 11.3, roe: 25.6, bvps: 172, debtEq: 0.35, profitMargin: 32, revenueGrowth: 14, name: "Muslim Commercial Bank", sector: "Banking" },
  UBL: { pe: 5.3, eps: 30.1, divY: 10.5, roe: 21.8, bvps: 138, debtEq: 0.40, profitMargin: 29, revenueGrowth: 10, name: "United Bank Limited", sector: "Banking" },
  PPL: { pe: 6.72, eps: 29.47, divY: 4.29, roe: 10.97, bvps: 268.54, debtEq: 0.22, profitMargin: 34.86, revenueGrowth: 7, name: "Pakistan Petroleum Limited", sector: "Energy" },
  PSO: { pe: 6.1, eps: 45.3, divY: 14.1, roe: 26.3, bvps: 182, debtEq: 0.48, profitMargin: 4, revenueGrowth: 18, name: "Pakistan State Oil", sector: "Energy" },
  MARI: { pe: 7.2, eps: 55.8, divY: 7.3, roe: 22.4, bvps: 248, debtEq: 0.18, profitMargin: 38, revenueGrowth: 6, name: "Mari Petroleum", sector: "Energy" },
  HUBCO: { pe: 5.5, eps: 25.4, divY: 12.5, roe: 20.1, bvps: 126, debtEq: 0.62, profitMargin: 15, revenueGrowth: 5, name: "Hub Power Company", sector: "Power" },
  NBP: { pe: 4.2, eps: 22.1, divY: 11.8, roe: 19.5, bvps: 113, debtEq: 0.45, profitMargin: 25, revenueGrowth: 8, name: "National Bank of Pakistan", sector: "Banking" },
  BAFL: { pe: 4.8, eps: 26.7, divY: 10.8, roe: 21.2, bvps: 125, debtEq: 0.38, profitMargin: 27, revenueGrowth: 13, name: "Bank Alfalah", sector: "Banking" },
  ATRL: { pe: 5.2, eps: 31.4, divY: 9.5, roe: 23.8, bvps: 132, debtEq: 0.25, profitMargin: 12, revenueGrowth: 16, name: "Attock Refinery", sector: "Energy" },
  NML: { pe: 6.8, eps: 18.2, divY: 7.8, roe: 16.5, bvps: 110, debtEq: 0.52, profitMargin: 14, revenueGrowth: 4, name: "Nishat Mills", sector: "Textile" },
  DGKC: { pe: 7.5, eps: 12.8, divY: 5.2, roe: 14.2, bvps: 90, debtEq: 0.65, profitMargin: 11, revenueGrowth: 3, name: "DG Khan Cement", sector: "Cement" },
  FFBL: { pe: 8.1, eps: 9.5, divY: 4.8, roe: 12.8, bvps: 74, debtEq: 0.58, profitMargin: 8, revenueGrowth: 2, name: "Fauji Fertilizer Bin Qasim", sector: "Fertilizer" },
  KEL: { pe: 9.2, eps: 3.2, divY: 3.5, roe: 8.5, bvps: 38, debtEq: 1.85, profitMargin: 6, revenueGrowth: 7, name: "K-Electric", sector: "Power" },
  PTC: { pe: 12.5, eps: 2.1, divY: 2.8, roe: 5.2, bvps: 40, debtEq: 0.15, profitMargin: 18, revenueGrowth: -2, name: "Pakistan Telecommunication", sector: "Telecom" },
  UNITY: { pe: 3.8, eps: 18.5, divY: 15.2, roe: 32.1, bvps: 58, debtEq: 0.12, profitMargin: 28, revenueGrowth: 22, name: "Unity Foods", sector: "Consumer" },
};

const PK_RATE = 18;
const PSX_AVG_PE = 8.5;
const PSX_AVG_ROE = 16;
const PSX_AVG_DIVY = 8;

const f2 = n => isNaN(+n) ? 'N/A' : (+n).toFixed(2);
const f1 = n => isNaN(+n) ? 'N/A' : (+n).toFixed(1);
const sign = n => (+n >= 0 ? '+' : '');
const fmtVol = n => n > 1e6 ? (n/1e6).toFixed(2)+'M' : n > 1e3 ? (n/1e3).toFixed(0)+'K' : n;
const fmtDate = ts => new Date(ts * 1000).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtDateShort = ts => new Date(ts * 1000).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });

function qs(ticker) {
  document.getElementById('stockInput').value = ticker;
  analyzeStock();
}

function getPEAnalysis(pe) {
  if (pe < 5) return { rating: 'Excellent', color: 'accent', desc: 'Deeply undervalued vs market avg of ' + PSX_AVG_PE, suggestion: 'Strong buy signal if earnings are stable' };
  if (pe < PSX_AVG_PE) return { rating: 'Good', color: 'accent', desc: 'Trading below market average', suggestion: 'Potentially undervalued, investigate further' };
  if (pe < 12) return { rating: 'Fair', color: 'warn', desc: 'Near market average valuation', suggestion: 'Fairly priced, look for growth catalysts' };
  if (pe < 18) return { rating: 'High', color: 'danger', desc: 'Premium valuation vs market', suggestion: 'Ensure growth justifies the premium' };
  return { rating: 'Expensive', color: 'danger', desc: 'Significantly overvalued', suggestion: 'Wait for correction or strong growth proof' };
}

function getEPSAnalysis(eps, pe) {
  if (eps > 40) return { rating: 'Strong', color: 'accent', desc: 'High earnings per share', suggestion: 'Company generates substantial profit per share' };
  if (eps > 25) return { rating: 'Healthy', color: 'accent', desc: 'Solid earnings generation', suggestion: 'Sustainable profitability indicated' };
  if (eps > 15) return { rating: 'Moderate', color: 'warn', desc: 'Average earnings power', suggestion: 'Monitor for earnings improvement' };
  return { rating: 'Weak', color: 'danger', desc: 'Low earnings per share', suggestion: 'Check for turnaround or avoid' };
}

function getDivYAnalysis(divY) {
  if (divY > 12) return { rating: 'Excellent', color: 'accent', desc: 'Very high dividend yield', suggestion: 'Great for income investors, verify sustainability' };
  if (divY > 8) return { rating: 'Good', color: 'accent', desc: 'Above average yield', suggestion: 'Attractive income + potential upside' };
  if (divY > 5) return { rating: 'Fair', color: 'warn', desc: 'Market average yield', suggestion: 'Balanced income and growth play' };
  if (divY > 2) return { rating: 'Low', color: 'danger', desc: 'Below average yield', suggestion: 'Growth-focused, not for income' };
  return { rating: 'None', color: 'danger', desc: 'No dividend income', suggestion: 'Pure growth/speculative play' };
}

function getROEAnalysis(roe) {
  if (roe > 25) return { rating: 'Excellent', color: 'accent', desc: 'Exceptional capital efficiency', suggestion: 'Management creates superior shareholder value' };
  if (roe > PK_RATE) return { rating: 'Good', color: 'accent', desc: 'Beats risk-free rate (' + PK_RATE + '%)', suggestion: 'Equity risk is compensated adequately' };
  if (roe > 12) return { rating: 'Fair', color: 'warn', desc: 'Below risk-free rate', suggestion: 'Marginal equity returns, consider alternatives' };
  return { rating: 'Poor', color: 'danger', desc: 'Poor capital utilization', suggestion: 'Management destroying shareholder value' };
}

function getDebtEqAnalysis(debtEq) {
  if (debtEq < 0.2) return { rating: 'Very Safe', color: 'accent', desc: 'Minimal debt burden', suggestion: 'Strong balance sheet, recession-proof' };
  if (debtEq < 0.5) return { rating: 'Safe', color: 'accent', desc: 'Conservative leverage', suggestion: 'Comfortable debt levels for sector' };
  if (debtEq < 1.0) return { rating: 'Moderate', color: 'warn', desc: 'Average industry leverage', suggestion: 'Monitor interest rate sensitivity' };
  if (debtEq < 1.5) return { rating: 'High', color: 'danger', desc: 'Elevated debt levels', suggestion: 'Vulnerable to rate hikes/cash flow issues' };
  return { rating: 'Risky', color: 'danger', desc: 'Excessive leverage', suggestion: 'High bankruptcy risk in downturns' };
}

function getProfitMarginAnalysis(margin) {
  if (margin > 30) return { rating: 'Excellent', color: 'accent', desc: 'Strong pricing power', suggestion: 'Wide moat, premium business model' };
  if (margin > 15) return { rating: 'Good', color: 'accent', desc: 'Healthy margins', suggestion: 'Sustainable competitive advantage' };
  if (margin > 8) return { rating: 'Fair', color: 'warn', desc: 'Thin margins', suggestion: 'Volume-dependent business, watch costs' };
  return { rating: 'Weak', color: 'danger', desc: 'Very low margins', suggestion: 'Commodity business, cyclical risk high' };
}

function getRevenueGrowthAnalysis(growth) {
  if (growth > 20) return { rating: 'Excellent', color: 'accent', desc: 'Hyper-growth phase', suggestion: 'Early stage or market share gains' };
  if (growth > 10) return { rating: 'Good', color: 'accent', desc: 'Strong growth trajectory', suggestion: 'Business expanding effectively' };
  if (growth > 5) return { rating: 'Steady', color: 'warn', desc: 'Moderate growth', suggestion: 'Mature business, stable cash flows' };
  if (growth > 0) return { rating: 'Slow', color: 'warn', desc: 'Stagnant growth', suggestion: 'Market saturation or competition' };
  return { rating: 'Declining', color: 'danger', desc: 'Negative growth', suggestion: 'Structural issues, avoid or turnaround bet' };
}

function getBVPSAnalysis(bvps, price) {
  const pb = price / bvps;
  if (pb < 1) return { rating: 'Deep Value', color: 'accent', desc: 'Trading below book value', suggestion: 'Assets worth more than price, potential bargain' };
  if (pb < 1.5) return { rating: 'Value', color: 'accent', desc: 'Near book value', suggestion: 'Reasonable asset backing' };
  if (pb < 3) return { rating: 'Fair', color: 'warn', desc: 'Moderate premium to book', suggestion: 'Growth/intangibles justify premium' };
  return { rating: 'Premium', color: 'danger', desc: 'High price-to-book', suggestion: 'Ensure ROE justifies the premium' };
}

function calculateFairValue(f, price) {
  const methods = [];
  if (f.eps) {
    const peFair = f.eps * PSX_AVG_PE;
    methods.push({ name: 'P/E Mean Reversion', value: peFair, desc: 'EPS x Market Avg P/E (' + PSX_AVG_PE + ')' });
  }
  if (f.divY && f.divY > 0) {
    const divPerShare = price * (f.divY / 100);
    const growthRate = Math.min((f.revenueGrowth || 0) / 100, 0.05);
    const discountRate = 0.12;
    if (discountRate > growthRate) {
      const ddmFair = divPerShare / (discountRate - growthRate);
      methods.push({ name: 'Dividend Discount', value: ddmFair, desc: 'Dividend / (Discount - Growth)' });
    }
  }
  if (f.bvps) {
    const pbFair = f.bvps * (f.roe / PK_RATE);
    methods.push({ name: 'Book Value Premium', value: pbFair, desc: 'BVPS x ROE Spread Premium' });
  }
  if (f.eps && f.bvps) {
    const graham = Math.sqrt(22.5 * f.eps * f.bvps);
    methods.push({ name: 'Graham Number', value: graham, desc: 'sqrt(22.5 x EPS x BVPS)' });
  }
  const validMethods = methods.filter(m => !isNaN(m.value) && m.value > 0);
  const avgFair = validMethods.length > 0 ? validMethods.reduce((a, m) => a + m.value, 0) / validMethods.length : 0;
  const upside = avgFair > 0 ? ((avgFair - price) / price) * 100 : 0;
  return { methods, avgFair, upside, count: validMethods.length };
}

function getHistoricalPrices(data) {
  const now = Date.now() / 1000;
  const periods = [
    { label: '1M', days: 30 },
    { label: '2M', days: 60 },
    { label: '3M', days: 90 },
    { label: '5M', days: 150 },
    { label: '1Y', days: 365 },
    { label: '2Y', days: 730 },
    { label: '3Y', days: 1095 }
  ];
  return periods.map(p => {
    const targetTs = now - (p.days * 86400);
    let closest = data.reduce((prev, curr) => {
      return Math.abs(curr.timestamp - targetTs) < Math.abs(prev.timestamp - targetTs) ? curr : prev;
    });
    const chg = ((data[0].close - closest.close) / closest.close) * 100;
    return {
      label: p.label,
      date: closest.timestamp,
      price: closest.close,
      change: chg,
      daysDiff: Math.round(Math.abs(closest.timestamp - targetTs) / 86400)
    };
  });
}

async function fetchNews(symbol, sector) {
  try {
    const res = await fetch(`/api/psx?news=true&q=${encodeURIComponent(symbol)}&sector=${encodeURIComponent(sector)}`);
    if (!res.ok) throw new Error('News API failed');
    const json = await res.json();
    return json.articles || [];
  } catch (err) {
    return generateFallbackNews(symbol, sector);
  }
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

// ================= MAIN =================
async function analyzeStock() {
  const raw = document.getElementById('stockInput').value.trim().toUpperCase();
  if (!raw) return;

  showLoading();
  updateLoaderStep(1);

  try {
    const res = await fetch(`/api/psx?symbol=${raw}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    if (!json?.data || json.data.length < 2) throw new Error("Ticker not found or insufficient data");

    updateLoaderStep(2);

    const data = json.data.map(row => ({
      timestamp: row[0], close: row[1], volume: row[2], open: row[3]
    }));

    const latest = data[0];
    const prev = data[1];
    const price = latest.close;
    const chgAbs = price - prev.close;
    const chgPct = (chgAbs / prev.close) * 100;
    const volume = latest.volume;

    const last250 = data.slice(0, 250);
    const prices = last250.map(d => d.close);
    const w52H = Math.max(...prices);
    const w52L = Math.min(...prices);
    const pct52 = ((price - w52L) / (w52H - w52L)) * 100;

    updateLoaderStep(3, 'Loading fundamentals…');

    // Try scraped fundamentals first, fallback to hardcoded
    let f = json.fundamentals || {};
    const fallback = FUNDAMENTALS_FALLBACK[raw] || { name: raw, sector: 'Energy' };

    // Merge: scraped values take priority, fallback fills gaps
    f = {
      name: f.name || fallback.name,
      sector: f.sector || fallback.sector,
      pe: f.pe || fallback.pe,
      eps: f.eps || fallback.eps,
      divY: f.divY || fallback.divY,
      roe: f.roe || fallback.roe,
      bvps: f.bvps || fallback.bvps,
      debtEq: f.debtEq !== undefined ? f.debtEq : fallback.debtEq,
      profitMargin: f.profitMargin !== undefined ? f.profitMargin : fallback.profitMargin,
      revenueGrowth: f.revenueGrowth !== undefined ? f.revenueGrowth : fallback.revenueGrowth,
    };

    // Calculate P/E from price + EPS if we have EPS but no P/E
    if (!f.pe && f.eps && f.eps > 0) {
      f.pe = price / f.eps;
    }
    // Calculate EPS from price + P/E if we have P/E but no EPS
    if (!f.eps && f.pe && f.pe > 0) {
      f.eps = price / f.pe;
    }
    // Calculate Dividend Yield from DPS if available
    if (!f.divY && f.dps && f.dps > 0) {
      f.divY = (f.dps / price) * 100;
    }

    const pe = f.pe ?? null;
    const eps = f.eps ?? null;
    const divY = f.divY ?? 0;
    const roe = f.roe ?? null;
    const bvps = f.bvps ?? null;
    const debtEq = f.debtEq ?? null;
    const profitMargin = f.profitMargin ?? null;
    const revenueGrowth = f.revenueGrowth ?? null;
    const sector = f.sector || 'Energy';

    const fairValue = calculateFairValue({ pe, eps, divY, roe, bvps, revenueGrowth, profitMargin }, price);
    const history = getHistoricalPrices(data);

    updateLoaderStep(4, 'Fetching news…');
    const news = await fetchNews(raw, sector);

    // ===== FUNDAMENTAL SCORING =====
    let score = 0;
    const checklist = [];

    if (pe !== null) {
      const ok = pe < PSX_AVG_PE;
      score += ok ? 1.5 : -1;
      checklist.push({ label: `P/E ${f2(pe)} vs avg ${PSX_AVG_PE}`, status: ok ? 'pass' : 'fail' });
    }

    if (roe !== null) {
      const ok = roe > PK_RATE;
      score += ok ? 1 : -0.5;
      checklist.push({ label: `ROE ${roe}% vs ${PK_RATE}%`, status: ok ? 'pass' : 'warn' });
    }

    if (divY > 0) {
      const ok = divY > PSX_AVG_DIVY;
      score += ok ? 0.5 : 0;
      checklist.push({ label: `Dividend ${divY}% vs avg ${PSX_AVG_DIVY}%`, status: ok ? 'pass' : 'warn' });
    }

    if (debtEq !== null) {
      const ok = debtEq < 0.5;
      score += ok ? 0.5 : -0.5;
      checklist.push({ label: `Debt/Equity ${f2(debtEq)}`, status: ok ? 'pass' : 'warn' });
    }

    if (profitMargin !== null) {
      const ok = profitMargin > 15;
      score += ok ? 0.5 : 0;
      checklist.push({ label: `Profit Margin ${profitMargin}%`, status: ok ? 'pass' : 'warn' });
    }

    if (revenueGrowth !== null) {
      const ok = revenueGrowth > 5;
      score += ok ? 0.5 : -0.5;
      checklist.push({ label: `Revenue Growth ${revenueGrowth}%`, status: ok ? 'pass' : 'warn' });
    }

    if (pct52 < 35) {
      score += 0.5;
      checklist.push({ label: `Near 52w low (${f2(pct52)}%)`, status: 'pass' });
    } else if (pct52 > 80) {
      score -= 0.5;
      checklist.push({ label: `Near 52w high (${f2(pct52)}%)`, status: 'warn' });
    }

    let techScore = 0;
    if (chgPct > 2) techScore += 0.5;
    else if (chgPct < -2) techScore -= 0.5;

    const avgVol = data.slice(1, 20).reduce((a, b) => a + b.volume, 0) / 19;
    if (volume > avgVol * 1.5) {
      techScore += chgPct > 0 ? 0.5 : -0.5;
    }

    const totalScore = score + techScore;

    // ===== VERDICT =====
    let verdict, confidence, verdictReason;

    if (totalScore >= 2.5) {
      verdict = 'BUY'; confidence = Math.min(95, 70 + totalScore * 5);
      verdictReason = 'Strong fundamentals with favorable technical setup. Stock appears undervalued relative to market benchmarks.';
    } else if (totalScore >= 0.5) {
      verdict = 'BUY'; confidence = Math.min(85, 60 + totalScore * 8);
      verdictReason = 'Good fundamentals with reasonable valuation. Consider accumulating on dips.';
    } else if (totalScore >= -0.5) {
      verdict = 'HOLD'; confidence = 55;
      verdictReason = 'Mixed signals. Fundamentals are stable but not compelling. Hold existing positions.';
    } else if (totalScore >= -2) {
      verdict = 'HOLD'; confidence = 50;
      verdictReason = 'Caution advised. Some fundamental weaknesses present. Monitor for improvement.';
    } else {
      verdict = 'SELL'; confidence = Math.min(90, 60 + Math.abs(totalScore) * 5);
      verdictReason = 'Multiple fundamental red flags. Valuation concerns and weak metrics suggest reducing exposure.';
    }

    if (fairValue.upside > 30 && totalScore > 0) {
      verdict = 'STRONG BUY'; confidence = 92;
      verdictReason = `Significant undervaluation detected. Fair value estimate (${f2(fairValue.avgFair)}) is ${f2(fairValue.upside)}% above current price.`;
    } else if (fairValue.upside < -20 && totalScore < 0) {
      verdict = 'SELL'; confidence = 88;
      verdictReason = `Overvalued by ${f2(Math.abs(fairValue.upside))}% vs fair value estimate. Fundamentals do not support current price.`;
    }

    updateLoaderStep(5);

    const peAnalysis = pe ? getPEAnalysis(pe) : null;
    const epsAnalysis = eps ? getEPSAnalysis(eps, pe) : null;
    const divAnalysis = divY > 0 ? getDivYAnalysis(divY) : null;
    const roeAnalysis = roe ? getROEAnalysis(roe) : null;
    const debtAnalysis = debtEq !== null ? getDebtEqAnalysis(debtEq) : null;
    const marginAnalysis = profitMargin !== null ? getProfitMarginAnalysis(profitMargin) : null;
    const growthAnalysis = revenueGrowth !== null ? getRevenueGrowthAnalysis(revenueGrowth) : null;
    const bvpsAnalysis = bvps ? getBVPSAnalysis(bvps, price) : null;

    // ===== RENDER =====
    const html = `
      <div class="stock-header">
        <div class="stock-name-block">
          <h2>PSX:${raw}</h2>
          <div class="company-name">${f.name}</div>
          <div class="data-note">⟳ Live via PSX · ${fmtDate(latest.timestamp)} · ${sector} Sector</div>
        </div>
        <div class="price-block">
          <div class="current-price">PKR ${f2(price)}</div>
          <div class="price-change ${chgAbs >= 0 ? 'up' : 'dn'}">
            ${sign(chgAbs)}${f2(chgAbs)} (${sign(chgPct)}${f2(chgPct)}%)
          </div>
          <div class="volume-tag">Vol: ${fmtVol(volume)}</div>
        </div>
      </div>

      <div class="range-section">
        <div class="range-label">52 Week Range</div>
        <div class="range-bar-wrap">
          <div class="range-val low">PKR ${f2(w52L)}</div>
          <div class="range-bar">
            <div class="range-fill" style="width:${Math.max(0, Math.min(100, pct52))}%"></div>
            <div class="range-marker" style="left:${Math.max(0, Math.min(100, pct52))}%"></div>
          </div>
          <div class="range-val high">PKR ${f2(w52H)}</div>
        </div>
        <div class="range-position">Current position: <strong>${f2(pct52)}%</strong> of 52-week range</div>
      </div>

      <div class="section fairvalue-section">
        <div class="section-title">Fair Value Estimates</div>
        <div class="fairvalue-grid">
          ${fairValue.methods.map(m => `
            <div class="fairvalue-card">
              <div class="fairvalue-name">${m.name}</div>
              <div class="fairvalue-price">PKR ${f2(m.value)}</div>
              <div class="fairvalue-desc">${m.desc}</div>
              <div class="fairvalue-vs-current ${m.value > price ? 'up' : 'dn'}">
                ${m.value > price ? '+' : ''}${f2(((m.value - price) / price) * 100)}% vs current
              </div>
            </div>
          `).join('')}
          ${fairValue.count > 0 ? `
          <div class="fairvalue-card highlight">
            <div class="fairvalue-name">Consensus Fair Value</div>
            <div class="fairvalue-price big">PKR ${f2(fairValue.avgFair)}</div>
            <div class="fairvalue-desc">Average of ${fairValue.count} valuation methods</div>
            <div class="fairvalue-vs-current ${fairValue.upside > 0 ? 'up' : 'dn'}">
              ${fairValue.upside > 0 ? '+' : ''}${f2(fairValue.upside)}% implied upside
            </div>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="section history-section">
        <div class="section-title">Historical Performance</div>
        <div class="history-grid">
          ${history.map(h => `
            <div class="history-card">
              <div class="history-period">${h.label}</div>
              <div class="history-date">${fmtDateShort(h.date)}${h.daysDiff > 5 ? ' <span class="approx">(approx)</span>' : ''}</div>
              <div class="history-price">PKR ${f2(h.price)}</div>
              <div class="history-change ${h.change >= 0 ? 'up' : 'dn'}">
                ${sign(h.change)}${f2(h.change)}% since then
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section fundamentals-section">
        <div class="section-title">Fundamental Analysis</div>
        <div class="fundamentals-grid">
          ${pe ? `
          <div class="fundamental-card">
            <div class="fundamental-header">
              <div class="fundamental-label">P/E Ratio</div>
              <div class="fundamental-badge ${peAnalysis.color}">${peAnalysis.rating}</div>
            </div>
            <div class="fundamental-value">${f2(pe)}</div>
            <div class="fundamental-context">Market Avg: ${PSX_AVG_PE}</div>
            <div class="fundamental-bar">
              <div class="fundamental-track">
                <div class="fundamental-fill ${peAnalysis.color}" style="width:${Math.min(100, (pe / 15) * 100)}%"></div>
              </div>
            </div>
            <div class="fundamental-insight">
              <div class="insight-main">${peAnalysis.desc}</div>
              <div class="insight-suggestion">💡 ${peAnalysis.suggestion}</div>
            </div>
          </div>
          ` : ''}

          ${eps ? `
          <div class="fundamental-card">
            <div class="fundamental-header">
              <div class="fundamental-label">EPS</div>
              <div class="fundamental-badge ${epsAnalysis.color}">${epsAnalysis.rating}</div>
            </div>
            <div class="fundamental-value">PKR ${f2(eps)}</div>
            <div class="fundamental-context">Per Share Earnings</div>
            <div class="fundamental-bar">
              <div class="fundamental-track">
                <div class="fundamental-fill ${epsAnalysis.color}" style="width:${Math.min(100, (eps / 50) * 100)}%"></div>
              </div>
            </div>
            <div class="fundamental-insight">
              <div class="insight-main">${epsAnalysis.desc}</div>
              <div class="insight-suggestion">💡 ${epsAnalysis.suggestion}</div>
            </div>
          </div>
          ` : ''}

          ${divY > 0 ? `
          <div class="fundamental-card">
            <div class="fundamental-header">
              <div class="fundamental-label">Dividend Yield</div>
              <div class="fundamental-badge ${divAnalysis.color}">${divAnalysis.rating}</div>
            </div>
            <div class="fundamental-value">${f2(divY)}%</div>
            <div class="fundamental-context">Annual Return</div>
            <div class="fundamental-bar">
              <div class="fundamental-track">
                <div class="fundamental-fill ${divAnalysis.color}" style="width:${Math.min(100, (divY / 15) * 100)}%"></div>
              </div>
            </div>
            <div class="fundamental-insight">
              <div class="insight-main">${divAnalysis.desc}</div>
              <div class="insight-suggestion">💡 ${divAnalysis.suggestion}</div>
            </div>
          </div>
          ` : ''}

          ${roe ? `
          <div class="fundamental-card">
            <div class="fundamental-header">
              <div class="fundamental-label">ROE</div>
              <div class="fundamental-badge ${roeAnalysis.color}">${roeAnalysis.rating}</div>
            </div>
            <div class="fundamental-value">${f2(roe)}%</div>
            <div class="fundamental-context">Return on Equity</div>
            <div class="fundamental-bar">
              <div class="fundamental-track">
                <div class="fundamental-fill ${roeAnalysis.color}" style="width:${Math.min(100, (roe / 35) * 100)}%"></div>
              </div>
            </div>
            <div class="fundamental-insight">
              <div class="insight-main">${roeAnalysis.desc}</div>
              <div class="insight-suggestion">💡 ${roeAnalysis.suggestion}</div>
            </div>
          </div>
          ` : ''}

          ${bvps ? `
          <div class="fundamental-card">
            <div class="fundamental-header">
              <div class="fundamental-label">Book Value / Share</div>
              <div class="fundamental-badge ${bvpsAnalysis.color}">${bvpsAnalysis.rating}</div>
            </div>
            <div class="fundamental-value">PKR ${f2(bvps)}</div>
            <div class="fundamental-context">P/B: ${f2(price / bvps)}x</div>
            <div class="fundamental-bar">
              <div class="fundamental-track">
                <div class="fundamental-fill ${bvpsAnalysis.color}" style="width:${Math.min(100, ((price / bvps) / 3) * 100)}%"></div>
              </div>
            </div>
            <div class="fundamental-insight">
              <div class="insight-main">${bvpsAnalysis.desc}</div>
              <div class="insight-suggestion">💡 ${bvpsAnalysis.suggestion}</div>
            </div>
          </div>
          ` : ''}

          ${debtEq !== null ? `
          <div class="fundamental-card">
            <div class="fundamental-header">
              <div class="fundamental-label">Debt / Equity</div>
              <div class="fundamental-badge ${debtAnalysis.color}">${debtAnalysis.rating}</div>
            </div>
            <div class="fundamental-value">${f2(debtEq)}x</div>
            <div class="fundamental-context">Leverage Ratio</div>
            <div class="fundamental-bar">
              <div class="fundamental-track">
                <div class="fundamental-fill ${debtAnalysis.color}" style="width:${Math.min(100, (debtEq / 2) * 100)}%"></div>
              </div>
            </div>
            <div class="fundamental-insight">
              <div class="insight-main">${debtAnalysis.desc}</div>
              <div class="insight-suggestion">💡 ${debtAnalysis.suggestion}</div>
            </div>
          </div>
          ` : ''}

          ${profitMargin !== null ? `
          <div class="fundamental-card">
            <div class="fundamental-header">
              <div class="fundamental-label">Profit Margin</div>
              <div class="fundamental-badge ${marginAnalysis.color}">${marginAnalysis.rating}</div>
            </div>
            <div class="fundamental-value">${f2(profitMargin)}%</div>
            <div class="fundamental-context">Net Margin</div>
            <div class="fundamental-bar">
              <div class="fundamental-track">
                <div class="fundamental-fill ${marginAnalysis.color}" style="width:${Math.min(100, (profitMargin / 40) * 100)}%"></div>
              </div>
            </div>
            <div class="fundamental-insight">
              <div class="insight-main">${marginAnalysis.desc}</div>
              <div class="insight-suggestion">💡 ${marginAnalysis.suggestion}</div>
            </div>
          </div>
          ` : ''}

          ${revenueGrowth !== null ? `
          <div class="fundamental-card">
            <div class="fundamental-header">
              <div class="fundamental-label">Revenue Growth</div>
              <div class="fundamental-badge ${growthAnalysis.color}">${growthAnalysis.rating}</div>
            </div>
            <div class="fundamental-value">${f2(revenueGrowth)}%</div>
            <div class="fundamental-context">YoY Growth</div>
            <div class="fundamental-bar">
              <div class="fundamental-track">
                <div class="fundamental-fill ${growthAnalysis.color}" style="width:${Math.min(100, Math.max(0, ((revenueGrowth + 5) / 30) * 100))}%"></div>
              </div>
            </div>
            <div class="fundamental-insight">
              <div class="insight-main">${growthAnalysis.desc}</div>
              <div class="insight-suggestion">💡 ${growthAnalysis.suggestion}</div>
            </div>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Price Projections</div>
        <div class="projection-grid">
          <div class="proj-card bear">
            <div class="proj-label">Bear Case</div>
            <div class="proj-price">PKR ${f2(w52L * 0.95)}</div>
            <div class="proj-return dn">${f2(((w52L * 0.95 - price) / price) * 100)}%</div>
            <div class="proj-note">5% below 52-week low</div>
          </div>
          <div class="proj-card base">
            <div class="proj-label">Base Case</div>
            <div class="proj-price">PKR ${f2((w52H + w52L) / 2)}</div>
            <div class="proj-return ${((w52H + w52L) / 2 - price) >= 0 ? 'up' : 'dn'}">${f2((((w52H + w52L) / 2 - price) / price) * 100)}%</div>
            <div class="proj-note">Midpoint of 52-week range</div>
          </div>
          <div class="proj-card bull">
            <div class="proj-label">Bull Case</div>
            <div class="proj-price">PKR ${f2(w52H * 1.05)}</div>
            <div class="proj-return up">${f2(((w52H * 1.05 - price) / price) * 100)}%</div>
            <div class="proj-note">5% above 52-week high</div>
          </div>
        </div>
      </div>

      <div class="verdict-card ${verdict.toLowerCase().replace(' ', '-')}">
        <div class="verdict-inner">
          <div class="verdict-stamp">${verdict}</div>
          <div class="verdict-details">
            <div class="verdict-confidence">Confidence Level: ${Math.round(confidence)}%</div>
            <div class="confidence-bar">
              <div class="confidence-fill" style="width:${confidence}%"></div>
            </div>
            <div class="verdict-reasoning">${verdictReason}</div>
            <div class="score-breakdown">
              <div class="score-item"><span>Fundamental Score</span><span class="${score >= 0 ? 'up' : 'dn'}">${score > 0 ? '+' : ''}${f2(score)}</span></div>
              <div class="score-item"><span>Technical Score</span><span class="${techScore >= 0 ? 'up' : 'dn'}">${techScore > 0 ? '+' : ''}${f2(techScore)}</span></div>
              <div class="score-item total"><span>Total Score</span><span class="${totalScore >= 0 ? 'up' : 'dn'}">${totalScore > 0 ? '+' : ''}${f2(totalScore)}</span></div>
            </div>
            <div class="checklist">
              ${checklist.map(c => `
                <div class="check-item">
                  <span class="check-icon ${c.status}">${c.status === 'pass' ? '✓' : '◐'}</span>
                  <span>${c.label}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="section news-section">
        <div class="section-title">📰 Latest News & Global Events</div>
        <div class="news-intro">News is for informational purposes and does not directly affect the fundamental verdict above.</div>
        <div class="news-grid">
          ${news.map(item => `
            <div class="news-card">
              <div class="news-header">
                <span class="news-source">${item.source}</span>
                <span class="news-date">${new Date(item.date).toLocaleDateString('en-PK')}</span>
              </div>
              <div class="news-title">${item.title}</div>
              ${item.description && item.description !== item.title ? `<div class="news-desc">${item.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    hideLoading();
    const el = document.getElementById('results');
    el.innerHTML = html;
    el.style.display = 'block';

    setTimeout(() => {
      document.querySelectorAll('.range-fill, .range-marker, .confidence-fill, .fundamental-fill').forEach(el => {
        el.style.width = el.style.width;
      });
    }, 50);

  } catch (err) {
    showError(err.message);
  }
}

// ================= MAIN =================
async function analyzeStock() {
  const raw = document.getElementById('stockInput').value.trim().toUpperCase();
  if (!raw) return;

  showLoading();
  updateLoaderStep(1);

  try {
    const res = await fetch(`/api/psx?symbol=${raw}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    if (!json?.data || json.data.length < 2) throw new Error("Ticker not found or insufficient data");

    updateLoaderStep(2);

    const data = json.data.map(row => ({
      timestamp: row[0], close: row[1], volume: row[2], open: row[3]
    }));

    const latest = data[0];
    const prev = data[1];
    const price = latest.close;
    const chgAbs = price - prev.close;
    const chgPct = (chgAbs / prev.close) * 100;
    const volume = latest.volume;

    const last250 = data.slice(0, 250);
    const prices = last250.map(d => d.close);
    const w52H = Math.max(...prices);
    const w52L = Math.min(...prices);
    const pct52 = ((price - w52L) / (w52H - w52L)) * 100;

    updateLoaderStep(3, 'Loading fundamentals…');

    // Use scraped fundamentals if available, otherwise fallback
    let f = FUNDAMENTALS_FALLBACK[raw] || { name: raw, sector: 'Energy' };

    // If API returned scraped fundamentals, merge them (scraped takes priority)
    if (json.fundamentals) {
      const scraped = json.fundamentals;
      f = {
        ...f,
        name: scraped.name || f.name,
        sector: scraped.sector || f.sector,
        pe: scraped.pe ?? scraped.eps ? price / scraped.eps : f.pe,
        eps: scraped.eps ?? f.eps,
        divY: scraped.divY ?? f.divY,
        roe: scraped.roe ?? f.roe,
        bvps: scraped.bvps ?? f.bvps,
        debtEq: scraped.debtEq ?? f.debtEq,
        profitMargin: scraped.profitMargin ?? f.profitMargin,
        revenueGrowth: scraped.revenueGrowth ?? f.revenueGrowth,
      };
    }

    // Calculate P/E from price if EPS exists but PE doesn't
    if (!f.pe && f.eps) f.pe = price / f.eps;
    // Calculate Div Yield from price if we have DPS
    if (!f.divY && f.eps) {
      // Estimate div yield from payout ratio (typical 40-60% for PSX)
      const payoutRatio = 0.5;
      const dps = f.eps * payoutRatio;
      f.divY = (dps / price) * 100;
    }

    const pe = f.pe ?? null;
    const eps = f.eps ?? null;
    const divY = f.divY ?? 0;
    const roe = f.roe ?? null;
    const bvps = f.bvps ?? null;
    const debtEq = f.debtEq ?? null;
    const profitMargin = f.profitMargin ?? null;
    const revenueGrowth = f.revenueGrowth ?? null;
    const sector = f.sector || 'Energy';

    const fairValue = calculateFairValue({ pe, eps, divY, roe, bvps, revenueGrowth, profitMargin }, price);
    const history = getHistoricalPrices(data);

    updateLoaderStep(4, 'Fetching news…');
    const news = await fetchNews(raw, sector);

    // ===== FUNDAMENTAL SCORING =====
    let score = 0;
    const checklist = [];

    if (pe !== null) {
      const ok = pe < PSX_AVG_PE;
      score += ok ? 1.5 : -1;
      checklist.push({ label: `P/E ${f2(pe)} vs avg ${PSX_AVG_PE}`, status: ok ? 'pass' : 'fail' });
    }

    if (roe !== null) {
      const ok = roe > PK_RATE;
      score += ok ? 1 : -0.5;
      checklist.push({ label: `ROE ${roe}% vs ${PK_RATE}%`, status: ok ? 'pass' : 'warn' });
    }

    if (divY > 0) {
      const ok = divY > PSX_AVG_DIVY;
      score += ok ? 0.5 : 0;
      checklist.push({ label: `Dividend ${f2(divY)}% vs avg ${PSX_AVG_DIVY}%`, status: ok ? 'pass' : 'warn' });
    }

    if (debtEq !== null) {
      const ok = debtEq < 0.5;
      score += ok ? 0.5 : -0.5;
      checklist.push({ label: `Debt/Equity ${f2(debtEq)}`, status: ok ? 'pass' : 'warn' });
    }

    if (profitMargin !== null) {
      const ok = profitMargin > 15;
      score += ok ? 0.5 : 0;
      checklist.push({ label: `Profit Margin ${f2(profitMargin)}%`, status: ok ? 'pass' : 'warn' });
    }

    if (revenueGrowth !== null) {
      const ok = revenueGrowth > 5;
      score += ok ? 0.5 : -0.5;
      checklist.push({ label: `Revenue Growth ${f2(revenueGrowth)}%`, status: ok ? 'pass' : 'warn' });
    }

    if (pct52 < 35) {
      score += 0.5;
      checklist.push({ label: `Near 52w low (${f2(pct52)}%)`, status: 'pass' });
    } else if (pct52 > 80) {
      score -= 0.5;
      checklist.push({ label: `Near 52w high (${f2(pct52)}%)`, status: 'warn' });
    }

    let techScore = 0;
    if (chgPct > 2) techScore += 0.5;
    else if (chgPct < -2) techScore -= 0.5;

    const avgVol = data.slice(1, 20).reduce((a, b) => a + b.volume, 0) / 19;
    if (volume > avgVol * 1.5) {
      techScore += chgPct > 0 ? 0.5 : -0.5;
    }

    const totalScore = score + techScore;

    let verdict, confidence, verdictReason;

    if (totalScore >= 2.5) {
      verdict = 'BUY'; confidence = Math.min(95, 70 + totalScore * 5);
      verdictReason = 'Strong fundamentals with favorable technical setup. Stock appears undervalued relative to market benchmarks.';
    } else if (totalScore >= 0.5) {
      verdict = 'BUY'; confidence = Math.min(85, 60 + totalScore * 8);
      verdictReason = 'Good fundamentals with reasonable valuation. Consider accumulating on dips.';
    } else if (totalScore >= -0.5) {
      verdict = 'HOLD'; confidence = 55;
      verdictReason = 'Mixed signals. Fundamentals are stable but not compelling. Hold existing positions.';
    } else if (totalScore >= -2) {
      verdict = 'HOLD'; confidence = 50;
      verdictReason = 'Caution advised. Some fundamental weaknesses present. Monitor for improvement.';
    } else {
      verdict = 'SELL'; confidence = Math.min(90, 60 + Math.abs(totalScore) * 5);
      verdictReason = 'Multiple fundamental red flags. Valuation concerns and weak metrics suggest reducing exposure.';
    }

    if (fairValue.upside > 30 && totalScore > 0) {
      verdict = 'STRONG BUY'; confidence = 92;
      verdictReason = `Significant undervaluation detected. Fair value estimate (PKR ${f2(fairValue.avgFair)}) is ${f2(fairValue.upside)}% above current price.`;
    } else if (fairValue.upside < -20 && totalScore < 0) {
      verdict = 'SELL'; confidence = 88;
      verdictReason = `Overvalued by ${f2(Math.abs(fairValue.upside))}% vs fair value estimate. Fundamentals do not support current price.`;
    }

    updateLoaderStep(5);

    const peAnalysis = pe ? getPEAnalysis(pe) : null;
    const epsAnalysis = eps ? getEPSAnalysis(eps, pe) : null;
    const divAnalysis = divY > 0 ? getDivYAnalysis(divY) : null;
    const roeAnalysis = roe ? getROEAnalysis(roe) : null;
    const debtAnalysis = debtEq !== null ? getDebtEqAnalysis(debtEq) : null;
    const marginAnalysis = profitMargin !== null ? getProfitMarginAnalysis(profitMargin) : null;
    const growthAnalysis = revenueGrowth !== null ? getRevenueGrowthAnalysis(revenueGrowth) : null;
    const bvpsAnalysis = bvps ? getBVPSAnalysis(bvps, price) : null;

    // ===== RENDER =====
    const html = `
      <div class="stock-header">
        <div class="stock-name-block">
          <h2>PSX:${raw}</h2>
          <div class="company-name">${f.name}</div>
          <div class="data-note">⟳ Live via PSX · ${fmtDate(latest.timestamp)} · ${sector} Sector</div>
        </div>
        <div class="price-block">
          <div class="current-price">PKR ${f2(price)}</div>
          <div class="price-change ${chgAbs >= 0 ? 'up' : 'dn'}">
            ${sign(chgAbs)}${f2(chgAbs)} (${sign(chgPct)}${f2(chgPct)}%)
          </div>
          <div class="volume-tag">Vol: ${fmtVol(volume)}</div>
        </div>
      </div>

      <div class="range-section">
        <div class="range-label">52 Week Range</div>
        <div class="range-bar-wrap">
          <div class="range-val low">PKR ${f2(w52L)}</div>
          <div class="range-bar">
            <div class="range-fill" style="width:${Math.max(0, Math.min(100, pct52))}%"></div>
            <div class="range-marker" style="left:${Math.max(0, Math.min(100, pct52))}%"></div>
          </div>
          <div class="range-val high">PKR ${f2(w52H)}</div>
        </div>
        <div class="range-position">Current position: <strong>${f2(pct52)}%</strong> of 52-week range</div>
      </div>

      <!-- FAIR VALUE -->
      <div class="section fairvalue-section">
        <div class="section-title">Fair Value Estimates</div>
        <div class="fairvalue-grid">
          ${fairValue.methods.map(m => `
            <div class="fairvalue-card">
              <div class="fairvalue-name">${m.name}</div>
              <div class="fairvalue-price">PKR ${f2(m.value)}</div>
              <div class="fairvalue-desc">${m.desc}</div>
              <div class="fairvalue-vs-current ${m.value > price ? 'up' : 'dn'}">
                ${m.value > price ? '+' : ''}${f2(((m.value - price) / price) * 100)}% vs current
              </div>
            </div>
          `).join('')}
          <div class="fairvalue-card highlight">
            <div class="fairvalue-name">Consensus Fair Value</div>
            <div class="fairvalue-price big">PKR ${f2(fairValue.avgFair)}</div>
            <div class="fairvalue-desc">Average of ${fairValue.count} valuation methods</div>
            <div class="fairvalue-vs-current ${fairValue.upside > 0 ? 'up' : 'dn'}">
              ${fairValue.upside > 0 ? '+' : ''}${f2(fairValue.upside)}% implied upside
            </div>
          </div>
        </div>
      </div>

      <!-- HISTORICAL PRICES -->
      <div class="section history-section">
        <div class="section-title">Historical Performance</div>
        <div class="history-grid">
          ${history.map(h => `
            <div class="history-card">
              <div class="history-period">${h.label}</div>
              <div class="history-date">${fmtDateShort(h.date)}${h.daysDiff > 5 ? ' <span class="approx">(approx)</span>' : ''}</div>
              <div class="history-price">PKR ${f2(h.price)}</div>
              <div class="history-change ${h.change >= 0 ? 'up' : 'dn'}">
                ${sign(h.change)}${f2(h.change)}% since then
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ENHANCED FUNDAMENTALS -->
      <div class="section fundamentals-section">
        <div class="section-title">Fundamental Analysis</div>
        <div class="fundamentals-grid">
          ${pe ? `
          <div class="fundamental-card">
            <div class="fundamental-header">
              <div class="fundamental-label">P/E Ratio</div>
              <div class="fundamental-badge ${peAnalysis.color}">${peAnalysis.rating}</div>
            </div>
            <div class="fundamental-value">${f2(pe)}</div>
            <div class="fundamental-context">Market Avg: ${PSX_AVG_PE}</div>
            <div class="fundamental-bar">
              <div class="fundamental-track">
                <div class="fundamental-fill ${peAnalysis.color}" style="width:${Math.min(100, (pe / 15) * 100)}%"></div>
              </div>
            </div>
            <div class="fundamental-insight">
              <div class="insight-main">${peAnalysis.desc}</div>
              <div class="insight-suggestion">💡 ${peAnalysis.suggestion}</div>
            </div>
          </div>
          ` : ''}

          ${eps ? `
          <div class="fundamental-card">
            <div class="fundamental-header">
              <div class="fundamental-label">EPS</div>
              <div class="fundamental-badge ${epsAnalysis.color}">${epsAnalysis.rating}</div>
            </div>
            <div class="fundamental-value">PKR ${f2(eps)}</div>
            <div class="fundamental-context">Per Share Earnings</div>
            <div class="fundamental-bar">
              <div class="fundamental-track">
                <div class="fundamental-fill ${epsAnalysis.color}" style="width:${Math.min(100, (eps / 50) * 100)}%"></div>
              </div>
            </div>
            <div class="fundamental-insight">
              <div class="insight-main">${epsAnalysis.desc}</div>
              <div class="insight-suggestion">💡 ${epsAnalysis.suggestion}</div>
            </div>
          </div>
          ` : ''}

          ${divY > 0 ? `
          <div class="fundamental-card">
            <div class="fundamental-header">
              <div class="fundamental-label">Dividend Yield</div>
              <div class="fundamental-badge ${divAnalysis.color}">${divAnalysis.rating}</div>
            </div>
            <div class="fundamental-value">${f2(divY)}%</div>
            <div class="fundamental-context">Annual Return</div>
            <div class="fundamental-bar">
              <div class="fundamental-track">
                <div class="fundamental-fill ${divAnalysis.color}" style="width:${Math.min(100, (divY / 15) * 100)}%"></div>
              </div>
            </div>
            <div class="fundamental-insight">
              <div class="insight-main">${divAnalysis.desc}</div>
              <div class="insight-suggestion">💡 ${divAnalysis.suggestion}</div>
            </div>
          </div>
          ` : ''}

          ${roe ? `
          <div class="fundamental-card">
            <div class="fundamental-header">
              <div class="fundamental-label">ROE</div>
              <div class="fundamental-badge ${roeAnalysis.color}">${roeAnalysis.rating}</div>
            </div>
            <div class="fundamental-value">${f2(roe)}%</div>
            <div class="fundamental-context">Return on Equity</div>
            <div class="fundamental-bar">
              <div class="fundamental-track">
                <div class="fundamental-fill ${roeAnalysis.color}" style="width:${Math.min(100, (roe / 35) * 100)}%"></div>
              </div>
            </div>
            <div class="fundamental-insight">
              <div class="insight-main">${roeAnalysis.desc}</div>
              <div class="insight-suggestion">💡 ${roeAnalysis.suggestion}</div>
            </div>
          </div>
          ` : ''}

          ${bvps ? `
          <div class="fundamental-card">
            <div class="fundamental-header">
              <div class="fundamental-label">Book Value / Share</div>
              <div class="fundamental-badge ${bvpsAnalysis.color}">${bvpsAnalysis.rating}</div>
            </div>
            <div class="fundamental-value">PKR ${f2(bvps)}</div>
            <div class="fundamental-context">P/B: ${f2(price / bvps)}x</div>
            <div class="fundamental-bar">
              <div class="fundamental-track">
                <div class="fundamental-fill ${bvpsAnalysis.color}" style="width:${Math.min(100, ((price / bvps) / 3) * 100)}%"></div>
              </div>
            </div>
            <div class="fundamental-insight">
              <div class="insight-main">${bvpsAnalysis.desc}</div>
              <div class="insight-suggestion">💡 ${bvpsAnalysis.suggestion}</div>
            </div>
          </div>
          ` : ''}

          ${debtEq !== null ? `
          <div class="fundamental-card">
            <div class="fundamental-header">
              <div class="fundamental-label">Debt / Equity</div>
              <div class="fundamental-badge ${debtAnalysis.color}">${debtAnalysis.rating}</div>
            </div>
            <div class="fundamental-value">${f2(debtEq)}x</div>
            <div class="fundamental-context">Leverage Ratio</div>
            <div class="fundamental-bar">
              <div class="fundamental-track">
                <div class="fundamental-fill ${debtAnalysis.color}" style="width:${Math.min(100, (debtEq / 2) * 100)}%"></div>
              </div>
            </div>
            <div class="fundamental-insight">
              <div class="insight-main">${debtAnalysis.desc}</div>
              <div class="insight-suggestion">💡 ${debtAnalysis.suggestion}</div>
            </div>
          </div>
          ` : ''}

          ${profitMargin !== null ? `
          <div class="fundamental-card">
            <div class="fundamental-header">
              <div class="fundamental-label">Profit Margin</div>
              <div class="fundamental-badge ${marginAnalysis.color}">${marginAnalysis.rating}</div>
            </div>
            <div class="fundamental-value">${f2(profitMargin)}%</div>
            <div class="fundamental-context">Net Margin</div>
            <div class="fundamental-bar">
              <div class="fundamental-track">
                <div class="fundamental-fill ${marginAnalysis.color}" style="width:${Math.min(100, (profitMargin / 40) * 100)}%"></div>
              </div>
            </div>
            <div class="fundamental-insight">
              <div class="insight-main">${marginAnalysis.desc}</div>
              <div class="insight-suggestion">💡 ${marginAnalysis.suggestion}</div>
            </div>
          </div>
          ` : ''}

          ${revenueGrowth !== null ? `
          <div class="fundamental-card">
            <div class="fundamental-header">
              <div class="fundamental-label">Revenue Growth</div>
              <div class="fundamental-badge ${growthAnalysis.color}">${growthAnalysis.rating}</div>
            </div>
            <div class="fundamental-value">${f2(revenueGrowth)}%</div>
            <div class="fundamental-context">YoY Growth</div>
            <div class="fundamental-bar">
              <div class="fundamental-track">
                <div class="fundamental-fill ${growthAnalysis.color}" style="width:${Math.min(100, Math.max(0, ((revenueGrowth + 5) / 30) * 100))}%"></div>
              </div>
            </div>
            <div class="fundamental-insight">
              <div class="insight-main">${growthAnalysis.desc}</div>
              <div class="insight-suggestion">💡 ${growthAnalysis.suggestion}</div>
            </div>
          </div>
          ` : ''}
        </div>
      </div>

      <!-- PRICE PROJECTIONS -->
      <div class="section">
        <div class="section-title">Price Projections</div>
        <div class="projection-grid">
          <div class="proj-card bear">
            <div class="proj-label">Bear Case</div>
            <div class="proj-price">PKR ${f2(w52L * 0.95)}</div>
            <div class="proj-return dn">${f2(((w52L * 0.95 - price) / price) * 100)}%</div>
            <div class="proj-note">5% below 52-week low</div>
          </div>
          <div class="proj-card base">
            <div class="proj-label">Base Case</div>
            <div class="proj-price">PKR ${f2((w52H + w52L) / 2)}</div>
            <div class="proj-return ${((w52H + w52L) / 2 - price) >= 0 ? 'up' : 'dn'}">${f2((((w52H + w52L) / 2 - price) / price) * 100)}%</div>
            <div class="proj-note">Midpoint of 52-week range</div>
          </div>
          <div class="proj-card bull">
            <div class="proj-label">Bull Case</div>
            <div class="proj-price">PKR ${f2(w52H * 1.05)}</div>
            <div class="proj-return up">${f2(((w52H * 1.05 - price) / price) * 100)}%</div>
            <div class="proj-note">5% above 52-week high</div>
          </div>
        </div>
      </div>

      <!-- VERDICT -->
      <div class="verdict-card ${verdict.toLowerCase().replace(' ', '-')}">
        <div class="verdict-inner">
          <div class="verdict-stamp">${verdict}</div>
          <div class="verdict-details">
            <div class="verdict-confidence">Confidence Level: ${Math.round(confidence)}%</div>
            <div class="confidence-bar">
              <div class="confidence-fill" style="width:${confidence}%"></div>
            </div>
            <div class="verdict-reasoning">${verdictReason}</div>
            <div class="score-breakdown">
              <div class="score-item"><span>Fundamental Score</span><span class="${score >= 0 ? 'up' : 'dn'}">${score > 0 ? '+' : ''}${f2(score)}</span></div>
              <div class="score-item"><span>Technical Score</span><span class="${techScore >= 0 ? 'up' : 'dn'}">${techScore > 0 ? '+' : ''}${f2(techScore)}</span></div>
              <div class="score-item total"><span>Total Score</span><span class="${totalScore >= 0 ? 'up' : 'dn'}">${totalScore > 0 ? '+' : ''}${f2(totalScore)}</span></div>
            </div>
            <div class="checklist">
              ${checklist.map(c => `
                <div class="check-item">
                  <span class="check-icon ${c.status}">${c.status === 'pass' ? '✓' : '◐'}</span>
                  <span>${c.label}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- NEWS SECTION (at the bottom, separate from valuation) -->
      <div class="section news-section">
        <div class="section-title">Latest News & Global Events</div>
        <div class="news-intro">News is for informational purposes and does not directly affect the fundamental verdict above.</div>
        <div class="news-grid">
          ${news.map(item => `
            <div class="news-card">
              <div class="news-header">
                <span class="news-source">${item.source}</span>
                <span class="news-date">${new Date(item.date).toLocaleDateString('en-PK')}</span>
              </div>
              <div class="news-title">${item.title}</div>
              ${item.description && item.description !== item.title ? `<div class="news-desc">${item.description}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    hideLoading();
    const el = document.getElementById('results');
    el.innerHTML = html;
    el.style.display = 'block';

    setTimeout(() => {
      document.querySelectorAll('.range-fill, .range-marker, .confidence-fill, .fundamental-fill').forEach(el => {
        el.style.width = el.style.width;
      });
    }, 50);

  } catch (err) {
    showError(err.message);
  }
}

// ================= UI =================
function showLoading() {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('results').style.display = 'none';
  document.getElementById('error').style.display = 'none';
  document.querySelectorAll('.loader-step').forEach(s => s.classList.remove('active'));
}

function updateLoaderStep(step, customText) {
  const steps = document.querySelectorAll('.loader-step');
  steps.forEach((s, i) => {
    s.classList.toggle('active', i < step);
    if (i === step - 1 && customText) s.textContent = customText;
  });
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

function showError(msg) {
  hideLoading();
  document.getElementById('errorMsg').innerText = msg;
  document.getElementById('error').style.display = 'block';
}

document.getElementById('stockInput')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') analyzeStock();
});
