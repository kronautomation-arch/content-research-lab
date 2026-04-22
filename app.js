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
        <div class="filter-select-wrap">
          <select id="filter-tier-comp">
            <option value="">Todos</option>
            <option value="long-runner">Long-runners</option>
            <option value="performer">Performers</option>
            <option value="winner">Ganador Probado (score≥60)</option>
            <option value="hook-viral">Hook Viral (3+ veces)</option>
          </select>
          <button class="legend-btn" id="legend-toggle" title="Qué significa cada filtro">ⓘ</button>
        </div>
      </div>
    </div>
    <div class="filter-legend" id="filter-legend" style="display:none">
      <div class="legend-grid">
        <div class="legend-item"><span class="legend-dot dot-lr"></span><strong>Long-runner</strong> — Activo 90+ días. La plataforma sigue pagando para mostrarlo = ROI probado.</div>
        <div class="legend-item"><span class="legend-dot dot-pf"></span><strong>Performer</strong> — Activo 30-89 días. Pasó la fase de prueba, está generando resultados.</div>
        <div class="legend-item"><span class="legend-dot dot-ws"></span><strong>Ganador Probado (score≥60)</strong> — Score compuesto: días corriendo (40pts) + hook frecuente (25pts) + ángulo top (20pts) + transcript (10pts) + tier (5pts).</div>
        <div class="legend-item"><span class="legend-dot dot-hv"></span><strong>Hook Viral</strong> — El mismo framework de hook aparece en 3+ ads ganadores de la competencia = patrón validado.</div>
      </div>
    </div>
    <div class="media-tabs">
      <button class="media-tab active" data-media="all">Todos</button>
      <button class="media-tab" data-media="video">Videos</button>
      <button class="media-tab" data-media="image">Imágenes</button>
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

  document.querySelectorAll('.media-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.media-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterCompAds(brand);
    });
  });

  const legendBtn = document.getElementById('legend-toggle');
  const legendPanel = document.getElementById('filter-legend');
  if (legendBtn && legendPanel) {
    legendBtn.addEventListener('click', () => {
      const visible = legendPanel.style.display !== 'none';
      legendPanel.style.display = visible ? 'none' : 'block';
      legendBtn.classList.toggle('active', !visible);
    });
  }
}

const _adMap = {};

