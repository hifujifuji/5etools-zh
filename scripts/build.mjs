// 建置中文版 5etools：
//   1. 把上游 5etools 複製到 dist/
//   2. 把 i18n/ 的翻譯合併進 dist/data
//   3. 套用 patches/ 的 JS/HTML 修改（中文顯示、介面翻譯）
//   4. 重新產生全站搜尋索引
//
// 用法：node scripts/build.mjs
//   UPSTREAM=<5etools 路徑> 可指定上游版本

import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {ROOT, UPSTREAM, readJson, writeJson, hasCjk} from "./util.mjs";
import {Merger} from "./merge.mjs";
import {applyPatches} from "./patch.mjs";
import {S, makeKeyFns, loadSubclassFullNames} from "./keys.mjs";

const DIST = path.join(ROOT, "dist");
const I18N = path.join(ROOT, "i18n");

// ---- 1. 複製上游（每次都從乾淨的複本開始，patch 才不會重複套用） ---------------------
console.log(`複製上游：${UPSTREAM}`);
fs.mkdirSync(DIST, {recursive: true});
execFileSync("rsync", [
	"-a", "--delete", "--checksum",
	"--exclude", ".git", "--exclude", "node_modules", "--exclude", "test", "--exclude", "*.zip",
	`${UPSTREAM}/`, `${DIST}/`,
], {stdio: "inherit"});

// ---- 2. 載入翻譯 -----------------------------------------------------------
// 全站統一用語（hazmole 與本站譯法不同者）
const TERM_FIX = [[/睿知/g, "感知"], [/揮砍/g, "劈砍"], [/聖武士/g, "聖騎士"], [/借機攻擊/g, "藉機攻擊"], [/铎/g, "鐸"], [/混沌海imbo\(或譯靈薄獄、迷失域\)/g, "混沌海（Limbo，或譯靈薄獄、迷失域）"], [/暗影界|幽影界/g, "墮影冥界"], [/混沌界/g, "混沌海"], [/邪術師/g, "契術師"], [/為了拯救我自己或是其他人的生命，我什麼秘密都會說。I can't keep a secret to save my life, or anyone else's\./g, "我守不住秘密，就算攸關我或別人的性命也一樣。"], [/"name": "尺寸"/g, '"name": "體型"'], [/\{@5etools feat\|feats\.html\}/g, "{@5etools 專長|feats.html}"]];
// 中文譯文裡沒有顯示文字的規則速查標籤：補上中文顯示名
const QUICKREF_ZH = {"difficult terrain": "困難地形", "cover": "掩護", "vision and light": "視覺與光照", "surprised": "突襲", "adventuring gear": "冒險裝備", "multiclassing": "兼職"};
// quickref 標籤欄位：名稱|來源|章節索引|條目名|顯示文字；顯示文字在第 5 欄
// 傷害類型統一用 i18n/terms-2024.md 的譯名（寒冰／死靈／精神／酸蝕）；「寒冷」「心靈」「強酸」只在傷害類型的語境才換
const DMG_ZH = "酸蝕|強酸|鈍擊|寒冷|寒冰|火焰|力場|閃電|黯蝕|死靈|穿刺|毒素|心靈|精神|光耀|劈砍|雷鳴";
TERM_FIX.push([/黯蝕/g, "死靈"]);
TERM_FIX.push([/斥侯/g, "斥候"]); // hazmole 舊譯錯字（子職業、背景等）
TERM_FIX.push([new RegExp(`(寒冷|心靈|強酸)(?=(?:[、或與和及](?:${DMG_ZH}))*(?:傷害|抗性|易傷))`, "g"), m => ({寒冷: "寒冰", 心靈: "精神", 強酸: "酸蝕"})[m]]);
// 傷害類型的列舉（後面沒有接「傷害」）：酸蝕、寒冷、火焰、閃電或毒素
TERM_FIX.push([new RegExp(`(寒冷|心靈|強酸)(?=[、或與和及](?:${DMG_ZH})(?![\\u4e00-\\u9fff]{2}))`, "g"), m => ({寒冷: "寒冰", 心靈: "精神", 強酸: "酸蝕"})[m]]);
TERM_FIX.push([new RegExp(`(?<=(?:${DMG_ZH})[、或與和及])(寒冷|心靈|強酸)(?![\\u4e00-\\u9fff])`, "g"), m => ({寒冷: "寒冰", 心靈: "精神", 強酸: "酸蝕"})[m]]);
TERM_FIX.push([/寒冷吐息/g, "寒冰吐息"]);
TERM_FIX.push([/\{@quickref ([^}|]+)((?:\|[^}|]*){0,3})\}/g, (m, name, rest) => {
	const zh = QUICKREF_ZH[name.toLowerCase()];
	if (!zh) return m;
	const parts = rest.split("|").slice(1);
	while (parts.length < 3) parts.push("");
	return `{@quickref ${name}|${parts.slice(0, 3).join("|")}|${zh}}`;
}]);
const readI18n = f => JSON.parse(TERM_FIX.reduce((s, [re, to]) => s.replace(re, to), fs.readFileSync(f, "utf8")));
const loadDir = dir => {
	const out = {};
	if (!fs.existsSync(dir)) return out;
	for (const f of fs.readdirSync(dir)) {
		if (!f.endsWith(".json") || f.startsWith("_")) continue;
		out[f.replace(/\.json$/, "")] = readI18n(path.join(dir, f));
	}
	return out;
};
// 後載入的覆蓋先載入的：custom（自己補的翻譯）優先於 hazmole
const tr = {};
for (const layer of ["hazmole", "custom"]) {
	for (const [prop, map] of Object.entries(loadDir(path.join(I18N, layer)))) Object.assign(tr[prop] ||= {}, map);
}

