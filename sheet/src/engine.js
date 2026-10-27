// 規則計算：補上自動選擇（fill），再算出角色紙上所有數值（derive）
"use strict";

let D = null; // data.json
const mod = s => Math.floor((s - 10) / 2);
const sgn = n => (n >= 0 ? `+${n}` : `${n}`);
const uniq = a => [...new Set(a)];
const byPri = (list, pri) => [...list].sort((a, b) => {
	const ia = pri.indexOf(a), ib = pri.indexOf(b);
	return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
});
// 保留 cur 裡仍合法的選擇，不足的依優先順序補到 n 個
const fillPick = (cur, pool, n, pri = [], exclude = [], skip = []) => {
	const ok = (cur || []).filter(x => pool.includes(x) && !exclude.includes(x));
	const out = uniq(ok).slice(0, n);
	for (const x of byPri(pool, pri)) {
		if (out.length >= n) break;
		if (!out.includes(x) && !exclude.includes(x) && !skip.includes(x)) out.push(x);
	}
	return out;
};

// 使用者取消勾選的項目，自動補齊時跳過
const EX = (c, p) => c.ex?.[p] || [];
// 使用者手動加入的項目，其餘每次依等級重新推薦
const PIN = (c, p) => c.pin?.[p] || [];
const cls = c => D.classes.find(x => x.id === c.cls);
// 自填模式：資料庫沒有的種族與背景，由玩家填寫名稱與特性
const CUSTOM = "__custom";
function customSpecies(c) {
	const u = c.cust?.sp || {};
	const size = u.size === "S" ? ["S"] : u.size === "SM" ? ["S", "M"] : ["M"];
	const tr = String(u.tx || "").split(/\n+/).map(x => x.trim()).filter(Boolean).map((x, i) => {
		const m = /^([^：:]{1,12})[：:]\s*(.+)$/.exec(x);
		return m ? {zh: m[1], tx: [m[2]]} : x.length <= 12 ? {zh: x, tx: []} : {zh: `特性 ${i + 1}`, tx: [x]};
	});
	return {id: CUSTOM, zh: u.name || "自訂種族", custom: 1, legacy: 1, size, opts: [{id: CUSTOM, zh: "", size, speed: +u.speed || 30, dv: +u.dv || 0, fly: 0, swim: 0, climb: 0, res: [], sk: {fixed: [], any: +u.sk || 0, ch: null}, wp: [], tools: {fixed: [], ch: []}, lang: {fixed: [], any: 0}, feat: 0, tr}]};
}
function customBg(c) {
	const u = c.cust?.bg || {};
	return {id: CUSTOM, zh: u.name || "自訂背景", custom: 1, legacy: 1, ab: [...AB], feat: null, sk: [], skCh: {from: null, n: 2}, tool: {}, tools: [], toolCh: [], toolText: u.tool || "", lang: {fixed: [], any: 0}, eq: {A: [{gp: 5000}]}, feature: u.tx ? {zh: "背景特性", tx: [u.tx]} : null};
}
const spc = c => (c.sp === CUSTOM ? customSpecies(c) : D.species.find(x => x.id === c.sp));
const bgd = c => (c.bg === CUSTOM ? customBg(c) : D.backgrounds.find(x => x.id === c.bg));
const subOf = c => (c.level >= 3 ? cls(c).subs.find(s => s.id === c.sub) : null);
const pbOf = lv => Math.ceil(lv / 4) + 1;
const lineageOf = c => LINEAGE[c.sp]?.opts?.find(o => o.id === c.lin) || null;
// 舊版種族（劍灣冒險者指南）的亞種／變體
const legacyOf = c => (spc(c)?.legacy ? spc(c).opts.find(o => o.id === c.lin) || spc(c).opts[0] : null);
const srcTag = o => (o?.src ? `（${D.srcZh[o.src] || o.src}）` : "");
const canCast = c => !!(cls(c).sa || subOf(c)?.sa);
const hasMartial = c => cls(c).weapons.includes("martial") || c.order === "protector" || c.order === "warden";
// 子職業的自選法術（月之學院的德魯伊戲法、奧秘領域的法師戲法…）
const subChoices = c => (subOf(c)?.choose || []).map((ch, i) => ({...ch, id: i})).filter(ch => ch.lv <= c.level);

// ---- 專長欄位 ----
function featSlots(c) {
	const k = cls(c), b = bgd(c), L = c.level;
	const slots = [];
	if (b.feat) {
		const [bf, list] = b.feat.split(";").map(s => s.trim());
		slots.push({id: "bg", cat: ["O"], fixed: bf, list, src: `背景：${b.zh}`});
	} else slots.push({id: "bg", cat: ["O"], src: `背景：${b.zh}（自選起源專長）`});
	if (c.sp === "Human") slots.push({id: "hum", cat: ["O"], src: "人類：多才多藝"});
	if (legacyOf(c)?.feat) slots.push({id: "spf", cat: ["O"], src: `${spc(c).zh}：專長`});
	for (const fp of k.featProg) {
		for (const [lv, n] of Object.entries(fp.prog)) {
			if (+lv > L) continue;
			for (let i = 0; i < n; i++) {
				const cat = fp.cat;
				if (cat.includes("EB")) slots.push({id: `eb${lv}`, cat, lv: +lv, src: `${lv} 級：史詩恩賜`});
				else slots.push({id: `fs${lv}`, cat, lv: +lv, src: `${lv} 級：戰鬥風格`});
			}
		}
	}
	for (const f of k.f) if (f.en === "Ability Score Improvement" && f.lv <= L) slots.push({id: `asi${f.lv}`, cat: ["G"], lv: f.lv, src: `${f.lv} 級：屬性值提升`});
	slots.sort((a, b) => (a.lv || 0) - (b.lv || 0));
	return slots;
}
// 可選的專長：類別與等級相符，並滿足先決條件（另一個專長、施法能力、軍用武器熟練）
const featOptions = (slot, L, c) => Object.entries(D.feats).filter(([, f]) => f.cat.some(x => slot.cat.includes(x)) && (!f.lv || f.lv <= L)
	&& (!c || ((!f.preFeat || Object.entries(c.feats || {}).some(([id, x]) => id !== slot.id && f.preFeat.includes(x.k)))
		&& (!f.preCast || canCast(c)) && (!f.preMartial || hasMartial(c))
		&& (!f.preRace || f.preRace.some(r => spcName(c).includes(r)))
		&& (!f.preAb || f.preAb.some(([a, v]) => (abilityBase(c)[a] || 0) >= v))))).map(([k]) => k);
