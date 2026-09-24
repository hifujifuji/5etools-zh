// 從已翻譯的變體規則批次建立「英文句 → 中文」翻譯記憶（完全比對用）
import fs from "fs";
const tm = {};
for (const f of fs.readdirSync("work").filter(f => /^vr-.*\.zh\.json$/.test(f))) {
	const b = f.replace(".zh.json", "");
	const en = JSON.parse(fs.readFileSync(`work/${b}.en.json`)).items, zh = JSON.parse(fs.readFileSync(`work/${f}`));
	en.forEach((e, i) => e.s.forEach((s, j) => { const z = zh[i]?.[j]; if (typeof z === "string" && z !== s && /[一-龥]/.test(z) && s.length > 3) tm[s] ??= z; }));
}
export default tm;
if (process.argv[1]?.endsWith("_vrtm.mjs")) console.log(Object.keys(tm).length);