const glossary = {};
const names = {};
for (const layer of ["hazmole", "custom"]) {
	for (const [f, target] of [["_glossary.json", glossary], ["_names.json", names]]) {
		const p = path.join(I18N, layer, f);
		if (!fs.existsSync(p)) continue;
		for (const [k, v] of Object.entries(readI18n(p))) Object.assign(target[k] ||= {}, v);
	}
}
// 手動詞彙（技能、動作、感官…）
const manual = readJson(path.join(I18N, "glossary.json"));
for (const [tag, map] of Object.entries(manual.tags)) Object.assign(glossary[tag] ||= {}, map);
for (const [prop, map] of Object.entries(manual.names || {})) {
	for (const [en, zh] of Object.entries(map)) (names[prop] ||= {})[en.toLowerCase()] = zh;
}

// 職業特性只靠名稱對應（2024 版同名特性也能有中文名）
for (const prop of ["classFeature", "subclassFeature", "subrace"]) {
	for (const [key, o] of Object.entries(tr[prop] || {})) {
		const eng = key.split("|")[prop === "subrace" ? 1 : 0].toLowerCase();
		if (prop === "subclassFeature" && o.name && eng === key.split("|")[2]?.toLowerCase()) continue; // 子職業簡介同名，跳過
		if (hasCjk(o.name)) (names[prop] ||= {})[eng] ||= o.name.trim();
	}
}

const merger = new Merger({glossary});

// ---- 3. 合併資料 -----------------------------------------------------------
const {key: keyOf, altKeys} = makeKeyFns(loadSubclassFullNames(path.join(DIST, "data")));
const FLUFF_PROP = {monsterFluff: "fluff-monster", raceFluff: "fluff-race", backgroundFluff: "fluff-background", itemFluff: "fluff-item"};
const NAME_PROP = {magicvariant: "magicvariant", baseitem: "baseitem", itemGroup: "item"};

const stats = {};
const bump = (prop, k) => { (stats[prop] ||= {total: 0, full: 0, name: 0})[k]++; };

const translateEntity = (prop, ent) => {
	if (!ent || typeof ent !== "object") return;
	if (typeof ent.name !== "string" && !(prop === "itemProperty" && ent.abbreviation)) return;
	bump(prop, "total");
	const trProp = FLUFF_PROP[prop] || prop;
	const old = [keyOf(prop, ent), ...altKeys(prop, ent)].map(k => tr[trProp]?.[k]).find(Boolean);
	if (old) {
		merger.mergeEntity(ent, old);
		if (ent.name_zh) { bump(prop, "full"); return; }
	}
	if (FLUFF_PROP[prop] || typeof ent.name !== "string") return;
	// 沒有全文翻譯：至少給中文名
	const zh = lookupName(prop, ent.name);
	if (zh) { Merger.setName(ent, zh); bump(prop, "name"); }
};

const SUFFIX_ZH = {"two uses": "兩次", "three uses": "三次", "four uses": "四次", "2 uses": "兩次", "3 uses": "三次"};
const lookupName = (prop, name) => {
	const dict = names[NAME_PROP[prop] || prop];
	const lc = name.toLowerCase();
	const hit = dict?.[lc] ?? (prop === "baseitem" || prop === "itemGroup" ? names.item?.[lc] : null);
	if (hit) return hit;
	// 「Extra Attack (2)」「Indomitable (two uses)」：翻譯本體、保留括號
	const m = /^(.+?) \((.+)\)$/.exec(name);
	if (m && dict?.[m[1].toLowerCase()]) return `${dict[m[1].toLowerCase()].replace(/\s*[(（][^()（）]*[)）]$/, "")}（${SUFFIX_ZH[m[2].toLowerCase()] || m[2]}）`;
	return null;
};

const walkDataFiles = dir => {
	const out = [];
	for (const f of fs.readdirSync(dir, {withFileTypes: true})) {
		const p = path.join(dir, f.name);
		// generated/ 只處理由書籍內文產生的變體規則（規則詞彙頁會載入）
		if (f.isDirectory()) { if (f.name !== "generated") out.push(...walkDataFiles(p)); else out.push(path.join(p, "gendata-variantrules.json")); } else if (f.name.endsWith(".json")) out.push(p);
	}
	return out;
};

