// 補翻工具：把上游英文資料匯出成翻譯表，翻好後匯入成 i18n/custom/<prop>.json。
//
//   node scripts/tr.mjs export <批次名> --prop spell --source XPHB [--class Wizard] [--from 0 --to 40] [--name 正規式]
//     → work/<批次名>.en.json：每個實體一組英文字串（第一個是名稱）
//   翻譯：建立 work/<批次名>.zh.json，格式 { "<key>": ["中文名", "中文字串", ...] }，順序、數量與 en 相同
//         （也可以直接寫成與 en.items 同順序的陣列：[ ["中文名", ...], ... ]）
//   node scripts/tr.mjs import <批次名>
//     → 檢查數量與 {@標籤} 是否一致，寫入 i18n/custom/<prop>.json
//   node scripts/tr.mjs status   各類別 2024 內容的翻譯進度
//
// 標籤請原樣保留（例如 {@spell Fireball|XPHB}）；建置時會自動在中文句子裡的標籤補上中文名。
// 標籤的顯示文字（第三段）可以翻，例如 {@variantrule Emanation [Area of Effect]|XPHB|散發}。

import fs from "node:fs";
import path from "node:path";
import {ROOT, UPSTREAM, readJson, writeJson, hasCjk} from "./util.mjs";
import {TEXT_KEYS, SKIP_KEYS} from "./merge.mjs";
import {S, makeKeyFns, loadSubclassFullNames} from "./keys.mjs";

const DATA = path.join(UPSTREAM, "data");
const WORK = path.join(ROOT, "work");
const CUSTOM = path.join(ROOT, "i18n", "custom");

const [cmd, batch, ...rest] = process.argv.slice(2);
const opts = {};
for (let i = 0; i < rest.length; i += 2) opts[rest[i].replace(/^--/, "")] = rest[i + 1];

const {key: keyOf} = makeKeyFns(loadSubclassFullNames(DATA));

// ---- 資料來源 ---------------------------------------------------------------
const FILES_BY_PROP = {
	spell: () => fs.readdirSync(path.join(DATA, "spells")).filter(f => f.startsWith("spells-")).map(f => `spells/${f}`),
	feat: () => ["feats.json"],
	optionalfeature: () => ["optionalfeatures.json"],
	background: () => ["backgrounds.json"],
	race: () => ["races.json"],
	item: () => ["items.json"],
	baseitem: () => ["items-base.json"],
	itemType: () => ["items-base.json"],
	itemMastery: () => ["items-base.json"],
	itemProperty: () => ["items-base.json"],
	itemGroup: () => ["items.json"],
	itemEntry: () => ["items-base.json"],
	itemTypeAdditionalEntries: () => ["items-base.json"],
	variantrule: () => ["variantrules.json"],
	action: () => ["actions.json"],
	condition: () => ["conditionsdiseases.json"],
	disease: () => ["conditionsdiseases.json"],
	status: () => ["conditionsdiseases.json"],
};
const CLASS_PROPS = new Set(["class", "subclass", "classFeature", "subclassFeature"]);

const _cacheEnts = {};
function loadEntities (prop) {
	return _cacheEnts[prop] ||= _loadEntities(prop);
}
function _loadEntities (prop) {
	const files = CLASS_PROPS.has(prop)
		? fs.readdirSync(path.join(DATA, "class")).filter(f => f.startsWith("class-")).map(f => `class/${f}`)
		: FILES_BY_PROP[prop]?.() || [];
	return files.flatMap(f => readJson(path.join(DATA, f))[prop] || []);
}

// ---- 走訪文字（與 merge.mjs 的規則一致） ---------------------------------------
// 回傳 [{path, text, isName}]；純數字、純標籤的字串不用翻，略過
const RE_ONLY_TAG = /^\s*(\{@[^{}]+\}\s*)+$/;
function collect (ent) {
	// itemProperty 沒有頂層名稱（名稱在 entries[0].name）
	const out = typeof ent.name === "string" ? [{path: ["name"], text: ent.name, isName: true}] : [];
	const walk = (v, p, isText) => {
		if (typeof v === "string") {
			if (isText && /[A-Za-z]/.test(v) && !RE_ONLY_TAG.test(v)) out.push({path: p, text: v});
			return;
		}
		if (Array.isArray(v)) return v.forEach((x, i) => walk(x, [...p, i], isText));
		if (v && typeof v === "object") {
			for (const [k, x] of Object.entries(v)) {
				if (k === "name") {
					if (p.length && typeof x === "string") out.push({path: [...p, "name"], text: x, isName: true});
					continue;
				}
				if (k.startsWith("_") || k === "source" || SKIP_KEYS.has(k)) continue;
				walk(x, [...p, k], TEXT_KEYS.has(k));
			}
		}
	};
	for (const [k, x] of Object.entries(ent)) {
		if (k === "name" || k.startsWith("_") || SKIP_KEYS.has(k)) continue;
		walk(x, [k], TEXT_KEYS.has(k));
	}
	return out;
}

