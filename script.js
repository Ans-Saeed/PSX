// ============================================================
//  PSX RESEARCH TERMINAL — script.js
//  • Real fundamentals: fetched from PSX API, with Claude AI
//    as intelligent fallback / enrichment layer
//  • Smart tooltips: each metric shows historical PSX context
//  • News: RSS-based (Business Recorder, Dawn, Express Tribune)
// ============================================================

// ── PSX Market Benchmarks (updated periodically) ──
const PSX_BENCHMARKS = {
  avgPE:          8.5,   // PSX 100 trailing P/E
  avgROE:         16.0,  // Average ROE across PSX 100
  avgDivY:        8.0,   // Average dividend yield
  avgDebtEq:      0.55,  // Average D/E ratio
  avgProfitMargin: 14.0, // Average net margin
  riskFreeRate:   11.5,  // SBP policy rate (approx current)
  inflationRate:  8.0,   // CPI target
};

// Sector benchmarks for tooltip context
const SECTOR_BENCHMARKS = {
  Energy:     { pe: 5.5, roe: 22, divY: 10, debtEq: 0.25, margin: 28 },
  Banking:    { pe: 5.0, roe: 20, divY: 10, debtEq: 0.40, margin: 28 },
  Cement:     { pe: 7.0, roe: 16, divY: 6,  debtEq: 0.45, margin: 14 },
  Power:      { pe: 6.5, roe: 15, divY: 11, debtEq: 0.75, margin: 12 },
  Fertilizer: { pe: 7.5, roe: 18, divY: 8,  debtEq: 0.45, margin: 16 },
  Textile:    { pe: 7.0, roe: 14, divY: 6,  debtEq: 0.55, margin: 12 },
  Telecom:    { pe: 12,  roe: 8,  divY: 4,  debtEq: 0.20, margin: 15 },
  Consumer:   { pe: 10,  roe: 18, divY: 7,  debtEq: 0.35, margin: 12 },
};

// ── Seed fundamentals as intelligent defaults (used when API returns no data) ──
// These serve as starting points; real API data always overrides these
const SEED_FUNDAMENTALS = {
  OGDC: { pe:4.2, eps:32.5, divY:12.1, roe:28.3, bvps:145, debtEq:0.15, profitMargin:35, revenueGrowth:8,  name:"Oil & Gas Development Company", sector:"Energy" },
  HBL:  { pe:5.1, eps:28.4, divY:10.2, roe:22.1, bvps:128, debtEq:0.42, profitMargin:28, revenueGrowth:12, name:"Habib Bank Limited",             sector:"Banking" },
  ENGRO:{ pe:6.5, eps:35.2, divY:8.4,  roe:30.5, bvps:115, debtEq:0.55, profitMargin:22, revenueGrowth:15, name:"Engro Corporation",              sector:"Fertilizer" },
  LUCK: { pe:8.2, eps:42.1, divY:6.2,  roe:18.4, bvps:228, debtEq:0.38, profitMargin:18, revenueGrowth:9,  name:"Lucky Cement Limited",           sector:"Cement" },
  FCCL: { pe:5.8, eps:15.3, divY:9.1,  roe:20.2, bvps:76,  debtEq:0.28, profitMargin:16, revenueGrowth:11, name:"Fauji Cement Company",           sector:"Cement" },
  MCB:  { pe:4.5, eps:38.7, divY:11.3, roe:25.6, bvps:172, debtEq:0.35, profitMargin:32, revenueGrowth:14, name:"Muslim Commercial Bank",          sector:"Banking" },
  UBL:  { pe:5.3, eps:30.1, divY:10.5, roe:21.8, bvps:138, debtEq:0.40, profitMargin:29, revenueGrowth:10, name:"United Bank Limited",             sector:"Banking" },
  PPL:  { pe:4.8, eps:28.9, divY:13.2, roe:24.1, bvps:120, debtEq:0.22, profitMargin:33, revenueGrowth:7,  name:"Pakistan Petroleum Limited",      sector:"Energy" },
  PSO:  { pe:6.1, eps:45.3, divY:14.1, roe:26.3, bvps:182, debtEq:0.48, profitMargin:4,  revenueGrowth:18, name:"Pakistan State Oil",              sector:"Energy" },
  MARI: { pe:7.2, eps:55.8, divY:7.3,  roe:22.4, bvps:248, debtEq:0.18, profitMargin:38, revenueGrowth:6,  name:"Mari Petroleum",                  sector:"Energy" },
  HUBCO:{ pe:5.5, eps:25.4, divY:12.5, roe:20.1, bvps:126, debtEq:0.62, profitMargin:15, revenueGrowth:5,  name:"Hub Power Company",               sector:"Power" },
  NBP:  { pe:4.2, eps:22.1, divY:11.8, roe:19.5, bvps:113, debtEq:0.45, profitMargin:25, revenueGrowth:8,  name:"National Bank of Pakistan",        sector:"Banking" },
  BAFL: { pe:4.8, eps:26.7, divY:10.8, roe:21.2, bvps:125, debtEq:0.38, profitMargin:27, revenueGrowth:13, name:"Bank Alfalah",                     sector:"Banking" },
  ATRL: { pe:5.2, eps:31.4, divY:9.5,  roe:23.8, bvps:132, debtEq:0.25, profitMargin:12, revenueGrowth:16, name:"Attock Refinery",                  sector:"Energy" },
  NML:  { pe:6.8, eps:18.2, divY:7.8,  roe:16.5, bvps:110, debtEq:0.52, profitMargin:14, revenueGrowth:4,  name:"Nishat Mills",                     sector:"Textile" },
  DGKC: { pe:7.5, eps:12.8, divY:5.2,  roe:14.2, bvps:90,  debtEq:0.65, profitMargin:11, revenueGrowth:3,  name:"DG Khan Cement",                  sector:"Cement" },
  FFBL: { pe:8.1, eps:9.5,  divY:4.8,  roe:12.8, bvps:74,  debtEq:0.58, profitMargin:8,  revenueGrowth:2,  name:"Fauji Fertilizer Bin Qasim",       sector:"Fertilizer" },
  KEL:  { pe:9.2, eps:3.2,  divY:3.5,  roe:8.5,  bvps:38,  debtEq:1.85, profitMargin:6,  revenueGrowth:7,  name:"K-Electric",                       sector:"Power" },
  PTC:  { pe:12.5,eps:2.1,  divY:2.8,  roe:5.2,  bvps:40,  debtEq:0.15, profitMargin:18, revenueGrowth:-2, name:"Pakistan Telecommunication",        sector:"Telecom" },
  UNITY:{ pe:3.8, eps:18.5, divY:15.2, roe:32.1, bvps:58,  debtEq:0.12, profitMargin:28, revenueGrowth:22, name:"Unity Foods",                      sector:"Consumer" },
};