const SKIP_PROPS = new Set(["_meta", "data"]);
let nFiles = 0;
const loaded = [];
for (const file of walkDataFiles(path.join(DIST, "data"))) {
	const rel = path.relative(path.join(DIST, "data"), file);
	if (rel.startsWith("foundry") || rel.includes("/foundry")) continue;
	let json;
	try { json = readJson(file); } catch { continue; }
	if (!json || typeof json !== "object" || Array.isArray(json)) continue;
	let touched = false;

	// 書籍內文
	const mBook = /^book\/book-(.+)\.json$/.exec(rel);
	if (mBook && json.data && tr.book?.[S(mBook[1])]) {
		merger.mergeTree(json.data, tr.book[S(mBook[1])]);
		touched = true;
	}

	for (const [prop, arr] of Object.entries(json)) {
		if (SKIP_PROPS.has(prop) || !Array.isArray(arr)) continue;
		for (const ent of arr) translateEntity(prop, ent);
		touched = true;
	}
	if (touched) loaded.push({file, json});
}

// ---- 3‴. 怪物中文簡介（i18n/monster-intro.json；本站自撰的概述，以方塊置於資訊頁最前，原文保留） ----
// _copy 條目：自己有簡介就用自己的，否則沿用來源條目的；一律以 _mod 移到最前（先移除繼承來的方塊再前置）。
{
	const intro = readJson(path.join(I18N, "monster-intro.json"));
	const all = new Map();
	for (const {json} of loaded) for (const f of json.monsterFluff || []) all.set(`${f.name}|${f.source}`, f);
	const srcOf = f => f._copy && all.get(`${f._copy.name}|${f._copy.source}`);
	const textOf = (f, depth = 0) => f && depth < 8 ? intro[`${f.name}|${f.source}`] || textOf(srcOf(f), depth + 1) : null;
	const inset = t => ({type: "inset", name: "中文簡介", entries: [].concat(t)});
	const plan = [];
	for (const f of all.values()) { const t = textOf(f); if (t) plan.push([f, t, !!textOf(srcOf(f))]); }
	for (const [f, t, srcHas] of plan) {
		if (!f._copy) (f.entries ||= []).unshift(inset(t));
		else {
			const mod = f._copy._mod ||= {};
			mod.entries = [
				...(srcHas ? [{mode: "removeArr", names: "中文簡介", force: true}] : []),
				...[].concat(mod.entries || []),
				{mode: "prependArr", items: [inset(t)]},
			];
		}
		bump("monsterIntro", "full");
	}
}

// ---- 3⁗. 神祇：短欄位（i18n/deity-fields.json，完全比對）與中文簡介（i18n/deity-intro.json，鍵「英文名|來源|神系」） ----
// pantheon／category 是篩選與網址用的值，資料不動，由 patches/80-deities.mjs 在顯示時翻。
{
	const df = readJson(path.join(I18N, "deity-fields.json"));
	const intro = readJson(path.join(I18N, "deity-intro.json"));
	for (const {json} of loaded) {
		for (const d of json.deity || []) {
			if (!d.name_zh && df.name[d.name]) Merger.setName(d, df.name[d.name]);
			for (const f of ["title", "province", "symbol", "worshipers", "plane"]) {
				if (typeof d[f] === "string" && df[f]?.[d[f]]) d[f] = df[f][d[f]];
			}
			if (Array.isArray(d.altNames)) d.altNames = d.altNames.map(s => df.altNames[s] || s);
			const t = intro[`${d.name}|${d.source}|${d.pantheon}`];
			if (t && Array.isArray(d.entries)) {
				d.entries.unshift({type: "inset", name: "中文簡介", entries: [].concat(t)});
				bump("deityIntro", "full");
			}
		}
	}
}

// ---- 3a. 職業起始裝備／熟練字串（i18n/class-equipment.json，完全比對） ----------------
{
	const eq = readJson(path.join(I18N, "class-equipment.json"));
	const tr1 = arr => Array.isArray(arr) && arr.forEach((s, i) => {
		if (typeof s === "string" && eq[s]) arr[i] = eq[s];
		else if (s && typeof s.full === "string" && eq[s.full]) s.full = eq[s.full]; // {proficiency, full} 形式
	});
	for (const {json} of loaded) {
		for (const cls of json.class || []) {
			tr1(cls.startingEquipment?.default);
			for (const k of ["weapons", "armor", "tools"]) { tr1(cls.startingProficiencies?.[k]); tr1(cls.multiclassing?.proficienciesGained?.[k]); }
		}
	}
}

