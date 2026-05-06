// ================= CONFIG =================
const FUNDAMENTALS = {
  OGDC: { pe: 4.2, eps: 32, divY: 12, roe: 28, name: "Oil & Gas Development Company" },
  HBL: { pe: 5.1, eps: 28, divY: 10, roe: 22, name: "Habib Bank Limited" },
  ENGRO: { pe: 6.5, eps: 35, divY: 8, roe: 30, name: "Engro Corporation" },
  LUCK: { pe: 8.2, eps: 42, divY: 6, roe: 18, name: "Lucky Cement Limited" },
  FCCL: { pe: 5.8, eps: 15, divY: 9, roe: 20, name: "Fauji Cement Company" },
  MCB: { pe: 4.5, eps: 38, divY: 11, roe: 25, name: "Muslim Commercial Bank" },
  UBL: { pe: 5.3, eps: 30, divY: 10, roe: 21, name: "United Bank Limited" },
  PPL: { pe: 4.8, eps: 28, divY: 13, roe: 24, name: "Pakistan Petroleum Limited" },
  PSO: { pe: 6.1, eps: 45, divY: 14, roe: 26, name: "Pakistan State Oil" },
  MARI: { pe: 7.2, eps: 55, divY: 7, roe: 22, name: "Mari Petroleum" },
  HUBCO: { pe: 5.5, eps: 25, divY: 12, roe: 20, name: "Hub Power Company" },
};

// Benchmarks
const PK_RATE = 18;
const PSX_AVG_PE = 10;

// ================= HELPERS =================
const f2 = n => isNaN(+n) ? 'N/A' : (+n).toFixed(2);
const sign = n => (+n >= 0 ? '+' : '');
const fmtVol = n => n > 1e6 ? (n/1e6).toFixed(2)+'M' : n > 1e3 ? (n/1e3).toFixed(0)+'K' : n;


function qs(ticker) {
  document.getElementById('stockInput').value = ticker;
  analyzeStock();
}

