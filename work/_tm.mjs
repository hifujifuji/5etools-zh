import fs from "fs";
const tm = {};
for (const i of [1, 2, 3, 4]) {
	const en = JSON.parse(fs.readFileSync(`work/efa-art-${i}.en.json`)).items;
	const zh = JSON.parse(fs.readFileSync(`work/efa-art-${i}.zh.json`));
	en.forEach((e, k) => { const z = Array.isArray(zh) ? zh[k] : zh[e.key]; e.s.forEach((s, j) => { if (z?.[j]) tm[s] = z[j]; }); });
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
