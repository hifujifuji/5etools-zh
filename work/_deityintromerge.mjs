// 併入神祇中文簡介：node work/_deityintromerge.mjs work/deity/intro-*.json
// 檔案格式 {"_sources": ["SCAG", …], "<英文名>": "簡介"}：套用到該名稱、來源在清單內且有內文的所有神祇
import fs from "node:fs";
const d = JSON.parse(fs.readFileSync("dist/data/deities.json", "utf8")).deity;
const out = JSON.parse(fs.readFileSync("i18n/deity-intro.json", "utf8"));
for (const f of process.argv.slice(2)) {
	const j = JSON.parse(fs.readFileSync(f, "utf8"));
	const srcs = j._sources;
	for (const [name, text] of Object.entries(j)) {
		if (name === "_sources") continue;
		const hits = d.filter(x => x.name === name && x.entries && srcs.includes(x.source));
		if (!hits.length) console.log("找不到：", name);
		for (const x of hits) out[`${x.name}|${x.source}|${x.pantheon}`] = text;
	}
}
fs.writeFileSync("i18n/deity-intro.json", JSON.stringify(out, null, "\t") + "\n");
console.log("共", Object.keys(out).length, "則");
