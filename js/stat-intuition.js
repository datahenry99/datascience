/* ===== Stat Intuition - Interactive Visualizations (Inline Mode) ===== */

// SVG icon for "insight" bullet (replaces emoji)
var SVG_INSIGHT = '<svg style="display:inline-block;vertical-align:-2px;margin-right:4px" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>';

// --- Utility ---
function gaussianPDF(x, mu, sigma) {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
}
function erf(x) {
  var a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
  var s=1; if(x<0){s=-1;x=-x;}
  var t=1/(1+p*x);
  var y=1-(((((a5*t+a4)*t)+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
  return s*y;
}
function normalCDF(x, mu, sigma) {
  return 0.5 * (1 + erf((x - mu) / (sigma * Math.sqrt(2))));
}
function randNormal() {
  var u=0,v=0; while(u===0)u=Math.random(); while(v===0)v=Math.random();
  return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
}

// --- Helper to build UI ---
function h(tag, attrs, children) {
  var el = document.createElement(tag);
  if (attrs) Object.keys(attrs).forEach(function(k) {
    if (k === 'style' && typeof attrs[k] === 'object') {
      Object.assign(el.style, attrs[k]);
    } else if (k.startsWith('on')) {
      el.addEventListener(k.slice(2), attrs[k]);
    } else { el.setAttribute(k, attrs[k]); }
  });
  if (children) {
    if (typeof children === 'string') el.innerHTML = children;
    else if (Array.isArray(children)) children.forEach(function(c) { if (c) el.appendChild(c); });
    else el.appendChild(children);
  }
  return el;
}

function makeCanvas(ht) {
  var wrap = h('div', { class: 'si-canvas-wrap' });
  var cvs = h('canvas');
  cvs.style.width = '100%';
  cvs.style.height = ht + 'px';
  wrap.appendChild(cvs);
  return { wrap: wrap, canvas: cvs };
}

function setupHiDPI(canvas, w, ht) {
  var dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = ht * dpr;
  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}

function makeSlider(label, min, max, value, step, onChange) {
  var row = h('div', { class: 'si-control-row' });
  var lbl = h('span', { class: 'si-control-label' }, label);
  var val = h('span', { class: 'si-control-value' }, String(value));
  var inp = h('input', { type: 'range', min: min, max: max, value: value, step: step || 1 });
  inp.addEventListener('input', function() {
    val.textContent = inp.value;
    onChange(parseFloat(inp.value));
  });
  row.appendChild(lbl); row.appendChild(inp); row.appendChild(val);
  return row;
}

// ============================================================
// Auto-init: render all 6 visualizations into their containers
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  var vizMap = [
    { id: 'viz-normal', init: initNormal },
    { id: 'viz-clt',    init: initCLT },
    { id: 'viz-pvalue', init: initPValue },
    { id: 'viz-ci',     init: initCI },
    { id: 'viz-bayes',  init: initBayes },
    { id: 'viz-lln',    init: initLLN }
  ];

  vizMap.forEach(function(v) {
    var container = document.getElementById(v.id);
    if (container) v.init(container);
  });
});

// ============================================================
// 1. Normal Distribution
// ============================================================
function initNormal(container) {
  var mu = 0, sigma = 1;
  var c = makeCanvas(300);
  var controls = h('div', { class: 'si-controls' });
  var stats = h('div', { class: 'si-stats-box' });
  var explainSlot = document.getElementById('explain-normal');

  controls.appendChild(makeSlider('均值 μ', -5, 5, 0, 0.1, function(v) { mu = v; draw(); }));
  controls.appendChild(makeSlider('标准差 σ', 0.2, 4, 1, 0.1, function(v) { sigma = v; draw(); }));

  container.appendChild(c.wrap);
  container.appendChild(controls);
  container.appendChild(stats);

  function draw() {
    var rect = c.canvas.getBoundingClientRect();
    var W = rect.width, H = rect.height;
    if (W === 0 || H === 0) return;
    var ctx = setupHiDPI(c.canvas, W, H);
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    var padL = 50, padR = 20, padT = 30, padB = 40;
    var pw = W - padL - padR, ph = H - padT - padB;

    // X 轴固定范围 [mu-5, mu+5]，不跟随 σ 缩放
    // 这样 σ 小时曲线窄、σ 大时曲线宽，直观体现胖瘦
    var xMin = mu - 5, xMax = mu + 5;

    // Y 轴自适应：让当前峰值占画布 90% 高度（保证曲线不被截断）
    var peakY = gaussianPDF(mu, mu, sigma);
    var yMax = peakY / 0.88;

    // Grid lines
    ctx.strokeStyle = isDark ? '#1e293b' : '#e8ecf1';
    ctx.lineWidth = 1;
    for (var i = 0; i <= 4; i++) {
      var gy = padT + (ph / 4) * i;
      ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + pw, gy); ctx.stroke();
    }

    // X 轴刻度
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    for (var t = Math.ceil(xMin); t <= Math.floor(xMax); t++) {
      var tx = padL + ((t - xMin) / (xMax - xMin)) * pw;
      ctx.fillText(t, tx, H - 8);
    }

    // 辅助函数：将 y 值映射到画布坐标
    function toY(yv) {
      return padT + ph - (yv / yMax) * ph;
    }

    // Filled area
    ctx.beginPath();
    ctx.moveTo(padL, padT + ph);
    for (var px = 0; px <= pw; px++) {
      var xv = xMin + (px / pw) * (xMax - xMin);
      ctx.lineTo(padL + px, toY(gaussianPDF(xv, mu, sigma)));
    }
    ctx.lineTo(padL + pw, padT + ph);
    ctx.closePath();
    var grad = ctx.createLinearGradient(0, padT, 0, padT + ph);
    grad.addColorStop(0, 'rgba(99,102,241,0.25)');
    grad.addColorStop(1, 'rgba(99,102,241,0.02)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Curve
    ctx.beginPath();
    for (var px2 = 0; px2 <= pw; px2++) {
      var xv2 = xMin + (px2 / pw) * (xMax - xMin);
      var cy = toY(gaussianPDF(xv2, mu, sigma));
      if (px2 === 0) ctx.moveTo(padL, cy); else ctx.lineTo(padL + px2, cy);
    }
    ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2.5; ctx.stroke();

    // μ 竖线（红色实线 + 标签）
    var muX = padL + pw / 2; // μ 始终在画布正中间
    ctx.setLineDash([]);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(muX, padT); ctx.lineTo(muX, padT + ph); ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('μ = ' + mu.toFixed(1), muX, padT - 10);

    // ±σ 虚线标记 + 标签
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 1;
    [-1, 1].forEach(function(s) {
      var sx = mu + s * sigma;
      var mx = padL + ((sx - xMin) / (xMax - xMin)) * pw;
      ctx.beginPath(); ctx.moveTo(mx, padT); ctx.lineTo(mx, padT + ph); ctx.stroke();
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s === -1 ? 'μ-σ' : 'μ+σ', mx, padT + ph + 14);
    });
    ctx.setLineDash([]);

    // Stats
    stats.innerHTML =
      '<div class="si-stat"><div class="si-stat-value">' + mu.toFixed(1) + '</div><div class="si-stat-label">均值 μ</div></div>' +
      '<div class="si-stat"><div class="si-stat-value">' + sigma.toFixed(1) + '</div><div class="si-stat-label">标准差 σ</div></div>' +
      '<div class="si-stat"><div class="si-stat-value">' + (sigma * sigma).toFixed(2) + '</div><div class="si-stat-label">方差 σ²</div></div>' +
      '<div class="si-stat"><div class="si-stat-value">' + peakY.toFixed(3) + '</div><div class="si-stat-label">峰值密度</div></div>';

    if (explainSlot) explainSlot.innerHTML = '<div class="si-explain"><strong>' + SVG_INSIGHT + '直觉：</strong>μ 控制钟形曲线的「中心位置」，σ 控制曲线的「胖瘦」。' +
      'σ 越大，曲线越矮越宽，数据越分散；σ 越小，曲线越高越窄，数据越集中。</div>';
  }

  setTimeout(draw, 100);
  new ResizeObserver(draw).observe(c.canvas);
}

