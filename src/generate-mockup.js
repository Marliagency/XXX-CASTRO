const fs = require('fs');
const { Resvg } = require('@resvg/resvg-js');

/* ── REAL QYRO design tokens (light theme) ───────────────────────────────── */
const C = {
  void: '#F1F4FB', appBg: '#F8F9FE', surface: '#FFFFFF',
  hover: '#F0F2FB', sunken: '#EEF0F8',
  borderSubtle: 'rgba(66,65,245,0.08)', borderDefault: 'rgba(66,65,245,0.13)',
  ink: '#161930', sec: 'rgba(22,25,48,0.65)', ter: 'rgba(22,25,48,0.38)',
  blue: '#42A5F5', blueDark: '#1E88E5', purple: '#7B1FA2', purpleMid: '#AB47BC',
  teal: '#26C6DA', success: '#2ECC71', warning: '#F39C12', danger: '#E74C3C',
  cWorkout: '#F4511E', cNutrition: '#2ECC71', cJournal: '#AB47BC', cTask: '#26C6DA',
  neutral900: '#161930', neutral300: '#C9CDE3',
};
const GRAD = 'url(#qgrad)';

/* ── font weight → family map (Plus Jakarta Sans static faces) ───────────── */
function fam(w) {
  if (w >= 800) return 'Plus Jakarta Sans ExtraBold';
  if (w >= 600) return 'Plus Jakarta Sans SemiBold';
  if (w >= 500) return 'Plus Jakarta Sans Medium';
  return 'Plus Jakarta Sans';
}
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function T(x, y, t, { size = 14, fill = C.ink, w = 400, anchor = 'start', ls = 0, mono = false, op = 1 } = {}) {
  const family = mono ? 'JetBrains Mono' : fam(w);
  const fw = mono ? (w >= 600 ? 700 : 400) : w;
  return `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" font-weight="${fw}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${op}">${esc(t)}</text>`;
}
function rr(x, y, w, h, r, fill, extra = '') {
  return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" rx="${r}" ry="${r}" fill="${fill}" ${extra}/>`;
}
function ic(d, x, y, s, { stroke = '#fff', sw = 2, fill = 'none', op = 1 } = {}) {
  const k = s / 24;
  return `<g transform="translate(${x},${y}) scale(${k})" opacity="${op}"><path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}
/* lucide-approx icons (24x24) */
const I = {
  flame: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  dumbbell: 'M6.5 6.5v11 M9.5 8.5v7 M14.5 8.5v7 M17.5 6.5v11 M9.5 12h5 M4.5 9.5v5 M19.5 9.5v5',
  trophy: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6 M18 9h1.5a2.5 2.5 0 0 0 0-5H18 M4 22h16 M10 14.7V17c0 .6-.5 1-1 1.2C7.9 18.8 7 20.2 7 22 M14 14.7V17c0 .6.5 1 1 1.2 1.2.5 2 2 2 3.8 M6 2h12v7a6 6 0 0 1-12 0z',
  trendingUp: 'M3 17l6-6 4 4 8-8 M17 7h4v4',
  brain: 'M9.5 4.5a2.6 2.6 0 0 0-2.6 2.6 2.8 2.8 0 0 0-1.4 5.2A2.6 2.6 0 0 0 7 17.5a2.4 2.4 0 0 0 5 0V6a2.4 2.4 0 0 0-2.5-1.5z M14.5 4.5a2.6 2.6 0 0 1 2.6 2.6 2.8 2.8 0 0 1 1.4 5.2A2.6 2.6 0 0 1 17 17.5a2.4 2.4 0 0 1-5 0',
  target3: '',
  sun: 'M12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
  smile: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M8.5 14.5s1.3 1.8 3.5 1.8 3.5-1.8 3.5-1.8 M9 9.5h.01 M15 9.5h.01',
  utensils: 'M4 3v6a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3 M6 11v10 M17.5 3C16 3 15 5 15 8s.7 4 2.5 4M17.5 3v18',
  checkCircle: 'M22 11.1V12a10 10 0 1 1-5.9-9.1 M22 4 12 14.1l-3-3',
  bot: 'M12 8V4 M9 4h6 M5 8h14a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1z M2 13h2 M20 13h2 M9.5 13v1.5 M14.5 13v1.5',
  send: 'M22 2 11 13 M22 2l-7 20-4-9-9-4z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M5.5 20a6.5 6.5 0 0 1 13 0',
  trash: 'M3 6h18 M8 6V4h8v2 M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14',
  apple: 'M12 7c-1-2-3-2.5-4.5-2C5 6 4 9 5 13c.8 3 2.5 6 4 6 .8 0 1.3-.4 3-.4s2.2.4 3 .4c1.5 0 3.2-3 4-6 1-4 0-7-2.5-8-1.5-.5-3.5 0-4.5 2z M12 7c.2-2 1.4-3.3 3-3.6',
  more: 'M5 12h.01 M12 12h.01 M19 12h.01',
  dash: 'M3 3h7v8H3z M14 3h7v5h-7z M14 11h7v10h-7z M3 14h7v7H3z',
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  droplet: 'M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5S12.6 5 12 2.5C11.5 5 10 7.4 8 9S5 13 5 15a7 7 0 0 0 7 7z',
  lotus: 'M12 20c-4 0-7-2-8-5 1.5-.6 3-.4 4.2.3M12 20c4 0 7-2 8-5-1.5-.6-3-.4-4.2.3M12 20c-2-1.5-3-3.7-3-6 0-2.2 1.2-4.4 3-6 1.8 1.6 3 3.8 3 6 0 2.3-1 4.5-3 6z',
  chevR: 'M9 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
};
function circles3(cx, cy, col) { // target icon
  return `<circle cx="${cx}" cy="${cy}" r="9" fill="none" stroke="${col}" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="5" fill="none" stroke="${col}" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="1.6" fill="${col}"/>`;
}

/* ── canvas ──────────────────────────────────────────────────────────────── */
const W = 1800, H = 1230;
const P = []; const push = (s) => P.push(s);

push(`<defs>
  <linearGradient id="qgrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${C.blue}"/><stop offset="100%" stop-color="${C.purple}"/>
  </linearGradient>
  <linearGradient id="qteal" x1="0" y1="1" x2="1" y2="0">
    <stop offset="0%" stop-color="${C.teal}"/><stop offset="100%" stop-color="${C.blue}"/>
  </linearGradient>
  <linearGradient id="canvasBg" x1="0" y1="0" x2="0.3" y2="1">
    <stop offset="0%" stop-color="#EAEFFA"/><stop offset="100%" stop-color="#F4F2FA"/>
  </linearGradient>
  <radialGradient id="gB" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${C.blue}" stop-opacity="0.20"/><stop offset="100%" stop-color="${C.blue}" stop-opacity="0"/></radialGradient>
  <radialGradient id="gP" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="${C.purple}" stop-opacity="0.16"/><stop offset="100%" stop-color="${C.purple}" stop-opacity="0"/></radialGradient>
  <filter id="phoneShadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="26" stdDeviation="38" flood-color="#1a1f3a" flood-opacity="0.28"/></filter>
  <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#161930" flood-opacity="0.06"/></filter>
</defs>`);
push(rr(0, 0, W, H, 0, 'url(#canvasBg)'));
push(`<ellipse cx="180" cy="120" rx="640" ry="520" fill="url(#gB)"/>`);
push(`<ellipse cx="1650" cy="160" rx="640" ry="520" fill="url(#gP)"/>`);

/* ── QYRO logo (faithful to QyroLogo.tsx) ──────────────────────────────── */
function qyroLogo(x, y, s) {
  const k = s / 32;
  return `<g transform="translate(${x},${y}) scale(${k})" filter="url(#cardShadow)">
    <rect width="32" height="32" rx="8" fill="${GRAD}"/>
    <circle cx="13" cy="14" r="6" stroke="#fff" stroke-width="2.5" fill="none"/>
    <line x1="17" y1="18" x2="21" y2="22" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="23" cy="9" r="3" fill="url(#qteal)"/>
  </g>`;
}

/* ── header strip ─────────────────────────────────────────────────────────── */
push(qyroLogo(96, 64, 58));
push(T(170, 112, 'QYRO', { size: 46, w: 800, fill: GRAD, ls: -1.5 }));
push(T(172, 138, 'Habit & life tracker con IA', { size: 18, w: 600, fill: C.sec }));
push(T(W - 96, 96, 'Vista de producto', { size: 14, w: 600, fill: C.sec, anchor: 'end' }));
push(T(W - 96, 120, '3 pantallas · diseño real de la app', { size: 13, w: 400, fill: C.ter, anchor: 'end' }));

/* ── status bar (light) ─────────────────────────────────────────────────── */
function statusBar(sw) {
  return T(24, 32, '9:41', { size: 14, w: 700, fill: C.ink }) +
    `<g fill="${C.ink}">
      <rect x="${sw - 76}" y="22" width="3" height="8" rx="1"/><rect x="${sw - 71}" y="19" width="3" height="11" rx="1"/>
      <rect x="${sw - 66}" y="16" width="3" height="14" rx="1"/><rect x="${sw - 61}" y="13" width="3" height="17" rx="1"/>
      <path d="M${sw - 50} 18a8 8 0 0 1 11 0" fill="none" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="${sw - 44.5}" cy="25" r="1.7"/>
      <rect x="${sw - 32}" y="16" width="22" height="11" rx="3" fill="none" stroke="${C.ink}" stroke-width="1.5" opacity="0.5"/>
      <rect x="${sw - 29}" y="18.5" width="16" height="6" rx="1.5"/><rect x="${sw - 9}" y="19" width="2" height="5" rx="1"/>
    </g>`;
}

/* ── bottom nav ──────────────────────────────────────────────────────────── */
function bottomNav(sw, sh, activeIdx) {
  const items = [['dash', 'Inicio'], ['sun', 'Hoy'], ['dumbbell', 'Entrenos'], ['apple', 'Nutrición'], ['target', 'Objetivos'], ['more', 'Más']];
  const navH = 62, navY = sh - navH, step = sw / 6;
  let g = rr(0, navY, sw, navH, 0, 'rgba(255,255,255,0.96)');
  g += `<line x1="0" y1="${navY}" x2="${sw}" y2="${navY}" stroke="${C.borderSubtle}"/>`;
  items.forEach(([key, lbl], i) => {
    const cx = step * i + step / 2;
    const active = i === activeIdx;
    const col = active ? C.blue : C.ter;
    const d = key === 'target' ? null : I[key];
    if (key === 'target') g += `<g transform="translate(${cx - 11},${navY + 12})">${circles3(11, 11, col)}</g>`;
    else g += ic(d, cx - 11, navY + 12, 22, { stroke: col, sw: active ? 2.1 : 1.7 });
    if (active) g += `<circle cx="${cx}" cy="${navY + 37}" r="1.6" fill="${GRAD}"/>`;
    g += T(cx, navY + 52, lbl.toUpperCase(), { size: 8, w: 700, fill: col, anchor: 'middle', ls: 0.4 });
  });
  g += rr(sw / 2 - 58, sh - 9, 116, 4.5, 2.5, 'rgba(22,25,48,0.18)');
  return g;
}

function sparkline(x, y, w, h, col) {
  const pts = [0.3, 0.5, 0.35, 0.6, 0.45, 0.7, 0.55, 0.8, 0.65, 0.95];
  const step = w / (pts.length - 1);
  const d = pts.map((p, i) => `${(x + i * step).toFixed(1)},${(y + h - p * h).toFixed(1)}`).join(' ');
  return `<polyline points="${d}" fill="none" stroke="${col}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`;
}