// ---- 3a''. 職業／子職業特性開頭的「{@i 3rd-level Echo Knight feature}」 ------------------------
{
	const zhName = {};
	for (const prop of ["subclass", "class"]) {
		for (const [k, o] of Object.entries(tr[prop] || {})) if (hasCjk(o?.name)) zhName[k.split("|")[0].toLowerCase()] ||= o.name.trim();
	}
	const RE = /^\{@i (\d+)(?:st|nd|rd|th)-[Ll]evel (.+?) [Ff]eature\}$/;
	const fix = arr => Array.isArray(arr) && arr.forEach((s, i) => {
		const m = typeof s === "string" && RE.exec(s);
		const zh = m && (zhName[m[2].toLowerCase()] || zhName[`the ${m[2].toLowerCase()}`] || lookupName("class", m[2]));
		if (zh) arr[i] = `{@i ${m[1]} 級${zh}特性}`;
	});
	const walk = v => { if (Array.isArray(v)) { fix(v); v.forEach(walk); } else if (v && typeof v === "object") Object.values(v).forEach(walk); };
	for (const {json} of loaded) for (const f of [...json.subclassFeature || [], ...json.classFeature || []]) walk(f.entries);
	// 完全比對的字串（2024 子職業標語、子職業標題、表格標題…；i18n/class-strings.json）
	const cs = readI18n(path.join(I18N, "class-strings.json"));
	const KEEP = new Set(["name", "source", "className", "classSource", "subclassShortName", "subclassSource", "shortName", "classFeature", "subclassFeature", "classFeatures", "subclassFeatures", "_copy"]);
	const walk2 = (v, k) => {
		if (typeof v === "string") return cs[v] ?? v;
		if (Array.isArray(v)) { for (let i = 0; i < v.length; ++i) v[i] = walk2(v[i], k); return v; }
		if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) if (!KEEP.has(kk) && !kk.startsWith("_") && kk !== "name_zh") v[kk] = walk2(x, kk);
		return v;
	};
	for (const {json} of loaded) for (const p of ["class", "subclass", "classFeature", "subclassFeature"]) for (const e of json[p] || []) walk2(e);
	// 職業表欄位標題裡的 {@filter Cantrips Known|…} 之類
	const COL = {"cantrips known": "已知戲法", "cantrips": "戲法", "prepared spells": "已準備法術", "spells known": "已知法術", "invocations": "祈喚", "invocations known": "已知祈喚", "infusions known": "已知注能", "infused items": "注能物品"};
	const col = l => typeof l !== "string" ? l : l.replace(/^\{@filter ([^|}]+)\|/, (m, t) => {
		const lv = /^(\d)(?:st|nd|rd|th)$/.exec(t);
		const z = lv ? `${lv[1]}環` : COL[t.toLowerCase()];
		return z ? `{@filter ${z}|` : m;
	});
	for (const {json} of loaded) for (const c of [...json.class || [], ...json.subclass || []]) for (const g of c.classTableGroups || c.subclassTableGroups || []) if (g.colLabels) g.colLabels = g.colLabels.map(col);
}

// ---- 3a⁰. _copy／_versions 內巢狀條目的中文名（i18n/copy-names.json；只設 name_zh，不改 name） ----------
{
	const cn = readI18n(path.join(I18N, "copy-names.json"));
	const walk = v => {
		if (Array.isArray(v)) return v.forEach(walk);
		if (!v || typeof v !== "object") return;
		if (typeof v.name === "string" && v.type && !v.name_zh && cn[v.name]) { v.name_zh = cn[v.name]; v._zhOf = v.name; }
		for (const [k, x] of Object.entries(v)) if (k !== "name") walk(x);
	};
	for (const {json} of loaded) for (const arr of Object.values(json)) if (Array.isArray(arr)) for (const ent of arr) { if (ent?._copy) walk(ent._copy); if (ent?._versions) walk(ent._versions); }
}

// ---- 3a⁰ʺ. 物品同調需求（i18n/req-attune.json）：改成「by 中文」，保留 by 開頭讓篩選分類不變 ----------------
{
	const ra = readI18n(path.join(I18N, "req-attune.json"));
	for (const {json} of loaded) for (const p of ["item", "magicvariant", "baseitem"]) for (const it of json[p] || []) {
		for (const k of ["reqAttune", "reqAttuneAlt"]) if (typeof it[k] === "string" && ra[it[k]]) it[k] = `by ${ra[it[k]]}`;
		if (it.inherits) for (const k of ["reqAttune", "reqAttuneAlt"]) if (typeof it.inherits[k] === "string" && ra[it.inherits[k]]) it.inherits[k] = `by ${ra[it.inherits[k]]}`;
	}
}

// ---- 3a⁰ʹ. 法術材料構材（i18n/spell-materials.json，完全比對） ----------------
{
	const mat = readI18n(path.join(I18N, "spell-materials.json"));
	for (const {json} of loaded) for (const sp of json.spell || []) {
		const m = sp.components?.m;
		if (typeof m === "string" && mat[m]) sp.components.m = mat[m];
		else if (m && typeof m.text === "string" && mat[m.text]) m.text = mat[m.text];
	}
}

// ---- 3a'. 種族／背景／專長中完全比對的句子（含 _copy、_versions；i18n/exact-strings.json） --------
{
	const ex = readI18n(path.join(I18N, "exact-strings.json"));
	const PROPS = new Set(["race", "subrace", "background", "feat", "raceFluff", "backgroundFluff", "variantrule", "item", "card", "deck", "classFeature", "trap", "hazard", "object"]);
	// name 只在「巢狀的條目」（有 entries）裡翻；replace／names 等是 _copy 用來比對的鍵，不能動
	// _copy 裡的條目名稱會被後續的 _copy 用來比對，一律不翻
	const walk = (v, depth = 0, inCopy = false) => {
		if (typeof v === "string") return ex[v] ?? v;
		if (Array.isArray(v)) { for (let i = 0; i < v.length; ++i) v[i] = walk(v[i], depth + 1, inCopy); return v; }
		if (v && typeof v === "object") {
			for (const k of Object.keys(v)) {
				if (k === "name" || k === "_zhOf") continue; // 條目名稱可能被其他 _copy 以英文比對，不動
				if (!["source", "replace", "mode", "prop", "names", "set", "suit", "valueName", "cards", "face", "back", "className", "classSource", "subclassShortName", "subclassSource"].includes(k)) v[k] = walk(v[k], depth + 1, inCopy || k === "_copy");
			}
		}
		return v;
	};
	for (const {json} of loaded) for (const p of PROPS) for (const ent of json[p] || []) walk(ent);
}

