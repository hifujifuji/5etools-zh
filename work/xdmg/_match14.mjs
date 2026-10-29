// 量測 XDMG 與 2014 DMG 逐字相同的字串
import fs from "node:fs";
import {UPSTREAM} from "../../scripts/util.mjs";
const rd = f => JSON.parse(fs.readFileSync(f, "utf8"));
const en14 = rd(`${UPSTREAM}/data/book/book-dmg.json`).data, zh14 = rd("dist/data/book/book-dmg.json").data;
const cjk = s => /[㐀-鿿]/.test(s);
const pair = new Map();
const par = (a, b) => {
	if (typeof a === "string") { if (typeof b === "string" && cjk(b) && b !== a) pair.set(a, b); return; }
	if (Array.isArray(a)) return a.forEach((x, i) => par(x, b?.[i]));
	if (a && typeof a === "object") for (const k of Object.keys(a)) { if (k === "name") { if (b?.name_zh) pair.set(a.name, b.name_zh); } else par(a[k], b?.[k]); }
};
par(en14, zh14);
const norm = s => s.replace(/\{@(\w+) ([^}]*)\}/g, (m, t, x) => `{@${t} ${x.split("|")[0].toLowerCase()}}`).replace(/\s+/g, " ").trim();
const npair = new Map([...pair].map(([a, b]) => [norm(a), b]));
const x = rd(`${UPSTREAM}/data/book/book-xdmg.json`).data;
let tot = 0, ex = 0, nm = 0, chars = 0, mchars = 0; const ex1 = [];
const walk = (o, key) => {
	if (typeof o === "string") { if (key === "type" || o.length < 4) return; tot++; chars += o.length; if (pair.has(o)) { ex++; mchars += o.length; if (o.length > 60 && ex1.length < 8) ex1.push(o.slice(0, 100)); } else if (npair.has(norm(o))) { nm++; mchars += o.length; } return; }
	if (Array.isArray(o)) return o.forEach(v => walk(v, key));
	if (o && typeof o === "object") { if (o.type === "statblock") return; for (const [k, v] of Object.entries(o)) if (!["page", "id", "source", "type", "roll"].includes(k)) walk(v, k); }
};
walk(x);
console.log({pairs: pair.size, tot, ex, nm, chars, mchars});
console.log(ex1.join("\n"));
if (process.argv[2] === "nm") {
	const en14n = new Map([...pair.keys()].map(a => [norm(a), a]));
	let c = 0;
	const w2 = o => { if (typeof o === "string") { if (!pair.has(o) && en14n.has(norm(o)) && /\{@/.test(o) && c++ < 6) console.log("24:", o.slice(0, 200), "\n14:", en14n.get(norm(o)).slice(0, 200), "\nzh:", pair.get(en14n.get(norm(o))).slice(0, 200), "\n"); return; } if (Array.isArray(o)) return o.forEach(w2); if (o && typeof o === "object") Object.values(o).forEach(w2); };
	w2(x);
}