// ============================================================
// 2. Central Limit Theorem
// ============================================================
function initCLT(container) {
  var sampleSize = 30, sampleCount = 0, means = [];
  var distType = 'uniform';
  var c = makeCanvas(300);
  var btnRow = h('div', { class: 'si-btn-row' });
  var controls = h('div', { class: 'si-controls' });
  var stats = h('div', { class: 'si-stats-box' });
  var explainSlot = document.getElementById('explain-clt');

  // Distribution selector
  var btns = [
    { key: 'uniform', label: '均匀分布' },
    { key: 'exponential', label: '指数分布' },
    { key: 'bimodal', label: '双峰分布' }
  ];
  btns.forEach(function(b) {
    var btn = h('button', { class: 'si-btn ' + (b.key === distType ? 'si-btn-primary' : 'si-btn-secondary') }, b.label);
    btn.addEventListener('click', function() {
      distType = b.key; means = []; sampleCount = 0;
      btnRow.querySelectorAll('.si-btn').forEach(function(el, i) {
        if (i < btns.length) el.className = 'si-btn ' + (btns[i].key === distType ? 'si-btn-primary' : 'si-btn-secondary');
      });
      draw();
    });
    btnRow.appendChild(btn);
  });

  [10, 100, 1000].forEach(function(n) {
    var sBtn = h('button', { class: 'si-btn si-btn-primary' }, '▶ 抽样 ' + n + ' 次');
    sBtn.addEventListener('click', function() {
      for (var i = 0; i < n; i++) {
        var sum = 0;
        for (var j = 0; j < sampleSize; j++) sum += sampleOnce(distType);
        means.push(sum / sampleSize);
        sampleCount++;
      }
      draw();
    });
    btnRow.appendChild(sBtn);
  });
  var resetBtn = h('button', { class: 'si-btn si-btn-secondary' }, '↺ 重置');
  resetBtn.addEventListener('click', function() { means = []; sampleCount = 0; draw(); });
  btnRow.appendChild(resetBtn);

  controls.appendChild(makeSlider('样本量 n', 2, 100, 30, 1, function(v) { sampleSize = v; }));

  container.appendChild(c.wrap);
  container.appendChild(btnRow);
  container.appendChild(controls);
  container.appendChild(stats);

  function sampleOnce(type) {
    if (type === 'uniform') return Math.random() * 10;
    if (type === 'exponential') return -Math.log(1 - Math.random()) * 2;
    return Math.random() < 0.5 ? randNormal() * 0.8 + 2 : randNormal() * 0.8 + 7;
  }

  function draw() {
    var rect = c.canvas.getBoundingClientRect();
    var W = rect.width, H = rect.height;
    if (W === 0 || H === 0) return;
    var ctx = setupHiDPI(c.canvas, W, H);
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    var padL = 50, padR = 20, padT = 20, padB = 40;
    var pw = W - padL - padR, ph = H - padT - padB;

    if (means.length === 0) {
      ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
      ctx.font = '16px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('点击「抽样」按钮开始实验', W / 2, H / 2);
      stats.innerHTML = '';
      if (explainSlot) explainSlot.innerHTML = '<div class="si-explain"><strong>' + SVG_INSIGHT + '中心极限定理：</strong>无论原始分布的形状如何，当样本量足够大时，样本均值的分布会趋近于正态分布。这是统计推断的基石。</div>';
      return;
    }

    // Build histogram
    var mn = Math.min.apply(null, means), mx = Math.max.apply(null, means);
    if (mn === mx) { mn -= 1; mx += 1; }
    var bins = 40, binW = (mx - mn) / bins, counts = new Array(bins).fill(0);
    means.forEach(function(m) {
      var idx = Math.min(Math.floor((m - mn) / binW), bins - 1);
      counts[idx]++;
    });
    var maxCount = Math.max.apply(null, counts);

    // Bars
    var barW = pw / bins;
    ctx.fillStyle = isDark ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.35)';
    counts.forEach(function(cnt, i) {
      var bh = (cnt / maxCount) * ph * 0.85;
      ctx.fillRect(padL + i * barW + 1, padT + ph - bh, barW - 2, bh);
    });

    // Overlay normal curve
    var meanOfMeans = means.reduce(function(a, b) { return a + b; }, 0) / means.length;
    var variance = means.reduce(function(a, b) { return a + (b - meanOfMeans) * (b - meanOfMeans); }, 0) / means.length;
    var stdOfMeans = Math.sqrt(variance);
    if (stdOfMeans > 0) {
      var peak = gaussianPDF(meanOfMeans, meanOfMeans, stdOfMeans);
      ctx.beginPath();
      for (var px = 0; px <= pw; px++) {
        var xv = mn + (px / pw) * (mx - mn);
        var yv = gaussianPDF(xv, meanOfMeans, stdOfMeans);
        var cy = padT + ph - (yv / peak) * ph * 0.85;
        if (px === 0) ctx.moveTo(padL, cy); else ctx.lineTo(padL + px, cy);
      }
      ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 2.5; ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    for (var t = 0; t <= 5; t++) {
      var xv3 = mn + (t / 5) * (mx - mn);
      ctx.fillText(xv3.toFixed(1), padL + (t / 5) * pw, H - 8);
    }

    stats.innerHTML =
      '<div class="si-stat"><div class="si-stat-value">' + sampleCount + '</div><div class="si-stat-label">抽样次数</div></div>' +
      '<div class="si-stat"><div class="si-stat-value">' + meanOfMeans.toFixed(3) + '</div><div class="si-stat-label">均值均值 x̄</div></div>' +
      '<div class="si-stat"><div class="si-stat-value">' + stdOfMeans.toFixed(3) + '</div><div class="si-stat-label">均值标准差</div></div>';

    if (explainSlot) explainSlot.innerHTML = '<div class="si-explain"><strong>' + SVG_INSIGHT + '直觉：</strong>红色曲线是拟合的正态分布。即使原始数据来自<strong>' +
      (distType === 'uniform' ? '均匀分布' : distType === 'exponential' ? '右偏的指数分布' : '双峰分布') +
      '</strong>，样本均值的直方图也越来越像正态——这就是中心极限定理的力量！抽样次数越多、样本量 n 越大，效果越明显。</div>';
  }

  setTimeout(draw, 100);
  new ResizeObserver(draw).observe(c.canvas);
}

