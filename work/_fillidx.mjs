import fill from "./_tcefill.mjs";
import fs from "fs";
// maps: 每個實體一個 {索引: 中文}；dict：英文→中文（共用表格）；其餘為 null（查 RC／翻譯記憶／規則）
// 純法術標籤清單：逗號改頓號
const AUTO = s => /^\{@spell [^{}]+\}(, \{@spell [^{}]+\})+$/.test(s) ? s.replace(/, /g, "、") : null;
export default (batch, maps, dict = {}) => {
	const en = JSON.parse(fs.readFileSync(`work/${batch}.en.json`)).items;
	fill(batch, en.map((e, i) => e.s.map((s, j) => maps[i]?.[j] ?? dict[s] ?? AUTO(s))));
};