// ---- 3a''. 召喚物／夥伴數據的特殊 AC、HP、熟練加值欄位（"11 + the spell's level" 等） ----------------
{
	const CLS = {ranger: "遊俠", artificer: "奇械師", bard: "吟遊詩人", druid: "德魯伊"};
	const ABL = {Wisdom: "感知", Intelligence: "智力", Charisma: "魅力", Strength: "力量", Dexterity: "敏捷", Constitution: "體質"};
	const NUM = {four: "四", five: "五"};
	const ONLY = {Defender: "守護者", Air: "天空", "Land and Water": "陸地與水", Demon: "惡魔", Devil: "魔鬼", Yugoloth: "尤格羅斯魔", "Ghostly and Putrid": "幽魂與腐屍", Skeletal: "骷髏"};
	const FIXED = {
		"equals your Proficiency Bonus": "等同於你的熟練加值", "equals your bonus": "等同於你的熟練加值", "equals its summoner's": "等同於其召喚者的熟練加值",
		"half the hit point maximum of its summoner": "其召喚者生命值上限的一半", "Half the HP maximum of its summoner": "其召喚者生命值上限的一半",
		"—(immune to damage)": "—（免疫傷害）", "10 (Medium or smaller), 20 (Large), 40 (Huge)": "10（中型或更小）、20（大型）、40（巨型）",
		"10 + 1 per spell level": "10 + 每法術環階 1",
		"understands the languages you speak": "懂得你會說的語言", "Understands the languages you know": "懂得你通曉的語言", "understands the languages you know": "懂得你通曉的語言", "understands the languages of its creator but can't speak": "懂得其創造者的語言，但無法說話",
	};
	const zhSpecial = str => {
		if (FIXED[str]) return FIXED[str];
		let s = str
			.replace(/\(the (?:\w+ ?)+ has a number of Hit Dice \[d(\d+)s\] equal to (?:your (\w+) level|your level|the spell's level|the level of the spell)\)/gi, (m, d, c) => `（生命骰 [d${d}] 的數量等同於${c ? `你的${CLS[c.toLowerCase()] ?? c}等級` : /your level/.test(m) ? "你的等級" : "法術環階"}）`)
			.replace(/\b(four|five) times your (\w+ )?level/gi, (m, n, c) => `${NUM[n.toLowerCase()]}倍的你的${c ? CLS[c.trim().toLowerCase()] ?? c.trim() : ""}等級`)
			.replace(/\byour (\w+) level\b/g, (m, c) => CLS[c.toLowerCase()] ? `你的${CLS[c.toLowerCase()]}等級` : m)
			.replace(/\byour (\w+) modifier\b/g, (m, a) => ABL[a] ? `你的${ABL[a]}調整值` : m)
			.replace(/(\d+) for each spell level above (\d+)(?:st|nd|rd|th)?/g, "法術環階每比 $2 環高一環 $1")
			.replace(/(\d+) per spell level/g, "每法術環階 $1")
			.replace(/the level of the spell|the spell's level/g, "法術環階")
			.replace(/ \(natural armor\)/g, "（天生護甲）")
			.replace(/ \(([A-Za-z ]+) only\)/g, (m, x) => ONLY[x] ? `（僅限${ONLY[x]}）` : m)
			.replace(/ plus /g, " + ").replace(/ or /g, "或 ");
		return /[A-Za-z]{3}/.test(s.replace(/PB|\{@[^}]*\}/g, "")) ? str : s;
	};
	let n = 0;
	for (const {json} of loaded) for (const m of json.monster || []) {
		for (const a of m.ac || []) if (a?.special) { const z = zhSpecial(a.special); if (z !== a.special) { a.special = z; ++n; } }
		if (m.hp?.special) { const z = zhSpecial(m.hp.special); if (z !== m.hp.special) { m.hp.special = z; ++n; } }
		if (m.pbNote) { const z = zhSpecial(m.pbNote); if (z !== m.pbNote) { m.pbNote = z; ++n; } }
		if (Array.isArray(m.languages)) m.languages = m.languages.map(l => FIXED[l] ?? l);
	}
	console.log(`怪物特殊 AC／HP 欄位：${n} 處`);
}

// ---- 3b. 中文句子裡的標籤補上中文顯示名：{@spell Fireball|XPHB} → {@spell Fireball|XPHB|火球術} ------
const TAG_OF_PROP = {
	spell: "spell", monster: "creature", item: "item", baseitem: "item", magicvariant: "item", itemGroup: "item",
	race: "race", background: "background", feat: "feat", optionalfeature: "optfeature", condition: "condition",
	disease: "disease", status: "status", trap: "trap", hazard: "hazard", reward: "reward", object: "object",
	variantrule: "variantrule", action: "action", skill: "skill", sense: "sense", language: "language", class: "class",
	cult: "cult", boon: "boon", psionic: "psionic", vehicle: "vehicle", table: "table", itemMastery: "itemMastery",
	card: "card", deck: "deck",
};
const tagNames = new Map();
for (const {json} of loaded) {
	for (const [prop, arr] of Object.entries(json)) {
		const tag = TAG_OF_PROP[prop];
		if (!tag || !Array.isArray(arr)) continue;
		for (const e of arr) {
			if (!e?.name_zh || e._zhOf !== e.name) continue;
			const lc = e.name.toLowerCase();
			// 卡牌標籤是 {@card 名稱|牌組|來源|顯示}，同名卡牌很多，要連牌組一起比對
			if (tag === "card") { tagNames.set(`card|${lc}|${(e.set || "").toLowerCase()}|${S(e.source)}`, e.name_zh); continue; }
			tagNames.set(`${tag}|${lc}|${S(e.source)}`, e.name_zh);
			if (!tagNames.has(`${tag}|${lc}`)) tagNames.set(`${tag}|${lc}`, e.name_zh);
		}
	}
}
// 語言標籤（語言實體沒有中文名時的後備）
for (const [en, zh] of Object.entries({
	Common: "通用語", Dwarvish: "矮人語", Elvish: "精靈語", Giant: "巨人語", Gnomish: "地侏語", Goblin: "哥布林語", Halfling: "半身人語", Orc: "獸人語",
	Abyssal: "深淵語", Celestial: "天界語", "Deep Speech": "深幽語", Draconic: "龍語", Infernal: "煉獄語", Primordial: "原初語", Sylvan: "木族語",
	Undercommon: "地底通用語", Druidic: "德魯伊語", "Thieves' Cant": "盜賊黑話", Gith: "吉斯語", Aquan: "水族語", Auran: "氣族語", Ignan: "火族語", Terran: "土族語",
})) if (!tagNames.has(`language|${en.toLowerCase()}`)) tagNames.set(`language|${en.toLowerCase()}`, zh);
// 召喚物的「召喚自」法術連結補上中文名（{@spell 名稱|來源|顯示}）
for (const {json} of loaded) for (const m of json.monster || []) {
	if (typeof m.summonedBySpell !== "string" || m.summonedBySpell.split("|").length > 2) continue;
	const [n, src] = m.summonedBySpell.split("|");
	const zh = tagNames.get(`spell|${n.toLowerCase()}|${S(src || "PHB")}`) ?? tagNames.get(`spell|${n.toLowerCase()}`);
	if (zh) m.summonedBySpell = `${n}|${src || ""}|${zh}`;
}
let nTagDisplay = 0;
const RE_TAG = /\{@(\w+) ([^{}]*)\}/g;
const fillTags = (str, isOverrideEn = false) => str.replace(RE_TAG, (m, tag, body) => {
	const parts = body.split("|");
	if (tag === "card") {
		if (parts[3] || hasCjk(parts[0])) return m;
		const zh = tagNames.get(`card|${parts[0].trim().toLowerCase()}|${(parts[1] || "").trim().toLowerCase()}|${S(parts[2] || "DMG")}`);
		if (!zh) return m;
		while (parts.length < 3) parts.push("");
		parts[3] = zh;
		nTagDisplay++;
		return `{@card ${parts.join("|")}}`;
	}
	// 已有顯示文字就保留；但「只有標籤」的字串裡的英文顯示文字（如 Bottle, Glass）可以換成中文
	if ((parts[2] && !(isOverrideEn && !hasCjk(parts[2]) && !/\d/.test(parts[2]) && parts.length === 3)) || hasCjk(parts[0])) return m;
	const lc = parts[0].trim().toLowerCase();
	const zh = tagNames.get(`${tag}|${lc}|${S(parts[1])}`) ?? tagNames.get(`${tag}|${lc}`);
	if (!zh) return m;
	while (parts.length < 2) parts.push("");
	parts[2] = zh;
	nTagDisplay++;
	return `{@${tag} ${parts.join("|")}}`;
});
// 已翻譯實體裡「只有標籤」的字串（例如法術表的一格 {@spell Cone of Cold|XPHB}）也補上中文名
const RE_ONLY_TAGS = /^[\s\d,;:()+\-–*]*(\{@[^{}]+\}[\s\d,;:()+\-–*]*)+$/;
// 法術清單（怪物施法）會被 _copy 的 replaceSpells 用字串比對，不能動
const NO_FILL_KEYS = new Set(["will", "daily", "spells", "weekly", "monthly", "yearly", "rest", "restLong", "ritual", "recharge", "charges", "legendary", "_copy", "_mod"]);
const walkStrings = (v, inZh = false) => {
	if (typeof v === "string") return v.includes("{@") && (hasCjk(v) || (inZh && RE_ONLY_TAGS.test(v))) ? fillTags(v, inZh && RE_ONLY_TAGS.test(v)) : v;
	if (Array.isArray(v)) { for (let i = 0; i < v.length; ++i) v[i] = walkStrings(v[i], inZh); return v; }
	if (v && typeof v === "object") {
		const z = inZh || !!v.name_zh;
		for (const k of Object.keys(v)) {
			if (k === "name") continue;
			v[k] = NO_FILL_KEYS.has(k) ? walkStrings(v[k], false) : walkStrings(v[k], z);
		}
		return v;
	}
	return v;
};
// 怪物法術清單：所有怪物（含 _copy 的 replaceSpells/addSpells）一律用同一個 fillTags 補中文名，
// 基底與複製端的字串經過相同轉換，字串比對仍然對得上
const SPELL_LIST_KEYS = new Set(["will", "daily", "spells", "weekly", "monthly", "yearly", "rest", "restLong", "ritual", "recharge", "charges", "legendary", "replace", "with"]);
// 法術清單後綴「(level 7 version)」等；認不得的後綴就整串保留原樣
const SPELL_SUFFIX_FULL = {
	"the hand is invisible": "手為隱形", "the hand is Invisible": "手為隱形",
	"can become Medium when changing his appearance": "改變外貌時可以變為中型", "can become Medium when changing her appearance": "改變外貌時可以變為中型",
	"can become Medium": "可以變為中型", "including the form of a Medium Humanoid": "包括中型類人生物的形態", "any humanoid form": "任意類人形態",
	"Beast or Humanoid form only, no {@variantrule Temporary Hit Points|XPHB} gained from the spell, and no Concentration or {@variantrule Temporary Hit Points|XPHB} required to maintain the spell": "僅限野獸或類人生物形態，不會從該法術獲得{@variantrule Temporary Hit Points|XPHB|臨時生命值}，且維持該法術無需專注或{@variantrule Temporary Hit Points|XPHB|臨時生命值}",
	"only self and up to one incapacitated creature, which is considered willing for the spell": "僅限自身與至多一個無力的生物，該生物視為自願接受此法術",
	"only self and up to one incapacitated creature which is considered willing for the spell": "僅限自身與至多一個無力的生物，該生物視為自願接受此法術",
	"only itself and willing creatures": "僅限自身與自願的生物", "earth or fire elemental only": "僅限土元素或火元素",
	"pain or insanity": "痛苦或瘋狂", "discord or sleep only": "僅限不和或睡眠", "can create wine instead of water": "可以創造酒而非水",
	"with no chance of error": "不會出錯", "to Carceri only": "僅限前往卡瑟利", "see \"Reactions\" below": "見下方「反應」",
	"range 300 ft., +3 bonus to each damage roll": "射程 300 呎，每次傷害擲骰 +3 加值", "Flood, Part Water, or Redirect Flow only": "僅限洪水、分水或改變水流",
};
const SPELL_SUFFIX_ZH = suf => {
	const s = suf.trim().slice(1, -1);
	if (SPELL_SUFFIX_FULL[s]) return `（${SPELL_SUFFIX_FULL[s]}）`;
	const parts = s.split(/, | and /).map(p => {
		let m;
		if ((m = /^(?:cast )?at (\d+)(?:st|nd|rd|th) level$/i.exec(p))) return `以 ${m[1]} 環施展`;
		if ((m = /^as (?:an? )?(\d+)(?:st|nd|rd|th)-level spell$/i.exec(p))) return `以 ${m[1]} 環法術施展`;
		if ((m = /^(\d+)(?:st|nd|rd|th) level$/i.exec(p))) return `${m[1]} 級`;
		if ((m = /^(\d+) brains?$/i.exec(p))) return `${m[1]} 個腦`;
		if ((m = /^(\d+) or more brains$/i.exec(p))) return `${m[1]} 個腦或更多`;
		if ((m = /^cast as (\d+) action$/i.exec(p))) return `以 ${m[1]} 個動作施展`;
		if ((m = /^duration (\d+) years?$/i.exec(p))) return `持續時間 ${m[1]} 年`;
		if ((m = /^see chapter (\d+)$/i.exec(p))) return `見第 ${m[1]} 章`;
		if ((m = /^save (\{@dc \d+\})$/i.exec(p))) return `豁免 ${m[1]}`;
		if ((m = /^(?:(\d+) \()?(\{@(?:damage|dice) [^}]+\})\)?(?: (\w+))? damage$/i.exec(p))) { const dt = m[3] ? {fire: "火焰", psychic: "精神", necrotic: "死靈", cold: "寒冰", lightning: "閃電", radiant: "光耀", force: "力場"}[m[3].toLowerCase()] : ""; if (dt != null) return m[1] ? `${m[1]}（${m[2]}）${dt}傷害` : `${m[2]} ${dt}傷害`; }
		if ((m = /^(\{@dice [^}]+\})$/.exec(p))) return m[1];
		if ((m = /^(\{@creature [^}]+\}) only$/.exec(p))) return `僅限${fillTags(m[1])}`;
		if ((m = /^(snakes|reptiles|rats|spiders|demon|pain|hopelessness|discord|death|stunning) only$/i.exec(p))) return `僅限${{snakes: "蛇", reptiles: "爬蟲類", rats: "鼠類", spiders: "蜘蛛", demon: "惡魔", pain: "痛苦", hopelessness: "絕望", discord: "不和", death: "死亡", stunning: "震懾"}[m[1].toLowerCase()]}`;
		if ((m = /^(\w+) form only$/i.exec(p))) { const f = {swan: "天鵝", humanoid: "類人", beast: "野獸"}[m[1].toLowerCase()]; if (f) return `僅限${f}形態`; }
		if ({trident: 1, spear: 1, necrotic: 1}[p.toLowerCase()]) return {trident: "三叉戟", spear: "矛", necrotic: "死靈"}[p.toLowerCase()];
		if ((m = /^level (\d) version$/i.exec(p))) return `${m[1]} 環版本`;
		if ((m = /^(\d)(?:st|nd|rd|th)[- ]level(?: version)?$/i.exec(p))) return `${m[1]} 環版本`;
		return {
			"included in AC": "已計入 AC", "self only": "僅限自身", "cast before combat": "戰鬥前施展", "self": "僅限自身",
			"see below": "見下文", "see \"Actions\" below": "見下方「動作」", "as an action": "作為一個動作",
			"can become invisible": "可以隱形", "Humanoid form only": "僅限類人形態", "humanoid form only": "僅限類人形態",
		}[p] ?? null;
	});
	return parts.every(Boolean) ? `（${parts.join("，")}）` : null;
};
const fillSpellLists = v => {
	if (typeof v === "string") {
		if (RE_ONLY_TAGS.test(v)) return fillTags(v);
		const m = /^(\{@spell [^{}]+\})( \(.+\))$/.exec(v);
		if (!m) return v;
		const suf = SPELL_SUFFIX_ZH(m[2]);
		return suf ? fillTags(m[1]) + suf : v;
	}
	if (Array.isArray(v)) { for (let i = 0; i < v.length; ++i) v[i] = fillSpellLists(v[i]); return v; }
	if (v && typeof v === "object") { for (const k of Object.keys(v)) if (SPELL_LIST_KEYS.has(k) || /^\d+e?$/.test(k)) v[k] = fillSpellLists(v[k]); }
	return v;
};
for (const {json} of loaded) {
	for (const mon of json.monster || []) {
		for (const sc of mon.spellcasting || []) fillSpellLists(sc);
		for (const m of Object.values(mon._copy?._mod || {}).flat()) {
			if (m && typeof m === "object" && /Spells$/.test(m.mode || "")) fillSpellLists(m);
		}
	}
}

