import fs from "fs";
const tm = {};
for (const f of fs.readdirSync("work").filter(f => f.endsWith(".zh.json"))) {
	const b = f.replace(/\.zh\.json$/, "");
	if (!fs.existsSync(`work/${b}.en.json`)) continue;
	let en, zh;
	try { en = JSON.parse(fs.readFileSync(`work/${b}.en.json`)).items; zh = JSON.parse(fs.readFileSync(`work/${f}`)); } catch { continue; }
	en.forEach((e, k) => { const z = Array.isArray(zh) ? zh[k] : zh[e.key]; if (!Array.isArray(z)) return; e.s.forEach((s, j) => { if (typeof z[j] === "string" && z[j] !== s && /[㐀-鿿]/.test(z[j])) tm[s] ??= z[j]; }); });
}
export default tm;
if (process.argv[2]) {
	for (const b of process.argv.slice(2)) {
		const en = JSON.parse(fs.readFileSync(`work/${b}.en.json`)).items;
		let hit = 0, tot = 0, ch = 0;
		for (const e of en) for (const s of e.s) { tot++; if (tm[s]) hit++; else ch += s.length; }
		console.log(b, `命中 ${hit}/${tot}，剩 ${ch} 字元`);
	}
}