function renderAdsGrid(ads, containerId) {
  const c = document.getElementById(containerId);
  if (!c || !ads.length) { if (c) c.innerHTML = '<div class="loading-state">Sin ads.</div>'; return; }

  ads.forEach(ad => { _adMap[ad.id] = ad; });

  c.innerHTML = ads.map(ad => {
    const tier = ad.longevity_tier || 'new';
    const tierLabel = { 'long-runner': 'Long-runner', 'performer': 'Performer', 'testing': 'Testing', 'new': 'New' }[tier] || tier;
    const isVideo = (ad.display_format||'').toLowerCase().includes('video');
    const initial = (ad.page_name||'?')[0].toUpperCase();
    let mediaEl = '';
    if (isVideo && ad.media_url) {
      const poster = ad.thumbnail_url ? ` poster="${ad.thumbnail_url}"` : '';
      mediaEl = `<video${poster} preload="none" controls class="ad-thumb-media"><source src="${ad.media_url}"></video>`;
    } else if (ad.thumbnail_url) {
      mediaEl = `<img src="${ad.thumbnail_url}" alt="" class="ad-thumb-media" onerror="this.style.display='none'">`;
    } else if (ad.media_url) {
      mediaEl = `<img src="${ad.media_url}" alt="" class="ad-thumb-media" onerror="this.style.display='none'">`;
    }

    return `
      <div class="ad-card">
        <div class="ad-thumb">
          <div class="ad-thumb-fallback">${initial}</div>
          ${mediaEl}
          <div class="ad-badges">
            <span class="ad-badge badge-${tier}">${tierLabel}</span>
            <span class="ad-badge">${ad.days_running || 0}d</span>
            ${(ad.winner_score || 0) >= 60 ? `<span class="ad-badge badge-winner">⚡ ${ad.winner_score}pts</span>` : ''}
          </div>
          ${ad.ad_archive_id && !isVideo ? `<a href="https://www.facebook.com/ads/library/?id=${ad.ad_archive_id}" target="_blank" class="ad-thumb-overlay-link" title="Ver en Ad Library"></a>` : ''}
        </div>
        <div class="ad-body">
          <div class="ad-page-name">${ad.page_name || ''}</div>
          <div class="ad-text">${esc(ad.ad_text || '').substring(0, 180)}</div>
          <div class="ad-meta">
            ${ad.display_format ? `<span>${ad.display_format}</span>` : ''}
            ${ad.angle ? `<span>${ad.angle}</span>` : ''}
            ${ad.spoken_hook_structure ? `<span>${ad.spoken_hook_structure}</span>` : ''}
          </div>
          <div class="ad-actions">
            <a href="https://www.facebook.com/ads/library/?id=${ad.ad_archive_id}" target="_blank" class="ad-link">Ver en Ad Library &rarr;</a>
            ${!isVideo ? `<button class="btn-recrear" onclick="openRecreateModal('${ad.id}')">🎨 Recrear</button>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterCompAds(brand) {
  const s = (document.getElementById('search-comp-ads')?.value || '').toLowerCase();
  const t = document.getElementById('filter-tier-comp')?.value || '';
  const media = document.querySelector('.media-tab.active')?.dataset.media || 'all';
  let f = brand.top_100_competitor_ads;
  if (s) f = f.filter(a => (a.ad_text||'').toLowerCase().includes(s) || (a.page_name||'').toLowerCase().includes(s) || (a.angle||'').toLowerCase().includes(s));
  if (t === 'winner') f = f.filter(a => (a.winner_score || 0) >= 60);
  else if (t === 'hook-viral') f = f.filter(a => (a.hook_frequency || 0) >= 3);
  else if (t) f = f.filter(a => a.longevity_tier === t);
  if (media === 'video') f = f.filter(a => (a.display_format||'').toLowerCase().includes('video'));
  else if (media === 'image') f = f.filter(a => !(a.display_format||'').toLowerCase().includes('video'));
  renderAdsGrid(f, 'comp-ads-grid');
}

// ============================================
// RECREAR AD CON CANVA
// ============================================
const API_URL = 'http://127.0.0.1:8000';

function openRecreateModal(adId) {
  const ad = _adMap[adId];
  if (!ad) return;
  const ownBrands = DATA.brands.filter(b => b.is_own_brand);
  const brandOptions = ownBrands.length
    ? ownBrands.map(b => `<option value="${b.slug}">${b.name}</option>`).join('')
    : '<option value="">— Sin marcas propias registradas —</option>';

  const tierLabel = { 'long-runner': 'Long-runner', 'performer': 'Performer', 'testing': 'Testing', 'new': 'New' }[ad.longevity_tier] || ad.longevity_tier || '';
  const thumb = ad.thumbnail_url
    ? `<img src="${ad.thumbnail_url}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" onerror="this.style.display='none'">`
    : '';

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'recreate-modal';
  modal.innerHTML = `
    <div class="modal-recrear">
      <div class="modal-header">
        <h3>🎨 Recrear con tu marca</h3>
        <button class="modal-close" onclick="document.getElementById('recreate-modal').remove()">✕</button>
      </div>
      <div class="modal-body" id="recreate-modal-body">

        <div class="modal-ref">
          <p class="modal-section-label">AD DE REFERENCIA</p>
          <div class="modal-ref-card">
            ${thumb ? `<div class="modal-thumb">${thumb}</div>` : ''}
            <div class="modal-ref-info">
              <div class="modal-ref-brand">${esc(ad.page_name || '')}</div>
              <div class="modal-ref-tags">
                <span class="ad-badge badge-${ad.longevity_tier || 'new'}">${tierLabel}</span>
                <span class="ad-badge">${ad.days_running || 0}d</span>
                ${(ad.winner_score || 0) >= 60 ? `<span class="ad-badge badge-winner">⚡ ${ad.winner_score}pts</span>` : ''}
              </div>
              ${ad.angle ? `<div class="modal-ref-meta">Ángulo: <strong>${esc(ad.angle)}</strong></div>` : ''}
              ${ad.spoken_hook_structure ? `<div class="modal-ref-meta">Hook: <strong>${esc(ad.spoken_hook_structure)}</strong></div>` : ''}
            </div>
          </div>
        </div>

        <div class="modal-form">
          <p class="modal-section-label">CONFIGURAR ADAPTACIÓN</p>
          <label class="modal-label">¿Para qué marca?
            <select id="recreate-brand-select" class="modal-select">${brandOptions}</select>
          </label>
          <label class="modal-label">URL de la imagen del producto
            <input type="url" id="recreate-image-url" class="modal-input" placeholder="https://... (foto del producto)">
          </label>
          <div class="competitor-img-section">
            <p class="modal-label-text">📸 Imagen del ad del competidor</p>
            <div id="competitor-img-preview" class="competitor-img-preview competitor-img-dropzone" tabindex="0"
                 title="Haz clic aquí y pega con Ctrl+V">
              <div class="competitor-paste-hint">
                <span class="paste-icon">📋</span>
                <strong>Ctrl+V para pegar screenshot</strong>
                <span>Toma captura de pantalla del ad y pega aquí</span>
                <span class="paste-or">— o —</span>
                <label class="paste-upload-btn">Seleccionar archivo
                  <input type="file" id="competitor-image-file" accept="image/*" style="display:none">
                </label>
              </div>
            </div>
            ${ad.ad_archive_id ? `<a href="https://www.facebook.com/ads/library/?id=${ad.ad_archive_id}" target="_blank" class="competitor-fb-link">Ver ad original en Facebook Ad Library →</a>` : ''}
          </div>
        </div>

        <div id="recreate-status"></div>

        <div class="recreate-btn-group">
          <button class="btn-generate-now" id="btn-generate-now" onclick="runRecreateFull('${ad.id}')">
            🎨 Recrear con mi marca
          </button>
          <button class="btn-copy-style" id="btn-copy-style" onclick="runCopyStyle('${ad.id}')">
            ⚡ Copiar Estilo Exacto
          </button>
        </div>
        <p class="recreate-modes-hint">
          <strong>Recrear con mi marca</strong>: copy adaptado + brief de diseño.<br>
          <strong>Copiar Estilo Exacto</strong>: IA replica el visual del ad con tu producto. Sube la imagen del competidor para mejor resultado.
        </p>

        <p class="modal-hint" id="server-hint" style="display:none">
          ⚠️ Servidor no detectado. Inícialo con: <code>run_api.bat</code> (o <code>python api.py</code>)
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

  // Verificar servidor
  fetch(`${API_URL}/health`).catch(() => {
    document.getElementById('server-hint').style.display = 'block';
  });

  // Inicializar zona de paste/upload del competidor
  _initCompetitorImageZone();
}

function _setCompetitorImage(blob) {
  const preview = document.getElementById('competitor-img-preview');
  if (!preview) return;
  const objectUrl = URL.createObjectURL(blob);
  const reader = new FileReader();
  reader.onload = () => { preview.dataset.b64 = reader.result.split(',')[1]; };
  reader.readAsDataURL(blob);
  preview.innerHTML = `
    <div style="position:relative;width:100%;">
      <img src="${objectUrl}" alt="Ad competidor" style="width:100%;border-radius:6px;display:block;">
      <button onclick="_clearCompetitorImage()" style="position:absolute;top:6px;right:6px;background:rgba(0,0,0,0.6);color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:14px;line-height:1;">✕</button>
    </div>`;
}

function _clearCompetitorImage() {
  const preview = document.getElementById('competitor-img-preview');
  if (!preview) return;
  delete preview.dataset.b64;
  preview.innerHTML = `
    <div class="competitor-paste-hint">
      <span class="paste-icon">📋</span>
      <strong>Ctrl+V para pegar screenshot</strong>
      <span>Toma captura de pantalla del ad y pega aquí</span>
      <span class="paste-or">— o —</span>
      <label class="paste-upload-btn">Seleccionar archivo
        <input type="file" id="competitor-image-file" accept="image/*" style="display:none" onchange="_onCompetitorFileChange(this)">
      </label>
    </div>`;
  _bindCompetitorFileInput();
}

function _onCompetitorFileChange(input) {
  if (input.files && input.files[0]) _setCompetitorImage(input.files[0]);
}

function _bindCompetitorFileInput() {
  const input = document.getElementById('competitor-image-file');
  if (input) input.addEventListener('change', () => _onCompetitorFileChange(input));
}

function _initCompetitorImageZone() {
  const preview = document.getElementById('competitor-img-preview');
  if (!preview) return;

  // Bind file input
  _bindCompetitorFileInput();

  // Paste handler (Ctrl+V en cualquier parte del modal)
  const pasteHandler = e => {
    if (!document.getElementById('recreate-modal')) {
      document.removeEventListener('paste', pasteHandler);
      return;
    }
    const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items || [];
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        _setCompetitorImage(item.getAsFile());
        // Flash visual para confirmar
        preview.style.outline = '2px solid var(--accent)';
        setTimeout(() => { preview.style.outline = ''; }, 800);
        break;
      }
    }
  };
  document.addEventListener('paste', pasteHandler);

  // Drag & drop
  preview.addEventListener('dragover', e => { e.preventDefault(); preview.classList.add('drag-over'); });
  preview.addEventListener('dragleave', () => preview.classList.remove('drag-over'));
  preview.addEventListener('drop', e => {
    e.preventDefault();
    preview.classList.remove('drag-over');
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) _setCompetitorImage(file);
  });
}

async function runRecreateFull(adId) {
  const brandSlug = document.getElementById('recreate-brand-select').value;
  const imageUrl = document.getElementById('recreate-image-url').value.trim();
  const statusEl = document.getElementById('recreate-status');
  const btn = document.getElementById('btn-generate-now');

  if (!imageUrl) {
    statusEl.innerHTML = '<p class="recreate-error">⚠️ Ingresa la URL de la imagen del producto.</p>';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Generando...';
  statusEl.innerHTML = `
    <div class="recreate-loading">
      <div class="recreate-spinner"></div>
      <span>Claude está analizando el ad y generando el copy...</span>
    </div>
  `;

  try {
    const res = await fetch(`${API_URL}/recreate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ad_id: adId,
        target_brand_slug: brandSlug,
        product_image_url: imageUrl,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error del servidor');
    }

    const data = await res.json();
    const b = data.brief;
    const db = b.design_brief || {};
    const canva = data.canva || {};

    const canvaSection = canva.available ? `
      <div class="recreate-canva-link">
        <p class="modal-section-label">SIGUIENTE PASO — CANVA</p>
        <div class="canva-actions">
          <a href="${canva.edit_url}" target="_blank" class="btn-open-canva">🎨 Crear diseño en Canva →</a>
          ${canva.asset_id ? `<a href="${canva.assets_url}" target="_blank" class="btn-open-assets">🖼️ Ver imagen subida</a>` : ''}
        </div>
        ${canva.asset_id
          ? `<p class="canva-asset-note">✓ Tu imagen del producto fue subida a Canva Assets. Encuéntrala en "Brand Library".</p>`
          : `<p class="canva-asset-note">Aplica el copy y brief de arriba al diseño.</p>`}
      </div>
    ` : `
      <div class="recreate-canva-link">
        <p class="canva-note">💡 Inicia el servidor local (<code>run_api.bat</code>) para subir la imagen a Canva automáticamente.</p>
      </div>
    `;

    statusEl.innerHTML = `
      <div class="recreate-result">
        <div class="result-section">
          <p class="modal-section-label">COPY GENERADO — ${data.target_brand.name}</p>
          <div class="copy-block">
            <div class="copy-row"><span class="copy-label">Headline</span><span class="copy-value">${esc(b.headline)}</span></div>
            <div class="copy-row"><span class="copy-label">Subtitular</span><span class="copy-value">${esc(b.subheadline)}</span></div>
            <div class="copy-row copy-body-row"><span class="copy-label">Body</span><span class="copy-value">${esc(b.body)}</span></div>
            <div class="copy-row"><span class="copy-label">CTA</span><span class="copy-value cta-val">${esc(b.cta)}</span></div>
          </div>
        </div>
        <div class="result-section">
          <p class="modal-section-label">BRIEF DE DISEÑO</p>
          <div class="brief-block">
            ${db.layout ? `<div class="brief-row"><span>Layout</span><span>${esc(db.layout)}</span></div>` : ''}
            ${db.color_suggestion ? `<div class="brief-row"><span>Colores</span><span>${esc(db.color_suggestion)}</span></div>` : ''}
            ${db.product_placement ? `<div class="brief-row"><span>Producto</span><span>${esc(db.product_placement)}</span></div>` : ''}
            ${db.style_notes ? `<div class="brief-row"><span>Estilo</span><span>${esc(db.style_notes)}</span></div>` : ''}
          </div>
        </div>
        ${canvaSection}
        <div class="result-hook">
          <p class="modal-section-label">HOOK ADAPTADO</p>
          <div class="hook-text">"${esc(b.hook_adapted)}"</div>
        </div>
      </div>
    `;
    btn.textContent = '✓ Generado';
  } catch (err) {
    statusEl.innerHTML = `<p class="recreate-error">❌ ${esc(err.message)}<br><small>¿Está corriendo el servidor? Ejecuta <code>run_api.bat</code></small></p>`;
    btn.disabled = false;
    btn.textContent = '✨ Generar Ahora';
  }
}

function _fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result es "data:image/jpeg;base64,XXXX" — extraer solo el base64
      const b64 = reader.result.split(',')[1];
      resolve(b64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function runCopyStyle(adId) {
  const brandSlug = document.getElementById('recreate-brand-select').value;
  const imageUrl = document.getElementById('recreate-image-url').value.trim();
  const fileInput = document.getElementById('competitor-image-file');
  const statusEl = document.getElementById('recreate-status');
  const btn = document.getElementById('btn-copy-style');
  const btn2 = document.getElementById('btn-generate-now');

  if (!imageUrl) {
    statusEl.innerHTML = '<p class="recreate-error">⚠️ Ingresa la URL de la imagen del producto.</p>';
    return;
  }

  // Leer imagen del competidor desde el preview (pegada, arrastrada o subida)
  let competitorB64 = '';
  const previewEl = document.getElementById('competitor-img-preview');
  if (previewEl && previewEl.dataset.b64) {
    competitorB64 = previewEl.dataset.b64;
  }

  btn.disabled = true; btn2.disabled = true;
  btn.textContent = 'Generando...';
  const modeMsg = competitorB64
    ? 'gpt-image-1 replica el estilo del competidor con tu producto...'
    : 'gpt-image-1 genera imagen con tu producto... (sube imagen del competidor para mejor resultado)';
  statusEl.innerHTML = `
    <div class="recreate-loading">
      <div class="recreate-spinner"></div>
      <span>${modeMsg} (~30 seg)</span>
    </div>`;

  try {
    const res = await fetch(`${API_URL}/recreate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ad_id: adId,
        target_brand_slug: brandSlug,
        product_image_url: imageUrl,
        competitor_image_b64: competitorB64,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error del servidor');
    }

    const data = await res.json();
    const b = data.brief;

    statusEl.innerHTML = `
      <div class="recreate-result">
        <div class="result-section">
          <p class="modal-section-label">IMAGEN GENERADA — ${esc(data.target_brand.name)}</p>
          <div class="generated-image-wrap">
            <img src="${data.generated_image_url}" alt="Ad generado" class="generated-ad-img">
            <a href="${data.generated_image_url}" download="ad-${adId}.png" target="_blank" class="btn-download-img">⬇ Descargar imagen</a>
          </div>
        </div>
        <div class="result-section">
          <p class="modal-section-label">COPY EN ESPAÑOL</p>
          <div class="copy-block">
            <div class="copy-row"><span class="copy-label">Headline</span><span class="copy-value">${esc(b.headline)}</span></div>
            <div class="copy-row"><span class="copy-label">Subtitular</span><span class="copy-value">${esc(b.subheadline)}</span></div>
            <div class="copy-row copy-body-row"><span class="copy-label">Body</span><span class="copy-value">${esc(b.body)}</span></div>
            <div class="copy-row"><span class="copy-label">CTA</span><span class="copy-value cta-val">${esc(b.cta)}</span></div>
          </div>
        </div>
        <div class="result-hook">
          <p class="modal-section-label">HOOK ADAPTADO</p>
          <div class="hook-text">"${esc(b.hook_adapted)}"</div>
        </div>
      </div>`;
    btn.textContent = '✓ Listo';
  } catch (err) {
    statusEl.innerHTML = `<p class="recreate-error">❌ ${esc(err.message)}</p>`;
    btn.disabled = false; btn2.disabled = false;
    btn.textContent = '⚡ Copiar Estilo Exacto';
  }
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
            ${(v.pain_points && v.pain_points.length) ? `
            <div class="pain-points-block">
              <strong>Puntos de dolor</strong>
              <ol class="pain-points-list">
                ${v.pain_points.map(p => `<li>${esc(p)}</li>`).join('')}
              </ol>
            </div>` : ''}
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
    const container = document.getElementById('scripts-content');
    btn.disabled = true;
    btn.textContent = 'Generando... (5-10 min)';
    if (container) container.innerHTML = `
      <div style="padding:40px;text-align:center;">
        <div class="recreate-spinner" style="width:32px;height:32px;margin:0 auto 16px"></div>
        <p style="color:var(--text-muted)">Claude está analizando <strong>${esc(slug)}</strong> y escribiendo 10 guiones con 3 variaciones cada uno.<br>Esto puede tardar 5-10 minutos. No cierres esta pestaña.</p>
      </div>`;
    try {
      const res = await fetch(`${API_URL}/pipeline/generate-scripts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_slug: slug }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Error del servidor'); }
      const data = await res.json();
      if (container) container.innerHTML = `
        <div style="padding:32px;">
          <p style="color:var(--accent);font-size:1.1rem;font-weight:600;">✓ ${data.templates_generated} guiones generados y publicados</p>
          <p style="color:var(--text-muted);margin-top:8px;">${esc(data.formula_summary || '')}</p>
          <p style="color:var(--text-muted);margin-top:8px;">Recarga la página en ~30 segundos para ver los guiones.</p>
          ${data.errors && data.errors.length ? `<p style="color:var(--error);margin-top:8px;">Advertencias: ${esc(data.errors.join(', '))}</p>` : ''}
        </div>`;
    } catch (e) {
      if (container) container.innerHTML = `<div style="padding:32px;"><p style="color:var(--error);">❌ ${esc(e.message)}</p><p style="color:var(--text-muted);margin-top:8px;">¿Está corriendo run_api.bat?</p></div>`;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Generar 10 nuevos →';
    }
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

// ============================================
// PIPELINE SETUP
// ============================================
let _pipeState = { brandSlug: '', keywords: [], candidates: [], brandName: '' };

document.addEventListener('DOMContentLoaded', () => {
  fetch(`${API_URL}/health`)
    .catch(() => {
      const w = document.getElementById('pipeline-server-warning');
      if (w) w.style.display = 'block';
    });
});

function _pipeUnlock(stepNum) {
  const el = document.getElementById(`step-${stepNum}`);
  if (el) el.classList.remove('locked');
}
function _pipeSetStatus(stepNum, text, ok) {
  const el = document.getElementById(`step-${stepNum}-status`);
  if (el) { el.textContent = text; el.className = 'step-status ' + (ok ? 'status-ok' : 'status-err'); }
}
function _pipeSetResult(stepNum, html) {
  const el = document.getElementById(`step-${stepNum}-result`);
  if (el) el.innerHTML = html;
}
function _pipeLoading(stepNum, msg) {
  _pipeSetResult(stepNum, `<div class="pipe-loading"><div class="recreate-spinner"></div><span>${esc(msg)}</span></div>`);
}

async function pipeStep0Create() {
  const name = document.getElementById('pipe-brand-name').value.trim();
  const slug = document.getElementById('pipe-brand-slug-create').value.trim().toLowerCase().replace(/\s+/g, '-');
  const niche = document.getElementById('pipe-brand-niche').value.trim();
  const country = document.getElementById('pipe-brand-country').value;
  if (!name || !slug) { _pipeSetResult(0, '<p class="pipe-error">Nombre y slug son obligatorios.</p>'); return; }
  _pipeLoading(0, 'Creando marca...');
  try {
    const r = await fetch(`${API_URL}/pipeline/create-brand`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, slug, niche, country }),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Error'); }
    const data = await r.json();
    _pipeState.brandSlug = slug;
    _pipeState.brandName = name;
    // Pre-fill paso 1
    const slugInput = document.getElementById('pipe-brand-slug');
    if (slugInput) slugInput.value = slug;
    _pipeSetStatus(0, '✓', true);
    _pipeSetResult(0, `<p class="pipe-ok">${data.created ? '✓ Marca creada' : '✓ Marca encontrada'}: <strong>${esc(data.brand.name)}</strong> (${esc(slug)}) · ${esc(country)}</p>`);
  } catch(e) {
    _pipeSetResult(0, `<p class="pipe-error">❌ ${esc(e.message)}</p>`);
  }
}

function pipeStep0Skip() {
  const slug = document.getElementById('pipe-brand-slug-create').value.trim().toLowerCase().replace(/\s+/g, '-');
  if (!slug) { _pipeSetResult(0, '<p class="pipe-error">Escribe el slug de la marca existente.</p>'); return; }
  _pipeState.brandSlug = slug;
  const slugInput = document.getElementById('pipe-brand-slug');
  if (slugInput) slugInput.value = slug;
  _pipeSetStatus(0, '✓ skip', true);
  _pipeSetResult(0, `<p class="pipe-ok">Usando marca existente: <strong>${esc(slug)}</strong></p>`);
}

async function pipeStep1Validate() {
  const slug = document.getElementById('pipe-brand-slug').value.trim() || _pipeState.brandSlug;
  const kw = document.getElementById('pipe-keywords').value.trim();
  if (!slug || !kw) { _pipeSetResult(1, '<p class="pipe-error">Completa brand slug y keywords.</p>'); return; }
  _pipeLoading(1, 'Verificando...');
  try {
    const r = await fetch(`${API_URL}/health`);
    if (!r.ok) throw new Error('Servidor no disponible');
    _pipeState.brandSlug = slug;
    _pipeState.keywords = kw.split(',').map(k => k.trim()).filter(Boolean);
    _pipeSetStatus(1, '✓', true);
    _pipeSetResult(1, `<p class="pipe-ok">Marca: <strong>${esc(slug)}</strong> · Keywords: <strong>${esc(_pipeState.keywords.join(', '))}</strong></p>`);
    _pipeUnlock(2);
  } catch(e) {
    _pipeSetResult(1, `<p class="pipe-error">❌ ${esc(e.message)} — ¿Está corriendo run_api.bat?</p>`);
  }
}

async function pipeStep2Skip() {
  if (!_pipeState.brandSlug) { _pipeSetResult(2, '<p class="pipe-error">Completa el paso 1 primero.</p>'); return; }
  _pipeLoading(2, 'Cargando competidores desde Supabase...');
  try {
    const r = await fetch(`${API_URL}/pipeline/competitors/${_pipeState.brandSlug}`);
    if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Error'); }
    const data = await r.json();
    if (!data.count) throw new Error('No hay competidores guardados para esta marca. Usa "Buscar competidores" primero.');
    _pipeSetStatus(2, '✓ skip', true);
    _pipeSetResult(2, `<p class="pipe-ok">✓ ${data.count} competidores ya en Supabase. Saltando descubrimiento.</p>`);
    // Mostrar en paso 3 como lista informativa
    const list = document.getElementById('candidates-list');
    if (list) {
      list.innerHTML = data.competitors.map(c => `
        <div class="pipe-log-line">✓ <strong>${esc(c.name || 'Competidor ' + c.facebook_page_id)}</strong> · ID: ${esc(c.facebook_page_id)}</div>
      `).join('');
    }
    document.getElementById('btn-skip-competitors').style.display = 'block';
    _pipeUnlock(3);
  } catch(e) {
    _pipeSetResult(2, `<p class="pipe-error">❌ ${esc(e.message)}</p>`);
  }
}

function pipeStep3Skip() {
  _pipeSetStatus(3, '✓ skip', true);
  _pipeSetResult(3, '<p class="pipe-ok">✓ Competidores confirmados en Supabase. Pasando al scrape.</p>');
  _pipeUnlock(4);
}

async function pipeStep2Discover() {
  if (!_pipeState.brandSlug) { _pipeSetResult(2, '<p class="pipe-error">Completa el paso 1 primero.</p>'); return; }
  _pipeLoading(2, 'Buscando competidores en Facebook Ad Library (puede tardar 2-5 min)...');
  try {
    const r = await fetch(`${API_URL}/pipeline/discover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_slug: _pipeState.brandSlug, keywords: _pipeState.keywords, max_ads_per_keyword: 200, min_candidates: 5 }),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Error'); }
    const data = await r.json();
    _pipeState.candidates = data.candidates;

    const logHtml = data.log.map(l => `<div class="pipe-log-line">${esc(l)}</div>`).join('');
    _pipeSetResult(2, `
      <div class="pipe-summary">
        Países buscados: <strong>${esc(data.countries_searched.join(' → '))}</strong> |
        Ads recolectados: <strong>${data.total_ads_scraped}</strong> |
        Candidatos encontrados: <strong>${data.candidates.length}</strong>
      </div>
      <details class="pipe-log"><summary>Ver log</summary>${logHtml}</details>
    `);
    _pipeSetStatus(2, '✓', true);

    // Mostrar candidatos en paso 3
    _renderCandidates(data.candidates);
    _pipeUnlock(3);
  } catch(e) {
    _pipeSetResult(2, `<p class="pipe-error">❌ ${esc(e.message)}</p>`);
    _pipeSetStatus(2, '✗', false);
  }
}

function _renderCandidates(candidates) {
  const list = document.getElementById('candidates-list');
  if (!list) return;
  if (!candidates.length) { list.innerHTML = '<p class="pipe-error">No se encontraron candidatos.</p>'; return; }
  list.innerHTML = candidates.map((c, i) => `
    <label class="candidate-row">
      <input type="checkbox" class="candidate-check" value="${esc(c.page_id)}" checked>
      <div class="candidate-info">
        <span class="candidate-name">${esc(c.name)}</span>
        <span class="candidate-stats">${c.ad_count} ads · ${c.long_runners} long-runners (90d+)</span>
        ${c.sample ? `<span class="candidate-sample">"${esc(c.sample.substring(0,100))}..."</span>` : ''}
      </div>
    </label>
  `).join('');
  document.getElementById('btn-add-competitors').style.display = 'block';
  _pipeSetResult(3, '<p class="pipe-hint">Desmarca los que NO sean competidores relevantes, luego haz clic en Agregar.</p>');
}

async function pipeStep3Add() {
  const checked = [...document.querySelectorAll('.candidate-check:checked')].map(el => el.value);
  if (!checked.length) { _pipeSetResult(3, '<p class="pipe-error">Selecciona al menos un competidor.</p>'); return; }
  _pipeLoading(3, `Agregando ${checked.length} competidores...`);
  // Guardar discovery tmp para el endpoint
  try {
    const r = await fetch(`${API_URL}/pipeline/add-competitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_slug: _pipeState.brandSlug, selected_page_ids: checked }),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Error'); }
    const data = await r.json();
    _pipeSetStatus(3, `✓ ${data.count}`, true);
    _pipeSetResult(3, `
      <p class="pipe-ok">✓ <strong>${data.count} competidores agregados</strong>: ${esc(data.added.join(', '))}</p>
      ${data.errors.length ? `<p class="pipe-error">Errores: ${esc(data.errors.join(', '))}</p>` : ''}
    `);
    _pipeUnlock(4);
  } catch(e) {
    _pipeSetResult(3, `<p class="pipe-error">❌ ${esc(e.message)}</p>`);
  }
}

async function pipeStep4Scrape() {
  _pipeLoading(4, 'Descargando ads de todos los competidores (puede tardar 5-15 min)...');
  try {
    const r = await fetch(`${API_URL}/pipeline/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_slug: _pipeState.brandSlug, max_ads: 50 }),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Error'); }
    const data = await r.json();
    const rows = data.results.map(r =>
      `<div class="pipe-log-line ${r.status === 'error' ? 'log-err' : ''}">
        ${r.status === 'ok' ? '✓' : r.status === 'skip' ? '—' : '✗'}
        <strong>${esc(r.competitor)}</strong>: ${r.status === 'ok' ? `${r.new} nuevos / ${r.found} encontrados` : esc(r.reason || r.error || '')}
      </div>`
    ).join('');
    _pipeSetStatus(4, `✓ ${data.total_new} ads`, true);
    _pipeSetResult(4, `
      <div class="pipe-summary">Total nuevos: <strong>${data.total_new}</strong> | Total encontrados: <strong>${data.total_found}</strong></div>
      <details class="pipe-log"><summary>Detalle por competidor</summary>${rows}</details>
    `);
    _pipeUnlock(5);
  } catch(e) {
    _pipeSetResult(4, `<p class="pipe-error">❌ ${esc(e.message)}</p>`);
    _pipeSetStatus(4, '✗', false);
  }
}

async function pipeStep5Classify() {
  _pipeLoading(5, 'Clasificando ads con Claude Haiku (angle, hook, format)...');
  try {
    const r = await fetch(`${API_URL}/pipeline/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_slug: _pipeState.brandSlug, limit: 999 }),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Error'); }
    const data = await r.json();
    _pipeSetStatus(5, `✓ ${data.classified}`, true);
    _pipeSetResult(5, `<p class="pipe-ok">✓ <strong>${data.classified} ads clasificados</strong> (${data.failed} fallaron)</p>`);
    _pipeUnlock(6);
  } catch(e) {
    _pipeSetResult(5, `<p class="pipe-error">❌ ${esc(e.message)}</p>`);
    _pipeSetStatus(5, '✗', false);
  }
}

async function pipeStep6Export() {
  _pipeLoading(6, 'Exportando dashboard.json y publicando en GitHub Pages...');
  try {
    const r = await fetch(`${API_URL}/pipeline/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Error'); }
    const data = await r.json();
    _pipeSetStatus(6, '✓', true);
    _pipeSetResult(6, `
      <p class="pipe-ok">✓ Dashboard publicado</p>
      <div class="pipe-summary">
        Marcas: <strong>${data.brands_exported}</strong> |
        Ads totales: <strong>${data.total_ads}</strong> |
        Archivo: <strong>${data.file_size_kb} KB</strong>
      </div>
      <p class="pipe-git">${esc(data.git)}</p>
      <p class="pipe-hint">Recarga el dashboard en 1-2 minutos para ver los nuevos datos.</p>
    `);
  } catch(e) {
    _pipeSetResult(6, `<p class="pipe-error">❌ ${esc(e.message)}</p>`);
    _pipeSetStatus(6, '✗', false);
  }
}

