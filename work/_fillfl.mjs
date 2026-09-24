// fluff 用：以 dist 已有中文、hazmole 對齊結果為底，再蓋上手動翻譯
import fs from "fs";
import F from "./_fillidx.mjs";
import base from "./_fromdist.mjs";
import {isNameList} from "./_namelist.mjs";
const RN = JSON.parse(fs.readFileSync("work/_rn.json"));
const SUF = {Base: "基礎", Chromatic: "彩色", Gem: "寶石", Metallic: "金屬"};
export const rnParen = s => { const m = /^(.+) \((.+)\)$/.exec(s); return m && RN[m[1]] ? `${RN[m[1]]}（${RN[m[2]] ?? SUF[m[2]] ?? m[2]}）` : null; };
export default (batch, maps = [], dict = {}) => {
	const bs = base(batch);
	const sv = fs.existsSync(`work/${batch}.salv.json`) ? JSON.parse(fs.readFileSync(`work/${batch}.salv.json`)) : [];
	const en = JSON.parse(fs.readFileSync(`work/${batch}.en.json`)).items;
	F(batch, bs.map((m, i) => {
		const nl = {}; en[i].s.forEach((s, j) => { if (RN[s]) nl[j] = RN[s]; else if (rnParen(s)) nl[j] = rnParen(s); else if (isNameList(s)) nl[j] = "="; });
		return {...nl, ...(sv[i] || {}), ...m, ...(maps[i] || {})};
	}), dict);
};
