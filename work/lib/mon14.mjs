// 2014／MPMM 格式怪物翻譯引擎：規則 + 字典（work/mon14/*.json，另讀 work/mon/*.json 的 NAME:）+ 自動樣板
//   node work/lib/mon14.mjs names <SRC>            列出怪物名與目前的中文名（要人工看過）
//   node work/lib/mon14.mjs todo <SRC> [字元上限]   列出尚未翻譯的句子（{X}＝怪物自稱；同骨架只列一句）
//   node work/lib/mon14.mjs make <SRC> <batch>      產生 work/<batch>.zh.json（只含全部翻好的怪物）
// 字典鍵：一般句子（正規化後的英文）、"NAME:英文"（特性／動作／怪物名）、"REF:怪物名"（額外自稱）、"NOREF:怪物名"、"TGT:one target"
// 樣板：字典句子中的數字、標籤、傷害類型、屬性、體型會自動變成可代換的欄位，所以同句型只要翻一次。
import fs from "node:fs";
import {execFileSync} from "node:child_process";

const ROOT = new URL("../../", import.meta.url);
const readDir = d => { const out = {}; const u = new URL(d, ROOT); if (!fs.existsSync(u)) return out; for (const f of fs.readdirSync(u).filter(f => f.endsWith(".json")).sort()) Object.assign(out, JSON.parse(fs.readFileSync(new URL(f, u), "utf8"))); return out; };
const OLD = (() => { try { const n = JSON.parse(fs.readFileSync(new URL("i18n/hazmole/_names.json", ROOT), "utf8")); return {...n.item, ...n.monster}; } catch { return {}; } })();
const hasCjk = s => /[㐀-鿿]/.test(s);

const DMG = {acid: "酸蝕", bludgeoning: "鈍擊", cold: "寒冰", fire: "火焰", force: "力場", lightning: "閃電", necrotic: "死靈", piercing: "穿刺", poison: "毒素", psychic: "精神", radiant: "光耀", slashing: "劈砍", thunder: "雷鳴"};
const ABIL = {Strength: "力量", Dexterity: "敏捷", Constitution: "體質", Intelligence: "智力", Wisdom: "感知", Charisma: "魅力"};
const SIZE = {Tiny: "微型", Small: "小型", Medium: "中型", Large: "大型", Huge: "巨型", Gargantuan: "超巨型"};
const NUM = {one: "一", two: "兩", three: "三", four: "四", five: "五", six: "六", seven: "七", eight: "八"};
const ENUM = {...DMG, ...ABIL, ...SIZE};

