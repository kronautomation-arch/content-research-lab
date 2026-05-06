/**
 * Kronautomation — Simple admin auth (cliente)
 *
 * Login hardcoded para acceso interno (hub + research).
 * NO es seguridad robusta — las credenciales están en el JS público.
 * Solo evita acceso casual y proporciona UX de login.
 *
 * Uso:
 *   <script src="simple-auth.js"></script>
 *   <script>requireAdminAuth();</script>
 *
 * Credenciales: admin / Kron#1987
 * Sesión: 30 días en localStorage
 */
(function () {
  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'Kron#1987';
  const STORAGE_KEY = 'kron_admin_session';
  const SESSION_DAYS = 30;

  function isAdminLoggedIn() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (!data.expires || Date.now() > data.expires) {
        localStorage.removeItem(STORAGE_KEY);
        return false;
      }
      return data.user === ADMIN_USER;
    } catch {
      return false;
    }
  }

  function adminSignIn(user, pass) {
    if (user !== ADMIN_USER || pass !== ADMIN_PASS) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: ADMIN_USER,
      expires: Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
    }));
    return true;
  }

  function adminSignOut() {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }

  function mountAdminLoginOverlay({ onSuccess } = {}) {
    if (isAdminLoggedIn()) {
      if (onSuccess) onSuccess();
      return;
    }
    document.documentElement.style.visibility = 'hidden';
    const ready = () => {
      document.documentElement.style.visibility = 'visible';
      injectOverlay({ onSuccess });
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ready);
    } else {
      ready();
    }
  }

  function injectOverlay({ onSuccess }) {
    if (document.getElementById('kron-admin-overlay')) return;
    const o = document.createElement('div');
    o.id = 'kron-admin-overlay';
    o.innerHTML = `
      <canvas id="kron-net-canvas"></canvas>
      <div class="kron-overlay-card">
        <div class="kron-brand">
          <div class="kron-brand-mark">K</div>
          <div class="kron-brand-name">Kronautomation</div>
          <div class="kron-brand-tag">● ADMIN</div>
        </div>
        <h1 class="kron-h1">Acceso interno</h1>
        <p class="kron-sub">Plataforma de automatización para marcas</p>
        <form class="kron-form" id="kron-admin-form" autocomplete="off">
          <div class="kron-field">
            <label>Usuario</label>
            <input type="text" id="kron-admin-user" autocomplete="off" placeholder="admin" />
          </div>
          <div class="kron-field">
            <label>Contraseña</label>
            <input type="password" id="kron-admin-pass" autocomplete="off" placeholder="••••••••" />
          </div>
          <button type="submit" class="kron-btn">
            <span class="kron-btn-arrow">→</span> Entrar
          </button>
          <div class="kron-err" id="kron-admin-err"></div>
        </form>
      </div>
    `;
    document.body.appendChild(o);
    injectStyles();
    startCanvasAnimation();

    const form = document.getElementById('kron-admin-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('kron-admin-user').value.trim();
      const p = document.getElementById('kron-admin-pass').value;
      const err = document.getElementById('kron-admin-err');
      if (adminSignIn(u, p)) {
        o.classList.add('kron-out');
        setTimeout(() => {
          o.remove();
          stopCanvasAnimation();
          if (onSuccess) onSuccess();
        }, 380);
      } else {
        err.textContent = 'Credenciales incorrectas';
        err.classList.add('kron-shake');
        setTimeout(() => err.classList.remove('kron-shake'), 400);
      }
    });

    setTimeout(() => document.getElementById('kron-admin-user').focus(), 250);
  }

  function injectStyles() {
    if (document.getElementById('kron-admin-styles')) return;
    const s = document.createElement('style');
    s.id = 'kron-admin-styles';
    s.textContent = `
      #kron-admin-overlay {
        position: fixed; inset: 0; z-index: 99999;
        background: #050816;
        display: flex; align-items: center; justify-content: center;
        font-family: -apple-system, 'SF Pro Display', BlinkMacSystemFont, 'Segoe UI', sans-serif;
        animation: kronFadeIn .35s ease;
      }
      #kron-admin-overlay.kron-out { animation: kronFadeOut .35s ease forwards; }
      @keyframes kronFadeIn  { from { opacity: 0 } to { opacity: 1 } }
      @keyframes kronFadeOut { from { opacity: 1 } to { opacity: 0 } }

      #kron-net-canvas {
        position: absolute; inset: 0; width: 100%; height: 100%;
        pointer-events: none;
      }

      .kron-overlay-card {
        position: relative; z-index: 1;
        width: 100%; max-width: 420px; margin: 20px;
        padding: 36px 32px 30px;
        background: rgba(13, 17, 32, 0.85);
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 22px;
        backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
        box-shadow: 0 30px 80px rgba(0,0,0,.6),
                    0 0 0 1px rgba(124,58,237,.12) inset;
      }

      .kron-brand {
        display: flex; align-items: center; gap: 10px; justify-content: center;
        margin-bottom: 26px;
      }
      .kron-brand-mark {
        width: 36px; height: 36px; border-radius: 11px;
        background: linear-gradient(135deg, #7c3aed, #a855f7);
        display: flex; align-items: center; justify-content: center;
        font-size: 17px; font-weight: 900; color: #fff;
        box-shadow: 0 6px 20px rgba(124,58,237,.5),
                    0 0 0 4px rgba(124,58,237,.08);
        animation: kronPulseMark 2.6s ease-in-out infinite;
      }
      @keyframes kronPulseMark {
        0%,100% { box-shadow: 0 6px 20px rgba(124,58,237,.5), 0 0 0 4px rgba(124,58,237,.08); }
        50%     { box-shadow: 0 6px 24px rgba(168,85,247,.65), 0 0 0 8px rgba(168,85,247,.10); }
      }
      .kron-brand-name {
        font-size: 14px; font-weight: 700; letter-spacing: .3px; color: #f1f5f9;
      }
      .kron-brand-tag {
        font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 6px;
        background: rgba(34,211,153,.14); color: #34d399;
        border: 1px solid rgba(34,211,153,.25);
        letter-spacing: .6px;
      }

      .kron-h1 {
        font-size: 24px; font-weight: 800; letter-spacing: -.6px;
        text-align: center; color: #f1f5f9; margin: 0 0 6px;
      }
      .kron-sub {
        font-size: 12px; color: #94a3b8; text-align: center;
        margin: 0 0 24px;
      }

      .kron-form { display: flex; flex-direction: column; gap: 12px; }
      .kron-field { display: flex; flex-direction: column; gap: 6px; }
      .kron-field label {
        font-size: 10px; font-weight: 700; color: #94a3b8;
        letter-spacing: .5px; text-transform: uppercase;
      }
      .kron-field input {
        width: 100%; padding: 12px 14px;
        background: rgba(255,255,255,.04);
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 10px;
        color: #f1f5f9; font-size: 14px; font-weight: 500;
        font-family: inherit; outline: none;
        transition: border-color .15s, background .15s, box-shadow .15s;
      }
      .kron-field input::placeholder { color: #475569; }
      .kron-field input:focus {
        background: rgba(255,255,255,.07);
        border-color: #7c3aed;
        box-shadow: 0 0 0 3px rgba(124,58,237,.18);
      }

      .kron-btn {
        margin-top: 4px; padding: 13px;
        background: linear-gradient(135deg, #7c3aed, #a855f7);
        color: #fff; border: none; border-radius: 11px;
        font-size: 14px; font-weight: 700; font-family: inherit;
        cursor: pointer; letter-spacing: .2px;
        display: flex; align-items: center; justify-content: center; gap: 6px;
        box-shadow: 0 8px 22px rgba(124,58,237,.35);
        transition: transform .12s, box-shadow .15s;
      }
      .kron-btn:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(168,85,247,.45); }
      .kron-btn:active { transform: scale(.98); }
      .kron-btn-arrow { transition: transform .15s; display: inline-block; }
      .kron-btn:hover .kron-btn-arrow { transform: translateX(2px); }

      .kron-err {
        margin-top: 6px; min-height: 18px;
        padding: 0 4px;
        font-size: 12px; font-weight: 600; color: #fb7185; text-align: center;
      }
      .kron-shake { animation: kronShake .35s; }
      @keyframes kronShake {
        0%,100% { transform: translateX(0); }
        25%     { transform: translateX(-4px); }
        75%     { transform: translateX(4px); }
      }

      /* Mobile */
      @media (max-width: 480px) {
        .kron-overlay-card { padding: 28px 22px 24px; border-radius: 18px; }
        .kron-h1 { font-size: 20px; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ─── Canvas: red de nodos conectándose ─── */
  let _animFrame = null;
  let _canvas = null;
  function startCanvasAnimation() {
    _canvas = document.getElementById('kron-net-canvas');
    if (!_canvas) return;
    const ctx = _canvas.getContext('2d');
    let W = 0, H = 0, dpr = window.devicePixelRatio || 1;

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      _canvas.width = W * dpr; _canvas.height = H * dpr;
      _canvas.style.width = W + 'px'; _canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const NODE_COUNT = Math.min(70, Math.floor((W * H) / 20000));
    const LINK_DIST = Math.min(160, Math.max(110, W / 12));
    const MOUSE_DIST = 200;
    const nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1.4 + Math.random() * 1.4,
      });
    }

    /* Pulsos viajando por las líneas (cada cierto tiempo se dispara uno) */
    const pulses = [];
    function spawnPulse() {
      const pairs = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx*dx + dy*dy;
          if (d2 < LINK_DIST*LINK_DIST) pairs.push([i, j, Math.sqrt(d2)]);
        }
      }
      if (!pairs.length) return;
      const [a, b] = pairs[Math.floor(Math.random() * pairs.length)];
      pulses.push({ from: a, to: b, t: 0, speed: 0.018 + Math.random() * 0.015 });
    }
    let pulseTimer = 0;

    let mouseX = -9999, mouseY = -9999;
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
    window.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

    function step() {
      ctx.clearRect(0, 0, W, H);

      // background gradient soft
      const grd = ctx.createRadialGradient(W/2, H/2, 50, W/2, H/2, Math.max(W, H) * 0.7);
      grd.addColorStop(0, 'rgba(124,58,237,0.06)');
      grd.addColorStop(1, 'rgba(5,8,22,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // mover nodos
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        // repulsión suave del mouse
        const dx = n.x - mouseX, dy = n.y - mouseY;
        const d2 = dx*dx + dy*dy;
        if (d2 < MOUSE_DIST * MOUSE_DIST) {
          const f = (1 - Math.sqrt(d2) / MOUSE_DIST) * 0.04;
          n.x += dx * f; n.y += dy * f;
        }
      }

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx*dx + dy*dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.32;
            ctx.strokeStyle = `rgba(168,85,247,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // pulses
      pulseTimer++;
      if (pulseTimer > 30) { spawnPulse(); pulseTimer = 0; }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.speed;
        if (p.t > 1) { pulses.splice(i, 1); continue; }
        const a = nodes[p.from], b = nodes[p.to];
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const trail = ctx.createRadialGradient(x, y, 0, x, y, 14);
        trail.addColorStop(0, 'rgba(96,165,250,0.85)');
        trail.addColorStop(1, 'rgba(96,165,250,0)');
        ctx.fillStyle = trail;
        ctx.beginPath();
        ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      // nodes
      for (const n of nodes) {
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        grd.addColorStop(0, 'rgba(168,85,247,0.95)');
        grd.addColorStop(0.5, 'rgba(124,58,237,0.4)');
        grd.addColorStop(1, 'rgba(124,58,237,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e9d5ff';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      _animFrame = requestAnimationFrame(step);
    }
    step();
  }
  function stopCanvasAnimation() {
    if (_animFrame) { cancelAnimationFrame(_animFrame); _animFrame = null; }
  }

  // expose
  window.kronAdmin = {
    isLoggedIn: isAdminLoggedIn,
    signIn:     adminSignIn,
    signOut:    adminSignOut,
    requireAuth: mountAdminLoginOverlay,
  };
  window.requireAdminAuth = mountAdminLoginOverlay;
})();
