// 先決條件（專長、選用特性、設施…共用的 Renderer.utils.prerequisite）整段輸出轉成中文。
// 做法：包住 getHtml，把輸出的 HTML 依標籤切開，只轉換文字節點；連結內的名稱由 build 補的中文顯示名負責。

const ZH_FN = String.raw`
		static __zhText (t) {
			const AB = {Strength: "力量", Dexterity: "敏捷", Constitution: "體質", Intelligence: "智力", Wisdom: "感知", Charisma: "魅力"};
			const CAMP = {Eberron: "艾伯倫", Dragonlance: "龍槍", Planescape: "異域風雲"};
			const PACT = {Blade: "鋒刃魔契", Chain: "鎖鏈魔契", Talisman: "護符魔契", Tome: "書卷魔契"};
			const RACE = {dragonborn: "龍裔", dwarf: "矮人", elf: "精靈", "half-elf": "半精靈", "half-orc": "半獸人", halfling: "半身人", gnome: "地侏", tiefling: "提夫林", human: "人類", goliath: "歌利亞", orc: "獸人", aasimar: "阿斯莫"};
			const SUB = {drow: "卓爾", high: "高等", wood: "木", deep: "地底"};
			const CLS = {Artificer: "奇械師", Barbarian: "野蠻人", Bard: "吟遊詩人", Cleric: "牧師", Druid: "德魯伊", Fighter: "戰士", Monk: "武僧", Mystic: "秘術士", Paladin: "聖騎士", Ranger: "遊俠", Rogue: "盜賊", Sorcerer: "術士", Warlock: "契術師", Wizard: "法師"};
			const ARM = {heavy: "重甲", light: "輕甲", medium: "中甲"};
			return t
				.replace(/Prerequisites?: /g, "先決條件：")
				.replace(/Level (\d+)\+\s*/g, "$1 級以上")
				.replace(/(\d+)(?:st|nd|rd|th) level/g, "$1 級")
				.replace(/Lvl (\d+)/g, "$1 級")
				.replace(/\b(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\b/g, m => AB[m])
				.replace(/(\d+) or higher/g, "$1 以上")
				.replace(/Proficiency with a martial weapon/g, "熟練一種軍用武器")
				.replace(/Proficiency with (heavy|light|medium) armor/g, (m, a) => "熟練" + ARM[a])
				.replace(/Martial Weapon Proficiency/g, "軍用武器熟練")
				.replace(/Proficiency with shields/g, "熟練盾牌")
				.replace(/Spellcasting or Pact Magic features?/gi, "施法或契約魔法特性")
				.replace(/Spellcasting Feature/gi, "施法特性")
				.replace(/Fighting Style Feature/gi, "戰鬥風格特性")
				.replace(/The ability to cast at least one spell/g, "能施放至少一道法術")
				.replace(/(Eberron|Dragonlance|Planescape) Campaign/g, (m, c) => CAMP[c] + "戰役")
				.replace(/Can't Have Another Dragonmark Feat/g, "不能擁有其他龍紋專長")
				.replace(/Any Dragonmark Feat/g, "任一龍紋專長")
				.replace(/Pact of the (Blade|Chain|Talisman|Tome)/g, (m, k) => PACT[k])
				.replace(/ spell or a warlock feature that curses/g, "法術或會施加詛咒的契術師特性")
				.replace(/ cantrip\b/g, "戲法")
				.replace(/ or a Small race/g, "或小型種族")
				.replace(/ \((drow|high|wood|deep)\)/g, (m, k) => "（" + SUB[k] + "）")
				.replace(/\b(Dragonborn|Dwarf|Half-Elf|Half-Orc|Halfling|Elf|Gnome|Tiefling|Human|Goliath|Orc|Aasimar)\b/gi, m => RACE[m.toLowerCase()])
				.replace(/\b(Artificer|Barbarian|Bard|Cleric|Druid|Fighter|Monk|Mystic|Paladin|Ranger|Rogue|Sorcerer|Warlock|Wizard)\b/g, m => CLS[m])
				.replace(/\b(Heavy|Light|Medium) Armor Training/g, (m, a) => ({Heavy: "重甲", Light: "輕甲", Medium: "中甲"})[a] + "受訓")
				.replace(/\b(H|L|M)\. Armor Trai\./g, (m, a) => ({H: "重甲", L: "輕甲", M: "中甲"})[a] + "受訓")
				.replace(/\bShield Trai(?:ning|\.)/g, "盾牌受訓")
				.replace(/\bProf m\. weapons?/g, "軍用武器熟練")
				.replace(/\beldritch blast\b/gi, "魔能爆")
				.replace(/\bHex\/Curse\b/g, "脆弱詛咒／詛咒")
				.replace(/\bhex\b/gi, "脆弱詛咒")
				.replace(/\bAny Dragonmark\b/g, "任一龍紋")
				.replace(/\bOnly Dragonmark\b/g, "僅限龍紋")
				.replace(/\b(Eberron|Dragonlance|Planescape)\b/g, m => CAMP[m])
				.replace(/\bPact Magic\b/g, "契約魔法")
				.replace(/\bSpellcasting\b/g, "施法")
				.replace(/\bFighting Style\b/g, "戰鬥風格")
				.replace(/\b(Figh|Pald|Sorc|Wizr|Barb|Clrc|Drui|Monk|Rang|Rogu|Warl|Arti)\./g, (m, a) => ({Figh: "戰士", Pald: "聖騎士", Sorc: "術士", Wizr: "法師", Barb: "野蠻人", Clrc: "牧師", Drui: "德魯伊", Monk: "武僧", Rang: "遊俠", Rogu: "盜賊", Warl: "契術師", Arti: "奇械師"})[a])
				.replace(/\b(Knight of Solamnia|Mage of High Sorcery|Giant Foundling|Rune Carver)\b/g, m => ({"Knight of Solamnia": "索蘭尼亞騎士", "Mage of High Sorcery": "高等巫術法師", "Giant Foundling": "巨人棄兒", "Rune Carver": "符文雕刻師"})[m])
				.replace(/\bVampire \(Ixalan\)/g, "吸血鬼（依夏蘭）")
				.replace(/\bSmall Race\b/g, "小型種族")
				.replace(/\b(Str|Dex|Con|Int|Wis|Cha)\b(?= \d|\/)/g, m => ({Str: "力量", Dex: "敏捷", Con: "體質", Int: "智力", Wis: "感知", Cha: "魅力"})[m])
				.replace(/(\d) Gp\b/g, "$1 gp")
				.replace(/\bSpecial\b/g, "特殊")
				.replace(/,\s+or\s+/g, "或")
				.replace(/\s+or\s+/g, "或")
				.replace(/;\s+/g, "；")
				.replace(/,\s+/g, "、")
				.replace(/([一-鿿）])\s{2,}(?=[一-鿿]|$)/g, "$1");
		}

		static __zh (html) {
			if (typeof html !== "string" || !html) return html;
			return html.split(/(<[^>]*>)/).map((seg, i) => i % 2 ? seg : this.__zhText(seg)).join("")
				.replace(/(\d+ 級以上)\s*(<a [^>]*>[^<]*<\/a>)/g, "$2 $1");
		}

		static getHtml (prerequisites, opts) { return this.__zh(this.__getHtmlEn(prerequisites, opts)); }
`;