/* ── SCREEN 1: INICIO (dashboard) ───────────────────────────────────────── */
function screenInicio(sw, sh) {
  const o = [statusBar(sw)];
  // header
  o.push(T(20, 78, 'Buenos días, Marli', { size: 21, w: 700, fill: C.ink, ls: -0.4 }));
  o.push(T(20, 99, 'martes, 27 de mayo', { size: 12.5, w: 400, fill: C.ter }));
  o.push(`<circle cx="${sw - 38}" cy="78" r="18" fill="${GRAD}"/>`);
  o.push(T(sw - 38, 84, 'M', { size: 16, w: 700, fill: '#fff', anchor: 'middle' }));

  // KPI band 2-col
  const pad = 16, gap = 10;
  const cw = (sw - pad * 2 - gap) / 2, ch = 82;
  const kpis = [
    { lbl: 'Life Score', val: '78', sub: '/ 100', ic: 'brain', col: C.blue, spark: true },
    { lbl: 'Hábitos hoy', val: '67%', ic: 'flame', col: C.blue, spark: true },
    { lbl: 'Entrenos semana', val: '2', sub: '/ 3', ic: 'dumbbell', col: C.neutral900, spark: true },
    { lbl: 'Total sesiones', val: '48', ic: 'target', col: C.cNutrition },
    { lbl: 'PRs conseguidos', val: '12', ic: 'trophy', col: C.warning },
    { lbl: 'Tendencia 7d', val: '+5', sub: 'pts', ic: 'trendingUp', col: C.success },
  ];
  let ky = 116;
  kpis.forEach((k, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = pad + col * (cw + gap), y = ky + row * (ch + gap);
    o.push(rr(x, y, cw, ch, 18, C.surface, `stroke="${C.borderSubtle}" filter="url(#cardShadow)"`));
    o.push(rr(x + 12, y + 12, 26, 26, 9, k.col));
    if (k.ic === 'target') o.push(`<g transform="translate(${x + 18},${y + 18})">${circles3(7, 7, '#fff')}</g>`);
    else o.push(ic(I[k.ic], x + 18, y + 18, 14, { stroke: '#fff', sw: 2.1 }));
    if (k.spark) o.push(sparkline(x + cw - 56, y + 16, 44, 16, k.col));
    o.push(T(x + 12, y + 64, k.val, { size: 24, w: 800, fill: C.ink, ls: -0.5 }));
    if (k.sub) {
      const vw = [...k.val].reduce((a, c) => a + (c === '%' ? 0.64 : c === '+' ? 0.56 : c === '.' ? 0.3 : c === '/' ? 0.44 : 0.6), 0) * 24;
      o.push(T(x + 12 + vw + 5, y + 64, k.sub, { size: 12, w: 400, fill: C.ter }));
    }
    o.push(T(x + 12, y + 76, k.lbl, { size: 10.5, w: 500, fill: C.ter }));
  });

  // Activity rings card
  const ay = ky + 3 * (ch + gap) + 4;
  const aCardH = 150;
  o.push(rr(pad, ay, sw - pad * 2, aCardH, 20, C.surface, `stroke="${C.borderSubtle}" filter="url(#cardShadow)"`));
  o.push(T(pad + 16, ay + 26, 'ACTIVIDAD HOY', { size: 11, w: 700, fill: C.ter, ls: 0.8 }));
  // rings
  const rcx = pad + 16 + 58, rcy = ay + 92, ringDefs = [
    { v: 67, col: C.blue, r: 52 }, { v: 67, col: C.cWorkout, r: 39 }, { v: 82, col: C.cNutrition, r: 26 },
  ];
  ringDefs.forEach((rg) => {
    const Cc = 2 * Math.PI * rg.r;
    o.push(`<circle cx="${rcx}" cy="${rcy}" r="${rg.r}" fill="none" stroke="${rg.col}" stroke-opacity="0.16" stroke-width="11"/>`);
    o.push(`<circle cx="${rcx}" cy="${rcy}" r="${rg.r}" fill="none" stroke="${rg.col}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${(Cc * rg.v / 100).toFixed(1)} ${(Cc * (1 - rg.v / 100)).toFixed(1)}" transform="rotate(-90 ${rcx} ${rcy})"/>`);
  });
  // legend
  const lx = rcx + 70;
  const legend = [['Hábitos', 67, C.blue, '4/6 completados'], ['Entrenos', 67, C.cWorkout, '2 sesiones esta semana'], ['Nutrición', 82, C.cNutrition, '1.840 kcal']];
  legend.forEach((lg, i) => {
    const y = ay + 56 + i * 30;
    o.push(`<circle cx="${lx + 5}" cy="${y - 4}" r="5" fill="${lg[2]}"/>`);
    o.push(T(lx + 18, y, lg[0], { size: 12.5, w: 500, fill: C.sec }));
    o.push(T(sw - pad - 16, y, lg[1] + '%', { size: 12.5, w: 700, fill: lg[2], anchor: 'end', mono: true }));
    o.push(T(lx + 18, y + 14, lg[3], { size: 10, w: 400, fill: C.ter }));
  });

  // weekly summary
  const wy = ay + aCardH + 12, wCardH = 88;
  o.push(rr(pad, wy, sw - pad * 2, wCardH, 20, C.surface, `stroke="${C.borderSubtle}" filter="url(#cardShadow)"`));
  o.push(T(pad + 16, wy + 24, 'ESTA SEMANA', { size: 11, w: 700, fill: C.ter, ls: 0.8 }));
  const ws = [['67%', 'Hábitos', 'cumplimiento', C.warning], ['2/3', 'Entrenos', 'esta semana', C.warning], ['1840', 'Calorías', 'obj. 2200', C.warning], ['4.2/5', 'Ánimo', 'media 7d', C.success]];
  const wstep = (sw - pad * 2) / 4;
  ws.forEach((it, i) => {
    const cx = pad + wstep * i + wstep / 2;
    o.push(T(cx, wy + 52, it[0], { size: 16, w: 800, fill: it[3], anchor: 'middle' }));
    o.push(T(cx, wy + 68, it[1], { size: 10, w: 600, fill: C.ink, anchor: 'middle' }));
    o.push(T(cx, wy + 80, it[2], { size: 9, w: 400, fill: C.ter, anchor: 'middle' }));
  });

  o.push(bottomNav(sw, sh, 0));
  return o.join('');
}

