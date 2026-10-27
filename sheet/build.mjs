// 從 dist/data 抽出 2024 核心規則（XPHB）資料，產生自動角色卡用的 data.json
//   node sheet/build.mjs   需先執行 node scripts/build.mjs
import fs from "node:fs";
import path from "node:path";
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
for (const [lk, file] of [["xphb", "spells-xphb.json"], ["frhof", "spells-frhof.json"]]) for (const s of rd(`spells/${file}`).spell) {
	const k = key(s.name);
	const classes = Object.keys(lookupAll[lk]?.[k]?.class?.XPHB || {});
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
	const o = {zh: s.name_zh || s.name, en: s.name, l: s.level, sc: s.school, time, range, dur, cls: classes, tx: text};
	if (d.concentration) o.c = 1;
	if (s.meta?.ritual) o.r = 1;
	if (s.components?.m) o.m = 1;
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
	if (lk !== "xphb") o.src = s.source;
	spells[k] = o;
}

// ---- 專長 ----
const feats = {};
for (const f of rd("feats.json").feat.filter(f => f.source === SRC || f.source === "FRHoF")) {
	const o = {zh: f.name_zh || f.name, en: f.name, cat: [].concat(f.category), tx: toText(f.entries)};
	if (f.source !== SRC) o.src = f.source;
	// 先決條件：需要另一個專長、施法能力或軍用武器熟練
	for (const p of f.prerequisite || []) {
		if (p.feat) o.preFeat = p.feat.map(key);
		if (p.feature || p.spellcasting2020 || p.spellcasting) o.preCast = 1;
		if (p.proficiency?.some(x => x.weaponGroup === "martial")) o.preMartial = 1;
	}
	if (f.ability) {
		const a = f.ability[0];
		if (a.choose?.from) o.ab = a.choose.from; else o.ab = Object.keys(a).filter(x => x !== "max");
	}
	const lv = f.prerequisite?.find(p => p.level)?.level;
	if (lv) o.lv = lv;
	if (f.repeatable) o.rep = 1;
	if (f.skillProficiencies) o.sk = 1;
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
	return Object.keys(spells).filter(k => (q.level == null || spells[k].l === +q.level) && (!cl || spells[k].cls.includes(cl)));
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
	for (const c of (d.class || []).filter(isX)) {
		const featIdx = new Map((d.classFeature || []).filter(f => f.classSource === SRC && f.source === SRC).map(f => [`${f.name}|${f.level}`, f]));
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
		const subclasses = (d.subclass || []).filter(s => s.classSource === SRC && SUB_SRC.includes(s.source) && !s.reprintedAs).map(s => {
			const legacy = s.source !== SRC;
			// 舊書子職業（SCAG）沿用 2014 版的資料，以 _copy 指向原版
			const orig = s._copy ? d.subclass.find(x => x.name === s._copy.name && x.source === s._copy.source && x.classSource === s._copy.classSource) : null;
			const fs_ = legacy ? subFeatures(d, s.subclassFeatures || orig?.subclassFeatures || [])
				: (d.subclassFeature || []).filter(f => f.classSource === SRC && f.subclassSource === SRC && f.subclassShortName === s.shortName)
					.map(f => ({lv: f.level, en: f.name, zh: f.name_zh || f.name, tx: toText(f.entries)}));
			const o = {id: legacy ? `${s.shortName}|${s.source}` : s.shortName, zh: (s.name_zh || s.name).replace(/\u200b/g, ""), en: s.name, f: fs_};
			if (legacy) o.src = s.source;
			let addSp = s.additionalSpells || (s.source === "SCAG" ? (orig || d.subclass.find(x => x.name === s.name && x.source === s.source && x.classSource === "PHB"))?.additionalSpells : null);
			// 2014 版子職業在 1、2 級取得的能力，2024 版統一延到 3 級
			const lvFix = v => (legacy ? Math.max(3, +v) : +v);
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
		});
	}
}
const ORDER = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"];
classes.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));

