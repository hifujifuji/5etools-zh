// 產生 work/x-mv.tr.json：規則（x-mv.rules.mjs）＋人工譯文（x-mv.manual.json）
import fs from "node:fs";
import {rule} from "./x-mv.rules.mjs";
const en = JSON.parse(fs.readFileSync("work/x-mv.en.json")).items, pre = JSON.parse(fs.readFileSync("work/x-mv.pre.json"));
const man = fs.existsSync("work/x-mv.manual.json") ? JSON.parse(fs.readFileSync("work/x-mv.manual.json")) : {};
const out = {}, seen = {}, left = [];
en.forEach((it, i) => it.s.forEach((s, j) => {
	const id = `${i}.${j}`;
	if (man[id]) {
		if (man[id].startsWith("+")) {
			const parts = s.split(/(?<=[.)]) (?=[A-Z])/); const k = (man[id].match(/^\++/) || [""])[0].length;
			const tail = rule(parts.slice(k).join(" "));
			if (!tail) { left.push(`${id}\t[尾句規則失敗] ${parts.slice(k).join(" ")}`); return; }
			out[id] = man[id].slice(k) + tail;
		} else out[id] = man[id];
		seen[s] = 1; return;
	}
	if (pre[i][j] != null || seen[s]) return;
	const z = rule(s);
	if (z) { out[id] = z; seen[s] = 1; } else { left.push(`${id}\t${s}`); seen[s] = 1; }
}));
fs.writeFileSync("work/x-mv.tr.json", JSON.stringify(out, null, 0));
console.error(`規則＋人工 ${Object.keys(out).length}；尚缺 ${left.length}`);
if (process.argv[2] === "left") console.log(left.map(l => l.slice(0, Number(process.argv[3] || 60))).join("\n"));
