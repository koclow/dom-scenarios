/* Прототип раздела «Сценарии» — приложение. Один файл, без зависимостей. */
const ICON = {
  chev: (o) => `<svg class="chev${o ? ' open' : ''}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l4 4-4 4"></path></svg>`,
  chk: (w = 14) => `<svg viewBox="0 0 16 16" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5l3.2 3.2L13 5"></path></svg>`,
  chk12: `<svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5l3.2 3.2L13 5"></path></svg>`,
  x: `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l8 8M12 4l-8 8"></path></svg>`,
  dots: `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="3.5" cy="8" r="0.9"></circle><circle cx="8" cy="8" r="0.9"></circle><circle cx="12.5" cy="8" r="0.9"></circle></svg>`,
  page: `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2.5h5.5L13 6v7.5H4z"></path><path d="M9.5 2.5V6H13"></path></svg>`,
  plus: `<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3.5v9M3.5 8h9"></path></svg>`,
  search: `<svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="4.5"></circle><path d="M10.5 10.5L14 14"></path></svg>`,
  bell: `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12.5 6a4.5 4.5 0 0 0-9 0c0 3.2-1.2 4.4-1.2 4.4h11.4S12.5 9.2 12.5 6Z"></path><path d="M6.7 13.2a1.5 1.5 0 0 0 2.6 0"></path></svg>`,
  comment: `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 7.7a5.6 5.6 0 0 1-6 5.5 6 6 0 0 1-2.5-.5L2 13.5l.8-3.2A5.5 5.5 0 0 1 2 7.7a5.6 5.6 0 0 1 6-5.5 5.6 5.6 0 0 1 6 5.5Z"></path></svg>`,
  clock: `<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"></circle><path d="M8 4.5V8l2.5 1.5"></path></svg>`,
  dl: `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.5v8M4.5 7.5L8 11l3.5-3.5"></path><path d="M3 13.5h10"></path></svg>`,
  archive: `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 5h11v8h-11z"></path><path d="M2 3h12v2H2z"></path><path d="M6.5 7.5h3"></path></svg>`
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const TODAY = '9 сентября';

/* ---------- состояние интерфейса ---------- */
const ui = { expanded: { s2026: true, t3: true }, popover: null, modal: null, notif: false, search: null, toast: null, filter: {}, unsplitMode: false, open: {}, saving: false };
const $app = () => document.getElementById('app');

/* ---------- вычисления ---------- */
const lesson = (id) => DB.lessons[id];
const theme = (id) => DB.themes[id];
const season = (id) => DB.seasons.find((s) => s.id === id);
function blocksOf(l) { const out = []; for (const p of l.parts) for (const b of p.blocks) { if (b.variant) out.push(b); else out.push(b); } return out; }
function partMin(p) { return p.blocks.reduce((a, b) => a + (b.variant ? b.min : b.min), 0); }
function lessonMin(l) { return l.parts.reduce((a, p) => a + partMin(p), 0); }
function hasBlocks(l) { return l.parts.some((p) => p.blocks.length); }
function themeLessons(t) { return t.lessons.map(lesson).filter((l) => !l.archived); }
function stageCounts(t) { const c = {}; for (const l of themeLessons(t)) c[l.stage] = (c[l.stage] || 0) + 1; return c; }
function frontStage(t) { const c = stageCounts(t); for (const s of STAGES) if (c[s]) return s; return null; }
function trackerHtml(t, extraStyle = '') {
  const ls = themeLessons(t); const c = stageCounts(t);
  if (!ls.length) return `<div class="track" style="${extraStyle}">${STAGES.map((s) => `<span class="stq todo">${STAGE_LABEL[s]}</span>`).join('')}<span style="color:#a8b0bc;font-size:12.5px;margin-left:6px;">пусто</span></div>`;
  let passed = true; const parts = [];
  for (const s of STAGES) {
    const n = c[s] || 0;
    if (n) { passed = false; const all = n === ls.length; const green = s === 'done' ? 'style="background:#ddf1e4;color:#22754a;"' : ''; parts.push(`<span class="stq cur" ${green}>${STAGE_LABEL[s]}${all ? '' : `<span class="qn">${n}</span>`}</span>`); continue; }
    if (passed) parts.push(`<span class="stq done">${ICON.chk12}${STAGE_LABEL[s]}</span>`); else parts.push(`<span class="stq todo">${STAGE_LABEL[s]}</span>`);
  }
  return `<div class="track" style="${extraStyle}">${parts.join('')}</div>`;
}
function stageChip(l, clickable = true) {
  const cls = l.stage === 'done' ? 'stchip ready' : 'stchip';
  return `<span class="${cls}${clickable ? ' clk' : ''}" ${clickable ? `data-act="stage-pop" data-id="${l.id}"` : ''}>${STAGE_LABEL[l.stage]}</span>`;
}
function qmin(l) {
  if (!hasBlocks(l)) return `<span class="qmin" style="color:#a8b0bc;">— мин</span>`;
  const m = lessonMin(l);
  return `<span class="qmin">${m} мин<span class="${m === 45 ? 'qok' : 'qbad'}">${m === 45 ? ICON.chk() : ICON.x}</span></span>`;
}
function plural(n, a, b, c) { const m = n % 10, h = n % 100; return n + ' ' + (h >= 11 && h <= 14 ? c : m === 1 ? a : m >= 2 && m <= 4 ? b : c); }
function blockText(b) { return (b.body || []).map((p) => p.role === 'list' ? p.items.join(' ') : p.text).join('\n'); }
function snapshot(l) { const s = {}; for (const b of blocksOf(l)) { if (b.variant) for (const a of b.alts) s[a.id] = blockText(a); else s[b.id] = blockText(b); } for (const sl of l.slides) s[sl.id] = sl.title + '|' + sl.content + '|' + sl.designer; return s; }
function changedIds(l) { if (!l.handoff || !l.handoff.snap) return new Set(); const now = snapshot(l); const ch = new Set(); for (const k in now) if (now[k] !== l.handoff.snap[k]) ch.add(k); return ch; }
function slideNumber(l, s) { let n = 0; for (const x of l.slides) { if (x.kind === 'slide') n++; if (x === s) return n; } return n; }
function blockByCode(l, code) { for (const b of blocksOf(l)) { if (b.code === code) return b; if (b.variant) for (const a of b.alts) if (a.code === code) return a; } return null; }

/* ---------- маршрутизация ---------- */
function route() {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, q] = h.split('?'); const seg = path.split('/').filter(Boolean);
  const params = Object.fromEntries((q || '').split('&').filter(Boolean).map((kv) => kv.split('=')));
  if (!seg.length) return { view: 'home' };
  if (seg[0] === 'season') return { view: 'season', id: seg[1] };
  if (seg[0] === 'theme') return { view: 'theme', id: seg[1] };
  if (seg[0] === 'lesson') return { view: seg[2] === 'tz' ? 'tz' : 'lesson', id: seg[1], params };
  return { view: 'home' };
}
function go(hash) { location.hash = hash; }