// 引言署名（i18n/quote-by.json，完全比對）
{
	const by = readJson(path.join(I18N, "quote-by.json"));
	const walkBy = o => {
		if (Array.isArray(o)) return o.forEach(walkBy);
		if (!o || typeof o !== "object") return;
		if (o.type === "quote" && typeof o.by === "string" && by[o.by]) o.by = by[o.by];
		for (const [k, v] of Object.entries(o)) if (k !== "_zhOf") walkBy(v);
	};
	for (const {json} of loaded) walkBy(json);
}

for (const {file, json} of loaded) {
	// 職業資訊頁（fluff）的表格格子常只有標籤（如 {@creature Owl}），也補中文名
	if (json.classFluff || json.subclassFluff) walkStrings(json, true);
	else walkStrings(json);
	writeJson(file, json, {pretty: false});
	nFiles++;
}
console.log(`中文句子補上標籤中文名：${nTagDisplay} 處`);

// ---- 4. 修改程式 -----------------------------------------------------------
await applyPatches({dist: DIST, root: ROOT});

// ---- 5. 全站搜尋索引（要用合併後的資料重新產生，才搜得到中文名） ---------------------
fs.copyFileSync(path.join(ROOT, "src", "gen-search-index.mjs"), path.join(DIST, "node", "zh-gen-search-index.mjs"));
execFileSync(process.execPath, ["node/zh-gen-search-index.mjs"], {cwd: DIST, stdio: "inherit"});

