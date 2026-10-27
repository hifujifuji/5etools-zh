// 從 dist/data 抽出 2024 核心規則（XPHB）資料，產生自動角色卡用的 data.json
//   node sheet/build.mjs   需先執行 node scripts/build.mjs
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(HERE, "..", "dist", "data");
const OUT = path.join(HERE, "public");
const rd = f => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const SRC = "XPHB";
const isX = o => o.source === SRC;
const key = s => s.toLowerCase().split("|")[0].replace(/#c$/, "");

// ---- 文字轉換：去掉 5etools 標籤，條目轉成純文字段落 ----
const stripTags = s => {
	let prev;
	do {
		prev = s;
		s = s.replace(/\{@(\w+)\s([^{}]*)\}/g, (_, tag, body) => {
			const p = body.split("|");
			if (["damage", "dice", "hit", "d20", "scaledamage", "scaledice", "chance", "recharge"].includes(tag)) {
				if (tag === "scaledamage" || tag === "scaledice") return p[2] || p[0];
				if (tag === "hit") return `+${p[0]}`;
				if (tag === "recharge") return `（充能 ${p[0] || 6}）`;
				return p[p.length > 2 ? 2 : 0] || p[0];
			}
			if (tag === "filter") return p[0];
			if (tag === "book" || tag === "adventure") return p[0];
			return p.length >= 3 && p[2] ? p[2] : p[0];
		});
	} while (s !== prev);
	return s;
};
const toText = (ents, out = []) => {
	for (const e of ents || []) {
		if (typeof e === "string") { out.push(stripTags(e)); continue; }
		if (!e || typeof e !== "object") continue;
		const nm = e.name_zh || e.name;
		switch (e.type) {
			case "list":
				for (const it of e.items || []) {
					if (typeof it === "string") out.push(`• ${stripTags(it)}`);
					else {
						const sub = toText(it.entries || (it.entry ? [it.entry] : []), []);
						const n = it.name_zh || it.name;
						out.push(`• ${n ? `${stripTags(n)} ` : ""}${sub.join(" ")}`);
					}
				}
				break;
			case "table": {
				if (e.caption) out.push(`【${stripTags(e.caption)}】`);
				if (e.colLabels) out.push(e.colLabels.map(c => stripTags(String(c))).join("｜"));
				for (const r of e.rows || []) out.push(r.map(c => typeof c === "object" ? toText([c]).join(" ") || (c.roll ? `${c.roll.min ?? c.roll.exact}–${c.roll.max ?? ""}` : "") : stripTags(String(c))).join("｜"));
				break;
			}
			case "refClassFeature": case "refSubclassFeature": case "refOptionalfeature": break;
			case "inset": case "insetReadaloud": case "quote": break;
			default: {
				const sub = toText(e.entries || (e.entry ? [e.entry] : []), []);
				if (nm && sub.length) { sub[0] = `【${stripTags(nm)}】${sub[0]}`; }
				out.push(...sub);
			}
		}
	}
	return out;
};
const cell = c => typeof c === "object" && c ? (c.type === "bonus" ? `+${c.value}` : c.type === "dice" ? (c.toRoll || []).map(t => `${t.number}d${t.faces}`).join("+") : c.type === "bonusSpeed" ? `+${c.value} 呎` : toText([c]).join(" ")) : stripTags(String(c ?? ""));

// ---- 物品 ----
const ib = rd("items-base.json");
const itemsJson = rd("items.json");
const items = {};
const typeOf = t => (t || "").split("|")[0];
const propZh = {}, masteryZh = {}, masteryText = {};
for (const p of ib.itemProperty.filter(isX)) propZh[p.abbreviation] = p.entries?.[0]?.name_zh || p.abbreviation;
for (const m of ib.itemMastery.filter(isX)) { masteryZh[m.name] = m.name_zh || m.name; masteryText[m.name] = toText(m.entries).join(" "); }
const addItem = it => {
	const o = {zh: it.name_zh || it.name, en: it.name, t: typeOf(it.type)};
	if (it.ac != null) o.ac = it.ac;
	if (it.strength) o.str = +it.strength;
	if (it.stealth) o.stealth = 1;
	if (it.weapon) {
		o.w = it.weaponCategory === "martial" ? "M" : "S";
		o.dmg = it.dmg1; o.dt = it.dmgType;
		if (it.dmg2) o.dmg2 = it.dmg2;
		o.p = (it.property || []).map(p => (typeof p === "string" ? p : p.uid || "").split("|")[0]);
		if (it.range) o.range = it.range;
		if (it.mastery) o.mastery = it.mastery[0].split("|")[0];
	}
	if (it.value) o.v = it.value;
	if (it.weight) o.wt = it.weight;
	if (it.packContents) o.pack = it.packContents.map(p => typeof p === "string" ? {k: key(p), q: 1} : p.item ? {k: key(p.item), q: p.quantity || 1} : null).filter(Boolean);
	items[key(it.name)] = o;
};
ib.baseitem.filter(isX).forEach(addItem);
itemsJson.item.filter(isX).forEach(addItem);
for (const g of itemsJson.itemGroup?.filter(isX) || []) if (!items[key(g.name)]) addItem(g);

const eqList = arr => arr.map(e => {
	if (typeof e === "string") return {k: key(e), q: 1};
	if (e.item) return {k: key(e.item), q: e.quantity || 1, ...(/^Book/.test(e.displayName || "") ? {n: e.displayName} : {})};
	if (e.value != null) return {gp: e.value};
	if (e.special) return {special: e.special === "Spellbook" ? "法術書" : e.special};
	if (e.equipmentType) return {choose: e.equipmentType};
	return null;
}).filter(Boolean);

// ---- 法術 ----
const lookupAll = rd("generated/gendata-spell-source-lookup.json");
const spells = {};
// 所有正式書籍的法術（略過已被重印、UA 與 Plane Shift）；職業法術表依 2024 版職業與艾伯倫奇械師
const isUA = s => /^(UA|XUA|PS[A-Z])/.test(s || "");
// 非被遺忘的國度世界觀的書不收錄（奇械師與機關人例外）
const OFF_CFG = JSON.parse(fs.readFileSync(path.join(HERE, "../scripts/off-settings.json"), "utf8"));
const OFF = new Set(OFF_CFG.sources);
const offKeep = (kind, name, src) => OFF_CFG.keep.includes(`${kind}|${name}|${src}`);
for (const file of fs.readdirSync(path.join(DATA, "spells")).filter(f => /^spells-.*\.json$/.test(f))) for (const s of rd(`spells/${file}`).spell) {
	if (s.reprintedAs || isUA(s.source)) continue;
	const k = key(s.name);
	if (spells[k] && s.source !== SRC) continue;
	const lk = s.source.toLowerCase();
	const cl = lookupAll[lk]?.[k]?.class || {};
	const classes = [...Object.keys(cl.XPHB || {}), ...Object.keys(cl.EFA || {})];
	const t = s.time?.[0];
	const r = s.range;
	let range = "";
	if (r.type === "point") range = r.distance.type === "self" ? "自身" : r.distance.type === "touch" ? "觸碰" : r.distance.type === "sight" ? "視線" : r.distance.type === "unlimited" ? "無限" : `${r.distance.amount} ${r.distance.type === "miles" ? "哩" : "呎"}`;
	else if (r.type === "special") range = "特殊";
	else range = `自身（${r.distance?.amount ?? ""} 呎${{cone: "錐形", line: "線形", radius: "半徑", sphere: "球形", cube: "立方", emanation: "散發", hemisphere: "半球"}[r.type] || ""}）`;
	const unit = {action: "動作", bonus: "附贈動作", reaction: "反應", minute: "分鐘", hour: "小時"}[t?.unit] || t?.unit;
	const time = t ? (["action", "bonus", "reaction"].includes(t.unit) ? (t.number > 1 ? `${t.number} ${unit}` : unit) : `${t.number} ${unit}`) : "";
	const d = s.duration?.[0] || {};
	const dur = d.type === "instant" ? "立即" : d.type === "permanent" ? "永久" : d.type === "special" ? "特殊" : d.duration ? `${d.concentration ? "專注，" : ""}${d.duration.amount} ${{round: "輪", minute: "分鐘", hour: "小時", day: "天"}[d.duration.type] || d.duration.type}` : "";
	const text = toText(s.entries);
	if (s.entriesHigherLevel) text.push(...toText(s.entriesHigherLevel));
	if (OFF.has(s.source) && !(s.source === "EFA" && classes.includes("Artificer"))) continue;
	const o = {zh: s.name_zh || s.name, en: s.name, l: s.level, sc: s.school, time, range, dur, cls: classes, tx: text};
	if (d.concentration) o.c = 1;
	if (s.meta?.ritual) o.r = 1;
	if (s.components?.m) {
		o.m = 1;
		const m = s.components.m;
		const mt = stripTags(typeof m === "object" ? m.text || "" : m === true ? "" : String(m));
		if (mt) o.mt = mt;
	}
	const comp = [s.components?.v && "V", s.components?.s && "S", s.components?.m && "M"].filter(Boolean).join("、");
	o.comp = comp;
	if (s.spellAttack) o.atk = s.spellAttack[0];
	if (s.savingThrow) o.save = s.savingThrow[0].slice(0, 3);
	if (s.damageInflict) o.di = s.damageInflict;
	if (s.scalingLevelDice) {
		const sd = Array.isArray(s.scalingLevelDice) ? s.scalingLevelDice[0] : s.scalingLevelDice;
		o.scale = sd.scaling;
	}
	if (s.time?.[0]?.condition) o.cond = 1;
	if (s.source !== SRC) o.src = s.source;
	spells[k] = o;
}

const ANY_TOOL = {anyArtisansTool: "toolArtisan", "musical instrument": "instrumentMusical", anyMusicalInstrument: "instrumentMusical", "gaming set": "setGaming", anyGamingSet: "setGaming"};
// ---- 來源 ----
// 5etools 種族、背景、專長頁預設列出的條目（defaults.json）；同名時 2024 玩家手冊優先，其次是較新的書
const DEF = JSON.parse(fs.readFileSync(path.join(HERE, "defaults.json"), "utf8"));
const inDef = (list, name, src) => (!OFF.has(src) || offKeep({races: "race", backgrounds: "background", feats: "feat"}[list], name, src)) && DEF[list].includes(`${name}_${src}`.toLowerCase());
const srcDate = {}, srcZh = {};
const uiDict = JSON.parse(fs.readFileSync(path.join(HERE, "..", "i18n", "ui.json"), "utf8")).dict || {};
const ZH_FIX = {EFA: "艾伯倫：奇械師熔爐", LFL: "洛溫：初光", AAG: "星界冒險者指南", SatO: "印記城與外域", LLK: "柯瓦利許的失落實驗室", "AitFR-AVT": "被遺忘的國度冒險：翠綠之墓", FRHoF: "費倫英雄", SCAG: "劍灣冒險者指南", ABH: "阿斯代倫的飢渴之書", DSotDQ: "龍槍：龍后之影"};
for (const b of [...rd("books.json").book, ...rd("adventures.json").adventure]) {
	srcDate[b.id] = b.published || "";
	srcZh[b.id] = ZH_FIX[b.id] || uiDict[b.name] || b.name;
}
const newer = (a, b) => (a === SRC ? -1 : b === SRC ? 1 : (srcDate[b] || "").localeCompare(srcDate[a] || ""));

// ---- 專長 ----
const feats = {};
const ABN = {str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1};
for (const f of rd("feats.json").feat.filter(f => inDef("feats", f.name, f.source)).sort((a, b) => newer(a.source, b.source))) {
	if (feats[key(f.name)]) continue;
	// 2014 版專長沒有類別，依 2024 規則當作通用專長（4 級起）
	const legacy = !f.category;
	const o = {zh: f.name_zh || f.name, en: f.name, cat: legacy ? ["G"] : [].concat(f.category), tx: toText(f.entries)};
	if (f.source !== SRC) o.src = f.source;
	if (legacy) o.lv = 4;
	// 先決條件：另一個專長、施法能力、軍用武器熟練、種族、屬性值
	for (const p of f.prerequisite || []) {
		if (p.feat) o.preFeat = p.feat.map(key);
		if (p.feature?.some(x => /Spellcasting|Pact Magic/.test(x)) || p.spellcasting2020 || p.spellcasting || p.spellcastingFeature || p.spellcastingPrepared) o.preCast = 1;
		if (p.proficiency?.some(x => x.weaponGroup === "martial")) o.preMartial = 1;
		if (p.race) o.preRace = p.race.map(x => x.name.toLowerCase());
		if (p.ability) o.preAb = p.ability.map(x => Object.entries(x)[0]);
	}
	if (f.ability) {
		const a = f.ability[0];
		o.ab = (a.choose?.from || Object.keys(a)).filter(x => ABN[x]);
		if (!o.ab.length) delete o.ab;
	}
	const lv = f.prerequisite?.find(p => p.level)?.level;
	if (lv) o.lv = Math.max(o.lv || 0, typeof lv === "object" ? lv.level || 1 : lv);
	if (f.repeatable) o.rep = 1;
	if (f.skillProficiencies) o.sk = 1;
	// 專長給的法術（魔法學徒另外處理）；多組選項時（例如舊版儀式施法者）由玩家選一組
	if (f.additionalSpells && !["magic initiate", "rune shaper"].includes(key(f.name))) {
		const alts = f.additionalSpells.filter(a => !a.expanded).map(a => ({
			cls: /^(\w+) Spells$/.exec(a.name || "")?.[1] || null, name: a.name || null,
			sa: typeof a.ability === "string" ? a.ability : null, saCh: a.ability?.choose || null, ...spellPart(a),
		})).filter(a => a.known.length || a.innate.length || a.choose.length);
		if (alts.length) o.sp = alts;
	}
	feats[key(f.name)] = o;
}

// ---- 職業 ----
// 可選的子職業來源：2024 核心、被遺忘的國度（費倫英雄、劍灣冒險者指南）
const SUB_SRC = ["XPHB", "FRHoF", "SCAG"];
// 「level=0|class=Wizard」或 {from: [...]} 轉成法術鍵清單
function chooseSpells(ch) {
	if (ch.from) return ch.from.map(key).filter(k => spells[k]);
	const q = Object.fromEntries(String(ch).split("|").map(x => x.split("=")));
	const cl = q.class ? q.class[0].toUpperCase() + q.class.slice(1).toLowerCase() : null;
	const sch = q.school ? q.school.split(";") : null;
	const rit = /ritual/.test(q["components & miscellaneous"] || "");
	return Object.keys(spells).filter(k => (q.level == null || spells[k].l === +q.level) && (!cl || spells[k].cls.includes(cl)) && (!sch || sch.includes(spells[k].sc)) && (!rit || spells[k].r));
}
// additionalSpells 的一組選項轉成 {known, innate, choose}；等級「_」視為 1 級，prepared 視為 known
function spellPart(as) {
	const known = [], choose = [], innate = [];
	for (const part of ["known", "prepared", "innate"]) for (const [lv0, v] of Object.entries(as?.[part] || {})) {
		const lv = /^\d+$/.test(lv0) ? +lv0 : 1;
		const list = Array.isArray(v) ? v : Object.values(v).flatMap(x => (Array.isArray(x) ? x : typeof x === "object" ? Object.values(x).flat() : []));
		for (const x of list) {
			if (typeof x === "string") { const k = key(x.replace(/#.*$/, "")); if (spells[k]) (part === "innate" ? innate : known).push({lv, k}); }
			else if (x?.choose) choose.push({lv, n: x.count || 1, pool: chooseSpells(x.choose), ...(part === "innate" ? {inn: 1} : {})});
		}
	}
	return {known, innate, choose};
}
// 依引用字串（名稱|職業|職業來源|子職業|子職業來源|等級|特性來源）找出子職業特性，連同內含的子特性一起展開
function subFeatures(d, refs) {
	const all = d.subclassFeature || [];
	const find = ref => {
		const [name, , csrc, short, ssrc, lv, fsrc] = ref.split("|");
		const f = all.find(x => x.name === name && x.subclassShortName === short && x.subclassSource === ssrc && x.level === +lv && x.classSource === (csrc || "PHB") && (!fsrc || x.source === fsrc));
		if (!f?._copy) return f;
		const c = f._copy;
		const base = all.find(x => x.name === c.name && x.subclassShortName === c.subclassShortName && x.subclassSource === c.subclassSource && x.level === c.level && x.classSource === c.classSource);
		return base ? {...base, ...f, entries: base.entries} : f;
	};
	const out = [];
	const walk = (ref, minLv) => {
		const f = find(typeof ref === "string" ? ref : ref.subclassFeature);
		if (!f) return;
		const lv = Math.max(minLv, f.level);
		out.push({lv, en: f.name, zh: f.name_zh || f.name, tx: toText(f.entries)});
		const subs = [];
		const scan = e => { if (!e || typeof e !== "object") return; if (e.type === "refSubclassFeature") subs.push(e.subclassFeature); else for (const v of Object.values(e)) if (typeof v === "object") scan(v); };
		scan(f.entries);
		for (const r of subs) walk(r, lv);
	};
	for (const r of refs) walk(r, +(typeof r === "string" ? r : r.subclassFeature).split("|")[5]);
	return out;
}
const ABIL = ["str", "dex", "con", "int", "wis", "cha"];
const classes = [];
for (const fn of fs.readdirSync(path.join(DATA, "class")).filter(f => /^class-.*\.json$/.test(f))) {
	const d = rd(`class/${fn}`);
	for (const c of (d.class || []).filter(c => isX(c) || (c.name === "Artificer" && c.source === "EFA"))) {
		const CS = c.source;
		const featIdx = new Map((d.classFeature || []).filter(f => f.classSource === CS && f.source === CS).map(f => [`${f.name}|${f.level}`, f]));
		const features = [];
		for (const ref of c.classFeatures) {
			const r = typeof ref === "string" ? ref : ref.classFeature;
			const [name, , , lv] = r.split("|");
			const f = featIdx.get(`${name}|${lv}`);
			features.push({lv: +lv, en: name, zh: f?.name_zh || name, tx: toText(f?.entries || []), sub: typeof ref === "object" && ref.gainSubclassFeature ? 1 : undefined});
		}
		// 職業表：非法術欄位的欄
		const table = {cols: [], rows: Array.from({length: 20}, () => [])};
		let slots = null;
		for (const g of c.classTableGroups || []) {
			if (g.rowsSpellProgression) { slots = g.rowsSpellProgression; continue; }
			g.colLabels.forEach((lab, i) => {
				const l = stripTags(lab);
				if (/戲法|已準備法術/.test(l)) return;
				table.cols.push(l);
				g.rows.forEach((row, j) => table.rows[j].push(cell(row[i])));
			});
		}
		const sp = c.startingProficiencies;
		// 子職業：5etools 該職業頁預設列出的（同職業版本、未被重印、非 UA）；同名時取較新的書
		const twinRep = s => (d.subclass || []).some(x => x.name === s.name && x.source === s.source && x.reprintedAs);
		const subPool = (d.subclass || []).filter(s => s.classSource === CS && !twinRep(s) && !isUA(s.source) && (!OFF.has(s.source) || offKeep("class", c.name, CS))).sort((a, b) => newer(a.source, b.source));
		const subclasses = subPool.filter((s, i) => subPool.findIndex(x => x.name === s.name) === i).map(s => {
			const legacy = s.source !== CS;
			// 舊書子職業（SCAG）沿用 2014 版的資料，以 _copy 指向原版
			const orig = s._copy ? d.subclass.find(x => x.name === s._copy.name && x.source === s._copy.source && x.classSource === s._copy.classSource) : null;
			const refs = s.subclassFeatures || orig?.subclassFeatures || [];
			// 2014 版的子職業（特性引用 2014 版職業）在 1、2 級取得的能力，2024 版統一延到 3 級
			const old = !!s._copy || refs.some(x => ["", "PHB", "TCE"].includes((typeof x === "string" ? x : x.subclassFeature).split("|")[2]));
			const fs_ = legacy ? subFeatures(d, refs)
				: (d.subclassFeature || []).filter(f => f.classSource === CS && f.subclassSource === CS && f.subclassShortName === s.shortName)
					.map(f => ({lv: f.level, en: f.name, zh: f.name_zh || f.name, tx: toText(f.entries)}));
			const o = {id: legacy ? `${s.shortName}|${s.source}` : s.shortName, zh: (s.name_zh || s.name).replace(/\u200b/g, ""), en: s.name, f: fs_};
			if (legacy) o.src = s.source;
			const addSp = s.additionalSpells || (old ? (orig || d.subclass.find(x => x.name === s.name && x.source === s.source && x.classSource === "PHB"))?.additionalSpells : null);
			const lvFix = v => (old ? Math.max(3, +v) : +v);
			const as = addSp?.[0];
			const strs = v => (Array.isArray(v) ? v : Object.values(v || {}).flat()).filter(x => typeof x === "string").map(key);
			if (as?.prepared) {
				o.always = {};
				for (const [lv, v] of Object.entries(as.prepared)) {
					const arr = Array.isArray(v) ? v : Object.values(v).flatMap(x => Object.values(x)).flat();
					(o.always[lvFix(lv)] ||= []).push(...arr.filter(x => typeof x === "string").map(key));
				}
			}
			if (addSp && addSp.length > 1 && addSp[0].name) o.variants = addSp.map(a => ({en: a.name, always: Object.fromEntries(Object.entries(a.prepared || {}).map(([k, v]) => [k, v.map(key)]))}));
			// 已知／天生法術：固定的直接列入，「自選」的交給角色卡自動挑選
			const known = [], choose = [];
			for (const part of ["known", "innate"]) for (const [lv, v] of Object.entries(as?.[part] || {})) {
				const list = Array.isArray(v) ? v : Object.values(v).flatMap(x => (Array.isArray(x) ? x : Object.values(x).flat()));
				for (const x of list) {
					if (typeof x === "string") known.push({lv: lvFix(lv), k: key(x)});
					else if (x?.choose) choose.push({lv: lvFix(lv), n: x.count || 1, pool: chooseSpells(x.choose)});
				}
			}
			if (known.length) o.known = known;
			if (as?.ability) o.knownSa = as.ability;
			if (choose.length) o.choose = choose;
			if (s.spellcastingAbility) {
				o.sa = s.spellcastingAbility; o.cantrips = s.cantripProgression; o.prep = s.preparedSpellsProgression;
				o.slots = s.subclassTableGroups?.find(g => g.rowsSpellProgression)?.rowsSpellProgression;
			}
			return o;
		});
		const prof = sp.skills?.[0];
		classes.push({
			id: c.name, zh: c.name_zh || c.name, hd: c.hd.faces,
			saves: c.proficiency, primary: c.primaryAbility.flatMap(o => Object.keys(o)),
			armor: (sp.armor || []).map(a => typeof a === "string" ? a : a.proficiency || ""),
			weapons: (sp.weapons || []).map(w => typeof w === "string" ? w : w.proficiency || ""),
			tools: (sp.tools || []).map(stripTags),
			toolChoice: (sp.toolProficiencies || [])[0] || null,
			skills: prof?.choose ? {from: prof.choose.from, n: prof.choose.count} : {any: prof?.any || 0},
			eq: c.startingEquipment.defaultData.map(o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, eqList(v)])))[0],
			sa: c.spellcastingAbility || null, caster: c.casterProgression || null,
			cantrips: c.cantripProgression || null, prep: c.preparedSpellsProgression || null, slots,
			always: c.additionalSpells?.[0]?.prepared ? Object.fromEntries(Object.entries(c.additionalSpells[0].prepared).map(([k, v]) => [k, v.filter(x => typeof x === "string").map(key)])) : null,
			featProg: (c.featProgression || []).map(f => ({zh: f.name_zh || f.name, cat: f.category, prog: f.progression})),
			subTitle: c.subclassTitle, table, f: features, subs: subclasses,
			...(CS !== SRC ? {src: CS} : {}),
			toolFix: Object.entries(sp.toolProficiencies?.[0] || {}).filter(([, v]) => v === true).map(([k]) => key(k)),
			toolAny: Object.entries(sp.toolProficiencies?.[0] || {}).filter(([k, v]) => typeof v === "number").map(([k, v]) => ({from: ANY_TOOL[k], n: v})).filter(x => x.from),
		});
	}
}
const ORDER = ["Artificer", "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"];
classes.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));