const getAt = (o, p) => p.reduce((a, k) => a?.[k], o);
const setAt = (o, p, v) => { getAt(o, p.slice(0, -1))[p.at(-1)] = v; };

// ---- 名稱提示：已知的中文名（hazmole、已補翻、手動詞彙） ---------------------------
function loadNameHints () {
	const hints = {};
	const add = (en, zh) => { if (en && hasCjk(zh)) hints[en.toLowerCase()] ||= zh.trim(); };
	for (const layer of ["custom", "hazmole"]) {
		const dir = path.join(ROOT, "i18n", layer);
		if (!fs.existsSync(dir)) continue;
		for (const f of fs.readdirSync(dir)) {
			if (!f.endsWith(".json") || f.startsWith("_") || f === "book.json") continue;
			const map = readJson(path.join(dir, f));
			for (const o of Object.values(map)) {
				if (!o || Array.isArray(o)) continue;
				add(o.ENG_name, o.name);
				JSON.stringify(o, (k, v) => { if (v && typeof v === "object" && !Array.isArray(v) && v.ENG_name) add(v.ENG_name, v.name); return v; });
			}
		}
	}
	const g = readJson(path.join(ROOT, "i18n", "glossary.json"));
	for (const map of Object.values(g.names || {})) for (const [en, zh] of Object.entries(map)) add(en, zh);
	return hints;
}

// ---- 標籤檢查 ---------------------------------------------------------------
const DISPLAY_FIRST = new Set(["filter", "book", "adventure", "5etools", "link", "footnote", "homebrew", "quickref", "i", "b", "u", "s", "italic", "bold", "underline", "strike", "note", "sup", "sub", "code", "color", "highlight", "help", "style", "font", "kbd", "tip", "unit"]);
const tagSig = s => [...s.matchAll(/\{@(\w+)\s([^{}]*)\}/g)]
	.map(m => DISPLAY_FIRST.has(m[1]) ? `@${m[1]}` : `@${m[1]} ${m[2].split("|")[0].trim().toLowerCase()}`)
	.filter((x, i, a) => a.indexOf(x) === i).sort().join("\n"); // 重複的連結標籤在中文裡合併掉沒關係，所以比「集合」