// ================= MAIN =================
async function analyzeStock() {
  const raw = document.getElementById('stockInput').value.trim().toUpperCase();
  if (!raw) return;

  showLoading();
  updateLoaderStep(1);

  try {
    const res = await fetch(`/api/psx?symbol=${raw}`);
    
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    
    const json = await res.json();

    if (!json?.data || json.data.length < 2) {
      throw new Error("Ticker not found or insufficient data");
    }

    updateLoaderStep(2);

    // ===== FIX: Map flat array [timestamp, close, volume, open] to objects =====
    // Data comes in reverse chronological order (newest first)
    const data = json.data.map(row => ({
      timestamp: row[0],
      close: row[1],
      volume: row[2],
      open: row[3]
    }));

    // ===== CRITICAL FIX: Latest is data[0], NOT data[data.length-1] =====
    const latest = data[0];
    const prev = data[1];

    // ===== PRICE =====
    const price = latest.close;
    const chgAbs = price - prev.close;
    const chgPct = (chgAbs / prev.close) * 100;

    // ===== VOLUME =====
    const volume = latest.volume;

    // ===== 52 WEEK =====
    // Take last 250 entries (which are the oldest 250 since array is reverse chronological)
    // Actually we need the last 250 trading days from the data
    const last250 = data.slice(0, 250); // First 250 are most recent
    const prices = last250.map(d => d.close);

    const w52H = Math.max(...prices);
    const w52L = Math.min(...prices);
    const pct52 = ((price - w52L) / (w52H - w52L)) * 100;

    updateLoaderStep(3);

    // ===== FUNDAMENTALS =====
    const f = FUNDAMENTALS[raw] || { name: raw };

    const pe = f.pe ?? null;
    const eps = f.eps ?? null;
    const divY = f.divY ?? 0;
    const roe = f.roe ?? null;

    // ===== SCORING =====
    let score = 0;
    const checklist = [];

    if (pe !== null) {
      const ok = pe < PSX_AVG_PE;
      score += ok ? 1 : -1;
      checklist.push({ label: `P/E ${f2(pe)} vs avg ${PSX_AVG_PE}`, status: ok ? 'pass' : 'fail' });
    }

    if (roe !== null) {
      const ok = roe > PK_RATE;
      score += ok ? 1 : -0.5;
      checklist.push({ label: `ROE ${roe}% vs ${PK_RATE}%`, status: ok ? 'pass' : 'warn' });
    }

    if (divY > 0) {
      const ok = divY > 10;
      score += ok ? 0.5 : 0;
      checklist.push({ label: `Dividend ${divY}%`, status: ok ? 'pass' : 'warn' });
    }

    if (pct52 < 35) {
      score += 0.5;
      checklist.push({ label: `Near 52w low`, status: 'pass' });
    } else if (pct52 > 80) {
      score -= 0.5;
      checklist.push({ label: `Near 52w high`, status: 'warn' });
    }

    // ===== VERDICT =====
    let verdict, confidence;

    if (score >= 2) {
      verdict = 'BUY';
      confidence = 75;
    } else if (score >= 0) {
      verdict = 'HOLD';
      confidence = 60;
    } else {
      verdict = 'SELL';
      confidence = 65;
    }

    updateLoaderStep(4);

    // ===== RENDER =====
    const html = `
      <div class="stock-header">
        <div class="stock-name-block">
          <h2>PSX:${raw}</h2>
          <div class="company-name">${f.name}</div>
          <div class="data-note">⟳ Live via PSX · ${new Date(latest.timestamp * 1000).toLocaleDateString('en-PK')}</div>
        </div>
        <div class="price-block">
          <div class="current-price">PKR ${f2(price)}</div>
          <div class="price-change ${chgAbs >= 0 ? 'up' : 'dn'}">
            ${sign(chgAbs)}${f2(chgAbs)} (${sign(chgPct)}${f2(chgPct)}%)
          </div>
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
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">P/E Ratio</div>
          <div class="metric-value">${pe ?? 'N/A'}</div>
          <div class="metric-explain">Price to Earnings</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">EPS</div>
          <div class="metric-value">${eps ?? 'N/A'}</div>
          <div class="metric-explain">Earnings Per Share</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Dividend Yield</div>
          <div class="metric-value">${divY}%</div>
          <div class="metric-explain">Annual Dividend Return</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Volume</div>
          <div class="metric-value">${fmtVol(volume)}</div>
          <div class="metric-explain">Today's Shares Traded</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Day Open</div>
          <div class="metric-value">${f2(latest.open)}</div>
          <div class="metric-explain">Opening Price</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">52W Position</div>
          <div class="metric-value">${f2(pct52)}%</div>
          <div class="metric-explain">Relative to yearly range</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Fundamental Analysis</div>
        <div class="fund-grid">
          <div class="fund-card">
            <div class="fund-card-label">Valuation</div>
            <div class="fund-card-value">${pe ? (pe < PSX_AVG_PE ? 'Undervalued' : 'Fair/High') : 'N/A'}</div>
            <div class="fund-card-note">P/E of ${pe ?? '?'} vs market avg ${PSX_AVG_PE}</div>
          </div>
          <div class="fund-card">
            <div class="fund-card-label">Profitability</div>
            <div class="fund-card-value">${roe ? (roe > PK_RATE ? 'Strong' : 'Moderate') : 'N/A'}</div>
            <div class="fund-card-note">ROE of ${roe ?? '?'}% vs risk-free ${PK_RATE}%</div>
          </div>
          <div class="fund-card">
            <div class="fund-card-label">Income</div>
            <div class="fund-card-value">${divY > 10 ? 'Attractive' : divY > 5 ? 'Moderate' : 'Low'}</div>
            <div class="fund-card-note">Dividend yield ${divY}% annual return</div>
          </div>
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

      <div class="verdict-card ${verdict.toLowerCase()}">
        <div class="verdict-inner">
          <div class="verdict-stamp">${verdict}</div>
          <div class="verdict-details">
            <div class="verdict-confidence">Confidence Level</div>
            <div class="confidence-bar">
              <div class="confidence-fill" style="width:${confidence}%"></div>
            </div>
            <div class="verdict-reasoning">
              ${verdict === 'BUY' ? 'Stock appears undervalued with strong fundamentals relative to market benchmarks.' :
                verdict === 'HOLD' ? 'Stock is fairly valued. Consider holding current positions while monitoring for better entry points.' :
                'Stock may be overvalued or showing weak fundamentals. Consider reducing exposure.'}
            </div>
            <div class="checklist">
              ${checklist.map(c => `
                <div class="check-item">
                  <span class="check-icon ${c.status}">${c.status === 'pass' ? '✓' : c.status === 'fail' ? '✕' : '◐'}</span>
                  <span>${c.label}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    hideLoading();

    const el = document.getElementById('results');
    el.innerHTML = html;
    el.style.display = 'block';

    // Trigger animations after render
    setTimeout(() => {
      document.querySelectorAll('.range-fill, .range-marker, .confidence-fill').forEach(el => {
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

function updateLoaderStep(step) {
  document.querySelectorAll('.loader-step').forEach((s, i) => {
    s.classList.toggle('active', i < step);
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

// Enter key support
document.getElementById('stockInput')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') analyzeStock();
});