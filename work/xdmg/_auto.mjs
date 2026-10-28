// 用 dist 資料中已有的 name → name_zh 自動填 XDMG 標題
import fs from "fs"; import path from "path";
const DIST = "dist/data", map = {};
const walk = (o) => {
	if (Array.isArray(o)) return o.forEach(walk);
	if (!o || typeof o !== "object") return;
	if (typeof o.name === "string" && typeof o.name_zh === "string" && o._zhOf === o.name) (map[o.name.toLowerCase()] ||= {})[o.name_zh] = ((map[o.name.toLowerCase()] || {})[o.name_zh] || 0) + 1;
	for (const v of Object.values(o)) walk(v);
};
const files = d => fs.readdirSync(d, {withFileTypes: true}).flatMap(f => f.isDirectory() ? files(path.join(d, f.name)) : f.name.endsWith(".json") ? [path.join(d, f.name)] : []);
for (const f of files(DIST)) { if (f.includes("book-xdmg") || f.includes("foundry")) continue; try { walk(JSON.parse(fs.readFileSync(f, "utf8"))); } catch {} }
const names = JSON.parse(fs.readFileSync("work/xdmg/_names-en.json", "utf8"));
const out = {}, left = [];
for (const n of names) {
	const m = map[n.toLowerCase()];
	if (m) out[n] = Object.entries(m).sort((a, b) => b[1] - a[1])[0][0]; else left.push(n);
}
fs.writeFileSync("work/xdmg/_auto.json", JSON.stringify(out, null, "\t"));
fs.writeFileSync("work/xdmg/_left.json", JSON.stringify(left, null, 0));
console.log("auto", Object.keys(out).length, "left", left.length);
