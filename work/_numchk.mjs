// 以數字集合比對英中字串，找出可能錯位的段落
import fs from "fs";
const W = {one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,twice:2,half:0};
const nums = s => new Set((s.replace(/\{@(?:dice|dc|damage|hit|d20)\s+([^}|]+)[^}]*\}/g, " $1 ").replace(/\{@[^}]*\}/g, "").replace(/(\d),(\d)/g, "$1$2").match(/\d+/g) || []));
for (const f of fs.readdirSync("work").filter(f => /^vr-.*\.zh\.json$/.test(f))) {
	const b = f.replace(".zh.json", ""), en = JSON.parse(fs.readFileSync(`work/${b}.en.json`)).items, zh = JSON.parse(fs.readFileSync(`work/${f}`));
	en.forEach((e, i) => e.s.forEach((s, j) => {
		const z = zh[i]?.[j]; if (typeof z !== "string" || s.length < 60) return;
		const a = nums(s), c = nums(z);
		const miss = [...a].filter(x => !c.has(x)), extra = [...c].filter(x => !a.has(x));
		if (miss.length + extra.length >= 2) console.log(`${b} ${i}:${j} ${e.key} en[${[...a]}] zh[${[...c]}]\n  EN ${s.slice(0, 80)}\n  ZH ${z.slice(0, 50)}`);
	}));
}
