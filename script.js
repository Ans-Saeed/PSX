
// ================= CONFIG =================
const PSX_BASE = "https://dps.psx.com.pk/timeseries/eod";

const FUNDAMENTALS = {
  OGDC: { pe: 4.2, eps: 32, divY: 12, roe: 28 },
  HBL: { pe: 5.1, eps: 28, divY: 10, roe: 22 },
  ENGRO: { pe: 6.5, eps: 35, divY: 8, roe: 30 },
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

  try {
    const res = await fetch(`/api/psx?symbol=${raw}`);
    const json = await res.json();

    if (!json?.data || json.data.length < 2) {
      throw new Error("Ticker not found or insufficient data");
    }

    const data = json.data;
    const latest = data[data.length - 1];
    const prev = data[data.length - 2];

    // ===== PRICE =====
    const price = latest.close;
    const chgAbs = price - prev.close;
    const chgPct = (chgAbs / prev.close) * 100;

    // ===== VOLUME =====
    const volume = latest.volume;

    // ===== 52 WEEK =====
    const last250 = data.slice(-250);
    const prices = last250.map(d => d.close);

    const w52H = Math.max(...prices);
    const w52L = Math.min(...prices);
    const pct52 = ((price - w52L) / (w52H - w52L)) * 100;

    // ===== FUNDAMENTALS =====
    const f = FUNDAMENTALS[raw] || {};

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

    // ===== RENDER =====
    const html = `
      <div class="stock-header">
        <div>
          <h2>PSX:${raw}</h2>
          <div class="data-note">⟳ Live via PSX</div>
        </div>
        <div>
          <div class="current-price">PKR ${f2(price)}</div>
          <div class="price-change ${chgAbs >= 0 ? 'up' : 'dn'}">
            ${sign(chgAbs)}${f2(chgAbs)} (${f2(chgPct)}%)
          </div>
        </div>
      </div>

      <div class="range-section">
        <div>52W Range</div>
        <div>${f2(w52L)} → ${f2(w52H)}</div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">P/E</div>
          <div class="metric-value">${pe ?? 'N/A'}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">EPS</div>
          <div class="metric-value">${eps ?? 'N/A'}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Dividend</div>
          <div class="metric-value">${divY}%</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Volume</div>
          <div class="metric-value">${fmtVol(volume)}</div>
        </div>
      </div>

      <div class="verdict-card ${verdict.toLowerCase()}">
        <div class="verdict-stamp">${verdict}</div>
        <div>Confidence: ${confidence}%</div>
        <div>
          ${checklist.map(c => `<div>${c.status === 'pass' ? '✓' : '⚠'} ${c.label}</div>`).join('')}
        </div>
      </div>
    `;

    hideLoading();

    const el = document.getElementById('results');
    el.innerHTML = html;
    el.style.display = 'block';

  } catch (err) {
    showError(err.message);
  }
}

// ================= UI =================
function showLoading() {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('results').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

function showError(msg) {
  hideLoading();
  document.getElementById('errorMsg').innerText = msg;
  document.getElementById('error').style.display = 'block';
}
