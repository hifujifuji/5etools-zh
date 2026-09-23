// 從 hazmole/TheGiddyLimit.github.io（2021 年的中文 5etools）抽取翻譯，
// 整理成以「英文名稱|來源」為 key 的對照表，存到 i18n/hazmole/。
//
// 用法：node scripts/extract-hazmole.mjs <hazmole repo 路徑>

import fs from "node:fs";
import path from "node:path";
import {ROOT, readJson, writeJson, hasCjk} from "./util.mjs";

const HAZ = process.argv[2];
if (!HAZ || !fs.existsSync(path.join(HAZ, "data"))) {
	console.error("用法：node scripts/extract-hazmole.mjs <hazmole repo 路徑>");
	process.exit(1);
}
const D = p => path.join(HAZ, "data", p);
const OUT = path.join(ROOT, "i18n", "hazmole");

const engOf = o => (o.ENG_name ?? o.tENG_name ?? "").trim();
const src = s => (s || "").toUpperCase();

/** prop -> { key -> zhObj } */
const ents = {};
const put = (prop, key, obj) => {
	(ents[prop] ||= {});
	if (!(key in ents[prop])) ents[prop][key] = obj;
};

const readSafe = f => {
	try { return readJson(f); } catch { return null; }
};

// ---- 一般實體 -------------------------------------------------------------
const PROP_REMAP = {basicitem: "baseitem", variant: "magicvariant", invocation: "optionalfeature", ship: "vehicle"};
const SIMPLE_FILES = [
	"items.json", "basicitems.json", "magicvariants.json", "races.json", "backgrounds.json", "feats.json",
	"optionalfeatures.json", "invocations.json", "conditionsdiseases.json", "deities.json", "trapshazards.json",
	"rewards.json", "objects.json", "variantrules.json", "cultsboons.json", "psionics.json", "ships.json",
	"bestiary/meta.json",
	...fs.readdirSync(D("spells")).filter(f => f.startsWith("spells-")).map(f => `spells/${f}`),
	...fs.readdirSync(D("bestiary")).filter(f => f.startsWith("bestiary-")).map(f => `bestiary/${f}`),
];

const entKey = (prop, o) => {
	const eng = engOf(o);
	if (prop === "deity") return `${eng}|${src(o.source)}|${o.pantheon || ""}`;
	if (prop === "magicvariant") return `${eng}|${src(o.inherits?.source || o.source)}`;
	return `${eng}|${src(o.source)}`;
};

for (const f of SIMPLE_FILES) {
	const json = readSafe(D(f));
	if (!json) continue;
	for (const [rawProp, arr] of Object.entries(json)) {
		if (!Array.isArray(arr)) continue;
		const prop = PROP_REMAP[rawProp] || rawProp;
		for (const o of arr) {
			if (!o || typeof o !== "object" || !engOf(o) || !hasCjk(o.name)) continue;
			put(prop, entKey(prop, o), o);
			// 舊版把亞種放在種族底下
			if (prop === "race" && Array.isArray(o.subraces)) {
				for (const sr of o.subraces) {
					if (!sr || !engOf(sr)) continue;
					put("subrace", `${engOf(o)}|${engOf(sr)}|${src(sr.source || o.source)}`, sr);
				}
			}
		}
	}
}

// ---- 背景故事（fluff） -----------------------------------------------------
const FLUFF_FILES = ["fluff-items.json", "fluff-races.json", "fluff-backgrounds.json",
	...fs.readdirSync(D("bestiary")).filter(f => f.startsWith("fluff-bestiary-")).map(f => `bestiary/${f}`)];
for (const f of FLUFF_FILES) {
	const json = readSafe(D(f));
	if (!json) continue;
	for (const [prop, arr] of Object.entries(json)) {
		if (!Array.isArray(arr)) continue;
		for (const o of arr) {
			if (!o?.name || !hasCjk(JSON.stringify(o.entries || ""))) continue;
			// fluff 的 name 可能是中文或英文
			const eng = engOf(o) || o.name;
			if (hasCjk(eng)) continue;
			put(`fluff-${prop}`, `${eng}|${src(o.source)}`, o);
		}
	}
}

