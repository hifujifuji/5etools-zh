// node work/_find.mjs <英文詞>…：從翻譯記憶找含該詞的句子（顯示譯文）
import {TM} from "./_tmall.mjs";
for (const w of process.argv.slice(2)) {
	console.log("==", w);
	let n = 0;
	for (const [en, zh] of Object.entries(TM)) if (en.includes(w) && en.length < 400) { console.log("  " + en.slice(0, 160) + "\n   → " + String(zh).slice(0, 160)); if (++n >= 2) break; }
}