// 種族名稱（含英文，給專長的種族先決條件比對）
const spcName = c => { const s = spc(c); return `${s.id} ${legacyOf(c)?.id || ""} ${c.lin || ""}`.toLowerCase(); };

// ---- 自動補齊 ----
function fill(c) {
	// 資料移除的種族、背景（例如不再收錄的書）改回預設
	if (!spc(c)) { c.sp = "Human"; c.lin = null; }
	if (!bgd(c)) c.bg = "Soldier";
	const k = cls(c), s = spc(c), b = bgd(c), L = c.level;
	// 子職業
	if (!k.subs.some(x => x.id === c.sub)) c.sub = k.subs[0].id;
	const pri = abPri(c);
	const sub = subOf(c);
	if (sub?.variants && !sub.variants.some(v => v.en === c.subVar)) c.subVar = sub.variants[0].en;
	// 種族細項
	const lin = LINEAGE[c.sp];
	if (lin?.opts && !lin.opts.some(o => o.id === c.lin)) c.lin = lin.opts[0].id;
	if (s.legacy) { if (!s.opts.some(o => o.id === c.lin)) c.lin = s.opts[0].id; }
	else if (!lin?.opts) c.lin = null;
	const lg = legacyOf(c);
	const sizes = lg?.size || s.size;
	if (!sizes.includes(c.size)) c.size = sizes.includes("M") ? "M" : sizes[0];
	// 屬性值
	// 使用者沒動過屬性值時，依職業與子職業重新分配
	if (!c.base || !c.baseSet || c.method === "array" && !isArray(c.base)) c.base = assignArray(pri);
	if (!c.bgSet || !b.ab.includes(c.bgA) || !b.ab.includes(c.bgB) || c.bgA === c.bgB) {
		const o = byPri(b.ab, pri);
		c.bgA = o[0]; c.bgB = o[1];
	}
	// 舊版背景：+1／+1／+1 的三項屬性自選
	if (b.legacy) c.bg111 = fillPick(PIN(c, "bg111"), AB, 3, pri, [], EX(c, "bg111"));
	else delete c.bg111;
	// 專長
	c.feats ||= {};
	const slots = featSlots(c);
	for (const sl of slots) {
		const cur = c.feats[sl.id] ||= {};
		if (sl.fixed) cur.k = sl.fixed;
		const opts = sl.fixed ? [sl.fixed] : [...featOptions(sl, L, c), CUSTOM];
		if (!opts.includes(cur.k)) {
			cur.k = sl.cat.includes("EB") ? DEF_BOON(c.cls) : sl.cat.includes("G") ? "ability score improvement" : sl.cat.some(x => x.startsWith("FS")) ? DEF_FS(c.cls, c.eqA) : DEF_ORIGIN;
			cur.ab = null;
		}
	}
	// 依序套用屬性加值，同時補上專長屬性選擇
	const sc = abilityBase(c);
	for (const sl of slots) {
		const f = D.feats[c.feats[sl.id].k], cur = c.feats[sl.id];
		if (!f?.ab) { cur.ab = null; continue; }
		const cap = sl.cat.includes("EB") ? 30 : 20;
		const n = c.feats[sl.id].k === "ability score improvement" ? 2 : 1;
		const valid = cur.ab && cur.ab.length === n && cur.ab.every(a => f.ab.includes(a));
		if (!valid) {
			const pick = [];
			for (let i = 0; i < n; i++) {
				const a = byPri(f.ab, pri).find(x => sc[x] + pick.filter(y => y === x).length < cap) || byPri(f.ab, pri)[0];
				pick.push(a);
			}
			cur.ab = pick;
		}
		for (const a of cur.ab) sc[a] = Math.min(cap, sc[a] + 1);
	}
	for (const id of Object.keys(c.feats)) if (!slots.some(s => s.id === id)) delete c.feats[id];
	// 技能
	const fixed = new Set([...b.sk, ...(lg?.sk?.fixed || [])]);
	if (b.skCh) { c.bgSkill = fillPick(PIN(c, "bgSkill"), b.skCh.from || D.skills.map(x => x.id), b.skCh.n, SK_PRI[c.cls].concat(SK_ANY), [...fixed], EX(c, "bgSkill")); c.bgSkill.forEach(x => fixed.add(x)); }
	else c.bgSkill = [];
	const clsPool = k.skills.from || D.skills.map(x => x.id);
	const clsN = k.skills.n || k.skills.any;
	c.skills = fillPick(PIN(c, "skills"), clsPool, clsN, SK_PRI[c.cls].concat(SK_ANY), [...fixed], EX(c, "skills"));
	c.skills.forEach(x => fixed.add(x));
	const allSk = D.skills.map(x => x.id);
	if (c.sp === "Elf") { c.spSkill = fillPick(PIN(c, "spSkill"), ["insight", "perception", "survival"], 1, ["perception", "insight", "survival"], [...fixed], EX(c, "spSkill")); }
	else if (c.sp === "Human") { c.spSkill = fillPick(PIN(c, "spSkill"), allSk, 1, SK_PRI[c.cls].concat(SK_ANY), [...fixed], EX(c, "spSkill")); }
	else if (lg?.sk?.any) { c.spSkill = fillPick(PIN(c, "spSkill"), allSk, lg.sk.any, SK_PRI[c.cls].concat(SK_ANY), [...fixed], EX(c, "spSkill")); }
	else c.spSkill = [];
	c.spSkill.forEach(x => fixed.add(x));
	c.spSkill2 = lg?.sk?.ch ? fillPick(PIN(c, "spSkill2"), lg.sk.ch.from, lg.sk.ch.n, SK_PRI[c.cls].concat(SK_ANY), [...fixed], EX(c, "spSkill2")) : [];
	c.spSkill2.forEach(x => fixed.add(x));
	// 種族的抗性擇一、施法屬性自選
	if (lg?.resCh && !lg.resCh.includes(c.resPick)) c.resPick = lg.resCh[0];
	if (lg?.saCh && !lg.saCh.includes(c.linSa)) c.linSa = lg.saCh.includes(k.sa) ? k.sa : byPri(lg.saCh, pri)[0];
	for (const sl of slots) {
		const cur = c.feats[sl.id];
		if (cur.k === "skilled") { cur.sk = fillPick(PIN(c, `feats.${sl.id}.sk`), allSk, 3, SK_PRI[c.cls].concat(SK_ANY), [...fixed], EX(c, `feats.${sl.id}.sk`)); cur.sk.forEach(x => fixed.add(x)); } else delete cur.sk;
	}
	if (lin?.ab && !["int", "wis", "cha"].includes(c.linSa)) c.linSa = ["int", "wis", "cha"].includes(k.sa) ? k.sa : byPri(["int", "wis", "cha"], pri)[0];
	// 專精
	const prof = [...fixed];
	const exN = expertiseCount(c);
	const exPool = c.cls === "Wizard" ? prof.filter(x => ["arcana", "history", "investigation", "medicine", "nature", "religion"].includes(x)) : prof;
	c.expertise = exN ? fillPick(PIN(c, "expertise"), exPool, exN, SK_PRI[c.cls].concat(SK_ANY), [], EX(c, "expertise")) : [];
	// 職業選項
	if (c.cls === "Cleric" && !["protector", "thaumaturge"].includes(c.order)) c.order = "protector";
	if (c.cls === "Druid" && !["magician", "warden"].includes(c.order)) c.order = "magician";
	if (!["Cleric", "Druid"].includes(c.cls)) c.order = null;
	// 裝備
	if (!k.eq[c.eqA]) c.eqA = "A";
	if (!b.eq[c.eqB]) c.eqB = "A";
	// 工具選擇
	c.toolPick ||= {};
	for (const ch of toolChoices(c)) c.toolPick[ch.id] = fillPick(PIN(c, `toolPick.${ch.id}`), ch.pool, ch.n, ch.pool, [], EX(c, `toolPick.${ch.id}`));
	// 語言
	const langPool = D.languages.filter(l => l.std && l.id !== "Common").map(l => l.id);
	const fixedLang = fixedLangs(c);
	const nLang = 2 + (c.cls === "Ranger" && L >= 2 ? 2 : 0) + (lg?.lang.any || 0) + (b.lang?.any || 0);
	c.langs = fillPick(PIN(c, "langs"), langPool, nLang, [LANG_BY_SPECIES[c.sp], ...LANG_ANY], fixedLang, EX(c, "langs"));
	// 武器精通
	const mN = masteryCount(c);
	const weaps = inventory(c).filter(i => D.items[i.k]?.mastery && weaponProf(c, D.items[i.k])).map(i => i.k);
	const allW = Object.keys(D.items).filter(x => D.items[x].mastery && weaponProf(c, D.items[x]));
	c.mastery = mN ? fillPick(PIN(c, "mastery"), allW, mN, uniq(weaps), [], EX(c, "mastery")) : [];
	// 子職業與舊版種族的自選法術
	c.subPick = {};
	for (const ch of subChoices(c)) c.subPick[ch.id] = fillPick(PIN(c, `subPick.${ch.id}`), ch.pool, ch.n, [...(SP_PRI[c.cls]?.c || []), ...SP_PRI.Druid.c, ...SP_PRI.Wizard.c], [], EX(c, `subPick.${ch.id}`));
	// 法術
	const sp = spellInfo(c);
	if (sp) {
		c.cantrips = fillPick(PIN(c, "cantrips"), sp.poolC, sp.nC, SP_PRI[sp.list].c, sp.alwaysKeys, EX(c, "cantrips"));
		c.prepared = pickPrepared(PIN(c, "prepared"), sp, EX(c, "prepared"));
	} else { c.cantrips = []; c.prepared = []; }
	// 魔法學徒、舊版種族的自選戲法：避開已經有的法術
	const known = [...c.cantrips, ...c.prepared, ...(sp ? sp.alwaysKeys : [])];
	c.linPick = lg?.sp?.choose?.length ? fillPick(PIN(c, "linPick"), lg.sp.choose[0].pool, lg.sp.choose[0].n, SP_PRI.Wizard.c, known, EX(c, "linPick")) : [];
	known.push(...c.linPick);
	for (const sl of slots) {
		const cur = c.feats[sl.id];
		if (cur.k === "magic initiate") {
			const list = sl.list || (cur.list && ["cleric", "druid", "wizard"].includes(cur.list) ? cur.list : ({Cleric: "cleric", Druid: "druid", Paladin: "cleric", Ranger: "druid"}[c.cls] || "wizard"));
			cur.list = list;
			const L1 = list[0].toUpperCase() + list.slice(1);
			const pool0 = Object.keys(D.spells).filter(x => D.spells[x].l === 0 && D.spells[x].cls.includes(L1));
			const pool1 = Object.keys(D.spells).filter(x => D.spells[x].l === 1 && D.spells[x].cls.includes(L1));
			cur.can = fillPick(PIN(c, `feats.${sl.id}.can`), pool0, 2, SP_PRI[L1].c, known, EX(c, `feats.${sl.id}.can`));
			cur.s1 = fillPick(PIN(c, `feats.${sl.id}.s1`), pool1, 1, SP_PRI[L1].s, known, EX(c, `feats.${sl.id}.s1`));
			if (!["int", "wis", "cha"].includes(cur.sa)) cur.sa = ["int", "wis", "cha"].includes(k.sa) ? k.sa : byPri(["int", "wis", "cha"], pri)[0];
		} else { delete cur.can; delete cur.s1; delete cur.list; delete cur.sa; }
	}
	c.play ||= {};
	return c;
}

