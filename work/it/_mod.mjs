// 列出某來源物品 _copy._mod 裡還沒翻的字串與條目名稱（供 exact-strings／copy-names 使用）
import fs from "fs";
const src = process.argv[2];
const ex = JSON.parse(fs.readFileSync("i18n/exact-strings.json"));
const cn = JSON.parse(fs.readFileSync("i18n/copy-names.json"));
const j = JSON.parse(fs.readFileSync("dist/data/items.json"));
const strs = new Set(), names = new Set();
const walk = (v, text) => {
	if (typeof v === "string") { if (text && !ex[v] && /[a-z]{3}/.test(v.replace(/\{@[^}]*\}/g, "")) && !/[一-龥]/.test(v)) strs.add(v); return; }
	if (Array.isArray(v)) return v.forEach(x => walk(x, text));
	if (v && typeof v === "object") {
		if (typeof v.name === "string" && v.type && !cn[v.name] && !/[一-龥]/.test(v.name)) names.add(v.name);
		for (const [k, x] of Object.entries(v)) if (!["name", "source", "mode", "prop", "replace", "names"].includes(k)) walk(x, text || ["entries", "items", "rows", "colLabels", "caption", "entry"].includes(k));
	}
};
for (const it of j.item) if (it.source === src && it._copy) walk(it._copy, false);
console.log(JSON.stringify({names: [...names], strs: [...strs]}, null, 1));
