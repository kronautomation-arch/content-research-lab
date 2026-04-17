// ============================================
// Content Research Lab — Editorial Frontend
// ============================================

let DATA = null;
const GITHUB_REPO = 'TU_USUARIO/content-research-lab';

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  initNav();
  setupTabs();
  await loadData();
  setupAddBrandForm();
  setupGenerateScriptsBtn();
});

// ============================================
// NAV SCROLL
// ============================================
function initNav() {
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ============================================
// TABS
// ============================================
function setupTabs() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const tab = link.dataset.tab;
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      link.classList.add('active');
      document.getElementById('tab-' + tab).classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

// ============================================
// DATA LOADING
// ============================================
async function loadData() {
  try {
    const res = await fetch('dashboard.json?t=' + Date.now());
    DATA = await res.json();
    renderOverview();
    populateBrandSelectors();
    document.getElementById('last-update').textContent =
      'Actualizado ' + new Date(DATA.generated_at).toLocaleString('es-MX');
  } catch (e) {
    document.getElementById('brands-list').innerHTML =
      '<div class="loading-state">No se pudo cargar. Ejecuta export_dashboard.py primero.</div>';
  }
}

// ============================================
// OVERVIEW
// ============================================
function renderOverview() {
  const k = DATA.global_kpis;
  document.getElementById('kpi-brands').textContent = k.total_brands;
  document.getElementById('kpi-competitors').textContent = k.total_competitors;
  document.getElementById('kpi-ads').textContent = k.total_ads.toLocaleString('es-MX');
  document.getElementById('kpi-performers').textContent = k.total_performers.toLocaleString('es-MX');
  document.getElementById('kpi-longrunners').textContent = k.total_long_runners.toLocaleString('es-MX');
  document.getElementById('kpi-templates').textContent = k.total_templates;

  const list = document.getElementById('brands-list');
  if (!DATA.brands.length) {
    list.innerHTML = '<div class="loading-state">Sin marcas registradas.</div>';
    return;
  }
  list.innerHTML = DATA.brands.map(b => `
    <div class="brand-card" onclick="selectBrand('${b.slug}')">
      <div class="brand-card-name">${b.name}</div>
      <div class="brand-card-niche">${b.niche || ''} &middot; ${b.country || ''}</div>
      <div class="brand-card-stats">
        <div><strong>${b.kpis.total_ads.toLocaleString('es-MX')}</strong>ads</div>
        <div><strong>${b.kpis.performers + b.kpis.long_runners}</strong>ganadores</div>
        <div><strong>${b.kpis.templates}</strong>guiones</div>
      </div>
    </div>
  `).join('');
}

function selectBrand(slug) {
  document.querySelector('[data-tab="brands"]').click();
  document.getElementById('brand-select').value = slug;
  renderBrandDetail(slug);
}

// ============================================
// POR MARCA
// ============================================
function populateBrandSelectors() {
  const opts = DATA.brands.map(b => `<option value="${b.slug}">${b.name}</option>`).join('');
  ['brand-select', 'scripts-brand-select'].forEach(id => {
    const el = document.getElementById(id);
    el.innerHTML = '<option value="">Seleccionar</option>' + opts;
  });
  document.getElementById('brand-select').addEventListener('change', e => renderBrandDetail(e.target.value));
  document.getElementById('scripts-brand-select').addEventListener('change', e => renderScripts(e.target.value));
  if (DATA.brands.length) {
    document.getElementById('brand-select').value = DATA.brands[0].slug;
    document.getElementById('scripts-brand-select').value = DATA.brands[0].slug;
    renderBrandDetail(DATA.brands[0].slug);
    renderScripts(DATA.brands[0].slug);
  }
}

function renderBrandDetail(slug) {
  const brand = DATA.brands.find(b => b.slug === slug);
  if (!brand) return;
  const k = brand.kpis;
  const wf = brand.winning_formula;

  let html = `
    <div class="brand-hero">
      <h2>${brand.name}</h2>
      <span class="niche-tag">${brand.niche || ''} &middot; ${brand.country || ''}</span>
    </div>

    <div class="metrics-row">
      <div class="metric"><span class="metric-value">${k.total_ads.toLocaleString('es-MX')}</span><span class="metric-label">Total Ads</span></div>
      <div class="metric"><span class="metric-value">${k.competitor_ads.toLocaleString('es-MX')}</span><span class="metric-label">Competidores</span></div>
      <div class="metric"><span class="metric-value">${k.own_ads.toLocaleString('es-MX')}</span><span class="metric-label">Tus Ads</span></div>
      <div class="metric"><span class="metric-value">${k.performers}</span><span class="metric-label">Performers</span></div>
      <div class="metric"><span class="metric-value">${k.long_runners}</span><span class="metric-label">Long-Runners</span></div>
      <div class="metric"><span class="metric-value">${k.templates}</span><span class="metric-label">Guiones</span></div>
    </div>

    <div class="section">
      <p class="section-label">Formula Ganadora del Nicho</p>
      <div class="formula-grid">
        <div class="formula-col">
          <h4>Angulos</h4>
          ${wf.top_angles.map(a => `<div class="formula-item"><span>${a.name}</span><span class="formula-pct">${a.pct}%</span></div>`).join('')}
        </div>
        <div class="formula-col">
          <h4>Hook Structures</h4>
          ${wf.top_hooks.map(h => `<div class="formula-item"><span>${h.name}</span><span class="formula-pct">${h.pct}%</span></div>`).join('')}
        </div>
        <div class="formula-col">
          <h4>Formatos</h4>
          ${wf.top_formats.map(f => `<div class="formula-item"><span>${f.name}</span><span class="formula-pct">${f.pct}%</span></div>`).join('')}
        </div>
      </div>
    </div>

    <div class="comp-list">
      <p class="section-label">Competidores (${brand.competitors.length})</p>
      ${brand.competitors.map(c => `
        <div class="comp-row">
          <div class="comp-logo-sm">${c.logo_url ? `<img src="${c.logo_url}" alt="" onerror="this.parentElement.innerHTML='&mdash;'">` : '&mdash;'}</div>
          <div class="comp-name-col">${c.name} <small class="tier-tag">${c.tier || ''}</small></div>
          <div class="comp-stat">${c.total_ads}</div>
          <div class="comp-stat">${c.performers}</div>
        </div>
      `).join('')}
    </div>

    <div class="ads-header">
      <h3>Top 100 Ads Ganadores</h3>
      <div class="filter-bar">
        <input type="text" id="search-comp-ads" placeholder="Buscar...">
        <select id="filter-tier-comp">
          <option value="">Todos</option>
          <option value="long-runner">Long-runners</option>
          <option value="performer">Performers</option>
        </select>
      </div>
    </div>
    <div class="ads-grid" id="comp-ads-grid"></div>
  `;

  if (brand.top_own_ads && brand.top_own_ads.length) {
    html += `
      <div class="ads-header" style="margin-top:60px">
        <h3>Tus Ads</h3>
      </div>
      <div class="ads-grid" id="own-ads-grid"></div>
    `;
  }

  document.getElementById('brand-content').innerHTML = html;
  renderAdsGrid(brand.top_100_competitor_ads, 'comp-ads-grid');
  if (brand.top_own_ads && brand.top_own_ads.length) renderAdsGrid(brand.top_own_ads, 'own-ads-grid');

  ['search-comp-ads', 'filter-tier-comp'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => filterCompAds(brand));
  });

  // content loaded
}

