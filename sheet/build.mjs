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
	if (e.item) return {k: key(e.item), q: e.quantity || 1, ...(e.displayName ? {n: e.displayName} : {})};
	if (e.value != null) return {gp: e.value};
	if (e.special) return {special: e.special === "Spellbook" ? "法術書" : e.special};
	if (e.equipmentType) return {choose: e.equipmentType};
	return null;
}).filter(Boolean);

// ---- 法術 ----
const lookup = rd("generated/gendata-spell-source-lookup.json").xphb;
const spells = {};
for (const s of rd("spells/spells-xphb.json").spell) {
	const k = key(s.name);
	const classes = Object.keys(lookup?.[k]?.class?.XPHB || {});
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
	spells[k] = o;
}

// ---- 專長 ----
const feats = {};
for (const f of rd("feats.json").feat.filter(isX)) {
	const o = {zh: f.name_zh || f.name, en: f.name, cat: [].concat(f.category), tx: toText(f.entries)};
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
		const subclasses = (d.subclass || []).filter(s => s.classSource === SRC && s.source === SRC).map(s => {
			const fs_ = (d.subclassFeature || []).filter(f => f.classSource === SRC && f.subclassSource === SRC && f.subclassShortName === s.shortName)
				.map(f => ({lv: f.level, en: f.name, zh: f.name_zh || f.name, tx: toText(f.entries)}));
			const o = {id: s.shortName, zh: s.name_zh || s.name, en: s.name, f: fs_};
			const as = s.additionalSpells?.[0];
			if (as?.prepared) o.always = Object.fromEntries(Object.entries(as.prepared).map(([k, v]) => [k, v.filter(x => typeof x === "string").map(key)]));
			if (s.additionalSpells && s.additionalSpells.length > 1 && s.additionalSpells[0].name) o.variants = s.additionalSpells.map(a => ({en: a.name, always: Object.fromEntries(Object.entries(a.prepared || {}).map(([k, v]) => [k, v.map(key)]))}));
			if (as?.known) { const kn = Object.entries(as.known).flatMap(([lv, v]) => (Array.isArray(v) ? v : []).filter(x => typeof x === "string").map(x => ({lv: +lv, k: key(x)}))); if (kn.length) o.known = kn; }
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
const species = rd("races.json").race.filter(isX).map(r => ({
	id: r.name, zh: r.name_zh || r.name, size: r.size, speed: typeof r.speed === "number" ? r.speed : r.speed.walk, dv: r.darkvision || 0,
	res: (r.resist || []).filter(x => typeof x === "string"),
	tr: r.entries.filter(e => e.name).map(e => ({en: e.name, zh: e.name_zh || e.name, tx: toText(e.entries || [])})),
}));

// ---- 背景 ----
const backgrounds = rd("backgrounds.json").background.filter(isX).map(b => ({
	id: b.name, zh: b.name_zh || b.name,
	ab: b.ability[0].choose.weighted.from,
	feat: key(Object.keys(b.feats[0])[0]),
	sk: Object.keys(b.skillProficiencies[0]),
	tool: Object.entries(b.toolProficiencies[0]).map(([k, v]) => v === true ? {k: key(k)} : {choose: k})[0],
	eq: Object.fromEntries(Object.entries(b.startingEquipment[0]).map(([k, v]) => [k, eqList(v)])),
}));

// ---- 技能、語言、工具 ----
const skills = rd("skills.json").skill.filter(isX).map(s => ({id: s.name.toLowerCase(), zh: s.name_zh || s.name, ab: s.ability}));
const languages = rd("languages.json").language.filter(isX).map(l => ({id: l.name, zh: l.name_zh || l.name, std: l.type === "standard"}));
const toolsBy = t => Object.entries(items).filter(([, v]) => v.t === t).map(([k]) => k);
const tools = {toolArtisan: toolsBy("AT"), instrumentMusical: toolsBy("INS"), setGaming: toolsBy("GS")};

const out = {
	v: new Date().toISOString().slice(0, 10),
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
for (const b of backgrounds) { Object.values(b.eq).forEach(chkEq); if (!feats[b.feat.split(";")[0]]) miss.add(`feat ${b.feat}`); if (b.tool.k && !items[b.tool.k]) miss.add(`tool ${b.tool.k}`); }
if (miss.size) console.log("找不到：", [...miss].join(", "));
console.log(`data.json ${(fs.statSync(path.join(OUT, "data.json")).size / 1024).toFixed(0)} KB；職業 ${classes.length}、種族 ${species.length}、背景 ${backgrounds.length}、專長 ${Object.keys(feats).length}、法術 ${Object.keys(spells).length}、物品 ${Object.keys(items).length}`);