/* ---------- каркас ---------- */
function header() {
  const unread = DB.notifications.filter((n) => n.unread).length;
  return `<div class="hdr">
  ${LOGO}
  <div class="nav"><div class="pill">Главная</div><div class="pill">Задачи</div><div class="pill on">Сценарии</div><div class="pill">Закладки</div><div class="pill">Команда</div><div class="pill">Идеи</div><div class="pill"><span>Ещё</span><span class="caret"><svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"></path></svg></span></div></div>
  <div class="tools" style="gap: 10px;"><div class="hbtn clk" data-act="search">${ICON.search}</div><div class="hbtn clk" data-act="notif" style="position:relative;">${ICON.bell}${unread ? `<span class="nbadge">${unread}</span>` : ''}</div><div class="ava">Н</div></div>
</div>`;
}
function treeRow(opts) {
  const { id, kind, label, emoji, pad, active, hasKids, open, href } = opts;
  const chev = hasKids ? `<span class="clk" data-act="toggle" data-id="${id}" style="display:inline-flex;">${ICON.chev(open)}</span>` : `<span class="chev" style="width: 13px;"></span>`;
  const ico = emoji ? `<span class="emo">${emoji}</span>` : `<span class="pgico">${ICON.page}</span>`;
  return `<div class="ti clk${active ? ' on' : ''}" style="padding-left: ${pad}px;" data-act="go" data-href="${href}">${chev}${ico}<span class="lbl">${esc(label)}</span></div>`;
}
function sidebar(r) {
  const rows = [];
  rows.push(treeRow({ id: 'root', kind: 'root', label: 'Сценарии', emoji: '📚', pad: 10, active: r.view === 'home', hasKids: true, open: true, href: '#/' }));
  for (const s of DB.seasons) {
    const open = !!ui.expanded[s.id];
    rows.push(treeRow({ id: s.id, label: s.title, emoji: s.emoji, pad: 26, active: r.view === 'season' && r.id === s.id, hasKids: s.themes.length > 0, open, href: '#/season/' + s.id }));
    if (open) for (const tid of s.themes) {
      const t = theme(tid); const topen = !!ui.expanded[tid];
      rows.push(treeRow({ id: tid, label: `Тема ${t.num}: ${t.title}`, emoji: t.emoji, pad: 42, active: r.view === 'theme' && r.id === tid, hasKids: themeLessons(t).length > 0, open: topen, href: '#/theme/' + tid }));
      if (topen) for (const l of themeLessons(t)) rows.push(treeRow({ id: l.id, label: l.title, emoji: null, pad: 58, active: (r.view === 'lesson' || r.view === 'tz') && r.id === l.id, hasKids: false, href: '#/lesson/' + l.id }));
    }
  }
  rows.push(`<div class="ti" style="padding-left: 10px;">${ICON.chev(false)}<span class="emo">🗂️</span><span class="lbl">Рабочие материалы</span></div>`);
  rows.push(`<div class="ti" style="padding-left: 10px;">${ICON.chev(false)}<span class="emo">📋</span><span class="lbl">Процессы</span></div>`);
  return `<div class="col">
    <div class="srch clk" data-act="search">${ICON.search}<span>Поиск по сценариям</span></div>
    <div class="sect"><span>Разделы</span><span class="add">${ICON.plus}</span></div>
    ${rows.join('\n')}
    <div class="rule" style="margin: 10px 0 6px;"></div>
    <div class="ti" style="padding-left: 10px; color: #6b7280;"><span class="pgico">${ICON.archive}</span><span class="lbl">Архив</span></div>
  </div>`;
}
function crumbs(items) { return `<div class="crumbs">${items.map((it, i) => (i ? '<span class="sep">/</span>' : '') + (it.href ? `<span class="c clk" data-act="go" data-href="${it.href}">${esc(it.label)}</span>` : `<span class="c">${esc(it.label)}</span>`)).join('')}</div>`; }
function panelTop(crumbItems, right) {
  return `<div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">${crumbs(crumbItems)}<div class="tools">${right}</div></div>`;
}
function saveState() { return `<span class="save">${ui.saving ? 'Сохраняем…' : 'Сохранено'}</span>`; }
function pv(names) { return `<div class="pv">${names.map((n) => `<div class="pa">${n}</div>`).join('')}</div>`; }
const IBTN = (svg, act = '') => `<div class="ibtn clk" ${act ? `data-act="${act}"` : ''}>${svg}</div>`;

/* ---------- экраны ---------- */
function viewHome() {
  const cards = DB.seasons.map((s) => {
    const sub = s.archived ? 'архив · 26 тем' : s.id === 's2026' ? `доска сезона · ${plural(s.themes.length, 'тема', 'темы', 'тем')}` : `${plural(s.themes.length, 'тема', 'темы', 'тем')} · ${plural(s.themes.reduce((a, t) => a + theme(t).lessons.length, 0), 'занятие', 'занятия', 'занятий')}`;
    return `<div class="clk" data-act="go" data-href="#/season/${s.id}" style="display: flex; flex-direction: column; gap: 8px; padding: 22px 24px; border-radius: 14px; background: #f4f7fa;"><div style="font-size: 24px; line-height: 1;">${s.emoji}</div><div style="font-size: 16px; font-weight: 650; margin-top: 4px;">${esc(s.title)}</div><div style="color: #6b7280; font-size: 13px;">${sub}</div></div>`;
  }).join('');
  const recent = [['#/lesson/l6', '📄', '6 класс — диагностика «Мои интересы»', 'Тема 3: Познаю себя · вчера'], ['#/theme/t3', '🧭', 'Тема 3: Познаю себя', 'Занятия 2026–2027 · вчера'], ['#/season/s2026', '🙋', 'Занятия 2026–2027', 'доска сезона · 4 сентября']];
  return `<div class="panel">
    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;"><div><div class="h1" style="margin-top: 0;">Сценарии</div><div class="props" style="margin-top: 8px;">Сценарии занятий РМГ: доска сезона, темы, занятия и ТЗ — в одном месте.</div></div><div class="dombtn primary clk" data-act="new-theme" data-id="s2026">${ICON.plus}<span>Новая тема</span></div></div>
    <div style="margin-top: 30px; color: #6b7280; font-size: 13.5px; font-weight: 600;">Сезоны</div>
    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 12px;">${cards}</div>
    <div style="margin-top: 34px; color: #6b7280; font-size: 13.5px; font-weight: 600;">Последние открытые</div>
    <div style="display:flex; flex-direction:column; gap:2px; margin-top: 10px;">${recent.map(([h, e, t, s]) => `<div class="ti clk" style="padding-left: 8px;" data-act="go" data-href="${h}"><span class="emo">${e}</span><span class="lbl">${esc(t)}</span><span style="margin-left:auto; color:#8c94a2; font-size:12.5px;">${s}</span></div>`).join('')}</div>
  </div>`;
}