// ---- 種族 ----
const racesJson = rd("races.json");
const species = racesJson.race.filter(isX).map(r => ({
	id: r.name, zh: r.name_zh || r.name, size: r.size, speed: typeof r.speed === "number" ? r.speed : r.speed.walk, dv: r.darkvision || 0,
	res: (r.resist || []).filter(x => typeof x === "string"),
	tr: r.entries.filter(e => e.name).map(e => ({en: e.name, zh: e.name_zh || e.name, tx: toText(e.entries || [])})),
}));
// 其他書的種族：依 5etools 預設清單（種族＋亞種合併），屬性值加值依 2024 規則一律忽略
const SKIP_TR = new Set(["Age", "Alignment", "Size", "Speed", "Languages", "Ability Score Increase", "Ability Score Increases", "Appearance", "Creature Type"]);
const spellRefs = as => {
	const known = [], choose = [], innate = [];
	for (const part of ["known", "innate"]) for (const [lv, v] of Object.entries(as?.[part] || {})) {
		const list = Array.isArray(v) ? v : Object.values(v).flatMap(x => (Array.isArray(x) ? x : typeof x === "object" ? Object.values(x).flat() : []));
		for (const x of list) {
			if (typeof x === "string") { const k = key(x.replace(/#.*$/, "")); if (spells[k]) (part === "known" ? known : innate).push({lv: +lv, k}); }
			else if (x?.choose) choose.push({lv: +lv, n: x.count || 1, pool: chooseSpells(x.choose)});
		}
	}
	return {known, innate, choose};
};
const languagesAll = rd("languages.json").language;
const langOf = lp => {
	const fixed = [], o = {fixed, any: 0};
	for (const l of lp || []) for (const [k, v] of Object.entries(l)) {
		if (k === "anyStandard" || k === "any" || k === "anyLanguage") o.any += typeof v === "number" ? v : 1;
		else if (k === "choose") o.any += v.count || 1;
		else if (k !== "common" && v === true) fixed.push(languagesAll.find(x => x.name.toLowerCase() === k)?.name || k.replace(/\b\w/g, m => m.toUpperCase()));
	}
	return o;
};
const toolsOf = tp => {
	const fixed = [], ch = [];
	for (const t of tp || []) for (const [k, v] of Object.entries(t)) {
		if (k === "choose") ch.push({from: v.from.map(x => ANY_TOOL[x] || key(x)), n: v.count || 1});
		else if (k === "any") ch.push({from: ["toolArtisan", "instrumentMusical", "setGaming"], n: v});
		else if (ANY_TOOL[k]) ch.push({from: [ANY_TOOL[k]], n: typeof v === "number" ? v : 1});
		else if (v === true && items[key(k)]) fixed.push(key(k));
	}
	return {fixed, ch};
};
const skillsOf = sp => {
	const o = {fixed: [], any: 0, ch: null};
	for (const x of sp || []) for (const [k, v] of Object.entries(x)) {
		if (k === "any") o.any += v;
		else if (k === "choose") o.ch = {from: v.from, n: v.count || 1};
		else if (v === true) o.fixed.push(k);
	}
	return o;
};
// 天生護甲：資料只有特性標籤，數值依書中規則
const NAT_AC = {Tortle: {base: 17, dex: 0}, Lizardfolk: {base: 13, dex: 1}, Loxodon: {base: 12, con: 1}, Autognome: {base: 13, dex: 1}, "Thri-kreen": {base: 13, dex: 1}, Warforged: {bonus: 1}};
const traitsOf = es => (es || []).filter(e => e.name && !SKIP_TR.has(e.name));
// _mod 的 replaceArr／appendArr／removeArr（依名稱或索引）
const applyMod = (entries, mod) => {
	let out = entries.slice();
	for (const m of [].concat(mod || [])) {
		const idx = m.replace?.index ?? out.findIndex(e => e?.name === m.replace);
		const items_ = [].concat(m.items || []);
		if (m.mode === "replaceArr" && idx >= 0) out.splice(idx, 1, ...items_);
		else if (m.mode === "appendArr" || m.mode === "insertArr") out.push(...items_);
		else if (m.mode === "prependArr") out.unshift(...items_);
		else if (m.mode === "removeArr") out = out.filter(e => ![].concat(m.names || []).includes(e?.name));
	}
	return out;
};
const resolveCopy = (o, list) => {
	if (!o._copy) return o;
	const base = list.find(x => x.name === o._copy.name && x.source === o._copy.source);
	if (!base) return o;
	const b = resolveCopy(base, list);
	const m = {...b, ...o};
	delete m._copy; delete m.reprintedAs;
	m.entries = applyMod(o.entries || b.entries || [], o._copy._mod?.entries);
	return m;
};
const raceList = racesJson.race.map(r => resolveCopy(r, racesJson.race));
const entriesPool = [];
for (const R of raceList) {
	if (isUA(R.source)) continue;
	const subs = racesJson.subrace.filter(s => s.raceName === R.name && s.raceSource === R.source);
	if (inDef("races", R.name, R.source) && R.source !== SRC) entriesPool.push({R, S: null, name: R.name, src: R.source});
	for (const S of subs) {
		const nm = S.name ? `${R.name} (${S.name})` : R.name;
		const src = S.source || R.source;
		if (S.name && inDef("races", nm, src)) entriesPool.push({R, S, name: nm, src});
	}
}
// 同名種族只留一個：2024 玩家手冊優先，其次是較新的書
const byName = new Map();
for (const e of entriesPool.sort((a, b) => newer(a.src, b.src))) if (!byName.has(e.name.toLowerCase()) && !species.some(x => x.id.toLowerCase() === e.name.toLowerCase())) byName.set(e.name.toLowerCase(), e);
for (const {R, S, name, src} of byName.values()) {
	const versions = (S?._versions || R._versions || []).length ? (S?._versions || R._versions) : [null];
	const opts = [];
	for (const v of versions) {
		const m = {...R, ...(S || {}), ...(v || {})};
		for (const k of Object.keys(m)) if (m[k] === null) delete m[k];
		let tr = traitsOf(R.entries);
		for (const e of traitsOf(S?.entries)) {
			const ow = e.data?.overwrite;
			const i = ow ? tr.findIndex(t => t.name === ow || t.name_zh === ow) : -1;
			if (i >= 0) tr[i] = e; else tr.push(e);
		}
		if (S && R.name === "Half-Elf") tr = tr.filter(t => t.name !== "Skill Versatility");
		let vName = null;
		if (v?._mod?.entries) {
			const mods = [].concat(v._mod.entries);
			const it = mods.flatMap(m => [].concat(m.items || [])).find(x => x?.name);
			tr = applyMod(tr, mods);
			const n = it ? it.name_zh || it.name : "";
			vName = /（(.+)）$/.exec(n)?.[1] || (/[：:]/.test(n) ? n.replace(/^[^：:]*[：:]\s*/, "") : "") || ({Lorwyn: "洛溫", Shadowmoor: "影沼"})[v.name.split("; ").pop()] || v.name.split("; ").pop();
		}
		const sp = typeof m.speed === "number" ? {walk: m.speed} : {...(m.speed || {walk: 30})};
		for (const k of ["fly", "swim", "climb", "burrow"]) if (sp[k] === true) sp[k] = sp.walk;
		const as = m.additionalSpells?.[0];
		const tools = toolsOf(m.toolProficiencies);
		const featAny = (m.feats || []).reduce((n, f) => n + (f.any || f.anyFromCategory?.count || 0), 0);
		opts.push({
			id: v ? v.name : name, zh: vName || "",
			size: m.size || ["M"], speed: sp.walk || 30, fly: sp.fly || 0, swim: sp.swim || 0, climb: sp.climb || 0, dv: m.darkvision || 0,
			res: (m.resist || []).filter(x => typeof x === "string"), resCh: (m.resist || []).find(x => x?.choose)?.choose.from || null,
			sk: skillsOf(m.skillProficiencies), wp: (m.weaponProficiencies || []).flatMap(w => Object.keys(w).filter(k => w[k] === true).map(key)),
			tools, lang: langOf(m.languageProficiencies), feat: featAny,
			sa: typeof as?.ability === "string" ? as.ability : null, saCh: as?.ability?.choose || null, sp: as ? spellRefs(as) : null,
			ac: NAT_AC[R.name] || null,
			tr: tr.map(e => ({en: e.name, zh: e.name_zh || e.name, tx: toText(e.entries || (e.entry ? [e.entry] : []))})),
		});
	}
	const zhR = R.name_zh || R.name;
	const zh = S?.name ? `${zhR}（${(S.name_zh || S.name).replace(/^變體[；;]\s*/, "")}）` : zhR;
	species.push({id: `${name}|${src}`, zh, legacy: 1, src, size: opts[0].size, opts});
}
// ---- 背景 ----
const bgJson = rd("backgrounds.json").background;
const BG_FEAT_FIX = {"Genie Touched": "magic initiate; wizard"}; // 資料缺專長欄位
const BG_FEATURE_ZH = Object.fromEntries(Object.entries({
	"Watcher's Eye": "守望者之眼", "Respect of the Stout Folk": "矮人的敬重", "Library Access": "圖書館使用權", "Court Functionary": "宮廷官員",
	"Safe Haven": "避風港", "All Eyes on You": "眾目焦點", "Inheritance": "繼承權", "Knightly Regard": "騎士的敬重", "Mercenary Life": "傭兵生涯",
	"Ear to the Ground": "在地之耳", "Uthgardt Heritage": "烏斯伽傳統", "Kept in Style": "保持時尚",
	"Researcher": "研究員", "Shelter of the Faithful": "信徒之家", "Criminal Contact": "罪犯人脈", "Ship's Passage": "船行水路", "False Identity": "虛假身分",
	"By Popular Demand": "人見人愛", "Rustic Hospitality": "鄉民款待", "Guild Membership": "公會成員", "Discovery": "發現", "Wanderer": "漂泊者",
	"Military Rank": "軍事階級", "City Secrets": "城市密徑", "Choose a Feature": "自選特性",
}).map(([k, v]) => [`Feature: ${k}`, `特性：${v}`]));
// 裝備文字（中文條目）裡沒有對應物品的特殊物品：只在括號外的頓號切開，「你所熟練／所選擇的工具」已由工具選擇處理
const specialsOf = txt => {
	const parts = [];
	let depth = 0, buf = "";
	for (const ch of txt) {
		if ("（(".includes(ch)) depth++;
		if ("）)".includes(ch)) depth--;
		if (ch === "、" && !depth) { parts.push(buf); buf = ""; } else buf += ch;
	}
	parts.push(buf);
	const merged = [];
	for (const x of parts.map(x => x.trim().replace(/^(和|及|以及|與)/, ""))) {
		if (merged.length && (x.length <= 3 || x.startsWith("或"))) merged[merged.length - 1] += `、${x}`; else merged.push(x);
	}
	return merged.filter(x => x && !/\{@item|\{@filter|金幣|gp|熟練的|所選擇的/i.test(x)).map(stripTags);
};
// 2014 版物品在 2024 版的對應
const OLD_ITEM = {"common clothes": "traveler's clothes", "vestments": "robe", "clothes, common": "traveler's clothes", "clothes, fine": "fine clothes", "clothes, costume": "costume", "costume clothes": "costume", "belt pouch": "pouch", "bag of sand": "sack", "small knife": "dagger"};
const legacyEq = (b, list) => {
	const eqEntry = b.entries?.find(e => e.type === "list")?.items?.find(i => i.name === "Equipment:")?.entry || "";
	const eq = [];
	let gp = 0;
	for (const e of list || []) {
		const it = typeof e === "string" ? e : e.item;
		if (e.containsValue) gp += e.containsValue;
		if (e.value) gp += e.value;
		const ik = it && [key(it), key(it).replace(/s$/, ""), OLD_ITEM[key(it)]].find(x => items[x]);
		if (ik) eq.push({k: ik, q: e.quantity || 1});
		else if (e.equipmentType) eq.push({choose: e.equipmentType});
	}
	for (const x of specialsOf(eqEntry)) eq.push({special: x});
	if (gp) eq.push({gp});
	return eq;
};
const bgList = bgJson.map(b => resolveCopy(b, bgJson));
const backgrounds = [];
const bgSeen = new Set();
for (const b of bgList.filter(b => inDef("backgrounds", b.name, b.source)).sort((x, y) => newer(x.source, y.source))) {
	if (bgSeen.has(b.name.toLowerCase())) continue;
	bgSeen.add(b.name.toLowerCase());
	const sk = skillsOf(b.skillProficiencies);
	const tools = toolsOf(b.toolProficiencies);
	const featKey = BG_FEAT_FIX[b.name] || (b.feats?.[0] ? key(Object.keys(b.feats[0])[0]) : null);
	const featE = b.entries?.find(e => e.data?.isFeature);
	const se = b.startingEquipment?.[0] || {};
	const eqObj = {};
	for (const [k, v] of Object.entries(se)) eqObj[k === "_" ? "A" : k.toUpperCase()] = b.ability ? eqList(v) : legacyEq(b, v);
	if (!Object.keys(eqObj).length) eqObj.A = [{gp: 5000}];
	const o = {
		id: b.name, zh: b.name_zh || b.name,
		ab: b.ability ? b.ability[0].choose.weighted.from : [...ABIL], feat: featKey && feats[featKey.split(";")[0]] ? featKey : null,
		sk: sk.fixed, tool: {}, tools: tools.fixed, toolCh: tools.ch, lang: langOf(b.languageProficiencies), eq: eqObj,
	};
	if (b.source !== SRC) o.src = b.source;
	if (!b.ability) o.legacy = 1;
	if (sk.ch || sk.any) o.skCh = sk.ch || {from: null, n: sk.any};
	if (featE) o.feature = {en: featE.name, zh: featE.name_zh || BG_FEATURE_ZH[featE.name] || featE.name.replace(/^Feature: /, "特性："), tx: toText(featE.entries)};
	backgrounds.push(o);
}
const BG_ORDER = new Map(bgJson.filter(isX).map((b, i) => [b.name, i]));
backgrounds.sort((x, y) => (x.src ? 1 : 0) - (y.src ? 1 : 0) || (BG_ORDER.get(x.id) ?? 0) - (BG_ORDER.get(y.id) ?? 0));

// ---- 技能、語言、工具 ----
const skills = rd("skills.json").skill.filter(isX).map(s => ({id: s.name.toLowerCase(), zh: s.name_zh || s.name, ab: s.ability}));
const languages = [];
for (const l of languagesAll.filter(l => !isUA(l.source) && !OFF.has(l.source)).sort((a, b) => newer(a.source, b.source))) {
	if (languages.some(x => x.id === l.name)) continue;
	languages.push({id: l.name, zh: l.name_zh || l.name, ...(isX(l) && l.type === "standard" ? {std: 1} : {})});
}
const toolsBy = t => Object.entries(items).filter(([, v]) => v.t === t).map(([k]) => k);
const tools = {toolArtisan: toolsBy("AT"), instrumentMusical: toolsBy("INS"), setGaming: toolsBy("GS")};

const out = {
	v: new Date().toISOString().slice(0, 10),
	srcZh: Object.fromEntries(Object.entries(srcZh).filter(([k]) => [...species, ...backgrounds, ...Object.values(feats), ...Object.values(spells), ...classes, ...classes.flatMap(c => c.subs)].some(o => o.src === k))),
	classes, species, backgrounds, feats, spells, items, skills, languages, tools,
	propZh, masteryZh, masteryText,
};
fs.mkdirSync(OUT, {recursive: true});
fs.writeFileSync(path.join(OUT, "data.json"), JSON.stringify(out));
for (const f of fs.readdirSync(path.join(HERE, "src"))) fs.copyFileSync(path.join(HERE, "src", f), path.join(OUT, f));
// 檔名加上內容雜湊參數，更新後瀏覽器不會沿用舊的快取
{
	const ver = f => crypto.createHash("sha1").update(fs.readFileSync(path.join(OUT, f))).digest("hex").slice(0, 8);
	const app = path.join(OUT, "app.js");
	fs.writeFileSync(app, fs.readFileSync(app, "utf8").replace('fetch("data.json")', `fetch("data.json?v=${ver("data.json")}")`));
	const idx = path.join(OUT, "index.html");
	fs.writeFileSync(idx, fs.readFileSync(idx, "utf8").replace(/(href|src)="([\w.]+\.(?:js|css))"/g, (m, a, f) => `${a}="${f}?v=${ver(f)}"`));
}

// 檢查：引用到的物品、法術、專長都找得到
const miss = new Set();
const chkEq = l => l.forEach(e => e.k && !items[e.k] && miss.add(`item ${e.k}`));
for (const c of classes) { Object.values(c.eq).forEach(chkEq); Object.values(c.always || {}).flat().forEach(s => !spells[s] && miss.add(`spell ${s}`)); for (const s of c.subs) Object.values(s.always || {}).flat().forEach(x => !spells[x] && miss.add(`spell ${x}`)); }
for (const b of backgrounds) { Object.values(b.eq).forEach(chkEq); if (b.feat && !feats[b.feat.split(";")[0]]) miss.add(`feat ${b.feat}`);  }
if (miss.size) console.log("找不到：", [...miss].join(", "));
console.log(`data.json ${(fs.statSync(path.join(OUT, "data.json")).size / 1024).toFixed(0)} KB；職業 ${classes.length}、種族 ${species.length}、背景 ${backgrounds.length}、專長 ${Object.keys(feats).length}、法術 ${Object.keys(spells).length}、物品 ${Object.keys(items).length}`);
