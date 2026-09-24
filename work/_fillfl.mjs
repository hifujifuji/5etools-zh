// fluff 用：以 dist 已有中文、hazmole 對齊結果為底，再蓋上手動翻譯
import fs from "fs";
import F from "./_fillidx.mjs";
import base from "./_fromdist.mjs";
import {isNameList} from "./_namelist.mjs";
const RN = JSON.parse(fs.readFileSync("work/_rn.json"));
const HEAD = JSON.parse(fs.readFileSync("work/_headings.json"));
const BM = fs.existsSync("work/_bookmap.json") ? JSON.parse(fs.readFileSync("work/_bookmap.json")) : {};
const SUF = {Base: "基礎", Chromatic: "彩色", Gem: "寶石", Metallic: "金屬"};
const AUTOX = s => /^[\d,]+ (gp|sp|cp)$/.test(s) ? "=" : /^([\d,]+) days?$/.test(s) ? s.replace(/ days?$/, " 天") : /^([\d,]+) (weeks?)$/.test(s) ? s.replace(/ weeks?$/, " 週") : /^([\d,]+) workweeks?$/.test(s) ? s.replace(/ workweeks?$/, " 工作週") : /^[\d,]+ ft\.$/.test(s) ? s.replace(/ ft\.$/, " 呎") : /^[\d,]+ \((\{@dice [^}]+\})\) ft\.$/.test(s) ? s.replace(/ \((\{@dice [^}]+\})\) ft\.$/, "（$1）呎") : /^[\d,]+ (miles?|hours?|minutes?)$/.test(s) ? s.replace(/ miles?$/, " 哩").replace(/ hours?$/, " 小時").replace(/ minutes?$/, " 分鐘") : null;
export const rnParen = s => { const m = /^(.+) \((.+)\)$/.exec(s); return m && RN[m[1]] ? `${RN[m[1]]}（${RN[m[2]] ?? SUF[m[2]] ?? m[2]}）` : null; };
export default (batch, maps = [], dict = {}) => {
	const bs = base(batch);
	const sv = fs.existsSync(`work/${batch}.salv.json`) ? JSON.parse(fs.readFileSync(`work/${batch}.salv.json`)) : [];
	const en = JSON.parse(fs.readFileSync(`work/${batch}.en.json`)).items;
	F(batch, bs.map((m, i) => {
		const nl = {}; en[i].s.forEach((s, j) => { if (RN[s]) nl[j] = RN[s]; else if (AUTOX(s)) nl[j] = AUTOX(s); else if (rnParen(s)) nl[j] = rnParen(s); else if (isNameList(s)) nl[j] = "="; });
		const out = {...nl, ...(sv[i] || {}), ...m, ...(maps[i] || {})};
		// 標題／圖說：被人名清單規則保留原文的，改用標題詞典
		en[i].s.forEach((s, j) => { if (HEAD[s] && (out[j] == null || out[j] === "=")) out[j] = HEAD[s]; else if (BM[s] && out[j] == null) out[j] = BM[s]; });
		return out;
	}), dict);
};
