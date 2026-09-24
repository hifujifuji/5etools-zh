// 比對上游英文與 dist 譯文（同結構平行走訪），找出數字或標籤目標不一致的字串（可能是舊版譯文或錯位）
import fs from "fs";
import path from "path";
import {UPSTREAM} from "../scripts/util.mjs";
const [file, ...props] = process.argv.slice(2);
const up = JSON.parse(fs.readFileSync(path.join(UPSTREAM, "data", file))), di = JSON.parse(fs.readFileSync(path.join("dist/data", file)));
const nums = s => (s.replace(/([一二兩三四五六七八九十])(?=[點次個環級項種倍輪天小分呎磅])/g, (m, c) => CN[c]).replace(/\{@(?:dice|dc|damage|hit|scaledice|scaledamage)\s+([^}|]+)[^}]*\}/g, " $1 ").replace(/\{@\w+ ([^}|]+)[^}]*\}/g, "").replace(/(\d),(\d)/g, "$1$2").match(/\d+/g) || []).sort().join(",");
const SKIPT = /^(filter|book|adventure|area|link|5etools|note|i|b|bold|italic|footnote|quickref|hazard|table|dice|dc|damage|hit|scaledice|scaledamage|d20|chance)$/;
const tags = s => (s.match(/\{@(\w+) ([^}|]+)/g) || []).filter(t => !SKIPT.test(t.slice(2).split(" ")[0])).map(t => t.toLowerCase().replace(/\s+/g, " ")).sort().join(";");
const CN = {一: 1, 二: 2, 兩: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10};
let n = 0;
for (const p of props) for (let i = 0; i < (up[p] || []).length; i++) {
	const a = up[p][i], b = di[p][i];
	if (!b || a.name !== b.name) continue;
	const walk = (x, y, where) => {
		if (typeof x === "string" && typeof y === "string") {
			if (x === y || !/[一-龥]/.test(y)) return;
			const bad = [];
			{ const zs = nums(y).split(","); const miss = nums(x).split(",").filter(v => v && !zs.includes(v)); if (miss.length) bad.push(`缺數字 ${miss}`); }
			if (tags(x) !== tags(y) && tags(y)) bad.push(`標籤`);
			if (bad.length) { n++; console.log(`${p}:${a.name}|${a.source} ${where} ${bad.join(" ")}\n  EN ${x.slice(0, 110)}\n  ZH ${y.slice(0, 70)}`); }
			return;
		}
		if (Array.isArray(x) && Array.isArray(y)) x.forEach((v, k) => walk(v, y[k], where));
		else if (x && y && typeof x === "object" && typeof y === "object") for (const k of Object.keys(x)) if (!k.startsWith("_")) walk(x[k], y[k], x.name ? `[${x.name}]` : where);
	};
	walk(a.entries, b.entries, "");
}
console.error("共", n);
