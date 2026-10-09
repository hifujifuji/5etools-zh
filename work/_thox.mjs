// trap／hazard／object 補翻輔助（以 dist 既有中文＋翻譯記憶預填，只列出還缺的句子）
//   node scripts/tr.mjs export <batch> --prop trap
//   node work/_thox.mjs todo <batch>   → 篩掉 dist 已全中文的實體（改寫 en.json）、寫 <batch>.pre.json、列出待翻「i.j<TAB>原文」
//   寫 work/<batch>.tr.json：{"i.j": "中文"}（相同原文只需翻第一次出現的）
//   node work/_thox.mjs make <batch>   → <batch>.zh.json，再 node scripts/tr.mjs import <batch>
import fs from "node:fs";
import {TM} from "./_tmall.mjs";
import {isTextKey, SKIP_KEYS} from "../scripts/merge.mjs";
const cjk = s => /[一-鿿]/.test(s);
const [cmd, batch] = process.argv.slice(2);
const enF = `work/${batch}.en.json`, preF = `work/${batch}.pre.json`;
const RE_ONLY_TAG = /^\s*(\{@[^{}]+\}\s*)+$/, RE_TEXT_TAG = /\{@(i|b|note|style|u|bold|italic) [^{}|]*[A-Za-z]{3}/;
// 與 tr.mjs collect 相同的走訪，但對 dist 實體取同路徑的值
const collect = ent => {
	const out = typeof ent.name === "string" ? [{path: ["name"], isName: true}] : [];
	const walk = (v, p, isText) => {
		if (typeof v === "string") { if (isText && /[A-Za-z]/.test(v) && (!RE_ONLY_TAG.test(v) || RE_TEXT_TAG.test(v))) out.push({path: p}); return; }
		if (Array.isArray(v)) return v.forEach((x, i) => walk(x, [...p, i], isText));
		if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) {
			if (k === "name") { if (p.length && typeof x === "string") out.push({path: [...p, "name"], isName: true}); continue; }
			if (k.startsWith("_") || k === "source" || SKIP_KEYS.has(k)) continue;
			walk(x, [...p, k], isTextKey(k, x));
		}
	};
	for (const [k, x] of Object.entries(ent)) { if (k === "name" || k.startsWith("_") || SKIP_KEYS.has(k)) continue; walk(x, [k], isTextKey(k, x)); }
	return out;
};
const getAt = (o, p) => p.reduce((a, k) => a?.[k], o);
if (cmd === "todo") {
	const {UPSTREAM} = await import("../scripts/util.mjs");
	const en = JSON.parse(fs.readFileSync(enF));
	const dist = {}, up = {};
	for (const f of ["trapshazards.json", "objects.json", "charcreationoptions.json", "bastions.json", "rewards.json", "magicvariants.json", "items.json", "items-base.json"]) for (const [root, tgt] of [["dist/data", dist], [`${UPSTREAM}/data`, up]]) {
		const j = JSON.parse(fs.readFileSync(`${root}/${f}`));
		for (const p of ["trap", "hazard", "object", "charoption", "facility", "reward", "magicvariant", "itemGroup", "baseitem", "itemTypeAdditionalEntries"]) for (const e of j[p] || []) tgt[`${p}|${e.name}|${e.source ?? e.inherits?.source}`.toLowerCase()] = e;
	}
	const items = [], pre = [];
	for (const it of en.items) {
		const k = `${it.prop}|${it.key}`.toLowerCase(); const u = up[k], d = dist[k];
		const paths = collect(u);
		if (paths.length !== it.s.length) throw new Error(`${k}: ${paths.length} vs ${it.s.length}`);
		let needImport = false;
		const z = paths.map((x, j) => {
			const s = it.s[j];
			const dv = x.isName ? getAt(d, x.path.slice(0, -1))?.name_zh : getAt(d, x.path);
			if (typeof dv === "string" && cjk(dv)) return dv;
			needImport = true; // dist 還不是中文：即使翻譯記憶能補齊，也要保留這筆以便匯入
			if (typeof TM[s] === "string" && TM[s] !== s) return TM[s];
			if (!RE_TEXT_TAG.test(s) && !/[A-Za-z]{2}/.test(s.replace(/\{@[^{}]*\}/g, ""))) return s.replace(/ \(/g, "（").replace(/\)/g, "）");
			return null;
		});
		if (z.every(x => x != null) && !needImport && !process.env.ALL) continue;
		items.push(it); pre.push(z);
	}
	fs.writeFileSync(enF, JSON.stringify({batch, items}, null, "\t"));
	fs.writeFileSync(preF, JSON.stringify(pre));
	const seen = new Set(); let n = 0;
	items.forEach((it, i) => {
		console.log(`## ${i} ${it.key}${it.hint ? " " + JSON.stringify(it.hint) : ""}`);
		it.s.forEach((s, j) => { if (pre[i][j] != null || seen.has(s)) return; seen.add(s); n += s.length; console.log(`${i}.${j}\t${s}`); });
	});
	console.error(`${items.length} 筆、待翻 ${seen.size} 句 ${n} 字元`);
} else if (cmd === "make") {
	const en = JSON.parse(fs.readFileSync(enF)).items, pre = JSON.parse(fs.readFileSync(preF)), tr = JSON.parse(fs.readFileSync(`work/${batch}.tr.json`));
	const byEn = {};
	en.forEach((it, i) => it.s.forEach((s, j) => { if (tr[`${i}.${j}`]) byEn[s] ??= tr[`${i}.${j}`]; }));
	const miss = [];
	const zh = en.map((it, i) => it.s.map((s, j) => tr[`${i}.${j}`] ?? pre[i][j] ?? byEn[s] ?? (miss.push(`${i}.${j} ${s.slice(0, 60)}`), s)));
	fs.writeFileSync(`work/${batch}.zh.json`, JSON.stringify(zh, null, "\t"));
	console.log(miss.length ? `缺 ${miss.length}：\n${miss.join("\n")}` : "完整");
}