// 屬性優先順序；子職業會施法時（魔能騎士、詭術師）把施法屬性提前
function abPri(c) {
	const pri = AB_PRI[c.cls].slice();
	const sa = cls(c).subs.find(x => x.id === c.sub)?.sa;
	if (sa && !cls(c).sa) { pri.splice(pri.indexOf(sa), 1); pri.splice(2, 0, sa); }
	return pri;
}
const isArray = base => [...Object.values(base)].sort((a, b) => b - a).join() === STD_ARRAY.join();
const assignArray = pri => Object.fromEntries(pri.map((a, i) => [a, STD_ARRAY[i]]));
function abilityBase(c) {
	const sc = {...c.base};
	if (c.bgMode === "111") for (const a of (bgd(c).legacy ? c.bg111 : bgd(c).ab)) sc[a] += 1;
	else { sc[c.bgA] += 2; sc[c.bgB] += 1; }
	for (const a of AB) sc[a] = Math.min(20, sc[a]);
	return sc;
}
function abilities(c) {
	const sc = abilityBase(c);
	for (const sl of featSlots(c)) {
		const cur = c.feats[sl.id];
		if (!cur?.ab) continue;
		const cap = sl.cat.includes("EB") ? 30 : 20;
		for (const a of cur.ab) sc[a] = Math.min(cap, sc[a] + 1);
	}
	// 20 級的屬性上限提升
	if (c.cls === "Barbarian" && c.level >= 20) { sc.str = Math.min(25, sc.str + 4); sc.con = Math.min(25, sc.con + 4); }
	if (c.cls === "Monk" && c.level >= 20) { sc.dex = Math.min(25, sc.dex + 4); sc.wis = Math.min(25, sc.wis + 4); }
	return sc;
}

