// work/deity/fields*.txt（「英文 => 中文」）→ i18n/deity-fields.json；並檢查 work/_deity-fields.en.json 的涵蓋率
import fs from "node:fs";
const out = {};
let sec = null;
for (const f of fs.readdirSync("work/deity").filter(f => /^fields.*\.txt$/.test(f)).sort()) {
	for (const line of fs.readFileSync(`work/deity/${f}`, "utf8").split("\n")) {
		if (!line.trim()) continue;
		if (line.startsWith("## ")) { sec = line.slice(3).trim(); out[sec] ||= {}; continue; }
		const i = line.indexOf(" => ");
		if (i < 0) { console.log("格式錯誤：", line); continue; }
		out[sec][line.slice(0, i)] = line.slice(i + 4).trim();
	}
}
fs.writeFileSync("i18n/deity-fields.json", JSON.stringify(out, null, "\t") + "\n");
const en = JSON.parse(fs.readFileSync("work/_deity-fields.en.json", "utf8"));
for (const [s, m] of Object.entries(en)) {
	const miss = Object.keys(m).filter(k => !out[s]?.[k]);
	const extra = Object.keys(out[s] || {}).filter(k => !(k in m));
	console.log(s, Object.keys(m).length, "缺", miss.length, miss.slice(0, 20), "多", extra.slice(0, 20));
}
