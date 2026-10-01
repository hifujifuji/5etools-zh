// node work/cd/_show.mjs <牌組名> [來源]：列出該牌組還缺翻譯的字串
import {EN, tr} from "./_c.mjs";
import "./all.mjs";
const [set, src] = process.argv.slice(2);
for (const it of EN) { const [n, s, st] = it.key.split("|"); if (st !== set || (src && s !== src.toUpperCase())) continue;
	const miss = it.s.map((x, i) => [i, x]).filter(([i, x]) => tr(it.key, x, i) == null); if (!miss.length) continue;
	console.log(`## ${n}`); for (const [i, x] of miss) console.log(`  ${i}: ${x}`); }
