// 將 hazmole 的扁平 fluff 與上游（多包了 section/entries 外殼）對齊，產生 {upstreamText: zh}
// node work/_salvfl.mjs <batch> <hazmole 檔名> → work/<batch>.salv.json（[{j: zh}]，與 en.items 對齊）
import fs from "fs";
import path from "path";
import {UPSTREAM} from "../scripts/util.mjs";
const [batch, hzFile] = process.argv.slice(2);
const H = JSON.parse(fs.readFileSync(`i18n/hazmole/${hzFile}.json`));
const items = JSON.parse(fs.readFileSync(`work/${batch}.en.json`)).items;
const prop = items[0].prop;
const upFile = prop === "raceFluff" ? "fluff-races.json" : "fluff-backgrounds.json";
const UP = JSON.parse(fs.readFileSync(path.join(UPSTREAM, "data", upFile)))[prop];
const cjk = /[㐀-鿿]/;
// 攤平：沒有名稱的 section/entries 外殼直接展開；圖片、表格等保留為物件
const flat = arr => (arr || []).flatMap(x => (x && typeof x === "object" && !x.name && (x.type === "section" || x.type === "entries") && x.entries) ? flat(x.entries) : [x]);
const nums = s => (String(s).match(/\d+/g) || []).join(",");
let hit = 0, tot = 0; const bad = [];
const out = items.map(it => {
	const m = {};
	const hz = H[it.key];
	const up = UP.find(e => `${e.name}|${e.source}` === it.key);
	if (!hz || !up) return m;
	const map = new Map();
	const align = (u, h) => {
		const U = flat(u), Z = flat(h);
		let i = 0, j = 0;
		while (i < U.length && j < Z.length) {
			const a = U[i], b = Z[j];
			if (typeof a === "string" && typeof b === "string") {
				const r = b.length / a.length;
				const da = String(a).replace(/\{@[^}]*\}/g, "").match(/\d+/g) || [];
				const okNum = da.every(d => b.includes(d));
				if (r > 0.12 && r < 1.0 && cjk.test(b) && okNum) map.set(a, b); else if (r > 0.12 && r < 1.0) bad.push([a.slice(0, 60), b.slice(0, 40)]);
				i++; j++;
			} else if (a && b && typeof a === "object" && typeof b === "object") {
				if (a.name && b.name && cjk.test(b.name)) map.set(a.name, b.name);
				if (a.entries && b.entries) align(a.entries, b.entries);
				if (a.items && b.items) align(a.items, b.items);
				if (a.rows && b.rows) a.rows.forEach((row, k) => b.rows[k] && align(row, b.rows[k]));
				if (a.colLabels && b.colLabels) align(a.colLabels, b.colLabels);
				if (a.caption && b.caption && cjk.test(b.caption)) map.set(a.caption, b.caption);
				i++; j++;
			} else if (typeof a === "string") i++; else j++;
		}
	};
	align(up.entries, hz.entries);
	if (cjk.test(hz.name || "")) map.set(up.name, hz.name);
	it.s.forEach((s, j) => { tot++; if (map.has(s)) { m[j] = map.get(s); hit++; } });
	return m;
});
fs.writeFileSync(`work/${batch}.salv.json`, JSON.stringify(out, null, 1));
console.log(`${batch}: 對上 ${hit}/${tot}，數字不符 ${bad.length}`); bad.slice(0, 8).forEach(x => console.log("  ✗", x.join(" → ")));
