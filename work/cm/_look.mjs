// 查站內既有譯名：node work/cm/_look.mjs 名稱 [名稱…]（搜尋 dist 所有資料的 name → name_zh，不分大小寫）
import fs from "node:fs";
import path from "node:path";
const want = process.argv.slice(2).map(s => s.toLowerCase()), hit = {};
const walk = o => {
	if (Array.isArray(o)) return o.forEach(walk);
	if (!o || typeof o !== "object") return;
	if (typeof o.name === "string" && o.name_zh && want.includes(o.name.toLowerCase())) (hit[o.name] ||= new Set()).add(`${o.name_zh}${o.source ? ` (${o.source})` : ""}`);
	for (const v of Object.values(o)) if (v && typeof v === "object") walk(v);
};
const files = d => fs.readdirSync(d, {withFileTypes: true}).flatMap(f => f.isDirectory() ? files(path.join(d, f.name)) : f.name.endsWith(".json") ? [path.join(d, f.name)] : []);
for (const f of files("dist/data")) { try { walk(JSON.parse(fs.readFileSync(f, "utf8"))); } catch {} }
for (const w of process.argv.slice(2)) console.log(w, "→", [...(hit[Object.keys(hit).find(k => k.toLowerCase() === w.toLowerCase())] || [])].join("；") || "（無）");