// ---- 種族 ----
const racesJson = rd("races.json");
const species = racesJson.race.filter(isX).map(r => ({
	id: r.name, zh: r.name_zh || r.name, size: r.size, speed: typeof r.speed === "number" ? r.speed : r.speed.walk, dv: r.darkvision || 0,
	res: (r.resist || []).filter(x => typeof x === "string"),
	tr: r.entries.filter(e => e.name).map(e => ({en: e.name, zh: e.name_zh || e.name, tx: toText(e.entries || [])})),
}));
// 舊版種族（劍灣冒險者指南）：以 2014 玩家手冊的種族為底，套上亞種與變體；屬性值加值依 2024 規則忽略
const SKIP_TR = new Set(["Age", "Alignment", "Size", "Speed", "Languages", "Ability Score Increase", "Appearance"]);
const spellRefs = as => {
	const known = [], choose = [], innate = [];
	for (const part of ["known", "innate"]) for (const [lv, v] of Object.entries(as?.[part] || {})) {
		const list = Array.isArray(v) ? v : Object.values(v).flatMap(x => (Array.isArray(x) ? x : Object.values(x).flat()));
		for (const x of list) {
			if (typeof x === "string") (part === "known" ? known : innate).push({lv: +lv, k: key(x.replace(/#.*$/, ""))});
			else if (x?.choose) choose.push({lv: +lv, n: x.count || 1, pool: chooseSpells(x.choose)});
		}
	}
	return {known, innate, choose};
};
const langOf = lp => {
	const fixed = [], o = {fixed, any: 0};
	for (const l of lp || []) for (const [k, v] of Object.entries(l)) {
		if (k === "anyStandard") o.any += v;
		else if (k !== "common" && v === true) fixed.push(languagesJson.find(x => x.name.toLowerCase() === k)?.name || k);
	}
	return o;
};
const languagesJson = rd("languages.json").language.filter(isX);
const legacyGroups = new Map();
for (const sr of racesJson.subrace.filter(x => x.source === "SCAG")) {
	const base = racesJson.race.find(x => x.name === sr.raceName && x.source === sr.raceSource);
	if (!base) continue;
	const versions = sr._versions?.length ? sr._versions : [null];
	for (const v of versions) {
		const m = {...base, ...sr, ...(v || {})};
		for (const k of Object.keys(m)) if (m[k] === null) delete m[k];
		// 特性：底層種族 → 亞種覆寫 → 變體替換「擇一」方塊
		let tr = base.entries.filter(e => e.name && !SKIP_TR.has(e.name));
		const srE = (sr.entries || []).filter(e => e.name && !SKIP_TR.has(e.name));
		for (const e of srE) {
			const ow = e.data?.overwrite;
			const i = ow ? tr.findIndex(t => t.name === ow || t.name_zh === ow) : -1;
			if (i >= 0) tr[i] = e; else tr.push(e);
		}
		const isHalfElfVar = base.name === "Half-Elf";
		if (isHalfElfVar) tr = tr.filter(t => t.name !== "Skill Versatility");
		const vItem = v?._mod?.entries?.items;
		tr = tr.flatMap(t => (t.name === "Variant Feature (Choose 1)" ? (vItem ? [vItem] : []) : [t]));
		const vName = vItem ? (vItem.name_zh || vItem.name).replace(/^變體特性[：:]\s*/, "") : null;
		const sp = typeof m.speed === "number" ? {walk: m.speed} : m.speed || {walk: 30};
		const sk = m.skillProficiencies?.[0];
		const wp = m.weaponProficiencies?.[0] ? Object.keys(m.weaponProficiencies[0]).map(key) : [];
		const as = m.additionalSpells?.[0];
		const gid = `${base.name}|SCAG`;
		if (!legacyGroups.has(gid)) legacyGroups.set(gid, {id: gid, zh: base.name_zh || base.name, legacy: 1, src: "SCAG", size: base.size, opts: []});
		const srZh = (sr.name_zh || sr.name).replace(/^變體[；;]\s*/, "").replace(/\s+/g, "");
		legacyGroups.get(gid).opts.push({
			id: v ? v.name : sr.name, zh: vName ? `${srZh}：${vName}` : srZh,
			speed: sp.walk, fly: sp.fly || 0, swim: sp.swim || 0, dv: m.darkvision || 0,
			res: (m.resist || []).filter(x => typeof x === "string"),
			sk: sk ? {any: sk.any || 0, fixed: Object.keys(sk).filter(x => x !== "any" && x !== "choose")} : null,
			wp, lang: langOf(m.languageProficiencies), sa: as?.ability || null, sp: as ? spellRefs(as) : null,
			tr: tr.map(e => ({en: e.name, zh: e.name_zh || e.name, tx: toText(e.entries || (e.entry ? [e.entry] : []))})),
		});
	}
}
// 只有一個選項的群組直接用亞種名稱（深地侏、靈智半身人）
for (const g of legacyGroups.values()) {
	if (g.opts.length === 1) g.zh = g.opts[0].zh.replace(/^(.+)／.*$/, "$1") + (g.id.startsWith("Halfling") ? "半身人" : g.id.startsWith("Gnome") ? "" : "");
	species.push(g);
}

// ---- 背景 ----
const bgJson = rd("backgrounds.json").background;
const BG_FEAT_FIX = {"Genie Touched": "magic initiate; wizard"}; // 資料缺專長欄位
const backgrounds = bgJson.filter(b => b.source === SRC || b.source === "FRHoF").map(b => ({
	id: b.name, zh: b.name_zh || b.name, ...(b.source !== SRC ? {src: b.source} : {}),
	ab: b.ability[0].choose.weighted.from,
	feat: BG_FEAT_FIX[b.name] || key(Object.keys(b.feats[0])[0]),
	sk: Object.keys(b.skillProficiencies[0]),
	tool: Object.entries(b.toolProficiencies[0]).map(([k, v]) => v === true ? {k: key(k)} : {choose: k})[0],
	eq: Object.fromEntries(Object.entries(b.startingEquipment[0]).map(([k, v]) => [k, eqList(v)])),
}));
// 舊版背景（劍灣冒險者指南）：屬性值自選、沒有專長時可選一個起源專長
const BG_FEATURE_ZH = Object.fromEntries(Object.entries({
	"Watcher's Eye": "守望者之眼", "Respect of the Stout Folk": "矮人的敬重", "Library Access": "圖書館使用權", "Court Functionary": "宮廷官員",
	"Safe Haven": "避風港", "All Eyes on You": "眾目焦點", "Inheritance": "繼承權", "Knightly Regard": "騎士的敬重", "Mercenary Life": "傭兵生涯",
	"Ear to the Ground": "在地之耳", "Uthgardt Heritage": "烏斯伽傳統", "Kept in Style": "保持時尚",
}).map(([k, v]) => [`Feature: ${k}`, `特性：${v}`]));
const ANY_TOOL = {anyArtisansTool: "toolArtisan", "musical instrument": "instrumentMusical", anyMusicalInstrument: "instrumentMusical", "gaming set": "setGaming", anyGamingSet: "setGaming"};
for (const b of bgJson.filter(b => b.source === "SCAG")) {
	const skl = b.skillProficiencies[0];
	const tools = [], toolCh = [];
	for (const [k, v] of Object.entries(b.toolProficiencies?.[0] || {})) {
		if (k === "choose") toolCh.push({from: v.from.map(x => ANY_TOOL[x] || key(x)), n: v.count || 1});
		else if (ANY_TOOL[k]) toolCh.push({from: [ANY_TOOL[k]], n: typeof v === "number" ? v : 1});
		else if (v === true && items[key(k)]) tools.push(key(k));
	}
	// 裝備：能對應到 2024 物品的列入物品欄，其餘（特殊物品）取中文條目的文字
	const eqEntry = b.entries.find(e => e.type === "list")?.items.find(i => i.name === "Equipment:")?.entry || "";
	const eq = [];
	let gp = 0;
	for (const e of b.startingEquipment?.[0]?._ || []) {
		const it = typeof e === "string" ? e : e.item;
		if (e.containsValue) gp += e.containsValue;
		if (e.value) gp += e.value;
		const ik = it && [key(it), key(it).replace(/s$/, "")].find(x => items[x]);
		if (ik) eq.push({k: ik, q: e.quantity || 1});
		else if (e.equipmentType) eq.push({choose: e.equipmentType});
	}
	// 只在括號外的頓號切開；「你所熟練／所選擇的工具」已由工具選擇處理
	const parts = [];
	let depth = 0, buf = "";
	for (const ch of eqEntry) {
		if ("（(".includes(ch)) depth++;
		if ("）)".includes(ch)) depth--;
		if (ch === "、" && !depth) { parts.push(buf); buf = ""; } else buf += ch;
	}
	parts.push(buf);
	const merged = [];
	for (const x of parts.map(x => x.trim().replace(/^(和|及|以及|與)/, ""))) {
		if (merged.length && (x.length <= 3 || x.startsWith("或"))) merged[merged.length - 1] += `、${x}`; else merged.push(x);
	}
	const special = merged.filter(x => x && !/\{@item|金幣|gp|熟練的|所選擇的/i.test(x)).map(stripTags);
	for (const x of special) eq.push({special: x});
	if (gp) eq.push({gp});
	const feat = b.entries.find(e => e.data?.isFeature);
	backgrounds.push({
		id: b.name, zh: b.name_zh || b.name, src: "SCAG", legacy: 1, ab: [...ABIL], feat: null,
		sk: Object.keys(skl).filter(x => x !== "choose"), skCh: skl.choose ? {from: skl.choose.from, n: skl.choose.count || 1} : null,
		tool: {}, tools, toolCh, lang: langOf(b.languageProficiencies), eq: {A: eq},
		feature: feat ? {en: feat.name, zh: BG_FEATURE_ZH[feat.name] || feat.name_zh || feat.name, tx: toText(feat.entries)} : null,
	});
}

// ---- 技能、語言、工具 ----
const skills = rd("skills.json").skill.filter(isX).map(s => ({id: s.name.toLowerCase(), zh: s.name_zh || s.name, ab: s.ability}));
const languages = rd("languages.json").language.filter(isX).map(l => ({id: l.name, zh: l.name_zh || l.name, std: l.type === "standard"}));
const toolsBy = t => Object.entries(items).filter(([, v]) => v.t === t).map(([k]) => k);
const tools = {toolArtisan: toolsBy("AT"), instrumentMusical: toolsBy("INS"), setGaming: toolsBy("GS")};

const out = {
	v: new Date().toISOString().slice(0, 10),
	srcZh: {FRHoF: "費倫英雄", SCAG: "劍灣冒險者指南"},
	classes, species, backgrounds, feats, spells, items, skills, languages, tools,
	propZh, masteryZh, masteryText,
};
fs.mkdirSync(OUT, {recursive: true});
fs.writeFileSync(path.join(OUT, "data.json"), JSON.stringify(out));
for (const f of fs.readdirSync(path.join(HERE, "src"))) fs.copyFileSync(path.join(HERE, "src", f), path.join(OUT, f));

// 檢查：引用到的物品、法術、專長都找得到
const miss = new Set();
const chkEq = l => l.forEach(e => e.k && !items[e.k] && miss.add(`item ${e.k}`));
for (const c of classes) { Object.values(c.eq).forEach(chkEq); Object.values(c.always || {}).flat().forEach(s => !spells[s] && miss.add(`spell ${s}`)); for (const s of c.subs) Object.values(s.always || {}).flat().forEach(x => !spells[x] && miss.add(`spell ${x}`)); }
for (const b of backgrounds) { Object.values(b.eq).forEach(chkEq); if (b.feat && !feats[b.feat.split(";")[0]]) miss.add(`feat ${b.feat}`); if (b.tool.k && !items[b.tool.k]) miss.add(`tool ${b.tool.k}`); }
if (miss.size) console.log("找不到：", [...miss].join(", "));
console.log(`data.json ${(fs.statSync(path.join(OUT, "data.json")).size / 1024).toFixed(0)} KB；職業 ${classes.length}、種族 ${species.length}、背景 ${backgrounds.length}、專長 ${Object.keys(feats).length}、法術 ${Object.keys(spells).length}、物品 ${Object.keys(items).length}`);
