import fs from "node:fs";
const en = JSON.parse(fs.readFileSync("work/xphb-bg.en.json", "utf8"));
const NAME = {Acolyte: "侍僧", Artisan: "工匠", Charlatan: "詐欺師", Criminal: "罪犯", Entertainer: "藝人", Farmer: "農夫", Guard: "衛兵", Guide: "嚮導", Hermit: "隱士", Merchant: "商人", Noble: "貴族", Sage: "賢者", Sailor: "水手", Scribe: "抄寫員", Soldier: "士兵", Wayfarer: "流浪者"};
const FIX = {"Ability Scores:": "屬性值：", "Feat:": "專長：", "Skill Proficiencies:": "技能熟練：", "Tool Proficiency:": "工具熟練：", "Equipment:": "裝備："};
const ABIL = {Strength: "力量", Dexterity: "敏捷", Constitution: "體質", Intelligence: "智力", Wisdom: "感知", Charisma: "魅力"};
const CLS = {Cleric: "牧師", Druid: "德魯伊", Wizard: "法師"};
const DISP = {"2 Daggers": "2 把匕首", "Pouches": "囊袋", "2 Pouches": "2 個囊袋", "2 Costumes": "2 套戲服", "Bolts": "弩矢", "20 Arrows": "20 支箭", "Book (prayers)": "書（祈禱文）"};
const miss = [];
const tr = s => {
	if (FIX[s]) return FIX[s];
	if (/^(\w+), (\w+), (\w+)$/.test(s)) return s.split(", ").map(a => ABIL[a]).join("、");
	let m;
	if ((m = /^(\{@feat [^}]+\}) \((\w+)\)$/.exec(s))) return `${m[1]}（${CLS[m[2]]}）`;
	if ((m = /^Choose one kind of (\{@item [^}]+\})$/.exec(s))) return `選擇一種${m[1]}`;
	if (/^\{@skill [^}]+\}, \{@skill [^}]+\}$/.test(s)) return s.replace(", ", "、");
	if (s.startsWith("Choose A or B: ")) {
		let t = s.replace("Choose A or B: ", "選擇 A 或 B：").replace("; or (B) 50 GP", "；或 (B) 50 GP")
			.replace(/\{@item ([^|}]+)\|([^|}]+)\|([^}]+)\}/g, (all, a, b, c) => DISP[c] ? `{@item ${a}|${b}|${DISP[c]}}` : (miss.push(c), all))
			.replace(/ \(same as above\)/g, "（同上）").replace(/ \((\d+) sheets\)/g, "（$1 張）").replace(/ \((\d+) flasks\)/g, "（$1 瓶）")
			.replace(" (philosophy)", "（哲學）").replace(" (history)", "（歷史）").replace(" (any)", "（任一種）")
			.replace(/(\d+) \{@item/g, "$1 {@item").replace(/, /g, "、");
		if (/[a-z]{3,}(?![^{]*\})/.test(t.replace(/\{@[^}]+\}/g, ""))) miss.push(t);
		return t;
	}
	miss.push(s); return s;
};
const out = en.items.map(it => it.s.map((s, i) => i === 0 ? NAME[s] : tr(s)));
if (miss.length) { console.log(miss); process.exit(1); }
fs.writeFileSync("work/xphb-bg.zh.json", JSON.stringify(out));
console.log(out[0], out[3]);