function expertiseCount(c) {
	const L = c.level;
	switch (c.cls) {
		case "Rogue": return (L >= 1 ? 2 : 0) + (L >= 6 ? 2 : 0);
		case "Bard": return (L >= 2 ? 2 : 0) + (L >= 9 ? 2 : 0);
		case "Ranger": return (L >= 2 ? 1 : 0) + (L >= 9 ? 2 : 0);
		case "Wizard": return L >= 2 ? 1 : 0;
		default: return 0;
	}
}
function tableVal(c, label) {
	const k = cls(c);
	const i = k.table.cols.indexOf(label);
	return i < 0 ? null : k.table.rows[c.level - 1][i];
}
const masteryCount = c => +(tableVal(c, "武器精通") || (["Paladin", "Ranger"].includes(c.cls) ? 2 : c.cls === "Rogue" ? 2 : 0));

function toolChoices(c) {
	const out = [];
	const b = bgd(c), k = cls(c);
	const catPool = from => from.flatMap(t => (D.tools[t] ? D.tools[t].filter(x => !/^(artisan's tools|musical instrument|gaming set)$/.test(x)) : [t]));
	for (const [i, ch] of (legacyOf(c)?.tools.ch || []).entries()) out.push({id: `sp${i}`, label: "種族工具", pool: catPool(ch.from), n: ch.n});
	if (!["Bard", "Monk"].includes(c.cls)) for (const [i, ch] of (k.toolAny || []).entries()) out.push({id: `cls${i}`, label: "職業工具", pool: catPool([ch.from]), n: ch.n});
	if (b.tool.choose) {
		const t = {anyArtisansTool: "toolArtisan", anyMusicalInstrument: "instrumentMusical", anyGamingSet: "setGaming"}[b.tool.choose];
		out.push({id: "bg", label: "背景工具", pool: D.tools[t].filter(x => !/^(artisan's tools|musical instrument|gaming set)$/.test(x)), n: 1});
	}
	for (const [i, ch] of (b.toolCh || []).entries()) {
		const pool = ch.from.flatMap(t => (D.tools[t] ? D.tools[t].filter(x => !/^(artisan's tools|musical instrument|gaming set)$/.test(x)) : [t]));
		out.push({id: `bg${i}`, label: "背景工具", pool, n: ch.n});
	}
	if (c.cls === "Bard") out.push({id: "cls", label: "樂器熟練", pool: D.tools.instrumentMusical.filter(x => x !== "musical instrument"), n: 3});
	if (c.cls === "Monk") out.push({id: "cls", label: "工具或樂器", pool: [...D.tools.toolArtisan, ...D.tools.instrumentMusical].filter(x => !/^(artisan's tools|musical instrument)$/.test(x)), n: 1});
	for (const lst of [k.eq[c.eqA], b.eq[c.eqB]]) for (const e of lst) if (e.choose) out.push({id: `eq:${e.choose}`, label: "起始裝備", pool: D.tools[e.choose].filter(x => !/^(artisan's tools|musical instrument|gaming set)$/.test(x)), n: 1});
	return out;
}

function inventory(c) {
	const k = cls(c), b = bgd(c);
	const out = [];
	let cp = 0;
	for (const lst of [k.eq[c.eqA], b.eq[c.eqB]]) {
		for (const e of lst) {
			if (e.gp != null) cp += e.gp;
			else if (e.special) out.push({n: e.special, q: 1});
			else if (e.choose) out.push({k: (c.toolPick?.[`eq:${e.choose}`] || [])[0], q: 1});
			else out.push({k: e.k, q: e.q, n: e.n});
		}
	}
	// 合併相同物品
	const m = new Map();
	for (const i of out) {
		const id = i.k || i.n;
		if (!id) continue;
		if (m.has(id)) m.get(id).q += i.q; else m.set(id, {...i});
	}
	const res = [...m.values()];
	res.cp = cp;
	return res;
}

// 背景與舊版種族給的固定語言
function fixedLangs(c) {
	return uniq([...(legacyOf(c)?.lang.fixed || []), ...(bgd(c).lang?.fixed || [])]).filter(l => l !== "Common");
}
function weaponProf(c, it) {
	const k = cls(c);
	if (legacyOf(c)?.wp.includes(it.en.toLowerCase())) return true;
	if (k.weapons.includes("martial") || c.order === "protector" || c.order === "warden") return true;
	if (it.w === "S") return k.weapons.includes("simple");
	const w = k.weapons.join(" ");
	if (/Finesse or Light/.test(w)) return it.p.includes("F") || it.p.includes("L");
	if (/Light/.test(w)) return it.p.includes("L");
	return false;
}
function armorProf(c) {
	const a = new Set(cls(c).armor);
	if (c.order === "protector") a.add("heavy");
	if (c.order === "warden") a.add("medium");
	return a;
}

// ---- 法術 ----
function spellInfo(c) {
	const k = cls(c), sub = subOf(c), L = c.level;
	let src = null;
	if (k.sa) src = {sa: k.sa, can: k.cantrips, prep: k.prep, slots: k.slots, list: c.cls};
	else if (sub?.sa) src = {sa: sub.sa, can: sub.cantrips, prep: sub.prep, slots: sub.slots, list: "Wizard"};
	if (!src) return null;
	let slots = src.slots ? src.slots[L - 1].slice() : [];
	let pact = null;
	if (c.cls === "Warlock") {
		const n = +tableVal(c, "法術欄位"), lv = parseInt(tableVal(c, "欄位環階"));
		pact = {n, lv};
		slots = Array(9).fill(0); slots[lv - 1] = n;
	}
	const maxLv = slots.reduce((m, n, i) => (n ? i + 1 : m), 0);
	let nC = src.can ? src.can[L - 1] : 0;
	if (c.order === "thaumaturge" || c.order === "magician") nC += 1;
	const nP = src.prep[L - 1];
	// 常備法術
	const always = [];
	const addAlways = (obj, tag) => { for (const [lv, arr] of Object.entries(obj || {})) if (+lv <= L) for (const s of arr) if (D.spells[s]) always.push({k: s, tag}); };
	addAlways(k.always, "職業");
	if (sub) {
		const v = sub.variants?.find(x => x.en === c.subVar);
		addAlways(v ? v.always : sub.always, sub.zh);
		for (const kn of sub.known || []) if (kn.lv <= L && D.spells[kn.k]) always.push({k: kn.k, tag: sub.zh});
		for (const ch of subChoices(c)) for (const x of c.subPick?.[ch.id] || []) always.push({k: x, tag: sub.zh});
	}
	const alwaysKeys = always.map(a => a.k);
	const poolC = Object.keys(D.spells).filter(x => D.spells[x].l === 0 && D.spells[x].cls.includes(src.list));
	const poolS = Object.keys(D.spells).filter(x => { const s = D.spells[x]; return s.l >= 1 && s.l <= maxLv && s.cls.includes(src.list); });
	return {sa: src.sa, slots, pact, maxLv, nC, nP, poolC, poolS, always, alwaysKeys, list: src.list};
}
function pickPrepared(cur, sp, skip = []) {
	const pri = SP_PRI[sp.list].s;
	const ok = uniq((cur || []).filter(x => sp.poolS.includes(x) && !sp.alwaysKeys.includes(x))).slice(0, sp.nP);
	if (ok.length >= sp.nP) return ok;
	// 依法術位數量分配各環的名額，讓高環也有法術可用
	const levels = [];
	for (let i = 1; i <= sp.maxLv; i++) levels.push({lv: i, w: sp.pact ? 1 : sp.slots[i - 1] || 0});
	const need = sp.nP - ok.length;
	const tw = levels.reduce((a, b) => a + b.w, 0) || 1;
	const quota = {};
	let given = 0;
	for (const l of levels) { quota[l.lv] = Math.floor(need * l.w / tw); given += quota[l.lv]; }
	for (let i = 0; given < need; i = (i + 1) % levels.length) { quota[levels[i].lv]++; given++; }
	const out = ok.slice();
	const ordered = byPri(sp.poolS, pri);
	for (const l of levels) {
		let q = quota[l.lv] - out.filter(x => D.spells[x].l === l.lv).length;
		for (const x of ordered) { if (q <= 0) break; if (D.spells[x].l === l.lv && !out.includes(x) && !sp.alwaysKeys.includes(x) && !skip.includes(x)) { out.push(x); q--; } }
	}
	for (const x of ordered) { if (out.length >= sp.nP) break; if (!out.includes(x) && !sp.alwaysKeys.includes(x) && !skip.includes(x)) out.push(x); }
	return out;
}

// ---- 推導出角色紙的所有數值 ----
function derive(c) {
	const k = cls(c), s = spc(c), b = bgd(c), sub = subOf(c), L = c.level, lin = lineageOf(c), lg = legacyOf(c);
	const sc = abilities(c), m = Object.fromEntries(AB.map(a => [a, mod(sc[a])]));
	const pb = pbOf(L);
	const featKeys = Object.values(c.feats).map(f => f.k);
	const has = f => featKeys.includes(f);
	const jack = c.cls === "Bard" && L >= 2;
	// 豁免
	const saveProf = new Set(k.saves);
	if (c.cls === "Monk" && L >= 14) AB.forEach(a => saveProf.add(a));
	for (const sl of featSlots(c)) if (c.feats[sl.id]?.k === "resilient") saveProf.add(c.feats[sl.id].ab?.[0]);
	const saves = Object.fromEntries(AB.map(a => [a, {p: saveProf.has(a), v: m[a] + (saveProf.has(a) ? pb : 0)}]));
	// 技能
	const prof = new Set([...b.sk, ...(c.bgSkill || []), ...(lg?.sk?.fixed || []), ...c.skills, ...c.spSkill, ...(c.spSkill2 || []), ...Object.values(c.feats).flatMap(f => f.sk || [])]);
	const exp = new Set(c.expertise);
	const skills = D.skills.map(x => {
		let v = m[x.ab];
		const p = prof.has(x.id), e = exp.has(x.id);
		if (e) v += pb * 2; else if (p) v += pb; else if (jack) v += Math.floor(pb / 2);
		if (c.order === "thaumaturge" && (x.id === "arcana" || x.id === "religion")) v += Math.max(1, m.wis);
		return {...x, p, e, v};
	});
	const sk = id => skills.find(x => x.id === id);
	// 生命值
	let hp = k.hd + m.con + (L - 1) * (k.hd / 2 + 1 + m.con);
	hp = Math.max(hp, L);
	if (c.sp === "Dwarf") hp += L;
	if (has("tough")) hp += 2 * L;
	if (has("boon of fortitude")) hp += 40;
	if (c.cls === "Sorcerer" && c.sub === "Draconic" && L >= 3) hp += L;
	// 護甲等級
	const inv = inventory(c);
	const items = inv.map(i => ({...i, it: i.k ? D.items[i.k] : null}));
	const armors = items.filter(i => i.it && ["LA", "MA", "HA"].includes(i.it.t));
	const shield = items.some(i => i.it?.t === "S") && armorProf(c).has("shield");
	const aprof = armorProf(c);
	const opts = [];
	const unarm = 10 + m.dex + (lg?.ac?.bonus || 0);
	opts.push({ac: unarm + (shield ? 2 : 0), note: "無甲"});
	if (c.cls === "Barbarian") opts.push({ac: unarm + m.con + (shield ? 2 : 0), note: "無甲防禦（體質）"});
	if (c.cls === "Monk") opts.push({ac: unarm + m.wis, note: "無甲防禦（感知）", noShield: true});
	if (c.cls === "Sorcerer" && c.sub === "Draconic" && L >= 3) opts.push({ac: unarm + m.cha + (shield ? 2 : 0), note: "龍族韌性"});
	// 天生護甲（龜人、蜥蜴人、象族…）
	const nat = lg?.ac;
	if (nat?.base) opts.push({ac: nat.base + (nat.dex ? m.dex : 0) + (nat.con ? m.con : 0) + (shield ? 2 : 0), note: "天生護甲"});
	for (const a of armors) {
		const t = a.it.t, cap = t === "LA" ? 99 : t === "MA" ? 2 : 0;
		const okProf = aprof.has({LA: "light", MA: "medium", HA: "heavy"}[t]);
		if (!okProf) continue;
		let ac = a.it.ac + Math.min(m.dex, cap) + (shield ? 2 : 0) + (nat?.bonus || 0);
		if (has("defense")) ac += 1;
		opts.push({ac, note: a.it.zh, armor: a.k});
	}
	const best = opts.sort((x, y) => y.ac - x.ac)[0];
	// 速度
	let speed = lg?.speed || lin?.speed || s.speed;
	if (c.cls === "Monk") speed += parseInt(tableVal(c, "無甲移動")) || 0;
	if (c.cls === "Barbarian" && L >= 5 && !(best.armor && D.items[best.armor].t === "HA")) speed += 10;
	if (has("boon of speed")) speed += 30;
	if (has("speedy")) speed += 10;
	const init = m.dex + (has("alert") ? pb : 0) + (jack ? Math.floor(pb / 2) : 0);
	// 攻擊
	const attacks = [];
	const masteries = new Set(c.mastery);
	const seen = new Set();
	for (const i of items) {
		const w = i.it;
		if (!w?.dmg || seen.has(i.k)) continue;
		seen.add(i.k);
		const ranged = w.t === "R";
		const fin = w.p.includes("F") || (c.cls === "Monk" && (w.w === "S" || w.p.includes("L")) && !ranged);
		const a = ranged ? m.dex : fin ? Math.max(m.str, m.dex) : m.str;
		const p = weaponProf(c, w);
		let hit = a + (p ? pb : 0) + (ranged && has("archery") ? 2 : 0);
		let dmgB = a + (!ranged && has("dueling") && !w.p.includes("2H") ? 2 : 0);
		if (w.p.includes("T") && !ranged && has("thrown weapon fighting")) { /* 投擲時 +2，於備註 */ }
		let die = w.dmg;
		if (c.cls === "Monk" && (w.w === "S" || w.p.includes("L")) && !ranged) die = maxDie(die, tableVal(c, "武藝"));
		const notes = [w.p.map(x => D.propZh[x]).filter(Boolean).join("、")];
		if (w.range) notes.push(`射程 ${w.range}`);
		if (w.dmg2) notes.push(`雙手 ${w.dmg2}`);
		if (masteries.has(i.k)) notes.push(`精通：${D.masteryZh[w.mastery]}`);
		attacks.push({name: w.zh, tip: `item:${i.k}`, hit: sgn(hit), dmg: `${die}${dmgB ? sgn(dmgB) : ""} ${DMG_ZH[w.dt] || ""}`, note: notes.filter(Boolean).join("；")});
	}
	if (c.cls === "Monk" || has("tavern brawler") || has("unarmed fighting")) {
		const a = c.cls === "Monk" ? Math.max(m.str, m.dex) : m.str;
		const die = c.cls === "Monk" ? tableVal(c, "武藝") : has("unarmed fighting") ? "1d6" : has("tavern brawler") ? "1d4" : "1";
		attacks.push({name: "徒手打擊", hit: sgn(a + pb), dmg: `${die}${sgn(a)} 鈍擊`, note: c.cls === "Monk" ? "武藝" : ""});
	}
	if (c.sp === "Dragonborn") {
		const d = L >= 17 ? 4 : L >= 11 ? 3 : L >= 5 ? 2 : 1;
		attacks.push({name: "吐息武器", hit: `DC ${8 + m.con + pb}`, dmg: `${d}d10 ${DMG_ZH[lin?.dmg] || ""}`, note: `敏捷豁免；15 呎錐形或 30 呎線形；${pb} 次／長休`});
	}
	// 法術
	const sp = spellInfo(c);
	const spellRows = [];
	const extraSpells = [];
	if (lg?.sp) {
		const lsa = lg.sa || (lg.saCh ? c.linSa : null) || "cha";
		for (const x of lg.sp.known) if (x.lv <= L) extraSpells.push({k: x.k, tag: s.zh, sa: lsa});
		for (const x of lg.sp.innate) if (x.lv <= L) extraSpells.push({k: x.k, tag: s.zh, sa: lsa, note: D.spells[x.k]?.l ? "1 次／長休" : ""});
		for (const x of c.linPick || []) extraSpells.push({k: x, tag: s.zh, sa: lg.sa || (lg.saCh ? c.linSa : null) || "int"});
	}
	// 不會施法的子職業（旗手、三神後裔）給的法術
	if (sub && !spellInfo(c)) {
		for (const kn of sub.known || []) if (kn.lv <= L) extraSpells.push({k: kn.k, tag: sub.zh, sa: sub.knownSa || "int"});
		for (const ch of subChoices(c)) for (const x of c.subPick?.[ch.id] || []) extraSpells.push({k: x, tag: sub.zh, sa: sub.knownSa || "int"});
	}
	if (lin?.sp || LINEAGE[c.sp]?.sp) {
		const src = lin?.sp || LINEAGE[c.sp].sp;
		for (const [lv, arr] of Object.entries(src)) if (+lv <= L) for (const x of arr) extraSpells.push({k: x, tag: s.zh, sa: c.linSa || "cha", note: D.spells[x]?.l ? "1 次／長休" : ""});
	}
	for (const sl of featSlots(c)) {
		const f = c.feats[sl.id];
		if (f?.k !== "magic initiate") continue;
		for (const x of f.can) extraSpells.push({k: x, tag: "魔法學徒", sa: f.sa});
		for (const x of f.s1) extraSpells.push({k: x, tag: "魔法學徒", sa: f.sa, note: "1 次／長休"});
	}
	const spAb = sp ? sp.sa : null;
	const spell = sp ? {ab: spAb, mod: m[spAb], dc: 8 + pb + m[spAb], atk: pb + m[spAb]} : null;
	const addRow = (key, tag, extra = {}) => {
		const d = D.spells[key];
		if (!d || spellRows.some(r => r.k === key)) return;
		spellRows.push({k: key, d, tag, ...extra});
	};
	if (sp) {
		c.cantrips.forEach(x => addRow(x, ""));
		sp.always.forEach(a => addRow(a.k, `常備（${a.tag}）`));
		c.prepared.forEach(x => addRow(x, ""));
	}
	for (const e of extraSpells) addRow(e.k, e.tag, {sa: e.sa, note: e.note});
	spellRows.sort((a, b) => a.d.l - b.d.l || a.d.zh.localeCompare(b.d.zh, "zh-Hant"));
	// 戲法攻擊加入攻擊欄
	for (const r of spellRows) {
		if (r.d.l !== 0 || !(r.d.atk || r.d.save) || !r.d.di) continue;
		const ab = r.sa || spAb;
		const sm = m[ab] ?? 0;
		let dmg = r.d.scale ? Object.entries(r.d.scale).filter(([lv]) => +lv <= L).pop()?.[1] : "";
		let note = `${r.d.range}${r.d.save ? `；${ABZH[r.d.save]}豁免` : ""}`;
		if (r.k === "eldritch blast") { dmg = "1d10"; note += `；光束 ×${L >= 17 ? 4 : L >= 11 ? 3 : L >= 5 ? 2 : 1}`; }
		attacks.push({name: r.d.zh, tip: `spell:${r.k}`, hit: r.d.atk ? sgn(pb + sm) : `DC ${8 + pb + sm}`, dmg: `${dmg || ""} ${r.d.di.map(x => DMG_ZH[x]).join("／")}`.trim(), note});
	}
	// 職業能力
	const feats = [];
	const skipF = new Set(["Ability Score Improvement", "Epic Boon", "Subclass Feature"]);
	for (const f of k.f) {
		if (f.lv > L || skipF.has(f.en) || f.sub) continue;
		feats.push({lv: f.lv, zh: f.zh, tx: f.tx});
	}
	if (sub) for (const f of sub.f) if (f.lv <= L && f.zh !== sub.zh && f.en !== sub.en) feats.push({lv: f.lv, zh: f.zh, tx: f.tx, sub: true});
	feats.sort((a, b) => a.lv - b.lv);
	const res = k.table.cols.map((col, i) => ({col, v: k.table.rows[L - 1][i]})).filter(r => !/^(武器精通)$/.test(r.col) || true);
	// 熟練
	const armorZh = {light: "輕甲", medium: "中甲", heavy: "重甲", shield: "盾牌"};
	const wp = k.weapons.map(w => w === "simple" ? "簡易武器" : w === "martial" ? "軍用武器" : /Finesse or Light/.test(w) ? "具靈巧或輕型屬性的軍用武器" : /Light/.test(w) ? "具輕型屬性的軍用武器" : w);
	if ((c.order === "protector" || c.order === "warden") && !wp.includes("軍用武器")) wp.push("軍用武器");
	const toolKeys = [...(b.tools || []), ...(k.toolFix || []), ...(lg?.tools.fixed || [])];
	if (b.tool.k) toolKeys.push(b.tool.k);
	for (const [id, v] of Object.entries(c.toolPick)) if (/^(bg|sp|cls)\d+$|^bg$/.test(id)) toolKeys.push(...v);
	if (c.toolPick.cls) toolKeys.push(...c.toolPick.cls);
	const tools = uniq(toolKeys).map(x => D.items[x]?.zh || x);
	if (b.toolText) tools.push(b.toolText);
	const langs = ["Common", ...fixedLangs(c), ...c.langs];
	if (c.cls === "Druid") langs.push("Druidic");
	if (c.cls === "Rogue") langs.push("Thieves' Cant");
	const langZh = langs.map(l => D.languages.find(x => x.id === l)?.zh || l);
	// 種族特性
	const traits = (lg ? lg.tr : s.tr).map(t => ({zh: t.zh, tx: t.tx}));
	if (b.feature) traits.push({zh: b.feature.zh, tx: b.feature.tx, bg: true});
	const linLabel = lg ? (lg.zh ? `亞種與變體：${lg.zh}` : null) : LINEAGE[c.sp]?.opts ? `${LINEAGE[c.sp].label}：${lin.zh}` : null;
	const resist = uniq([...(lg ? lg.res : s.res), lg?.resCh ? c.resPick : null, lin?.res, lin?.dmg].filter(Boolean)).map(x => DMG_ZH[x] || x);
	const speedNote = [lg?.fly && `飛行 ${lg.fly} 呎`, lg?.swim && `游泳 ${lg.swim} 呎`, lg?.climb && `攀爬 ${lg.climb} 呎`].filter(Boolean).join("、");
	const featList = featSlots(c).map(sl => {
		const f = c.feats[sl.id], fd = D.feats[f.k];
		let note = "";
		if (f.ab) note = f.ab.reduce((acc, a) => { acc[a] = (acc[a] || 0) + 1; return acc; }, {});
		if (note) note = Object.entries(note).map(([a, n]) => `${ABZH[a]} +${n}`).join("、");
		if (f.sk) note = f.sk.map(x => sk(x).zh).join("、");
		if (fd?.src) note = [note, D.srcZh[fd.src]].filter(Boolean).join("；");
		if (f.k === "magic initiate") note = `${{cleric: "牧師", druid: "德魯伊", wizard: "法師"}[f.list]}，${ABZH[f.sa]}`;
		if (f.k === CUSTOM) return {zh: f.name || "自訂專長", k: f.k, src: sl.src, note: "", tx: f.tx ? [f.tx] : []};
		return {zh: fd?.zh || f.k, k: f.k, src: sl.src, note, tx: fd?.tx || []};
	});
	// 錢幣
	const cp = inv.cp;
	const coins = {gp: Math.floor(cp / 100), sp: Math.floor((cp % 100) / 10), cp: cp % 10};
	return {
		sc, m, pb, saves, skills, hp, ac: best, acOpts: opts, shield, speed, init, size: SIZE_ZH[c.size],
		passive: 10 + sk("perception").v, attacks, spell, sp, spellRows, feats, res, wp,
		armor: [...aprof], armorZh, tools, langZh, traits, linLabel, resist, featList, items, coins,
		dv: lg ? lg.dv : lin?.dv || s.dv, hd: k.hd, speedNote,
	};
}
function maxDie(a, b) {
	if (!b) return a;
	const f = x => +String(x).split("d")[1] || 0;
	return f(b) > f(a) ? b : a;
}