// ============================================================
// 3. P-Value
// ============================================================
function initPValue(container) {
  var zObs = 1.96;
  var c = makeCanvas(300);
  var controls = h('div', { class: 'si-controls' });
  var stats = h('div', { class: 'si-stats-box' });
  var explainSlot = document.getElementById('explain-pvalue');

  controls.appendChild(makeSlider('观测 Z 值', -4, 4, 1.96, 0.01, function(v) { zObs = v; draw(); }));

  var legend = h('div', { class: 'si-sig-legend' });
  legend.innerHTML =
    '<div style="font-size:13px;color:#64748b;line-height:1.8;padding:8px 0;">' +
    '<span style="margin-right:16px;">★ <b>显著</b>：P &lt; 0.05</span>' +
    '<span style="margin-right:16px;">★★ <b>高度显著</b>：P &lt; 0.01</span>' +
    '<span>★★★ <b>极显著</b>：P &lt; 0.001</span>' +
    '</div>';

  container.appendChild(c.wrap);
  container.appendChild(controls);
  container.appendChild(stats);
  container.appendChild(legend);

  function draw() {
    var rect = c.canvas.getBoundingClientRect();
    var W = rect.width, H = rect.height;
    if (W === 0 || H === 0) return;
    var ctx = setupHiDPI(c.canvas, W, H);
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    var padL = 50, padR = 20, padT = 20, padB = 40;
    var pw = W - padL - padR, ph = H - padT - padB;
    var xMin = -4, xMax = 4;
    var peak = gaussianPDF(0, 0, 1);

    // Fill rejection region (two-tailed)
    var absZ = Math.abs(zObs);
    ctx.fillStyle = isDark ? 'rgba(244,63,94,0.45)' : 'rgba(244,63,94,0.3)';
    // Left tail
    ctx.beginPath(); ctx.moveTo(padL, padT + ph);
    for (var px = 0; px <= pw; px++) {
      var xv = xMin + (px / pw) * (xMax - xMin);
      if (xv > -absZ) break;
      var yv = gaussianPDF(xv, 0, 1);
      ctx.lineTo(padL + px, padT + ph - (yv / peak) * ph * 0.9);
    }
    ctx.lineTo(padL + px - 1, padT + ph); ctx.closePath(); ctx.fill();
    // Right tail
    ctx.beginPath();
    var startPx = Math.floor(((absZ - xMin) / (xMax - xMin)) * pw);
    ctx.moveTo(padL + startPx, padT + ph);
    for (var px2 = startPx; px2 <= pw; px2++) {
      var xv2 = xMin + (px2 / pw) * (xMax - xMin);
      var yv2 = gaussianPDF(xv2, 0, 1);
      ctx.lineTo(padL + px2, padT + ph - (yv2 / peak) * ph * 0.9);
    }
    ctx.lineTo(padL + pw, padT + ph); ctx.closePath(); ctx.fill();

    // When |Z| is large, draw small triangular markers so tails stay visible
    if (absZ > 2.5) {
      var markerH = 18, markerW = 8;
      var tailColor = isDark ? 'rgba(244,63,94,0.7)' : 'rgba(244,63,94,0.5)';
      ctx.fillStyle = tailColor;
      // Left marker
      var lx = padL + ((-absZ - xMin) / (xMax - xMin)) * pw;
      ctx.beginPath();
      ctx.moveTo(lx, padT + ph);
      ctx.lineTo(lx - markerW / 2, padT + ph - markerH);
      ctx.lineTo(lx + markerW / 2, padT + ph - markerH);
      ctx.closePath(); ctx.fill();
      // Right marker
      var rx = padL + ((absZ - xMin) / (xMax - xMin)) * pw;
      ctx.beginPath();
      ctx.moveTo(rx, padT + ph);
      ctx.lineTo(rx - markerW / 2, padT + ph - markerH);
      ctx.lineTo(rx + markerW / 2, padT + ph - markerH);
      ctx.closePath(); ctx.fill();
    }

    // Curve
    ctx.beginPath();
    for (var px3 = 0; px3 <= pw; px3++) {
      var xv3 = xMin + (px3 / pw) * (xMax - xMin);
      var yv3 = gaussianPDF(xv3, 0, 1);
      var cy = padT + ph - (yv3 / peak) * ph * 0.9;
      if (px3 === 0) ctx.moveTo(padL, cy); else ctx.lineTo(padL + px3, cy);
    }
    ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2.5; ctx.stroke();

    // Z line
    var zPx = padL + ((zObs - xMin) / (xMax - xMin)) * pw;
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(zPx, padT); ctx.lineTo(zPx, padT + ph); ctx.stroke();
    ctx.setLineDash([]);

    // Label
    ctx.fillStyle = '#f43f5e'; ctx.font = 'bold 13px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Z = ' + zObs.toFixed(2), zPx, padT - 4);

    // Axis
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '12px Inter, sans-serif';
    for (var t = -4; t <= 4; t++) {
      var tx = padL + ((t - xMin) / (xMax - xMin)) * pw;
      ctx.fillText(t, tx, H - 8);
    }

    // P-value calculation (two-tailed)
    var pVal = 2 * (1 - normalCDF(absZ, 0, 1));
    var sig = pVal < 0.001 ? '★★★ 极显著' : pVal < 0.01 ? '★★ 高度显著' : pVal < 0.05 ? '★ 显著' : '不显著';

    stats.innerHTML =
      '<div class="si-stat"><div class="si-stat-value">' + zObs.toFixed(2) + '</div><div class="si-stat-label">Z 统计量</div></div>' +
      '<div class="si-stat"><div class="si-stat-value" style="color:' + (pVal < 0.05 ? '#f43f5e' : '#10b981') + '">' + (pVal < 0.0001 ? pVal.toExponential(2) : pVal.toFixed(4)) + '</div><div class="si-stat-label">P 值（双尾）</div></div>' +
      '<div class="si-stat"><div class="si-stat-value">' + sig + '</div><div class="si-stat-label">α = 0.05</div></div>';

    if (explainSlot) explainSlot.innerHTML = '<div class="si-explain"><strong>' + SVG_INSIGHT + '直觉：</strong>P 值 = 红色阴影面积之和，表示「如果 H₀ 为真，观察到这么极端或更极端结果的概率」。' +
      '当 P < 0.05 时，我们认为这种极端结果不太可能是偶然的，从而拒绝 H₀。</div>';
  }

  setTimeout(draw, 100);
  new ResizeObserver(draw).observe(c.canvas);
}