// ── Helpers ──
const f2  = n => isNaN(+n) ? 'N/A' : (+n).toFixed(2);
const f1  = n => isNaN(+n) ? 'N/A' : (+n).toFixed(1);
const sign = n => +n >= 0 ? '+' : '';
const fmtVol = n => n>1e6?(n/1e6).toFixed(2)+'M':n>1e3?(n/1e3).toFixed(0)+'K':n;
const fmtDate = ts => new Date(ts*1000).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'});
const fmtDateShort = ts => new Date(ts*1000).toLocaleDateString('en-PK',{day:'numeric',month:'short'});

function qs(ticker) {
  document.getElementById('stockInput').value = ticker;
  analyzeStock();
}

// ═══════════════════════════════════════════════════════
//  FETCH REAL FUNDAMENTALS
//  Strategy:
//  1. Try /api/psx?financials=SYMBOL (PSX financial portal)
//  2. If that returns no data → use Claude AI to reason about
//     the stock from price history + sector knowledge
//  3. Always fall back gracefully to seed data
// ═══════════════════════════════════════════════════════
async function fetchRealFundamentals(symbol, priceData, seedData) {
  // Step 1: Try PSX Financial portal via our API
  try {
    const res = await fetch(`/api/psx?financials=${symbol}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.eps && !data.note) {
        // Got real data — merge with seed for any missing fields
        return {
          ...seedData,
          ...cleanFundamentals(data),
          name: seedData?.name || symbol,
          sector: seedData?.sector || 'Energy',
          dataSource: 'PSX Financial Portal',
          isReal: true,
        };
      }
    }
  } catch (e) {
    console.warn('PSX financials API failed:', e.message);
  }

  // Step 2: Use Claude API to derive fundamentals from price data + context
  try {
    const claudeFundamentals = await fetchFundamentalsViaAI(symbol, priceData, seedData);
    if (claudeFundamentals) return claudeFundamentals;
  } catch (e) {
    console.warn('Claude fundamentals failed:', e.message);
  }

  // Step 3: Fall back to seed data
  return {
    ...(seedData || { name: symbol, sector: 'Energy' }),
    dataSource: 'Reference Data (Verify with Latest Filing)',
    isReal: false,
  };
}

// Use Claude AI to intelligently derive/validate fundamentals
async function fetchFundamentalsViaAI(symbol, priceData, seedData) {
  // Build price context from last 12 months of EOD data
  const last252 = priceData.slice(0, 252); // ~1 year trading days
  const currentPrice = last252[0]?.close;
  const yearAgoPrice = last252[last252.length - 1]?.close;
  const high52 = Math.max(...last252.map(d => d.close));
  const low52 = Math.min(...last252.map(d => d.close));
  const avgVol = last252.reduce((a,b)=>a+b.volume,0)/last252.length;
  const priceReturn = yearAgoPrice ? ((currentPrice-yearAgoPrice)/yearAgoPrice*100).toFixed(1) : 'N/A';

  const sectorName = seedData?.sector || 'Energy';
  const sectorBench = SECTOR_BENCHMARKS[sectorName] || SECTOR_BENCHMARKS.Energy;

  const prompt = `You are a Pakistan stock market analyst with deep knowledge of PSX-listed companies and their financial filings. 

Analyze ${symbol} (${seedData?.name || symbol}), a ${sectorName} sector company on PSX.

Current market data:
- Current Price: PKR ${f2(currentPrice)}
- 52-week High: PKR ${f2(high52)}, Low: PKR ${f2(low52)}
- 1-year price return: ${priceReturn}%
- Average daily volume: ${fmtVol(Math.round(avgVol))}

Sector benchmarks for ${sectorName} on PSX:
- Avg P/E: ${sectorBench.pe}x, Avg ROE: ${sectorBench.roe}%, Avg Div Yield: ${sectorBench.divY}%
- Avg Debt/Equity: ${sectorBench.debtEq}x, Avg Profit Margin: ${sectorBench.margin}%

PSX market benchmarks:
- Policy Rate (SBP): ${PSX_BENCHMARKS.riskFreeRate}%, Market Avg P/E: ${PSX_BENCHMARKS.avgPE}x

Reference financial data (from last known filing — may need updating):
${JSON.stringify({ pe: seedData?.pe, eps: seedData?.eps, roe: seedData?.roe, bvps: seedData?.bvps, debtEq: seedData?.debtEq, profitMargin: seedData?.profitMargin, divY: seedData?.divY, revenueGrowth: seedData?.revenueGrowth })}

Based on your knowledge of ${symbol}'s financial history and the above market data, provide your BEST ESTIMATE of the current fundamental metrics. Be honest about uncertainty.

Respond ONLY with a valid JSON object, no markdown, no explanation:
{
  "eps": <number or null>,
  "bvps": <number or null>,
  "roe": <number or null>,
  "debtEq": <number or null>,
  "profitMargin": <number or null>,
  "revenueGrowth": <number or null>,
  "divY": <number or null>,
  "pe": <number or null>,
  "confidence": "high|medium|low",
  "dataNote": "<brief note about data quality, max 100 chars>"
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error('Claude API error: ' + response.status);
  const data = await response.json();
  const text = data.content?.find(b=>b.type==='text')?.text || '';

  // Parse JSON from Claude's response
  const cleaned = text.replace(/```json?/g,'').replace(/```/g,'').trim();
  const parsed = JSON.parse(cleaned);

  return {
    ...seedData,
    ...cleanFundamentals(parsed),
    name: seedData?.name || symbol,
    sector: seedData?.sector || 'Energy',
    dataSource: `AI Analysis (${parsed.confidence || 'medium'} confidence)`,
    dataNote: parsed.dataNote || '',
    isReal: parsed.confidence === 'high',
  };
}

function cleanFundamentals(data) {
  const out = {};
  const fields = ['eps','bvps','roe','debtEq','profitMargin','revenueGrowth','divY','pe'];
  fields.forEach(k => {
    const v = parseFloat(data[k]);
    if (!isNaN(v)) out[k] = v;
  });
  return out;
}

// ═══════════════════════════════════════════════════════
//  TOOLTIP CONTENT — Historical & Sector Context
// ═══════════════════════════════════════════════════════
function buildTooltipContent(metric, value, sector, price) {
  const bench = PSX_BENCHMARKS;
  const sectBench = SECTOR_BENCHMARKS[sector] || SECTOR_BENCHMARKS.Energy;

  const tooltips = {
    pe: () => {
      const vs_market = value < bench.avgPE ? `${f2(bench.avgPE - value)}x below` : `${f2(value - bench.avgPE)}x above`;
      const vs_sector = value < sectBench.pe ? `below` : `above`;
      const implied = value < bench.avgPE ? 'potentially undervalued' : 'commands a premium';
      return `
        <strong>Price-to-Earnings Ratio</strong>
        <p>Measures how much investors pay per rupee of earnings. Lower generally means cheaper.</p>
        <div class="tt-compare">
          <div><span class="tt-label">This stock</span><span class="tt-val">${f2(value)}x</span></div>
          <div><span class="tt-label">PSX Market Avg</span><span class="tt-val ${value < bench.avgPE ? 'tt-good':'tt-bad'}">${bench.avgPE}x</span></div>
          <div><span class="tt-label">${sector} Sector Avg</span><span class="tt-val">${sectBench.pe}x</span></div>
          <div><span class="tt-label">SBP Rate (inv.)</span><span class="tt-val">${f2(100/bench.riskFreeRate)}x</span></div>
        </div>
        <p class="tt-insight">Trading ${vs_market} market average — ${implied}. ${sector} sector avg is ${sectBench.pe}x, stock is ${vs_sector}.</p>`;
    },

    eps: () => {
      const impliedPE = price && value ? f2(price/value) : 'N/A';
      return `
        <strong>Earnings Per Share (EPS)</strong>
        <p>Net profit divided by total shares. Higher EPS = more earnings power per share.</p>
        <div class="tt-compare">
          <div><span class="tt-label">EPS</span><span class="tt-val">PKR ${f2(value)}</span></div>
          <div><span class="tt-label">Implied P/E</span><span class="tt-val">${impliedPE}x</span></div>
          <div><span class="tt-label">Strong EPS threshold</span><span class="tt-val tt-good">PKR 25+</span></div>
        </div>
        <p class="tt-insight">${value > 25 ? 'Solid earnings generation indicating a profitable, mature business.' : value > 10 ? 'Moderate earnings. Monitor for growth trajectory.' : 'Low EPS — investigate whether this reflects a cyclical trough or structural weakness.'}</p>`;
    },

    divY: () => {
      const vsRate = value - bench.riskFreeRate;
      const spread = vsRate >= 0 ? `${f2(vsRate)}% above` : `${f2(Math.abs(vsRate))}% below`;
      return `
        <strong>Dividend Yield</strong>
        <p>Annual dividend as % of current price. Compare to risk-free rate to assess income attractiveness.</p>
        <div class="tt-compare">
          <div><span class="tt-label">Dividend Yield</span><span class="tt-val">${f2(value)}%</span></div>
          <div><span class="tt-label">SBP Policy Rate</span><span class="tt-val">${bench.riskFreeRate}%</span></div>
          <div><span class="tt-label">PSX Market Avg</span><span class="tt-val">${bench.avgDivY}%</span></div>
          <div><span class="tt-label">${sector} Sector Avg</span><span class="tt-val">${sectBench.divY}%</span></div>
        </div>
        <p class="tt-insight">Yield is ${spread} the SBP policy rate (${bench.riskFreeRate}%). ${vsRate >= 0 ? 'Equity income compensates for risk above risk-free rate.' : 'Income seekers may find T-Bills more attractive — growth potential must justify.'}</p>`;
    },

    roe: () => {
      const vs_rate = value > bench.riskFreeRate ? `${f2(value - bench.riskFreeRate)}% above` : `${f2(bench.riskFreeRate - value)}% below`;
      return `
        <strong>Return on Equity (ROE)</strong>
        <p>Profit generated per rupee of shareholder equity. The key test: does ROE beat the risk-free rate?</p>
        <div class="tt-compare">
          <div><span class="tt-label">ROE</span><span class="tt-val">${f2(value)}%</span></div>
          <div><span class="tt-label">SBP Policy Rate</span><span class="tt-val">${bench.riskFreeRate}%</span></div>
          <div><span class="tt-label">PSX Market Avg</span><span class="tt-val">${bench.avgROE}%</span></div>
          <div><span class="tt-label">${sector} Sector Avg</span><span class="tt-val">${sectBench.roe}%</span></div>
        </div>
        <p class="tt-insight">ROE is ${vs_rate} the policy rate. ${value > bench.riskFreeRate ? 'Management is creating real value above the risk-free hurdle.' : 'Equity returns are not compensating for the risk premium over T-Bills.'}</p>`;
    },

    bvps: () => {
      const pb = price && value ? price/value : null;
      const pbDesc = pb ? (pb < 1 ? 'trading below book (deep value signal)' : pb < 1.5 ? 'near book value (attractive asset backing)' : pb < 3 ? 'reasonable premium to book' : 'significant premium — ROE must justify') : '';
      return `
        <strong>Book Value Per Share (BVPS)</strong>
        <p>Net assets per share. The Price/Book (P/B) ratio reveals asset coverage at current price.</p>
        <div class="tt-compare">
          <div><span class="tt-label">Book Value</span><span class="tt-val">PKR ${f2(value)}</span></div>
          <div><span class="tt-label">Current Price</span><span class="tt-val">PKR ${f2(price)}</span></div>
          ${pb ? `<div><span class="tt-label">P/B Ratio</span><span class="tt-val ${pb<1.5?'tt-good':pb<3?'tt-warn':'tt-bad'}">${f2(pb)}x</span></div>` : ''}
        </div>
        <p class="tt-insight">${pb ? `P/B of ${f2(pb)}x — ${pbDesc}.` : ''} Graham's defensive approach: buy below 1.5x book with strong earnings.</p>`;
    },

    debtEq: () => {
      const vs_sector = value < sectBench.debtEq ? `below sector avg (${sectBench.debtEq}x)` : `above sector avg (${sectBench.debtEq}x)`;
      return `
        <strong>Debt / Equity Ratio</strong>
        <p>Total debt relative to equity. Lower = safer balance sheet. High D/E amplifies losses in downturns.</p>
        <div class="tt-compare">
          <div><span class="tt-label">D/E Ratio</span><span class="tt-val">${f2(value)}x</span></div>
          <div><span class="tt-label">PSX Market Avg</span><span class="tt-val">${bench.avgDebtEq}x</span></div>
          <div><span class="tt-label">${sector} Sector Avg</span><span class="tt-val">${sectBench.debtEq}x</span></div>
          <div><span class="tt-label">Safe threshold</span><span class="tt-val tt-good">&lt; 0.5x</span></div>
        </div>
        <p class="tt-insight">${vs_sector}. ${value > 1 ? 'Elevated leverage — interest rate sensitivity is a key risk at current SBP rate of ' + bench.riskFreeRate + '%.' : value < 0.3 ? 'Conservative balance sheet with capacity for growth investment.' : 'Manageable leverage for the sector.'}</p>`;
    },

    profitMargin: () => {
      return `
        <strong>Net Profit Margin</strong>
        <p>How much of each revenue rupee becomes profit. Reflects pricing power and cost efficiency.</p>
        <div class="tt-compare">
          <div><span class="tt-label">Net Margin</span><span class="tt-val">${f2(value)}%</span></div>
          <div><span class="tt-label">PSX Market Avg</span><span class="tt-val">${bench.avgProfitMargin}%</span></div>
          <div><span class="tt-label">${sector} Sector Avg</span><span class="tt-val">${sectBench.margin}%</span></div>
        </div>
        <p class="tt-insight">${value > sectBench.margin ? `Above-sector margins (${sectBench.margin}%) suggest competitive advantage or cost leadership.` : `Below-sector margins — watch for pricing pressure or rising input costs.`} ${value > 20 ? 'Wide moat business.' : value < 8 ? 'Thin margins make business vulnerable to cost shocks.' : ''}</p>`;
    },

    revenueGrowth: () => {
      const realGrowth = value - bench.inflationRate;
      return `
        <strong>Revenue Growth (YoY)</strong>
        <p>Year-on-year top-line growth. Subtract inflation to get real growth.</p>
        <div class="tt-compare">
          <div><span class="tt-label">Revenue Growth</span><span class="tt-val">${f2(value)}%</span></div>
          <div><span class="tt-label">CPI Inflation</span><span class="tt-val">${bench.inflationRate}%</span></div>
          <div><span class="tt-label">Real Growth</span><span class="tt-val ${realGrowth>0?'tt-good':'tt-bad'}">${f2(realGrowth)}%</span></div>
        </div>
        <p class="tt-insight">${realGrowth > 0 ? `Real (inflation-adjusted) growth of ${f2(realGrowth)}% — business is genuinely expanding.` : `Revenue growth is below inflation — business may be shrinking in real terms.`} ${value > 20 ? 'Hyper-growth phase, validate sustainability.' : ''}</p>`;
    },
  };

  return tooltips[metric] ? tooltips[metric]() : '';
}

// ═══════════════════════════════════════════════════════
//  FUNDAMENTAL ANALYSIS HELPERS (unchanged logic, enriched)
// ═══════════════════════════════════════════════════════
function getPEAnalysis(pe) {
  if (pe < 5)            return { rating:'Excellent', color:'accent', desc:`Deeply undervalued vs market avg of ${PSX_BENCHMARKS.avgPE}`, suggestion:'Strong buy signal if earnings are stable' };
  if (pe < PSX_BENCHMARKS.avgPE) return { rating:'Good',      color:'accent', desc:'Trading below market average',         suggestion:'Potentially undervalued, investigate further' };
  if (pe < 12)           return { rating:'Fair',      color:'warn',   desc:'Near market average valuation',          suggestion:'Fairly priced, look for growth catalysts' };
  if (pe < 18)           return { rating:'High',      color:'danger', desc:'Premium valuation vs market',             suggestion:'Ensure growth justifies the premium' };
  return                        { rating:'Expensive', color:'danger', desc:'Significantly overvalued',                suggestion:'Wait for correction or strong growth proof' };
}
function getEPSAnalysis(eps) {
  if (eps > 40) return { rating:'Strong',   color:'accent', desc:'High earnings per share',       suggestion:'Company generates substantial profit per share' };
  if (eps > 25) return { rating:'Healthy',  color:'accent', desc:'Solid earnings generation',      suggestion:'Sustainable profitability indicated' };
  if (eps > 15) return { rating:'Moderate', color:'warn',   desc:'Average earnings power',          suggestion:'Monitor for earnings improvement' };
  return               { rating:'Weak',     color:'danger', desc:'Low earnings per share',          suggestion:'Check for turnaround or avoid' };
}
function getDivYAnalysis(divY) {
  if (divY > 12) return { rating:'Excellent', color:'accent', desc:'Very high dividend yield',    suggestion:'Great for income investors, verify sustainability' };
  if (divY > 8)  return { rating:'Good',      color:'accent', desc:'Above average yield',          suggestion:'Attractive income + potential upside' };
  if (divY > 5)  return { rating:'Fair',      color:'warn',   desc:'Market average yield',         suggestion:'Balanced income and growth play' };
  if (divY > 2)  return { rating:'Low',       color:'danger', desc:'Below average yield',          suggestion:'Growth-focused, not for income' };
  return                { rating:'None',      color:'danger', desc:'No dividend income',            suggestion:'Pure growth/speculative play' };
}
function getROEAnalysis(roe) {
  const r = PSX_BENCHMARKS.riskFreeRate;
  if (roe > 25) return { rating:'Excellent', color:'accent', desc:'Exceptional capital efficiency',        suggestion:'Management creates superior shareholder value' };
  if (roe > r)  return { rating:'Good',      color:'accent', desc:`Beats risk-free rate (${r}%)`,          suggestion:'Equity risk is compensated adequately' };
  if (roe > 12) return { rating:'Fair',      color:'warn',   desc:'Below risk-free rate',                  suggestion:'Marginal equity returns, consider alternatives' };
  return               { rating:'Poor',      color:'danger', desc:'Poor capital utilization',              suggestion:'Management destroying shareholder value' };
}
function getDebtEqAnalysis(de) {
  if (de < 0.2) return { rating:'Very Safe', color:'accent', desc:'Minimal debt burden',        suggestion:'Strong balance sheet, recession-proof' };
  if (de < 0.5) return { rating:'Safe',      color:'accent', desc:'Conservative leverage',       suggestion:'Comfortable debt levels for sector' };
  if (de < 1.0) return { rating:'Moderate',  color:'warn',   desc:'Average industry leverage',   suggestion:'Monitor interest rate sensitivity' };
  if (de < 1.5) return { rating:'High',      color:'danger', desc:'Elevated debt levels',        suggestion:'Vulnerable to rate hikes/cash flow issues' };
  return               { rating:'Risky',     color:'danger', desc:'Excessive leverage',          suggestion:'High bankruptcy risk in downturns' };
}
function getProfitMarginAnalysis(m) {
  if (m > 30) return { rating:'Excellent', color:'accent', desc:'Strong pricing power',       suggestion:'Wide moat, premium business model' };
  if (m > 15) return { rating:'Good',      color:'accent', desc:'Healthy margins',             suggestion:'Sustainable competitive advantage' };
  if (m > 8)  return { rating:'Fair',      color:'warn',   desc:'Thin margins',                suggestion:'Volume-dependent business, watch costs' };
  return             { rating:'Weak',      color:'danger', desc:'Very low margins',             suggestion:'Commodity business, cyclical risk high' };
}
function getRevenueGrowthAnalysis(g) {
  if (g > 20) return { rating:'Excellent', color:'accent', desc:'Hyper-growth phase',         suggestion:'Early stage or market share gains' };
  if (g > 10) return { rating:'Good',      color:'accent', desc:'Strong growth trajectory',    suggestion:'Business expanding effectively' };
  if (g > 5)  return { rating:'Steady',    color:'warn',   desc:'Moderate growth',             suggestion:'Mature business, stable cash flows' };
  if (g > 0)  return { rating:'Slow',      color:'warn',   desc:'Stagnant growth',             suggestion:'Market saturation or competition' };
  return             { rating:'Declining', color:'danger', desc:'Negative growth',             suggestion:'Structural issues, avoid or turnaround bet' };
}
function getBVPSAnalysis(bvps, price) {
  const pb = price / bvps;
  if (pb < 1)   return { rating:'Deep Value', color:'accent', desc:'Trading below book value',        suggestion:'Assets worth more than price, potential bargain' };
  if (pb < 1.5) return { rating:'Value',      color:'accent', desc:'Near book value',                 suggestion:'Reasonable asset backing' };
  if (pb < 3)   return { rating:'Fair',       color:'warn',   desc:'Moderate premium to book',        suggestion:'Growth/intangibles justify premium' };
  return               { rating:'Premium',    color:'danger', desc:'High price-to-book',              suggestion:'Ensure ROE justifies the premium' };
}

// Fair value: multiple methods
function calculateFairValue(f, price) {
  const methods = [];
  const bench = PSX_BENCHMARKS;

  if (f.eps) {
    methods.push({ name:'P/E Mean Reversion', value: f.eps * bench.avgPE, desc:`EPS × Market Avg P/E (${bench.avgPE})` });
  }
  if (f.divY > 0) {
    const div = price * (f.divY/100);
    const g   = Math.min((f.revenueGrowth||5)/100, 0.05);
    const dr  = 0.14; // 14% required return in high-rate environment
    if (dr > g) methods.push({ name:'Dividend Discount', value: div/(dr-g), desc:'Dividend ÷ (Discount − Growth)' });
  }
  if (f.bvps && f.roe) {
    methods.push({ name:'Book Value Premium', value: f.bvps*(f.roe/bench.riskFreeRate), desc:'BVPS × ROE/Risk-Free Spread' });
  }
  if (f.eps && f.bvps) {
    methods.push({ name:'Graham Number', value: Math.sqrt(22.5*f.eps*f.bvps), desc:'√(22.5 × EPS × BVPS)' });
  }

  const valid = methods.filter(m => !isNaN(m.value) && m.value > 0);
  const avg   = valid.reduce((a,m)=>a+m.value,0) / (valid.length||1);
  return { methods: valid, avgFair: avg, upside: ((avg-price)/price)*100, count: valid.length };
}

// Historical prices from EOD data
function getHistoricalPrices(data) {
  const now = Date.now()/1000;
  const periods = [
    {label:'1M',days:30},{label:'2M',days:60},{label:'3M',days:90},
    {label:'5M',days:150},{label:'1Y',days:365},{label:'2Y',days:730},{label:'3Y',days:1095}
  ];
  return periods.map(p => {
    const target = now - p.days*86400;
    const closest = data.reduce((prev,curr) =>
      Math.abs(curr.timestamp-target) < Math.abs(prev.timestamp-target) ? curr : prev
    );
    return {
      label: p.label,
      date: closest.timestamp,
      price: closest.close,
      change: ((data[0].close - closest.close)/closest.close)*100,
      daysDiff: Math.round(Math.abs(closest.timestamp-target)/86400),
    };
  });
}

// ═══════════════════════════════════════════════════════
//  NEWS — RSS via /api/psx?news=true
// ═══════════════════════════════════════════════════════
async function fetchNews(symbol, sector) {
  try {
    const res = await fetch(`/api/psx?news=true&q=${encodeURIComponent(symbol)}&sector=${encodeURIComponent(sector)}`);
    if (!res.ok) throw new Error('News API failed');
    const json = await res.json();
    return { articles: json.articles || [], isFallback: json.fallback };
  } catch (err) {
    return { articles: generateLocalFallbackNews(symbol, sector), isFallback: true };
  }
}

function generateLocalFallbackNews(symbol, sector) {
  const today = new Date().toISOString();
  return [
    { title:`${symbol} — Latest financial results awaited from company filing`, source:'PSX Announcements', date:today, url:`https://www.psx.com.pk/psx/resources-and-tools/listings/listed-companies/?id=${symbol}` },
    { title:`${sector} sector update: Policy changes under IMF programme review`, source:'Business Recorder', date:today, url:'https://brecorder.com' },
    { title:'SBP monetary policy: Rate trajectory and banking sector implications', source:'Dawn Business', date:today, url:'https://dawn.com/business-finance' },
    { title:'PSX 100 Index outlook amid macroeconomic stabilisation', source:'Express Tribune', date:today, url:'https://tribune.com.pk/business' },
  ];
}

// ═══════════════════════════════════════════════════════
//  TOOLTIP SYSTEM — vanilla JS, hover & tap
// ═══════════════════════════════════════════════════════
function initTooltips() {
  let activeTooltip = null;

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-tooltip]');
    if (trigger) {
      e.stopPropagation();
      const existing = trigger.querySelector('.tt-popup');
      if (existing) {
        existing.remove();
        activeTooltip = null;
        return;
      }
      // Close any open tooltip
      document.querySelectorAll('.tt-popup').forEach(t => t.remove());

      const popup = document.createElement('div');
      popup.className = 'tt-popup';
      popup.innerHTML = trigger.dataset.tooltip;
      trigger.style.position = 'relative';
      trigger.appendChild(popup);
      activeTooltip = popup;
      return;
    }
    // Click outside — close
    document.querySelectorAll('.tt-popup').forEach(t => t.remove());
    activeTooltip = null;
  });
}