/* ── SCREEN 2: HOY (today) ──────────────────────────────────────────────── */
function screenHoy(sw, sh) {
  const o = [statusBar(sw)];
  const pad = 16;
  // greeting
  o.push(rr(pad, 60, 44, 44, 16, 'rgba(243,156,18,0.12)'));
  o.push(ic(I.sun, pad + 11, 71, 22, { stroke: C.warning, sw: 2 }));
  o.push(T(pad + 56, 82, 'Buenos días', { size: 20, w: 700, fill: C.ink, ls: -0.3 }));
  o.push(T(pad + 56, 100, 'martes, 27 de mayo', { size: 12.5, w: 400, fill: C.ter }));

  // progress card
  let y = 122;
  o.push(rr(pad, y, sw - pad * 2, 92, 16, C.surface, `stroke="${C.borderSubtle}" filter="url(#cardShadow)"`));
  o.push(ic(I.flame, pad + 14, y + 14, 16, { stroke: C.warning, sw: 2 }));
  o.push(T(pad + 38, y + 27, 'Progreso del día', { size: 14, w: 500, fill: C.ink }));
  o.push(`<circle cx="${sw - pad - 78}" cy="${y + 22}" r="4" fill="${C.blue}"/>`);
  o.push(T(sw - pad - 68, y + 27, '4/6', { size: 12, w: 500, fill: C.ter }));
  o.push(rr(sw - pad - 38, y + 18, 8, 8, 2, C.cTask));
  o.push(T(sw - pad - 26, y + 27, '0/2', { size: 12, w: 500, fill: C.ter }));
  o.push(T(pad + 14, y + 56, '4 de 6 completados', { size: 13, w: 400, fill: C.sec }));
  o.push(T(sw - pad - 14, y + 56, '66.7%', { size: 13, w: 700, fill: C.warning, anchor: 'end' }));
  o.push(rr(pad + 14, y + 66, sw - pad * 2 - 28, 6, 3, C.hover));
  o.push(rr(pad + 14, y + 66, (sw - pad * 2 - 28) * 0.667, 6, 3, GRAD));

  // mood card
  y += 104;
  o.push(rr(pad, y, sw - pad * 2, 60, 16, C.surface, `stroke="${C.borderSubtle}" filter="url(#cardShadow)"`));
  o.push(`<circle cx="${pad + 32}" cy="${y + 30}" r="18" fill="${C.hover}"/>`);
  o.push(ic(I.smile, pad + 22, y + 20, 20, { stroke: C.ter, sw: 1.8 }));
  o.push(T(pad + 60, y + 27, 'Estado de ánimo', { size: 13, w: 600, fill: C.ink }));
  o.push(T(pad + 60, y + 43, 'Sin registrar hoy', { size: 11, w: 400, fill: C.ter }));
  o.push(rr(sw - pad - 84, y + 18, 70, 24, 8, 'rgba(66,165,245,0.10)'));
  o.push(T(sw - pad - 49, y + 34, 'Registrar', { size: 11, w: 600, fill: C.blue, anchor: 'middle' }));

  // nutrition card
  y += 72;
  o.push(rr(pad, y, sw - pad * 2, 64, 16, C.surface, `stroke="${C.borderSubtle}" filter="url(#cardShadow)"`));
  o.push(`<circle cx="${pad + 32}" cy="${y + 26}" r="18" fill="rgba(46,204,113,0.12)"/>`);
  o.push(ic(I.utensils, pad + 23, y + 16, 19, { stroke: C.cNutrition, sw: 2 }));
  o.push(T(pad + 60, y + 24, 'Nutrición de hoy', { size: 13, w: 600, fill: C.ink }));
  o.push(T(pad + 60, y + 39, '1.840 kcal / 2.200', { size: 11, w: 400, fill: C.ter }));
  o.push(rr(pad + 60, y + 46, 150, 4, 2, C.hover));
  o.push(rr(pad + 60, y + 46, 150 * 0.83, 4, 2, C.cNutrition));
  o.push(rr(sw - pad - 60, y + 18, 46, 24, 8, 'rgba(46,204,113,0.12)'));
  o.push(T(sw - pad - 37, y + 34, 'Ver', { size: 11, w: 600, fill: C.cNutrition, anchor: 'middle' }));

  // PROGRAMADO
  y += 80;
  o.push(T(pad, y, 'PROGRAMADO', { size: 11, w: 600, fill: C.ter, ls: 1 }));
  const habits = [
    { name: 'Meditar', time: '07:00', streak: 12, done: true, col: '#7c3aed', ic: 'lotus' },
    { name: 'Ejercicio', time: '07:30', streak: 8, done: true, col: '#18181b', ic: 'dumbbell' },
    { name: 'Leer', time: '21:00', streak: 3, done: false, col: '#0066ff', ic: 'book' },
  ];
  let hy = y + 12;
  habits.forEach((h) => {
    o.push(rr(pad, hy, sw - pad * 2, 56, 14, C.surface, `stroke="${C.borderSubtle}" filter="url(#cardShadow)"`));
    o.push(rr(pad + 12, hy + 14, 3, 28, 2, h.col)); // colored bar
    // check
    const ccx = pad + 36, ccy = hy + 28;
    if (h.done) { o.push(`<circle cx="${ccx}" cy="${ccy}" r="13" fill="${h.col}"/>`); o.push(ic(I.check, ccx - 9, ccy - 9, 18, { stroke: '#fff', sw: 2.6 })); }
    else o.push(`<circle cx="${ccx}" cy="${ccy}" r="12" fill="none" stroke="${C.neutral300}" stroke-width="2"/>`);
    // icon
    o.push(ic(I[h.ic], pad + 56, hy + 18, 19, { stroke: h.col, sw: 1.9 }));
    o.push(T(pad + 84, hy + 26, h.name, { size: 14.5, w: 600, fill: C.ink }));
    o.push(T(pad + 84, hy + 42, h.time, { size: 10.5, w: 400, fill: C.ter }));
    // streak
    o.push(ic(I.flame, sw - pad - 48, hy + 20, 12, { stroke: C.warning, sw: 2 }));
    o.push(T(sw - pad - 34, hy + 30, String(h.streak), { size: 12, w: 600, fill: C.warning }));
    hy += 64;
  });
  // completed toggle
  o.push(ic(I.chevR, pad, hy + 2, 14, { stroke: C.ter, sw: 2 }));
  o.push(T(pad + 20, hy + 13, 'COMPLETADOS (2)', { size: 11, w: 700, fill: C.ter, ls: 0.6 }));

  o.push(bottomNav(sw, sh, 1));
  return o.join('');
}

