// 從 hazmole 同名實體撈可用的舊譯文：node work/_salv.mjs <batch>  → work/<batch>.salv.json {i:{j:zh}}
import fs from "fs";
const batch = process.argv[2];
const H = JSON.parse(fs.readFileSync("i18n/hazmole/subclassFeature.json"));
const HC = JSON.parse(fs.readFileSync("i18n/hazmole/classFeature.json"));
const en = JSON.parse(fs.readFileSync(`work/${batch}.en.json`)).items;
const TAG = /\{@(\w+)\s[^{}]*\}/g;
const strs = (o, out = []) => { if (typeof o === "string") out.push(o); else if (Array.isArray(o)) o.forEach(x => strs(x, out)); else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) if (!/^(ENG_name|type|source|page|colStyles|style)$/.test(k)) strs(v, out); return out; };
const nums = s => (s.replace(TAG, m => m.includes("dice") || m.includes("damage") ? m : "").match(/\d+/g) || []).sort().join(",");
const tagTypes = s => [...s.matchAll(TAG)].map(m => m[1]).join(",");
const out = {};
en.forEach((it, i) => {
	const k3 = it.key.split("|").slice(0, 3).join("|");
	const h = H[k3] || HC[k3];
	if (!h) return;
	const pool = strs(h).filter(z => /[一-鿿]/.test(z));
	it.s.forEach((s, j) => {
		if (s.length < 25 || /[一-鿿]/.test(s)) return;
		let best = null, bs = -1;
		for (const z of pool) {
			const r = z.length / s.length; if (r < 0.2 || r > 0.8) continue;
			let sc = 0;
			if (nums(z) === nums(s)) sc += 2;
			if (tagTypes(z) === tagTypes(s)) sc += 2;
			sc -= Math.abs(r - 0.45) * 3;
			if (sc > bs) { bs = sc; best = z; }
		}
		if (!best || bs < 2.5) return;
		// 標籤換回英文原標籤
		const et = [...s.matchAll(TAG)].map(m => m[0]); let n = 0;
		let z = best.replace(TAG, () => et[n++] ?? "");
		z = z.replace(/\}, \{@/g, "}、{@");
		(out[i] ||= {})[j] = z;
	});
});
fs.writeFileSync(`work/${batch}.salv.json`, JSON.stringify(out, null, 1));
for (const [i, m] of Object.entries(out)) for (const [j, z] of Object.entries(m)) console.log(`#${i}.${j} ${en[i].s[j].slice(0, 70)}\n   → ${z.slice(0, 90)}`);