// ---- 報告 -----------------------------------------------------------------
const report = {
	files: nFiles,
	merger: {...merger.stats, tagsUnresolved: Object.entries(merger.stats.tagsUnresolved).sort((a, b) => b[1] - a[1])},
	props: stats,
};
writeJson(path.join(ROOT, ".cache", "report.json"), report);
console.log(`\n已處理 ${nFiles} 個資料檔；替換字串 ${merger.stats.strings}，巢狀名稱 ${merger.stats.names}，標籤 ${merger.stats.tagsResolved}（未解析 ${report.merger.tagsUnresolved.length} 種）`);
console.log("prop".padEnd(20), "總數".padStart(6), "全文".padStart(6), "僅名稱".padStart(6));
for (const [p, s] of Object.entries(stats).sort((a, b) => b[1].total - a[1].total)) {
	if (!s.full && !s.name) continue;
	console.log(p.padEnd(20), String(s.total).padStart(6), String(s.full).padStart(6), String(s.name).padStart(6));
}

// ---- 6. Service worker（離線快取；工具裝在 tools/sw，只在建置時用） -------------------
{
	const swMods = path.join(ROOT, "tools", "sw", "node_modules");
	if (fs.existsSync(swMods)) {
		const link = path.join(DIST, "node_modules");
		fs.rmSync(link, {recursive: true, force: true});
		fs.symlinkSync(swMods, link, "dir");
		try {
			execFileSync(process.execPath, ["node/build-sw.mjs", "prod"], {cwd: DIST, stdio: ["ignore", "pipe", "inherit"]});
			console.log("已產生 service worker（sw.js、sw-injector.js）");
		} finally {
			fs.rmSync(link, {force: true});
		}
	} else {
		console.log("略過 service worker：尚未安裝 tools/sw 的相依套件（cd tools/sw && npm install）");
	}
}