/* ── SCREEN 3: ASISTENTE IA ─────────────────────────────────────────────── */
function screenIA(sw, sh) {
  const o = [statusBar(sw)];
  const pad = 16;
  // header
  o.push(rr(0, 48, sw, 56, 0, 'rgba(255,255,255,0.9)'));
  o.push(`<line x1="0" y1="104" x2="${sw}" y2="104" stroke="${C.borderSubtle}"/>`);
  o.push(rr(pad, 62, 28, 28, 9, C.blue));
  o.push(ic(I.bot, pad + 6, 68, 16, { stroke: '#fff', sw: 2 }));
  o.push(T(pad + 38, 74, 'Asistente', { size: 14.5, w: 700, fill: C.ink }));
  o.push(T(pad + 38, 90, 'Claude Haiku · Tool Use', { size: 10, w: 400, fill: C.ter }));
  // segmented
  o.push(rr(sw - pad - 132, 62, 96, 28, 9, C.hover));
  o.push(rr(sw - pad - 130, 64, 46, 24, 7, C.surface, `filter="url(#cardShadow)"`));
  o.push(T(sw - pad - 107, 80, 'Claude', { size: 11.5, w: 600, fill: C.ink, anchor: 'middle' }));
  o.push(T(sw - pad - 60, 80, 'GPT-4o', { size: 11.5, w: 600, fill: C.ter, anchor: 'middle' }));
  o.push(`<circle cx="${sw - pad - 16}" cy="76" r="13" fill="none"/>`);
  o.push(ic(I.trash, sw - pad - 24, 68, 16, { stroke: C.ter, sw: 1.8 }));

  // conversation
  let y = 130;
  // user bubble (right)
  const uw = 230;
  o.push(rr(sw - pad - 28 - uw, y, uw, 56, 16, C.blue, `style="rx:16"`));
  o.push(rr(sw - pad - 28 - 8, y, 8, 8, 0, C.blue)); // squared corner top-right
  o.push(T(sw - pad - 28 - uw + 14, y + 24, 'Crea una rutina matutina de 5', { size: 12.5, w: 400, fill: '#fff' }));
  o.push(T(sw - pad - 28 - uw + 14, y + 42, 'hábitos entre las 6 y las 9am.', { size: 12.5, w: 400, fill: '#fff' }));
  o.push(`<circle cx="${sw - pad - 14}" cy="${y + 14}" r="14" fill="${C.blue}"/>`);
  o.push(ic(I.user, sw - pad - 22, y + 6, 16, { stroke: '#fff', sw: 1.9 }));
  o.push(T(sw - pad - 28, y + 74, '09:41', { size: 9, w: 400, fill: C.ter, anchor: 'end' }));

  // assistant bubble (left)
  y += 92;
  o.push(`<circle cx="${pad + 14}" cy="${y + 14}" r="14" fill="${C.hover}"/>`);
  o.push(ic(I.bot, pad + 6, y + 6, 16, { stroke: C.sec, sw: 1.9 }));
  const aw = 248, abx = pad + 34;
  o.push(rr(abx, y, aw, 96, 16, C.surface, `stroke="${C.borderSubtle}" filter="url(#cardShadow)"`));
  const lines = ['¡Hecho! He creado 5 hábitos para', 'tu mañana: meditar, hidratarte,', 'leer, estiramientos y gratitud,', 'programados de 6:00 a 9:00.'];
  lines.forEach((ln, i) => o.push(T(abx + 14, y + 24 + i * 17, ln, { size: 12.5, w: 400, fill: C.ink })));
  // tool badge (expanded)
  let by = y + 108;
  o.push(rr(abx, by, aw, 96, 12, C.surface, `stroke="${C.borderSubtle}"`));
  o.push(rr(abx, by, aw, 30, 12, C.hover));
  o.push(ic(I.checkCircle, abx + 10, by + 8, 14, { stroke: C.success, sw: 2 }));
  o.push(T(abx + 32, by + 20, '5 acciones ejecutadas', { size: 11.5, w: 600, fill: C.sec }));
  const tools = ['Meditar', 'Beber agua', 'Leer'];
  tools.forEach((tn, i) => {
    const ty = by + 30 + 12 + i * 18;
    o.push(ic(I.checkCircle, abx + 12, ty - 9, 11, { stroke: C.success, sw: 2 }));
    o.push(T(abx + 30, ty, 'create_habit', { size: 10.5, w: 500, fill: C.blue, mono: true }));
    o.push(T(abx + 120, ty, '· ' + tn + ' creado', { size: 10.5, w: 400, fill: C.ter }));
  });
  o.push(T(abx, by + 110, '09:41 · Claude Haiku', { size: 9, w: 400, fill: C.ter }));

  // input bar
  const iy = sh - 70;
  o.push(`<line x1="0" y1="${iy - 12}" x2="${sw}" y2="${iy - 12}" stroke="${C.borderSubtle}"/>`);
  o.push(rr(pad, iy, sw - pad * 2 - 52, 42, 14, C.surface, `stroke="${C.borderDefault}"`));
  o.push(T(pad + 16, iy + 26, 'Escribe algo… (Enter para enviar)', { size: 12.5, w: 400, fill: C.ter }));
  o.push(`<circle cx="${sw - pad - 20}" cy="${iy + 21}" r="20" fill="${C.blue}"/>`);
  o.push(ic(I.send, sw - pad - 30, iy + 11, 20, { stroke: '#fff', sw: 2 }));
  return o.join('');
}

