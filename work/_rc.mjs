// 種族常用句（2014/MPMM 風格），fill 的 null 會先查翻譯記憶再查這裡
const DV = n => `你能在你 ${n} 呎內的微光中視物，如同在明亮光照中一樣；在黑暗中視物，如同在微光中一樣。你在黑暗中只能辨別灰階，無法辨別顏色。`;
export const RC = {
	"You can see in dim light within 60 feet of you as if it were bright light and in darkness as if it were dim light. You discern colors in that darkness only as shades of gray.": DV(60),
	"You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You discern colors in that darkness only as shades of gray.": DV(60),
	"You can see in dim light within 60 feet of you as if it were bright light and in darkness as if it were in dim light. You discern colors in that darkness only as shades of gray.": DV(60),
	"You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were in dim light. You discern colors in that darkness only as shades of gray.": DV(60),
	"You can see in dim light within 120 feet of you as if it were bright light and in darkness as if it were dim light. You discern colors in that darkness only as shades of gray.": DV(120),
	"You can see in dim light within 120 feet of you as if it were bright light, and in darkness as if it were dim light. You discern colors in that darkness only as shades of gray.": DV(120),
	"Suggested Characteristics": "建議特徵", "Personality Trait": "個性特徵", "Ideal": "理想", "Bond": "牽絆", "Flaw": "缺點",
	"Skill Proficiencies:": "技能熟練：", "Tool Proficiencies:": "工具熟練：", "Languages:": "語言：", "Equipment:": "裝備：", "Feature:": "特性：",
	"d4": "d4", "d6": "d6", "d8": "d8", "d10": "d10", "d12": "d12", "d20": "d20",
	"One of your choice": "一種自選語言", "Two of your choice": "兩種自選語言", "Any one of your choice": "任一種自選語言",
	"Age": "年齡", "Size": "體型", "Alignment": "陣營", "Languages": "語言", "Speed": "速度", "Darkvision": "黑暗視覺",
	"Your size is Medium.": "你的體型為中型。",
	"Your size is Small.": "你的體型為小型。",
	"Your base walking speed is 30 feet.": "你的基礎步行速度為 30 呎。",
	"Your base walking speed is 25 feet.": "你的基礎步行速度為 25 呎。",
	"You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray.": DV(60),
	"You can see in dim light within 60 feet of yourself as if it were bright light, and in darkness as if it were dim light. You discern colors in that darkness only as shades of gray.": DV(60),
	"You can speak, read, and write Common.": "你能說、讀、寫通用語。",
	"You can speak, read, and write Common and one other language of your choice.": "你能說、讀、寫通用語，以及一種自選語言。",
	"You can speak, read, and write Common and two other languages of your choice.": "你能說、讀、寫通用語，以及兩種自選語言。",
	"You gain one skill proficiency and one tool proficiency of your choice.": "你獲得一項自選技能的熟練與一種自選工具的熟練。",
	"You are an Ooze.": "你是泥怪。",
	"Thanks to your heritage, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray.": "由於你的血統，你在黑暗與微光環境中擁有優越的視力。" + DV(60),
	"Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray.": "由於習慣了暮光森林與夜空，你在黑暗與微光環境中擁有優越的視力。" + DV(60),
	"Accustomed to life underground in your race's ancient past, you have superior vision in dark and dim conditions. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light. You can't discern color in darkness, only shades of gray.": "由於你的種族在遠古時期習慣了地底生活，你在黑暗與微光環境中擁有優越的視力。" + DV(60),
	"You can see in dim light within 60 feet of you as if it were bright light and in darkness as if it were dim light. You discern colors in that darkness as shades of gray.": DV(60),
	"You are Medium or Small. You choose the size when you gain this lineage.": "你的體型為中型或小型，於獲得此血系時決定。",
	"If you replace a race with this lineage, you can keep the following elements of that race: any skill proficiencies you gained from it and any climbing, flying, or swimming speed you gained from it.": "若你以此血系取代一個種族，你可以保留該種族的下列要素：你從中獲得的任何技能熟練，以及任何攀爬、飛行或游泳速度。",
	"If you don't keep any of those elements or you choose this lineage at character creation, you gain proficiency in two skills of your choice.": "若你未保留任何上述要素，或你在創建角色時選擇此血系，你獲得兩項自選技能的熟練。",
	"Ancestral Legacy": "祖先遺產",
	"Elves range from under 5 to over 6 feet tall and have slender builds. Your size is Medium.": "精靈身高從不到 5 呎到超過 6 呎不等，體型纖細。你的體型為中型。",
	"Although elves reach physical maturity at about the same age as humans, the elven understanding of adulthood goes beyond physical growth to encompass worldly experience. An elf typically claims adulthood and an adult name around the age of 100 and can live to be 750 years old.": "雖然精靈與人類大約在相同年齡達到生理成熟，但精靈對成年的理解不只是身體的成長，還包括人生閱歷。精靈通常在 100 歲左右宣告成年並取得成年名字，最多可活到 750 歲。",
	"Elves love freedom, variety, and self-expression, so they lean strongly toward the gentler aspects of chaos. They value and protect others' freedom as well as their own, and they are more often good than not.": "精靈熱愛自由、多樣性與自我表達，因此強烈傾向混亂中較溫和的一面。他們重視並守護他人與自己的自由，且多半是善良的。",
	"You have advantage on saving throws against being {@condition charmed}, and magic can't put you to sleep.": "你對抗{@condition charmed}的豁免檢定具有優勢，且魔法無法使你入睡。",
	"You can speak, read, and write Common and Elvish. Elvish is fluid, with subtle intonations and intricate grammar. Elven literature is rich and varied, and their songs and poems are famous among other races. Many bards learn their language so they can add Elvish ballads to their repertoires.": "你能說、讀、寫通用語與精靈語。精靈語流暢，語調微妙、文法精巧。精靈文學豐富多樣，他們的歌曲與詩篇在其他種族間也廣為流傳。許多吟遊詩人學習精靈語，好將精靈歌謠加入自己的曲目。",
	"You are a Fey.": "你是妖精。",
	"You are a Humanoid.": "你是類人生物。",
	"You are a Construct.": "你是構裝生物。",
	"You are a Monstrosity.": "你是怪獸。",
	"You are Medium or Small. You choose the size when you select this race.": "你的體型為中型或小型，於選擇此種族時決定。",
	"Your size is Medium or Small. You choose the size when you select this race.": "你的體型為中型或小型，於選擇此種族時決定。",
	"You are Medium.": "你的體型為中型。",
	"You are Small.": "你的體型為小型。",
	"You are a Humanoid. You are also considered a goblinoid for any prerequisite or effect that requires you to be a goblinoid.": "你是類人生物。對於任何要求你是哥布林類的先決條件或效果，你也視為哥布林類。",
	"You are a Humanoid. You are also considered an elf for any prerequisite or effect that requires you to be an elf.": "你是類人生物。對於任何要求你是精靈的先決條件或效果，你也視為精靈。",
	"You are a Humanoid. You are also considered a gnome for any prerequisite or effect that requires you to be a gnome.": "你是類人生物。對於任何要求你是地侏的先決條件或效果，你也視為地侏。",
	"You are a Humanoid. You are also considered a dwarf for any prerequisite or effect that requires you to be a dwarf.": "你是類人生物。對於任何要求你是矮人的先決條件或效果，你也視為矮人。",
	"You have advantage on saving throws you make to avoid or end the {@condition charmed} condition on yourself.": "你為避免或結束自身{@condition charmed}狀態而進行的豁免檢定具有優勢。",
	"You count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift.": "在決定你的負重能力以及能推、拖或舉起的重量時，你視為大一級的體型。",
	"You count as one size larger when determining your carrying capacity and the weight you can push or drag.": "在決定你的負重能力以及能推或拖的重量時，你視為大一級的體型。",
	"You have proficiency in the {@skill Perception} skill.": "你獲得{@skill Perception}技能的熟練。",
	"You don't need to sleep, and magic can't put you to sleep. You can finish a long rest in 4 hours if you spend those hours in a trancelike meditation, during which you retain consciousness.": "你不需要睡眠，魔法也無法使你入睡。若你花費 4 小時進行出神般的冥想並在期間保持意識，你就能在 4 小時內完成長休。",
	"Whenever you finish this trance, you can gain two proficiencies that you don't have, each one with a {@book weapon|phb|5|weapons} or a {@book tool|phb|5|tools} of your choice selected from the Player's Handbook. You mystically acquire these proficiencies by drawing them from shared elven memory, and you retain them until you finish your next long rest.": "每當你結束這種出神狀態時，你可以獲得兩項你尚未具備的熟練，每項都是從《玩家手冊》中選擇的一種{@book 武器|phb|5|weapons}或{@book 工具|phb|5|tools}。你透過汲取精靈共同記憶而神祕地獲得這些熟練，並保留到你完成下一次長休為止。",
	"Because of your wings, you have a flying speed equal to your walking speed. You can't use this flying speed if you're wearing medium or heavy armor.": "由於你有翅膀，你擁有等同於步行速度的飛行速度。若你穿著中甲或重甲，便無法使用此飛行速度。",
	"Your walking speed is 30 feet, and you have a swimming speed equal to your walking speed.": "你的步行速度為 30 呎，並擁有等同於步行速度的游泳速度。",
	"Your walking speed is 30 feet, and you have a climbing speed equal to your walking speed.": "你的步行速度為 30 呎，並擁有等同於步行速度的攀爬速度。",
	"Intelligence, Wisdom, or Charisma is your spellcasting ability for these spells when you cast them with this trait (choose when you select this race).": "以此特性施展這些法術時，智力、感知或魅力為你的施法屬性（於選擇此種族時決定）。",
	"Intelligence, Wisdom, or Charisma is your spellcasting ability for these spells when you cast them with this trait (choose when you select this race). None of these spells require spell components when you cast them with this trait.": "以此特性施展這些法術時，智力、感知或魅力為你的施法屬性（於選擇此種族時決定）。以此特性施展這些法術時，它們都不需要法術成分。",
	"You have advantage on saving throws against spells.": "你對法術的豁免檢定具有優勢。",
	"You have resistance to psychic damage.": "你具有心靈傷害抗性。",
	"You have resistance to necrotic damage.": "你具有黯蝕傷害抗性。",
	"You have resistance to poison damage.": "你具有毒素傷害抗性。",
	"You have resistance to cold damage.": "你具有寒冷傷害抗性。",
	"You have resistance to fire damage.": "你具有火焰傷害抗性。",
	"You can breathe air and water.": "你能呼吸空氣與水。",
	"You can hold your breath for up to 15 minutes at a time.": "你每次最多可以屏住呼吸 15 分鐘。",
	"You can hold your breath for up to 1 hour.": "你最多可以屏住呼吸 1 小時。",
	"You can speak, read, and write Common and one other language that you and your DM agree is appropriate for your character.": "你能說、讀、寫通用語，以及一種你與 DM 都同意適合你角色的其他語言。",
};
// 種族名（hazmole 有的沿用）
export const RN = {
	Aarakocra: "阿蘭寇拉鷹人", Aasimar: "阿斯莫", Bugbear: "熊地精", Centaur: "半人馬", Changeling: "易形者", "Deep Gnome": "深地侏", Duergar: "灰矮人",
	Eladrin: "伊拉德林", Fairy: "小仙子", Firbolg: "費爾伯格", Genasi: "元素裔", Githyanki: "吉斯洋基", Githzerai: "吉斯澤萊", Goblin: "哥布林",
	Goliath: "歌利亞", Harengon: "兔人", Hobgoblin: "大哥布林", Kenku: "天狗", Kobold: "狗頭人", Lizardfolk: "蜥蜴人", Minotaur: "米諾陶", Orc: "獸人",
	Satyr: "薩特羊人", "Sea Elf": "海精靈", "Shadar-Kai": "沙達凱", Shifter: "變身者", Tabaxi: "斑貓人", Tortle: "龜人", Triton: "梭螺魚人", "Yuan-Ti": "蛇人",
	"Astral Elf": "星界精靈", Autognome: "自動地侏", Giff: "吉夫", Hadozee: "哈多齊", Plasmoid: "漿質體", "Thri-kreen": "斯里克林螳螂人", Kalashtar: "卡拉什塔", Warforged: "機關人", Khoravar: "柯拉瓦", Aetherborn: "以太生", Vedalken: "維多肯", Dhampir: "半吸血鬼", Hexblood: "咒血者", Reborn: "重生者", Kor: "寇族", Merfolk: "人魚", Vampire: "吸血鬼",
};

