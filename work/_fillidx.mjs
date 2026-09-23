import fill from "./_tcefill.mjs";
import fs from "fs";
// maps: 每個實體一個 {索引: 中文}，其餘為 null（查 RC／翻譯記憶／規則）
export default (batch, maps) => {
	const en = JSON.parse(fs.readFileSync(`work/${batch}.en.json`)).items;
	fill(batch, en.map((e, i) => e.s.map((s, j) => maps[i]?.[j] ?? null)));
};
