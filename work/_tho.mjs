// 統計 trap／hazard／object 在 dist 的翻譯狀態：node work/_tho.mjs
import fs from "node:fs";
const cjk = s => /[一-鿿]/.test(s);
const strs = (v, out = [], k = "") => {
	if (typeof v === "string") { if (!["source", "page", "type", "trapHazType", "name", "ENG_name"].includes(k) && /[A-Za-z]{3}/.test(v)) out.push(v); }
	else if (Array.isArray(v)) v.forEach(x => strs(x, out, k));
	else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) { if (kk.startsWith("_") && kk !== "_copy") continue; if (["srd", "srd52", "basicRules", "basicRules2024", "otherSources", "reprintedAs", "tokenUrl", "token", "size", "creatureType", "immune", "resist", "vulnerable", "conditionImmune", "senses", "soundClip", "hasToken", "hasFluff", "hasFluffImages", "tier", "rating", "threat", "level", "tokenCredit", "foundryImg", "name_zh", "ENG_name"].includes(kk)) continue; strs(x, out, kk); }
	return out;
};
for (const [f, props] of [["trapshazards.json", ["trap", "hazard"]], ["objects.json", ["object"]]]) {
	const j = JSON.parse(fs.readFileSync(`dist/data/${f}`, "utf8"));
	for (const p of props) {
		const by = {};
		for (const e of j[p] || []) {
			const s = strs(e); const en = s.filter(x => !cjk(x));
			const b = by[e.source] ||= {n: 0, name: 0, full: 0, ch: 0};
			b.n++; if (e.name_zh || cjk(e.name)) b.name++; if (!en.length) b.full++; b.ch += en.join("").length;
		}
		console.log(p, Object.values(by).reduce((a, b) => a + b.n, 0));
		for (const [s, b] of Object.entries(by)) console.log(`  ${s.padEnd(8)} n=${b.n} 名=${b.name} 全=${b.full} 英文字元=${b.ch}`);
	}
}