/* ── phone frame + place ────────────────────────────────────────────────── */
function phone(x, y, screenFn) {
  const w = 372, h = 760, bz = 7, sw = w - bz * 2, sh = h - bz * 2;
  const cx = x + w / 2;
  let g = `<g>`;
  g += rr(x, y, w, h, 50, '#15151F', `filter="url(#phoneShadow)"`);
  g += rr(x, y, w, h, 50, 'none', `stroke="rgba(255,255,255,0.08)" stroke-width="1"`);
  const cid = `c${Math.round(x)}`;
  g += `<clipPath id="${cid}"><rect x="${x + bz}" y="${y + bz}" width="${sw}" height="${sh}" rx="44"/></clipPath>`;
  g += `<g clip-path="url(#${cid})">`;
  g += rr(x + bz, y + bz, sw, sh, 44, C.appBg);
  g += `<g transform="translate(${x + bz},${y + bz})">${screenFn(sw, sh)}</g>`;
  g += `</g>`;
  g += rr(cx - 46, y + 20, 92, 30, 15, '#0a0a0f');
  g += `<circle cx="${cx + 28}" cy="${y + 35}" r="4.5" fill="#15151f"/><circle cx="${cx + 28}" cy="${y + 35}" r="2" fill="#27406b"/>`;
  g += `</g>`;
  return g;
}