function viewSeason(id) {
  const s = season(id); if (!s) return viewHome();
  const themes = s.themes.map(theme).filter((t) => !t.archived);
  const f = ui.filter[id] || 'all';
  const counts = { all: themes.length }; for (const st of STAGES) counts[st] = themes.filter((t) => frontStage(t) === st).length;
  const tabs = [['all', 'Все'], ...STAGES.map((st) => [st, STAGE_LABEL[st]])].map(([k, lab]) => `<span class="ftab clk${f === k ? ' on' : ''}" data-act="filter" data-id="${id}" data-val="${k}">${lab}<span class="n">${counts[k]}</span></span>`).join('');
  const shown = themes.filter((t) => f === 'all' || frontStage(t) === f).slice().reverse();
  let body;
  if (s.archived) body = `<div class="emptybox" style="padding: 56px 24px; margin-top: 8px;"><div style="font-size: 30px; margin-bottom: 8px;">🗄️</div><b>Сезон в архиве</b>26 тем прошлых лет появятся здесь после импорта из Drive — читать и искать по ним можно будет как по остальным</div>`;
  else if (!themes.length) body = `<div class="emptybox" style="padding: 56px 24px; margin-top: 8px;"><div style="font-size: 30px; margin-bottom: 8px;">🙋</div><b>В этом сезоне пока нет тем</b>Создайте первую тему или продублируйте структуру прошлого сезона — темы, занятия и коды перенесутся, стадии сбросятся<div class="strip" style="justify-content: center; margin-top: 16px;"><span class="dombtn primary clk" data-act="new-theme" data-id="${id}">${ICON.plus}Новая тема</span><span class="dombtn clk" data-act="toast" data-val="Структура прошлого сезона продублирована">Дублировать прошлый сезон</span></div></div>`;
  else {
    let lastMonth = ''; const rows = [];
    for (const t of shown) {
      const month = t.openDate.split(' ')[1]; const mcap = month.charAt(0).toUpperCase() + month.slice(1).replace(/я$/, 'ь').replace(/ль$/, 'ль');
      const mname = { 'августа': 'Август', 'сентября': 'Сентябрь', 'октября': 'Октябрь', 'ноября': 'Ноябрь', 'декабря': 'Декабрь', 'января': 'Январь', 'февраля': 'Февраль', 'марта': 'Март', 'апреля': 'Апрель', 'мая': 'Май' }[month] || mcap;
      if (mname !== lastMonth) { rows.push(`<div class="vday" style="margin-left: 2px;">${mname}</div>`); lastMonth = mname; }
      rows.push(`<div class="brow clk" data-act="go" data-href="#/theme/${t.id}"><div class="btop"><div class="bnum">${t.num}</div><div class="tw"><div class="tit">${esc(t.title)}</div><div class="meta">${t.type}<span class="dot">·</span><span class="cnt">план ${plural(t.plan, 'сценарий', 'сценария', 'сценариев')}</span>${t.schemeAssembled ? `<span class="dot">·</span><span class="cnt" style="color:#22754a;">${ICON.chk12} схема собрана</span>` : ''}</div></div><div class="bdate2"><div class="bd1">открытие</div><div class="bd2">${t.openDate}</div></div></div>${trackerHtml(t)}</div>`);
    }
    body = rows.join('');
  }
  return `<div class="panel">
    ${panelTop([{ label: 'Сценарии', href: '#/' }, { label: s.title }], `${pv(['СП', 'ИК', 'АЧ'])}${saveState()}<div class="vsep"></div><div class="dombtn primary clk" data-act="new-theme" data-id="${id}">${ICON.plus}Новая тема</div><div class="vsep"></div>${IBTN(ICON.dots)}`)}
    <div class="h1"><span style="font-size: 32px; line-height: 1;">${s.emoji}</span><span>${esc(s.title)}</span></div>
    <div style="margin-top: 14px;"><div class="ftabs">${tabs}</div></div>
    <div class="rule"></div>
    <div style="max-width: 1040px;">${body}</div>
  </div>`;
}

function viewTheme(id) {
  const t = theme(id); if (!t) return viewHome();
  const s = season(t.seasonId); const ls = themeLessons(t);
  const rows = ls.map((l) => {
    const badges = (hasBlocks(l) || l.stage !== 'scenario' ? '' : `<span class="abadge">не разложено</span>`) + stageChip(l);
    const meta = hasBlocks(l) ? `<div class="pmeta">${qmin(l)}${l.duplicateOf ? `<span class="dot">·</span><span style="color:#8c94a2;">дубликат из «${esc(lesson(l.duplicateOf).title)}»</span>` : ''}</div>` : '';
    return `<div class="prow clk" data-act="go" data-href="#/lesson/${l.id}"><span class="pgico2">${ICON.page}</span><div class="pw"><div class="pname">${esc(l.title)}</div>${meta}</div><div class="pright">${badges}<span class="dots2 clk" data-act="row-menu" data-id="${l.id}">${ICON.dots}</span></div></div>`;
  }).join('');
  const empty = ls.length ? '' : `<div class="emptybox" style="margin: 4px 0 10px;"><b>Пока нет занятий</b>Добавьте занятие по классу или продублируйте из прошлого сезона</div>`;
  const noteHtml = t.note ? esc(t.note) : `<span style="color:#c3c9d4;">Пометки к теме — что ждём, о чём договорились…</span>`;
  const dis = ls.length ? '' : 'style="color:#a8b0bc;"';
  return `<div class="panel">
    ${panelTop([{ label: 'Сценарии', href: '#/' }, { label: s.title, href: '#/season/' + s.id }, { label: 'Тема ' + t.num }], `${pv(['СП', 'КГ'])}${saveState()}<div class="vsep"></div>${IBTN(ICON.dots)}`)}
    <div class="h1"><span style="font-size: 32px; line-height: 1;">${t.emoji}</span><span>Тема ${t.num}: ${esc(t.title)}</span></div>
    <div style="display: flex; align-items: center; gap: 16px; margin-top: 10px;"><div class="props" style="margin-top: 0;"><span class="ed" contenteditable="true" data-field="type" data-id="${id}">${t.type}</span><span class="dot">·</span>занятие <span class="ed" contenteditable="true" data-field="lessonDate" data-id="${id}">${t.lessonDate}</span><span class="dot">·</span>открытие <span class="ed" contenteditable="true" data-field="openDate" data-id="${id}">${t.openDate}</span><span class="dot">·</span><span class="cnt">план <span class="ed" contenteditable="true" data-field="plan" data-id="${id}">${t.plan}</span> ${plural(t.plan, 'сценарий', 'сценария', 'сценариев').replace(/^\d+ /, '')}</span>${t.schemeAssembled ? `<span class="dot">·</span><span style="color:#22754a;">${ICON.chk12} схема собрана</span>` : ''}</div></div>
    <div class="tdesc ed" contenteditable="true" data-field="note" data-id="${id}">${noteHtml}</div>
    ${trackerHtml(t, 'margin-left: 0; margin-top: 12px;')}
    <div class="rule"></div>
    <div class="doc" style="max-width: none;">
      <div class="vday" style="margin: 6px 0 8px 2px;">Занятия</div>
      ${empty}${rows}
      <div class="prow add clk" data-act="add-lesson" data-id="${id}">${ICON.plus}<span>Занятие</span></div>
      <div style="display:flex; gap:10px; margin-top: 26px;"><span class="dombtn clk" ${dis} data-act="toast" data-val="ТЗ темы выгружено: Тема ${t.num} — ${plural(ls.length, 'занятие', 'занятия', 'занятий')}, .docx">Выгрузить ТЗ темы</span><span class="dombtn clk" ${dis} data-act="pack" data-id="${id}">Собрать пакет загрузки</span>${t.schemeAssembled ? '' : `<span class="dombtn quiet clk" data-act="scheme" data-id="${id}">Отметить: схема собрана</span>`}</div>
    </div>
  </div>`;
}