// ============================================================
// 4. Confidence Interval
// ============================================================
function initCI(container) {
  var trueMu = 50, sigma = 10, n = 25, confLevel = 0.95;
  var intervals = [];
  var c = makeCanvas(300);
  var btnRow = h('div', { class: 'si-btn-row' });
  var controls = h('div', { class: 'si-controls' });
  var stats = h('div', { class: 'si-stats-box' });
  var explainSlot = document.getElementById('explain-ci');

  var goBtn = h('button', { class: 'si-btn si-btn-primary' }, '▶ 生成 100 个 CI');
  goBtn.addEventListener('click', function() {
    intervals = [];
    var z = confLevel === 0.99 ? 2.576 : confLevel === 0.95 ? 1.96 : 1.645;
    var se = sigma / Math.sqrt(n);
    for (var i = 0; i < 100; i++) {
      var sum = 0;
      for (var j = 0; j < n; j++) sum += trueMu + randNormal() * sigma;
      var xbar = sum / n;
      intervals.push({ lo: xbar - z * se, hi: xbar + z * se, mean: xbar, hit: (xbar - z * se <= trueMu && trueMu <= xbar + z * se) });
    }
    draw();
  });
  var resetBtn = h('button', { class: 'si-btn si-btn-secondary' }, '↺ 重置');
  resetBtn.addEventListener('click', function() { intervals = []; draw(); });
  btnRow.appendChild(goBtn); btnRow.appendChild(resetBtn);

  controls.appendChild(makeSlider('样本量 n', 5, 100, 25, 1, function(v) { n = v; }));
  controls.appendChild(makeSlider('置信水平 %', 90, 99, 95, 1, function(v) { confLevel = v / 100; }));

  container.appendChild(c.wrap);
  container.appendChild(btnRow);
  container.appendChild(controls);
  container.appendChild(stats);

  function draw() {
    var rect = c.canvas.getBoundingClientRect();
    var W = rect.width, H = rect.height;
    if (W === 0 || H === 0) return;
    var ctx = setupHiDPI(c.canvas, W, H);
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    var padL = 50, padR = 20, padT = 10, padB = 30;
    var pw = W - padL - padR, ph = H - padT - padB;

    if (intervals.length === 0) {
      ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
      ctx.font = '16px "Noto Sans SC", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('点击「生成 100 个 CI」开始', W / 2, H / 2);
      stats.innerHTML = '';
      if (explainSlot) explainSlot.innerHTML = '<div class="si-explain"><strong>' + SVG_INSIGHT + '置信区间：</strong>95% CI 不是说「真实值有 95% 概率在这个区间内」，而是说「如果反复抽样，95% 的区间会包含真实值」。点击按钮亲自验证！</div>';
      return;
    }

    var allVals = intervals.reduce(function(a, iv) { return a.concat([iv.lo, iv.hi]); }, []);
    var xMin = Math.min.apply(null, allVals) - 2;
    var xMax = Math.max.apply(null, allVals) + 2;

    // True mean line
    var muPx = padL + ((trueMu - xMin) / (xMax - xMin)) * pw;
    ctx.strokeStyle = isDark ? 'rgba(244,63,94,0.5)' : 'rgba(244,63,94,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(muPx, padT); ctx.lineTo(muPx, padT + ph); ctx.stroke();

    // Draw intervals
    var gap = ph / intervals.length;
    intervals.forEach(function(iv, i) {
      var y = padT + i * gap + gap / 2;
      var x1 = padL + ((iv.lo - xMin) / (xMax - xMin)) * pw;
      var x2 = padL + ((iv.hi - xMin) / (xMax - xMin)) * pw;
      ctx.strokeStyle = iv.hit ? (isDark ? '#34d399' : '#10b981') : '#f43f5e';
      ctx.lineWidth = Math.max(gap * 0.6, 1.5);
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    });

    // True mean label
    ctx.fillStyle = '#f43f5e'; ctx.font = 'bold 12px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('μ = ' + trueMu, muPx, padT - 2);

    // Axis
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '11px Inter, sans-serif';
    for (var t = 0; t <= 5; t++) {
      var xv = xMin + (t / 5) * (xMax - xMin);
      ctx.fillText(xv.toFixed(1), padL + (t / 5) * pw, H - 8);
    }

    var hitCount = intervals.filter(function(iv) { return iv.hit; }).length;
    stats.innerHTML =
      '<div class="si-stat"><div class="si-stat-value">' + intervals.length + '</div><div class="si-stat-label">区间数</div></div>' +
      '<div class="si-stat"><div class="si-stat-value" style="color:#10b981">' + hitCount + '</div><div class="si-stat-label">包含 μ</div></div>' +
      '<div class="si-stat"><div class="si-stat-value" style="color:#f43f5e">' + (intervals.length - hitCount) + '</div><div class="si-stat-label">未包含 μ</div></div>' +
      '<div class="si-stat"><div class="si-stat-value">' + (hitCount / intervals.length * 100).toFixed(1) + '%</div><div class="si-stat-label">覆盖率</div></div>';

    if (explainSlot) explainSlot.innerHTML = '<div class="si-explain"><strong>' + SVG_INSIGHT + '直觉：</strong>绿色线段包含真实均值 μ，红色线段未包含。在 100 个 ' +
      (confLevel * 100).toFixed(0) + '% CI 中，有 <strong>' + hitCount + '</strong> 个包含了 μ = ' + trueMu +
      '（覆盖率 ' + (hitCount / intervals.length * 100).toFixed(1) + '%）。理论上应接近 ' + (confLevel * 100).toFixed(0) + '%。</div>';
  }

  setTimeout(draw, 100);
  new ResizeObserver(draw).observe(c.canvas);
}

