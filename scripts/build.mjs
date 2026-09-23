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
const TERM_FIX = [[/睿知/g, "感知"], [/\{@5etools feat\|feats\.html\}/g, "{@5etools 專長|feats.html}"]];
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
	if (m && dict?.[m[1].toLowerCase()]) return `${dict[m[1].toLowerCase()]}（${SUFFIX_ZH[m[2].toLowerCase()] || m[2]}）`;
	return null;
};

const walkDataFiles = dir => {
	const out = [];
	for (const f of fs.readdirSync(dir, {withFileTypes: true})) {
		const p = path.join(dir, f.name);
		if (f.isDirectory()) { if (f.name !== "generated") out.push(...walkDataFiles(p)); } else if (f.name.endsWith(".json")) out.push(p);
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

// ---- 3a. 職業起始裝備／熟練字串（i18n/class-equipment.json，完全比對） ----------------
{
	const eq = readJson(path.join(I18N, "class-equipment.json"));
	const tr1 = arr => Array.isArray(arr) && arr.forEach((s, i) => { if (typeof s === "string" && eq[s]) arr[i] = eq[s]; });
	for (const {json} of loaded) {
		for (const cls of json.class || []) {
			tr1(cls.startingEquipment?.default);
			for (const k of ["weapons", "armor", "tools"]) { tr1(cls.startingProficiencies?.[k]); tr1(cls.multiclassing?.proficienciesGained?.[k]); }
		}
	}
}

// ---- 3a'. 種族／背景／專長中完全比對的句子（含 _copy、_versions；i18n/exact-strings.json） --------
{
	const ex = readI18n(path.join(I18N, "exact-strings.json"));
	const PROPS = new Set(["race", "subrace", "background", "feat"]);
	// name 只在「巢狀的條目」（有 entries）裡翻；replace／names 等是 _copy 用來比對的鍵，不能動
	// _copy 裡的條目名稱會被後續的 _copy 用來比對，一律不翻
	const walk = (v, depth = 0, inCopy = false) => {
		if (typeof v === "string") return ex[v] ?? v;
		if (Array.isArray(v)) { for (let i = 0; i < v.length; ++i) v[i] = walk(v[i], depth + 1, inCopy); return v; }
		if (v && typeof v === "object") {
			for (const k of Object.keys(v)) {
				if (k === "name") continue; // 條目名稱可能被其他 _copy 以英文比對，不動
				if (!["source", "replace", "mode", "prop", "names"].includes(k)) v[k] = walk(v[k], depth + 1, inCopy || k === "_copy");
			}
		}
		return v;
	};
	for (const {json} of loaded) for (const p of PROPS) for (const ent of json[p] || []) walk(ent);
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
			tagNames.set(`${tag}|${lc}|${S(e.source)}`, e.name_zh);
			if (!tagNames.has(`${tag}|${lc}`)) tagNames.set(`${tag}|${lc}`, e.name_zh);
		}
	}
}
let nTagDisplay = 0;
const RE_TAG = /\{@(\w+) ([^{}]*)\}/g;
const fillTags = (str, isOverrideEn = false) => str.replace(RE_TAG, (m, tag, body) => {
	const parts = body.split("|");
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
const RE_ONLY_TAGS = /^[\s\d,;:()+\-–]*(\{@[^{}]+\}[\s\d,;:()+\-–]*)+$/;
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
const SPELL_SUFFIX_ZH = suf => {
	const s = suf.trim().slice(1, -1);
	const parts = s.split(/, | and /).map(p => {
		let m;
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

for (const {file, json} of loaded) {
	walkStrings(json);
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
