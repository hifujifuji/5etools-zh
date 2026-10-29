// 列出某章尚未有中文的正文字串：node work/xdmg/_paradump.mjs <章序（從 0 起）>  → work/xdmg/_ch<N>para.txt
import fs from "node:fs";
import {UPSTREAM} from "../../scripts/util.mjs";
const ci = +process.argv[2];
const en = JSON.parse(fs.readFileSync(`${UPSTREAM}/data/book/book-xdmg.json`)).data[ci];
const zh = JSON.parse(fs.readFileSync("dist/data/book/book-xdmg.json")).data[ci];
const cj = /[㐀-鿿]/, out = [], seen = new Set();
const SKIP = ["type", "name", "page", "id", "source", "roll", "style", "href", "path", "credit"];
const par = (a, b, k) => {
	if (typeof a === "string") {
		if (SKIP.includes(k) || /^(col-|list-|book\/|pdf\/)/.test(a)) return;
		if (!(typeof b === "string" && cj.test(b)) && !seen.has(a) && /[a-z]{3}/i.test(a)) { seen.add(a); out.push(a); }
		return;
	}
	if (Array.isArray(a)) { const off = Array.isArray(b) && b[0]?.name === "中文簡介" ? 1 : 0; return a.forEach((x, i) => par(x, b?.[i + off], k)); }
	if (a && typeof a === "object") { if (a.type === "statblock") return; for (const kk of Object.keys(a)) par(a[kk], b?.[kk], kk); }
};
par(en, zh);
fs.writeFileSync(`work/xdmg/_ch${ci + 1}para.txt`, out.map((s, i) => `${i}\t${s}`).join("\n"));
console.log(out.length, out.join("").length);