function renderAdsGrid(ads, containerId) {
  const c = document.getElementById(containerId);
  if (!c || !ads.length) { if (c) c.innerHTML = '<div class="loading-state">Sin ads.</div>'; return; }

  c.innerHTML = ads.map(ad => {
    const tier = ad.longevity_tier || 'new';
    const tierLabel = { 'long-runner': 'Long-runner', 'performer': 'Performer', 'testing': 'Testing', 'new': 'New' }[tier] || tier;
    const thumb = ad.thumbnail_url
      ? `<img src="${ad.thumbnail_url}" alt="" onerror="this.parentElement.innerHTML='<div class=ad-thumb-placeholder>&mdash;</div>'">`
      : '<div class="ad-thumb-placeholder">&mdash;</div>';

    return `
      <div class="ad-card">
        <div class="ad-thumb">
          ${thumb}
          <div class="ad-badges">
            <span class="ad-badge badge-${tier}">${tierLabel}</span>
            <span class="ad-badge">${ad.days_running || 0}d</span>
          </div>
        </div>
        <div class="ad-body">
          <div class="ad-page-name">${ad.page_name || ''}</div>
          <div class="ad-text">${esc(ad.ad_text || '').substring(0, 180)}</div>
          <div class="ad-meta">
            ${ad.display_format ? `<span>${ad.display_format}</span>` : ''}
            ${ad.angle ? `<span>${ad.angle}</span>` : ''}
            ${ad.spoken_hook_structure ? `<span>${ad.spoken_hook_structure}</span>` : ''}
          </div>
          <a href="https://www.facebook.com/ads/library/?id=${ad.ad_archive_id}" target="_blank" class="ad-link">Ver en Ad Library &rarr;</a>
        </div>
      </div>
    `;
  }).join('');
}

