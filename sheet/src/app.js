// 介面：左側建立角色（全部預設自動選好），右側即時產生角色紙
"use strict";

const KEY = "dnd-sheet:v1";
const SITE = "https://5etools-zh.graphia.workers.dev/";
const esc = s => String(s ?? "").replace(/[&<>"]/g, ch => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;"}[ch]));
const uid = () => Math.random().toString(36).slice(2, 10);
const $ = (s, r = document) => r.querySelector(s);

let store = {chars: {}, cur: null, view: "build"};
const cur = () => store.chars[store.cur];

function load() {
	try { const s = JSON.parse(localStorage.getItem(KEY)); if (s?.chars) store = {...store, ...s}; } catch { /* 無法讀取就用新的 */ }
}
function save() {
	try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* 私密瀏覽等情況 */ }
}
function newChar(base = {}) {
	return fill({id: uid(), name: "", level: 1, cls: "Fighter", sp: "Human", bg: "Soldier", method: "array", bgMode: "21", eqA: "A", eqB: "A", ...base});
}

// ---- 路徑存取（給 chip 與選單用）----
const getP = (o, p) => p.split(".").reduce((a, k) => a?.[k], o);
const setP = (o, p, v) => { const ks = p.split("."); const last = ks.pop(); const t = ks.reduce((a, k) => (a[k] ||= {}), o); t[last] = v; };

function update(fn, {build = true} = {}) {
	const c = cur();
	fn(c);
	fill(c);
	save();
	render({build});
}

