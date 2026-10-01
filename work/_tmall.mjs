// 由 work/*.en.json／*.zh.json 所有批次建立「英文原句 → 中文」翻譯記憶
import fs from "fs";
export const TM = {};
for (const f of fs.readdirSync("work")) {
	if (!f.endsWith(".en.json")) continue;
	const zf = `work/${f.replace(".en.json", ".zh.json")}`;
	if (!fs.existsSync(zf)) continue;
	let en, zh; try { en = JSON.parse(fs.readFileSync(`work/${f}`)).items; zh = JSON.parse(fs.readFileSync(zf)); } catch { continue; }
	en.forEach((it, i) => { const z = Array.isArray(zh) ? zh[i] : zh[it.key]; if (!z || z.length !== it.s.length) return;
		it.s.forEach((s, j) => { if (/[一-鿿]/.test(z[j]) && s !== z[j]) TM[s] ||= z[j]; }); });
}