function filterCompAds(brand) {
  const s = (document.getElementById('search-comp-ads')?.value || '').toLowerCase();
  const t = document.getElementById('filter-tier-comp')?.value || '';
  let f = brand.top_100_competitor_ads;
  if (s) f = f.filter(a => (a.ad_text||'').toLowerCase().includes(s) || (a.page_name||'').toLowerCase().includes(s) || (a.angle||'').toLowerCase().includes(s));
  if (t) f = f.filter(a => a.longevity_tier === t);
  renderAdsGrid(f, 'comp-ads-grid');
}

// ============================================
// GUIONES
// ============================================
function renderScripts(slug) {
  const brand = DATA.brands.find(b => b.slug === slug);
  const content = document.getElementById('scripts-content');
  if (!brand) { content.innerHTML = ''; return; }

  document.getElementById('scripts-subtitle').textContent =
    `${brand.name} \u00B7 ${brand.templates.length} templates \u00B7 ${brand.templates.reduce((a, t) => a + (t.variations?.length || 0), 0)} variaciones`;

  if (!brand.templates.length) {
    content.innerHTML = '<div class="loading-state">Sin guiones generados. Usa el boton para crear.</div>';
    return;
  }

  content.innerHTML = brand.templates.map(t => {
    const varsHtml = (t.variations || []).map(v => {
      const hasScript = v.full_script && t.media_type === 'video';
      return `
        <div class="variation-card">
          <div class="variation-header">
            <span class="variation-label">Variacion ${v.variation_num}</span>
            <span class="variation-angle">${v.angle_variant || ''}</span>
          </div>
          <div class="variation-quick">
            <div><strong>Hook</strong> ${esc(v.hook || '')}</div>
            <div><strong>Body</strong> ${esc((v.body || '').substring(0, 400))}</div>
            <div><strong>CTA</strong> ${esc(v.cta || '')}</div>
          </div>
          ${hasScript ? `
            <button class="toggle-script" onclick="toggleScript(this)">Ver guion completo 40s &rarr;</button>
            <div class="variation-beats" style="display:none">
              <div class="scene-actions">
                <button class="btn-copy" onclick="copyScenes(this, 'seedance')">Copiar Seedance (dialogos)</button>
                <button class="btn-copy" onclick="copyScenes(this, 'kling')">Copiar Kling (B-Roll)</button>
                <button class="btn-copy" onclick="copyScenes(this, 'all')">Copiar todo</button>
              </div>
              <pre class="script-pre">${formatScript(v.full_script)}</pre>
            </div>
          ` : ''}
          ${v.notes ? `<div class="variation-notes">${esc(v.notes)}</div>` : ''}
        </div>
      `;
    }).join('');

    return `
      <div class="template-card">
        <div class="template-top">
          <span class="template-rank">${String(t.rank).padStart(2,'0')}</span>
          <div class="template-title">
            <h3>${t.format_type || ''}</h3>
            <div class="template-tags">
              <span>${t.angle || ''}</span>
              <span>${t.hook_structure || ''}</span>
              <span>${t.media_type === 'video' ? 'Video 40s' : 'Imagen'}</span>
            </div>
          </div>
          <div class="template-source">
            <strong>${t.source_page_name || ''}</strong>
            ${t.source_days_running || 0} dias corriendo
          </div>
        </div>

        ${t.reasoning ? `<div class="template-reasoning">${esc(t.reasoning)}</div>` : ''}

        ${t.source_ad_text ? `
          <div class="source-ad-original">
            <div class="source-ad-header">Texto original del competidor &mdash; ${esc(t.source_page_name || '')}</div>
            <div class="source-ad-body">${esc(t.source_ad_text)}</div>
          </div>
        ` : ''}

        ${t.hook_framework ? `<div style="font-size:14px;color:var(--text-mid);margin-bottom:24px;padding:12px 0;border-bottom:1px solid var(--line)"><strong style="font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-dim)">Framework</strong><br><code style="font-family:var(--mono);font-size:13px">${esc(t.hook_framework)}</code></div>` : ''}

        <div class="variations-container">${varsHtml}</div>
      </div>
    `;
  }).join('');

  // templates loaded
}

function toggleScript(btn) {
  const beats = btn.nextElementSibling;
  if (beats.style.display === 'none') {
    beats.style.display = 'block';
    btn.textContent = 'Ocultar guion \u2191';
    gsap.from(beats, { opacity: 0, y: 20, duration: 0.4 });
  } else {
    beats.style.display = 'none';
    btn.textContent = 'Ver guion completo 40s \u2192';
  }
}

