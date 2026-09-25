// 從建置結果撈回已合併的中文（依路徑對應），給 _fillidx 當底：import base from "./_fromdist.mjs"; base(batch) → [{j: zh}]
import fs from "fs";
import path from "path";
import {isTextKey, SKIP_KEYS} from "../scripts/merge.mjs";
import {makeKeyFns, loadSubclassFullNames} from "../scripts/keys.mjs";
const cjk = /[㐀-鿿]/;
const DIST = "dist/data";
const {key} = makeKeyFns(loadSubclassFullNames(DIST));
const RE_ONLY_TAG = /^\s*(\{@[^{}]+\}\s*)+$/;
// 與 tr.mjs 的 collect 相同規則，但同時帶回 dist 端的值
function collect (ent) {
	const out = typeof ent.name === "string" ? [{path: ["name"], isName: true}] : [];
	const walk = (v, p, isText) => {
		if (typeof v === "string") { if (isText && /[A-Za-z]/.test(v) && !RE_ONLY_TAG.test(v)) out.push({path: p}); return; }
		if (Array.isArray(v)) return v.forEach((x, i) => walk(x, [...p, i], isText));
		if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) {
			if (k === "name") { if (p.length && typeof x === "string") out.push({path: [...p, "name"], isName: true}); continue; }
			if (k.startsWith("_") || k === "source" || SKIP_KEYS.has(k)) continue;
			walk(x, [...p, k], isTextKey(k, x));
		}
	};
	for (const [k, x] of Object.entries(ent)) { if (k === "name" || k.startsWith("_") || SKIP_KEYS.has(k)) continue; walk(x, [k], isTextKey(k, x)); }
	return out;
}
const getAt = (o, p) => p.reduce((a, k) => a?.[k], o);
let ents = null;
const load = () => ents ||= fs.readdirSync(path.join(DIST, "class")).filter(f => f.startsWith("class-")).flatMap(f => {
	const j = JSON.parse(fs.readFileSync(path.join(DIST, "class", f)));
	return ["class", "subclass", "classFeature", "subclassFeature"].flatMap(p => (j[p] || []).map(e => [p, e]));
});
import {UPSTREAM} from "../scripts/util.mjs";
// 其他類別：依 prop 載入對應檔案
const EXTRA = {
	item: ["items.json"], baseitem: ["items-base.json"], magicvariant: ["magicvariants.json"], itemGroup: ["items.json"],
	condition: ["conditionsdiseases.json"], disease: ["conditionsdiseases.json"], status: ["conditionsdiseases.json"],
	optionalfeature: ["optionalfeatures.json"], deity: ["deities.json"], reward: ["rewards.json"], trap: ["trapshazards.json"], hazard: ["trapshazards.json"],
	object: ["objects.json"], vehicle: ["vehicles.json"], legendaryGroup: ["bestiary/legendarygroups.json"], itemFluff: ["fluff-items.json"],
};
const extraFiles = (dir, props) => [...new Set(props.flatMap(p => p === "monster" || p === "monsterFluff"
	? fs.readdirSync(path.join(dir, "bestiary")).filter(f => p === "monster" ? /^bestiary-.*\.json$/.test(f) : /^fluff-bestiary-.*\.json$/.test(f)).map(f => path.join("bestiary", f))
	: /^spell/.test(p) ? fs.readdirSync(path.join(dir, "spells")).filter(f => /^spells-.*\.json$/.test(f)).map(f => path.join("spells", f))
	: EXTRA[p] || []))].map(f => path.join(dir, f));
const loadFrom = (dir, props = []) => [
	...fs.readdirSync(path.join(dir, "class")).filter(f => /^(fluff-)?class-/.test(f)).map(f => path.join(dir, "class", f)),
	path.join(dir, "fluff-races.json"), path.join(dir, "fluff-backgrounds.json"),
	...extraFiles(dir, props),
].flatMap(f => {
	const j = JSON.parse(fs.readFileSync(f));
	return ["class", "subclass", "classFeature", "subclassFeature", "classFluff", "subclassFluff", "raceFluff", "backgroundFluff", ...props].flatMap(p => (j[p] || []).map(e => [p, e]));
});
let up = null;
export default batch => {
	const items = JSON.parse(fs.readFileSync(`work/${batch}.en.json`)).items;
	const props = [...new Set(items.map(it => it.prop))];
	up = loadFrom(path.join(UPSTREAM, "data"), props);
	const dist = loadFrom(DIST, props);
	return items.map(it => {
		const ups = up.filter(([p, e]) => p === it.prop && key(p, e) === it.key);
		const ds = dist.filter(([p, e]) => p === it.prop && key(p, e) === it.key);
		for (let n = 0; n < ups.length; ++n) {
			const paths = collect(ups[n][1]);
			if (paths.length !== it.s.length || paths.some((x, j) => (x.isName ? getAt(ups[n][1], x.path) : getAt(ups[n][1], x.path)) !== it.s[j])) continue;
			const e = ds[n]; if (!e) continue;
			const m = {};
			paths.forEach((x, j) => {
				const v = x.isName ? getAt(e[1], [...x.path.slice(0, -1), "name_zh"]) : getAt(e[1], x.path);
				if (typeof v === "string" && cjk.test(v)) m[j] = v;
			});
			return m;
		}
		return {};
	});
};
