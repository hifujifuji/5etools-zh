// XMM 怪物翻譯引擎：規則 + 共用字典
//   node work/lib/mon.mjs todo <from> <to>    列出尚未翻譯的句子（已正規化 {X}＝怪物自稱）
//   node work/lib/mon.mjs make <from> <to> <batch>  產生 work/<batch>.en/zh.json（全部翻好才會寫）
import fs from "node:fs";
import {execFileSync} from "node:child_process";

const DIR = new URL("../mon/", import.meta.url);
fs.mkdirSync(DIR, {recursive: true});
const loadDict = () => {
	const out = {};
	for (const f of fs.readdirSync(DIR).filter(f => f.endsWith(".json")).sort()) Object.assign(out, JSON.parse(fs.readFileSync(new URL(f, DIR), "utf8")));
	return out;
};

// 舊翻譯裡的怪物／物品名稱（小寫），當作名稱的後備
const OLD = (() => { try { const n = JSON.parse(fs.readFileSync(new URL("../../i18n/hazmole/_names.json", import.meta.url), "utf8")); return {...n.item, ...n.monster}; } catch { return {}; } })();
export const DMG = {Acid: "強酸", Bludgeoning: "鈍擊", Cold: "寒冷", Fire: "火焰", Force: "力場", Lightning: "閃電", Necrotic: "黯蝕", Piercing: "穿刺", Poison: "毒素", Psychic: "心靈", Radiant: "光耀", Slashing: "劈砍", Thunder: "雷鳴"};
const NUM = {one: "一", two: "兩", three: "三", four: "四", five: "五", six: "六", seven: "七", eight: "八"};
const SIZE = {Tiny: "微型", Small: "小型", Medium: "中型", Large: "大型", Huge: "超大型", Gargantuan: "巨型"};
const ABIL = {Strength: "力量", Dexterity: "敏捷", Constitution: "體質", Intelligence: "智力", Wisdom: "感知", Charisma: "魅力"};