function paraHtml(p, editable) {
  const ce = editable ? ' contenteditable="true"' : '';
  if (p.role === 'list') return `<ul class="pl">${p.items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
  if (p.role === 'speech') return `<p class="pp"${ce}><b>Слово педагога:</b> ${p.text}</p>`;
  if (p.role === 'remark') return `<p class="pp rem"${ce}>${p.text}</p>`;
  if (p.role === 'cmd') return `<p class="pp rem"${ce}>${p.text.replace(/слайд(ы)? (\d+(?:–\d+)?)/g, (m, s, n) => `<span class="slideref">слайд${s || ''} ${n}</span>`)}</p>`;
  return `<p class="pp"${ce}>${p.text}</p>`;
}
function blockHtml(l, b, changed, sub = true) {
  if (b.variant) {
    const open = ui.open[b.id] !== false;
    const mode = { alternative: 'альтернатива', choice: 'выбор', optional: 'необязательный' }[b.variant];
    return `<div class="tsum${sub ? ' sub' : ''} clk" data-act="toggle-block" data-id="${b.id}">${ICON.chev(open)}<div class="tw"><div class="tit">Вариативный блок</div><div class="meta">${b.min} мин<span class="dot">·</span>${mode === 'альтернатива' ? 'выбор из ' + b.alts.length : mode}</div></div></div>` +
      (open ? `<div class="tbody" style="margin-left: 10px;">${b.alts.map((a) => blockHtml(l, a, changed)).join('')}</div>` : '');
  }
  const open = !!ui.open[b.id]; const isCh = changed.has(b.id);
  const body = open && b.body && b.body.length ? `<div class="tbody" style="margin-left: 10px;" data-block="${b.id}">${b.body.map((p) => paraHtml(p, true)).join('')}</div>` : (open ? `<div class="tbody" style="margin-left:10px;color:#a8b0bc;font-size:13px;">Тело блока — по сценарию 2025/26, текст ещё не перенесён</div>` : '');
  return `<div class="tsum${sub ? ' sub' : ''} clk" data-act="toggle-block" data-id="${b.id}">${ICON.chev(open)}<div class="tw"><div class="tit">${esc(b.title)}${isCh ? ` <span class="chgtag" style="vertical-align: 2px; margin-left: 6px;">изменено после передачи</span>` : ''}</div><div class="meta">${TYPE_LABEL[b.type] || b.type}<span class="dot">·</span>${b.min} мин<span class="dot">·</span><span class="code">${b.code}</span></div></div></div>${body}`;
}
function lessonHead(l, mode) {
  const t = theme(l.themeId); const s = season(t.seasonId);
  const tabs = `<div class="seg"><span class="s clk${mode === 'lesson' ? ' on' : ''}" data-act="go" data-href="#/lesson/${l.id}">Сценарий</span><span class="s clk${mode === 'tz' ? ' on' : ''}" data-act="go" data-href="#/lesson/${l.id}/tz">ТЗ</span></div>`;
  const badge = hasBlocks(l) || l.stage !== 'scenario' ? '' : `<span class="abadge">не разложено</span>`;
  return `${panelTop([{ label: 'Сценарии', href: '#/' }, { label: s.title, href: '#/season/' + s.id }, { label: 'Тема ' + t.num + ': ' + t.title, href: '#/theme/' + t.id }, { label: l.title.split(' — ')[0] }], `${pv(['КГ'])}${saveState()}<div class="vsep"></div>${IBTN(ICON.comment)}${IBTN(ICON.clock)}${IBTN(ICON.dots, 'row-menu-top')}`)}
    <div class="h1"><span style="font-size: 32px; line-height: 1;">📄</span><span class="ed" contenteditable="true" data-field="title" data-id="${l.id}">${esc(l.title)}</span></div>
    <div style="display: flex; align-items: center; gap: 16px; margin-top: 10px;"><div class="props" style="margin-top: 0;"><span class="code">${l.code}</span></div>${stageChip(l)}${badge}<div style="margin-left:auto; display:flex; align-items:center; gap:16px;">${tabs}${qmin(l)}</div></div>
    <div class="rule"></div>`;
}
function viewLesson(id) {
  const l = lesson(id); if (!l) return viewHome();
  const changed = changedIds(l);
  const remaining = l.authorText && l.authorText.length;
  let doc = '';
  if (hasBlocks(l)) {
    doc += l.parts.map((p, pi) => {
      const open = ui.open['p' + id + pi] !== false;
      return `<div class="part clk" data-act="toggle-block" data-id="p${id}${pi}">${ICON.chev(open)}<span class="ptit ed" contenteditable="true">${esc(p.title)}</span><span class="pmin">${partMin(p)} мин</span></div>` + (open ? `<div class="tbody">${p.blocks.map((b) => blockHtml(l, b, changed)).join('')}</div>` : '');
    }).join('');
  }
  if (remaining) {
    doc += `<div class="tzbar" style="margin-top: ${hasBlocks(l) ? 26 : 18}px; background: #fbfbf4; border-color: #f0e9c8;"><b>${hasBlocks(l) ? `Текст автора — осталось ${plural(l.authorText.length, 'абзац', 'абзаца', 'абзацев')}` : 'Текст автора — не разложен по блокам'}</b><span style="color: #6b7280;">${ui.unsplitMode ? 'нажимайте на абзацы — каждый станет сценарным блоком; минуты и коды подставятся' : 'выделяйте фрагменты и превращайте их в сценарные блоки, минуты и коды появятся по ходу'}</span><span class="dombtn ${ui.unsplitMode ? '' : 'primary'} clk" style="margin-left: auto; height: 34px; padding: 0 14px; font-size: 13px;" data-act="unsplit" data-id="${id}">${ui.unsplitMode ? 'Готово' : 'Разложить по блокам'}</span></div>` +
      l.authorText.map((p, i) => `<p class="pp${ui.unsplitMode ? ' splittable clk' : ''}" ${ui.unsplitMode ? `data-act="split" data-id="${id}" data-val="${i}"` : ''} contenteditable="${ui.unsplitMode ? 'false' : 'true'}">${p}</p>`).join('');
  }
  if (!remaining) doc += `<div class="prow add clk" style="margin-top: 18px;" data-act="toast" data-val="Наберите «/» в пустой строке — «Часть» и «Сценарный блок» в меню">${ICON.plus}<span>Часть или блок</span></div>`;
  doc = `<div class="doc">${doc}</div>`;
  return `<div class="panel">${lessonHead(l, 'lesson')}${doc}</div>`;
}
function viewTZ(id) {
  const l = lesson(id); if (!l) return viewHome();
  const changed = changedIds(l);
  const nch = [...changed].filter((k) => k.startsWith('s') || l.slides.some((s) => s.code && blockByCode(l, s.code) && blockByCode(l, s.code).id === k)).length;
  const bar = l.handoff ? `<div class="tzbar"><b>Передано в дизайн ${l.handoff.date}</b>${nch ? `<span class="chgtag">${plural(nch, 'изменение', 'изменения', 'изменений')} после передачи</span>` : `<span style="color:#8c94a2;">изменений после передачи нет</span>`}<span class="tzbtn clk" data-act="toast" data-val="ТЗ выгружено: ${esc(l.title)}.docx">${ICON.dl}Выгрузить ТЗ</span></div>` : `<div class="tzbar"><span style="color:#6b7280;">ТЗ пишется — передайте в дизайн, когда слайды и раздатки описаны</span><span class="tzbtn clk" style="margin-left:auto;" data-act="toast" data-val="ТЗ выгружено: ${esc(l.title)}.docx">${ICON.dl}Выгрузить ТЗ</span><span class="tzbtn clk" data-act="handoff" data-id="${id}" style="background:#4f46e5;color:#fff;border-color:#4f46e5;">Передать в дизайн</span></div>`;
  let cards;
  if (!l.slides.length) cards = `<div class="emptybox" style="padding: 48px 24px; margin-top: 14px;"><b>Слайдов пока нет</b>Они появятся из команд «слайд N» в сценарии — или добавьте вручную<div class="strip" style="justify-content: center; margin-top: 14px;"><span class="dombtn clk" data-act="add-slide" data-id="${id}" data-val="slide">${ICON.plus}Слайд</span><span class="dombtn clk" data-act="add-slide" data-id="${id}" data-val="handout">${ICON.plus}Раздатка А4</span></div></div>`;
  else {
    cards = l.slides.map((s) => {
      const b = blockByCode(l, s.code); const isCh = changed.has(s.id) || (b && changed.has(b.id));
      const src = b ? `${esc(b.title.length > 42 ? b.title.slice(0, 40) + '…' : b.title)} · ${s.code}` : s.code || '';
      const num = s.kind === 'slide' ? `Слайд ${slideNumber(l, s)}` : `Раздатка А4`;
      const aud = s.kind === 'handout' ? ` · ${s.audience === 'students' ? 'ученикам' : 'педагогу'}` : '';
      return `<div class="slide${isCh ? ' chg' : ''}${s.kind === 'handout' ? ' ho' : ''}" data-slide="${s.id}"><div class="shead"><span class="snum"${s.kind === 'handout' ? ' style="color:#6b7280;"' : ''}>${num}</span><span class="stit ed" contenteditable="true" data-sfield="title" data-id="${s.id}">${esc(s.title)}</span>${isCh ? `<span class="chgtag">изменено после передачи</span>` : ''}<span class="ssrc">${src}${aud}</span></div><div class="srow"><span class="slbl">${s.kind === 'handout' ? 'На листе' : 'На слайде'}</span><span class="ed" contenteditable="true" data-sfield="content" data-id="${s.id}">${esc(s.content)}</span></div><div class="srow"><span class="slbl">Дизайнеру</span><span class="ed" contenteditable="true" data-sfield="designer" data-id="${s.id}">${s.designer ? esc(s.designer) : '<span style="color:#c3c9d4;">—</span>'}</span></div>${s.image ? `<div class="srow"><span class="slbl">Картинка</span><span style="display:inline-flex; align-items:center; gap:8px; padding:4px 10px; border:1px solid #eef0f4; border-radius:8px; font-size:12.5px; color:#4b5563;">📎 ${esc(s.image)}</span></div>` : `<div class="srow"><span class="slbl">Картинка</span><span class="clk" style="color:#8c94a2;font-size:12.5px;" data-act="attach" data-id="${s.id}">приложить эскиз или референс…</span></div>`}</div>`;
    }).join('') + `<div style="display:flex; gap:10px; margin-top: 14px;"><span class="dombtn clk" data-act="add-slide" data-id="${id}" data-val="slide">${ICON.plus}Слайд</span><span class="dombtn clk" data-act="add-slide" data-id="${id}" data-val="handout">${ICON.plus}Раздатка А4</span></div>`;
  }
  return `<div class="panel">${lessonHead(l, 'tz')}<div class="doc">${bar}${cards}</div></div>`;
}

/* ---------- оверлеи ---------- */
function popoverHtml() {
  const p = ui.popover; if (!p) return '';
  const pos = `position: fixed; left: ${p.x}px; top: ${p.y}px; z-index: 60;`;
  if (p.kind === 'stage') {
    const l = lesson(p.id);
    return `<div class="pop" style="${pos}">${STAGES.map((s) => `<div class="pi clk${l.stage === s ? ' on' : ''}${s === 'done' ? ' dn' : ''}" data-act="set-stage" data-id="${l.id}" data-val="${s}"><span class="dotc"></span>${STAGE_LABEL[s]}${l.stage === s ? `<span class="pk">${ICON.chk()}</span>` : ''}</div>`).join('')}<div class="phint">${l.stage === 'design' || l.stage === 'check' ? 'Точка отсчёта сохранена при передаче в дизайн.' : 'Перевод в «Дизайн» сохраняет точку отсчёта: всё, что изменится после, будет помечено в ТЗ.'}</div></div>`;
  }
  if (p.kind === 'row') {
    const l = lesson(p.id);
    return `<div class="pop" style="${pos} width: 216px;"><div class="pi clk" data-act="go" data-href="#/lesson/${l.id}">Открыть</div><div class="pi clk" data-act="dup" data-id="${l.id}">Дублировать</div><div class="pi clk" data-act="rename" data-id="${l.id}">Переименовать</div><div class="pi clk" data-act="toast" data-val="Диалог «Переместить» — как у страниц базы">Переместить…</div><div class="psep"></div><div class="pi${l.duplicateOf ? ' clk' : ' muted'}" ${l.duplicateOf ? `data-act="toast" data-val="Сравнение с «${esc(lesson(l.duplicateOf).title)}»: различий нет"` : ''}>Сравнить с исходным</div><div class="psep"></div><div class="pi danger clk" data-act="archive" data-id="${l.id}">В архив</div></div>`;
  }
  return '';
}
function modalHtml() {
  const m = ui.modal; if (!m) return '';
  const l = m.id ? lesson(m.id) : null;
  let box = '';
  if (m.kind === 'handoff') {
    const nb = blocksOf(l).reduce((a, b) => a + (b.variant ? b.alts.length : 1), 0), ns = l.slides.filter((s) => s.kind === 'slide').length, nh = l.slides.length - ns, mm = lessonMin(l);
    box = `<div class="hdlg"><div class="dt">Передать в дизайн?</div><div class="db">Занятие «${esc(l.title)}» перейдёт в стадию «Дизайн». Сохраним точку отсчёта: всё, что изменится после, будет помечено в ТЗ как «изменено после передачи».</div><div class="dsum"><span><b>${nb}</b> ${plural(nb, 'блок', 'блока', 'блоков').replace(/^\d+ /, '')}</span><span><b>${ns}</b> ${plural(ns, 'слайд', 'слайда', 'слайдов').replace(/^\d+ /, '')}</span><span><b>${nh}</b> ${plural(nh, 'раздатка', 'раздатки', 'раздаток').replace(/^\d+ /, '')}</span><span><b>${mm} мин</b> ${mm === 45 ? ICON.chk(12) : ''}</span></div><div class="dacts"><span class="dombtn quiet clk" data-act="close">Отмена</span><span class="dombtn primary clk" data-act="handoff-ok" data-id="${l.id}">Передать</span></div></div>`;
  } else if (m.kind === 'rehandoff') {
    box = `<div class="hdlg" style="width: 420px;"><div class="dt">Обновить точку отсчёта?</div><div class="db">Занятие уже передавалось в дизайн ${l.handoff.date}. Пометки «изменено после передачи» сбросятся; факт повторной передачи останется в истории страницы.</div><div class="dacts"><span class="dombtn quiet clk" data-act="close">Отмена</span><span class="dombtn primary clk" data-act="handoff-ok" data-id="${l.id}">Обновить</span></div></div>`;
  } else if (m.kind === 'pack') {
    const t = theme(m.id); const ls = themeLessons(t); const nb = ls.reduce((a, x) => a + blocksOf(x).reduce((q, b) => q + (b.variant ? b.alts.length : 1), 0), 0);
    const checks = [[true, `Сумма минут 45 у ${ls.filter((x) => lessonMin(x) === 45).length} из ${ls.length} занятий`], [ls.every(hasBlocks), ls.every(hasBlocks) ? 'Все занятия разложены по блокам' : `Не разложено: ${ls.filter((x) => !hasBlocks(x)).map((x) => x.title).join(', ')}`], [ls.some((x) => x.slides.length), 'Слайды 1920×1080 и раздатки по классам'], [true, 'Ролики с расшифровками']];
    box = `<div class="hdlg" style="width: 480px;"><div class="dt">Собрать пакет загрузки</div><div class="db">Тема ${t.num}: ${esc(t.title)} — ${plural(ls.length, 'занятие', 'занятия', 'занятий')}, ${plural(nb, 'элемент', 'элемента', 'элементов')}. Пакет: схема темы, элементы, папка файлов, чек-лист.</div><div style="margin-top:12px; display:flex; flex-direction:column; gap:6px;">${checks.map(([ok, txt]) => `<div style="display:flex; gap:8px; align-items:center; font-size:13.5px; color:${ok ? '#1b1d21' : '#b3261e'};"><span style="color:${ok ? '#22754a' : '#b3261e'}; display:inline-flex;">${ok ? ICON.chk() : ICON.x}</span>${txt}</div>`).join('')}</div><div class="dacts"><span class="dombtn quiet clk" data-act="close">Отмена</span><span class="dombtn primary clk" data-act="pack-ok" data-id="${t.id}">Собрать</span></div></div>`;
  } else if (m.kind === 'rename') {
    box = `<div class="hdlg" style="width: 440px;"><div class="dt">Переименовать</div><div class="db"><input id="rename-input" value="${esc(l.title)}" style="width:100%; box-sizing:border-box; height:38px; border:1px solid #e5e7eb; border-radius:9px; padding:0 12px; font: inherit; font-size:14px;"></div><div class="dacts"><span class="dombtn quiet clk" data-act="close">Отмена</span><span class="dombtn primary clk" data-act="rename-ok" data-id="${l.id}">Сохранить</span></div></div>`;
  }
  return `<div class="veil2 clk" data-act="close"></div><div style="position: fixed; inset: 0; display: flex; align-items: flex-start; justify-content: center; padding-top: 220px; z-index: 81; pointer-events: none;"><div style="pointer-events: auto;">${box}</div></div>`;
}
function notifHtml() {
  if (!ui.notif) return '';
  return `<div class="veil2 clk" data-act="close" style="background: transparent;"></div><div class="pop" style="position: fixed; right: 84px; top: 66px; width: 380px; z-index: 82; padding: 8px;"><div style="padding: 6px 10px 8px; font-size: 13px; font-weight: 700; color: #8c94a2; letter-spacing: 0.04em; text-transform: uppercase;">Уведомления</div>${DB.notifications.map((n) => `<div style="padding: 8px 10px; border-radius: 8px; ${n.unread ? 'background:#f4f5f7;' : ''}"><div style="font-size: 13.5px; line-height: 1.45;">${n.text}</div><div style="color:#8c94a2; font-size: 12px; margin-top: 2px;">${n.when}</div></div>`).join('')}</div>`;
}
function searchHtml() {
  if (ui.search === null) return '';
  const q = ui.search.trim().toLowerCase(); const hits = [];
  if (q) {
    for (const t of Object.values(DB.themes)) if ((`тема ${t.num}: ${t.title}`).toLowerCase().includes(q)) hits.push({ kind: 'Страница', title: `${t.emoji} Тема ${t.num}: ${t.title}`, sub: `Сценарии / ${season(t.seasonId).title}`, href: '#/theme/' + t.id });
    for (const l of Object.values(DB.lessons)) {
      if (l.archived) continue; const t = theme(l.themeId);
      if (l.title.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)) hits.push({ kind: 'Страница', title: `📄 ${l.title}`, sub: `… / Тема ${t.num}: ${t.title} · <span class="code" style="font-size:12px;">${l.code}</span>`, href: '#/lesson/' + l.id });
      for (const b of blocksOf(l)) { const bs = b.variant ? b.alts : [b]; for (const x of bs) if (x.code.toLowerCase().includes(q) || x.title.toLowerCase().includes(q) || blockText(x).toLowerCase().includes(q)) hits.push({ kind: 'Текст', title: x.title, sub: `${TYPE_LABEL[x.type]} · ${x.min} мин · <span class="code" style="font-size:12px;">${x.code}</span> — ${l.title}`, href: '#/lesson/' + l.id, block: x.id }); }
    }
  }
  const shown = hits.slice(0, 7);
  return `<div class="veil clk" data-act="close"></div><div class="dlg" style="left: 50%; transform: translateX(-50%); top: 130px; width: 640px; padding: 16px; gap: 12px; position: fixed; z-index: 90;">
    <div class="sfield">${ICON.search}<input id="search-input" value="${esc(ui.search)}" placeholder="Название, код блока или фраза из текста" style="flex:1; border:0; outline:0; font: inherit; font-size: 15px; background: transparent;"></div>
    <div style="display: flex; flex-direction: column; gap: 2px;">${shown.length ? shown.map((h, i) => `<div class="hit clk${i === 0 ? ' cur' : ''}" data-act="go" data-href="${h.href}" data-block="${h.block || ''}"><span class="kind">${h.kind}</span><div style="min-width: 0;"><div class="htitle">${h.title.replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'i'), '<span class="mark">$1</span>')}</div><div class="hsub">${h.sub}</div></div></div>`).join('') : `<div style="padding: 14px 8px; color:#8c94a2; font-size:14px;">${q ? 'Ничего не нашлось' : 'Ищет по названиям, кодам блоков и тексту сценариев'}</div>`}</div>
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 2px 4px 0;"><span style="color: #4f46e5; font-size: 14px; font-weight: 600;">${hits.length > 7 ? `Показать все — найдено ${hits.length}` : ''}</span><span style="display: flex; gap: 10px; color: #8c94a2; font-size: 12px; align-items: center;"><span><span class="kbd2">↑↓</span> выбрать</span><span><span class="kbd2">Enter</span> открыть</span><span><span class="kbd2">Esc</span> закрыть</span></span></div>
  </div>`;
}
function toastHtml() { return ui.toast ? `<div class="toast">${ICON.chk()}<span>${ui.toast}</span></div>` : ''; }

/* ---------- рендер ---------- */
function render() {
  const r = route();
  let main;
  if (r.view === 'season') main = viewSeason(r.id);
  else if (r.view === 'theme') main = viewTheme(r.id);
  else if (r.view === 'lesson') main = viewLesson(r.id);
  else if (r.view === 'tz') main = viewTZ(r.id);
  else main = viewHome();
  $app().innerHTML = header() + `<div class="wrap">${sidebar(r)}${main}</div>` + popoverHtml() + modalHtml() + notifHtml() + searchHtml() + toastHtml();
  const si = document.getElementById('search-input'); if (si) { si.focus(); si.setSelectionRange(si.value.length, si.value.length); }
  const ri = document.getElementById('rename-input'); if (ri) { ri.focus(); ri.select(); }
  document.title = r.view === 'lesson' || r.view === 'tz' ? lesson(r.id).title + ' — Сценарии' : r.view === 'theme' ? 'Тема ' + theme(r.id).num + ' — Сценарии' : r.view === 'season' ? season(r.id).title + ' — Сценарии' : 'Сценарии — ДОМ';
}
function toast(text) { ui.toast = text; render(); clearTimeout(ui._tt); ui._tt = setTimeout(() => { ui.toast = null; render(); }, 2600); }
function markSaving() { ui.saving = true; const el = document.querySelector('.save'); if (el) el.textContent = 'Сохраняем…'; clearTimeout(ui._st); ui._st = setTimeout(() => { ui.saving = false; const e2 = document.querySelector('.save'); if (e2) e2.textContent = 'Сохранено'; }, 700); }
function notify(text) { DB.notifications.unshift({ when: 'только что', text, unread: true }); }

/* ---------- действия ---------- */
function setStage(l, s) {
  if (s === l.stage) return;
  if (s === 'design' && STAGES.indexOf(l.stage) < STAGES.indexOf('design')) { ui.popover = null; ui.modal = { kind: l.handoff ? 'rehandoff' : 'handoff', id: l.id }; render(); return; }
  const prev = l.stage; l.stage = s; ui.popover = null;
  if (s === 'done') notify(`«${l.title}» → Готово. Андрей и Игорь уведомлены`);
  markSaving(); render(); toast(`${STAGE_LABEL[prev]} → ${STAGE_LABEL[s]}: «${l.title}»`);
}
function doHandoff(l) {
  l.handoff = { date: TODAY, snap: snapshot(l) }; l.stage = 'design'; ui.modal = null; markSaving(); render(); toast(`Передано в дизайн: «${l.title}»`);
}
function duplicateLesson(l) {
  const t = theme(l.themeId); const copy = JSON.parse(JSON.stringify(l)); copy.id = 'l' + (Object.keys(DB.lessons).length + 100 + Math.floor(Math.random() * 1000));
  copy.title = l.title.replace(/^(\d+) класс/, (m, n) => (parseInt(n, 10) + 1) + ' класс').replace(/^(\d+)–(\d+) классы/, (m, a, b) => (parseInt(b, 10) + 1) + '–' + (parseInt(b, 10) + 2) + ' классы');
  if (copy.title === l.title || themeLessons(t).some((x) => x.title === copy.title)) copy.title = l.title + ' (копия)';
  copy.code = l.code.replace(/-(\d+)$/, (m, n) => '-' + (parseInt(n, 10) + 1)); copy.stage = 'scenario'; copy.duplicateOf = l.id; delete copy.handoff;
  const re = (obj) => { for (const b of blocksOf(obj)) { if (b.variant) for (const a of b.alts) a.code = a.code.replace(l.code, copy.code); else b.code = b.code.replace(l.code, copy.code); } for (const s of obj.slides) s.code = s.code.replace(l.code, copy.code); };
  re(copy); DB.lessons[copy.id] = copy; t.lessons.splice(t.lessons.indexOf(l.id) + 1, 0, copy.id); ui.popover = null; markSaving(); render(); toast(`Создан дубликат: «${copy.title}»`);
}
function addLesson(t) {
  const id = 'l' + (Object.keys(DB.lessons).length + 500 + Math.floor(Math.random() * 1000)); const n = themeLessons(t).length;
  DB.lessons[id] = { id, themeId: t.id, title: 'Новое занятие', code: `S${t.num}-${n + 1}`, stage: 'scenario', parts: [], slides: [], authorText: ['Начните с текста сценария или вставьте его из Word — потом разложите по блокам.'] };
  t.lessons.push(id); markSaving(); ui.modal = { kind: 'rename', id }; render();
}
function newTheme(sid) {
  const s = season(sid); const num = s.themes.length + 1; const id = 't' + (Object.keys(DB.themes).length + 100 + Math.floor(Math.random() * 1000));
  const last = s.themes.length ? theme(s.themes[s.themes.length - 1]) : null;
  DB.themes[id] = { id, seasonId: sid, num, title: 'Новая тема', emoji: '📌', type: 'отраслевое', lessonDate: last ? nextWeek(last.lessonDate) : '3 сентября', openDate: last ? nextWeek(last.openDate) : '31 августа', plan: 3, note: '', lessons: [], schemeAssembled: false };
  s.themes.push(id); ui.expanded[sid] = true; markSaving(); go('#/theme/' + id); toast('Тема создана — заполните название, тип и даты');
}
function nextWeek(d) { const [n, m] = d.split(' '); const mi = MONTHS.indexOf(m); const dt = new Date(2026, mi, parseInt(n, 10)); dt.setDate(dt.getDate() + 7); return fmt(dt); }
function splitParagraph(l, idx) {
  const text = l.authorText[idx]; if (!text) return;
  const plain = text.replace(/<[^>]+>/g, ''); const isSpeech = /^Слово педагога:/.test(plain); const isCmd = /демонстрирует слайд/i.test(plain);
  const title = plain.replace(/^Слово педагога:\s*/, '').split(/[.!?]/)[0].slice(0, 60);
  const part = l.parts.length ? l.parts[l.parts.length - 1] : (l.parts.push({ title: 'Введение', blocks: [] }), l.parts[0]);
  const n = blocksOf(l).length;
  const b = { id: 'nb' + Date.now() + n, title, type: isSpeech ? 'speech' : isCmd ? 'work' : 'help', min: isSpeech ? 2 : 0, code: `${l.code}-${n}`, body: [isSpeech ? S(plain.replace(/^Слово педагога:\s*/, '')) : isCmd ? C(plain) : T(text)] };
  part.blocks.push(b); l.authorText.splice(idx, 1); ui.open[b.id] = true; markSaving();
  if (!l.authorText.length) { delete l.authorText; ui.unsplitMode = false; }
  ui.open['p' + l.id + (l.parts.length - 1)] = true; render();
}

/* ---------- события ---------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el) { if (!e.target.closest('.pop')) { if (ui.popover) { ui.popover = null; render(); } } return; }
  if (e.target.isContentEditable && el.dataset.act === 'toggle-block') return;
  const act = el.dataset.act, id = el.dataset.id, val = el.dataset.val;
  e.stopPropagation();
  switch (act) {
    case 'go': ui.popover = null; ui.search = null; ui.modal = null; ui.notif = false; if (el.dataset.block) ui.open[el.dataset.block] = true; if (location.hash === el.dataset.href) render(); else go(el.dataset.href); break;
    case 'toggle': ui.expanded[id] = !ui.expanded[id]; render(); break;
    case 'toggle-block': ui.open[id] = id.startsWith('p') || DB.lessons && findBlock(id) && findBlock(id).variant ? ui.open[id] === false : !ui.open[id]; if (id.startsWith('p') || (findBlock(id) && findBlock(id).variant)) ui.open[id] = ui.open[id] === false ? true : (ui.open[id] === undefined ? false : !ui.open[id]); render(); break;
    case 'filter': ui.filter[id] = val; render(); break;
    case 'stage-pop': { const r = el.getBoundingClientRect(); ui.popover = ui.popover && ui.popover.id === id && ui.popover.kind === 'stage' ? null : { kind: 'stage', id, x: r.left, y: r.bottom + 6 }; render(); break; }
    case 'row-menu': { const r = el.getBoundingClientRect(); ui.popover = { kind: 'row', id, x: r.right - 216, y: r.bottom + 6 }; render(); break; }
    case 'row-menu-top': { const r = route(); const rc = el.getBoundingClientRect(); ui.popover = { kind: 'row', id: r.id, x: rc.right - 216, y: rc.bottom + 6 }; render(); break; }
    case 'set-stage': setStage(lesson(id), val); break;
    case 'handoff': ui.modal = { kind: lesson(id).handoff ? 'rehandoff' : 'handoff', id }; render(); break;
    case 'handoff-ok': doHandoff(lesson(id)); break;
    case 'close': ui.modal = null; ui.notif = false; ui.search = null; ui.popover = null; render(); break;
    case 'dup': duplicateLesson(lesson(id)); break;
    case 'rename': ui.popover = null; ui.modal = { kind: 'rename', id }; render(); break;
    case 'rename-ok': { const v = document.getElementById('rename-input').value.trim(); if (v) lesson(id).title = v; ui.modal = null; markSaving(); render(); break; }
    case 'archive': { const l = lesson(id); l.archived = true; ui.popover = null; markSaving(); render(); toast(`«${l.title}» — в архиве`); break; }
    case 'add-lesson': addLesson(theme(id)); break;
    case 'new-theme': newTheme(id); break;
    case 'pack': ui.modal = { kind: 'pack', id }; render(); break;
    case 'pack-ok': { const t = theme(id); ui.modal = null; render(); toast(`Пакет собран: Тема ${t.num} — схема, элементы, файлы, чек-лист`); break; }
    case 'scheme': { const t = theme(id); t.schemeAssembled = true; notify(`Тема ${t.num} «${t.title}» — схема собрана в конструкторе`); markSaving(); render(); toast('Отмечено: схема темы собрана'); break; }
    case 'unsplit': ui.unsplitMode = !ui.unsplitMode; render(); break;
    case 'split': splitParagraph(lesson(id), parseInt(val, 10)); break;
    case 'add-slide': { const l = lesson(id); l.slides.push(val === 'handout' ? { id: 's' + Date.now(), kind: 'handout', title: 'Новая раздатка', code: '', audience: 'students', content: '', designer: '' } : { id: 's' + Date.now(), kind: 'slide', title: 'Новый слайд', code: '', content: '', designer: '' }); markSaving(); render(); break; }
    case 'attach': { const l = lesson(route().id); const s = l.slides.find((x) => x.id === id); s.image = 'эскиз-' + (slideNumber(l, s) || 'раздатка') + '.png'; markSaving(); render(); toast('Картинка приложена к слайду'); break; }
    case 'search': ui.search = ui.search === null ? '' : null; render(); break;
    case 'notif': ui.notif = !ui.notif; DB.notifications.forEach((n) => { n.unread = false; }); render(); break;
    case 'toast': toast(val); break;
  }
});
function findBlock(id) { for (const l of Object.values(DB.lessons)) for (const b of blocksOf(l)) { if (b.id === id) return b; if (b.variant) for (const a of b.alts) if (a.id === id) return a; } return null; }
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'search-input') { ui.search = t.value; const box = t.closest('.dlg'); const html = searchHtml(); const tmp = document.createElement('div'); tmp.innerHTML = html; const fresh = tmp.querySelector('.dlg'); box.innerHTML = fresh.innerHTML; const si = document.getElementById('search-input'); si.focus(); si.setSelectionRange(si.value.length, si.value.length); return; }
  if (!t.isContentEditable) return;
  markSaving();
  const f = t.dataset.field, id = t.dataset.id;
  if (f && id) { const obj = DB.themes[id] || DB.lessons[id]; if (obj) obj[f] = f === 'plan' ? (parseInt(t.textContent, 10) || obj.plan) : t.textContent.trim(); return; }
  const sf = t.dataset.sfield; if (sf) { const l = lesson(route().id); const s = l.slides.find((x) => x.id === t.dataset.id); if (s) s[sf] = t.textContent.trim(); return; }
  const tb = t.closest('[data-block]'); if (tb) { const b = findBlock(tb.dataset.block); if (b) { const ps = [...tb.querySelectorAll('.pp, .pl')]; b.body = ps.map((p) => { if (p.classList.contains('pl')) return { role: 'list', items: [...p.querySelectorAll('li')].map((li) => li.innerHTML) }; const html = p.innerHTML.replace(/^<b>Слово педагога:<\/b>\s*/, ''); return { role: p.classList.contains('rem') ? 'remark' : (p.innerHTML.startsWith('<b>Слово педагога') ? 'speech' : 'text'), text: html.replace(/<span class="slideref">(.*?)<\/span>/g, '$1') }; }); } }
});
document.addEventListener('focusout', (e) => { if (e.target.isContentEditable || e.target.closest && e.target.closest('[data-block]')) { setTimeout(() => { if (!document.activeElement || !document.activeElement.isContentEditable) render(); }, 60); } });
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ui.search = ui.search === null ? '' : null; render(); }
  if (e.key === 'Escape') { ui.modal = null; ui.search = null; ui.popover = null; ui.notif = false; render(); }
  if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'search-input') { const h = document.querySelector('.hit.cur'); if (h) { ui.search = null; if (h.dataset.block) ui.open[h.dataset.block] = true; go(h.dataset.href); } }
  if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'rename-input') { document.querySelector('[data-act="rename-ok"]').click(); }
  if (e.key === 'Enter' && document.activeElement && document.activeElement.isContentEditable && document.activeElement.classList.contains('ed')) { e.preventDefault(); document.activeElement.blur(); }
});
for (const l of Object.values(DB.lessons)) if (l.handoff && !l.handoff.snap) l.handoff.snap = snapshot(l);
window.addEventListener('hashchange', () => { ui.popover = null; ui.unsplitMode = false; window.scrollTo(0, 0); render(); });
render();
