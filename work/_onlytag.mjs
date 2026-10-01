// node work/_onlytag.mjs [檔名過濾]：列出 dist 已翻譯實體中「整句包在 {@i}/{@note} 等文字標籤裡」而沒被匯出的英文句子
import fs from "fs";
import path from "path";
const hasCjk = s => /[一-鿿]/.test(s);
const RE = /^\s*(\{@[^{}]+\}\s*)+$/, TXT = /\{@(i|b|note|style|u|bold|italic) [^{}|]*[A-Za-z]{3}/;
const filt = process.argv[2];
const out = {};
const files = [];
const rd = d => { for (const f of fs.readdirSync(d, {withFileTypes: true})) { const p = path.join(d, f.name); if (f.isDirectory()) { if (!/^(book|adventure|generated)$/.test(f.name)) rd(p); } else if (f.name.endsWith(".json")) files.push(p); } };
rd("dist/data");
for (const f of files) {
	if (filt && !f.includes(filt)) continue;
	const j = JSON.parse(fs.readFileSync(f));
	for (const [prop, arr] of Object.entries(j)) {
		if (!Array.isArray(arr)) continue;
		for (const e of arr) {
			if (!e?.name_zh) continue;
			const walk = (v, k) => {
				if (typeof v === "string") { if (RE.test(v) && TXT.test(v) && !hasCjk(v)) (out[prop] ||= new Set()).add(v); return; }
				if (Array.isArray(v)) return v.forEach(x => walk(x, k));
				if (v && typeof v === "object") for (const [kk, x] of Object.entries(v)) if (!["name", "_zhOf", "source", "face", "back"].includes(kk)) walk(x, kk);
			};
			walk(e.entries); walk(e.items); walk(e.entriesHigherLevel);
		}
	}
}
for (const [p, s] of Object.entries(out)) { console.log(`## ${p} ${s.size}`); if (filt) for (const x of s) console.log(x); }
