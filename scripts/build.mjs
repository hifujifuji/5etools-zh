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
const loadDir = dir => {
	const out = {};
	if (!fs.existsSync(dir)) return out;
	for (const f of fs.readdirSync(dir)) {
		if (!f.endsWith(".json") || f.startsWith("_")) continue;
		out[f.replace(/\.json$/, "")] = readJson(path.join(dir, f));
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
		for (const [k, v] of Object.entries(readJson(p))) Object.assign(target[k] ||= {}, v);
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
	if (!ent || typeof ent !== "object" || typeof ent.name !== "string") return;
	bump(prop, "total");
	const trProp = FLUFF_PROP[prop] || prop;
	const old = [keyOf(prop, ent), ...altKeys(prop, ent)].map(k => tr[trProp]?.[k]).find(Boolean);
	if (old) {
		merger.mergeEntity(ent, old);
		if (ent.name_zh) { bump(prop, "full"); return; }
	}
	if (FLUFF_PROP[prop]) return;
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
const fillTags = str => str.replace(RE_TAG, (m, tag, body) => {
	const parts = body.split("|");
	if (parts[2] || hasCjk(parts[0])) return m;
	const lc = parts[0].trim().toLowerCase();
	const zh = tagNames.get(`${tag}|${lc}|${S(parts[1])}`) ?? tagNames.get(`${tag}|${lc}`);
	if (!zh) return m;
	while (parts.length < 2) parts.push("");
	parts[2] = zh;
	nTagDisplay++;
	return `{@${tag} ${parts.join("|")}}`;
});
const walkStrings = v => {
	if (typeof v === "string") return hasCjk(v) && v.includes("{@") ? fillTags(v) : v;
	if (Array.isArray(v)) { for (let i = 0; i < v.length; ++i) v[i] = walkStrings(v[i]); return v; }
	if (v && typeof v === "object") { for (const k of Object.keys(v)) if (k !== "name") v[k] = walkStrings(v[k]); return v; }
	return v;
};
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