// ---- 共用小元件 ----
const seg = (name, val, opts) => `<div class="seg" role="radiogroup">${opts.map(([v, l]) => `<button type="button" data-set="${name}" data-v="${esc(v)}" class="${String(val) === String(v) ? "on" : ""}">${l}</button>`).join("")}</div>`;
const sel = (name, val, opts, attrs = "") => `<select data-set="${name}" ${attrs}>${opts.map(([v, l]) => `<option value="${esc(v)}" ${String(val) === String(v) ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
// 資訊小按鈕：開啟說明視窗（法術、專長、種族、背景、子職業共用）
const info = tip => `<button type="button" class="info" data-tip="${esc(tip)}" aria-label="說明" title="說明">i</button>`;
// max：自由選擇（法術），點選加入或取消，最多 max 個
const chips = (path, list, pool, label, fixed = [], tip = null, max = 0) => `<div class="chips">${pool.map(([v, l]) => {
	const f = fixed.includes(v);
	const btn = `<button type="button" class="chip ${list.includes(v) ? "on" : ""} ${f ? "fixed" : ""}" ${f ? "disabled" : `data-chip="${path}" data-v="${esc(v)}"${max ? ` data-max="${max}"` : ""}`}>${esc(l)}</button>`;
	return tip ? `<span class="cw ${list.includes(v) || f ? "on" : ""}">${btn}${info(`${tip}:${v}`)}</span>` : btn;
}).join("")}</div>`;
const sec = (title, body, extra = "") => `<section class="b-sec"><h3>${title}${extra ? `<span class="hint">${extra}</span>` : ""}</h3>${body}</section>`;
const skZh = id => D.skills.find(s => s.id === id)?.zh || id;
const spZh = k => D.spells[k]?.zh || k;
const itZh = k => D.items[k]?.zh || k;

// ---- 建立角色面板 ----
function renderBuild(c, d) {
	const k = cls(c), s = spc(c), b = bgd(c), L = c.level;
	const out = [];
	out.push(sec("角色", `
		<div class="row"><label class="grow">名稱<input type="text" data-in="name" value="${esc(c.name)}" placeholder="未命名角色"></label>
		<label>等級<span class="stepper"><button type="button" data-step="-1" aria-label="降一級">−</button><b>${L}</b><button type="button" data-step="1" aria-label="升一級">＋</button></span></label></div>`));
	// 職業
	let clsBody = `<div class="grid g4">${D.classes.map(x => `<button type="button" class="pick ${x.id === c.cls ? "on" : ""}" data-pick="cls" data-v="${x.id}">${x.zh}</button>`).join("")}</div>`;
	if (L >= 3) {
		clsBody += `<div class="row"><label class="grow">${esc(k.subTitle || "子職業")}${sel("sub", c.sub, k.subs.map(x => [x.id, `${x.zh}${srcTag(x)}`]))}</label>${info("sub:")}`;
		const sub = subOf(c);
		if (sub?.variants) clsBody += `<label class="grow">地形${sel("subVar", c.subVar, sub.variants.map(v => [v.en, {"Arid Land": "乾旱", "Polar Land": "極地", "Temperate Land": "溫帶", "Tropical Land": "熱帶"}[v.en] || v.en]))}</label>`;
		clsBody += "</div>";
		for (const ch of subChoices(c)) clsBody += `<p class="lab">${esc(sub.zh)}：自選法術（${c.subPick[ch.id].length}／${ch.n}）</p>${chips(`subPick.${ch.id}`, c.subPick[ch.id], ch.pool.map(x => [x, spZh(x)]), "", [], "spell", ch.n)}`;
	} else clsBody += `<p class="note">3 級時選擇子職業</p>`;
	if (c.cls === "Cleric") clsBody += `<div class="row"><span class="lab">神聖職序</span>${seg("order", c.order, [["protector", "守護者"], ["thaumaturge", "奇術師"]])}</div>`;
	if (c.cls === "Druid") clsBody += `<div class="row"><span class="lab">原初職序</span>${seg("order", c.order, [["magician", "術者"], ["warden", "守望者"]])}</div>`;
	out.push(sec("職業", clsBody));
	// 種族：2024 玩家手冊的種族直接點選，其他書的種族從選單挑；最後一項是自填
	const pickBtn = (f, x) => `<button type="button" class="pick ${x.id === c[f] ? "on" : ""}" data-pick="${f}" data-v="${esc(x.id)}">${esc(x.zh)}</button>`;
	const otherSel = (f, list, label, customLabel) => {
		const groups = new Map();
		for (const x of list) (groups.get(x.src) || groups.set(x.src, []).get(x.src)).push(x);
		const cur_ = list.some(x => x.id === c[f]) || c[f] === CUSTOM ? c[f] : "";
		return `<div class="row other"><label class="grow">${label}<select data-pick-sel="${f}" class="${cur_ ? "on" : ""}"><option value="">— 其他書籍 —</option>${[...groups].map(([src, xs]) => `<optgroup label="${esc(D.srcZh[src] || src)}">${xs.map(x => `<option value="${esc(x.id)}" ${x.id === cur_ ? "selected" : ""}>${esc(x.zh)}</option>`).join("")}</optgroup>`).join("")}<optgroup label="自填"><option value="${CUSTOM}" ${cur_ === CUSTOM ? "selected" : ""}>${customLabel}</option></optgroup></select></label>${info(f === "sp" ? "sp:" : "bg:")}</div>`;
	};
	let spBody = `<div class="grid g5">${D.species.filter(x => !x.legacy).map(x => pickBtn("sp", x)).join("")}</div>${otherSel("sp", D.species.filter(x => x.legacy), "其他種族", "自填種族…")}`;
	if (s.legacy && !s.custom) spBody += `<p class="note">${esc(D.srcZh[s.src] || s.src)}。依 2024 規則，舊版種族的屬性值加值不採用，只用背景的加值。</p>`;
	const lin = LINEAGE[c.sp];
	const lg = legacyOf(c);
	if (s.custom) {
		const u = c.cust?.sp || {};
		spBody += `<div class="row"><label class="grow">名稱<input type="text" data-in="cust.sp.name" value="${esc(u.name)}" placeholder="種族名稱"></label>
			<label>體型${sel("cust.sp.size", u.size || "M", [["M", "中型"], ["S", "小型"], ["SM", "小型或中型"]])}</label></div>
			<div class="row"><label>速度<input type="number" data-num2="cust.sp.speed" value="${u.speed ?? 30}" min="0" max="120" step="5"></label><label>黑暗視覺<input type="number" data-num2="cust.sp.dv" value="${u.dv ?? 0}" min="0" max="300" step="30"></label><label>技能數<input type="number" data-num2="cust.sp.sk" value="${u.sk ?? 0}" min="0" max="4"></label></div>
			<label class="blk">特性（每行一項，可寫成「名稱：說明」）<textarea data-in="cust.sp.tx" rows="4" placeholder="黑暗視覺：你能看見 60 呎內的黑暗。">${esc(u.tx)}</textarea></label>`;
	}
	const row = [];
	if (lin?.opts) row.push(`<label class="grow">${lin.label}${sel("lin", c.lin, lin.opts.map(o => [o.id, o.zh]))}</label>`);
	if (s.legacy && s.opts.length > 1) row.push(`<label class="grow">亞種與變體${sel("lin", c.lin, s.opts.map(o => [o.id, o.zh]))}</label>`);
	if (lin?.ab || lg?.saCh) row.push(`<label>施法屬性${sel("linSa", c.linSa, (lg?.saCh || ["int", "wis", "cha"]).map(a => [a, ABZH[a]]))}</label>`);
	if (lg?.resCh) row.push(`<label>抗性${sel("resPick", c.resPick, lg.resCh.map(x => [x, DMG_ZH[x] || x]))}</label>`);
	const sizes = lg?.size || s.size;
	if (sizes.length > 1 && !s.custom) row.push(`<label>體型${sel("size", c.size, sizes.map(z => [z, SIZE_ZH[z]]))}</label>`);
	if (row.length) spBody += `<div class="row">${row.join("")}</div>`;
	if (lg?.sk?.any) spBody += `<p class="lab">種族技能（${lg.sk.any} 項）</p>${chips("spSkill", c.spSkill, D.skills.map(x => [x.id, x.zh]))}`;
	if (lg?.sk?.ch) spBody += `<p class="lab">種族技能（${lg.sk.ch.n} 項）</p>${chips("spSkill2", c.spSkill2, lg.sk.ch.from.map(x => [x, skZh(x)]))}`;
	if (lg?.sp?.choose?.length) spBody += `<p class="lab">種族戲法（${c.linPick.length}／${lg.sp.choose[0].n}）</p>${chips("linPick", c.linPick, lg.sp.choose[0].pool.map(x => [x, spZh(x)]), "", [], "spell", lg.sp.choose[0].n)}`;
	if (c.sp === "Elf" || c.sp === "Human") spBody += `<div class="row"><span class="lab">${c.sp === "Elf" ? "敏銳感官" : "技藝純熟"}</span>${sel("spSkill.0", c.spSkill[0], (c.sp === "Elf" ? ["insight", "perception", "survival"] : D.skills.map(x => x.id)).map(x => [x, skZh(x)]))}</div>`;
	out.push(sec("種族", spBody));
	// 背景
	let bgBody = `<div class="grid g4">${D.backgrounds.filter(x => !x.src).map(x => pickBtn("bg", x)).join("")}</div>${otherSel("bg", D.backgrounds.filter(x => x.src), "其他背景", "自填背景…")}`;
	if (b.legacy && !b.custom) bgBody += `<p class="note">${esc(D.srcZh[b.src] || b.src)}的舊版背景：屬性加值可加在任何屬性，並可自選一個起源專長。</p>`;
	else if (b.src) bgBody += `<p class="note">${esc(D.srcZh[b.src] || b.src)}</p>`;
	if (b.custom) {
		const u = c.cust?.bg || {};
		bgBody += `<div class="row"><label class="grow">名稱<input type="text" data-in="cust.bg.name" value="${esc(u.name)}" placeholder="背景名稱"></label><label class="grow">工具熟練<input type="text" data-in="cust.bg.tool" value="${esc(u.tool)}" placeholder="例如：盜賊工具"></label></div>
			<label class="blk">背景特性<textarea data-in="cust.bg.tx" rows="3" placeholder="背景給的特殊能力或說明">${esc(u.tx)}</textarea></label>`;
	}
	bgBody += `<div class="row"><span class="lab">屬性加值</span>${seg("bgMode", c.bgMode, [["21", "+2／+1"], ["111", "+1／+1／+1"]])}</div>`;
	if (c.bgMode === "21") bgBody += `<div class="row"><label class="grow">+2${sel("bgA", c.bgA, b.ab.map(a => [a, ABZH[a]]))}</label><label class="grow">+1${sel("bgB", c.bgB, b.ab.filter(a => a !== c.bgA).map(a => [a, ABZH[a]]))}</label></div>`;
	else if (b.legacy) bgBody += chips("bg111", c.bg111, AB.map(a => [a, ABZH[a]]));
	else bgBody += `<p class="note">${b.ab.map(a => ABZH[a]).join("、")}各 +1</p>`;
	if (b.skCh) bgBody += `<p class="lab">背景技能（${b.skCh.n} 項）</p>${chips("bgSkill", c.bgSkill, (b.skCh.from || D.skills.map(x => x.id)).map(x => [x, skZh(x)]))}`;
	bgBody += `<p class="note">技能：${[...b.sk, ...(c.bgSkill || [])].map(skZh).join("、")}　專長：${esc(b.feat ? D.feats[b.feat.split(";")[0]]?.zh || "" : "自選起源專長")}${b.feature ? `　${esc(b.feature.zh)}` : ""}</p>`;
	out.push(sec("背景", bgBody));
	// 屬性值
	let abBody = `<div class="row">${seg("method", c.method, [["array", "標準陣列"], ["point", "購點"], ["manual", "自訂"]])}</div><div class="abil">`;
	const spent = AB.reduce((n, a) => n + (PB_COST[c.base[a]] ?? 99), 0);
	for (const a of AB) {
		let ctl;
		if (c.method === "array") ctl = sel(`base.${a}`, c.base[a], STD_ARRAY.map(v => [v, v]), "data-swap");
		else if (c.method === "point") ctl = `<span class="stepper sm"><button type="button" data-pt="${a}" data-v="-1" ${c.base[a] <= 8 ? "disabled" : ""}>−</button><b>${c.base[a]}</b><button type="button" data-pt="${a}" data-v="1" ${c.base[a] >= 15 || spent + (PB_COST[c.base[a] + 1] - PB_COST[c.base[a]]) > 27 ? "disabled" : ""}>＋</button></span>`;
		else ctl = `<input type="number" min="1" max="30" data-num="base.${a}" value="${c.base[a]}">`;
		abBody += `<div class="ab"><span class="ab-n">${ABZH[a]}</span>${ctl}<span class="ab-f">${d.sc[a]}<small>${sgn(d.m[a])}</small></span></div>`;
	}
	abBody += "</div>";
	if (c.method === "point") abBody += `<p class="note">已用 ${spent}／27 點</p>`;
	out.push(sec("屬性值", abBody, "右側為加總後數值"));
	// 技能
	const pool = (k.skills.from || D.skills.map(x => x.id)).map(x => [x, skZh(x)]);
	let skBody = `<p class="lab">職業技能（${k.skills.n || k.skills.any} 項）</p>${chips("skills", c.skills, pool, "", b.sk)}`;
	if (expertiseCount(c)) {
		const profs = d.skills.filter(x => x.p).map(x => [x.id, x.zh]);
		skBody += `<p class="lab">專精（${expertiseCount(c)} 項）</p>${chips("expertise", c.expertise, c.cls === "Wizard" ? profs.filter(([x]) => ["arcana", "history", "investigation", "medicine", "nature", "religion"].includes(x)) : profs)}`;
	}
	out.push(sec("技能", skBody, "點選即可替換"));
	// 專長
	let ftBody = "";
	for (const sl of featSlots(c)) {
		const f = c.feats[sl.id], fd = D.feats[f.k];
		ftBody += `<div class="feat"><span class="lab">${esc(sl.src)}</span>`;
		if (sl.fixed) ftBody += `<b>${esc(fd?.zh)}</b>`;
		else {
			const opts = featOptions(sl, L, c);
			const core = opts.filter(x => !D.feats[x].src), more = opts.filter(x => D.feats[x].src);
			const groups = new Map();
			for (const x of more) (groups.get(D.feats[x].src) || groups.set(D.feats[x].src, []).get(D.feats[x].src)).push(x);
			const o = (x, l) => `<option value="${esc(x)}" ${x === f.k ? "selected" : ""}>${esc(l)}</option>`;
			ftBody += `<select data-set="feats.${sl.id}.k">${core.map(x => o(x, D.feats[x].zh)).join("")}${[...groups].map(([src, xs]) => `<optgroup label="${esc(D.srcZh[src] || src)}">${xs.map(x => o(x, D.feats[x].zh)).join("")}</optgroup>`).join("")}<optgroup label="自填">${o(CUSTOM, "自填專長…")}</optgroup></select>`;
		}
		if (f.k !== CUSTOM) ftBody += info(`feat:${f.k}`);
		else ftBody += `<input type="text" class="sm" data-in="feats.${sl.id}.name" value="${esc(f.name)}" placeholder="專長名稱"><textarea data-in="feats.${sl.id}.tx" rows="2" placeholder="專長說明（選填）">${esc(f.tx)}</textarea>`;
		if (f.ab) {
			const n = f.k === "ability score improvement" ? 2 : 1;
			for (let i = 0; i < n; i++) if (fd.ab.length > 1) ftBody += sel(`feats.${sl.id}.ab.${i}`, f.ab[i], fd.ab.map(a => [a, `${ABZH[a]} +1`]), "class=sm");
		}
		if (f.k === "magic initiate") {
			const LZ = {cleric: "牧師", druid: "德魯伊", wizard: "法師"};
			ftBody += `<div class="row"><label>法術列表${sel(`feats.${sl.id}.list`, f.list, Object.entries(LZ).map(([v, l]) => [v, sl.list === v ? `${l}（背景指定）` : l]), "class=sm")}</label><label>施法屬性${sel(`feats.${sl.id}.sa`, f.sa, ["int", "wis", "cha"].map(a => [a, ABZH[a]]), "class=sm")}</label></div>`;
			const L1 = f.list[0].toUpperCase() + f.list.slice(1);
			const p0 = Object.keys(D.spells).filter(x => D.spells[x].l === 0 && D.spells[x].cls.includes(L1));
			const p1 = Object.keys(D.spells).filter(x => D.spells[x].l === 1 && D.spells[x].cls.includes(L1));
			ftBody += `<details data-k="mi-${sl.id}"><summary>魔法學徒法術：${[...f.can, ...f.s1].map(spZh).join("、")}</summary><p class="lab">戲法（${f.can.length}／2）</p>${chips(`feats.${sl.id}.can`, f.can, p0.map(x => [x, spZh(x)]), "", [], "spell", 2)}<p class="lab">1 環（${f.s1.length}／1）</p>${chips(`feats.${sl.id}.s1`, f.s1, p1.map(x => [x, spZh(x)]), "", [], "spell", 1)}</details>`;
		}
		if (f.sk) ftBody += `<details data-k="sk-${sl.id}"><summary>技巧嫻熟：${f.sk.map(skZh).join("、")}</summary>${chips(`feats.${sl.id}.sk`, f.sk, D.skills.map(x => [x.id, x.zh]))}</details>`;
		ftBody += "</div>";
	}
	out.push(sec("專長", ftBody));
	// 法術
	if (d.sp) {
		const sp = d.sp;
		let spB = "";
		if (sp.nC) spB += `<p class="lab">戲法（${c.cantrips.length}／${sp.nC}）</p>${chips("cantrips", c.cantrips, byPri(sp.poolC, SP_PRI[sp.list].c).map(x => [x, spZh(x)]), "", sp.alwaysKeys, "spell", sp.nC)}`;
		spB += `<p class="lab">準備法術（${c.prepared.length}／${sp.nP}）${sp.always.length ? `　另有常備 ${sp.always.length} 道` : ""}</p>`;
		for (let lv = 1; lv <= sp.maxLv; lv++) {
			const list = sp.poolS.filter(x => D.spells[x].l === lv);
			const n = c.prepared.filter(x => D.spells[x].l === lv).length;
			spB += `<details data-k="sp-${lv}" ${lv === sp.maxLv || lv === 1 ? "open" : ""}><summary>${lv} 環（已選 ${n}）</summary>${chips("prepared", c.prepared, byPri(list, SP_PRI[sp.list].s).map(x => [x, spZh(x)]), "", sp.alwaysKeys, "spell", sp.nP)}</details>`;
		}
		spB += `<button type="button" class="link" data-act="resetSpells">重新推薦法術</button>`;
		out.push(sec("法術", spB, "點選加入或取消"));
	}
	// 裝備
	const eqDesc = lst => lst.map(e => e.gp != null ? `${e.gp / 100} GP` : e.special || (e.choose ? "樂器／工具" : `${itZh(e.k)}${e.q > 1 ? `×${e.q}` : ""}`)).join("、");
	let eqB = `<p class="lab">職業起始裝備</p><div class="opts">${Object.entries(k.eq).map(([o, lst]) => `<button type="button" class="opt ${c.eqA === o ? "on" : ""}" data-set="eqA" data-v="${o}"><b>${o}</b>${esc(eqDesc(lst))}</button>`).join("")}</div>`;
	eqB += `<p class="lab">背景起始裝備</p><div class="opts">${Object.entries(b.eq).map(([o, lst]) => `<button type="button" class="opt ${c.eqB === o ? "on" : ""}" data-set="eqB" data-v="${o}"><b>${o}</b>${esc(eqDesc(lst))}</button>`).join("")}</div>`;
	for (const ch of toolChoices(c)) {
		if (ch.n === 1) eqB += `<div class="row"><span class="lab">${ch.label}</span>${sel(`toolPick.${ch.id}.0`, c.toolPick[ch.id][0], ch.pool.map(x => [x, itZh(x)]))}</div>`;
		else eqB += `<p class="lab">${ch.label}（${ch.n}）</p>${chips(`toolPick.${ch.id}`, c.toolPick[ch.id], ch.pool.map(x => [x, itZh(x)]))}`;
	}
	if (c.mastery.length) {
		const allW = Object.keys(D.items).filter(x => D.items[x].mastery && weaponProf(c, D.items[x]));
		eqB += `<details data-k="mastery"><summary>武器精通（${c.mastery.length}）：${c.mastery.map(itZh).join("、")}</summary>${chips("mastery", c.mastery, allW.map(x => [x, `${itZh(x)}・${D.masteryZh[D.items[x].mastery]}`]))}</details>`;
	}
	out.push(sec("裝備", eqB));
	// 語言
	const langPool = D.languages.filter(l => l.std && l.id !== "Common").map(l => [l.id, l.zh]);
	out.push(sec("語言", `<p class="note">通用語，再加 ${c.langs.length} 種</p>${chips("langs", c.langs, langPool)}`));
	return out.join("");
}

// ---- 角色紙 ----
function box(title, body, cls_ = "") { return `<div class="box ${cls_}"><div class="bt">${title}</div>${body}</div>`; }
function playIn(path, val, attrs = "") { return `<input class="pi" data-play="${path}" value="${esc(val ?? "")}" ${attrs}>`; }
function tick(path, on, title = "") { return `<button type="button" class="tick ${on ? "on" : ""}" data-tick="${path}" aria-pressed="${!!on}" title="${title}"></button>`; }

function renderSheet(c, d) {
	const k = cls(c), s = spc(c), b = bgd(c), sub = subOf(c), P = c.play, L = c.level;
	const tipA = (tip, txt) => (tip ? `<a href="#" class="tip" data-tip="${tip}">${esc(txt)}</a>` : esc(txt));
	// 第一頁：標頭
	const head = `<div class="hdr">
		<div class="box ident">
			<div class="f wide"><span>角色名稱</span><b>${esc(c.name || "　")}</b></div>
			<div class="f"><span>背景</span><b>${tipA(`bg:${b.id}`, b.zh)}</b></div><div class="f"><span>職業</span><b>${esc(k.zh)}</b></div>
			<div class="f"><span>種族</span><b>${tipA(`sp:${s.id}`, s.zh)}</b></div><div class="f"><span>子職</span><b>${esc(sub?.zh || "")}</b></div>
		</div>
		<div class="box lvl"><div><span>等級</span><b>${L}</b></div><div><span>經驗</span>${playIn("xp", P.xp, "inputmode=numeric")}</div></div>
		<div class="box acb"><span>護甲等級</span><b>${d.ac.ac}</b><small>${esc(d.ac.note)}${d.shield && !d.ac.noShield ? "＋盾" : ""}</small></div>
		<div class="box hp"><div class="bt">生命值</div><div class="hpg">
			<div><span>現有</span>${playIn("hp", P.hp ?? d.hp, "inputmode=numeric")}</div>
			<div><span>臨時</span>${playIn("thp", P.thp, "inputmode=numeric")}</div>
			<div><span>上限</span><b>${d.hp}</b></div></div></div>
		<div class="box hd"><div class="bt">生命骰</div><div class="hpg"><div><span>消耗</span>${playIn("hdu", P.hdu, "inputmode=numeric")}</div><div><span>上限</span><b>${L}d${d.hd}</b></div></div></div>
		<div class="box ds"><div class="bt">死亡豁免</div><div class="dsr"><span>成功</span>${[0, 1, 2].map(i => tick(`ds.s${i}`, P.ds?.[`s${i}`])).join("")}</div><div class="dsr"><span>失敗</span>${[0, 1, 2].map(i => tick(`ds.f${i}`, P.ds?.[`f${i}`])).join("")}</div></div>
	</div>`;
	// 屬性區
	const abBlock = a => {
		const sks = d.skills.filter(x => x.ab === a);
		return `<div class="box ab-b"><div class="bt">${ABZH[a]}</div><div class="ab-top"><b class="mod">${sgn(d.m[a])}</b><span class="score">${d.sc[a]}</span></div>
		<div class="sk sv"><i class="dot ${d.saves[a].p ? "on" : ""}"></i><span class="v">${sgn(d.saves[a].v)}</span><span>豁免</span></div>
		${sks.map(x => `<div class="sk"><i class="dot ${x.e ? "ex" : x.p ? "on" : ""}"></i><span class="v">${sgn(x.v)}</span><span>${esc(x.zh)}</span></div>`).join("")}</div>`;
	};
	const colA = `<div class="box pb"><div class="bt">熟練加值</div><b>${sgn(d.pb)}</b></div>${["str", "dex", "con"].map(abBlock).join("")}
		<div class="box insp"><div class="bt">英雄激勵</div>${tick("insp", P.insp, "英雄激勵")}</div>`;
	const colB = ["int", "wis", "cha"].map(abBlock).join("");
	const stats = `<div class="stats">
		<div class="box st"><div class="bt">先攻</div><b>${sgn(d.init)}</b></div>
		<div class="box st"><div class="bt">速度</div><b>${d.speed}<small> 呎</small></b>${d.speedNote ? `<small class="sn">${esc(d.speedNote)}</small>` : ""}</div>
		<div class="box st"><div class="bt">體型</div><b>${esc(d.size)}</b></div>
		<div class="box st"><div class="bt">被動察覺</div><b>${d.passive}</b></div></div>`;
	const atk = box("武器與攻擊戲法", `<table class="tbl"><thead><tr><th>名稱</th><th>命中加值／DC</th><th>傷害／類型</th><th>備註</th></tr></thead><tbody>
		${d.attacks.map(a => `<tr><td>${tipA(a.tip, a.name)}</td><td>${esc(a.hit)}</td><td>${esc(a.dmg)}</td><td class="sm">${esc(a.note)}</td></tr>`).join("") || `<tr><td colspan="4" class="muted">—</td></tr>`}</tbody></table>`);
	const resLine = d.res.length ? `<div class="res">${d.res.map(r => `<span><small>${esc(r.col)}</small>${esc(r.v)}</span>`).join("")}</div>` : "";
	const cf = box("職業能力", `${resLine}<ul class="flist">${d.feats.map((f, i) => `<li><small>${f.lv}</small>${tipA(`cf:${i}`, f.zh)}${f.sub ? `<em>${esc(sub.zh)}</em>` : ""}</li>`).join("")}</ul>`, "cfeat");
	const tr = box(b.feature ? "種族與背景特性" : "種族特性", `<ul class="flist">${d.linLabel ? `<li class="muted">${esc(d.linLabel)}</li>` : ""}${d.traits.map((t, i) => `<li>${tipA(`tr:${i}`, t.zh)}</li>`).join("")}
		${d.dv ? `<li class="muted">黑暗視覺 ${d.dv} 呎</li>` : ""}${d.resist.length ? `<li class="muted">抗性：${esc(d.resist.join("、"))}</li>` : ""}</ul>`);
	const ft = box("專長", `<ul class="flist">${d.featList.map((f, i) => `<li>${tipA(`ft:${i}`, f.zh)}${f.note ? `<em>${esc(f.note)}</em>` : ""}<small class="src">${esc(f.src)}</small></li>`).join("")}</ul>`);
	const pf = box("裝備與工具熟練", `<div class="arm"><span>護甲</span>${["light", "medium", "heavy", "shield"].map(a => `<span class="ck"><i class="dia ${d.armor.includes(a) ? "on" : ""}"></i>${d.armorZh[a]}</span>`).join("")}</div>
		<div class="pfl"><span>武器</span>${esc(d.wp.join("、"))}</div><div class="pfl"><span>工具</span>${esc(d.tools.join("、") || "—")}</div>`, "prof");
	const page1 = `<div class="page p1">${head}<div class="body1"><div class="colA">${colA}</div><div class="colB">${colB}${pf}</div><div class="colC">${stats}${atk}${cf}<div class="two">${tr}${ft}</div></div></div></div>`;

	// 第二頁
	const spl = d.spell;
	const cast = `<div class="box cast"><div class="ca"><span>施法屬性</span><b>${spl ? ABZH[spl.ab] : "—"}</b></div>
		<div class="cr"><b>${spl ? sgn(spl.mod) : "—"}</b><span>施法調整值</span></div><div class="cr"><b>${spl ? spl.dc : "—"}</b><span>法術豁免難度</span></div><div class="cr"><b>${spl ? sgn(spl.atk) : "—"}</b><span>法術命中加值</span></div></div>`;
	const slots = d.sp?.slots || [];
	const slotBox = box(`法術位${d.sp?.pact ? "<small>（契約魔法，短休恢復）</small>" : ""}`, `<div class="slots">${Array.from({length: 9}, (_, i) => {
		const n = slots[i] || 0;
		return `<div class="sl ${n ? "" : "off"}"><span>${"一二三四五六七八九"[i]}環</span><b>${n || "—"}</b><span class="tk">${Array.from({length: n}, (_, j) => tick(`slot.${i}.${j}`, P.slot?.[i]?.[j])).join("")}</span></div>`;
	}).join("")}</div>`);
	const rows = d.spellRows.map(r => {
		const sd = r.d;
		return `<tr><td class="c">${sd.l || "戲"}</td><td>${tipA(`spell:${r.k}`, sd.zh)}${r.tag ? `<small class="src">${esc(r.tag)}</small>` : ""}</td><td>${esc(sd.time)}</td><td>${esc(sd.range)}</td>
		<td class="crm"><i class="dia ${sd.c ? "on" : ""}"></i><i class="dia ${sd.r ? "on" : ""}"></i><i class="dia ${sd.m ? "on" : ""}"></i></td><td class="sm">${esc([sd.dur, r.note].filter(Boolean).join("；"))}</td></tr>`;
	}).join("");
	const spellTbl = box("戲法與準備法術", `<table class="tbl spells"><thead><tr><th>環數</th><th>法術名稱</th><th>施法時間</th><th>射程</th><th class="crm">專注 儀式 材料</th><th>備註</th></tr></thead><tbody>${rows || `<tr><td colspan="6" class="muted">此職業沒有施法能力</td></tr>`}</tbody></table>`, "spbox");
	const look = box("外貌", `<textarea data-play="look" rows="4" placeholder="外貌描述">${esc(P.look)}</textarea>`);
	const story = box("背景故事與性格", `<textarea data-play="story" rows="7" placeholder="背景故事、性格、理想、羈絆、缺點">${esc(P.story)}</textarea>
		<div class="pfl"><span>陣營</span><select data-play="align"><option value=""></option>${ALIGN.map(a => `<option ${P.align === a ? "selected" : ""}>${a}</option>`).join("")}</select></div>`);
	const lang = box("語言", `<p>${esc(d.langZh.join("、"))}</p>`);
	const eqList = d.items.map(i => `<li>${i.k ? tipA(`item:${i.k}`, i.n ? `${itZh(i.k)}（${i.n.replace(/^Book \((.*)\)$/, "$1") === "Prayers" ? "祈禱文" : i.n}）` : itZh(i.k)) : esc(i.n)}${i.q > 1 ? ` ×${i.q}` : ""}</li>`).join("");
	const eq = box("裝備", `<ul class="eq">${eqList}</ul><textarea data-play="eqx" rows="3" placeholder="其他物品">${esc(P.eqx)}</textarea>
		<div class="att"><span>同調魔法物品</span>${[0, 1, 2].map(i => `<div>${tick(`att${i}c`, P[`att${i}c`])}${playIn(`att${i}`, P[`att${i}`])}</div>`).join("")}</div>`);
	const coin = box("錢幣", `<div class="coins">${[["cp", "銅幣"], ["sp", "銀幣"], ["ep", "銀金幣"], ["gp", "金幣"], ["pp", "白金幣"]].map(([x, z]) => `<label><small>${x.toUpperCase()}</small>${playIn(`coin.${x}`, P.coin?.[x] ?? d.coins[x] ?? 0, "inputmode=numeric")}<span>${z}</span></label>`).join("")}</div>`);
	const page2 = `<div class="page p2"><div class="body2"><div class="colL"><div class="topL">${cast}${slotBox}</div>${spellTbl}</div><div class="colR">${look}${story}${lang}${eq}${coin}</div></div></div>`;
	return page1 + page2;
}

// ---- 詳細說明 ----
let lastD = null;
function tipContent(t) {
	const [type, ...rest] = t.split(":");
	const id = rest.join(":");
	const c = cur(), d = lastD;
	const link = (page, name, src = "xphb") => `${SITE}${page}#${encodeURIComponent(`${name.toLowerCase()}_${src}`).replace(/%20/g, "%20")}`;
	switch (type) {
		case "spell": {
			const s = D.spells[id];
			const lv = s.l ? `${s.l} 環` : "戲法";
			return {title: s.zh, sub: `${lv}　${s.time}　${s.range}　${s.comp}　${s.dur}${s.src ? `　${D.srcZh[s.src] || s.src}` : ""}`, tx: s.mt ? [`構材：${s.mt}`, ...s.tx] : s.tx, url: link("spells.html", s.en, (s.src || "xphb").toLowerCase())};
		}
		case "item": {
			const it = D.items[id];
			const sub = [it.dmg && `${it.dmg} ${DMG_ZH[it.dt] || ""}`, it.ac && `AC ${it.ac}`, it.p?.map(x => D.propZh[x]).join("、"), it.mastery && `精通：${D.masteryZh[it.mastery]}`].filter(Boolean).join("　");
			const tx = [];
			if (it.mastery) tx.push(`【${D.masteryZh[it.mastery]}】${D.masteryText[it.mastery]}`);
			if (it.pack) tx.push(`內容：${it.pack.map(p => `${itZh(p.k)}${p.q > 1 ? ` ×${p.q}` : ""}`).join("、")}`);
			return {title: it.zh, sub, tx, url: link("items.html", it.en)};
		}
		case "cf": { const f = d.feats[+id]; return {title: f.zh, sub: `${f.lv} 級`, tx: f.tx}; }
		case "tr": { const f = d.traits[+id]; return {title: f.zh, sub: f.bg ? bgd(c).zh : spc(c).zh, tx: f.tx}; }
		case "ft": { const f = d.featList[+id]; const fd = D.feats[f.k]; return {title: f.zh, sub: f.src, tx: f.tx, url: fd && link("feats.html", fd.en, (fd.src || "xphb").toLowerCase())}; }
		case "feat": {
			const fd = D.feats[id];
			if (!fd) return null;
			const pre = [fd.lv && `${fd.lv} 級以上`, fd.preFeat && `需要專長：${fd.preFeat.map(x => D.feats[x]?.zh || x).join("或")}`, fd.preCast && "需要施法能力", fd.preMartial && "需要軍用武器熟練", fd.preRace && "需要特定種族", fd.preAb && `需要${fd.preAb.map(([a, v]) => `${ABZH[a]} ${v}`).join("或")}`].filter(Boolean).join("；");
			return {title: fd.zh, sub: [{O: "起源專長", G: "通用專長", EB: "史詩恩賜"}[fd.cat[0]] || "戰鬥風格專長", D.srcZh[fd.src], pre].filter(Boolean).join("　"), tx: fd.tx, url: link("feats.html", fd.en, (fd.src || "xphb").toLowerCase())};
		}
		case "sub": {
			const sub = cls(c).subs.find(x => x.id === c.sub);
			if (!sub) return null;
			return {title: sub.zh, sub: [cls(c).zh, D.srcZh[sub.src]].filter(Boolean).join("　"), tx: sub.f.filter(f => f.en !== sub.en).map(f => `【${f.lv} 級：${f.zh}】${f.tx.join(" ")}`)};
		}
		case "bg": {
			const b = bgd(c);
			const tx = [`技能：${[...b.sk, ...(c.bgSkill || [])].map(skZh).join("、") || "—"}`, `專長：${b.feat ? D.feats[b.feat.split(";")[0]]?.zh || b.feat : "自選起源專長"}`];
			if (b.feature) tx.push(`【${b.feature.zh}】${b.feature.tx.join(" ")}`);
			return {title: b.zh, sub: `背景${srcTag(b)}`, tx, url: b.custom ? null : link("backgrounds.html", b.id, (b.src || "xphb").toLowerCase())};
		}
		case "sp": {
			const s = spc(c), lg = legacyOf(c);
			return {title: lg?.zh ? `${s.zh}（${lg.zh}）` : s.zh, sub: `種族${srcTag(s)}`, tx: (lg ? lg.tr : s.tr).map(t => `【${t.zh}】${t.tx.join(" ")}`), url: s.custom ? null : link("races.html", s.id.split("|")[0], (s.src || "xphb").toLowerCase())};
		}
	}
	return null;
}
function showTip(t) {
	const x = tipContent(t);
	if (!x) return;
	const dlg = $("#tip");
	dlg.innerHTML = `<form method="dialog"><header><h4>${esc(x.title)}</h4><button aria-label="關閉">✕</button></header><p class="sub">${esc(x.sub || "")}</p>${x.tx.map(p => `<p>${esc(p)}</p>`).join("")}${x.url ? `<p><a href="${x.url}" target="_blank" rel="noopener">在 5etools 中文版查看 ↗</a></p>` : ""}</form>`;
	dlg.showModal();
}

// ---- 主畫面 ----
function render({build = true} = {}) {
	const c = cur();
	const d = derive(c);
	lastD = d;
	if (build) {
		// 重繪後保留使用者展開或收合的區塊
		const keep = new Map([...$("#build").querySelectorAll("details[data-k]")].map(x => [x.dataset.k, x.open]));
		$("#build").innerHTML = renderBuild(c, d);
		for (const x of $("#build").querySelectorAll("details[data-k]")) if (keep.has(x.dataset.k)) x.open = keep.get(x.dataset.k);
	}
	$("#sheet").innerHTML = renderSheet(c, d);
	$("#who").innerHTML = Object.values(store.chars).map(x => `<option value="${x.id}" ${x.id === c.id ? "selected" : ""}>${esc(x.name || "未命名角色")}　${esc(cls(x).zh)} ${x.level}</option>`).join("");
	document.body.dataset.view = store.view;
	document.title = `${c.name || "未命名角色"} - 自動角色卡`;
}

// 換職業、種族、背景時，清掉只屬於舊選擇的手動設定
function doPick(f, v) {
	update(c => {
		if (c[f] === v) return;
		c[f] = v;
		if (f === "cls") { c.feats = {}; c.sub = null; c.ex = {}; c.pin = {}; c.free = {}; c.toolPick = {}; c.eqA = "A"; c.baseSet = c.bgSet = false; c.method = "array"; }
		if (f === "sp") { c.lin = c.size = null; for (const p of Object.keys(c.pin || {})) if (/^(spSkill|langs|linPick|toolPick\.sp)/.test(p)) { delete c.pin[p]; delete c.ex?.[p]; } delete c.free?.linPick; delete c.feats.hum; delete c.feats.spf; }
		if (f === "bg") { c.bgSet = false; c.eqB = "A"; delete c.feats.bg; for (const p of Object.keys(c.pin || {})) if (/^(toolPick\.bg|bgSkill|bg111)/.test(p)) { delete c.pin[p]; delete c.ex?.[p]; } }
	});
}

// ---- 明暗模式：跟隨系統 → 亮 → 暗 ----
const THEME_KEY = "dnd-sheet:theme";
const THEME_ZH = {auto: "跟隨系統", light: "明亮", dark: "黑暗"};
function applyTheme(t) {
	if (t === "light" || t === "dark") document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme;
	const b = $("[data-act=theme]");
	if (b) { b.dataset.mode = t; b.title = `顯示模式：${THEME_ZH[t]}`; b.setAttribute("aria-label", b.title); }
}
function cycleTheme() {
	let t = "auto";
	try { t = localStorage.getItem(THEME_KEY) || "auto"; } catch { /* 無法讀取 */ }
	t = {auto: "light", light: "dark", dark: "auto"}[t];
	try { localStorage.setItem(THEME_KEY, t); } catch { /* 無法儲存 */ }
	applyTheme(t);
	toast(`顯示模式：${THEME_ZH[t]}`);
}

// ---- 文字版（Markdown）----
function toMarkdown(c, d) {
	const k = cls(c), s = spc(c), b = bgd(c), sub = subOf(c), lg = legacyOf(c), P = c.play || {};
	const L = [];
	const line = (...x) => L.push(x.join(""));
	line(`# ${c.name || "未命名角色"}`);
	line("");
	line(`- **職業**：${k.zh} ${c.level} 級${sub ? `（${sub.zh}）` : ""}`);
	line(`- **種族**：${s.zh}${lg?.zh ? `（${lg.zh}）` : d.linLabel && !lg ? `（${d.linLabel}）` : ""}`);
	line(`- **背景**：${b.zh}`);
	if (P.align) line(`- **陣營**：${P.align}`);
	line("");
	line("## 基本數值");
	line("");
	line(`| 護甲等級 | 生命值上限 | 生命骰 | 先攻 | 速度 | 體型 | 被動察覺 | 熟練加值 |`);
	line(`| --- | --- | --- | --- | --- | --- | --- | --- |`);
	line(`| ${d.ac.ac}（${d.ac.note}${d.shield && !d.ac.noShield ? "＋盾" : ""}） | ${d.hp} | ${c.level}d${d.hd} | ${sgn(d.init)} | ${d.speed} 呎${d.speedNote ? `（${d.speedNote}）` : ""} | ${d.size} | ${d.passive} | ${sgn(d.pb)} |`);
	line("");
	line("## 屬性值");
	line("");
	line(`| 屬性 | 數值 | 調整值 | 豁免 | 技能 |`);
	line(`| --- | --- | --- | --- | --- |`);
	for (const a of AB) {
		const sks = d.skills.filter(x => x.ab === a).map(x => `${x.zh} ${sgn(x.v)}${x.e ? "（專精）" : x.p ? "（熟練）" : ""}`).join("、");
		line(`| ${ABZH[a]} | ${d.sc[a]} | ${sgn(d.m[a])} | ${sgn(d.saves[a].v)}${d.saves[a].p ? "（熟練）" : ""} | ${sks || "—"} |`);
	}
	line("");
	line("## 攻擊");
	line("");
	if (d.attacks.length) {
		line(`| 名稱 | 命中／DC | 傷害 | 備註 |`);
		line(`| --- | --- | --- | --- |`);
		for (const a of d.attacks) line(`| ${a.name} | ${a.hit} | ${a.dmg} | ${a.note || ""} |`);
	} else line("—");
	line("");
	line("## 職業能力");
	line("");
	for (const r of d.res) line(`- ${r.col}：${r.v}`);
	for (const f of d.feats) line(`- ${f.lv} 級：${f.zh}${f.sub ? `（${sub.zh}）` : ""}`);
	line("");
	line(`## ${b.feature ? "種族與背景特性" : "種族特性"}`);
	line("");
	if (d.linLabel) line(`- ${d.linLabel}`);
	for (const t of d.traits) line(`- ${t.zh}`);
	if (d.dv) line(`- 黑暗視覺 ${d.dv} 呎`);
	if (d.resist.length) line(`- 抗性：${d.resist.join("、")}`);
	line("");
	line("## 專長");
	line("");
	for (const f of d.featList) line(`- ${f.zh}${f.note ? `（${f.note}）` : ""}　— ${f.src}`);
	line("");
	line("## 熟練");
	line("");
	line(`- **護甲**：${d.armor.map(a => d.armorZh[a]).join("、") || "—"}`);
	line(`- **武器**：${d.wp.join("、") || "—"}`);
	line(`- **工具**：${d.tools.join("、") || "—"}`);
	line(`- **語言**：${d.langZh.join("、")}`);
	if (d.spell || d.spellRows.length) {
		line("");
		line("## 法術");
		line("");
		if (d.spell) line(`施法屬性 ${ABZH[d.spell.ab]}；法術豁免 DC ${d.spell.dc}；法術攻擊 ${sgn(d.spell.atk)}`);
		const slots = (d.sp?.slots || []).map((n, i) => (n ? `${i + 1} 環 ×${n}` : "")).filter(Boolean);
		if (slots.length) line(`法術位：${slots.join("、")}${d.sp.pact ? "（契約魔法）" : ""}`);
		line("");
		line(`| 環數 | 法術 | 施法時間 | 射程 | 持續時間 | 備註 |`);
		line(`| --- | --- | --- | --- | --- | --- |`);
		for (const r of d.spellRows) line(`| ${r.d.l || "戲法"} | ${r.d.zh} | ${r.d.time} | ${r.d.range} | ${r.d.dur} | ${[r.d.c && "專注", r.d.r && "儀式", r.tag, r.note].filter(Boolean).join("、")} |`);
	}
	line("");
	line("## 裝備");
	line("");
	for (const i of d.items) line(`- ${i.k ? itZh(i.k) : i.n}${i.q > 1 ? ` ×${i.q}` : ""}`);
	if (P.eqx) line(`- ${P.eqx.replace(/\n+/g, "、")}`);
	const coin = [["pp", "白金幣"], ["gp", "金幣"], ["ep", "銀金幣"], ["sp", "銀幣"], ["cp", "銅幣"]].map(([x, z]) => [z, P.coin?.[x] ?? d.coins[x] ?? 0]).filter(([, v]) => +v).map(([z, v]) => `${v} ${z}`);
	line(`- 錢幣：${coin.join("、") || "0"}`);
	if (P.look || P.story) {
		line("");
		line("## 外貌與背景故事");
		line("");
		if (P.look) line(P.look);
		if (P.look && P.story) line("");
		if (P.story) line(P.story);
	}
	return L.join("\n") + "\n";
}
function showMarkdown() {
	const md = toMarkdown(cur(), lastD);
	const dlg = $("#tip");
	dlg.innerHTML = `<form method="dialog" class="mdf"><header><h4>文字版</h4><button aria-label="關閉">✕</button></header><p class="sub">Markdown 格式，可直接貼到筆記、Discord 或論壇。</p><textarea id="mdtx" readonly rows="18">${esc(md)}</textarea><div class="mdbar"><button type="button" data-act="copyMd" class="primary">複製</button><button type="button" data-act="dlMd">下載 .md</button></div></form>`;
	dlg.showModal();
}
async function copyMd() {
	const t = $("#mdtx");
	try { await navigator.clipboard.writeText(t.value); toast("已複製文字版"); } catch { t.select(); document.execCommand("copy"); toast("已複製文字版"); }
}
function dlMd() {
	const c = cur();
	const a = document.createElement("a");
	a.href = URL.createObjectURL(new Blob([$("#mdtx").value], {type: "text/markdown"}));
	a.download = `${c.name || "角色"}.md`;
	a.click();
	setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function bind() {
	document.addEventListener("click", e => {
		// 點彈出視窗或選單以外的地方就關閉
		if (e.target.id === "tip") { e.target.close(); return; }
		for (const m of document.querySelectorAll("details.more[open]")) if (!m.contains(e.target)) m.removeAttribute("open");
		const t = e.target.closest("button, a.tip");
		if (!t) return;
		const c = cur();
		if (t.dataset.tip) { e.preventDefault(); showTip(t.dataset.tip); return; }
		if (t.dataset.pick) { doPick(t.dataset.pick, t.dataset.v); return; }
		if (t.dataset.act === "theme") { cycleTheme(); return; }
		if (t.dataset.act === "md") { showMarkdown(); t.closest("details.more")?.removeAttribute("open"); return; }
		if (t.dataset.act === "copyMd") { copyMd(); return; }
		if (t.dataset.act === "dlMd") { dlMd(); return; }
		if (t.dataset.set) {
			const p = t.dataset.set, v = t.dataset.v;
			update(c => {
				setP(c, p, v);
				if (p === "method") { c.baseSet = v !== "array"; if (v === "array") c.base = null; }
				if (p === "bgMode") c.bgSet = true;
			});
			return;
		}
		if (t.dataset.step) { update(c => { c.level = Math.max(1, Math.min(20, c.level + +t.dataset.step)); }); return; }
		if (t.dataset.pt) { update(c => { c.base[t.dataset.pt] += +t.dataset.v; c.baseSet = true; }); return; }
		if (t.dataset.chip && t.dataset.max) {
			// 自由選擇：點選加入或取消；只能選一個時直接換成新的
			const p = t.dataset.chip, v = t.dataset.v, max = +t.dataset.max;
			const list = getP(c, p) || [];
			if (!list.includes(v) && list.length >= max && max > 1) { toast(`已選滿 ${max} 個，請先取消一個`); return; }
			update(c => {
				c.pin ||= {}; c.free ||= {};
				c.free[p] = true;
				c.pin[p] = list.includes(v) ? list.filter(x => x !== v) : max === 1 ? [v] : [...list, v];
			});
			return;
		}
		if (t.dataset.chip) {
			const p = t.dataset.chip, v = t.dataset.v;
			update(c => {
				const list = getP(c, p) || [];
				c.ex ||= {}; c.pin ||= {};
				const ex = c.ex[p] ||= [];
				const pin = c.pin[p] || [];
				if (list.includes(v)) { c.pin[p] = pin.filter(x => x !== v); if (!ex.includes(v)) ex.push(v); }
				else { c.pin[p] = [v, ...pin]; c.ex[p] = ex.filter(x => x !== v); }
			});
			return;
		}
		if (t.dataset.tick) {
			const p = t.dataset.tick;
			setP(c.play, p, !getP(c.play, p));
			t.classList.toggle("on");
			save();
			return;
		}
		t.closest("details.more")?.removeAttribute("open");
		switch (t.dataset.act) {
			case "resetSpells": update(c => { for (const p of ["cantrips", "prepared"]) { delete c.ex?.[p]; delete c.pin?.[p]; delete c.free?.[p]; } }); break;
			case "new": { const n = newChar(); store.chars[n.id] = n; store.cur = n.id; store.view = "build"; save(); render(); break; }
			case "dup": { const n = JSON.parse(JSON.stringify(c)); n.id = uid(); n.name = `${c.name || "未命名角色"}（複本）`; store.chars[n.id] = n; store.cur = n.id; save(); render(); break; }
			case "del": {
				if (!confirm(`確定刪除「${c.name || "未命名角色"}」？`)) break;
				delete store.chars[c.id];
				if (!Object.keys(store.chars).length) { const n = newChar(); store.chars[n.id] = n; }
				store.cur = Object.keys(store.chars)[0]; save(); render(); break;
			}
			case "print": window.print(); break;
			case "export": {
				const blob = new Blob([JSON.stringify(c, null, 1)], {type: "application/json"});
				const a = document.createElement("a");
				a.href = URL.createObjectURL(blob); a.download = `${c.name || "角色"}.json`; a.click();
				setTimeout(() => URL.revokeObjectURL(a.href), 1000);
				break;
			}
			case "import": $("#file").click(); break;
			case "share": share(c); break;
			case "view": store.view = t.dataset.v; save(); document.body.dataset.view = store.view; document.querySelectorAll("[data-act=view]").forEach(b => b.classList.toggle("on", b.dataset.v === store.view)); window.scrollTo(0, 0); break;
		}
	});
	document.addEventListener("change", e => {
		const t = e.target;
		if (t.id === "who") { store.cur = t.value; save(); render(); return; }
		if (t.id === "file") { importFile(t.files[0]); t.value = ""; return; }
		if (t.dataset.pickSel) { if (t.value) doPick(t.dataset.pickSel, t.value); return; }
		if (t.dataset.num2) { update(c => { setP(c, t.dataset.num2, Math.max(0, +t.value || 0)); }); return; }
		if (t.dataset.set) {
			const p = t.dataset.set, v = t.value;
			update(c => {
				if (t.hasAttribute("data-swap")) {
					const a = p.split(".")[1], old = c.base[a];
					const other = AB.find(x => x !== a && c.base[x] === +v);
					if (other) c.base[other] = old;
					c.base[a] = +v;
					c.baseSet = true;
					return;
				}
				setP(c, p, v);
				if (p === "bgA" || p === "bgB") c.bgSet = true;
				if (p === "lin") { for (const q of ["linPick", "spSkill"]) { delete c.pin?.[q]; delete c.ex?.[q]; delete c.free?.[q]; } }
				if (p === "sub") { for (const q of Object.keys(c.pin || {})) if (q.startsWith("subPick")) { delete c.pin[q]; delete c.ex?.[q]; delete c.free?.[q]; } }
				if (/^feats\.\w+\.k$/.test(p)) { const id = p.split(".")[1]; c.feats[id] = {k: v}; for (const q of Object.keys(c.free || {})) if (q.startsWith(`feats.${id}.`)) { delete c.free[q]; delete c.pin?.[q]; } }
				if (/^feats\.\w+\.list$/.test(p)) { const id = p.split(".")[1]; for (const k of ["can", "s1"]) { delete c.pin?.[`feats.${id}.${k}`]; delete c.free?.[`feats.${id}.${k}`]; } }
				if (p.startsWith("spSkill.") || p.startsWith("toolPick.")) { c.pin ||= {}; c.pin[p.replace(/\.0$/, "")] = [v]; }
			});
			return;
		}
		if (t.dataset.num) { update(c => { setP(c, t.dataset.num, Math.max(1, Math.min(30, +t.value || 10))); c.baseSet = true; }); return; }
		if (t.dataset.play && t.tagName === "SELECT") { setP(cur().play, t.dataset.play, t.value); save(); }
	});
	document.addEventListener("input", e => {
		const t = e.target;
		if (t.dataset.in) { const c = cur(); setP(c, t.dataset.in, t.value); save(); render({build: false}); return; }
		if (t.dataset.play) { setP(cur().play, t.dataset.play, t.value); save(); }
	});
}

// ---- 分享與匯入 ----
async function share(c) {
	const json = JSON.stringify({...c, play: {}});
	let code;
	try {
		const cs = new Blob([json]).stream().pipeThrough(new CompressionStream("deflate-raw"));
		const buf = new Uint8Array(await new Response(cs).arrayBuffer());
		code = `z${btoa(String.fromCharCode(...buf)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
	} catch {
		code = `j${btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;
	}
	const url = `${location.origin}${location.pathname}#c=${code}`;
	try { await navigator.clipboard.writeText(url); toast("已複製分享連結"); } catch { prompt("分享連結", url); }
}
async function fromHash() {
	const m = location.hash.match(/^#c=([zj])(.+)$/);
	if (!m) return null;
	const b64 = m[2].replace(/-/g, "+").replace(/_/g, "/");
	const bin = atob(b64);
	let json;
	if (m[1] === "z") {
		const bytes = Uint8Array.from(bin, ch => ch.charCodeAt(0));
		const ds = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
		json = await new Response(ds).text();
	} else json = decodeURIComponent(escape(bin));
	return JSON.parse(json);
}
function adopt(o) {
	if (!o || !o.cls) throw new Error("格式不正確");
	o.id = uid();
	fill(o);
	store.chars[o.id] = o;
	store.cur = o.id;
	save();
	render();
}
function importFile(f) {
	if (!f) return;
	f.text().then(t => adopt(JSON.parse(t))).then(() => toast("已匯入")).catch(() => toast("無法讀取這個檔案"));
}
function toast(msg) {
	const t = $("#toast");
	t.textContent = msg; t.classList.add("on");
	clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("on"), 2200);
}

(async function main() {
	D = await (await fetch("data.json")).json();
	load();
	for (const id of Object.keys(store.chars)) { try { fill(store.chars[id]); } catch { delete store.chars[id]; } }
	try {
		const o = await fromHash();
		if (o) { history.replaceState(null, "", location.pathname); adopt(o); toast("已載入分享的角色"); }
	} catch { toast("分享連結無法讀取"); }
	if (!store.chars[store.cur]) {
		const ids = Object.keys(store.chars);
		if (ids.length) store.cur = ids[0];
		else { const n = newChar(); store.chars[n.id] = n; store.cur = n.id; }
	}
	bind();
	let th = "auto";
	try { th = localStorage.getItem(THEME_KEY) || "auto"; } catch { /* 無法讀取 */ }
	applyTheme(th);
	render();
	document.querySelectorAll("[data-act=view]").forEach(b => b.classList.toggle("on", b.dataset.v === store.view));
})();
