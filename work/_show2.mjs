// 只列出還需要翻的字串（排除 dist 已有中文、RC／SCN／翻譯記憶／規則可解者）
import fs from "fs";
import tm from "./_tm.mjs";
import {RC, RULE} from "./_rc.mjs";
import {SCN} from "./_scnames.mjs";
import base from "./_fromdist.mjs";
const b = process.argv[2];
const en = JSON.parse(fs.readFileSync(`work/${b}.en.json`)).items;
const bs = base(b);
let n = 0;
en.forEach((e, i) => {
	const need = e.s.map((s, j) => [j, s]).filter(([j, s]) => !(bs[i][j] ?? RC[s] ?? SCN[s] ?? tm[s] ?? RULE(s)) && !/^\{@spell [^{}]+\}(, \{@spell [^{}]+\})+$/.test(s));
	if (!need.length) return;
	console.log(`#${i} ${e.key}`);
	for (const [j, s] of need) { console.log(`  ${j}: ${s}`); n += s.length; }
});
console.log(`-- 剩 ${n} 字元`);