// 遮住標籤，避免在標籤內斷句
const mask = s => { const tags = []; const m = s.replace(/\{@[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, t => `\u0000${tags.push(t) - 1}\u0000`); return [m, tags]; };
const unmask = (s, tags) => s.replace(/\u0000(\d+)\u0000/g, (_, i) => tags[i]);
const splitSentences = s => {
	const [m, tags] = mask(s);
	return m.split(/(?<=[.!?:])\s+(?=[A-Z\u0000(*"])/).map(x => unmask(x, tags));
};
// 以動作標記切段
const MARK = /(\{@(?:h|hom|actSaveFail|actSaveFailBy|actSaveSuccess|actSaveSuccessOrFail|actTrigger|actResponse)(?: \w+)?\})/;

const dmgList = s => {
	// "7 ({@damage 1d8 + 3}) Bludgeoning damage plus 11 ({@damage 2d10}) Lightning damage"
	const one = /^(\d+) \((\{@damage [^}]+\})\) (\w+) damage$/;
	const flat = /^(\d+) (\w+) damage$/;
	const parts = s.split(" plus ");
	const zh = parts.map(p => { let m = one.exec(p); if (m && DMG[m[3]]) return `${m[1]}（${m[2]}）${DMG[m[3]]}傷害`; m = flat.exec(p); return m && DMG[m[2]] ? `${m[1]} 點${DMG[m[2]]}傷害` : null; });
	return zh.every(Boolean) ? zh.join("外加 ") : null;
};

export function makeTranslator (dict, ent, zhName) {
	// 找出怪物在內文中的自稱（名稱中連續的字詞）
	const words = ent.name.toLowerCase().replace(/\(.*?\)/g, "").split(/\s+/).filter(Boolean);
	const refs = [];
	for (let i = 0; i < words.length; ++i) for (let j = words.length; j > i; --j) refs.push(words.slice(i, j).join(" "));
	for (const w of words) for (const p of w.split("-")) if (p.length > 2) refs.push(p);
	for (const a of dict[`REF:${ent.name}`] || []) refs.push(a);
	const noRef = new Set(dict[`NOREF:${ent.name}`] || []);
	for (let i = refs.length - 1; i >= 0; --i) if (noRef.has(refs[i])) refs.splice(i, 1);
	refs.sort((a, b) => b.length - a.length);
	const reRef = refs.length ? new RegExp(`\\b([Tt]he|[Tt]his) (${refs.map(r => r.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "g") : null;
	const norm = s => reRef ? s.replace(reRef, (_, t) => `${t} {X}`) : s;
	const X = zhName;
	const names = {}; // 本怪物的動作名稱 英→中（Multiattack 用）

	const rule = s => {
		let m;
		const nm = o => names[o] ?? dict[`NAME:${o}`] ?? OLD[o.toLowerCase()];
		if ((m = /^\{@atkr ([mr,]+)\} \{@hit (-?\d+)\}(?: to hit)?, (.+?)\.?$/.exec(s))) {
			const rr = m[3].replace(/reach (\d+) (?:ft\.?|feet)/, "觸及 $1 呎").replace(/range ([\d/]+) (?:ft\.?|feet)/, "射程 $1 呎").replace(" or ", "或");
			if (!/[a-z]{3}/.test(rr)) return `{@atkr ${m[1]}} {@hit ${m[2]}}，${rr}。`;
		}
		if ((m = /^(.+ damage)\.$/.exec(s))) { const d = dmgList(m[1]); if (d) return `${d}。`; }
		if ((m = /^(.+? damage), (and|or|then) (.+)$/.exec(s))) {
			const d = dmgList(m[1]); const r = dict[`, ${m[2]} ${m[3]}`];
			if (d && r != null) return `${d}${r.replaceAll("{X}", X)}`;
		}
		if ((m = /^The \{X\} uses Spellcasting to cast (\{@spell [^}]+\})( \(level (\d) version\))?\.$/.exec(s))) return `${X}使用「施法」施展${m[1]}${m[3] ? `（${m[3]} 環版本）` : ""}。`;
		if ((m = /^It can replace (one|two|any) attacks? with a use of (.+)\.$/.exec(s))) {
			const opt = o => { let k; if ((k = /^Spellcasting to cast (\{@spell [^}]+\})(?: \(level (\d) version\))?$/.exec(o))) return `「施法」施展${k[1]}${k[2] ? `（${k[2]} 環版本）` : ""}`; const a = names[o] ?? dict[`NAME:${o}`]; return a ? `「${a}」` : null; };
			let k, z;
			if ((k = /^\(A\) (.+) or \(B\) (.+)$/.exec(m[2]))) { const a = opt(k[1]), b = opt(k[2]); z = a && b ? `(A) ${a}或 (B) ${b}` : null; } else z = opt(m[2]);
			if (z) return `它可以將${m[1] === "one" ? "其中一次" : m[1] === "two" ? "其中兩次" : "任何一次"}攻擊替換為使用${z}。`;
		}
		if ((m = /^\{@actSave (\w+)\} (\{@dc \d+\}), (.+)\.$/.exec(s))) { const a = area(m[3]); if (a) return `{@actSave ${m[1]}} ${m[2]}，${a}。`; }
		if ((m = /^\{@actSave (\w+)\} (\{@dc \d+\})\.$/.exec(s))) return `{@actSave ${m[1]}} ${m[2]}。`;
		if ((m = /^(\d+):$/.exec(s))) return `${m[1]}：`;
		if ((m = /^The \{X\} adds (\d+) to its AC against that attack, possibly causing it to miss\.$/.exec(s))) return `${X}對該攻擊的 AC 加 ${m[1]}，可能使該攻擊未命中。`;
		if ((m = /^(\{@actSave \w+\} \{@dc \d+\}) \((.+)\)\.$/.exec(s)) && dict[`PAREN:${m[2]}`]) return `${m[1]}（${dict[`PAREN:${m[2]}`]}）。`;
		if ((m = /^The \{X\} makes (one|two|three|four) (.+?) attacks? or (one|two|three|four) (.+?) attacks?\.$/.exec(s))) {
			const a = nm(m[2]), b = nm(m[4]);
			if (a && b) return `${X}進行${NUM[m[1]]}次${a}攻擊或${NUM[m[3]]}次${b}攻擊。`;
		}
		if ((m = /^If the target is an? (\w+) or smaller creature, it has the (\{@condition [^}]+\}) condition( \(escape (\{@dc \d+\})\))?\.$/.exec(s)) && SIZE[m[1]])
			return `若目標是${SIZE[m[1]]}或更小的生物，它處於${m[2]}狀態${m[3] ? `（脫逃 ${m[4]}）` : ""}。`;
		const turn = t => t.replace(/^the end of its next turn$/, "其下個回合結束").replace(/^the start of its next turn$/, "其下個回合開始").replace(/^the end of the \{X\}'s next turn$/, `${X}的下個回合結束`).replace(/^the start of the \{X\}'s next turn$/, `${X}的下個回合開始`);
		if ((m = /^The target has the (\{@condition [^}]+\}) condition until (.+)\.$/.exec(s)) && !/[a-z]/.test(turn(m[2]).replace(/\{@[^}]+\}/g, ""))) return `目標處於${m[1]}狀態直到${turn(m[2])}。`;
		if ((m = /^(.+? damage), and the target has the (\{@condition [^}]+\}) condition until (.+)\.$/.exec(s)) && dmgList(m[1]) && !/[a-z]/.test(turn(m[3]))) return `${dmgList(m[1])}，且目標處於${m[2]}狀態直到${turn(m[3])}。`;
		if ((m = /^(.+? damage), and the target has the (\{@condition [^}]+\}) condition\.$/.exec(s)) && dmgList(m[1])) return `${dmgList(m[1])}，且目標處於${m[2]}狀態。`;
		if ((m = /^The \{X\} makes (one|two|three|four|five|six) attacks, using (.+?) or (.+?) in any combination(?:, and (?:it )?uses (.+?))?\.$/.exec(s))) {
			const a = nm(m[2]), b = nm(m[3]), c = m[4] ? nm(m[4]) : "";
			if (a && b && c != null) return `${X}進行${NUM[m[1]]}次攻擊，以${a}或${b}任意組合${m[4] ? `，並使用「${c}」` : ""}。`;
		}
		if ((m = /^The \{X\} makes (one|two|three|four) (.+?) attacks? and (one|two|three|four) (.+?) attacks?\.$/.exec(s))) {
			const a = nm(m[2]), b = nm(m[4]);
			if (a && b) return `${X}進行${NUM[m[1]]}次${a}攻擊與${NUM[m[3]]}次${b}攻擊。`;
		}
		if ((m = /^The \{X\} makes (one|two|three|four|five|six) (.+?) attacks? and uses (.+?)\.$/.exec(s))) {
			const a = nm(m[2]), b = nm(m[3]);
			if (a && b) return `${X}進行${NUM[m[1]]}次${a}攻擊，並使用「${b}」。`;
		}
		if ((m = /^The \{X\} casts (\{@spell [^}]+\}) in response to that spell's trigger, using the same spellcasting ability as Spellcasting\.$/.exec(s))) return `${X}在該法術的觸發條件發生時施展${m[1]}，使用與「施法」相同的施法屬性。`;
		if ((m = /^The \{X\} casts (\{@spell [^}]+\}), using the same spellcasting ability as Spellcasting\.$/.exec(s))) return `${X}施展${m[1]}，使用與「施法」相同的施法屬性。`;
		if ((m = /^The \{X\} makes (one|two|three|four|five|six) (.+?) attacks?\.$/.exec(s))) {
			const a = names[m[2]] ?? dict[`NAME:${m[2]}`];
			if (a) return `${X}進行${NUM[m[1]]}次${a}攻擊。`;
		}
		const COMP = {Material: "材料", spell: "法術", "Somatic or Material": "姿勢或材料", "Verbal or Somatic": "言語或姿勢", Verbal: "言語", Somatic: "姿勢"};
		if ((m = /^The \{X\} casts one of the following spells, (?:requiring no ([\w ]+?) components(?: and|,) )?using (\w+) as the spellcasting ability(?: \(spell save (\{@dc \d+\})(?:, (\{@hit \d+\}) to hit with spell attacks)?\))?:$/.exec(s)) && (!m[1] || COMP[m[1]]))
			return `${X}施展下列法術之一，${m[1] ? `無需${COMP[m[1]]}成分，` : ""}以${ABIL[m[2]]}作為施法屬性${m[3] ? `（法術豁免 ${m[3]}${m[4] ? `，法術攻擊 ${m[4]}` : ""}）` : ""}：`;
		if ((m = /^The \{X\} casts (?:the )?((?:\{@spell [^}]+\}(?:, | or |, or )?)+)(?: spell)?(?: on itself)?( in response to (?:that|the) spell's trigger)?,(?: requiring no ([\w ]+?) components and)? using the same spellcasting ability as Spellcasting\.$/.exec(s)) && (!m[3] || COMP[m[3]]))
			return `${X}${m[2] ? "在該法術的觸發條件發生時" : ""}施展${m[1].replace(/, or /g, "或").replace(/ or /g, "或").replace(/, /g, "、")}${m[3] ? `，無需${COMP[m[3]]}成分` : ""}，使用與「施法」相同的施法屬性。`;
		if ((m = /^The \{X\} casts (\{@spell [^}]+\})(?: \(level (\d) version\))?( on itself)?, requiring no ([\w ]+?) components and using (\w+) as the spellcasting ability(?: \(spell save (\{@dc \d+\})\))?\.$/.exec(s)) && COMP[m[4]])
			return `${X}${m[3] ? "對自己" : ""}施展${m[1]}${m[2] ? `（${m[2]} 環版本）` : ""}，無需${COMP[m[4]]}成分，以${ABIL[m[5]]}作為施法屬性${m[6] ? `（法術豁免 ${m[6]}）` : ""}。`;
		if ((m = /^Immediately after dealing damage to a creature that (?:is|was) already \{@status Bloodied\|XPHB\}, the \{X\} (can )?moves? up to half its \{@variantrule Speed\|XPHB\}, and it makes one (.+?) attack\.$/.exec(s)) && nm(m[2]))
			return `在對一個已處於{@status Bloodied|XPHB}狀態的生物造成傷害後，${X}${m[1] ? "可以" : ""}立即移動至多其{@variantrule Speed|XPHB}的一半，並進行一次${nm(m[2])}攻擊。`;
		return null;
	};
	const area = a => {
		let m;
		if ((m = /^each (creature|enemy) in an? (\d+)-foot (\{@variantrule (Cone|Cube|Emanation|Sphere) \[Area of Effect\]\|XPHB\|\w+\})( originating from the \{X\})?$/.exec(a)))
			return `${m[5] ? `從${X}發出的 ` : ""}${m[2]} 呎${m[3].replace(/\|\w+\}$/, `|${{Cone: "錐形", Cube: "立方", Emanation: "散發", Sphere: "球形"}[m[4]]}}`)}範圍內的每個${m[1] === "enemy" ? "敵人" : "生物"}`;
		if ((m = /^each creature in an? (\d+)-foot-long, (\d+)-foot-wide \{@variantrule Line \[Area of Effect\]\|XPHB\|Line\}$/.exec(a)))
			return `長 ${m[1]} 呎、寬 ${m[2]} 呎{@variantrule Line [Area of Effect]|XPHB|直線}範圍內的每個生物`;
		if ((m = /^one creature the \{X\} can see within (\d+) feet$/.exec(a))) return `${X} ${m[1]} 呎內一個它能看見的生物`;
		if ((m = /^each creature in an? (\d+)-foot-radius \{@variantrule Sphere \[Area of Effect\]\|XPHB\|Sphere\} centered on a point the \{X\} can see within (\d+) feet$/.exec(a)))
			return `以${X} ${m[2]} 呎內一個它能看見之點為中心、${m[1]} 呎半徑{@variantrule Sphere [Area of Effect]|XPHB|球形}範圍內的每個生物`;
		if ((m = /^each creature that isn't currently affected by this breath in an? (\d+)-foot \{@variantrule Cone \[Area of Effect\]\|XPHB\|Cone\}$/.exec(a)))
			return `${m[1]} 呎{@variantrule Cone [Area of Effect]|XPHB|錐形}範圍內每個目前未受此吐息影響的生物`;
		if ((m = /^one creature within (\d+) feet$/.exec(a))) return `${X} ${m[1]} 呎內的一個生物`;
		if ((m = /^each creature within (\d+) feet$/.exec(a))) return `${X} ${m[1]} 呎內的每個生物`;
		const d = dict[`AREA:${a}`];
		return d ? d.replaceAll("{X}", X) : null;
	};
	const trSentence = s => {
		const n = norm(s.trim());
		if (!n) return "";
		const r = rule(n);
		if (r != null) return r;
		const d = dict[n];
		if (d != null) return d.replaceAll("{X}", X);
		return null;
	};
	const todo = [];
	const trText = s => {
		const segs = s.split(MARK);
		const out = segs.map(seg => {
			if (MARK.test(seg) || !seg.trim()) return seg;
			const whole = trSentence(seg);
			if (whole != null) return whole;
			const sents = splitSentences(seg.trim());
			const zs = sents.map(x => { const z = trSentence(x); if (z == null) todo.push(norm(x.trim())); return z; });
			return zs.every(z => z != null) ? zs.join("") : null;
		});
		return out.every(z => z != null) ? out.join("").replace(/(\{@(?:h|hom|actSaveFail|actSaveSuccess|actSaveSuccessOrFail|actTrigger|actResponse)\})\s+/g, "$1").replace(/\s+(\{@(?:hom|actSaveFail|actSaveSuccess|actSaveSuccessOrFail|actResponse)\})/g, "$1") : null;
	};
	const trName = s => {
		let m;
		const d = dict[`NAME:${s}`] ?? OLD[s.toLowerCase()];
		if (d) return d;
		if ((m = /^(\d+):$/.exec(s))) return `${m[1]}：`;
		if ((m = /^The \{X\} adds (\d+) to its AC against that attack, possibly causing it to miss\.$/.exec(s))) return `${X}對該攻擊的 AC 加 ${m[1]}，可能使該攻擊未命中。`;
		if ((m = /^(\{@actSave \w+\} \{@dc \d+\}) \((.+)\)\.$/.exec(s)) && dict[`PAREN:${m[2]}`]) return `${m[1]}（${dict[`PAREN:${m[2]}`]}）。`;
		if ((m = /^The \{X\} makes (one|two|three|four) (.+?) attacks? or (one|two|three|four) (.+?) attacks?\.$/.exec(s))) {
			const a = nm(m[2]), b = nm(m[4]);
			if (a && b) return `${X}進行${NUM[m[1]]}次${a}攻擊或${NUM[m[3]]}次${b}攻擊。`;
		}
		if ((m = /^(\d+): (.+)$/.exec(s))) { const b = trName(m[2]); return b ? `${m[1]}：${b}` : null; }
		if ((m = /^(.+?) \{@recharge( \d)?\}$/.exec(s))) { const b = trName(m[1]); return b ? `${b} {@recharge${m[2] ?? ""}}` : null; }
		if ((m = /^(.+?) \((\d+)\/Day(?: Each)?\)$/.exec(s))) { const b = trName(m[1]); return b ? `${b}（每日 ${m[2]} 次）` : null; }
		if ((m = /^(.+?) \((\d+)\/Day, or (\d+)\/Day in Lair\)$/.exec(s))) { const b = trName(m[1]); return b ? `${b}（每日 ${m[2]} 次，在巢穴中為每日 ${m[3]} 次）` : null; }
		if ((m = /^(.+?) \(Recharges? after a (Short or Long|Long) Rest\)$/.exec(s))) { const b = trName(m[1]); return b ? `${b}（${m[2] === "Long" ? "長休" : "短休或長休"}後充能）` : null; }
		if ((m = /^(.+?) \(([^()]+)\)$/.exec(s))) { const b = trName(m[1]), f = dict[`NAME:${m[2]}`]; return b && f ? `${b}（${f}）` : null; }
		return null;
	};
	return {trText, trName, todo, names, norm};
}

// ---- CLI ---------------------------------------------------------------------
const [cmd, from, to, batch] = process.argv.slice(2);
if (cmd === "todo" || cmd === "make") {
	const ROOT = new URL("../../", import.meta.url);
	const tmp = batch || "_mon";
	execFileSync("node", ["scripts/tr.mjs", "export", tmp, "--prop", "monster", "--source", "XMM", "--from", from, "--to", to], {cwd: ROOT});
	const en = JSON.parse(fs.readFileSync(new URL(`work/${tmp}.en.json`, ROOT), "utf8"));
	const dict = loadDict();
	const zhOut = [], todoAll = [], nameTodo = new Set();
	for (const it of en.items) {
		const zhName = dict[`NAME:${it.s[0]}`] ?? it.hint?.[it.s[0]] ?? OLD[it.s[0].toLowerCase()];
		if (!zhName) nameTodo.add(it.s[0]);
		const t = makeTranslator(dict, {name: it.s[0]}, zhName || it.s[0]);
		// 先收集本怪物的動作名稱
		const isName = s => s.length < 60 && !/[.:]$/.test(s) && !s.startsWith("{@");
		for (const s of it.s.slice(1)) if (isName(s)) { const z = t.trName(s); if (z) t.names[s.replace(/ \{@recharge.*|\s*\(.*\)$/g, "")] = z.replace(/ \{@recharge.*|（.*）$/g, ""); }
		const z = it.s.map((s, i) => {
			if (i === 0) return zhName;
			if (isName(s)) { const n = t.trName(s); if (n) return n; if (!t.trText(s)) { nameTodo.add(s.replace(/ \{@recharge.*$| \((\d+)\/Day.*\)$/, "")); return null; } }
			return t.trText(s);
		});
		todoAll.push(...t.todo);
		zhOut.push(z);
	}
	const uniq = [...new Set(todoAll)];
	if (cmd === "todo" || uniq.length || nameTodo.size) {
		if (nameTodo.size) console.log("## 名稱（寫成 \"NAME:英文\": \"中文\"）\n" + [...nameTodo].join("\n"));
		if (uniq.length) console.log("## 句子\n" + uniq.join("\n"));
		console.log(`\n共 ${en.items.length} 隻；待翻名稱 ${nameTodo.size}、句子 ${uniq.length}（${uniq.join("").length} 字元）`);
		if (cmd === "make") process.exit(1);
	} else {
		fs.writeFileSync(new URL(`work/${tmp}.zh.json`, ROOT), JSON.stringify(zhOut));
		console.log(`已產生 work/${tmp}.zh.json（${zhOut.length} 隻）`);
	}
}