export default [
	{
		file: "js/render.js",
		replace: [
			[
				`		static getHtml (
			prerequisites,
			{
				isListMode = false,`,
				`${ZH_FN}
		static __getHtmlEn (
			prerequisites,
			{
				isListMode = false,`,
			],
			[
				"textStack[0] += `<span class=\"ve-rd__prerequisite\">Prerequisite: `;",
				"textStack[0] += `<span class=\"ve-rd__prerequisite\">先決條件：`;",
			],
			// 專長副標「通用專長（先決條件：…）」直接組成中文（先決條件含連結時字典規則比對不到）
			[
				"		const ptCategory = category ? `${Parser.featCategoryToFull(category)}${[\"FS:P\", \"FS:R\"].includes(category) ? \"\" : ` Feat`}` : \"\";\n\n		return ptCategory && rdPrereqs\n			? `${ptCategory} (${rdPrereqs})`\n			: (ptCategory || rdPrereqs);",
				"		const __zhCat = ({G: \"通用專長\", O: \"起源專長\", FS: \"戰鬥風格專長\", \"FS:P\": \"戰鬥風格替換（聖騎士）\", \"FS:R\": \"戰鬥風格替換（遊俠）\", EB: \"史詩恩賜專長\", D: \"龍紋專長\"})[category];\n		const ptCategory = category ? (__zhCat ?? `${Parser.featCategoryToFull(category)}${[\"FS:P\", \"FS:R\"].includes(category) ? \"\" : ` Feat`}`) : \"\";\n\n		return ptCategory && rdPrereqs\n			? (__zhCat ? `${ptCategory}（${rdPrereqs}）` : `${ptCategory} (${rdPrereqs})`)\n			: (ptCategory || rdPrereqs);",
			],
			// 清單欄：專長／選用特性名稱用中文顯示名
			[
				`if (isListMode) return v.map(x => x.split("|")[0].toTitleCase()).join("/");`,
				`if (isListMode) return v.map(x => x.split("|")[2] || x.split("|")[0].toTitleCase()).join("/");`,
			],
		],
	},
];