const phoneY = 196, gap = 60, pw = 372;
const total = pw * 3 + gap * 2, startX = (W - total) / 2;
push(phone(startX, phoneY, screenInicio));
push(phone(startX + (pw + gap), phoneY, screenHoy));
push(phone(startX + (pw + gap) * 2, phoneY, screenIA));

// labels
const labels = ['Inicio · Dashboard', 'Hoy · Hábitos del día', 'Asistente IA · Tool Use'];
labels.forEach((l, i) => {
  const cx = startX + (pw + gap) * i + pw / 2;
  push(T(cx, phoneY + 760 + 40, l, { size: 15, w: 700, fill: C.ink, anchor: 'middle', ls: -0.2 }));
});
push(T(W / 2, H - 26, 'QYRO — Plus Jakarta Sans · #42A5F5 → #7B1FA2 · tema claro', { size: 12.5, w: 500, fill: C.ter, anchor: 'middle' }));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${P.join('\n')}</svg>`;
fs.writeFileSync('/tmp/qyro-mockup/qyro_real.svg', svg);
const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: W * 2 },
  font: { fontDirs: ['/tmp/qyro-mockup/fonts'], defaultFontFamily: 'Plus Jakarta Sans', loadSystemFonts: false },
  background: '#EFF2FA',
});
fs.writeFileSync('/tmp/qyro-mockup/qyro_real.png', resvg.render().asPng());
console.log('done', svg.length);
