// 列出建置結果中職業相關資料仍為英文的字串：node work/_leftcls.mjs > out.txt
import fs from "fs";
const cjk = /[㐀-鿿]/;
const SKIP = new Set(["name", "source", "page", "type", "style", "className", "classSource", "subclassShortName", "subclassSource", "_zhOf", "shortName", "_copy", "additionalSpells", "otherSources", "reprintedAs", "level", "header", "consumes", "ENG_name", "classFeature", "subclassFeature", "classFeatures", "subclassFeatures", "featureType", "hash", "hashes", "colStyles"]);
const out = new Map();
for (const f of fs.readdirSync("dist/data/class").filter(f => /^class-/.test(f))) {
	const j = JSON.parse(fs.readFileSync("dist/data/class/" + f));
	for (const prop of ["class", "subclass", "classFeature", "subclassFeature"]) for (const e of j[prop] || []) {
		if (/^UA/.test(e.source)) continue;
		const w = (v, k) => {
			if (typeof v === "string") {
				if (!cjk.test(v) && /[a-z]{3}/i.test(v.replace(/\{@(?!i |b |bold |italic |note )\w+ [^}]*\}/g, "")) && !/^[^ ]+\|/.test(v) && !/^[^{]*\|[^{]*\|/.test(v)) {
					if (!out.has(v)) out.set(v, `${prop}:${k}:${e.name}|${e.className || ""}|${e.source}`);
				}
			} else if (Array.isArray(v)) v.forEach(x => w(x, k));
			else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) if (!SKIP.has(kk)) w(x, kk);
		};
		w(e);
	}
}
for (const [s, c] of out) console.log(`${c}\t${s}`);
