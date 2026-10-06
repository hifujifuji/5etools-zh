// 列出 trap／hazard／object 在 dist 殘留的英文字串：node work/_tholeft.mjs <prop> <SRC…>
import fs from "node:fs";
const cjk = s => /[一-鿿]/.test(s);
const SK = ["srd", "srd52", "basicRules", "basicRules2024", "otherSources", "reprintedAs", "tokenUrl", "token", "size", "creatureType", "immune", "resist", "vulnerable", "conditionImmune", "senses", "soundClip", "hasToken", "hasFluff", "hasFluffImages", "tier", "rating", "threat", "level", "tokenCredit", "foundryImg", "name_zh", "ENG_name", "source", "page", "type", "trapHazType", "name"];
const strs = (v, out = [], k = "") => {
	if (typeof v === "string") { if (/[A-Za-z]{3}/.test(v) && !cjk(v)) out.push(`${k}: ${v}`); }
	else if (Array.isArray(v)) v.forEach(x => strs(x, out, k));
	else if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) { if (kk.startsWith("_") && kk !== "_copy") continue; if (SK.includes(kk) && !(kk === "name" && k)) continue; strs(x, out, kk); }
	return out;
};
const [prop, ...srcs] = process.argv.slice(2);
for (const f of ["trapshazards.json", "objects.json"]) {
	const j = JSON.parse(fs.readFileSync(`dist/data/${f}`, "utf8"));
	for (const e of j[prop] || []) {
		if (srcs.length && !srcs.includes(e.source)) continue;
		const s = strs(e);
		console.log(`### ${e.name}|${e.source} ${e.name_zh || "(無中文名)"}${e._copy ? " (copy)" : ""}`);
		s.forEach(x => console.log("  " + x.slice(0, 160)));
	}
}
