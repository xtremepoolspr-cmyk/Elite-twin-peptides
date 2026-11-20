(() => {
'use strict';

/* ---------- utilidades ---------- */
const $ = (s, e = document) => e.querySelector(s);
const $$ = (s, e = document) => [...e.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const num = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(n) ? n : NaN; };
const fmt = (n, d = 2) => isFinite(n) ? n.toLocaleString('es-PR', { maximumFractionDigits: d }) : '—';
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => ymd(new Date());
const nowLocal = () => { const d = new Date(); return `${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fdate = s => s ? new Date(s.length <= 10 ? s + 'T00:00' : s).toLocaleDateString('es-PR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const fdt = s => s ? new Date(s).toLocaleString('es-PR', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';
const addDays = (s, n) => { const d = new Date(s + 'T00:00'); d.setDate(d.getDate() + n); return ymd(d); };
const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00') - new Date(a + 'T00:00')) / 864e5);
const dose = mcg => !isFinite(mcg) ? '—' : mcg >= 1000 ? `${fmt(mcg / 1000, 3)} mg` : `${fmt(mcg, 1)} mcg`;
const allPep = () => [...PEP, ...(db.custom || [])];
const pep = id => allPep().find(p => p.id === id);
const pepName = (id, custom) => pep(id)?.n || custom || '';

const ICON = {
  syringe: '<svg viewBox="0 0 24 24"><path d="M18 2l4 4M20 4l-3 3M14 6l4 4-7.5 7.5-4-4zM6.5 13.5L3 17l1 3 3 1 3.5-3.5M9 15l-2 2M12 12l-1.5-1.5"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M5 4h10a4 4 0 014 4v12H9a4 4 0 01-4-4zM5 16a4 4 0 014-4h10M9 8h5"/></svg>',
  users: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.8a3.5 3.5 0 010 6.4M18 14.2A6.5 6.5 0 0121.5 20"/></svg>',
  vial: '<svg viewBox="0 0 24 24"><path d="M9 2h6M10 2v4M14 2v4M8 6h8v13a3 3 0 01-3 3h-2a3 3 0 01-3-3zM8 12h8"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 01-11.7 7L4 20l1.1-4.6A8 8 0 1121 12z"/></svg>',
  save: '<svg viewBox="0 0 24 24"><path d="M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6"/></svg>'
};

/* ---------- datos locales ---------- */
const KEY = 'peptidospr.v1';
let db = { clientes: [], viales: [], custom: [], cfg: { aceptado: false, tema: 'auto' } };
try { const r = localStorage.getItem(KEY); if (r) { const j = JSON.parse(r); db = { clientes: j.clientes || [], viales: j.viales || [], custom: j.custom || [], cfg: Object.assign({ aceptado: false, tema: 'auto' }, j.cfg) }; } } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} };
const applyTheme = () => { const t = db.cfg.tema; if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t); };

const S = {
  tab: 'calc',
  calc: { pid: 'bpc157', mg: '5', agua: '2', dosis: '250', unit: 'mcg', jer: '100', frec: '1d' },
  lib: { seg: 'pep', cat: '', goal: '', q: '' },
  cli: { q: '' },
  stack: [],
  ctab: 'resumen'
};

/* ---------- toast ---------- */
let tt;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2200); }

/* ---------- capas (hojas) ---------- */
function openLayer(fn, o = {}) { S.stack.push({ fn, full: !!o.full, lock: !!o.lock }); renderStack(); }
function closeLayer() { if (S.stack.length && !S.stack[S.stack.length - 1].lock) { S.stack.pop(); renderStack(); } }
function renderStack() {
  const L = $('#layers');
  const prev = $$('.sheet-body', L).map(b => b.scrollTop);
  L.innerHTML = S.stack.map((l, i) => {
    const c = l.fn();
    return `<div class="scrim" data-layer="${i}"><div class="sheet${l.full ? ' full' : ''}" role="dialog" aria-modal="true">${c}</div></div>`;
  }).join('');
  $$('.sheet-body', L).forEach((b, i) => { if (prev[i]) b.scrollTop = prev[i]; });
  document.body.classList.toggle('lock', S.stack.length > 0);
}
const head = (title, extra = '') => `<div class="sheet-head"><h2>${title}</h2>${extra}<button class="icon-btn" data-act="close" aria-label="Cerrar">${ICON.x}</button></div>`;

function confirmLayer(msg, yes) { S._yes = yes; openLayer(() => `${head('¿Seguro?')}<div class="sheet-body"><p>${esc(msg)}</p><div class="sheet-foot"><button class="btn ghost" data-act="close">Cancelar</button><button class="btn danger" data-act="yes">Sí, borrar</button></div></div>`); }

/* ---------- jeringa ---------- */
function syringe(u, cap) {
  const x0 = 44, x1 = 292, W = x1 - x0;
  const over = u > cap, uu = Math.max(0, Math.min(u, cap));
  const fx = x1 - (uu / cap) * W;
  const minor = cap === 100 ? 2 : 1, major = cap === 100 ? 10 : 5;
  let t = '';
  for (let k = 0; k <= cap; k += minor) {
    const x = (x1 - (k / cap) * W).toFixed(1), M = k % major === 0;
    t += `<line x1="${x}" x2="${x}" y1="${M ? 36 : 42}" y2="50" class="tk"/>`;
    if (M) t += `<text x="${x}" y="64" class="tl" text-anchor="middle">${k}</text>`;
  }
  return `<svg viewBox="0 0 380 72" class="syr" role="img" aria-label="Jeringa cargada con ${fmt(u, 1)} unidades">
    <rect x="${x0}" y="14" width="${W}" height="36" rx="3" class="barrel"/>
    ${uu > 0 ? `<rect x="${fx.toFixed(1)}" y="15.5" width="${(x1 - fx).toFixed(1)}" height="33" class="liq${over ? ' over' : ''}"/>` : ''}
    <line x1="${(fx - 5).toFixed(1)}" x2="12" y1="32" y2="32" class="rod"/>
    <rect x="${(fx - 6).toFixed(1)}" y="16" width="6" height="32" class="stop"/>
    <rect x="2" y="20" width="9" height="24" rx="2" class="thumb"/>
    <path d="M${x1} 24h14l6 8-6 8h-14z" class="hub"/>
    <line x1="${x1 + 20}" x2="374" y1="32" y2="32" class="needle"/>
    ${t}</svg>`;
}

/* ---------- navegación ---------- */
const TABS = [['calc', 'Calcular', ICON.syringe], ['lib', 'Biblioteca', ICON.book], ['cli', 'Clientes', ICON.users], ['vial', 'Viales', ICON.vial]];
function renderTabs() {
  $('#tabbar').innerHTML = `<div class="tabbar-in">${TABS.map(([k, l, i]) => `<button class="tab" data-act="tab" data-tab="${k}" ${S.tab === k ? 'aria-current="page"' : ''}>${i}<span>${l}</span></button>`).join('')}</div>`;
}
function render() {
  renderTabs();
  const v = $('#view');
  ({ calc: viewCalc, lib: viewLib, cli: viewCli, vial: viewVial })[S.tab](v);
}

/* ---------- calculadora ---------- */
const FREC = { '2d': ['2 veces al día', 2], '1d': ['1 vez al día', 1], 'eod': ['Día por medio', .5], '3w': ['3 veces por semana', 3 / 7], '2w': ['2 veces por semana', 2 / 7], '1w': ['1 vez por semana', 1 / 7] };
const pepOptions = (sel, blank = 'Personalizado', calc = false) => `<option value="">${blank}</option>` + allPep().filter(p => !(calc && p.nc)).sort((a, b) => a.n.localeCompare(b.n, 'es')).map(p => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.n)}</option>`).join('');

function viewCalc(v) {
  const c = S.calc;
  v.innerHTML = `
  <div class="stack sm"><h1 class="page-title">Calculadora de dosis</h1><p class="sub">Indica el vial, el agua y la dosis. Te dice cuántas unidades jalar.</p></div>
  <form class="card stack" id="calcForm" autocomplete="off">
    <div class="field"><label for="c-pid">Péptido</label><select id="c-pid">${pepOptions(c.pid, 'Personalizado', true)}</select><div class="tiny muted" id="c-hint"></div></div>
    <div class="grid2">
      <div class="field"><label for="c-mg">Contenido del vial (mg)</label><input type="text" id="c-mg" inputmode="decimal" value="${esc(c.mg)}"></div>
      <div class="field"><label for="c-agua">Agua bacteriostática (mL)</label><input type="text" id="c-agua" inputmode="decimal" value="${esc(c.agua)}"></div>
    </div>
    <div class="row wrap" id="c-water-chips" style="gap:6px"><span class="tiny muted">Agua rápida:</span>${[1, 2, 3, 5].map(n => `<button type="button" class="chip sm" data-act="calc-water" data-v="${n}">${n} mL</button>`).join('')}</div>
    <div class="field"><label for="c-dosis">Dosis deseada</label>
      <div class="inline"><input type="text" id="c-dosis" inputmode="decimal" value="${esc(c.dosis)}"><select id="c-unit" aria-label="Unidad"><option value="mcg" ${c.unit === 'mcg' ? 'selected' : ''}>mcg</option><option value="mg" ${c.unit === 'mg' ? 'selected' : ''}>mg</option></select></div></div>
    <div class="grid2">
      <div class="field"><label for="c-jer">Jeringa</label><select id="c-jer"><option value="100" ${c.jer === '100' ? 'selected' : ''}>1 mL · 100 u</option><option value="50" ${c.jer === '50' ? 'selected' : ''}>0.5 mL · 50 u</option><option value="30" ${c.jer === '30' ? 'selected' : ''}>0.3 mL · 30 u</option></select></div>
      <div class="field"><label for="c-frec">Frecuencia</label><select id="c-frec">${Object.entries(FREC).map(([k, [l]]) => `<option value="${k}" ${c.frec === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    </div>
  </form>
  <section class="card result" id="calcOut" aria-live="polite"></section>
  <p class="tiny muted">Cálculo matemático a partir de los datos que ingresas. Verifica siempre con el profesional que indica el producto. Las unidades son de jeringa de insulina U-100 (1 unidad = 0.01 mL).</p>`;
  calcUpdate();
}
function readCalc() {
  const g = id => $('#' + id)?.value ?? '';
  Object.assign(S.calc, { pid: g('c-pid'), mg: g('c-mg'), agua: g('c-agua'), dosis: g('c-dosis'), unit: g('c-unit'), jer: g('c-jer'), frec: g('c-frec') });
}
function calcUpdate() {
  const c = S.calc, out = $('#calcOut'); if (!out) return;
  const p = pep(c.pid), mg = num(c.mg), agua = num(c.agua), dv = num(c.dosis), cap = +c.jer;
  const dMcg = c.unit === 'mg' ? dv * 1000 : dv;
  $('#c-hint').textContent = p ? `Rango reportado: ${p.mn ? dose(p.mn) + (p.mx !== p.mn ? ' a ' + dose(p.mx) : '') : 'sin rango estándar'} · ${p.f || ''}` : '';
  if (!(mg > 0 && agua > 0 && dMcg > 0)) {
    out.innerHTML = `<div class="empty"><div class="display">Completa los datos</div><p>Necesitas el contenido del vial, el agua y la dosis para ver el resultado.</p></div>`;
    return;
  }
  const conc = mg * 1000 / agua, vol = dMcg / conc, units = vol * 100, perVial = mg * 1000 / dMcg;
  const perDay = FREC[c.frec][1], days = perVial / perDay;
  const warns = [];
  if (units > cap) warns.push(['bad', `No cabe en la jeringa de ${cap} unidades. Usa menos agua o una jeringa más grande.`]);
  else if (units < 2) warns.push(['warn', 'Es un volumen muy pequeño y difícil de medir con precisión. Usa más agua para diluir.']);
  if (dMcg > mg * 1000) warns.push(['bad', 'La dosis es mayor que todo el contenido del vial.']);
  if (p && p.mx && dMcg > p.mx * 1.0001) warns.push(['warn', `La dosis está por encima del rango reportado (${dose(p.mx)}). Confirma con el profesional que la indica.`]);
  else if (p && p.mn && dMcg < p.mn * 0.9999) warns.push(['info', `La dosis está por debajo del rango reportado (${dose(p.mn)}). Puede ser normal en fase de inicio o de titulación.`]);
  if (days > 28) warns.push(['warn', `Con esa frecuencia el vial dura unos ${fmt(days, 0)} días. La guía general es usarlo dentro de 28 días después de reconstituir.`]);
  const quick = [10, 20, 25, 50].filter(q => q <= cap).map(q => `<button type="button" class="chip sm" data-act="calc-units" data-v="${q}">${q} u</button>`).join('');
  out.innerHTML = `
    <div class="hero-num${units > cap ? ' over' : ''}"><span class="big num">${fmt(units, 1)}</span><span class="unit">unidades</span><span class="sub num">${fmt(vol, 3)} mL</span></div>
    ${syringe(units, cap)}
    ${warns.map(([k, m]) => `<div class="notice ${k === 'bad' ? 'bad' : k === 'info' ? 'info' : ''}">${esc(m)}</div>`).join('')}
    <div class="stats">
      <div class="stat"><div class="k">Concentración</div><div class="v">${fmt(conc, 1)} <small>mcg/mL</small></div></div>
      <div class="stat"><div class="k">Por unidad</div><div class="v">${fmt(conc / 100, 2)} <small>mcg</small></div></div>
      <div class="stat"><div class="k">Dosis por vial</div><div class="v">${fmt(perVial, 1)}</div></div>
      <div class="stat"><div class="k">Dura aprox.</div><div class="v">${fmt(days, 0)} <small>días</small></div></div>
    </div>
    <div class="stack sm"><div class="lbl">¿Prefieres jalar una cantidad redonda?</div><div class="row wrap" style="gap:6px">${quick}</div><div class="tiny muted">Ajusta el agua para que la dosis salga en esas unidades.</div></div>
    <button class="btn accent block" data-act="calc-savevial">${ICON.save} Guardar como vial reconstituido</button>`;
}

/* ---------- biblioteca ---------- */
function viewLib(v) {
  const L = S.lib;
  v.innerHTML = `
  <div class="stack sm"><h1 class="page-title">Biblioteca</h1><p class="sub">${allPep().length} fichas (péptidos, lipotrópicos y suplementos) y ${STACKS.length} stacks con información general.</p></div>
  <div class="seg" role="group" aria-label="Sección"><button data-act="lib-seg" data-v="pep" aria-pressed="${L.seg === 'pep'}">Péptidos</button><button data-act="lib-seg" data-v="stack" aria-pressed="${L.seg === 'stack'}">Stacks</button></div>
  ${L.seg === 'pep' ? `
    <div class="row"><input type="search" id="lib-q" class="grow" placeholder="Buscar por nombre o uso" value="${esc(L.q)}" aria-label="Buscar péptido"><button class="btn ghost sm" data-act="pepc-new" style="flex:none">${ICON.plus} Propio</button></div>
    <div class="chips"><button class="chip" data-act="lib-cat" data-v="" aria-pressed="${!L.cat}">Todos</button>${Object.entries(CATS).map(([k, l]) => `<button class="chip" data-act="lib-cat" data-v="${k}" aria-pressed="${L.cat === k}">${l}</button>`).join('')}</div>
    <div class="list" id="libList"></div>` : `
    <div class="chips"><button class="chip" data-act="lib-goal" data-v="" aria-pressed="${!L.goal}">Todos</button>${Object.entries(GOALS).map(([k, l]) => `<button class="chip" data-act="lib-goal" data-v="${k}" aria-pressed="${L.goal === k}">${l}</button>`).join('')}</div>
    <div class="list" id="libList"></div>`}
  <div class="notice info">Información educativa. No reemplaza la indicación de un profesional de la salud. Muchos de estos péptidos no están aprobados para uso humano.</div>`;
  libList();
}
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const statusBadge = p => `<span class="badge ${p.e === 'apr' ? 'good' : p.e === 'noapr' ? 'bad' : (p.e === 'cos' || p.e === 'sup') ? '' : 'warn'}">${ESTADOS[p.e]}</span>`;
const CUSTOM_BADGE = p => p.propio ? '<span class="badge acc">Propio</span>' : '';
function libList() {
  const el = $('#libList'); if (!el) return; const L = S.lib;
  if (L.seg === 'pep') {
    const q = norm(L.q);
    const rows = allPep().filter(p => (!L.cat || p.c.includes(L.cat)) && (!q || norm([p.n, p.a, ...(p.u || []), p.q].join(' ')).includes(q))).sort((a, b) => a.n.localeCompare(b.n, 'es'));
    el.innerHTML = rows.length ? rows.map(p => `<button class="item" data-act="pep" data-id="${p.id}">
      <div class="row between"><span class="t">${esc(p.n)}</span><span class="row" style="gap:6px">${CUSTOM_BADGE(p)}${statusBadge(p)}</span></div>
      <div class="meta">${esc((p.d || p.q || '').length > 90 ? (p.d || p.q).slice(0, 88) + '…' : (p.d || p.q || ''))}</div>
      <div class="tags">${p.c.map(c => `<span class="badge cat-${c}">${CATS[c]}</span>`).join('')}</div></button>`).join('')
      : `<div class="empty"><div class="display">Sin resultados</div><p>Prueba con otro nombre o quita el filtro.</p></div>`;
  } else {
    const rows = STACKS.filter(s => !L.goal || s.g === L.goal);
    el.innerHTML = rows.map(s => `<button class="item" data-act="stack" data-id="${s.id}">
      <div class="row between"><span class="t">${esc(s.n)}</span><span class="badge acc">${GOALS[s.g]}</span></div>
      <div class="meta">${s.r.map(r => esc(pepName(r.p))).join(' + ')}</div></button>`).join('');
  }
}

function pepDetail(id) {
  const p = pep(id); if (!p) return '';
  const inStacks = STACKS.filter(s => s.r.some(r => r.p === id));
  return `${head(esc(p.n))}<div class="sheet-body">
    <div class="stack sm"><div class="tags">${statusBadge(p)}${p.c.map(c => `<span class="badge cat-${c}">${CATS[c]}</span>`).join('')}</div>
      <div class="sub">${esc(p.a)}</div>${p.en ? `<div class="tiny muted">${esc(p.en)}</div>` : ''}</div>
    <p>${esc(p.q)}</p>
    <div class="card flat stack sm"><div class="section-title">Dosis reportada</div><div class="display" style="font-size:20px">${esc(p.d || 'Sin dosis registrada')}</div>
      <dl class="kv"><dt>Frecuencia</dt><dd>${esc(p.f || '—')}</dd><dt>Ciclo</dt><dd>${esc(p.ci || '—')}</dd><dt>Vía</dt><dd>${esc(p.v || '—')}</dd>${(p.vi || []).length ? `<dt>Viales comunes</dt><dd>${p.vi.map(x => x + ' mg').join(', ')}</dd>` : ''}</dl></div>
    ${(p.u || []).length ? `<div><div class="section-title">Usos reportados</div><ul class="dots">${p.u.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
    ${p.p ? `<div class="notice ${p.e === 'noapr' || p.e === 'inv' ? '' : 'info'}"><div><b>Precauciones.</b> ${esc(p.p)}</div></div>` : ''}
    <div><div class="section-title">Nivel de evidencia</div><span class="badge ${p.ev === 'alta' ? 'good' : p.ev === 'moderada' ? 'warn' : 'bad'}">${p.ev[0].toUpperCase() + p.ev.slice(1)}</span> <span class="sub">${esc(p.evn || '')}</span></div>
    ${p.nc ? '' : `<div><div class="section-title">Almacenamiento</div><p class="sub">${esc(ALMACEN)}</p></div>`}
    ${inStacks.length ? `<div><div class="section-title">Aparece en</div><div class="tags">${inStacks.map(s => `<button class="chip sm" data-act="stack" data-id="${s.id}">${esc(s.n)}</button>`).join('')}</div></div>` : ''}
    ${p.nc ? `<div class="notice info">Esta presentación (pluma prellenada, oral, tópica, implante o dosis de hospital) no se calcula con reconstitución.</div>` : `<button class="btn accent block" data-act="pep-calc" data-id="${p.id}">${ICON.syringe} Calcular dosis</button>`}
    ${p.propio ? `<div class="row wrap"><button class="btn ghost sm" data-act="pepc-edit" data-id="${p.id}">Editar</button><button class="btn danger sm" data-act="pepc-del" data-id="${p.id}">Eliminar</button></div>` : ''}
    <p class="tiny muted">${p.propio ? 'Entrada creada por ti. Verifica la información con una fuente confiable.' : 'Los rangos son los que se reportan en etiquetas, estudios o la comunidad. No son una recomendación personal.'}</p></div>`;
}
function stackDetail(id) {
  const s = STACKS.find(x => x.id === id); if (!s) return '';
  return `${head(esc(s.n))}<div class="sheet-body">
    <div class="tags"><span class="badge acc">${GOALS[s.g]}</span><span class="badge bad">Evidencia ${s.ev}</span></div>
    <p>${esc(s.t)}</p>
    <div class="list">${s.r.map(r => `<button class="item" data-act="pep" data-id="${r.p}"><div class="row between"><span class="t">${esc(pepName(r.p))}</span><span class="badge">${esc(ESTADOS[pep(r.p).e])}</span></div><div class="meta num">${esc(r.d)}</div><div class="meta">${esc(r.m)}</div></button>`).join('')}</div>
    <dl class="kv"><dt>Duración</dt><dd>${esc(s.ci)}</dd></dl>
    <div class="notice"><div><b>Ojo.</b> ${esc(s.w)}</div></div>
    <p class="tiny muted">Las combinaciones se basan sobre todo en uso de la comunidad. La mayoría no se ha estudiado en conjunto.</p></div>`;
}

/* ---------- clientes ---------- */
const client = id => db.clientes.find(c => c.id === id);
const lastDose = c => (c.dosis || []).map(d => d.fecha).sort().pop();
function viewCli(v) {
  v.innerHTML = `
  <div class="row between"><div class="stack sm"><h1 class="page-title">Clientes</h1><p class="sub">${db.clientes.length ? `${db.clientes.length} guardados en este dispositivo` : 'Guarda protocolos, dosis y medidas'}</p></div><button class="btn accent sm" data-act="cli-new">${ICON.plus} Cliente</button></div>
  ${backupNotice()}
  ${db.clientes.length ? `<input type="search" id="cli-q" placeholder="Buscar cliente" value="${esc(S.cli.q)}" aria-label="Buscar cliente">` : ''}
  <div class="list" id="cliList"></div>`;
  cliList();
}
function cliList() {
  const el = $('#cliList'); if (!el) return; const q = norm(S.cli.q);
  const rows = db.clientes.filter(c => !q || norm(c.nombre + ' ' + (c.objetivo || '')).includes(q)).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  if (!db.clientes.length) { el.innerHTML = `<div class="empty"><div class="display">Aún no tienes clientes</div><p>Agrega el primero para asignarle protocolos y registrar sus dosis.</p><button class="btn accent" data-act="cli-new">${ICON.plus} Agregar cliente</button></div>`; return; }
  el.innerHTML = rows.length ? rows.map(c => {
    const act = (c.protocolos || []).filter(p => p.activo).length, ld = lastDose(c);
    return `<button class="item" data-act="cli-open" data-id="${c.id}"><div class="row between"><span class="t">${esc(c.nombre)}</span>${act ? `<span class="badge good">${act} activo${act > 1 ? 's' : ''}</span>` : '<span class="badge">Sin protocolo</span>'}</div>
      <div class="meta">${esc(c.objetivo || 'Sin objetivo definido')}</div>${ld ? `<div class="tiny muted">Última dosis: ${fdt(ld)}</div>` : ''}</button>`;
  }).join('') : `<div class="empty"><div class="display">Sin resultados</div></div>`;
}
const protoUnits = p => (p.vialMg > 0 && p.aguaMl > 0 && p.dosis > 0) ? p.dosis / (p.vialMg * 1000 / p.aguaMl) * 100 : NaN;
const protoLine = p => `${pepName(p.pid, p.custom)} · ${dose(p.dosis)}${p.frec ? ' · ' + p.frec : ''}${isFinite(protoUnits(p)) ? ` · jalar ${fmt(protoUnits(p), 1)} u` : ''}`;
const SITIOS = ['Abdomen izq.', 'Abdomen der.', 'Muslo izq.', 'Muslo der.', 'Deltoides izq.', 'Deltoides der.', 'Glúteo izq.', 'Glúteo der.'];

function clientSheet() {
  const c = client(S.cid); if (!c) return head('Cliente') + '<div class="sheet-body"></div>';
  c.protocolos = c.protocolos || []; c.dosis = c.dosis || []; c.medidas = c.medidas || [];
  const T = [['resumen', 'Resumen'], ['proto', 'Protocolos'], ['dosis', 'Dosis'], ['med', 'Medidas']];
  let body = '';
  if (S.ctab === 'resumen') {
    const tel = (c.tel || '').replace(/\D/g, ''), wa = tel ? (tel.length === 10 ? '1' + tel : tel) : '';
    const plan = planText(c);
    body = `<dl class="kv card flat">
      <dt>Teléfono</dt><dd>${esc(c.tel || '—')}</dd><dt>Correo</dt><dd>${esc(c.email || '—')}</dd><dt>Nacimiento</dt><dd>${c.nac ? fdate(c.nac) : '—'}</dd>
      <dt>Objetivo</dt><dd>${esc(c.objetivo || '—')}</dd><dt>Salud / alergias</dt><dd>${esc(c.salud || '—')}</dd><dt>Notas</dt><dd>${esc(c.notas || '—')}</dd></dl>
      <div class="row wrap"><button class="btn ghost sm" data-act="cli-edit">Editar datos</button><button class="btn ghost sm" data-act="copy-plan">${ICON.copy} Copiar plan</button>${wa ? `<a class="btn ghost sm" target="_blank" rel="noopener" href="https://wa.me/${wa}?text=${encodeURIComponent(plan)}">${ICON.chat} WhatsApp</a>` : ''}</div>
      <button class="btn danger sm" data-act="cli-del">Eliminar cliente</button>`;
  } else if (S.ctab === 'proto') {
    body = `<button class="btn accent block" data-act="proto-new">${ICON.plus} Nuevo protocolo</button>
      <div class="list">${c.protocolos.length ? c.protocolos.map(p => `<div class="item"><div class="row between"><span class="t">${esc(pepName(p.pid, p.custom))}</span><span class="badge ${p.activo ? 'good' : ''}">${p.activo ? 'Activo' : 'Finalizado'}</span></div>
        <div class="num">${dose(p.dosis)}${isFinite(protoUnits(p)) ? ` · ${fmt(protoUnits(p), 1)} u` : ''}</div>
        <div class="meta">${esc(p.frec || '')}${p.via ? ' · ' + esc(p.via) : ''}</div><div class="tiny muted">${p.inicio ? 'Desde ' + fdate(p.inicio) : ''}${p.fin ? ' hasta ' + fdate(p.fin) : ''}</div>${p.nota ? `<div class="sub">${esc(p.nota)}</div>` : ''}
        <div class="row wrap"><button class="btn ghost sm" data-act="proto-edit" data-id="${p.id}">Editar</button><button class="btn ghost sm" data-act="proto-toggle" data-id="${p.id}">${p.activo ? 'Finalizar' : 'Reactivar'}</button><button class="btn ghost sm" data-act="dosis-new" data-id="${p.id}">Registrar dosis</button></div></div>`).join('')
        : `<div class="empty"><div class="display">Sin protocolos</div><p>Asigna un péptido con su dosis y frecuencia.</p></div>`}</div>`;
  } else if (S.ctab === 'dosis') {
    const ds = [...c.dosis].sort((a, b) => b.fecha.localeCompare(a.fecha));
    body = `<button class="btn accent block" data-act="dosis-new">${ICON.plus} Registrar dosis</button>
      <div class="list">${ds.length ? ds.map(d => { const p = c.protocolos.find(x => x.id === d.pr); return `<div class="item"><div class="row between"><span class="t">${esc(p ? pepName(p.pid, p.custom) : d.nombre || 'Dosis')}</span><button class="icon-btn" style="color:var(--muted)" data-act="dosis-del" data-id="${d.id}" aria-label="Eliminar registro">${ICON.x}</button></div>
        <div class="num">${dose(d.dosis)}</div><div class="meta">${fdt(d.fecha)}${d.sitio ? ' · ' + esc(d.sitio) : ''}</div>${d.nota ? `<div class="sub">${esc(d.nota)}</div>` : ''}</div>`; }).join('')
        : `<div class="empty"><div class="display">Sin registros</div><p>Anota cada dosis con la fecha y el sitio de inyección.</p></div>`}</div>`;
  } else {
    const ms = [...c.medidas].sort((a, b) => b.fecha.localeCompare(a.fecha));
    body = `<button class="btn accent block" data-act="med-new">${ICON.plus} Nueva medida</button>${sparkWeight(c.medidas)}
      <div class="list">${ms.length ? ms.map(m => `<div class="item"><div class="row between"><span class="t num">${m.peso ? fmt(m.peso, 1) + ' kg' : '—'}</span><button class="icon-btn" style="color:var(--muted)" data-act="med-del" data-id="${m.id}" aria-label="Eliminar medida">${ICON.x}</button></div>
        <div class="meta">${fdate(m.fecha)}${m.cintura ? ' · cintura ' + fmt(m.cintura, 1) + ' cm' : ''}</div>${m.nota ? `<div class="sub">${esc(m.nota)}</div>` : ''}</div>`).join('')
        : `<div class="empty"><div class="display">Sin medidas</div><p>Registra peso y cintura para ver su progreso.</p></div>`}</div>`;
  }
  return `${head(esc(c.nombre))}<div class="subtabs">${T.map(([k, l]) => `<button class="chip" data-act="ctab" data-v="${k}" aria-pressed="${S.ctab === k}">${l}</button>`).join('')}</div><div class="sheet-body">${body}</div>`;
}
function sparkWeight(ms) {
  const pts = ms.filter(m => m.peso > 0).sort((a, b) => a.fecha.localeCompare(b.fecha));
  if (pts.length < 2) return '';
  const W = 320, H = 70, p = 12, vs = pts.map(m => m.peso), mn = Math.min(...vs), mx = Math.max(...vs), r = (mx - mn) || 1;
  const xy = pts.map((m, i) => [p + i * (W - 2 * p) / (pts.length - 1), H - 16 - (m.peso - mn) / r * (H - 32)]);
  const last = xy[xy.length - 1], delta = pts[pts.length - 1].peso - pts[0].peso;
  return `<div class="card flat stack sm"><div class="row between"><span class="section-title" style="margin:0">Peso</span><span class="num tiny">${delta > 0 ? '+' : ''}${fmt(delta, 1)} kg</span></div>
  <svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica de peso"><line x1="${p}" x2="${W - p}" y1="${H - 4}" y2="${H - 4}"/><polyline points="${xy.map(a => a.map(n => n.toFixed(1)).join(',')).join(' ')}"/><circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="4"/><text x="${p}" y="10">${fmt(mx, 1)}</text><text x="${p}" y="${H - 8}">${fmt(mn, 1)}</text></svg></div>`;
}
function planText(c) {
  const act = (c.protocolos || []).filter(p => p.activo);
  return `Plan de ${c.nombre}\n` + (act.length ? act.map(p => '• ' + protoLine(p)).join('\n') : '(sin protocolos activos)') + '\n\nInformación general. No sustituye la indicación de un profesional de la salud.';
}

/* formularios */
const field = (id, label, val = '', o = {}) => `<div class="field"><label for="${id}">${label}</label>${o.area ? `<textarea id="${id}" name="${id}">${esc(val)}</textarea>` : `<input type="${o.type || 'text'}" id="${id}" name="${id}" value="${esc(val)}" ${o.req ? 'required' : ''} ${o.mode ? `inputmode="${o.mode}"` : ''} ${o.step ? `step="${o.step}"` : ''}>`}</div>`;
function clienteForm(c) {
  c = c || {};
  return `${head(c.id ? 'Editar cliente' : 'Nuevo cliente')}<form class="sheet-body" data-form="cliente" data-id="${c.id || ''}" autocomplete="off">
    ${field('f-nombre', 'Nombre', c.nombre, { req: true })}
    <div class="grid2">${field('f-tel', 'Teléfono', c.tel, { type: 'tel' })}${field('f-nac', 'Nacimiento', c.nac, { type: 'date' })}</div>
    ${field('f-email', 'Correo', c.email, { type: 'email' })}
    ${field('f-obj', 'Objetivo', c.objetivo)}
    ${field('f-salud', 'Condiciones, medicamentos o alergias', c.salud, { area: true })}
    ${field('f-notas', 'Notas', c.notas, { area: true })}
    <div class="sheet-foot"><button type="button" class="btn ghost" data-act="close">Cancelar</button><button class="btn accent" type="submit">Guardar</button></div></form>`;
}
function protoForm(p, cid) {
  p = p || { activo: true, inicio: today() };
  const isMg = p.dosis >= 1000, dv = p.dosis ? (isMg ? p.dosis / 1000 : p.dosis) : '';
  return `${head(p.id ? 'Editar protocolo' : 'Nuevo protocolo')}<form class="sheet-body" data-form="proto" data-id="${p.id || ''}" autocomplete="off">
    <div class="field"><label for="f-pid">Péptido</label><select id="f-pid" name="pid">${pepOptions(p.pid, 'Otro (escribir nombre)')}</select></div>
    ${field('f-custom', 'Nombre si es otro', p.custom)}
    <div class="field"><label for="f-dosis">Dosis</label><div class="inline"><input type="text" id="f-dosis" name="dosis" inputmode="decimal" value="${esc(dv)}" required><select id="f-unit" name="unit" aria-label="Unidad"><option value="mcg" ${!isMg ? 'selected' : ''}>mcg</option><option value="mg" ${isMg ? 'selected' : ''}>mg</option></select></div></div>
    ${field('f-frec', 'Frecuencia', p.frec, {})}
    ${field('f-via', 'Vía o sitio', p.via)}
    <div class="grid2">${field('f-ini', 'Inicio', p.inicio, { type: 'date' })}${field('f-fin', 'Fin previsto', p.fin, { type: 'date' })}</div>
    <div class="grid2">${field('f-vial', 'Vial (mg)', p.vialMg || '', { mode: 'decimal' })}${field('f-agua', 'Agua (mL)', p.aguaMl || '', { mode: 'decimal' })}</div>
    <p class="tiny muted">Si ingresas vial y agua, se calcula cuántas unidades jalar.</p>
    ${field('f-nota', 'Notas', p.nota, { area: true })}
    <div class="sheet-foot"><button type="button" class="btn ghost" data-act="close">Cancelar</button><button class="btn accent" type="submit">Guardar</button></div></form>`;
}
function dosisForm(c, prid) {
  const ps = c.protocolos.filter(p => p.activo), sel = ps.find(p => p.id === prid) || ps[0];
  const lastSite = [...c.dosis].sort((a, b) => b.fecha.localeCompare(a.fecha))[0]?.sitio;
  const next = lastSite && SITIOS.includes(lastSite) ? SITIOS[(SITIOS.indexOf(lastSite) + 1) % SITIOS.length] : SITIOS[0];
  return `${head('Registrar dosis')}<form class="sheet-body" data-form="dosis" autocomplete="off">
    <div class="field"><label for="f-pr">Protocolo</label><select id="f-pr" name="pr">${ps.map(p => `<option value="${p.id}" data-d="${p.dosis}" ${sel && sel.id === p.id ? 'selected' : ''}>${esc(pepName(p.pid, p.custom))}</option>`).join('')}<option value="">Otro</option></select></div>
    ${field('f-nom', 'Nombre si es otro', '')}
    ${field('f-fecha', 'Fecha y hora', nowLocal(), { type: 'datetime-local', req: true })}
    <div class="field"><label for="f-dosis">Dosis</label><div class="inline"><input type="text" id="f-dosis" name="dosis" inputmode="decimal" value="${sel ? (sel.dosis >= 1000 ? sel.dosis / 1000 : sel.dosis) : ''}" required><select id="f-unit" name="unit"><option value="mcg" ${sel && sel.dosis >= 1000 ? '' : 'selected'}>mcg</option><option value="mg" ${sel && sel.dosis >= 1000 ? 'selected' : ''}>mg</option></select></div></div>
    <div class="field"><label for="f-sitio">Sitio de inyección</label><select id="f-sitio" name="sitio"><option value="">Sin indicar</option>${SITIOS.map(s => `<option ${s === next ? 'selected' : ''}>${s}</option>`).join('')}</select><div class="tiny muted">Se sugiere el siguiente sitio para rotar.</div></div>
    ${field('f-nota', 'Nota', '')}
    <div class="sheet-foot"><button type="button" class="btn ghost" data-act="close">Cancelar</button><button class="btn accent" type="submit">Guardar</button></div></form>`;
}
function medForm() {
  return `${head('Nueva medida')}<form class="sheet-body" data-form="med" autocomplete="off">
    ${field('f-fecha', 'Fecha', today(), { type: 'date', req: true })}
    <div class="grid2">${field('f-peso', 'Peso (kg)', '', { mode: 'decimal' })}${field('f-cint', 'Cintura (cm)', '', { mode: 'decimal' })}</div>
    ${field('f-nota', 'Nota', '')}
    <div class="sheet-foot"><button type="button" class="btn ghost" data-act="close">Cancelar</button><button class="btn accent" type="submit">Guardar</button></div></form>`;
}

function pepcForm(p) {
  p = p || { e: 'noapr', c: ['rec'] };
  return `${head(p.id ? 'Editar péptido' : 'Péptido propio')}<form class="sheet-body" data-form="pepc" data-id="${p.id || ''}" autocomplete="off">
    ${field('f-n', 'Nombre', p.n, { req: true })}
    ${field('f-a', 'Otros nombres', p.a)}
    <div class="grid2"><div class="field"><label for="f-cat">Categoría</label><select id="f-cat" name="f-cat">${Object.entries(CATS).map(([k, l]) => `<option value="${k}" ${p.c && p.c[0] === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
    <div class="field"><label for="f-est">Estado</label><select id="f-est" name="f-est">${Object.entries(ESTADOS).map(([k, l]) => `<option value="${k}" ${p.e === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
    ${field('f-q', 'Qué es', p.q, { area: true })}
    ${field('f-u', 'Usos (uno por línea)', (p.u || []).join('\n'), { area: true })}
    ${field('f-d', 'Dosis reportada', p.d)}
    <div class="grid2">${field('f-f', 'Frecuencia', p.f)}${field('f-ci', 'Ciclo', p.ci)}</div>
    <div class="grid2">${field('f-v', 'Vía', p.v)}${field('f-vi', 'Vial común (mg)', (p.vi || [])[0] || '', { mode: 'decimal' })}</div>
    ${field('f-p', 'Precauciones', p.p, { area: true })}
    <div class="sheet-foot"><button type="button" class="btn ghost" data-act="close">Cancelar</button><button class="btn accent" type="submit">Guardar</button></div></form>`;
}

/* ---------- viales ---------- */
const VEST = { liof: ['Liofilizado', ''], rec: ['Reconstituido', 'acc'], fin: ['Terminado', ''] };
const vialExp = v => v.estado === 'rec' && v.recon ? addDays(v.recon, 28) : '';
function viewVial(v) {
  const vs = [...db.viales].sort((a, b) => (a.estado === 'fin') - (b.estado === 'fin') || (vialExp(a) || '9').localeCompare(vialExp(b) || '9'));
  v.innerHTML = `
  <div class="row between"><div class="stack sm"><h1 class="page-title">Viales</h1><p class="sub">${db.viales.length ? 'Inventario y fecha de descarte' : 'Controla qué tienes y cuándo vence'}</p></div><button class="btn accent sm" data-act="vial-new">${ICON.plus} Vial</button></div>
  <div class="list">${vs.length ? vs.map(x => {
    const exp = vialExp(x), left = exp ? daysBetween(today(), exp) : null;
    const b = x.estado === 'rec' ? (left < 0 ? ['bad', 'Descartar'] : left <= 5 ? ['warn', `${left} d restantes`] : ['good', `${left} d restantes`]) : null;
    const conc = x.estado === 'rec' && x.mg && x.agua ? `${fmt(x.mg * 1000 / x.agua, 0)} mcg/mL` : '';
    return `<button class="item" data-act="vial-edit" data-id="${x.id}"><div class="row between"><span class="t">${esc(pepName(x.pid, x.custom))} <span class="num muted" style="font-size:14px">${fmt(x.mg, 1)} mg</span></span>${b ? `<span class="badge ${b[0]}">${b[1]}</span>` : `<span class="badge">${VEST[x.estado][0]}</span>`}</div>
      <div class="meta">${x.estado === 'rec' ? `Reconstituido ${fdate(x.recon)}${conc ? ' · ' + conc : ''}` : VEST[x.estado][0]}${x.lote ? ' · Lote ' + esc(x.lote) : ''}${x.prov ? ' · ' + esc(x.prov) : ''}</div>${exp ? `<div class="tiny muted">Descartar el ${fdate(exp)}</div>` : ''}</button>`;
  }).join('') : `<div class="empty"><div class="display">Sin viales</div><p>Agrega los que tienes o guárdalos desde la calculadora. La fecha de descarte se calcula a 28 días de reconstituir.</p><button class="btn accent" data-act="vial-new">${ICON.plus} Agregar vial</button></div>`}</div>`;
}
function vialForm(x) {
  x = x || { estado: 'liof', recibido: today() };
  return `${head(x.id ? 'Editar vial' : 'Nuevo vial')}<form class="sheet-body" data-form="vial" data-id="${x.id || ''}" autocomplete="off">
    <div class="field"><label for="f-pid">Péptido</label><select id="f-pid" name="pid">${pepOptions(x.pid, 'Otro (escribir nombre)')}</select></div>
    ${field('f-custom', 'Nombre si es otro', x.custom)}
    <div class="grid2">${field('f-mg', 'Contenido (mg)', x.mg || '', { mode: 'decimal', req: true })}
      <div class="field"><label for="f-estado">Estado</label><select id="f-estado" name="estado">${Object.entries(VEST).map(([k, [l]]) => `<option value="${k}" ${x.estado === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
    <div class="grid2">${field('f-recon', 'Fecha de reconstitución', x.recon, { type: 'date' })}${field('f-agua', 'Agua (mL)', x.agua || '', { mode: 'decimal' })}</div>
    <div class="grid2">${field('f-lote', 'Lote', x.lote)}${field('f-prov', 'Proveedor', x.prov)}</div>
    ${field('f-rec', 'Fecha recibido', x.recibido, { type: 'date' })}
    ${field('f-nota', 'Notas', x.nota, { area: true })}
    <div class="sheet-foot"><button type="button" class="btn ghost" data-act="close">Cancelar</button><button class="btn accent" type="submit">Guardar</button></div>
    ${x.id ? `<button type="button" class="btn danger" data-act="vial-del" data-id="${x.id}">Eliminar vial</button>` : ''}</form>`;
}

/* ---------- ajustes y avisos ---------- */
let installEv = null;
const standalone = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const appCard = () => standalone() ? '' : `<div class="card flat stack sm"><div class="section-title">Instalar en el teléfono</div>${installEv
  ? `<p class="sub">Instálala para abrirla como una app y usarla sin internet.</p><button class="btn accent sm" data-act="install">Instalar app</button>`
  : `<p class="sub"><b>Android (Chrome):</b> menú ⋮ y luego "Instalar app" o "Añadir a pantalla de inicio".<br><b>iPhone (Safari):</b> botón Compartir y luego "Añadir a pantalla de inicio".</p>`}</div>`;
const backupDue = () => db.clientes.length > 0 && (!db.cfg.respaldo || daysBetween(db.cfg.respaldo, today()) > 30);
const backupNotice = () => backupDue() ? `<div class="notice"><div>${db.cfg.respaldo ? 'Hace más de 30 días que no haces un respaldo.' : 'Aún no has hecho un respaldo de tus clientes.'} <button class="link" data-act="settings">Hacer respaldo</button></div></div>` : '';
function settingsSheet() {
  return `${head('Ajustes')}<div class="sheet-body">
    <div class="field"><label for="s-tema">Tema</label><select id="s-tema"><option value="auto" ${db.cfg.tema === 'auto' ? 'selected' : ''}>Automático</option><option value="light" ${db.cfg.tema === 'light' ? 'selected' : ''}>Claro</option><option value="dark" ${db.cfg.tema === 'dark' ? 'selected' : ''}>Oscuro</option></select></div>
    ${appCard()}
    <div class="card flat stack sm"><div class="section-title">Respaldo</div><p class="sub">Tus datos se guardan solo en este dispositivo. Exporta un respaldo para no perderlos o para pasarlos a otro teléfono.</p>
      <p class="tiny muted">${db.cfg.respaldo ? 'Último respaldo: ' + fdate(db.cfg.respaldo) : 'Aún no has hecho un respaldo.'}</p>
      <div class="row wrap"><button class="btn ghost sm" data-act="export">Exportar respaldo</button><label class="btn ghost sm" for="s-import">Importar respaldo</label><input type="file" id="s-import" accept="application/json,.json" hidden></div></div>
    <button class="btn ghost" data-act="aviso">Aviso importante</button>
    <button class="btn danger" data-act="wipe">Borrar todos los datos</button>
    <p class="tiny muted">Elite Twin Peptides · ${allPep().length} fichas · versión 1.4</p></div>`;
}
const avisoSheet = lock => `${head('Aviso importante')}<div class="sheet-body">
  <p>Esta app reúne información general y educativa sobre péptidos, lipotrópicos, vitaminas y suplementos, y una calculadora matemática de reconstitución.</p>
  <ul class="dots"><li>No es consejo médico ni sustituye la indicación de un profesional de la salud.</li><li>Muchos péptidos no están aprobados por la FDA para uso humano y su seguridad a largo plazo no está establecida.</li><li>Los rangos de dosis son los reportados en etiquetas, estudios o la comunidad. No son una recomendación personal.</li><li>Verifica siempre cada cálculo antes de administrar nada y consulta con un profesional con licencia.</li><li>Las fichas de clientes contienen datos personales y de salud. Protege tu dispositivo y respeta su privacidad.</li></ul>
  ${lock ? `<button class="btn accent block" data-act="accept">Entiendo y continúo</button>` : `<button class="btn ghost block" data-act="close">Cerrar</button>`}</div>`;

/* ---------- acciones ---------- */
const A = {
  tab(el) { S.tab = el.dataset.tab; render(); window.scrollTo(0, 0); },
  close: closeLayer,
  yes() { const f = S._yes; S._yes = null; S.stack.pop(); if (f) f(); renderStack(); },
  settings() { openLayer(settingsSheet); },
  install() { if (!installEv) return; installEv.prompt(); installEv.userChoice.finally(() => { installEv = null; renderStack(); }); },
  aviso() { openLayer(() => avisoSheet(false)); },
  accept() { db.cfg.aceptado = true; save(); S.stack = []; renderStack(); },
  'calc-water'(el) { $('#c-agua').value = el.dataset.v; readCalc(); calcUpdate(); },
  'calc-units'(el) {
    readCalc(); const c = S.calc, mg = num(c.mg), dv = num(c.dosis), dm = c.unit === 'mg' ? dv * 1000 : dv; if (!(mg > 0 && dm > 0)) return;
    const w = Math.round(mg * 1000 * (+el.dataset.v / 100) / dm * 100) / 100; $('#c-agua').value = String(w); readCalc(); calcUpdate();
  },
  'calc-savevial'() {
    readCalc(); const c = S.calc;
    db.viales.push({ id: uid(), pid: c.pid, custom: c.pid ? '' : 'Vial', mg: num(c.mg), agua: num(c.agua), estado: 'rec', recon: today(), recibido: today() });
    save(); S.tab = 'vial'; render(); toast('Vial guardado');
  },
  'pep-calc'(el) {
    const p = pep(el.dataset.id); const mn = p.mn || 0;
    S.calc = { pid: p.id, mg: String((p.vi || [])[0] || ''), agua: S.calc.agua || '2', dosis: mn ? String(mn >= 1000 ? mn / 1000 : mn) : '', unit: mn >= 1000 ? 'mg' : 'mcg', jer: S.calc.jer, frec: S.calc.frec };
    S.stack = []; S.tab = 'calc'; renderStack(); render(); window.scrollTo(0, 0);
  },
  'pepc-new'() { openLayer(() => pepcForm()); },
  'pepc-edit'(el) { const p = db.custom.find(x => x.id === el.dataset.id); openLayer(() => pepcForm(p)); },
  'pepc-del'(el) { const id = el.dataset.id; confirmLayer('Se borrará este péptido de tu biblioteca.', () => { db.custom = db.custom.filter(x => x.id !== id); save(); S.stack = []; render(); toast('Péptido eliminado'); }); },
  'lib-seg'(el) { S.lib.seg = el.dataset.v; render(); },
  'lib-cat'(el) { S.lib.cat = el.dataset.v; viewLib($('#view')); },
  'lib-goal'(el) { S.lib.goal = el.dataset.v; viewLib($('#view')); },
  pep(el) { const id = el.dataset.id; openLayer(() => pepDetail(id)); },
  stack(el) { const id = el.dataset.id; openLayer(() => stackDetail(id)); },
  'cli-new'() { openLayer(() => clienteForm()); },
  'cli-open'(el) { S.cid = el.dataset.id; S.ctab = 'resumen'; openLayer(clientSheet, { full: true }); },
  'cli-edit'() { const c = client(S.cid); openLayer(() => clienteForm(c)); },
  'cli-del'() { const id = S.cid; confirmLayer('Se borrará el cliente con todos sus protocolos, dosis y medidas.', () => { db.clientes = db.clientes.filter(c => c.id !== id); save(); S.stack = []; render(); toast('Cliente eliminado'); }); },
  ctab(el) { S.ctab = el.dataset.v; renderStack(); },
  'copy-plan'() { copyText(planText(client(S.cid))); },
  'proto-new'() { openLayer(() => protoForm()); },
  'proto-edit'(el) { const p = client(S.cid).protocolos.find(x => x.id === el.dataset.id); openLayer(() => protoForm(p)); },
  'proto-toggle'(el) { const p = client(S.cid).protocolos.find(x => x.id === el.dataset.id); p.activo = !p.activo; save(); renderStack(); },
  'dosis-new'(el) { const c = client(S.cid), id = el.dataset.id; if (!c.protocolos.some(p => p.activo)) { toast('Crea un protocolo activo primero'); return; } openLayer(() => dosisForm(c, id)); },
  'dosis-del'(el) { const c = client(S.cid); c.dosis = c.dosis.filter(d => d.id !== el.dataset.id); save(); renderStack(); },
  'med-new'() { openLayer(medForm); },
  'med-del'(el) { const c = client(S.cid); c.medidas = c.medidas.filter(m => m.id !== el.dataset.id); save(); renderStack(); },
  'vial-new'() { openLayer(() => vialForm()); },
  'vial-edit'(el) { const x = db.viales.find(v => v.id === el.dataset.id); openLayer(() => vialForm(x)); },
  'vial-del'(el) { const id = el.dataset.id; confirmLayer('Se borrará este vial del inventario.', () => { db.viales = db.viales.filter(v => v.id !== id); save(); S.stack = []; render(); }); },
  export() {
    const blob = new Blob([JSON.stringify({ app: 'peptidospr', v: 1, fecha: new Date().toISOString(), ...db }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `peptidos-respaldo-${today()}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); db.cfg.respaldo = today(); save(); toast('Respaldo exportado');
  },
  wipe() { confirmLayer('Se borrarán todos los clientes, viales y ajustes de este dispositivo.', () => { db = { clientes: [], viales: [], custom: [], cfg: { aceptado: true, tema: 'auto' } }; save(); applyTheme(); S.stack = []; render(); toast('Datos borrados'); }); }
};

function copyText(t) {
  const fallback = () => { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('Plan copiado'); } catch (e) { toast('No se pudo copiar'); } ta.remove(); };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(t).then(() => toast('Plan copiado'), fallback); else fallback();
}

/* formularios: guardar */
const F = {
  pepc(f) {
    const g = n => f.elements[n].value.trim(), id = f.dataset.id; if (!g('f-n')) return;
    const vi = num(g('f-vi'));
    const d = { n: g('f-n'), a: g('f-a'), c: [g('f-cat')], e: g('f-est'), q: g('f-q'), u: g('f-u').split('\n').map(x => x.trim()).filter(Boolean), d: g('f-d'), f: g('f-f'), ci: g('f-ci'), v: g('f-v'), vi: vi > 0 ? [vi] : [], p: g('f-p'), ev: 'baja', evn: 'Entrada propia', propio: true };
    if (id) Object.assign(db.custom.find(x => x.id === id), d); else db.custom.push({ id: 'u_' + uid(), ...d });
    save(); S.stack.pop(); render(); renderStack(); toast('Péptido guardado');
  },
  cliente(f) {
    const g = n => f.elements[n].value.trim(), id = f.dataset.id;
    const d = { nombre: g('f-nombre'), tel: g('f-tel'), nac: g('f-nac'), email: g('f-email'), objetivo: g('f-obj'), salud: g('f-salud'), notas: g('f-notas') };
    if (!d.nombre) return;
    if (id) Object.assign(client(id), d); else { const c = { id: uid(), ...d, protocolos: [], dosis: [], medidas: [], creado: today() }; db.clientes.push(c); }
    save(); S.stack.pop(); render(); renderStack(); toast('Cliente guardado');
  },
  proto(f) {
    const c = client(S.cid), g = n => f.elements[n].value.trim(), id = f.dataset.id;
    let dv = num(g('f-dosis')); if (!(dv > 0)) { toast('Ingresa una dosis válida'); return; }
    const pid = g('f-pid'), custom = g('f-custom'); if (!pid && !custom) { toast('Elige un péptido o escribe el nombre'); return; }
    const d = { pid, custom: pid ? '' : custom, dosis: f.elements['f-unit'].value === 'mg' ? dv * 1000 : dv, frec: g('f-frec'), via: g('f-via'), inicio: g('f-ini'), fin: g('f-fin'), vialMg: num(g('f-vial')) || 0, aguaMl: num(g('f-agua')) || 0, nota: g('f-nota') };
    if (id) Object.assign(c.protocolos.find(p => p.id === id), d); else c.protocolos.push({ id: uid(), activo: true, ...d });
    save(); S.stack.pop(); renderStack(); render(); toast('Protocolo guardado');
  },
  dosis(f) {
    const c = client(S.cid), g = n => f.elements[n].value.trim(); const dv = num(g('f-dosis')); if (!(dv > 0)) { toast('Ingresa una dosis válida'); return; }
    c.dosis.push({ id: uid(), pr: g('f-pr'), nombre: g('f-nom'), fecha: g('f-fecha'), dosis: f.elements['f-unit'].value === 'mg' ? dv * 1000 : dv, sitio: g('f-sitio'), nota: g('f-nota') });
    save(); S.ctab = 'dosis'; S.stack.pop(); renderStack(); render(); toast('Dosis registrada');
  },
  med(f) {
    const c = client(S.cid), g = n => f.elements[n].value.trim(); const peso = num(g('f-peso')), cint = num(g('f-cint'));
    if (!(peso > 0) && !(cint > 0)) { toast('Ingresa peso o cintura'); return; }
    c.medidas.push({ id: uid(), fecha: g('f-fecha'), peso: peso > 0 ? peso : 0, cintura: cint > 0 ? cint : 0, nota: g('f-nota') });
    save(); S.ctab = 'med'; S.stack.pop(); renderStack(); toast('Medida guardada');
  },
  vial(f) {
    const g = n => f.elements[n].value.trim(), id = f.dataset.id, mg = num(g('f-mg'));
    if (!(mg > 0)) { toast('Ingresa el contenido del vial'); return; }
    const pid = g('f-pid'), custom = g('f-custom'); if (!pid && !custom) { toast('Elige un péptido o escribe el nombre'); return; }
    const estado = g('f-estado'), recon = g('f-recon') || (estado === 'rec' ? today() : '');
    const d = { pid, custom: pid ? '' : custom, mg, estado, recon, agua: num(g('f-agua')) || 0, lote: g('f-lote'), prov: g('f-prov'), recibido: g('f-rec'), nota: g('f-nota') };
    if (id) Object.assign(db.viales.find(v => v.id === id), d); else db.viales.push({ id: uid(), ...d });
    save(); S.stack.pop(); renderStack(); render(); toast('Vial guardado');
  }
};

/* ---------- eventos ---------- */
document.addEventListener('click', e => {
  const sc = e.target.closest('.scrim');
  if (sc && e.target === sc) { closeLayer(); return; }
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = A[el.dataset.act]; if (fn) { if (el.tagName === 'A') return fn(el, e); e.preventDefault(); fn(el, e); }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.closest('#calcForm')) { readCalc(); calcUpdate(); }
  else if (t.id === 'lib-q') { S.lib.q = t.value; libList(); }
  else if (t.id === 'cli-q') { S.cli.q = t.value; cliList(); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'c-pid') {
    const p = pep(t.value);
    if (p) { const mn = p.mn || 0; $('#c-mg').value = String((p.vi || [])[0] || ''); $('#c-dosis').value = mn ? String(mn >= 1000 ? mn / 1000 : mn) : ''; $('#c-unit').value = mn >= 1000 ? 'mg' : 'mcg'; }
    readCalc(); calcUpdate();
  } else if (t.id === 's-tema') { db.cfg.tema = t.value; save(); applyTheme(); }
  else if (t.id === 'f-pr') { const o = t.selectedOptions[0], d = num(o?.dataset.d); if (d > 0) { $('#f-dosis').value = String(d >= 1000 ? d / 1000 : d); $('#f-unit').value = d >= 1000 ? 'mg' : 'mcg'; } }
  else if (t.id === 's-import') {
    const f = t.files[0]; if (!f) return; const r = new FileReader();
    r.onload = () => { try { const j = JSON.parse(r.result); if (!Array.isArray(j.clientes) || !Array.isArray(j.viales)) throw 0;
      confirmLayer('El respaldo reemplazará los datos actuales de este dispositivo.', () => { db = { clientes: j.clientes, viales: j.viales, custom: j.custom || [], cfg: Object.assign({ aceptado: true, tema: 'auto' }, j.cfg) }; save(); applyTheme(); S.stack = []; render(); toast('Respaldo importado'); }); }
      catch (err) { toast('El archivo no es un respaldo válido'); } };
    r.readAsText(f);
  }
});
document.addEventListener('submit', e => { e.preventDefault(); const f = e.target.closest('form[data-form]'); if (f) F[f.dataset.form](f); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLayer(); });

/* ---------- inicio ---------- */
$('[data-act="settings"]').innerHTML = ICON.gear;
applyTheme();
render();
if (!db.cfg.aceptado) openLayer(() => avisoSheet(true), { lock: true });
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEv = e; });
window.addEventListener('appinstalled', () => { installEv = null; toast('App instalada'); });
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
/*SW-START*/
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  const hadSW = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadSW) toast('Hay una versión nueva. Cierra y abre la app.'); });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
    .then(r => document.addEventListener('visibilitychange', () => { if (!document.hidden) r.update().catch(() => {}); }))
    .catch(() => {});
}
/*SW-END*/
})();