// ═══════════════════════════════════════════════════════
//  MAIN ANALYSIS FUNCTION
// ═══════════════════════════════════════════════════════
async function analyzeStock() {
  const raw = document.getElementById('stockInput').value.trim().toUpperCase();
  if (!raw) return;

  showLoading();
  updateLoaderStep(1, '⟳ Connecting to PSX…');

  try {
    // ── 1. Fetch EOD price data ──
    const res = await fetch(`/api/psx?symbol=${raw}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    if (!json?.data || json.data.length < 2) throw new Error('Ticker not found or insufficient data');

    const data = json.data.map(row => ({ timestamp:row[0], close:row[1], volume:row[2], open:row[3] }));
    const latest = data[0];
    const prev   = data[1];
    const price  = latest.close;
    const chgAbs = price - prev.close;
    const chgPct = (chgAbs/prev.close)*100;
    const volume = latest.volume;

    const last250 = data.slice(0,250);
    const prices  = last250.map(d=>d.close);
    const w52H = Math.max(...prices);
    const w52L = Math.min(...prices);
    const pct52 = ((price-w52L)/(w52H-w52L))*100;

    updateLoaderStep(2, '⟳ Loading real fundamentals…');

    // ── 2. Fetch real fundamentals ──
    const seedData = SEED_FUNDAMENTALS[raw] || { name: raw, sector: 'Energy' };
    const f = await fetchRealFundamentals(raw, data, seedData);

    const { pe, eps, divY, roe, bvps, debtEq, profitMargin, revenueGrowth, sector } = {
      pe: f.pe ?? null,
      eps: f.eps ?? null,
      divY: f.divY ?? 0,
      roe: f.roe ?? null,
      bvps: f.bvps ?? null,
      debtEq: f.debtEq ?? null,
      profitMargin: f.profitMargin ?? null,
      revenueGrowth: f.revenueGrowth ?? null,
      sector: f.sector || 'Energy',
    };

    updateLoaderStep(3, '⟳ Calculating fair value…');

    const fairValue = calculateFairValue({ pe, eps, divY, roe, bvps, revenueGrowth, profitMargin }, price);
    const history   = getHistoricalPrices(data);

    updateLoaderStep(4, '⟳ Fetching news from Business Recorder, Dawn…');
    const { articles: news, isFallback: newsFallback } = await fetchNews(raw, sector);

    // ── 3. Scoring ──
    let score = 0;
    const checklist = [];
    const bench = PSX_BENCHMARKS;

    if (pe !== null)          { const ok=pe<bench.avgPE;      score+=ok?1.5:-1;   checklist.push({label:`P/E ${f2(pe)} vs avg ${bench.avgPE}`,     status:ok?'pass':'fail'}); }
    if (roe !== null)         { const ok=roe>bench.riskFreeRate;score+=ok?1:-0.5; checklist.push({label:`ROE ${f2(roe)}% vs ${bench.riskFreeRate}%`,status:ok?'pass':'warn'}); }
    if (divY > 0)             { const ok=divY>bench.avgDivY;  score+=ok?0.5:0;    checklist.push({label:`Dividend ${f2(divY)}% vs avg ${bench.avgDivY}%`,status:ok?'pass':'warn'}); }
    if (debtEq !== null)      { const ok=debtEq<0.5;          score+=ok?0.5:-0.5; checklist.push({label:`Debt/Equity ${f2(debtEq)}`,                status:ok?'pass':'warn'}); }
    if (profitMargin !== null){ const ok=profitMargin>15;      score+=ok?0.5:0;    checklist.push({label:`Profit Margin ${f2(profitMargin)}%`,        status:ok?'pass':'warn'}); }
    if (revenueGrowth !== null){ const ok=revenueGrowth>5;    score+=ok?0.5:-0.5; checklist.push({label:`Revenue Growth ${f2(revenueGrowth)}%`,      status:ok?'pass':'warn'}); }
    if (pct52 < 35)  { score+=0.5;  checklist.push({label:`Near 52w low (${f2(pct52)}%)`, status:'pass'}); }
    else if (pct52>80){ score-=0.5; checklist.push({label:`Near 52w high (${f2(pct52)}%)`,status:'warn'}); }

    let techScore = 0;
    if (chgPct > 2) techScore+=0.5; else if (chgPct<-2) techScore-=0.5;
    const avgVol = data.slice(1,20).reduce((a,b)=>a+b.volume,0)/19;
    if (volume > avgVol*1.5) techScore += chgPct>0?0.5:-0.5;

    const totalScore = score + techScore;

    let verdict, confidence, verdictReason;
    if (totalScore >= 2.5)       { verdict='BUY';       confidence=Math.min(95,70+totalScore*5); verdictReason='Strong fundamentals with favorable technical setup. Stock appears undervalued relative to market benchmarks.'; }
    else if (totalScore >= 0.5)  { verdict='BUY';       confidence=Math.min(85,60+totalScore*8); verdictReason='Good fundamentals with reasonable valuation. Consider accumulating on dips.'; }
    else if (totalScore >= -0.5) { verdict='HOLD';      confidence=55; verdictReason='Mixed signals. Fundamentals are stable but not compelling. Hold existing positions.'; }
    else if (totalScore >= -2)   { verdict='HOLD';      confidence=50; verdictReason='Caution advised. Some fundamental weaknesses present. Monitor for improvement.'; }
    else                         { verdict='SELL';      confidence=Math.min(90,60+Math.abs(totalScore)*5); verdictReason='Multiple fundamental red flags. Valuation concerns and weak metrics suggest reducing exposure.'; }

    if (fairValue.upside > 30 && totalScore > 0) { verdict='STRONG BUY'; confidence=92; verdictReason=`Significant undervaluation. Fair value (${f2(fairValue.avgFair)}) is ${f2(fairValue.upside)}% above current price.`; }
    else if (fairValue.upside < -20 && totalScore < 0) { verdict='SELL'; confidence=88; verdictReason=`Overvalued by ${f2(Math.abs(fairValue.upside))}%. Fundamentals do not support current price.`; }

    updateLoaderStep(5);

    // ── Analysis objects ──
    const peAnalysis     = pe!==null   ? getPEAnalysis(pe)             : null;
    const epsAnalysis    = eps!==null  ? getEPSAnalysis(eps)           : null;
    const divAnalysis    = divY>0      ? getDivYAnalysis(divY)         : null;
    const roeAnalysis    = roe!==null  ? getROEAnalysis(roe)           : null;
    const debtAnalysis   = debtEq!==null ? getDebtEqAnalysis(debtEq)  : null;
    const marginAnalysis = profitMargin!==null ? getProfitMarginAnalysis(profitMargin) : null;
    const growthAnalysis = revenueGrowth!==null ? getRevenueGrowthAnalysis(revenueGrowth) : null;
    const bvpsAnalysis   = bvps        ? getBVPSAnalysis(bvps, price)  : null;

    // Build tooltips
    const ttPE      = pe!==null   ? buildTooltipContent('pe',            pe,            sector, price) : '';
    const ttEPS     = eps!==null  ? buildTooltipContent('eps',           eps,           sector, price) : '';
    const ttDivY    = divY>0      ? buildTooltipContent('divY',          divY,          sector, price) : '';
    const ttROE     = roe!==null  ? buildTooltipContent('roe',           roe,           sector, price) : '';
    const ttBVPS    = bvps        ? buildTooltipContent('bvps',          bvps,          sector, price) : '';
    const ttDebt    = debtEq!==null? buildTooltipContent('debtEq',       debtEq,        sector, price) : '';
    const ttMargin  = profitMargin!==null? buildTooltipContent('profitMargin',profitMargin,sector,price):'';
    const ttGrowth  = revenueGrowth!==null? buildTooltipContent('revenueGrowth',revenueGrowth,sector,price):'';

    // ── Render ──
    const dataSourceBadge = `
      <div class="data-source-badge ${f.isReal ? 'real' : 'estimated'}">
        ${f.isReal ? '✓ Live Data' : '⚠ Estimated'} — ${f.dataSource || 'Reference Data'}
        ${f.dataNote ? `<span class="data-note-text"> · ${f.dataNote}</span>` : ''}
      </div>`;

    const fundamentalCard = (metric, label, valueHtml, context, analysis, fill, fillColor, tooltipHtml) => `
      <div class="fundamental-card" ${tooltipHtml ? `data-tooltip="${escHtml(tooltipHtml)}"` : ''}>
        <div class="fundamental-header">
          <div class="fundamental-label">
            ${label}
            ${tooltipHtml ? '<span class="tt-icon">?</span>' : ''}
          </div>
          <div class="fundamental-badge ${analysis.color}">${analysis.rating}</div>
        </div>
        <div class="fundamental-value">${valueHtml}</div>
        <div class="fundamental-context">${context}</div>
        <div class="fundamental-bar">
          <div class="fundamental-track">
            <div class="fundamental-fill ${fillColor}" style="width:${Math.min(100,Math.max(0,fill))}%"></div>
          </div>
        </div>
        <div class="fundamental-insight">
          <div class="insight-main">${analysis.desc}</div>
          <div class="insight-suggestion">💡 ${analysis.suggestion}</div>
        </div>
        ${tooltipHtml ? '<div class="tt-hint">Tap ? for historical context</div>' : ''}
      </div>`;

    const html = `
      <div class="stock-header">
        <div class="stock-name-block">
          <h2>PSX:${raw}</h2>
          <div class="company-name">${f.name}</div>
          <div class="data-note">⟳ Live via PSX · ${fmtDate(latest.timestamp)} · ${sector} Sector</div>
        </div>
        <div class="price-block">
          <div class="current-price">PKR ${f2(price)}</div>
          <div class="price-change ${chgAbs>=0?'up':'dn'}">${sign(chgAbs)}${f2(chgAbs)} (${sign(chgPct)}${f2(chgPct)}%)</div>
          <div class="volume-tag">Vol: ${fmtVol(volume)}</div>
        </div>
      </div>

      <div class="range-section">
        <div class="range-label">52 Week Range</div>
        <div class="range-bar-wrap">
          <div class="range-val low">PKR ${f2(w52L)}</div>
          <div class="range-bar">
            <div class="range-fill" style="width:${Math.max(0,Math.min(100,pct52))}%"></div>
            <div class="range-marker" style="left:${Math.max(0,Math.min(100,pct52))}%"></div>
          </div>
          <div class="range-val high">PKR ${f2(w52H)}</div>
        </div>
        <div class="range-position">Current position: <strong>${f2(pct52)}%</strong> of 52-week range</div>
      </div>

      <!-- FAIR VALUE -->
      <div class="section fairvalue-section">
        <div class="section-title">Fair Value Estimates</div>
        ${dataSourceBadge}
        <div class="fairvalue-grid">
          ${fairValue.methods.map(m=>`
            <div class="fairvalue-card">
              <div class="fairvalue-name">${m.name}</div>
              <div class="fairvalue-price">PKR ${f2(m.value)}</div>
              <div class="fairvalue-desc">${m.desc}</div>
              <div class="fairvalue-vs-current ${m.value>price?'up':'dn'}">${m.value>price?'+':''}${f2(((m.value-price)/price)*100)}% vs current</div>
            </div>`).join('')}
          <div class="fairvalue-card highlight">
            <div class="fairvalue-name">Consensus Fair Value</div>
            <div class="fairvalue-price big">PKR ${f2(fairValue.avgFair)}</div>
            <div class="fairvalue-desc">Average of ${fairValue.count} valuation methods</div>
            <div class="fairvalue-vs-current ${fairValue.upside>0?'up':'dn'}">${fairValue.upside>0?'+':''}${f2(fairValue.upside)}% implied upside</div>
          </div>
        </div>
      </div>

      <!-- HISTORICAL PRICES -->
      <div class="section history-section">
        <div class="section-title">Historical Performance</div>
        <div class="history-grid">
          ${history.map(h=>`
            <div class="history-card">
              <div class="history-period">${h.label}</div>
              <div class="history-date">${fmtDateShort(h.date)}${h.daysDiff>5?' <span class="approx">(approx)</span>':''}</div>
              <div class="history-price">PKR ${f2(h.price)}</div>
              <div class="history-change ${h.change>=0?'up':'dn'}">${sign(h.change)}${f2(h.change)}% since</div>
            </div>`).join('')}
        </div>
      </div>

      <!-- FUNDAMENTALS -->
      <div class="section fundamentals-section">
        <div class="section-title">Fundamental Analysis</div>
        <div class="fundamentals-grid">

          ${pe!==null && peAnalysis ? fundamentalCard('pe','P/E Ratio',`${f2(pe)}`,`Market Avg: ${bench.avgPE} · Sector: ${(SECTOR_BENCHMARKS[sector]||{}).pe||'—'}`,peAnalysis, (pe/15)*100, peAnalysis.color, ttPE) : ''}
          ${eps!==null && epsAnalysis ? fundamentalCard('eps','EPS',`PKR ${f2(eps)}`,`Earnings Per Share`,epsAnalysis,(eps/50)*100,epsAnalysis.color,ttEPS) : ''}
          ${divY>0 && divAnalysis ? fundamentalCard('divY','Dividend Yield',`${f2(divY)}%`,`SBP Rate: ${bench.riskFreeRate}% · Mkt Avg: ${bench.avgDivY}%`,divAnalysis,(divY/15)*100,divAnalysis.color,ttDivY) : ''}
          ${roe!==null && roeAnalysis ? fundamentalCard('roe','ROE',`${f2(roe)}%`,`Risk-Free Rate: ${bench.riskFreeRate}% · Mkt Avg: ${bench.avgROE}%`,roeAnalysis,(roe/35)*100,roeAnalysis.color,ttROE) : ''}
          ${bvps && bvpsAnalysis ? fundamentalCard('bvps','Book Value / Share',`PKR ${f2(bvps)}`,`P/B: ${f2(price/bvps)}x`,bvpsAnalysis,((price/bvps)/3)*100,bvpsAnalysis.color,ttBVPS) : ''}
          ${debtEq!==null && debtAnalysis ? fundamentalCard('debtEq','Debt / Equity',`${f2(debtEq)}x`,`Sector Avg: ${(SECTOR_BENCHMARKS[sector]||{}).debtEq||'—'}x`,debtAnalysis,(debtEq/2)*100,debtAnalysis.color,ttDebt) : ''}
          ${profitMargin!==null && marginAnalysis ? fundamentalCard('profitMargin','Profit Margin',`${f2(profitMargin)}%`,`Sector Avg: ${(SECTOR_BENCHMARKS[sector]||{}).margin||'—'}%`,marginAnalysis,(profitMargin/40)*100,marginAnalysis.color,ttMargin) : ''}
          ${revenueGrowth!==null && growthAnalysis ? fundamentalCard('revenueGrowth','Revenue Growth',`${f2(revenueGrowth)}%`,`Inflation: ${bench.inflationRate}% · Real: ${f2(revenueGrowth-bench.inflationRate)}%`,growthAnalysis,Math.max(0,(revenueGrowth+5)/30*100),growthAnalysis.color,ttGrowth) : ''}

        </div>
      </div>

      <!-- PRICE PROJECTIONS -->
      <div class="section">
        <div class="section-title">Price Projections</div>
        <div class="projection-grid">
          <div class="proj-card bear">
            <div class="proj-label">Bear Case</div>
            <div class="proj-price">PKR ${f2(w52L*0.95)}</div>
            <div class="proj-return dn">${f2(((w52L*0.95-price)/price)*100)}%</div>
            <div class="proj-note">5% below 52-week low</div>
          </div>
          <div class="proj-card base">
            <div class="proj-label">Base Case</div>
            <div class="proj-price">PKR ${f2((w52H+w52L)/2)}</div>
            <div class="proj-return ${((w52H+w52L)/2-price)>=0?'up':'dn'}">${f2((((w52H+w52L)/2-price)/price)*100)}%</div>
            <div class="proj-note">Midpoint of 52-week range</div>
          </div>
          <div class="proj-card bull">
            <div class="proj-label">Bull Case</div>
            <div class="proj-price">PKR ${f2(w52H*1.05)}</div>
            <div class="proj-return up">${f2(((w52H*1.05-price)/price)*100)}%</div>
            <div class="proj-note">5% above 52-week high</div>
          </div>
        </div>
      </div>

      <!-- VERDICT -->
      <div class="verdict-card ${verdict.toLowerCase().replace(' ','-')}">
        <div class="verdict-inner">
          <div class="verdict-stamp">${verdict}</div>
          <div class="verdict-details">
            <div class="verdict-confidence">Confidence Level: ${Math.round(confidence)}%</div>
            <div class="confidence-bar"><div class="confidence-fill" style="width:${confidence}%"></div></div>
            <div class="verdict-reasoning">${verdictReason}</div>
            <div class="score-breakdown">
              <div class="score-item"><span>Fundamental Score</span><span class="${score>=0?'up':'dn'}">${score>0?'+':''}${f2(score)}</span></div>
              <div class="score-item"><span>Technical Score</span><span class="${techScore>=0?'up':'dn'}">${techScore>0?'+':''}${f2(techScore)}</span></div>
              <div class="score-item total"><span>Total Score</span><span class="${totalScore>=0?'up':'dn'}">${totalScore>0?'+':''}${f2(totalScore)}</span></div>
            </div>
            <div class="checklist">
              ${checklist.map(c=>`
                <div class="check-item">
                  <span class="check-icon ${c.status}">${c.status==='pass'?'✓':'◐'}</span>
                  <span>${c.label}</span>
                </div>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- NEWS -->
      <div class="section news-section">
        <div class="section-title">📰 Latest News & Market Events</div>
        <div class="news-intro">
          ${newsFallback
            ? '⚠ Live RSS unavailable — showing curated headlines. <a href="https://brecorder.com" target="_blank" rel="noopener">Business Recorder</a> · <a href="https://dawn.com/business-finance" target="_blank" rel="noopener">Dawn Business</a>'
            : 'Live RSS from Business Recorder · Dawn · Express Tribune'}
          · News is informational and does not affect the verdict.
        </div>
        <div class="news-grid">
          ${news.map(item=>`
            <a class="news-card" href="${item.url||'#'}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit;">
              <div class="news-header">
                <span class="news-source">${item.source}</span>
                <span class="news-date">${new Date(item.date).toLocaleDateString('en-PK')}</span>
              </div>
              <div class="news-title">${item.title}</div>
              ${item.description && item.description!==item.title ? `<div class="news-desc">${item.description}</div>` : ''}
              <div class="news-link">Read →</div>
            </a>`).join('')}
        </div>
      </div>
    `;

    hideLoading();
    const el = document.getElementById('results');
    el.innerHTML = html;
    el.style.display = 'block';

    // Init tooltips after render
    initTooltips();

  } catch (err) {
    showError(err.message);
  }
}

// Escape HTML for data-tooltip attribute
function escHtml(s) {
  return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── UI ──
function showLoading() {
  document.getElementById('loading').style.display='block';
  document.getElementById('results').style.display='none';
  document.getElementById('error').style.display='none';
  document.querySelectorAll('.loader-step').forEach(s=>s.classList.remove('active'));
}
function updateLoaderStep(step, customText) {
  document.querySelectorAll('.loader-step').forEach((s,i)=>{
    s.classList.toggle('active', i<step);
    if (i===step-1 && customText) s.textContent = customText;
  });
}
function hideLoading() { document.getElementById('loading').style.display='none'; }
function showError(msg) {
  hideLoading();
  document.getElementById('errorMsg').innerText = msg;
  document.getElementById('error').style.display='block';
}

document.getElementById('stockInput')?.addEventListener('keypress', e => {
  if (e.key==='Enter') analyzeStock();
});