// ---- 職業 -----------------------------------------------------------------
// 舊格式：classFeatures[等級-1] = [特性...]；subclasses[].subclassFeatures[i] = [特性...]
// 新格式：classFeature / subclassFeature 各自獨立，所以這裡把特性攤平。
const collectNamed = (entries, out) => {
	for (const e of entries || []) {
		if (!e || typeof e !== "object") continue;
		if (engOf(e) && hasCjk(e.name)) out.push(e);
		if (Array.isArray(e.entries)) collectNamed(e.entries, out);
	}
};
for (const f of fs.readdirSync(D("class")).filter(f => f.startsWith("class-"))) {
	const json = readSafe(D(`class/${f}`));
	for (const cls of json?.class || []) {
		const clsEng = engOf(cls);
		if (!clsEng) continue;
		const clsSrc = src(cls.source);
		put("class", `${clsEng}|${clsSrc}`, cls);
		(cls.classFeatures || []).forEach((lvlFeatures, ixLvl) => {
			for (const feat of lvlFeatures || []) {
				if (!feat || !engOf(feat)) continue;
				put("classFeature", `${engOf(feat)}|${clsEng}|${clsSrc}|${ixLvl + 1}`, feat);
			}
		});
		for (const sc of cls.subclasses || []) {
			// 舊版 shortName 被翻成中文了，改用完整英文名（新版 subclass.name）當 key
			const scEng = engOf(sc);
			if (!scEng) continue;
			put("subclass", `${scEng}|${clsEng}`, sc);
			const named = [];
			for (const grp of sc.subclassFeatures || []) collectNamed(grp, named);
			for (const feat of named) put("subclassFeature", `${engOf(feat)}|${clsEng}|${scEng}`, feat);
		}
	}
}

// ---- 書籍 -----------------------------------------------------------------
for (const f of fs.readdirSync(D("book"))) {
	const json = readSafe(D(`book/${f}`));
	if (!json?.data || !hasCjk(JSON.stringify(json.data))) continue;
	const id = f.replace(/^book-|\.json$/g, "").toUpperCase();
	put("book", id, json.data);
}
const books = readSafe(D("books.json"));
for (const b of books?.book || []) if (hasCjk(b.name)) put("bookMeta", src(b.id), b);

// ---- 詞彙表：{@tag 中文} → 英文 ----------------------------------------------
const TAG_OF_PROP = {
	spell: "spell", monster: "creature", item: "item", baseitem: "item", magicvariant: "item", itemGroup: "item",
	race: "race", background: "background", feat: "feat", optionalfeature: "optfeature",
	condition: "condition", disease: "disease", deity: "deity", trap: "trap", hazard: "hazard",
	reward: "reward", object: "object", variantrule: "variantrule", cult: "cult", boon: "boon",
	psionic: "psionic", vehicle: "vehicle", class: "class", legendaryGroup: "legroup",
};
const glossary = {};
const names = {};
// 亞種：{@race 矮人(丘陵)} → Dwarf (Hill)
for (const [key, sr] of Object.entries(ents.subrace || {})) {
	const [raceEng, subEng] = key.split("|");
	const race = Object.values(ents.race).find(r => engOf(r) === raceEng);
	if (!race || !hasCjk(sr.name)) continue;
	(glossary.race ||= {})[`${race.name.trim()}(${sr.name.trim()})`] = `${raceEng} (${subEng})`;
}
for (const [prop, map] of Object.entries(ents)) {
	for (const o of Object.values(map)) {
		if (!o || Array.isArray(o) || !hasCjk(o.name)) continue;
		const eng = engOf(o);
		const tag = TAG_OF_PROP[prop];
		if (tag) ((glossary[tag] ||= {})[o.name.trim()] ||= eng);
		// 通用名稱字典（新版同名項目，例如 2024 版法術，至少能顯示中文名）
		const k = eng.toLowerCase();
		if (!["classFeature", "subclassFeature", "subrace"].includes(prop)) ((names[prop] ||= {})[k] ||= o.name.trim());
	}
}

fs.rmSync(OUT, {recursive: true, force: true});
for (const [prop, map] of Object.entries(ents)) writeJson(path.join(OUT, `${prop}.json`), map);
writeJson(path.join(OUT, "_glossary.json"), glossary);
writeJson(path.join(OUT, "_names.json"), names);

for (const [prop, map] of Object.entries(ents)) console.log(`${prop.padEnd(20)} ${Object.keys(map).length}`);