// ============================================================
// 5. Bayes' Theorem
// ============================================================
function initBayes(container) {
  var prior = 0.01, sensitivity = 0.95, specificity = 0.90;
  var c = makeCanvas(280);
  var controls = h('div', { class: 'si-controls' });
  var stats = h('div', { class: 'si-stats-box' });
  var explainSlot = document.getElementById('explain-bayes');

  controls.appendChild(makeSlider('先验 P(D)', 0.001, 0.5, 0.01, 0.001, function(v) { prior = v; draw(); }));
  controls.appendChild(makeSlider('灵敏度 P(+|D)', 0.5, 1, 0.95, 0.01, function(v) { sensitivity = v; draw(); }));
  controls.appendChild(makeSlider('特异度 P(-|¬D)', 0.5, 1, 0.90, 0.01, function(v) { specificity = v; draw(); }));

  container.appendChild(c.wrap);
  container.appendChild(controls);
  container.appendChild(stats);

  function draw() {
    var rect = c.canvas.getBoundingClientRect();
    var W = rect.width, H = rect.height;
    if (W === 0 || H === 0) return;
    var ctx = setupHiDPI(c.canvas, W, H);
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    // Calculate
    var pPosGivenNotD = 1 - specificity;
    var pPos = sensitivity * prior + pPosGivenNotD * (1 - prior);
    var posterior = (sensitivity * prior) / pPos;

    // Draw stacked bar
    var padL = 80, padR = 80, padT = 40, padB = 60;
    var bw = W - padL - padR, bh = 50;

    // Prior bar
    var y1 = padT;
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(padL, y1, bw * prior, bh);
    ctx.fillStyle = isDark ? '#334155' : '#e2e8f0';
    ctx.fillRect(padL + bw * prior, y1, bw * (1 - prior), bh);

    ctx.fillStyle = isDark ? '#f1f5f9' : '#0f172a';
    ctx.font = 'bold 13px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('先验', 8, y1 + bh / 2 + 5);
    ctx.textAlign = 'right';
    ctx.fillText((prior * 100).toFixed(1) + '%', W - 10, y1 + bh / 2 + 5);

    // Posterior bar
    var y2 = padT + bh + 30;
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(padL, y2, bw * posterior, bh);
    ctx.fillStyle = isDark ? '#334155' : '#e2e8f0';
    ctx.fillRect(padL + bw * posterior, y2, bw * (1 - posterior), bh);

    ctx.fillStyle = isDark ? '#f1f5f9' : '#0f172a';
    ctx.textAlign = 'left';
    ctx.fillText('后验', 8, y2 + bh / 2 + 5);
    ctx.textAlign = 'right';
    ctx.fillText((posterior * 100).toFixed(1) + '%', W - 10, y2 + bh / 2 + 5);

    // Arrow
    var arrowX = padL + bw / 2;
    ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(arrowX, y1 + bh + 4); ctx.lineTo(arrowX, y2 - 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(arrowX - 6, y2 - 10); ctx.lineTo(arrowX, y2 - 4); ctx.lineTo(arrowX + 6, y2 - 10); ctx.stroke();

    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('检测阳性 → 贝叶斯更新', arrowX, y1 + bh + 22);

    // Labels
    ctx.font = '11px "Noto Sans SC", sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.fillText('P(患病)', padL + bw * prior / 2, y1 - 6);
    ctx.fillText('P(患病|阳性)', padL + bw * posterior / 2, y2 + bh + 18);

    stats.innerHTML =
      '<div class="si-stat"><div class="si-stat-value">' + (prior * 100).toFixed(2) + '%</div><div class="si-stat-label">先验 P(D)</div></div>' +
      '<div class="si-stat"><div class="si-stat-value" style="color:#f43f5e">' + (posterior * 100).toFixed(2) + '%</div><div class="si-stat-label">后验 P(D|+)</div></div>' +
      '<div class="si-stat"><div class="si-stat-value">' + (posterior / prior).toFixed(1) + '×</div><div class="si-stat-label">更新倍数</div></div>' +
      '<div class="si-stat"><div class="si-stat-value">' + (pPosGivenNotD * 100).toFixed(1) + '%</div><div class="si-stat-label">假阳性率</div></div>';

    if (explainSlot) explainSlot.innerHTML = '<div class="si-explain"><strong>' + SVG_INSIGHT + '直觉：</strong>经典的「医学检测悖论」——即使检测灵敏度高达 ' + (sensitivity * 100).toFixed(0) + '%，' +
      '当患病率仅为 <strong>' + (prior * 100).toFixed(2) + '%</strong> 时，检测阳性后真正患病的概率只有 <strong>' + (posterior * 100).toFixed(2) + '%</strong>。' +
      '这是因为大量健康人的假阳性「淹没」了真阳性。先验概率越低，这个效应越明显！</div>';
  }

  setTimeout(draw, 100);
  new ResizeObserver(draw).observe(c.canvas);
}

// ============================================================
// 6. Law of Large Numbers
// ============================================================
function initLLN(container) {
  var results = [], animId = null, speed = 1;
  var c = makeCanvas(300);
  var btnRow = h('div', { class: 'si-btn-row' });
  var stats = h('div', { class: 'si-stats-box' });
  var explainSlot = document.getElementById('explain-lln');

  var startBtn = h('button', { class: 'si-btn si-btn-primary' }, '▶ 开始抛硬币');
  var pauseBtn = h('button', { class: 'si-btn si-btn-secondary' }, '⏸ 暂停');
  var resetBtn = h('button', { class: 'si-btn si-btn-secondary' }, '↺ 重置');
  var fastBtn = h('button', { class: 'si-btn si-btn-secondary' }, '⚡ 快进 ×10');

  startBtn.addEventListener('click', function() {
    if (animId) return;
    function step() {
      results.push(Math.random() < 0.5 ? 1 : 0);
      draw();
      if (results.length < 10000) animId = setTimeout(step, 150);
      else { animId = null; }
    }
    step();
  });
  pauseBtn.addEventListener('click', function() { if (animId) { clearTimeout(animId); animId = null; } });
  resetBtn.addEventListener('click', function() { if (animId) { clearTimeout(animId); animId = null; } results = []; draw(); });
  fastBtn.addEventListener('click', function() {
    if (animId) { clearTimeout(animId); animId = null; }
    for (var i = 0; i < 10; i++) results.push(Math.random() < 0.5 ? 1 : 0);
    draw();
  });

  btnRow.appendChild(startBtn); btnRow.appendChild(pauseBtn); btnRow.appendChild(fastBtn); btnRow.appendChild(resetBtn);

  container.appendChild(c.wrap);
  container.appendChild(btnRow);
  container.appendChild(stats);

  function draw() {
    var rect = c.canvas.getBoundingClientRect();
    var W = rect.width, H = rect.height;
    if (W === 0 || H === 0) return;
    var ctx = setupHiDPI(c.canvas, W, H);
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    var padL = 60, padR = 20, padT = 20, padB = 40;
    var pw = W - padL - padR, ph = H - padT - padB;

    // Y axis: 0 to 1
    ctx.strokeStyle = isDark ? '#1e293b' : '#e8ecf1'; ctx.lineWidth = 1;
    [0, 0.25, 0.5, 0.75, 1].forEach(function(v) {
      var y = padT + ph - v * ph;
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + pw, y); ctx.stroke();
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(v.toFixed(2), padL - 8, y + 4);
    });

    // 0.5 line
    ctx.setLineDash([8, 4]);
    ctx.strokeStyle = '#f43f5e'; ctx.lineWidth = 1.5;
    var halfY = padT + ph * 0.5;
    ctx.beginPath(); ctx.moveTo(padL, halfY); ctx.lineTo(padL + pw, halfY); ctx.stroke();
    ctx.setLineDash([]);

    if (results.length === 0) {
      ctx.fillStyle = isDark ? '#475569' : '#94a3b8';
      ctx.font = '16px "Noto Sans SC", sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('点击「开始抛硬币」', W / 2, H / 2 - 10);
      stats.innerHTML = '';
      if (explainSlot) explainSlot.innerHTML = '<div class="si-explain"><strong>' + SVG_INSIGHT + '大数定律：</strong>当独立重复实验的次数趋向无穷时，样本均值（正面比例）会以概率 1 收敛到期望值（0.5）。</div>';
      return;
    }

    // Running average line
    ctx.beginPath();
    var cumSum = 0;
    var step = Math.max(1, Math.floor(results.length / pw));
    for (var i = 0; i < results.length; i += step) {
      cumSum = 0;
      for (var j = 0; j <= i; j++) cumSum += results[j];
      var avg = cumSum / (i + 1);
      var x = padL + (i / Math.max(results.length - 1, 1)) * pw;
      var y = padT + ph - avg * ph;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    // Last point
    var totalHeads = results.reduce(function(a, b) { return a + b; }, 0);
    var finalAvg = totalHeads / results.length;
    ctx.lineTo(padL + pw, padT + ph - finalAvg * ph);

    ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2; ctx.stroke();

    // X axis labels
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'center';
    var maxN = results.length;
    for (var t = 0; t <= 4; t++) {
      var nv = Math.round((t / 4) * maxN);
      ctx.fillText(nv.toLocaleString(), padL + (t / 4) * pw, H - 8);
    }

    stats.innerHTML =
      '<div class="si-stat"><div class="si-stat-value">' + results.length.toLocaleString() + '</div><div class="si-stat-label">抛硬币次数</div></div>' +
      '<div class="si-stat"><div class="si-stat-value">' + totalHeads.toLocaleString() + '</div><div class="si-stat-label">正面次数</div></div>' +
      '<div class="si-stat"><div class="si-stat-value">' + finalAvg.toFixed(4) + '</div><div class="si-stat-label">正面比例</div></div>' +
      '<div class="si-stat"><div class="si-stat-value">' + Math.abs(finalAvg - 0.5).toFixed(4) + '</div><div class="si-stat-label">偏离 0.5</div></div>';

    if (explainSlot) explainSlot.innerHTML = '<div class="si-explain"><strong>' + SVG_INSIGHT + '直觉：</strong>经过 <strong>' + results.length.toLocaleString() + '</strong> 次抛硬币，正面比例为 ' +
      finalAvg.toFixed(4) + '，与理论值 0.5 的偏差仅为 ' + Math.abs(finalAvg - 0.5).toFixed(4) +
      '。实验次数越多，蓝色线越趋近红色虚线（0.5）——这就是大数定律！</div>';
  }

  setTimeout(draw, 100);
  new ResizeObserver(draw).observe(c.canvas);
}
