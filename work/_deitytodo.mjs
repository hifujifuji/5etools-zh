// 列出待寫中文簡介的神祇（有內文者）：S=原文字數 node work/_deitytodo.mjs [來源…]
import fs from "node:fs";
const S = Number(process.env.S || 350);
const d = JSON.parse(fs.readFileSync("dist/data/deities.json", "utf8")).deity;
const intro = JSON.parse(fs.readFileSync("i18n/deity-intro.json", "utf8"));
const srcs = process.argv.slice(2);
const flat = e => typeof e === "string" ? e : Array.isArray(e) ? e.map(flat).join(" ") : e && typeof e === "object" ? (e.type === "inset" && e.name === "中文簡介" ? "" : [e.name && `【${e.name}】`, flat(e.entries || e.items || e.entry || "")].filter(Boolean).join(" ")) : "";
const seen = new Set();
for (const x of d) {
	if (!x.entries || (srcs.length && !srcs.includes(x.source))) continue;
	const key = `${x.name}|${x.source}|${x.pantheon}`;
	if (intro[key]) continue;
	const dup = seen.has(x.name); seen.add(x.name);
	const text = flat(x.entries).replace(/\s+/g, " ");
	console.log(`# ${key} ＝${x.name_zh || "?"}｜${x.title || ""}｜${x.province || ""}｜${(x.alignment || []).join("")}${dup ? "（同名前已列）" : ""} [${text.length}]\n${dup ? "" : text.slice(0, S) + "\n"}`);
}