// ============================================
// ADD BRAND FORM
// ============================================
function setupAddBrandForm() {
  const form = document.getElementById('add-brand-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd);
    const r = document.getElementById('add-brand-result');
    r.innerHTML = '<div class="tut-info">Disparando workflow...</div>';

    const token = prompt('GitHub Personal Access Token:');
    if (!token) { r.innerHTML = ''; return; }

    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/add-brand.yml/dispatches`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: 'main', inputs: payload }),
      });
      r.innerHTML = res.ok
        ? `<div class="tut-info">Workflow disparado. <a href="https://github.com/${GITHUB_REPO}/actions" target="_blank">Ver progreso &rarr;</a></div>`
        : `<div class="tut-info">Error: ${await res.text()}</div>`;
      if (res.ok) form.reset();
    } catch (e) { r.innerHTML = `<div class="tut-info">Error: ${e.message}</div>`; }
  });
}

// ============================================
// GENERATE SCRIPTS BUTTON
// ============================================
function setupGenerateScriptsBtn() {
  const btn = document.getElementById('generate-scripts-btn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const slug = document.getElementById('scripts-brand-select').value;
    if (!slug) { alert('Selecciona una marca'); return; }
    const token = prompt('GitHub Personal Access Token:');
    if (!token) return;
    btn.disabled = true; btn.textContent = 'Generando...';
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/generate-scripts.yml/dispatches`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: 'main', inputs: { brand_slug: slug } }),
      });
      alert(res.ok ? 'Workflow disparado. Recarga en ~5 min.' : 'Error: ' + await res.text());
    } catch (e) { alert('Error: ' + e.message); }
    finally { btn.disabled = false; btn.textContent = 'Generar 10 nuevos \u2192'; }
  });
}

// ============================================
// SCRIPT FORMATTING & COPY
// ============================================
function formatScript(raw) {
  if (!raw) return '';
  let text = esc(raw);
  // Colorear herramientas
  text = text.replace(/(HERRAMIENTA:\s*)(Seedance|Flow)/g, '$1<span class="tool-seedance">$2</span>');
  text = text.replace(/(HERRAMIENTA:\s*)(Kling\s*3\.?0?)/g, '$1<span class="tool-kling">$2</span>');
  text = text.replace(/(HERRAMIENTA:\s*)(Freepik)/g, '$1<span class="tool-freepik">$2</span>');
  // Resaltar headers de escena
  text = text.replace(/(ESCENA \d+ — [^\n]+)/g, '<span class="scene-header">$1</span>');
  // Resaltar labels
  text = text.replace(/(PROMPT VIDEO:)/g, '<span class="label-prompt">$1</span>');
  text = text.replace(/(DIALOGO:)/g, '<span class="label-dialog">$1</span>');
  text = text.replace(/(TEXTO PANTALLA:)/g, '<span class="label-text">$1</span>');
  text = text.replace(/(AUDIO:)/g, '<span class="label-audio">$1</span>');
  return text;
}

function copyScenes(btn, type) {
  const pre = btn.closest('.variation-beats').querySelector('.script-pre');
  const raw = pre.textContent;
  let toCopy = '';

  if (type === 'all') {
    toCopy = raw;
  } else if (type === 'seedance') {
    // Extraer solo escenas con Seedance/Flow
    const scenes = raw.split(/(?=ESCENA \d+)/);
    toCopy = scenes
      .filter(s => /HERRAMIENTA:\s*(Seedance|Flow)/i.test(s))
      .map(s => {
        const dialogMatch = s.match(/DIALOGO:\s*(.+?)(?=\n[A-Z]|\nESCENA|$)/s);
        const promptMatch = s.match(/PROMPT VIDEO:\s*(.+?)(?=\n[A-Z]|\nESCENA|$)/s);
        const headerMatch = s.match(/(ESCENA \d+ — [^\n]+)/);
        let out = headerMatch ? headerMatch[1] + '\n' : '';
        if (promptMatch) out += 'PROMPT: ' + promptMatch[1].trim() + '\n';
        if (dialogMatch) out += 'DIALOGO: ' + dialogMatch[1].trim() + '\n';
        return out;
      })
      .join('\n');
  } else if (type === 'kling') {
    const scenes = raw.split(/(?=ESCENA \d+)/);
    toCopy = scenes
      .filter(s => /HERRAMIENTA:\s*(Kling|Freepik)/i.test(s))
      .map(s => {
        const promptMatch = s.match(/PROMPT VIDEO:\s*(.+?)(?=\n[A-Z]|\nESCENA|$)/s);
        const headerMatch = s.match(/(ESCENA \d+ — [^\n]+)/);
        let out = headerMatch ? headerMatch[1] + '\n' : '';
        if (promptMatch) out += 'PROMPT: ' + promptMatch[1].trim() + '\n';
        return out;
      })
      .join('\n');
  }

  navigator.clipboard.writeText(toCopy).then(() => {
    const orig = btn.textContent;
    btn.textContent = 'Copiado!';
    btn.style.background = '#0f0f0f';
    btn.style.color = '#fff';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.style.color = ''; }, 2000);
  });
}

// ============================================
// HELPERS
// ============================================
function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
