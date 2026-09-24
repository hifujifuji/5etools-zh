// 把 fluff 批次依剩餘字數切成小批：<batch>-0（已全部可解）、<batch>-1…
import fs from "fs";
import tm from "./_tm.mjs";
import {RC, RULE} from "./_rc.mjs";
import base from "./_fromdist.mjs";
const [b, size = 10000] = process.argv.slice(2);
const en = JSON.parse(fs.readFileSync(`work/${b}.en.json`));
const bs = base(b);
const sv = fs.existsSync(`work/${b}.salv.json`) ? JSON.parse(fs.readFileSync(`work/${b}.salv.json`)) : [];
const groups = [[]]; let cur = 0;
en.items.forEach((it, i) => {
	const len = it.s.reduce((a, s, j) => a + ((bs[i][j] ?? sv[i]?.[j] ?? RC[s] ?? tm[s] ?? RULE(s)) ? 0 : s.length), 0);
	if (!len) { groups[0].push(i); return; }
	if (groups.length === 1 || cur + len > +size) { groups.push([]); cur = 0; }
	groups.at(-1).push(i); cur += len;
});
groups.forEach((g, n) => {
	const name = `${b}-${n}`;
	fs.writeFileSync(`work/${name}.en.json`, JSON.stringify({...en, batch: name, items: g.map(i => en.items[i])}, null, "\t"));
	fs.writeFileSync(`work/${name}.salv.json`, JSON.stringify(g.map(i => sv[i] || {})));
	console.log(name, g.length);
});
