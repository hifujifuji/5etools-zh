// 列出 _copy／_versions 內、沒有中文名的巢狀條目名稱與英文字串
import fs from "fs";
import path from "path";
const files = [];
const walkDir = d => { for (const f of fs.readdirSync(d, {withFileTypes: true})) { const p = path.join(d, f.name); if (f.isDirectory()) { if (!/generated|adventure|book/.test(f.name)) walkDir(p); } else if (f.name.endsWith(".json") && !f.name.startsWith("foundry")) files.push(p); } };
walkDir("dist/data");
const names = new Map(), strs = new Map();
for (const f of files) {
	let j; try { j = JSON.parse(fs.readFileSync(f)); } catch { continue; }
	for (const [prop, arr] of Object.entries(j)) if (Array.isArray(arr)) for (const e of arr) {
		const id = `${prop}:${e.name}|${e.source}`;
		const scan = (x, inText) => {
			if (typeof x === "string") { const t = x.replace(/\{@[^}]*\}/g, ""); if (inText && /[a-z]{3,}/.test(t) && !/[一-龥]/.test(t)) strs.set(x, id); return; }
			if (Array.isArray(x)) return x.forEach(y => scan(y, inText));
			if (x && typeof x === "object") {
				if (typeof x.name === "string" && (x.entries || x.items || x.type) && !x.name_zh && !/[一-龥]/.test(x.name) && x.type) names.set(x.name, id);
				for (const [k, v] of Object.entries(x)) if (!k.startsWith("_") && !["names", "replace", "source", "mode", "prop", "name", "type", "style", "colStyles", "page", "hash"].includes(k)) scan(v, inText || ["entries", "items", "entry", "rows", "colLabels", "caption"].includes(k));
			}
		};
		if (e._copy) scan(e._copy, false);
		if (e._versions) scan(e._versions, false);
	}
}
console.log("names", names.size, "strings", strs.size);
fs.writeFileSync(process.argv[2] || "/dev/stdout", JSON.stringify({names: Object.fromEntries(names), strs: Object.fromEntries(strs)}, null, 1));
