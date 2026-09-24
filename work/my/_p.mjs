// 靈能批次填寫：自動套用名稱表
import fs from "fs";
import F from "../_fillfl.mjs";
import N from "./_names.mjs";
export const FOC = "專注於此戒律時，";
export default (batch, m) => {
	const en = JSON.parse(fs.readFileSync(`work/${batch}.en.json`)).items;
	en.forEach((it, i) => { m[i] ||= {}; it.s.forEach((s, j) => { if (N[s] && m[i][j] == null) m[i][j] = N[s]; }); });
	F(batch, m);
};
