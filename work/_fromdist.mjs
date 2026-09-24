// 從建置結果撈回已合併的中文（依路徑對應），給 _fillidx 當底：import base from "./_fromdist.mjs"; base(batch) → [{j: zh}]
import fs from "fs";
import path from "path";
import {TEXT_KEYS, SKIP_KEYS} from "../scripts/merge.mjs";
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
			walk(x, [...p, k], TEXT_KEYS.has(k));
		}
	};
	for (const [k, x] of Object.entries(ent)) { if (k === "name" || k.startsWith("_") || SKIP_KEYS.has(k)) continue; walk(x, [k], TEXT_KEYS.has(k)); }
	return out;
}
const getAt = (o, p) => p.reduce((a, k) => a?.[k], o);
let ents = null;
const load = () => ents ||= fs.readdirSync(path.join(DIST, "class")).filter(f => f.startsWith("class-")).flatMap(f => {
	const j = JSON.parse(fs.readFileSync(path.join(DIST, "class", f)));
	return ["class", "subclass", "classFeature", "subclassFeature"].flatMap(p => (j[p] || []).map(e => [p, e]));
});
import {UPSTREAM} from "../scripts/util.mjs";
const loadFrom = dir => fs.readdirSync(path.join(dir, "class")).filter(f => /^(fluff-)?class-/.test(f)).flatMap(f => {
	const j = JSON.parse(fs.readFileSync(path.join(dir, "class", f)));
	return ["class", "subclass", "classFeature", "subclassFeature", "classFluff", "subclassFluff"].flatMap(p => (j[p] || []).map(e => [p, e]));
});
let up = null;
export default batch => {
	const items = JSON.parse(fs.readFileSync(`work/${batch}.en.json`)).items;
	up ||= loadFrom(path.join(UPSTREAM, "data"));
	const dist = loadFrom(DIST);
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
