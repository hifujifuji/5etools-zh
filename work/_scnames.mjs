import fs from "fs";
export const SCN = {
 "Path of the Beast": "野獸道途", "Path of Wild Magic": "狂野魔法道途", "Path of the Giant": "巨人道途",
 "College of Creation": "創造學院", "College of Eloquence": "雄辯學院", "College of Spirits": "靈魂學院", "College of the Moon": "月之學院",
 "Ambition Domain (PSA)": "野心領域（PSA）", "Solidarity Domain (PSA)": "團結領域（PSA）", "Strength Domain (PSA)": "力量領域（PSA）", "Zeal Domain (PSA)": "熱忱領域（PSA）",
 "Peace Domain": "和平領域", "Twilight Domain": "暮光領域",
 "Circle of Stars": "星辰結社", "Circle of Wildfire": "野火結社",
 "Echo Knight": "回聲騎士", "Psi Warrior": "靈能戰士", "Rune Knight": "符文騎士", "Banneret": "旗手",
 "Way of Mercy": "慈悲之道", "Way of the Astral Self": "星界自我之道", "Way of the Ascendant Dragon": "升龍之道",
 "Order of the Avatar": "化身會", "Order of the Awakened": "覺醒會", "Order of the Immortal": "不朽會", "Order of the Nomad": "遊牧會", "Order of the Soul Knife": "靈魂之刃會", "Order of the Wu Jen": "巫人會",
 "Oath of Glory": "榮耀之誓", "Oath of the Watchers": "守望之誓", "Oath of the Noble Genies": "高貴巨靈之誓",
 "Fey Wanderer": "妖精漫遊者", "Swarmkeeper": "蟲群守護者", "Drakewarden": "幼龍守衛", "Winter Walker": "冬行者",
 "Phantom": "幻影", "Soulknife": "靈魂之刃", "Scion of the Three": "三神後裔",
 "Pyromancer (PSK)": "火術師（PSK）", "Aberrant Mind": "異怪心智", "Clockwork Soul": "機械靈魂", "Lunar Sorcery": "月之術法", "Spellfire Sorcery": "法術之火術法",
 "The Fathomless": "深海宗主", "The Genie": "巨靈宗主", "The Undead": "不死宗主",
 "School of Conjuration": "咒法學派", "Chronurgy Magic": "時間魔法", "Graviturgy Magic": "重力魔法", "Order of Scribes": "抄寫者教團", "Bladesinger": "劍詠者",
};
if (process.argv[1]?.endsWith("_scnames.mjs")) {
	const p = "i18n/custom/subclass.json";
	const cur = JSON.parse(fs.readFileSync(p));
	let n = 0;
	for (const f of fs.readdirSync("dist/data/class").filter(f => /^class-/.test(f))) {
		const j = JSON.parse(fs.readFileSync("dist/data/class/" + f));
		for (const s of j.subclass || []) {
			if (s.name_zh || !SCN[s.name]) continue;
			const key = `${s.name}|${s.className}|${s.source}`;
			if (cur[key]) continue;
			cur[key] = {name: SCN[s.name]}; n++;
		}
	}
	fs.writeFileSync(p, JSON.stringify(cur, null, "\t") + "\n");
	console.log("added", n);
}
