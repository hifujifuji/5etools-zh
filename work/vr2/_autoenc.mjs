import fs from "fs";
import {enc} from "./_enc.mjs";
// 對批次中可由遭遇表轉換器完整處理的字串產生對照（轉換後標籤外不得殘留英文）
export default batch => {
	const en = JSON.parse(fs.readFileSync(`work/${batch}.en.json`)).items;
	return en.map(it => {
		const m = {};
		it.s.forEach((s, j) => { const t = enc(s); if (t !== s && !/[A-Za-z]{2,}/.test(t.replace(/\{@[^}]*\}/g, ""))) m[j] = t; });
		return m;
	});
};
