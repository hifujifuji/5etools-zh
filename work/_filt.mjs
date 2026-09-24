// 把匯出批次過濾成「建置結果中仍有英文」的實體（避免覆蓋已完成的 hazmole 翻譯）
import fs from "fs";
import path from "path";
import {makeKeyFns, loadSubclassFullNames} from "../scripts/keys.mjs";
const cjk = /[㐀-鿿]/;
const SKIP = new Set(["name", "source", "page", "type", "style", "className", "classSource", "subclassShortName", "subclassSource", "_zhOf", "shortName", "_copy", "additionalSpells", "otherSources", "reprintedAs", "level", "header", "consumes"]);
const eng = o => { let n = 0; const w = v => { if (typeof v === "string") { if (!cjk.test(v) && /[a-z]{2,} [a-z]{2,} [a-z]{2,}/i.test(v)) n += v.length; } else if (Array.isArray(v)) v.forEach(w); else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (!SKIP.has(k)) w(x); }; w(o); return n; };
const DIST = "dist/data";
const {key} = makeKeyFns(loadSubclassFullNames(DIST));
const need = new Set();
for (const f of fs.readdirSync(path.join(DIST, "class")).filter(f => /^class-/.test(f))) {
	const j = JSON.parse(fs.readFileSync(path.join(DIST, "class", f)));
	for (const prop of ["subclassFeature", "classFeature", "subclass"]) for (const e of j[prop] || []) {
		if (eng(e) || !e.name_zh) need.add(key(prop, e));
	}
}
for (const b of process.argv.slice(2)) {
	const p = `work/${b}.en.json`;
	const j = JSON.parse(fs.readFileSync(p));
	const before = j.items.length;
	j.items = j.items.filter(it => need.has(it.key));
	fs.writeFileSync(p, JSON.stringify(j, null, "\t"));
	console.log(b, before, "→", j.items.length, j.items.reduce((a, it) => a + it.s.join("").length, 0), "字元");
}
