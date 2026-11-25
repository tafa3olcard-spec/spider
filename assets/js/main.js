/* SPIDER — site runtime v3: content rendering + motion */
(async () => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = u => /^(https?:|mailto:|tel:|\/|#|data:image\/|uploads\/|assets\/)/i.test(String(u || '').trim()) ? String(u).trim() : '';
  const DRAFT_KEY = 'spider_content_draft';

  /* ================= CONTENT ================= */
  const merge = (base, over) => {
    if (Array.isArray(base) || typeof base !== 'object' || base === null) return over ?? base;
    const out = { ...base };
    for (const k in over) out[k] = (k in base) ? merge(base[k], over[k]) : over[k];
    return out;
  };
  const readDraft = () => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch { return null; } };
  let data = window.SPIDER_DEFAULT;
  const preview = new URLSearchParams(location.search).has('preview');
  let remote = null;
  if (!preview) {
    try { const r = await fetch('data/content.json', { cache: 'no-store' }); if (r.ok) remote = await r.json(); } catch {}
  }
  const draft = readDraft();
  if (preview && draft) data = merge(data, draft);
  else if (remote) data = merge(data, remote);
  else if (draft) data = merge(data, draft); // static hosting / demo mode
  const S = data.settings || {};

  const get = path => path.split('.').reduce((o, k) => o?.[k], data);
  $$('[data-c]').forEach(el => el.textContent = get(el.dataset.c) ?? '');

  // Section visibility
  Object.entries(data.sections || {}).forEach(([k, on]) => {
    const sec = document.getElementById(k);
    if (sec && !on) { sec.hidden = true; $$(`[data-sec="${k}"]`).forEach(a => a.hidden = true); }
  });

  // Marquee
  const mq = (data.stores?.categories || data.services || []).map(s => `<span>${esc(s.en)}</span>`).join('');
  $('#marquee').innerHTML = mq + mq;

  // About points
  $('#aboutPoints').innerHTML = (data.about.points || []).map(p => `<div class="point" data-up><b>${esc(p.title)}</b><span>${esc(p.en)}</span></div>`).join('');

  // Services
  $('#servicesList').innerHTML = (data.services || []).map((s, i) => `
    <li><span class="svc__no">${String(i + 1).padStart(2, '0')}</span>
      <h3>${esc(s.title)}<small class="svc__en">${esc(s.en)}</small></h3>
      <p>${esc(s.desc)}</p><span class="svc__arrow" aria-hidden="true"></span></li>`).join('');

  // Works
  const works = data.works || [];
  $('#track').innerHTML = works.map((w, i) => {
    const color = /^#[0-9a-f]{3,8}$/i.test(w.color || '') ? w.color : '#C9A86A';
    const url = safeUrl(w.url), img = safeUrl(w.image);
    let visual;
    if (w.mock && w.mock !== 'image' && $('#mock-' + w.mock)) visual = $('#mock-' + w.mock).innerHTML;
    else if (img) visual = `<div class="work__img"><img src="${esc(img)}" alt="${esc(w.name)} ${esc(w.name2)}" loading="lazy"></div>`;
    else visual = `<div class="work__ph">${esc(w.name)}</div>`;
    return `<article class="work" style="--pc:${color}" data-idx="${String(i + 1).padStart(2, '0')}">
      <div class="work__info">
        <div class="work__top"><i></i>Project ${String(i + 1).padStart(2, '0')}</div>
        <h3 class="work__name">${esc(w.name)}${w.name2 ? `<span>${esc(w.name2)}</span>` : ''}</h3>
        <p class="work__cat">${esc(w.category)}</p>
        <p class="work__desc">${esc(w.desc)}</p>
        <ul class="work__feat">${(w.features || []).map(f => `<li>${esc(f)}</li>`).join('')}</ul>
        ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener" class="btn btn--line magnetic"><span>زيارة المشروع</span><i class="arrow"></i></a>` : ''}
      </div>
      <div class="work__visual">${visual}</div>
    </article>`;
  }).join('');
  if (!works.length) $('#works').hidden = true;

  // Digital stores
  const st = data.stores || {};
  const CAT_IC = ['<path d="M8 22h40v18a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6Z"/><path d="M18 30h8M22 26v8"/><circle cx="36" cy="30" r="1.5"/><circle cx="40" cy="34" r="1.5"/>',
    '<rect x="6" y="14" width="44" height="30" rx="4"/><path d="M6 24h44M14 36h10"/>',
    '<circle cx="28" cy="28" r="20"/><path d="M28 16v12l8 6"/>',
    '<circle cx="18" cy="28" r="9"/><path d="M27 28h23M42 28v8M48 28v6"/>',
    '<path d="M10 44 L22 30 L32 38 L46 16"/><path d="M38 16h8v8"/>',
    '<rect x="16" y="6" width="24" height="44" rx="4"/><path d="M24 42h8M22 18h12M22 24h8"/>',
    '<rect x="6" y="12" width="44" height="32" rx="5"/><circle cx="20" cy="28" r="5"/><circle cx="27" cy="28" r="5"/><path d="M38 34h6"/>',
    '<path d="M28 8 L36 24 L28 48 L20 24 Z"/><path d="M20 24h16"/>'];
  $('#storeCats').innerHTML = (st.categories || []).map((c, i) => `<div class="cat" data-card><svg viewBox="0 0 56 56" aria-hidden="true">${CAT_IC[i % CAT_IC.length]}</svg><h4>${esc(c.title)}</h4><span>${esc(c.en)}</span><p>${esc(c.desc)}</p></div>`).join('');
  const ty = (st.storeTypes || []).map(t => `<span>${esc(t)}</span>`).join('');
  $('#storeTypes').innerHTML = ty + ty;
  const STEP_UI = [
    '<div class="ui ui--s"><div class="ui__in">yourstore<b>.com</b></div><div class="sw4"><i></i><i></i><i></i><i></i></div></div>',
    '<div class="ui ui--s"><div class="ui__in">API · مورّد جاهز <b>✓</b></div><div class="ui__tag">+10% Auto</div></div>',
    '<div class="ui ui--s"><div class="ui__in">طلب #10485 <b class="ok">تم التسليم</b></div><div class="ui__tag" dir="ltr">00:03</div></div>'];
  $('#storeSteps').innerHTML = (st.steps || []).map((s, i) => `<li data-card><span class="ssteps__n">${String(i + 1).padStart(2, '0')}</span>${STEP_UI[i] || ''}<b>${esc(s.title)}</b><p>${esc(s.desc)}</p></li>`).join('');
  $('#storeFeatures').innerHTML = (st.features || []).map(f => `<li><b>${esc(f.title)}</b><span>${esc(f.desc)}</span></li>`).join('');
  $('#storeAddons').innerHTML = (st.addons || []).map(a => `<div class="addon" data-card><i></i><b>${esc(a.title)}</b><p>${esc(a.desc)}</p></div>`).join('');
  // App / product tiles (live examples)
  const prods = st.products || [];
  const tile = (x, cls = 'app') => {
    const c = /^#[0-9a-f]{3,8}$/i.test(x.color || '') ? x.color : '#8C76FF';
    const ic = safeUrl(x.icon);
    return `<div class="${cls}__ic" style="--c:${c}">${ic ? `<img src="${esc(ic)}" alt="" loading="lazy">` : `<b>${esc((x.name || '?').trim().slice(0, 2))}</b>`}</div>`;
  };
  $('#storeApps').innerHTML = prods.map((x, i) => `<div class="app" style="--d:${(i % 6) * .4}s" title="${esc(x.name)}">${tile(x)}<span>${esc(x.name)}</span></div>`).join('');
  // demo storefront from categories
  const cats = (st.categories || []).slice(0, 4);
  $('#shopTabs').innerHTML = cats.map((c, i) => `<span class="${i ? '' : 'on'}">${esc(c.title)}</span>`).join('');
  $('#shopGrid').innerHTML = prods.length
    ? prods.slice(0, 6).map(x => `<div class="prod">${tile(x, 'prod')}<b>${esc(x.name)}</b><span>${esc(x.sub)}</span><em>شراء</em></div>`).join('')
    : (st.categories || []).slice(0, 6).map((c, i) => `<div class="prod"><div class="prod__img"><svg viewBox="0 0 56 56">${CAT_IC[i % CAT_IC.length]}</svg></div><b>${esc(c.en)}</b><span>${esc(c.title)}</span><em>شراء</em></div>`).join('');

  // Plans
  $('#plansGrid').innerHTML = (data.plans || []).map(p => `<div class="plan${p.featured ? ' plan--hot' : ''}" data-card>
    ${p.featured ? '<span class="plan__badge">الأكثر طلباً</span>' : ''}
    <h3>${esc(p.name)}</h3>
    <div class="plan__price"><b>${esc(p.price)}</b>${p.period ? `<small>${esc(p.period)}</small>` : ''}</div>
    <ul>${(p.features || []).map(f => `<li>${esc(f)}</li>`).join('')}</ul>
    <a href="#contact" class="btn ${p.featured ? 'btn--gold' : 'btn--line'} btn--block"><span>${esc(p.cta || 'تواصل معنا')}</span></a></div>`).join('');
  if (!(data.plans || []).length) $('#plans').hidden = true;

  // FAQ
  $('#faqList').innerHTML = (data.faq || []).map((f, i) => `<details class="qa"${i ? '' : ' open'}><summary>${esc(f.q)}<i></i></summary><p>${esc(f.a)}</p></details>`).join('');
  if (!(data.faq || []).length) $('#faq').hidden = true;

  // Section numbering follows visible order
  $$('main .section, main .works').filter(s => !s.hidden).forEach((s, i) => { const n = $('.label span', s); if (n) n.textContent = String(i + 1).padStart(2, '0'); });

  // Order flow demo loop
  (() => {
    const steps = $$('#orderFlow li'), timer = $('#orderTimer');
    if (!steps.length) return;
    let k = 0;
    const run = () => {
      steps.forEach((s, i) => s.className = i < k ? 'done' : i === k ? 'on' : '');
      timer.textContent = '00:0' + Math.min(9, k + 1);
      k = (k + 1) % (steps.length + 1);
      setTimeout(run, k === 0 ? 2200 : 1300);
    };
    reduce ? steps.forEach(s => s.className = 'done') : run();
  })();

  // Team
  const ICONS = {
    design: '<path d="M8 40 L40 8 L48 16 L16 48 Z"/><path d="M8 40 L4 52 L16 48"/><circle cx="44" cy="44" r="8"/>',
    front: '<rect x="4" y="8" width="48" height="36" rx="3"/><path d="M4 16h48M20 26l-6 6 6 6M36 26l6 6-6 6"/>',
    back: '<rect x="8" y="6" width="40" height="12" rx="2"/><rect x="8" y="22" width="40" height="12" rx="2"/><rect x="8" y="38" width="40" height="12" rx="2"/><path d="M14 12h4M14 28h4M14 44h4"/>',
    data: '<ellipse cx="28" cy="12" rx="20" ry="6"/><path d="M8 12v32c0 3.3 9 6 20 6s20-2.7 20-6V12M8 28c0 3.3 9 6 20 6s20-2.7 20-6"/>',
    qa: '<circle cx="28" cy="28" r="22"/><path d="M18 28l7 7 13-14"/>',
    ops: '<path d="M14 40a10 10 0 0 1 2-19.8A14 14 0 0 1 43 22a9 9 0 0 1-1 18Z"/><path d="M28 30v18M22 42l6 6 6-6"/>',
    pm: '<rect x="6" y="10" width="44" height="40" rx="3"/><path d="M6 20h44M18 4v12M38 4v12M16 32h8M16 40h20"/>',
    support: '<path d="M8 32v-6a20 20 0 0 1 40 0v6"/><rect x="4" y="30" width="10" height="14" rx="3"/><rect x="42" y="30" width="10" height="14" rx="3"/><path d="M47 44c0 6-8 8-15 8"/>',
    default: '<circle cx="28" cy="28" r="20"/><path d="M28 8v40M8 28h40"/>'
  };
  $('#teamGrid').innerHTML = (data.team || []).map((t, i) => `
    <div class="role" data-card><span class="role__no">${String(i + 1).padStart(2, '0')}</span>
      <div class="role__ic"><svg viewBox="0 0 56 56" aria-hidden="true">${ICONS[t.icon] || ICONS.default}</svg></div>
      <h3>${esc(t.title)}</h3><span>${esc(t.en)}</span></div>`).join('');

  // Process
  $('#processList').innerHTML = (data.process || []).map((p, i) => `
    <li class="step"><div class="step__dot">${String(i + 1).padStart(2, '0')}</div><h3>${esc(p.title)}</h3><span>${esc(p.en)}</span><p>${esc(p.desc)}</p></li>`).join('');
  if (data.process?.length) $('#processList').style.gridTemplateColumns = innerWidth > 960 ? `repeat(${data.process.length},1fr)` : '';

  // Why / Stack
  $('#whyList').innerHTML = (data.why || []).map(w => `<li>${esc(w)}</li>`).join('');
  const LOGOS = { laravel: 1, php: 1, javascript: 1, mysql: 1, html5: 1, css3: 1 };
  $('#stackList').innerHTML = (data.stack || []).map(t => {
    const key = t.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `<li>${LOGOS[key] ? `<img src="assets/img/tech/${key}.svg" alt="">` : ''}${esc(t)}</li>`;
  }).join('');

  // Contact
  $('#typeSelect').innerHTML = (data.contact.types || []).map(t => `<option>${esc(t)}</option>`).join('');
  const wa = S.whatsapp ? `https://wa.me/${String(S.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(S.whatsappMessage || '')}` : '';
  const lines = [];
  if (wa) lines.push(`<a href="${wa}" target="_blank" rel="noopener"><span>واتساب</span><small>WhatsApp</small></a>`);
  if (S.email) lines.push(`<a href="mailto:${esc(S.email)}"><span dir="ltr">${esc(S.email)}</span><small>Email</small></a>`);
  if (S.phone) lines.push(`<a href="tel:${esc(S.phone)}"><span dir="ltr">${esc(S.phone)}</span><small>Phone</small></a>`);
  if (S.address) lines.push(`<a><span>${esc(S.address)}</span><small>Office</small></a>`);
  $('#contactLines').innerHTML = lines.join('');
  const socialNames = { linkedin: 'LinkedIn', github: 'GitHub', x: 'X', instagram: 'Instagram', facebook: 'Facebook' };
  $('#socials').innerHTML = Object.entries(S.social || {}).filter(([, u]) => safeUrl(u)).map(([k, u]) => `<li><a href="${esc(safeUrl(u))}" target="_blank" rel="noopener">${socialNames[k] || esc(k)}</a></li>`).join('');
  const waf = $('#waFloat'); if (wa) waf.href = wa; else waf.remove();
  $('#year').textContent = new Date().getFullYear();

  // Hero stats
  $('#heroStats').innerHTML = (data.stats || []).map(x => `<div class="hstat"><b dir="ltr" data-count="${esc(x.value)}"${x.next ? ` data-next="${esc(x.next)}"` : ''}>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join('');
  // Count up from 0 when the stats come into view; optional bump to a next value (e.g. +10 → +11, turns green)
  (() => {
    const parse = raw => { const m = String(raw).match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)([^0-9]*)$/); return m && !String(raw).includes('/') ? { pre: m[1], n: parseFloat(m[2]), suf: m[3] } : null; };
    const els = $$('[data-count]');
    els.forEach(el => { const p = parse(el.dataset.count); if (p && !reduce) el.textContent = p.pre + '0' + p.suf; });
    const run = el => {
      const p = parse(el.dataset.count);
      const bump = () => {
        const nx = el.dataset.next; if (!nx) return;
        setTimeout(() => { el.classList.add('is-bump'); el.textContent = nx; }, reduce ? 0 : 900);
      };
      if (!p || reduce) { if (p) el.textContent = el.dataset.count; bump(); return; }
      const t0 = performance.now(), dur = 2000;
      const tick = now => {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = p.pre + Math.round(p.n * e) + p.suf;
        if (k < 1) requestAnimationFrame(tick); else bump();
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target); run(en.target);
    }), { threshold: .6 });
    const start = () => els.forEach(el => io.observe(el));
    // wait for the intro loader to finish so the count is actually seen
    const wait = () => window.__spiderIntroDone ? setTimeout(start, reduce ? 0 : 1400) : setTimeout(wait, 150);
    wait();
  })();

  // Ownership list + profit calculator
  $('#ownList').innerHTML = (data.profit?.own || []).map((o, i) => `<div class="own__i" data-up><i>${String(i + 1).padStart(2, '0')}</i><div><b>${esc(o.title)}</b><span>${esc(o.desc)}</span></div></div>`).join('');
  (() => {
    const o = $('#cOrders'), m = $('#cMargin');
    if (!o) return;
    const fmt = n => '$' + Math.round(n).toLocaleString('en-US');
    const calc = () => {
      const orders = +o.value, margin = +m.value, month = orders * margin * 30;
      $('#cOrdersV').textContent = orders.toLocaleString('en-US');
      $('#cMarginV').textContent = '$' + margin.toFixed(2);
      $('#cMonth').textContent = fmt(month); $('#cYear').textContent = fmt(month * 12);
      [o, m].forEach(r => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100) + '%'));
    };
    o.oninput = m.oninput = calc; calc();
  })();

  /* ================= TEXT SPLIT ================= */
  const splitWords = (el, mode) => {
    const out = [];
    const walk = (node, extra) => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            const prev = frag.lastChild?.firstChild;
            if (extra === 'gold' && prev && prev.classList?.contains('gold')) { prev.textContent += '\u00a0'; frag.append('\u200b'); }
            else frag.append(' ');
            return;
          }
          if (mode === 'w') {
            const w = document.createElement('span'); w.className = 'w';
            const i = document.createElement('i'); i.textContent = part; if (extra) i.className = extra;
            w.append(i); frag.append(w); out.push(i);
          } else { const s = document.createElement('span'); s.className = 'fw'; s.textContent = part; frag.append(s); out.push(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) {
        if (mode === 'w' && n.classList.contains('gold')) { walk(n, 'gold'); n.replaceWith(...n.childNodes); }
        else if (mode === 'w' && n.matches('[data-c]')) { walk(n, extra); n.replaceWith(...n.childNodes); }
        else walk(n, extra);
      }
    });
    walk(el);
    return out;
  };
  const splitMap = new Map($$('[data-split]').map(el => [el, splitWords(el, 'w')]));
  const fillWords = $$('[data-fill]').map(el => splitWords(el, 'f'));

  /* ================= NAV ================= */
  const nav = $('#nav'), burger = $('#burger'), menu = $('#navLinks');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 30);
    nav.classList.toggle('is-hidden', y > 500 && y > lastY + 2 && !menu.classList.contains('is-open'));
    if (y < lastY - 2) nav.classList.remove('is-hidden');
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const closeMenu = () => { menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => burger.setAttribute('aria-expanded', String(menu.classList.toggle('is-open'))));
  $$('a', menu).forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('keydown', e => e.key === 'Escape' && closeMenu());
  const navMap = new Map($$('a[href^="#"]', menu).map(a => [a.getAttribute('href').slice(1), a]));
  const secObs = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting && navMap.has(en.target.id)) { navMap.forEach(a => a.classList.remove('is-active')); navMap.get(en.target.id).classList.add('is-active'); }
  }), { rootMargin: '-45% 0px -50% 0px' });
  navMap.forEach((_, id) => { const el = document.getElementById(id); el && secObs.observe(el); });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = $(id); if (!t) return;
    e.preventDefault();
    scrollTo({ top: id === '#top' ? 0 : t.getBoundingClientRect().top + scrollY - 60, behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ================= CURSOR / MAGNETIC / TILT ================= */
  if (fine && !reduce) {
    const c = $('.cursor'), dot = $('.cursor i');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; }, { passive: true });
    (function loop() { cx += (x - cx) * .2; cy += (y - cy) * .2; dot.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', e => c.classList.toggle('is-hover', !!e.target.closest('a,button,.svc li,.role,.why__list li,.marquee span')));
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`; });
      el.addEventListener('mouseleave', () => { el.style.transition = 'transform .8s cubic-bezier(.19,1,.22,1)'; el.style.transform = ''; setTimeout(() => el.style.transition = '', 800); });
    });
    $$('.mock,.work__img').forEach(m => {
      m.addEventListener('mousemove', e => { const r = m.getBoundingClientRect(); m.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - .5) * 8}deg`); m.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - .5) * 6}deg`); });
      m.addEventListener('mouseleave', () => { m.style.setProperty('--ry', '0deg'); m.style.setProperty('--rx', '0deg'); });
    });
  }

  /* ================= HERO 3D: gold network sphere ================= */
  const hero3D = (() => {
    const host = $('#gl');
    if (!window.THREE || !host) return null;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { return null; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    host.append(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, .1, 100);
    camera.position.z = 11;
    const sprite = (() => {
      const c = document.createElement('canvas'); c.width = c.height = 64;
      const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.3, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
    })();
    const GOLD = new THREE.Color('#8C76FF'), IVORY = new THREE.Color('#EDE8DF');
    const root = new THREE.Group(); scene.add(root);

    // Fibonacci sphere nodes
    const N = 520, R = 3.6, pts = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * Math.PI * (3 - Math.sqrt(5));
      const jitter = 1 + (Math.sin(i * 12.9898) * 43758.5453 % 1) * .06;
      pts.push(new THREE.Vector3(Math.cos(th) * r * R * jitter, y * R * jitter, Math.sin(th) * r * R * jitter));
    }
    // connect nearest neighbours
    const edges = [];
    pts.forEach((p, i) => {
      const near = pts.map((q, j) => [j, p.distanceToSquared(q)]).filter(([j]) => j > i).sort((a, b) => a[1] - b[1]).slice(0, 3);
      near.forEach(([j, d]) => d < 1.1 && edges.push([i, j]));
    });
    const lp = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], k) => { lp.set([pts[a].x, pts[a].y, pts[a].z, pts[b].x, pts[b].y, pts[b].z], k * 6); });
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(lp, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: .22, blending: THREE.AdditiveBlending, depthWrite: false });
    const sphere = new THREE.Group(); root.add(sphere);
    sphere.add(new THREE.LineSegments(lg, lineMat));
    const pp = new Float32Array(N * 3); pts.forEach((p, i) => pp.set([p.x, p.y, p.z], i * 3));
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    const nodeMat = new THREE.PointsMaterial({ size: .09, map: sprite, color: IVORY, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false });
    sphere.add(new THREE.Points(pg, nodeMat));

    // Orbit rings
    const rings = [];
    [[4.6, .3, 0], [5.3, -.5, .6], [6.1, .9, -.3]].forEach(([r, rx, rz], k) => {
      const g = new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, r, r).getPoints(200).map(p => new THREE.Vector3(p.x, p.y, 0)));
      const ring = new THREE.LineLoop(g, new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: .16 - k * .03 }));
      ring.rotation.set(Math.PI / 2 + rx, 0, rz);
      const sat = new THREE.Sprite(new THREE.SpriteMaterial({ map: sprite, color: GOLD, transparent: true, blending: THREE.AdditiveBlending }));
      sat.scale.set(.35, .35, 1); ring.add(sat);
      root.add(ring); rings.push({ ring, sat, r, speed: .15 + k * .07, off: k * 2 });
    });

    // Signals travelling across edges
    const SN = 70, sigs = Array.from({ length: SN }, () => ({ e: (Math.random() * edges.length) | 0, t: Math.random(), v: .01 + Math.random() * .02 }));
    const sp = new Float32Array(SN * 3), sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    const sigMat = new THREE.PointsMaterial({ size: .22, map: sprite, color: new THREE.Color('#D9D2FF'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    sphere.add(new THREE.Points(sg, sigMat));

    // Dust
    const DN = 900, dp = new Float32Array(DN * 3);
    for (let i = 0; i < DN; i++) dp.set([(Math.random() - .5) * 40, (Math.random() - .5) * 26, -Math.random() * 20], i * 3);
    const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    const dust = new THREE.Points(dg, new THREE.PointsMaterial({ size: .05, map: sprite, color: GOLD, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(dust);

    const st = { intro: 0, scroll: 0, mx: 0, my: 0, tx: 0, ty: 0 };
    let visible = true;
    const resize = () => {
      const W = host.clientWidth, H = host.clientHeight;
      renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
      const m = W < 760; root.position.set(m ? 0 : -3.4, m ? 1.6 : .6, 0); root.userData.s = m ? .72 : 1;
    };
    resize(); addEventListener('resize', resize);
    addEventListener('pointermove', e => { st.tx = e.clientX / innerWidth - .5; st.ty = e.clientY / innerHeight - .5; }, { passive: true });
    new IntersectionObserver(([en]) => visible = en.isIntersecting).observe(host);
    const clock = new THREE.Clock();
    (function frame() {
      requestAnimationFrame(frame);
      if (!visible) return;
      const t = clock.getElapsedTime();
      st.mx += (st.tx - st.mx) * .04; st.my += (st.ty - st.my) * .04;
      const k = st.intro, s = st.scroll;
      root.scale.setScalar((root.userData.s || 1) * (.4 + k * .6) * (1 + s * .5));
      sphere.rotation.y = t * .07 + st.mx * .6 + s * 1.5;
      sphere.rotation.x = .25 + st.my * .4;
      lineMat.opacity = .22 * k * (1 - s * .6); nodeMat.opacity = .85 * k; sigMat.opacity = k;
      sigs.forEach((g, i) => {
        g.t += reduce ? 0 : g.v; if (g.t > 1) { g.t = 0; g.e = (Math.random() * edges.length) | 0; }
        const [a, b] = edges[g.e], A = pts[a], B = pts[b];
        sp.set([A.x + (B.x - A.x) * g.t, A.y + (B.y - A.y) * g.t, A.z + (B.z - A.z) * g.t], i * 3);
      });
      sg.attributes.position.needsUpdate = true;
      rings.forEach(o => { const a = t * o.speed + o.off; o.sat.position.set(Math.cos(a) * o.r, Math.sin(a) * o.r, 0); o.ring.material.opacity = (.16) * k; });
      root.rotation.z = st.mx * .1;
      dust.position.x = -st.mx * 1.2; dust.position.y = st.my * .8 + s * 3;
      camera.position.y = -s * 2;
      renderer.render(scene, camera);
    })();
    return st;
  })();

  /* ================= LOADER / INTRO ================= */
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  const loader = $('#loader');
  document.body.classList.add('is-loading');
  const intro = () => {
    document.body.classList.remove('is-loading');
    window.__spiderIntroDone = true;
    if (!hasGSAP || reduce) { loader.remove(); hero3D && (hero3D.intro = 1); initMotion(); return; }
    const tl = gsap.timeline();
    tl.to('.loader__inner', { yPercent: -40, opacity: 0, duration: .8, ease: 'power3.in' })
      .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'expo.inOut' }, '-=.3')
      .set(loader, { display: 'none' })
      .from(splitMap.get($('.hero__title')), { yPercent: 120, duration: 1.4, ease: 'expo.out', stagger: .07 }, '-=.6')
      .from('.hero__bottom', { opacity: 0, y: 30, duration: 1.2, ease: 'expo.out' }, '-=1')
      .from('[data-hero]', { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .1 }, '-=1.1')
      .from('.nav', { yPercent: -100, opacity: 0, duration: 1, ease: 'expo.out' }, '-=1.2')
      .from('.hero__index span', { x: -20, opacity: 0, stagger: .1, duration: .8 }, '-=.8');
    if (hero3D) gsap.to(hero3D, { intro: 1, duration: 3, ease: 'expo.out', delay: .9 });
    initMotion();
  };
  if (reduce) intro();
  else {
    const num = $('#loadNum'), bar = $('#loadBar');
    let p = 0, done = false; const t0 = performance.now();
    const ready = () => document.readyState === 'complete';
    (function tick() {
      const target = ready() ? 100 : Math.min(88, (performance.now() - t0) / 20);
      p += (target - p) * .08; if (target === 100 && p > 99.4) p = 100;
      num.textContent = String(Math.round(p)).padStart(3, '0'); bar.style.width = p + '%';
      if (p >= 100 && performance.now() - t0 > 1600) { if (!done) { done = true; intro(); } } else requestAnimationFrame(tick);
    })();
  }

  const liveObs = new IntersectionObserver(es => es.forEach(en => en.isIntersecting && en.target.classList.add('is-live')), { threshold: .3 });
  $$('.mock').forEach(m => liveObs.observe(m));

  /* ================= SCROLL CHOREOGRAPHY ================= */
  function initMotion() {
    if (!hasGSAP || reduce) { fillWords.forEach(ws => ws.forEach(w => w.classList.add('on'))); $$('.step').forEach(s => s.classList.add('on')); return; }

    if (hero3D) ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true, onUpdate: s => hero3D.scroll = s.progress });
    gsap.to('.hero__content', { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: true } });

    splitMap.forEach((words, el) => {
      if (el.classList.contains('hero__title')) return;
      gsap.from(words, { yPercent: 120, duration: 1.3, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: el, start: 'top 85%' } });
    });
    $$('.label').forEach(l => gsap.from(l, { opacity: 0, x: 30, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: l, start: 'top 90%' } }));
    $$('[data-up]').forEach(el => gsap.from(el, { y: 60, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));

    // Marquee with scroll velocity
    const loop = gsap.to('#marquee', { xPercent: -50, duration: 40, ease: 'none', repeat: -1 });
    ScrollTrigger.create({ onUpdate: s => {
      const v = Math.min(5, 1 + Math.abs(s.getVelocity()) / 400);
      gsap.to(loop, { timeScale: s.direction * v, duration: .25, overwrite: true });
      gsap.to(loop, { timeScale: s.direction, duration: 1.4, delay: .25 });
    } });
    gsap.fromTo('.marquee', { skewY: 0 }, { skewY: -2, ease: 'none', scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: true } });

    fillWords.forEach(ws => ScrollTrigger.create({
      trigger: ws[0].closest('[data-fill]'), start: 'top 78%', end: 'bottom 45%', scrub: true,
      onUpdate: s => { const n = Math.round(s.progress * ws.length); ws.forEach((w, i) => w.classList.toggle('on', i < n)); }
    }));

    gsap.from('.svc li', { y: 70, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: '.svc', start: 'top 85%' } });

    // Works — pinned horizontal (desktop)
    const mm = gsap.matchMedia();
    mm.add('(min-width: 961px)', () => {
      const tr = $('#track'), panels = $$('.work', tr);
      if (panels.length < 2) return;
      const dist = () => tr.scrollWidth - innerWidth;
      const shown = new Set();
      const reveal = i => {
        if (shown.has(i) || !panels[i]) return; shown.add(i);
        const p = panels[i], v = p.querySelector('.work__visual');
        gsap.fromTo(p.querySelector('.work__info').children, { x: 160, opacity: 0 }, { x: 0, opacity: 1, duration: 1.3, ease: 'expo.out', stagger: .07 });
        gsap.fromTo(v, { scale: .8, rotateY: 30, opacity: 0, clipPath: 'inset(0 0 0 100%)' }, { scale: 1, rotateY: 0, opacity: 1, clipPath: 'inset(0 0 0 0%)', duration: 1.6, ease: 'expo.out', delay: .1, onComplete: () => v.querySelector('.mock')?.classList.add('is-live') });
      };
      panels.forEach(p => gsap.set([...p.querySelector('.work__info').children, p.querySelector('.work__visual')], { opacity: 0 }));
      gsap.to(tr, { x: dist, ease: 'none', scrollTrigger: {
        trigger: '#hscroll', start: 'top top', end: () => '+=' + dist() * 1.1, pin: true, scrub: 1.2, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: s => panels.forEach((_, i) => s.progress >= (i - .45) / (panels.length - 1) && reveal(i))
      } });
      ScrollTrigger.create({ trigger: '#hscroll', start: 'top 65%', onEnter: () => reveal(0) });
      return () => panels.forEach(p => gsap.set([...p.querySelector('.work__info').children, p.querySelector('.work__visual')], { clearProps: 'all' }));
    });
    mm.add('(max-width: 960px)', () => {
      $$('.work').forEach(p => {
        gsap.from(p.querySelector('.work__name'), { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 80%' } });
        gsap.from(p.querySelector('.work__visual'), { y: 100, scale: .92, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: p.querySelector('.work__visual'), start: 'top 92%' } });
      });
    });

    // Stores
    gsap.from('.cat', { y: 80, opacity: 0, rotateX: -30, transformOrigin: '50% 100%', duration: 1.3, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: '.cats', start: 'top 85%' } });
    gsap.from('.sdemo__store', { x: -120, opacity: 0, rotateY: 20, duration: 1.5, ease: 'expo.out', scrollTrigger: { trigger: '.sdemo', start: 'top 80%' } });
    gsap.from('.app', { y: 40, scale: .6, opacity: 0, duration: 1, ease: 'back.out(1.7)', stagger: { each: .04, from: 'random' }, scrollTrigger: { trigger: '.apps', start: 'top 88%' } });
    gsap.from('.wcard', { y: 80, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.wcards', start: 'top 85%' } });
    gsap.from('.ssteps li, .sfeat li', { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: '.ssteps', start: 'top 85%' } });
    gsap.from('.addon', { scale: .85, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: '.addons', start: 'top 85%' } });
    gsap.to('#storeTypes', { xPercent: -50, duration: 30, ease: 'none', repeat: -1 });
    gsap.from('.own__i', { x: 60, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '.own', start: 'top 85%' } });
    gsap.from('.plan', { y: 90, opacity: 0, duration: 1.3, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.plans__grid', start: 'top 85%' } });
    gsap.from('.qa', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: '.faq__list', start: 'top 85%' } });

    // Team: tiles flip in
    gsap.from('.role', { opacity: 0, rotateY: -60, transformOrigin: '100% 50%', duration: 1.4, ease: 'expo.out', stagger: { each: .08, grid: 'auto' }, scrollTrigger: { trigger: '.team__grid', start: 'top 82%' } });

    // Process: line draws and steps light up
    const steps = $$('.step');
    ScrollTrigger.create({ trigger: '.process__wrap', start: 'top 70%', end: 'bottom 50%', scrub: true,
      onUpdate: s => { $('#processLine').style.transform = `scaleX(${s.progress})`; steps.forEach((st, i) => st.classList.toggle('on', s.progress >= i / Math.max(1, steps.length - 1) - .02)); } });
    gsap.from(steps, { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.process__list', start: 'top 85%' } });

    gsap.from('.why__list li', { x: -60, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '.why__list', start: 'top 85%' } });
    gsap.from('.stack__list li', { y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: .05, scrollTrigger: { trigger: '.stack__list', start: 'top 88%' } });
    gsap.from('.footer__big', { yPercent: 60, opacity: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: '.footer', start: 'top 85%' } });

    addEventListener('load', () => ScrollTrigger.refresh());
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }

  /* ================= CONTACT FORM ================= */
  const form = $('#contactForm'), status = $('#formStatus');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.className = 'form__status'; status.textContent = '';
    let ok = true;
    $$('[required]', form).forEach(f => {
      const bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      f.closest('.field').classList.toggle('is-invalid', bad); if (bad) ok = false;
    });
    if (!ok) { status.classList.add('err'); status.textContent = 'يرجى تعبئة الحقول المطلوبة بشكل صحيح.'; return; }
    const body = Object.fromEntries(new FormData(form));
    const btn = $('button[type=submit]', form); btn.disabled = true;
    try {
      const res = await fetch(S.formEndpoint || 'contact.php', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.ok === false) throw 0;
      form.reset(); status.classList.add('ok'); status.textContent = 'تم استلام طلبك، سيتواصل معك فريق SPIDER قريباً.';
    } catch {
      status.classList.add('err'); status.textContent = 'تعذّر الإرسال حالياً. يمكنك إرسال الطلب عبر واتساب.';
      if (S.whatsapp) {
        const msg = `طلب مشروع:\nالاسم: ${body.name}\nالشركة: ${body.company}\nالبريد: ${body.email}\nالهاتف: ${body.phone}\nالنوع: ${body.type}\n${body.details}`;
        const a = document.createElement('a'); a.href = `https://wa.me/${String(S.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
        a.target = '_blank'; a.rel = 'noopener'; a.textContent = ' فتح واتساب'; a.style.cssText = 'color:#8C76FF;font-weight:600';
        status.append(a);
      }
    } finally { btn.disabled = false; }
  });
  $$('input,textarea', form).forEach(f => f.addEventListener('input', () => f.closest('.field')?.classList.remove('is-invalid')));
})();