const fmtSig = s => [...new Set([...s.matchAll(/\{@(\w+)/g)].map(m => m[1]))].sort().join(",");

// ---- 指令 -------------------------------------------------------------------
if (cmd === "export") {
	if (!batch || !opts.prop) throw new Error("用法：export <批次名> --prop <prop> [--source XPHB] [--class X] [--from N --to M] [--name 正規式]");
	const props = opts.prop.split(",");
	const reName = opts.name ? new RegExp(opts.name, "i") : null;
	let ents = [];
	for (const prop of props) {
		for (const e of loadEntities(prop)) {
			if (opts.source && S(e.source) !== S(opts.source)) continue;
			if (opts.class && (e.className || e.name) !== opts.class) continue;
			if (reName && !reName.test(e.name || e.abbreviation)) continue;
			ents.push({prop, e});
		}
	}
	ents.sort((a, b) => props.indexOf(a.prop) - props.indexOf(b.prop) || (a.e.level || 0) - (b.e.level || 0) || (a.e.name || a.e.abbreviation).localeCompare(b.e.name || b.e.abbreviation));
	if (opts.from != null || opts.to != null) ents = ents.slice(Number(opts.from || 0), opts.to != null ? Number(opts.to) : undefined);

	const hints = loadNameHints();
	const items = ents.map(({prop, e}) => {
		const strs = collect(e);
		const names = [...new Set(strs.filter(x => x.isName).map(x => x.text))];
		const hint = Object.fromEntries(names.map(n => [n, hints[n.toLowerCase()]]).filter(([, v]) => v));
		return {prop, key: keyOf(prop, e), ...(Object.keys(hint).length ? {hint} : {}), s: strs.map(x => x.text)};
	});
	fs.mkdirSync(WORK, {recursive: true});
	writeJson(path.join(WORK, `${batch}.en.json`), {batch, items});
	const nChars = items.reduce((a, it) => a + it.s.join("").length, 0);
	console.log(`匯出 ${items.length} 筆、${nChars} 字元 → work/${batch}.en.json`);
} else if (cmd === "import") {
	const en = readJson(path.join(WORK, `${batch}.en.json`));
	const zh = readJson(path.join(WORK, `${batch}.zh.json`));
	const byProp = {};
	const problems = [];
	const warnings = [];
	// zh 檔可以是 { key: [...] }，也可以是與 en.items 同順序的陣列
	for (const [ixItem, it] of en.items.entries()) {
		const tr = Array.isArray(zh) ? zh[ixItem] : zh[it.key];
		if (!tr) { problems.push(`缺少：${it.key}`); continue; }
		if (tr.length !== it.s.length) { problems.push(`${it.key}：字串數量 ${tr.length} ≠ ${it.s.length}`); continue; }
		const ent = loadEntities(it.prop).find(e => keyOf(it.prop, e) === it.key);
		if (!ent) { problems.push(`上游找不到：${it.key}`); continue; }
		const strs = collect(ent);
		const cpy = structuredClone(ent);
		let bad = false;
		strs.forEach((x, i) => {
			if (x.text !== it.s[i]) { bad = true; return; }
			const z = tr[i];
			if (tagSig(z) !== tagSig(x.text) || fmtSig(z) !== fmtSig(x.text)) warnings.push(`${it.key} #${i}：標籤不一致\n    en: ${x.text}\n    zh: ${z}`);
			if (x.isName) {
				const obj = x.path.length === 1 ? cpy : getAt(cpy, x.path.slice(0, -1));
				obj.ENG_name = x.text;
				obj.name = z;
			} else setAt(cpy, x.path, z);
		});
		if (bad) { problems.push(`${it.key}：上游資料已變動，請重新匯出`); continue; }
		(byProp[it.prop] ||= {})[it.key] = cpy;
	}
	for (const [prop, map] of Object.entries(byProp)) {
		const f = path.join(CUSTOM, `${prop}.json`);
		const cur = fs.existsSync(f) ? readJson(f) : {};
		Object.assign(cur, map);
		writeJson(f, Object.fromEntries(Object.entries(cur).sort(([a], [b]) => a.localeCompare(b))));
		console.log(`${prop}：寫入 ${Object.keys(map).length} 筆（共 ${Object.keys(cur).length} 筆）`);
	}
	if (warnings.length) console.log(`\n${warnings.length} 個警告（請確認沒有漏掉標籤）：\n${warnings.join("\n")}`);
	if (problems.length) { console.log(`\n${problems.length} 個問題：\n${problems.join("\n")}`); process.exitCode = 1; }
} else if (cmd === "print") {
	// 精簡檢視：每筆一行 JSON，方便翻譯時對照
	const en = readJson(path.join(WORK, `${batch}.en.json`));
	en.items.forEach((it, i) => console.log(`#${i} ${it.key}${it.hint ? ` 提示:${JSON.stringify(it.hint)}` : ""}\n${JSON.stringify(it.s)}`));
} else if (cmd === "status") {
	for (const prop of ["class", "subclass", "classFeature", "subclassFeature", "spell", "feat", "baseitem", "item", "itemType", "itemMastery", "itemProperty"]) {
		const f = path.join(CUSTOM, `${prop}.json`);
		const done = fs.existsSync(f) ? readJson(f) : {};
		const ents = loadEntities(prop).filter(e => SOURCES_2024_OR(e) || (opts.all && S(e.source) === "XDMG"));
		const n = ents.filter(e => done[keyOf(prop, e)]).length;
		console.log(`${prop.padEnd(16)} ${String(n).padStart(4)} / ${ents.length}`);
	}
} else {
	console.log("用法：node scripts/tr.mjs export|import|status …（見檔頭說明）");
}

function SOURCES_2024_OR (e) { return S(e.source) === "XPHB"; }

