// 用法：import fill from "./_tcefill.mjs"; fill(batch, zhArrays) — null 取翻譯記憶
import fs from "fs";
import tm from "./_tm.mjs";
import {RC} from "./_rc.mjs";
export default (batch, zh) => {
	const en = JSON.parse(fs.readFileSync(`work/${batch}.en.json`)).items;
	if (en.length !== zh.length) throw new Error(`${batch}: ${en.length} 筆 vs ${zh.length}`);
	const out = en.map((e, i) => {
		const z = zh[i];
		if (z.length !== e.s.length) throw new Error(`${e.key}: ${e.s.length} vs ${z.length}`);
		return z.map((s, j) => { const v = s === "=" ? e.s[j] : s ?? RC[e.s[j]] ?? tm[e.s[j]]; if (v == null) throw new Error(`${e.key} #${j} 缺翻譯`); return v; });
	});
	fs.writeFileSync(`work/${batch}.zh.json`, JSON.stringify(out, null, 0));
	console.log(batch, "ok");
};
