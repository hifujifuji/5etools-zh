// 統一體型用語：Huge＝巨型、Gargantuan＝超巨型（對照上游英文逐字串修正 i18n/custom）
import fs from "fs";
import path from "path";
import {UPSTREAM} from "../scripts/util.mjs";
const WRITE = process.argv.includes("--write");
const idx = {};
const walkDir = d => { for (const f of fs.readdirSync(d, {withFileTypes: true})) {
	const p = path.join(d, f.name);
	if (f.isDirectory()) walkDir(p);
	else if (f.name.endsWith(".json")) { let j; try { j = JSON.parse(fs.readFileSync(p, "utf8")); } catch { continue; }
		for (const [prop, arr] of Object.entries(j)) if (Array.isArray(arr)) for (const e of arr) if (e && e.name && e.source) {
			(idx[prop] ??= {})[`${e.name}|${e.source}`] = e;
			if (e.set) idx[prop][`${e.name}|${e.source}|${e.set}`] = e;
			if (e.className) idx[prop][`${e.name}|${e.className}|${e.classSource}|${e.subclassShortName ?? ""}|${e.level}|${e.source}`] = e;
		}
	}
} };
walkDir(path.join(UPSTREAM, "data"));
let n = 0, miss = 0;
const fix = (en, zh, where) => {
	const H = /\bHuge\b/.test(en), G = /\bGargantuan\b/.test(en);
	let out = zh;
	if (H && G) { if (zh.includes("超大型")) out = zh.replace(/(?<!超)巨型/g, "超巨型").replace(/超大型/g, "巨型"); }
	else if (H) out = zh.replace(/超大型/g, "巨型");
	else if (G) { if (!zh.includes("超巨型")) out = zh.replace(/(?<!超)巨型/g, "超巨型"); }
	if (out !== zh) { n++; console.log(where, "\n  EN", en.slice(0, 160), "\n  舊", zh.match(/.{0,14}(超大型|巨型).{0,10}/g)?.join(" … "), "\n  新", out.match(/.{0,14}(超巨型|巨型).{0,10}/g)?.join(" … ")); }
	return out;
};
const walk = (en, zh, where) => {
	if (typeof zh === "string") return typeof en === "string" ? fix(en, zh, where) : zh;
	if (Array.isArray(zh)) { if (!Array.isArray(en)) return zh; return zh.map((v, i) => walk(en[i], v, where)); }
	if (zh && typeof zh === "object") { if (!en || typeof en !== "object") return zh; for (const k of Object.keys(zh)) zh[k] = walk(en[k], zh[k], where); }
	return zh;
};
for (const f of fs.readdirSync("i18n/custom")) {
	const prop = f.replace(".json", ""); const p = "i18n/custom/" + f;
	const txt = fs.readFileSync(p, "utf8");
	if (!/超大型|巨型/.test(txt)) continue;
	const j = JSON.parse(txt); const before = n;
	for (const [k, e] of Object.entries(j)) {
		if (!/超大型|巨型/.test(JSON.stringify(e))) continue;
		const en = idx[prop]?.[k];
		if (!en) { miss++; console.log("找不到上游", prop, k); continue; }
		walk(en, e, `${prop} ${k}`);
	}
	if (WRITE && n > before) fs.writeFileSync(p, JSON.stringify(j, null, "\t") + "\n");
}
console.log("修正", n, "找不到", miss);
