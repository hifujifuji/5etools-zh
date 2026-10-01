// 牌組卡牌填寫：add(牌組, 來源, {牌名: {索引: 中文}})；沒寫到的字串查翻譯記憶（_tmall）
import fs from "fs";
import {TM} from "../_tmall.mjs";
export const EN = JSON.parse(fs.readFileSync("work/cd-all.en.json")).items;
const REG = {};
const S = s => s.toUpperCase();
export const add = (set, src, cards) => { for (const [n, m] of Object.entries(cards)) { const k = `${n}|${S(src)}|${set}`; REG[k] = {...REG[k], ...m}; } };
export const NAMES = {};
export const RULES = [];
const rule = s => { for (const [re, fn] of RULES) { const m = re.exec(s); if (m) { const r = fn(m); if (r != null) return r; } } return null; };
const keep = s => !/\{@(i|b|note|style|u) /.test(s) && /^[\s\d.,+\-–—×%()\/]*$/.test(s.replace(/\{@[^}]*\}/g, "")) ? s : null;
export const tr = (key, s, i) => { const m = REG[key] || {}; return m[i] === "=" ? s : m[i] ?? (i === 0 ? NAMES[s] : null) ?? (TM[s] !== s ? TM[s] : null) ?? rule(s) ?? keep(s); };
export const write = () => {
	const out = {}; const miss = {};
	for (const it of EN) { const z = it.s.map((s, i) => tr(it.key, s, i)); if (z.every(x => x != null)) out[it.key] = z; else { const set = it.key.split("|").slice(1).join("|"); miss[set] = (miss[set] || 0) + 1; } }
	fs.writeFileSync("work/cd-all.zh.json", JSON.stringify(out, null, "\t"));
	console.log(`完成 ${Object.keys(out).length}/${EN.length}`, miss);
};
