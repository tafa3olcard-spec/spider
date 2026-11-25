/* SPIDER Admin — content manager */
(async () => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  const DRAFT_KEY = 'spider_content_draft';
  const API = '../api/index.php';
  const DEF = window.SPIDER_DEFAULT;

  let mode = 'demo', csrf = null, content, dirty = false, messages = [];

  const merge = (base, over) => {
    if (Array.isArray(base) || typeof base !== 'object' || base === null) return over ?? base;
    const out = { ...base }; for (const k in over) out[k] = (k in base) ? merge(base[k], over[k]) : over[k]; return out;
  };
  const toast = (t, err) => { const el = $('#toast'); el.textContent = t; el.classList.toggle('err', !!err); el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2600); };
  const api = async (action, body, isForm) => {
    const r = await fetch(`${API}?action=${action}`, { method: body ? 'POST' : 'GET', credentials: 'same-origin',
      headers: { ...(isForm ? {} : { 'Content-Type': 'application/json' }), ...(csrf ? { 'X-CSRF': csrf } : {}) },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined });
    const j = await r.json().catch(() => ({ ok: false }));
    if (r.status === 401 && action !== 'login') { showLogin(); throw new Error('auth'); }
    return j;
  };
  const get = (path) => path.split('.').reduce((o, k) => o?.[k], content);
  const set = (path, v) => { const ks = path.split('.'); const last = ks.pop(); const o = ks.reduce((o, k) => (o[k] ??= {}), content); o[last] = v; markDirty(); };
  const markDirty = () => { dirty = true; $('#dirty').hidden = false; try { localStorage.setItem(DRAFT_KEY, JSON.stringify(content)); } catch {} };


  function showLogin() {
    $('#app').hidden = true; $('#login').hidden = false;
    $('#loginForm').onsubmit = async e => {
      e.preventDefault();
      const f = new FormData(e.target);
      const j = await api('login', { user: f.get('user'), pass: f.get('pass') });
      if (j.ok) { csrf = j.csrf; $('#login').hidden = true; boot(); }
      else $('#loginErr').textContent = { invalid: 'بيانات الدخول غير صحيحة.', locked: 'محاولات كثيرة، حاول بعد 5 دقائق.', default_password: 'غيّر كلمة المرور الافتراضية في api/config.php أولاً.' }[j.error] || 'تعذّر تسجيل الدخول.';
    };
  }

  async function boot() {
    let base = null;
    if (mode === 'server') { try { const r = await fetch('../data/content.json', { cache: 'no-store' }); if (r.ok) base = await r.json(); } catch {} }
    else { try { base = JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch {} }
    content = merge(clone(DEF), base || {});
    $('#app').hidden = false;
    $('#logoutBtn').hidden = mode !== 'server';
    $('#modeNote').innerHTML = mode === 'server'
      ? 'متصل بالخادم — <b>«حفظ ونشر»</b> يحدّث الموقع مباشرة.'
      : 'وضع المعاينة — التعديلات تُحفظ في هذا المتصفح فقط. للنشر الفعلي ارفع الموقع على استضافة PHP، أو صدّر الملف.';
    if (mode === 'server') { try { const j = await api('messages'); messages = j.messages || []; } catch {} }
    buildNav(); go('dashboard');
  }

  $('#logoutBtn').onclick = async () => { await api('logout', {}); location.reload(); };
  $('#menuBtn').onclick = () => $('#side').classList.toggle('open');
  $('#previewBtn').onclick = () => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(content)); } catch {} window.open('../?preview=1', '_blank'); };
  $('#saveBtn').onclick = save;
  addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); } });
  addEventListener('beforeunload', e => { if (dirty && mode === 'server') { e.preventDefault(); e.returnValue = ''; } });

  async function save() {
    if (mode === 'server') {
      const j = await api('save', { content }).catch(() => ({}));
      if (!j.ok) return toast('تعذّر الحفظ', true);
    } else { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(content)); } catch { return toast('تعذّر الحفظ', true); } }
    dirty = false; $('#dirty').hidden = true; toast(mode === 'server' ? 'تم الحفظ والنشر ✓' : 'تم الحفظ في هذا المتصفح ✓');
  }

  /* ---------- navigation ---------- */
  const PAGES = [
    ['dashboard', 'لوحة التحكم'], ['hero', 'الواجهة والأرقام والأرباح'], ['services', 'الخدمات'], ['stores', 'المتاجر الرقمية'], ['plans', 'الباقات'], ['faq', 'الأسئلة الشائعة'], ['works', 'الأعمال والمشاريع'],
    ['team', 'الفريق'], ['process', 'آلية العمل'], ['extras', 'لماذا نحن والتقنيات'], ['contact', 'التواصل والإعدادات'],
    ['sections', 'إظهار الأقسام'], ['messages', 'الرسائل'], ['data', 'النسخ الاحتياطي'], ['security', 'الأمان']
  ];
  function buildNav() {
    const unread = messages.filter(m => !m.read).length;
    $('#sideNav').innerHTML = PAGES.filter(([k]) => mode === 'server' || !['messages', 'security'].includes(k))
      .map(([k, t]) => `<button data-p="${k}">${t}${k === 'messages' && unread ? `<span class="badge">${unread}</span>` : ''}</button>`).join('');
    $$('#sideNav button').forEach(b => b.onclick = () => { go(b.dataset.p); $('#side').classList.remove('open'); });
  }
  function go(p) {
    $$('#sideNav button').forEach(b => b.classList.toggle('on', b.dataset.p === p));
    $('#pageTitle').textContent = PAGES.find(x => x[0] === p)[1];
    const v = $('#view'); v.innerHTML = ''; VIEWS[p](v); scrollTo(0, 0);
  }

  /* ---------- field builders ---------- */
  const field = (label, path, type = 'text', opts = {}) => {
    const wrap = document.createElement('label');
    wrap.className = 'f' + (opts.full ? ' full' : '');
    const val = opts.obj ? opts.obj[path] : get(path);
    const update = v => { if (opts.obj) { opts.obj[path] = v; markDirty(); opts.onChange?.(); } else set(path, v); };
    let input;
    if (type === 'textarea') input = Object.assign(document.createElement('textarea'), { rows: opts.rows || 3 });
    else if (type === 'select') { input = document.createElement('select'); input.innerHTML = opts.options.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join(''); }
    else input = Object.assign(document.createElement('input'), { type });
    if (type === 'color') input.value = val || '#C9A86A'; else input.value = val ?? '';
    if (opts.dir) input.dir = opts.dir;
    input.addEventListener(type === 'select' || type === 'color' ? 'change' : 'input', () => update(input.value));
    wrap.innerHTML = `<span>${esc(label)}</span>`; wrap.append(input);
    if (opts.hint) wrap.insertAdjacentHTML('beforeend', `<small>${esc(opts.hint)}</small>`);
    return wrap;
  };
  const imageField = (label, obj, key) => {
    const wrap = document.createElement('div'); wrap.className = 'f full';
    wrap.innerHTML = `<span>${esc(label)}</span><div class="img-f"><img alt="" hidden><input type="text" dir="ltr" placeholder="رابط الصورة أو ارفع صورة"><label class="b b--line b--sm" style="display:inline-flex;align-items:center">رفع صورة<input type="file" accept="image/*" hidden></label></div>`;
    const img = $('img', wrap), txt = $('input[type=text]', wrap), file = $('input[type=file]', wrap);
    const show = () => { const u = obj[key]; img.hidden = !u; if (u) img.src = /^(https?:|data:)/.test(u) ? u : '../' + u; };
    txt.value = obj[key] || ''; show();
    txt.oninput = () => { obj[key] = txt.value.trim(); markDirty(); show(); };
    file.onchange = async () => {
      const f = file.files[0]; if (!f) return;
      if (f.size > 5 * 1024 * 1024) return toast('الحد الأقصى 5MB', true);
      if (mode === 'server') {
        const fd = new FormData(); fd.append('file', f);
        const j = await api('upload', fd, true).catch(() => ({}));
        if (!j.ok) return toast('تعذّر رفع الصورة', true);
        obj[key] = j.url;
      } else {
        if (f.size > 1.5 * 1024 * 1024) return toast('في وضع المعاينة: الحد 1.5MB', true);
        obj[key] = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); });
      }
      txt.value = obj[key].startsWith('data:') ? '(صورة مرفوعة محلياً)' : obj[key]; markDirty(); show(); toast('تم رفع الصورة');
    };
    return wrap;
  };
  const tagsField = (label, arr, opts = {}) => {
    const wrap = document.createElement('div'); wrap.className = 'f' + (opts.full !== false ? ' full' : '');
    wrap.innerHTML = `<span>${esc(label)}</span><div class="tags"></div><small>اكتب ثم اضغط Enter للإضافة</small>`;
    const box = $('.tags', wrap);
    const render = () => {
      box.innerHTML = arr.map((t, i) => `<span>${esc(t)}<button type="button" data-i="${i}" aria-label="حذف">×</button></span>`).join('') + '<input type="text">';
      $$('button', box).forEach(b => b.onclick = () => { arr.splice(+b.dataset.i, 1); markDirty(); render(); });
      const inp = $('input', box);
      inp.onkeydown = e => { if (e.key === 'Enter' && inp.value.trim()) { e.preventDefault(); arr.push(inp.value.trim()); markDirty(); render(); $('input', box).focus(); } };
    };
    render(); return wrap;
  };
  const card = (title, hint) => { const c = document.createElement('section'); c.className = 'card'; c.innerHTML = `<h2>${esc(title)}</h2>${hint ? `<p class="hint">${esc(hint)}</p>` : ''}`; return c; };
  const grid = (...els) => { const g = document.createElement('div'); g.className = 'grid'; g.append(...els); return g; };

  /** Repeater for arrays of objects. */
  const repeater = (arr, { title, fields, blank, addLabel }) => {
    const wrap = document.createElement('div');
    const list = document.createElement('div'); list.className = 'rep';
    const render = (openIdx) => {
      list.innerHTML = '';
      arr.forEach((item, i) => {
        const el = document.createElement('div'); el.className = 'item' + (i === openIdx ? ' open' : '');
        el.innerHTML = `<div class="item__head"><span class="n">${String(i + 1).padStart(2, '0')}</span><b>${esc(title(item) || 'عنصر جديد')}</b>
          <div class="tools"><button type="button" data-a="up" title="أعلى">↑</button><button type="button" data-a="down" title="أسفل">↓</button><button type="button" data-a="del" class="del" title="حذف">✕</button></div><span class="chev">⌄</span></div><div class="item__body"></div>`;
        const body = $('.item__body', el);
        const refreshTitle = () => $('.item__head b', el).textContent = title(item) || 'عنصر جديد';
        body.append(fields(item, refreshTitle));
        $('.item__head', el).onclick = e => {
          const a = e.target.closest('[data-a]')?.dataset.a;
          if (!a) return el.classList.toggle('open');
          e.stopPropagation();
          if (a === 'del') { if (!confirm('حذف هذا العنصر؟')) return; arr.splice(i, 1); }
          if (a === 'up' && i > 0) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
          if (a === 'down' && i < arr.length - 1) [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
          markDirty(); render();
        };
        list.append(el);
      });
    };
    const add = document.createElement('button'); add.type = 'button'; add.className = 'b b--line add'; add.textContent = addLabel || '+ إضافة';
    add.onclick = () => { arr.push(blank()); markDirty(); render(arr.length - 1); };
    render(); wrap.append(list, add); return wrap;
  };

  /* ---------- views ---------- */
  const VIEWS = {
    dashboard(v) {
      const unread = messages.filter(m => !m.read).length;
      v.innerHTML = `<div class="stats">
        <div class="stat"><small>المشاريع</small><b>${content.works.length}</b></div>
        <div class="stat"><small>الخدمات</small><b>${content.services.length}</b></div>
        <div class="stat"><small>تخصصات الفريق</small><b>${content.team.length}</b></div>
        <div class="stat"><small>رسائل جديدة</small><b>${mode === 'server' ? unread : '—'}</b></div></div>`;
      const c = card('اختصارات', 'أكثر ما تحتاج تعديله.');
      const q = document.createElement('div'); q.className = 'quick';
      [['works', 'إضافة مشروع', 'أضف مشروعاً جديداً لمعرض الأعمال'], ['hero', 'نصوص الواجهة', 'العنوان الرئيسي والأزرار'], ['contact', 'بيانات التواصل', 'واتساب، البريد، الحسابات'],
       ['team', 'الفريق', 'تخصصات فريق العمل'], ['sections', 'إظهار الأقسام', 'إخفاء أو إظهار أي قسم'], [mode === 'server' ? 'messages' : 'data', mode === 'server' ? 'الرسائل' : 'النسخ الاحتياطي', mode === 'server' ? 'طلبات المشاريع الواردة' : 'تصدير واستيراد المحتوى']]
        .forEach(([p, t, d]) => { const b = document.createElement('button'); b.innerHTML = `<b>${t}</b><span>${d}</span>`; b.onclick = () => go(p); q.append(b); });
      c.append(q); v.append(c);
    },
    hero(v) {
      const c = card('الواجهة الرئيسية (Hero)');
      c.append(grid(field('النص الصغير أعلى العنوان', 'hero.eyebrow', 'text', { dir: 'ltr' }), field('الكلمات الذهبية في العنوان', 'hero.highlight'),
        field('العنوان الرئيسي', 'hero.title', 'text', { full: true }), field('الوصف', 'hero.subtitle', 'textarea', { full: true }),
        field('نص الزر الأساسي', 'hero.ctaPrimary'), field('نص الزر الثانوي', 'hero.ctaSecondary')));
      const st = card('الأرقام تحت العنوان', 'مثل «+10 متاجر نخدمها». الأرقام تعدّ تلقائياً عند فتح الموقع.');
      st.append(repeater(content.stats ??= [], { title: x => `${x.value} ${x.label}`, blank: () => ({ value: '', label: '' }), addLabel: '+ إضافة رقم',
        fields: (x, rt) => grid(field('الرقم', 'value', 'text', { obj: x, dir: 'ltr', onChange: rt }), field('الوصف', 'label', 'text', { obj: x, onChange: rt }), field('يتحول بعد العدّ إلى (اختياري)', 'next', 'text', { obj: x, dir: 'ltr', hint: 'مثال: +11 — يظهر باللون الأخضر بعد انتهاء العدّ' })) }));
      const pr = card('قسم الأرباح والاستقلالية');
      pr.append(grid(field('العنوان', 'profit.title'), field('الكلمات المظللة', 'profit.highlight'), field('النص', 'profit.text', 'textarea', { full: true }), field('ملاحظة الحاسبة', 'profit.note', 'text', { full: true })));
      pr.append(repeater(content.profit.own, { title: x => x.title, blank: () => ({ title: '', desc: '' }), addLabel: '+ إضافة',
        fields: (x, rt) => grid(field('العنوان', 'title', 'text', { obj: x, onChange: rt }), field('الوصف', 'desc', 'text', { obj: x })) }));
      v.append(st, pr);
      const a = card('قسم الشركة', 'الجملة الكبيرة التي تمتلئ بالضوء عند التمرير، والنقاط الثلاث أسفلها.');
      a.append(grid(field('الجملة الرئيسية', 'about.statement', 'textarea', { full: true, rows: 3 })));
      a.append(repeater(content.about.points, { title: p => p.title, blank: () => ({ title: '', en: '' }), addLabel: '+ إضافة نقطة',
        fields: (p, rt) => grid(field('العنوان', 'title', 'text', { obj: p, onChange: rt }), field('بالإنجليزية', 'en', 'text', { obj: p, dir: 'ltr' })) }));
      v.append(c, a);
    },
    services(v) {
      const c = card('الخدمات', 'تظهر بالترتيب، وأسماؤها الإنجليزية تُستخدم في الشريط المتحرك.');
      c.append(repeater(content.services, { title: s => s.title, blank: () => ({ title: '', en: '', desc: '' }), addLabel: '+ إضافة خدمة',
        fields: (s, rt) => grid(field('اسم الخدمة', 'title', 'text', { obj: s, onChange: rt }), field('بالإنجليزية', 'en', 'text', { obj: s, dir: 'ltr' }), field('وصف مختصر', 'desc', 'text', { obj: s, full: true })) }));
      v.append(c);
    },
    stores(v) {
      const st = content.stores;
      const a = card('المتاجر الرقمية — العنوان');
      a.append(grid(field('النص الصغير', 'stores.eyebrow', 'text', { dir: 'ltr' }), field('نص الزر', 'stores.cta'), field('العنوان', 'stores.title'), field('الكلمات الذهبية', 'stores.highlight'), field('الوصف', 'stores.subtitle', 'textarea', { full: true })));
      const b = card('ماذا تبيع', 'فئات المنتجات، وتظهر أيضاً في واجهة المتجر التوضيحية.');
      b.append(repeater(st.categories, { title: c => c.title, blank: () => ({ title: '', en: '', desc: '' }), addLabel: '+ إضافة فئة',
        fields: (c, rt) => grid(field('الفئة', 'title', 'text', { obj: c, onChange: rt }), field('بالإنجليزية', 'en', 'text', { obj: c, dir: 'ltr' }), field('وصف', 'desc', 'text', { obj: c, full: true })) }));
      const pc = card('أمثلة المنتجات (الأيقونات)', 'تظهر في واجهة المتجر التوضيحية وفي شبكة الأيقونات. أول 6 منها تظهر في واجهة المتجر.');
      pc.append(repeater(st.products ??= [], { title: x => x.name, blank: () => ({ name: '', sub: '', icon: '', color: '#8C76FF' }), addLabel: '+ إضافة منتج',
        fields: (x, rt) => { const g = grid(field('اسم المنتج', 'name', 'text', { obj: x, dir: 'ltr', onChange: rt }), field('الوصف', 'sub', 'text', { obj: x }), field('لون الأيقونة', 'color', 'color', { obj: x }));
          g.append(imageField('الأيقونة (SVG أو PNG، يفضّل بخلفية شفافة)', x, 'icon')); return g; } }));
      v.append(pc);
      const t = card('أنواع المتاجر'); t.append(grid(tagsField('الأنواع', st.storeTypes)));
      const s = card('خطوات البدء');
      s.append(repeater(st.steps, { title: x => x.title, blank: () => ({ title: '', desc: '' }), addLabel: '+ إضافة خطوة',
        fields: (x, rt) => grid(field('الخطوة', 'title', 'text', { obj: x, onChange: rt }), field('الوصف', 'desc', 'text', { obj: x })) }));
      const f = card('مزايا المنصة');
      f.append(repeater(st.features, { title: x => x.title, blank: () => ({ title: '', desc: '' }), addLabel: '+ إضافة ميزة',
        fields: (x, rt) => grid(field('الميزة', 'title', 'text', { obj: x, onChange: rt }), field('الوصف', 'desc', 'text', { obj: x })) }));
      const d = card('الإضافات');
      d.append(repeater(st.addons, { title: x => x.title, blank: () => ({ title: '', desc: '' }), addLabel: '+ إضافة',
        fields: (x, rt) => grid(field('الإضافة', 'title', 'text', { obj: x, onChange: rt }), field('الوصف', 'desc', 'text', { obj: x })) }));
      v.append(a, b, t, s, f, d);
    },
    plans(v) {
      const c = card('الباقات', 'اكتب السعر كما تريد أن يظهر، مثل «$20» أو «تواصل معنا».');
      c.append(repeater(content.plans, { title: p => p.name, blank: () => ({ name: '', price: '', period: '', featured: false, features: [], cta: 'اطلب الآن' }), addLabel: '+ إضافة باقة',
        fields: (p, rt) => {
          const g = grid(field('اسم الباقة', 'name', 'text', { obj: p, onChange: rt }), field('السعر', 'price', 'text', { obj: p }), field('الفترة (اختياري)', 'period', 'text', { obj: p, hint: 'مثال: شهرياً' }), field('نص الزر', 'cta', 'text', { obj: p }),
            field('مميزة؟', 'featured', 'select', { obj: p, options: [['', 'لا'], ['1', 'نعم — الأكثر طلباً']] }));
          const sel = g.querySelector('select'); sel.value = p.featured ? '1' : ''; sel.onchange = () => { p.featured = !!sel.value; markDirty(); };
          g.append(tagsField('ما تتضمنه', p.features ??= []));
          return g;
        } }));
      v.append(c);
    },
    faq(v) {
      const c = card('الأسئلة الشائعة');
      c.append(repeater(content.faq, { title: f => f.q, blank: () => ({ q: '', a: '' }), addLabel: '+ إضافة سؤال',
        fields: (f, rt) => grid(field('السؤال', 'q', 'text', { obj: f, full: true, onChange: rt }), field('الجواب', 'a', 'textarea', { obj: f, full: true })) }));
      v.append(c);
    },
    works(v) {
      const c = card('الأعمال والمشاريع', 'كل مشروع يظهر كلوحة كاملة في معرض الأعمال. يمكنك عرض واجهة جاهزة أو رفع صورة للمشروع.');
      c.append(repeater(content.works, {
        title: w => [w.name, w.name2].filter(Boolean).join(' '), addLabel: '+ إضافة مشروع',
        blank: () => ({ name: 'PROJECT', name2: 'NAME', category: '', color: '#C9A86A', desc: '', features: [], url: '', mock: 'image', image: '' }),
        fields: (w, rt) => {
          const g = grid(
            field('الاسم (السطر الأول)', 'name', 'text', { obj: w, dir: 'ltr', onChange: rt }),
            field('الاسم (السطر الثاني - مفرّغ)', 'name2', 'text', { obj: w, dir: 'ltr', onChange: rt }),
            field('التصنيف', 'category', 'text', { obj: w, dir: 'ltr' }),
            field('لون المشروع', 'color', 'color', { obj: w }),
            field('الوصف', 'desc', 'textarea', { obj: w, full: true }),
            field('رابط المشروع (اختياري)', 'url', 'url', { obj: w, dir: 'ltr', hint: 'إذا تُرك فارغاً لن يظهر زر الزيارة' }),
            field('شكل العرض', 'mock', 'select', { obj: w, options: [['image', 'صورة المشروع'], ['card', 'واجهة منصة دفع'], ['tech', 'لوحة مستودعات'], ['lav', 'واجهة نقطة بيع']] }));
          g.append(tagsField('الميزات', w.features ??= []), imageField('صورة المشروع (عند اختيار «صورة المشروع»)', w, 'image'));
          return g;
        }
      }));
      v.append(c);
    },
    team(v) {
      const c = card('الفريق', 'تخصصات فريق العمل. لا حاجة لأسماء أو أعداد، تُعرض كأقسام الشركة.');
      const icons = [['design', 'تصميم'], ['front', 'واجهات'], ['back', 'خوادم'], ['data', 'قواعد بيانات'], ['qa', 'جودة'], ['ops', 'سحابة'], ['pm', 'إدارة'], ['support', 'دعم']];
      c.append(repeater(content.team, { title: t => t.title, blank: () => ({ title: '', en: '', icon: 'front' }), addLabel: '+ إضافة تخصص',
        fields: (t, rt) => grid(field('التخصص', 'title', 'text', { obj: t, onChange: rt }), field('بالإنجليزية', 'en', 'text', { obj: t, dir: 'ltr' }), field('الأيقونة', 'icon', 'select', { obj: t, options: icons })) }));
      v.append(c);
    },
    process(v) {
      const c = card('آلية العمل', 'مراحل العمل على المشروع.');
      c.append(repeater(content.process, { title: p => p.title, blank: () => ({ title: '', en: '', desc: '' }), addLabel: '+ إضافة مرحلة',
        fields: (p, rt) => grid(field('المرحلة', 'title', 'text', { obj: p, onChange: rt }), field('بالإنجليزية', 'en', 'text', { obj: p, dir: 'ltr' }), field('وصف قصير', 'desc', 'text', { obj: p, full: true })) }));
      v.append(c);
    },
    extras(v) {
      const a = card('لماذا SPIDER'); a.append(grid(tagsField('النقاط', content.why)));
      const b = card('التقنيات', 'Laravel وPHP وJavaScript وMySQL وHTML5 وCSS3 تظهر بشعاراتها تلقائياً.'); b.append(grid(tagsField('التقنيات', content.stack)));
      v.append(a, b);
    },
    contact(v) {
      const a = card('بيانات التواصل');
      a.append(grid(field('رقم واتساب (صيغة دولية بدون +)', 'settings.whatsapp', 'text', { dir: 'ltr', hint: 'مثال: 963912345678' }), field('رسالة واتساب الافتراضية', 'settings.whatsappMessage'),
        field('البريد الإلكتروني', 'settings.email', 'email', { dir: 'ltr' }), field('رقم الهاتف (اختياري)', 'settings.phone', 'tel', { dir: 'ltr' }), field('العنوان (اختياري)', 'settings.address', 'text', { full: true })));
      const s = card('الحسابات الاجتماعية', 'اترك الحقل فارغاً لإخفاء الحساب.');
      s.append(grid(...['linkedin', 'github', 'x', 'instagram', 'facebook'].map(k => field(k[0].toUpperCase() + k.slice(1), 'settings.social.' + k, 'url', { dir: 'ltr' }))));
      const t = card('قسم التواصل');
      t.append(grid(field('العنوان', 'contact.title'), field('الكلمات الذهبية', 'contact.highlight'), field('النص', 'contact.text', 'textarea', { full: true }), tagsField('أنواع المشاريع في النموذج', content.contact.types)));
      v.append(a, s, t);
    },
    sections(v) {
      const c = card('إظهار الأقسام', 'أخفِ أي قسم مؤقتاً دون حذف محتواه.');
      const names = { stores: 'المتاجر الرقمية', plans: 'الباقات', faq: 'الأسئلة الشائعة', services: 'الخدمات', works: 'الأعمال', team: 'الفريق', process: 'آلية العمل', why: 'لماذا SPIDER', stack: 'التقنيات', contact: 'التواصل' };
      Object.keys(names).forEach(k => {
        const row = document.createElement('label'); row.className = 'sw';
        row.innerHTML = `<span>${names[k]}</span><input type="checkbox" ${content.sections[k] !== false ? 'checked' : ''}>`;
        $('input', row).onchange = e => set('sections.' + k, e.target.checked);
        c.append(row);
      });
      v.append(c);
    },
    async messages(v) {
      const j = await api('messages').catch(() => ({})); messages = j.messages || []; buildNav(); $$('#sideNav button').forEach(b => b.classList.toggle('on', b.dataset.p === 'messages'));
      if (!messages.length) { v.innerHTML = '<div class="card empty">لا توجد رسائل بعد.</div>'; return; }
      v.innerHTML = messages.map(m => `<article class="msg ${m.read ? '' : 'unread'}" data-id="${esc(m.id)}">
        <header><b>${esc(m.name)}</b>${m.company ? `<small>${esc(m.company)}</small>` : ''}<span class="tag">${esc(m.type)}</span><small>${new Date(m.date).toLocaleString('ar')}</small></header>
        <p>${esc(m.details)}</p>
        <div class="row"><a class="b b--line b--sm" style="display:inline-flex;align-items:center;text-decoration:none" href="mailto:${esc(m.email)}">${esc(m.email)}</a>
        ${m.phone ? `<a class="b b--line b--sm" style="display:inline-flex;align-items:center;text-decoration:none" href="tel:${esc(m.phone)}" dir="ltr">${esc(m.phone)}</a>` : ''}
        ${m.read ? '' : '<button class="b b--ghost b--sm" data-a="read">تحديد كمقروءة</button>'}<button class="b b--danger b--sm" data-a="del">حذف</button></div></article>`).join('');
      $$('.msg', v).forEach(el => el.onclick = async e => {
        const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
        if (a === 'del' && !confirm('حذف الرسالة؟')) return;
        await api('message-update', { id: el.dataset.id, read: true, delete: a === 'del' });
        go('messages');
      });
    },
    data(v) {
      const c = card('النسخ الاحتياطي', 'صدّر المحتوى كملف JSON، أو استورد ملفاً سابقاً. في الاستضافة يُحفظ المحتوى في data/content.json.');
      const row = document.createElement('div'); row.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px';
      const exp = Object.assign(document.createElement('button'), { className: 'b b--line', textContent: 'تصدير content.json', type: 'button' });
      exp.onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' })); a.download = 'content.json'; a.click(); };
      const imp = document.createElement('label'); imp.className = 'b b--line'; imp.style.cssText = 'display:inline-flex;align-items:center;cursor:pointer'; imp.innerHTML = 'استيراد ملف<input type="file" accept="application/json" hidden>';
      $('input', imp).onchange = async e => { try { content = merge(clone(DEF), JSON.parse(await e.target.files[0].text())); markDirty(); toast('تم الاستيراد — اضغط حفظ'); go('dashboard'); } catch { toast('ملف غير صالح', true); } };
      const reset = Object.assign(document.createElement('button'), { className: 'b b--danger', textContent: 'استعادة المحتوى الافتراضي', type: 'button' });
      reset.onclick = () => { if (confirm('سيتم استبدال كل المحتوى بالمحتوى الافتراضي. متابعة؟')) { content = clone(DEF); markDirty(); toast('تمت الاستعادة — اضغط حفظ'); go('dashboard'); } };
      row.append(exp, imp, reset); c.append(row); v.append(c);
    },
    security(v) {
      const c = card('تغيير بيانات الدخول', 'كلمة مرور من 10 أحرف على الأقل.');
      const u = Object.assign(document.createElement('input'), { value: 'admin' }), p = Object.assign(document.createElement('input'), { type: 'password' });
      const l1 = document.createElement('label'); l1.className = 'f'; l1.innerHTML = '<span>اسم المستخدم</span>'; l1.append(u);
      const l2 = document.createElement('label'); l2.className = 'f'; l2.innerHTML = '<span>كلمة المرور الجديدة</span>'; l2.append(p);
      const b = Object.assign(document.createElement('button'), { className: 'b b--gold', textContent: 'تحديث', type: 'button' });
      b.onclick = async () => { const j = await api('password', { user: u.value, pass: p.value }).catch(() => ({})); toast(j.ok ? 'تم التحديث ✓' : (j.error === 'weak' ? 'كلمة المرور قصيرة' : 'تعذّر التحديث'), !j.ok); if (j.ok) p.value = ''; };
      c.append(grid(l1, l2)); c.append(Object.assign(document.createElement('div'), { style: 'margin-top:16px' })); c.lastChild.append(b);
      v.append(c);
    }
  };
  async function init() {
  /* ---------- mode detection ---------- */
  try {
    const r = await fetch(`${API}?action=me`, { credentials: 'same-origin' });
    const j = await r.json();
    if (j && j.ok) { mode = 'server'; csrf = j.csrf; if (!j.authed) { showLogin(); return; } }
  } catch {}
  boot();
  }
  init();
})();
