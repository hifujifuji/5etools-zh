// 列出尚無中文內文的 trap／hazard／object（供撰寫中文簡介時核對事實）：node work/_thodump.mjs [prop] [SRC…]
import fs from "node:fs";
const cjk = s => /[一-鿿]/.test(s);
const [prop, ...srcs] = process.argv.slice(2);
const flat = v => typeof v === "string" ? v : Array.isArray(v) ? v.map(flat).join(" / ") : v && typeof v === "object" ? [v.name && `【${v.name}】`, flat(v.entries || v.items || v.rows || ""), v.colLabels ? `(欄:${v.colLabels.join(",")})` : "", v.entry ? flat(v.entry) : ""].filter(Boolean).join(" ") : String(v ?? "");
for (const [f, ps] of [["trapshazards.json", ["trap", "hazard"]], ["objects.json", ["object"]]]) {
	const j = JSON.parse(fs.readFileSync(`dist/data/${f}`, "utf8"));
	for (const p of ps) for (const e of j[p]) {
		if (prop && p !== prop) continue;
		if (srcs.length && !srcs.includes(e.source)) continue;
		const body = flat([e.entries, e.actionEntries, e._copy?._mod].filter(Boolean));
		if (cjk(body)) continue;
		const meta = ["size", "objectType", "ac", "hp", "immune", "trapHazType", "trigger", "effect", "initiative", "eActive", "eDynamic", "eConstant", "countermeasures"].filter(k => e[k] != null).map(k => `${k}=${flat(e[k])}`).join("; ");
		console.log(`### ${p} | ${e.name}|${e.source} ${e.name_zh || ""}${e._copy ? ` (copy ${e._copy.name}|${e._copy.source})` : ""}\n${meta}\n${body}\n`);
	}
}