// ---- 自動樣板 -----------------------------------------------------------------
const RE_TOK = new RegExp(`\\[\\[[^\\]]+\\]\\]|\\{@[^{}]*(?:\\{[^{}]*\\}[^{}]*)*\\}|\\d+(?:,\\d{3})*(?:\\.\\d+)?|\\b(?:${Object.keys(ENUM).join("|")})\\b`, "g");
const tokZh = t => ENUM[t] ?? t;
const skeleton = s => s.replace(RE_TOK, t => t.startsWith("[[") ? "<N>" : t.startsWith("{@") ? `{@${/^\{@(\w+)/.exec(t)[1]}}` : ENUM[t] ? (DMG[t] ? "<D>" : ABIL[t] ? "<A>" : "<S>") : "#");
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function makeTemplate (en, zh) {
	const toks = en.match(RE_TOK) || [];
	if (!toks.length) return null;
	// 找出 zh 中每個 token 值的出現位置
	const byVal = {};
	toks.forEach((t, i) => (byVal[t] ||= []).push(i));
	const marks = []; // {pos, len, idx}
	const literal = new Set();
	for (const [val, idxs] of Object.entries(byVal)) {
		const z = tokZh(val);
		const re = new RegExp(/^\d/.test(z) ? `(?<![\\d.,])${escRe(z)}(?![\\d])` : escRe(z), "g");
		const pos = []; let m;
		// 數字不可落在標籤內
		const masked = /^\d/.test(z) ? zh.replace(/\{@[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, t => "\u0000".repeat(t.length)) : zh;
		while ((m = re.exec(masked))) pos.push(m.index);
		if (pos.length !== idxs.length) { idxs.forEach(i => literal.add(i)); continue; }
		pos.forEach((p, k) => marks.push({pos: p, len: z.length, idx: idxs[k]}));
	}
	marks.sort((a, b) => a.pos - b.pos);
	for (let i = 1; i < marks.length; ++i) if (marks[i].pos < marks[i - 1].pos + marks[i - 1].len) return null; // 重疊：放棄樣板
	const parts = []; let last = 0;
	for (const mk of marks) { parts.push(zh.slice(last, mk.pos), mk.idx); last = mk.pos + mk.len; }
	parts.push(zh.slice(last));
	return {toks, literal, parts};
}
const applyTemplate = (tpl, en) => {
	const toks = en.match(RE_TOK) || [];
	if (toks.length !== tpl.toks.length) return null;
	for (const i of tpl.literal) if (toks[i] !== tpl.toks[i]) return null;
	return tpl.parts.map(p => typeof p === "number" ? tokZh(toks[p]) : p).join("");
};

export function loadDict () {
	const base = readDir("work/mon/"); // XMM 字典：只取名稱
	const d = {};
	for (const [k, v] of Object.entries(base)) if (k.startsWith("NAME:")) d[k] = v;
	Object.assign(d, readDir("work/mon14/"));
	const tpls = new Map();
	for (const [k, v] of Object.entries(d)) {
		if (/^(NAME|REF|NOREF|TGT):/.test(k) || typeof v !== "string") continue;
		const t = makeTemplate(k, v);
		if (t) { const sk = skeleton(k); if (!tpls.has(sk)) tpls.set(sk, []); tpls.get(sk).push(t); }
	}
	return {d, tpls};
}

const mask = s => { const tags = []; const m = s.replace(/\{@[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, t => `\u0000${tags.push(t) - 1}\u0000`); return [m, tags]; };
const unmask = (s, tags) => s.replace(/\u0000(\d+)\u0000/g, (_, i) => tags[i]);
const splitSentences = s => { const [m, tags] = mask(s); return m.split(/(?<=[.!?:])\s+(?=[A-Z\u0000(*"“])/).map(x => unmask(x, tags)); };
const MARK = /(\{@h\}|\{@hom\})/;

const dmgOne = p => {
	let m;
	if ((m = /^(\d+) \((\{@damage [^}]+\})\) (\w+) damage$/.exec(p)) && DMG[m[3]]) return `${m[1]}（${m[2]}）${DMG[m[3]]}傷害`;
	if ((m = /^(\d+) (\w+) damage$/.exec(p)) && DMG[m[2]]) return `${m[1]} 點${DMG[m[2]]}傷害`;
	return null;
};
const dmgList = s => { const zh = s.split(" plus ").map(dmgOne); return zh.every(Boolean) ? zh.join("外加 ") : null; };
// 代名詞統一成 it（he/she/him/his…）；her 有歧義，用 herAs 指定（null＝不動）
const depron = (s, herAs) => { const [mk, tags] = mask(s); let z = mk.replace(/\b(he|she)\b/g, "it").replace(/\b(He|She)\b/g, "It").replace(/\bhim\b/g, "it").replace(/\bhis\b/g, "its").replace(/\bHis\b/g, "Its").replace(/\b(himself|herself)\b/g, "itself"); if (herAs) z = z.replace(/\bher\b/g, herAs).replace(/\bHer\b/g, herAs === "its" ? "Its" : "It"); return unmask(z, tags); };
const STOP_REF = new Set("sea astral stench shadow star death stone fire frost cloud storm sword skull steel war master elder young adult spirit rot venom dire guard air earth water mind iron bronze oaken clockwork gray green red blue black white autumn spring summer winter angry hungry lonely lost wretched female male deep cave corpse cranium flail hellfire sacred vampiric thorny kraken nightmare pit favored house supreme soul gloom flesh dragon great old one martial arts bolt chain battering ram smiling everlasting ice sun moon night blood bone plague swamp forest mountain desert sky void time dream living ancient greater lesser high low wild dark light holy unholy fey abyssal infernal".split(" "));
const TGT = {"one target": "單一目標", "one creature": "單一生物", "one object": "單一物件", "one target in the swarm's space": "集群所在空間內的單一目標", "one creature in the swarm's space": "集群所在空間內的單一生物"};

export function makeTranslator ({d, tpls}, name, zhName, hint = {}, strings = []) {
	const words = name.toLowerCase().replace(/\(.*?\)/g, "").split(/[\s,]+/).filter(Boolean);
	const refs = [];
	for (let i = 0; i < words.length; ++i) for (let j = words.length; j > i; --j) refs.push(words.slice(i, j).join(" "));
	for (const w of words) for (const p of w.split("-")) if (p.length > 2) refs.push(p);
	const extra = new Set(d[`REF:${name}`] || []);
	for (const a of extra) refs.push(a);
	const noRef = new Set(d[`NOREF:${name}`] || []);
	// 單字自稱若是常見的形容詞／名詞（the sea、the Astral Plane…）容易誤判，排除
	const uniq = [...new Set(refs)].filter(r => !noRef.has(r) && !/^(of|the|and|in)$/.test(r) && (!STOP_REF.has(r) || extra.has(r) || r === words.join(" "))).sort((a, b) => b.length - a.length);
	const reRef = uniq.length ? new RegExp(`\\b([Tt]he|[Tt]his) (${uniq.map(escRe).join("|")})\\b`, "gi") : null;
	const all = strings.join("\n");
	const bare = name.replace(/\s*\(.*?\)/g, "").replace(/^The /, "");
	const reBare = new RegExp(`(^|[^\\w{|])${escRe(bare)}(?![\\w}|])`, "g");
	const proper = !new RegExp(`\\b[Tt]he ${escRe(bare)}\\b`, "i").test(all) && reBare.test(all);
	const norm0 = s => reRef ? s.replace(reRef, (_, t) => `${t[0] === "T" ? "The" : "the"} {X}`) : s;
	const norm = s0 => { const s = norm0(s0); if (!proper) return s; const [mk, tags] = mask(s); return unmask(mk.replace(reBare, (m0, pre, off) => `${pre}${off === 0 && !pre ? "The" : "the"} {X}`), tags); };
	const X = zhName;
	const names = {};
	const nm1 = o => names[o] ?? d[`NAME:${o}`] ?? hint[o];
	// 2014 版內文常用小寫（two claw attacks、with its claws）：依序試原樣、字首大寫、單複數
	const nm = o => { const t = o.toTitle(); for (const k of [o, t, t.replace(/s$/, ""), `${t}s`]) { const z = nm1(k); if (z) return z; } return OLD[o.toLowerCase()]; };
	const fin = z => z.replaceAll("{X}", X);

	const rule = s => {
		let m;
		if ((m = /^\{@atk ([a-z,]+)\} \{@hit ([+-]?\d+)\} to hit, (.+?), ([^,]+?)\.$/.exec(s))) {
			const rr = m[3].replace(/reach (\d+) ft\./g, "觸及 $1 呎").replace(/range ([\d/]+) (?:ft\.|feet)/g, "射程 $1 呎").replace(" or ", "或");
			const tg = TGT[m[4]] ?? d[`TGT:${m[4]}`];
			if (!/[a-z]{3}/.test(rr) && tg) return `{@atk ${m[1]}} 命中 {@hit ${m[2]}}，${rr}，${fin(tg)}。`;
		}
		if ((m = /^(.+ damage)\.$/.exec(s))) { const z = dmgList(m[1]); if (z) return `${z}。`; }
		if ((m = /^(.+? damage), or (.+? damage) if used with two hands(?: to make a melee attack)?(?:,? plus (.+? damage))?(\.|, (?:and|or) .+|\. .+)$/.exec(s))) {
			const a = dmgList(m[1]), b = dmgList(m[2]), c = m[3] ? dmgList(m[3]) : "", r = m[4] === "." ? "。" : (lookup(bracket(m[4])) ?? lookup(m[4]));
			if (a && b && c != null && r != null) return `${a}，若以雙手使用${/melee attack/.test(s) ? "進行近戰攻擊" : ""}則為 ${b}${c ? `，外加 ${c}` : ""}${r}`;
		}
		if ((m = /^(.+? damage)(, (?:and|or|plus|if) .+|\. .+| if .+| and .+)$/.exec(s))) {
			const z = dmgList(m[1]); const r = lookup(bracket(m[2])) ?? lookup(m[2]);
			if (z && r != null) return `${z}${r}`;
		}
		if (!/[A-Za-z]/.test(s.replace(/\{@[^{}]*\}/g, ""))) return s.replace(/\}, \{/g, "}、{");
		if ((m = /^(\d+)(?:[–-](\d+))?:$/.exec(s))) return `${m[1]}${m[2] ? `–${m[2]}` : ""}：`;
		// 多重攻擊的一般形式：makes one A attack, one B attack, and two C or D attacks[, or it makes …]
		if ((m = /^The \{X\} makes (.+? attacks?)\.$/.exec(s))) {
			const alt = a => {
				const items = a.split(/(?:, and |, | and )(?=(?:one|two|three|four|five|six|seven|eight) )/).map(it => {
					const k = /^(one|two|three|four|five|six|seven|eight) (.+?) attacks?$/.exec(it);
					if (!k) return null;
					const ns = k[2].split(/, or | or |, /).map(nm);
					if (!ns.every(Boolean)) return null;
					return `${NUM[k[1]]}次${ns.length > 1 ? `${ns.slice(0, -1).join("、")}${/ or /.test(k[2]) ? "或" : "、"}${ns.at(-1)}` : ns[0]}攻擊`;
				});
				return items.every(Boolean) ? (items.length > 1 ? `${items.slice(0, -1).join("、")}與${items.at(-1)}` : items[0]) : null;
			};
			const alts = m[1].split(/, or (?:it|he|she) makes /).map(alt);
			if (alts.every(Boolean)) return `${X}進行${alts.join("，或進行")}。`;
		}
		if ((m = /^(\d+)(?:st|nd|rd|th) level \((\d+) slots?\):$/.exec(s))) return `${m[1]} 環（${m[2]} 個法術位）：`;
		if (/^Cantrips? \(at will\):$/.test(s)) return "戲法（隨意）：";
		// makes three attacks: one with its bite and two with its claws or greatsword
		if ((m = /^The \{X\} makes (one|two|three|four|five|six|seven|eight) (?:melee )?attacks: (.+)\.$/.exec(s))) {
			const items = m[2].split(/, and |, | and /).map(it => {
				const k = /^(one|two|three|four|five|six|seven|eight) with its (.+)$/.exec(it);
				if (!k) return null;
				const ns = k[2].split(/ or (?:its )?/).map(nm);
				return ns.every(Boolean) ? `${NUM[k[1]]}次${ns.join("或")}` : null;
			});
			if (items.every(Boolean)) return `${X}進行${NUM[m[1]]}次攻擊：${items.length > 1 ? `${items.slice(0, -1).join("、")}，以及${items.at(-1)}` : items[0]}。`;
		}
		const cnt = "(one|two|three|four|five|six|seven|eight)";
		if ((m = new RegExp(`^The \\{X\\} makes ${cnt} (.+?) attacks?\\.$`).exec(s)) && nm(m[2])) return `${X}進行${NUM[m[1]]}次${nm(m[2])}攻擊。`;
		if ((m = new RegExp(`^The \\{X\\} makes ${cnt} (.+?) attacks? (and|or) ${cnt} (.+?) attacks?\\.$`).exec(s)) && nm(m[2]) && nm(m[5])) return `${X}進行${NUM[m[1]]}次${nm(m[2])}攻擊${m[3] === "and" ? "與" : "或"}${NUM[m[4]]}次${nm(m[5])}攻擊。`;
		if ((m = new RegExp(`^The \\{X\\} makes ${cnt} (.+?) attacks?,? and (?:it )?uses (.+?)(?:, if available)?\\.$`).exec(s)) && nm(m[2]) && nm(m[3])) return `${X}進行${NUM[m[1]]}次${nm(m[2])}攻擊，並使用「${nm(m[3])}」${/if available/.test(s) ? "（若可用）" : ""}。`;
		if ((m = new RegExp(`^The \\{X\\} makes ${cnt} (.+?) or (.+?) attacks?\\.$`).exec(s)) && nm(m[2]) && nm(m[3])) return `${X}進行${NUM[m[1]]}次${nm(m[2])}或${nm(m[3])}攻擊。`;
		if ((m = new RegExp(`^The \\{X\\} makes ${cnt} attacks: ${cnt} with its (.+?) and ${cnt} with its (.+?)\\.$`).exec(s)) && nm(m[3].toTitle()) && nm(m[5].toTitle())) return `${X}進行${NUM[m[1]]}次攻擊：${NUM[m[2]]}次${nm(m[3].toTitle())}與${NUM[m[4]]}次${nm(m[5].toTitle())}。`;
		if ((m = new RegExp(`^It can replace ${cnt} (?:of those )?attacks? with a use of (.+?)(?:, if available)?\\.$`).exec(s))) {
			const z = m[2] === "Spellcasting" ? "「施法」" : nm(m[2]) ? `「${nm(m[2])}」` : null;
			if (z) return `它可以將其中${NUM[m[1]]}次攻擊替換為使用${z}${/if available/.test(s) ? "（若可用）" : ""}。`;
		}
		const COMP = {material: "材料", spell: "法術", "somatic or material": "姿勢或材料", "verbal or somatic": "言語或姿勢", verbal: "言語", somatic: "姿勢", "verbal or material": "言語或材料"};
		if ((m = /^The \{X\} casts one of the following spells, (?:requiring no ([\w ]+?) components(?: and|,) )?using (\w+) as the spellcasting ability(?: \((?:spell save (\{@dc \d+\}))?(?:, )?(?:(\{@hit \d+\}) to hit with spell attacks)?\))?:$/.exec(s)) && (!m[1] || COMP[m[1].toLowerCase()]) && ABIL[m[2]])
			return `${X}施展下列法術之一，${m[1] ? `無需${COMP[m[1].toLowerCase()]}構材，` : ""}以${ABIL[m[2]]}作為施法屬性${m[3] || m[4] ? `（${[m[3] ? `法術豁免 ${m[3]}` : "", m[4] ? `法術攻擊命中 ${m[4]}` : ""].filter(Boolean).join("，")}）` : ""}：`;
		return null;
	};
	const lookup1 = s => {
		const x = d[s];
		if (x != null) return fin(x);
		for (const t of tpls.get(skeleton(s)) || []) { const z = applyTemplate(t, s); if (z != null) return fin(z); }
		return null;
	};
	const lookup = s => {
		for (const v of new Set([s, depron(s, "its"), depron(s, "it"), depron(s, null)])) { const z = lookup1(v); if (z != null) return z; }
		return null;
	};
	// 本怪物的動作／特性名稱在句子裡以 [[Name]] 標記（成為樣板欄位）
	const bracket = s => {
		const ks = Object.keys(names).filter(k => /^[A-Z]/.test(k) && k.length > 2).sort((a, b) => b.length - a.length);
		if (!ks.length) return s;
		const [mk, tags] = mask(s);
		const re = new RegExp(`(?<![\\w\\[])(${ks.map(escRe).join("|")})(?![\\w\\]])`, "g");
		return unmask(mk.replace(re, (m0, k, off) => off === 0 ? m0 : `[[${k}]]`), tags);
	};
	const unbracket = z => z.replace(/\[\[([^\]]+)\]\]/g, (_, k) => nm(k) ?? k);
	// 傷害開頭的句子，只需要翻後半（例如 ", and the target is {@condition grappled}…"）
	const residual = n => {
		let m;
		if ((m = /^(.+? damage), or (.+? damage) if used with two hands(?: to make a melee attack)?(?:,? plus (.+? damage))?(, (?:and|or) .+|\. .+)$/.exec(n)) && dmgList(m[1]) && dmgList(m[2])) return m[4];
		if ((m = /^(.+? damage)(, (?:and|or|plus|if) .+|\. .+| if .+| and .+)$/.exec(n)) && dmgList(m[1])) return m[2];
		return n;
	};
	const trSentence = s => { const n = norm(s.trim()); if (!n) return ""; const z = lookup(bracket(n)) ?? lookup(n) ?? rule(n) ?? rule(depron(n, "its")); return z == null ? z : unbracket(z); };
	const todo = [];
	const trText = s => {
		const whole0 = trSentence(s);
		if (whole0 != null) return whole0;
		const segs = s.split(MARK);
		const out = segs.map(seg => {
			if (MARK.test(seg) || !seg.trim()) return seg.trim() ? seg : "";
			const whole = trSentence(seg);
			if (whole != null) return whole;
			const sents = splitSentences(seg.trim());
			const zs = sents.map(x => { const z = trSentence(x); if (z == null) todo.push(depron(bracket(residual(norm(x.trim()))), null)); return z; });
			return zs.every(z => z != null) ? zs.join("") : null;
		});
		return out.every(z => z != null) ? out.join("") : null;
	};
	const trName = s => {
		let m;
		const dd = nm(s);
		if (dd) return dd;
		if ((m = /^(.+?) \{@recharge( \d)?\}$/.exec(s))) { const b = trName(m[1]); return b ? `${b} {@recharge${m[2] ?? ""}}` : null; }
		if ((m = /^(.+?) \(Spell; (\{@recharge[^}]*\})\)$/.exec(s))) { const b = trName(m[1]); return b ? `${b}（法術；${m[2]}）` : null; }
		if ((m = /^(.+?) \((\d+)\/Day(?: Each)?\)$/.exec(s))) { const b = trName(m[1]); return b ? `${b}（每日 ${m[2]} 次）` : null; }
		if ((m = /^(.+?) \(Costs (\d+) Actions\)$/.exec(s))) { const b = trName(m[1]); return b ? `${b}（消耗 ${m[2]} 個動作）` : null; }
		if ((m = /^(.+?) \(Recharges? after a (Short or Long|Long) Rest\)$/.exec(s))) { const b = trName(m[1]); return b ? `${b}（${m[2] === "Long" ? "長休" : "短休或長休"}後充能）` : null; }
		if ((m = /^(.+?) \(([^()]+)\)$/.exec(s))) { const b = trName(m[1]), f = d[`NAME:${m[2]}`]; return b && f ? `${b}（${f}）` : null; }
		return null;
	};
	return {trText, trName, todo, names, norm};
}
String.prototype.toTitle = function () { return this.replace(/\b[a-z]/g, c => c.toUpperCase()); };

// ---- CLI ---------------------------------------------------------------------
const [cmd, src, arg3, prop = "monster"] = process.argv.slice(2); // 第 4 個參數可指定 prop（例如 legendaryGroup）
if (["todo", "make", "names"].includes(cmd)) {
	const tmp = cmd === "make" ? arg3 : `_m14-${prop === "monster" ? "" : prop + "-"}${src.toLowerCase()}`;
	const enFile = new URL(`work/${tmp}.en.json`, ROOT);
	if (!fs.existsSync(enFile)) execFileSync("node", ["scripts/tr.mjs", "export", tmp, "--prop", prop, "--source", src], {cwd: ROOT});
	const en = JSON.parse(fs.readFileSync(enFile, "utf8"));
	// 預設只處理 dist 中尚未完整翻譯的怪物（環境變數 ALL=1 則全部）；hazmole 已完整翻好的保留原譯
	if (prop === "monster" && !process.env.ALL) {
		const full = new Set();
		const dir = new URL("dist/data/bestiary/", ROOT);
		const isEn = v => typeof v === "string" ? /[A-Za-z]{4,}/.test(v.replace(/\{@[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, "")) && !hasCjk(v) : Array.isArray(v) ? v.some(isEn) : v && typeof v === "object" ? Object.entries(v).some(([k, x]) => !["name", "_zhOf", "type", "style", "source", "ability", "spells", "will", "daily", "hidden", "displayAs", "rest", "ritual", "recharge", "charges"].includes(k) && isEn(x)) : false;
		if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).filter(f => f.startsWith("bestiary-"))) for (const m of JSON.parse(fs.readFileSync(new URL(f, dir), "utf8")).monster || []) {
			if (m.name_zh && !["trait", "action", "bonus", "reaction", "legendary", "mythic", "spellcasting"].some(k => isEn(m[k]))) full.add(`${m.name}|${m.source.toUpperCase()}`);
		}
		const n0 = en.items.length;
		en.items = en.items.filter(it => !full.has(it.key.toUpperCase().replace(/^(.*)\|/, (x, n) => `${it.s[0]}|`)));
		if (en.items.length !== n0) console.error(`（略過 ${n0 - en.items.length} 隻已完整翻譯的怪物）`);
	}
	const dict = loadDict();
	const zhOf = it => dict.d[`NAME:${it.s[0]}`] ?? it.hint?.[it.s[0]] ?? OLD[it.s[0].toLowerCase()];
	if (cmd === "names") { for (const it of en.items) console.log(`${it.s[0]}\t${zhOf(it) ?? ""}`); process.exit(0); }
	const zhOut = {}, todoAll = [], nameTodo = new Map();
	let nDone = 0;
	for (const it of en.items) {
		const zhName = zhOf(it);
		if (!zhName) nameTodo.set(it.s[0], (nameTodo.get(it.s[0]) || 0) + 1);
		const t = makeTranslator(dict, it.s[0], zhName || it.s[0], it.hint || {}, it.s.slice(1));
		const isName = s => s.length < 60 && !/[.:]$/.test(s) && !s.startsWith("{@");
		for (const s of it.s.slice(1)) if (isName(s)) { const z = t.trName(s); if (z) t.names[s.replace(/ \{@recharge.*|\s*\(.*\)$/g, "")] = z.replace(/ \{@recharge.*|（.*）$/g, ""); }
		const z = it.s.map((s, i) => {
			if (i === 0) return zhName ?? null;
			if (isName(s)) { const n = t.trName(s); if (n) return n; const n0 = t.todo.length; const x = t.trText(s); if (x == null) { t.todo.length = n0; const k = s.replace(/ \{@recharge.*$| \((\d+)\/Day.*\)$| \(Costs \d+ Actions\)$| \(Recharges? after.*\)$/, ""); nameTodo.set(k, (nameTodo.get(k) || 0) + 1); } return x; }
			return t.trText(s);
		});
		todoAll.push(...t.todo);
		if (z.every(x => x != null)) { zhOut[it.key] = z; nDone++; }
	}
	// 同骨架只列一句
	const bySk = new Map();
	for (const s of todoAll) { const sk = skeleton(s); const e = bySk.get(sk); if (e) e.n++; else bySk.set(sk, {s, n: 1}); }
	const list = [...bySk.values()].sort((a, b) => b.n - a.n || a.s.localeCompare(b.s));
	if (cmd === "todo") {
		const lim = +arg3 || 15000;
		if (nameTodo.size) console.log("## 名稱（NAME:）\n" + [...nameTodo].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${n}\t${k}`).join("\n"));
		let c = 0; console.log("## 句子");
		for (const e of list) { if (c > lim) break; console.log(`${e.n}\t${e.s}`); c += e.s.length; }
	}
	console.log(`\n${src}：完成 ${nDone}/${en.items.length} 隻；待翻名稱 ${nameTodo.size}、句子 ${list.length}（${list.reduce((a, e) => a + e.s.length, 0)} 字元）`);
	if (cmd === "make") { fs.writeFileSync(new URL(`work/${tmp}.zh.json`, ROOT), JSON.stringify(zhOut, null, "\t")); console.log(`已寫入 work/${tmp}.zh.json`); }
}