// 背景等的公式化字串：技能清單、屬性清單、「Choose A or B」裝備
const ABL = {Strength: "力量", Dexterity: "敏捷", Constitution: "體質", Intelligence: "智力", Wisdom: "感知", Charisma: "魅力"};
const LABELS = {"Tool Proficiencies:": "工具熟練：", "Tool Proficiency:": "工具熟練：", "Skill Proficiencies:": "技能熟練：", "Equipment:": "裝備：", "Feat:": "專長：", "Ability Scores:": "屬性值：", "Languages:": "語言：", "Feature:": "特性："};
export const RULE = s => {
	if (LABELS[s]) return LABELS[s];
	if (/^(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)(, (Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma))+$/.test(s)) return s.split(", ").map(a => ABL[a]).join("、");
	if (/^(\{@skill [^}]+\})((, |,? and )\{@skill [^}]+\})+$/.test(s)) return s.replace(/,? and /g, "、").replace(/, /g, "、");
	if (/^Choose A or B: /.test(s)) {
		let t = s
			.replace(/^Choose A or B: /, "選擇 A 或 B：")
			.replace(/ \((\d+) days' worth\)/g, "（$1 天份）")
			.replace(/ \((\d+) flasks?\)/g, "（$1 瓶）")
			.replace(/ \((\d+) sheets?\)/g, "（$1 張）")
			.replace(/ \((\d+) feet\)/g, "（$1 呎）")
			.replace(/ \(same as above\)/g, "（同上）")
			.replace(/ \((\{@item [^}]+\}) or (\{@item [^}]+\})\)/g, "（$1或$2）")
			.replace(/\b2 Daggers\b/g, "2 把匕首")
			.replace(/; or \(B\) /g, "；或 (B) ")
			.replace(/, /g, "、")
			.replace(/ (\d+ GP)/g, " $1");
		return /[a-z]{3,} [a-z]{3,}/i.test(t.replace(/\{@[^}]+\}/g, "")) ? null : t;
	}
	return null;
};
