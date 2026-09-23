// 在舊翻譯／已補翻裡找英文名（正規式），列出中文
import fs from "node:fs";
const re = new RegExp(process.argv[2], "i");
const seen = new Set();
const show = (tag, en, zh) => { const k = `${tag}|${en}|${zh}`; if (!seen.has(k) && re.test(en)) { seen.add(k); console.log(`${tag}\t${en}\t${zh}`); } };
const n = JSON.parse(fs.readFileSync("i18n/hazmole/_names.json", "utf8"));
for (const [p, m] of Object.entries(n)) for (const [en, zh] of Object.entries(m)) show(p, en, zh);
for (const layer of ["hazmole", "custom"]) for (const f of fs.readdirSync(`i18n/${layer}`)) {
	if (f.startsWith("_") || !f.endsWith(".json") || f === "book.json") continue;
	for (const o of Object.values(JSON.parse(fs.readFileSync(`i18n/${layer}/${f}`, "utf8")))) if (o?.ENG_name) show(f.replace(".json", ""), o.ENG_name, o.name);
}
