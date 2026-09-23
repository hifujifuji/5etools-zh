// 怪物數據區塊的介面文字：速度、語言、CR 列、傳奇動作說明。
// render.js／parser.js 在 node 產生搜尋索引時也會跑，所以不依賴 ZH。

const ZN = `const __zn = e => e?.name_zh && (e._zhOf == null || e._zhOf === e.name) ? e.name_zh : null;`;

// 語言列：整句翻譯；若翻完仍殘留英文單字就保留原文，避免中英夾雜
const LANG = `
const __ZH_LANG_NAMES = {
	"Common": "通用語", "Dwarvish": "矮人語", "Elvish": "精靈語", "Giant": "巨人語", "Gnomish": "地侏語", "Goblin": "哥布林語",
	"Halfling": "半身人語", "Orc": "獸人語", "Abyssal": "深淵語", "Celestial": "天界語", "Deep Speech": "深幽語", "Draconic": "龍語",
	"Infernal": "煉獄語", "Primordial": "原初語", "Auran": "氣族語", "Aquan": "水族語", "Ignan": "火族語", "Terran": "土族語",
	"Sylvan": "木族語", "Undercommon": "地底通用語", "Druidic": "德魯伊語", "Thieves' cant": "盜賊黑話", "Thieves' Cant": "盜賊黑話",
	"Aarakocra": "阿蘭寇拉鷹人語", "Bullywug": "蛙人語", "Gith": "吉斯語", "Gnoll": "豺狼人語", "Hook Horror": "鉤爪恐魔語",
	"Modron": "摩登語", "Otyugh": "奧提由語", "Sahuagin": "沙華魚人語", "Slaad": "斯拉德語", "Thri-kreen": "螳螂人語",
	"Troglodyte": "穴居人語", "Umber Hulk": "土巨怪語", "Worg": "座狼語", "Yeti": "雪人語", "Blink Dog": "閃現犬語",
	"Winter Wolf": "冬狼語", "Ice Toad": "冰蟾蜍語", "Grell": "葛雷爾語", "Kraul": "克勞爾語", "Loxodon": "象族語", "Minotaur": "牛頭人語",
};
const __ZH_NUM = {one: "一", two: "兩", three: "三", four: "四", five: "五", six: "六"};
const __ZH_FORM = {bear: "熊", boar: "野豬", rat: "鼠", tiger: "虎", wolf: "狼"};
const __zhLang = str => {
	let s = str;
	const names = Object.keys(__ZH_LANG_NAMES).sort((a, b) => b.length - a.length);
	s = s
		.replace(/\\(can't speak in (\\w+) form\\)/g, (m, f) => __ZH_FORM[f] ? \`（\${__ZH_FORM[f]}形態下無法說話）\` : m)
		.replace(/\\(works only with creatures that understand ([^)]+)\\)/g, "（僅對懂得$1的生物有效）")
		.replace(/\\(faerie dragons only\\)/g, "（僅限妖精龍）")
		.replace(/\\(doesn't allow the receiving creature to respond telepathically\\)/g, "（接收者無法以心靈感應回應）")
		.replace(/\\bunderstands commands given in any language but can't speak\\b/g, "懂得以任何語言下達的命令，但無法說話")
		.replace(/\\bunderstands all but can't speak\\b/g, "懂得所有語言，但無法說話")
		.replace(/^all\\b/, "所有語言")
		.replace(/\\bunderstands (.+?) but can't speak(?: them)?\\b/g, "懂得$1，但無法說話")
		.replace(/\\bunderstands /g, "懂得")
		.replace(/\\b(?:any|and any) (one|two|three|four|five|six) languages?\\b/g, (m, n) => \`及任意\${__ZH_NUM[n]}種語言\`)
		.replace(/ plus (one|two|three|four|five|six) other languages?\\b/g, (m, n) => \`及其他\${__ZH_NUM[n]}種語言\`)
		.replace(/\\btelepathy (\\d+) ft\\./gi, "心靈感應 $1 呎");
	for (const n of names) s = s.replace(new RegExp(\`(?<![A-Za-z])\${n.replace(/[-']/g, c => "\\\\" + c)}(?![A-Za-z])\`, "g"), __ZH_LANG_NAMES[n]);
	s = s
		.replace(/ \\(([^()]*)\\)/g, (m, x) => \`（\${x.replace(/, /g, "、")}）\`)
		.replace(/,? and /g, "與")
		.replace(/(\\S)及/g, "$1及")
		.replace(/ ?及任意/g, "及任意")
		.replace(/; /g, "；")
		.replace(/, /g, "、")
		.replace(/(?<=[\\u3400-\\u9fff）]) (?=[\\u3400-\\u9fff（])/g, "");
	return /[A-Za-z]{2,}/.test(s.replace(/<[^>]*>/g, "")) ? str : s;
};
`;

export default [
	{
		file: "js/parser.js",
		replace: [
			// 「40 呎，攀爬 40 呎，飛行 80 呎」
			[
				`		: isLongForm ? "feet" : "ft.";
	if (typeof ent.speed === "object") {
		const stack = [];
		let joiner = ", ";`,
				`		: "呎";
	if (typeof ent.speed === "object") {
		const stack = [];
		let joiner = "，";`,
			],
			[
				`			joiner = "; ";
			stack.push(\`\${ent.speed.choose.from.sort().map(prop => Parser._getSpeedString_getSpeedName({prop, styleHint})).joinConjunct(", ", " or ")} \${ent.speed.choose.amount} \${unit}`,
				`			joiner = "；";
			stack.push(\`\${ent.speed.choose.from.sort().map(prop => Parser._getSpeedString_getSpeedName({prop, styleHint}).trim()).joinConjunct("、", "或")} \${ent.speed.choose.amount} \${unit}\${ent.speed.choose.note?.startsWith("（") ? ent.speed.choose.note : ent.speed.choose.note ? \` \${ent.speed.choose.note}\` : ""}\`);
			if (0) stack.push(\`\${ent.speed.choose.amount} \${unit}`,
			],
			[
				`	if (speed === true && prop !== "walk") return "equal to your walking speed";`,
				`	if (speed === true && prop !== "walk") return "等同步行速度";`,
			],
			[
				`Parser._getSpeedString_getCondition = ({speed}) => speed.condition ? \` \${Renderer.get().render(speed.condition)}\` : "";
Parser._getSpeedString_getSpeedName = ({prop, styleHint}) => prop === "walk" ? "" : \`\${prop[styleHint === "classic" ? "toString" : "toTitleCase"]()} \`;`,
				`Parser._getSpeedString_getCondition = ({speed}) => speed.condition ? (c => c.startsWith("（") ? c : \` \${c}\`)(Renderer.get().render(speed.condition).replace(/^\\(hover\\)$/, "（懸浮）")) : "";
Parser._SPEED_NAME_ZH = {burrow: "掘穴", climb: "攀爬", fly: "飛行", swim: "游泳"};
Parser._getSpeedString_getSpeedName = ({prop, styleHint}) => prop === "walk" ? "" : \`\${Parser._SPEED_NAME_ZH[prop] || prop} \`;`,
			],
		],
	},
	{
		file: "js/render.js",
		replace: [
			// 怪物施法的法術清單標籤：「隨意：」「每日各 2 次：」「1 環（4 個欄位）：」
			[
				`name: \`Constant:\`, entry: this._renderSpellcasting_getRenderableList(entry.constant).join(", ")`,
				`name: \`持續：\`, entry: this._renderSpellcasting_getRenderableList(entry.constant).join("、")`,
			],
			[
				`name: \`At will:\`, entry: this._renderSpellcasting_getRenderableList(entry.will).join(", ")`,
				`name: \`隨意：\`, entry: this._renderSpellcasting_getRenderableList(entry.will).join("、")`,
			],
			[
				`name: \`Rituals:\`, entry: this._renderSpellcasting_getRenderableList(entry.ritual).join(", ")`,
				`name: \`儀式：\`, entry: this._renderSpellcasting_getRenderableList(entry.ritual).join("、")`,
			],
			[
				`					let levelCantrip = \`\${Parser.spLevelToFull(lvl)}\${(lvl === 0 ? "s" : " level")}\`;
					let slotsAtWill = \` (at will)\`;
					const slots = spells.slots;
					if (slots >= 0) slotsAtWill = slots > 0 ? \` (\${slots} slot\${slots > 1 ? "s" : ""})\` : \`\`;
					if (spells.lower && spells.lower !== lvl) {
						levelCantrip = \`\${Parser.spLevelToFull(spells.lower)}-\${levelCantrip}\`;
						if (slots >= 0) slotsAtWill = slots > 0 ? \` (\${slots} \${Parser.spLevelToFull(lvl)}-level slot\${slots > 1 ? "s" : ""})\` : \`\`;
					}
					tempList.items.push({type: "itemSpell", name: \`\${levelCantrip}\${slotsAtWill}:\`, entry: this._renderSpellcasting_getRenderableList(spells.spells).join(", ") || "\\u2014"});`,
				`					let levelCantrip = lvl === 0 ? "戲法" : \`\${lvl} 環\`;
					let slotsAtWill = \`（隨意）\`;
					const slots = spells.slots;
					if (slots >= 0) slotsAtWill = slots > 0 ? \`（\${slots} 個欄位）\` : \`\`;
					if (spells.lower && spells.lower !== lvl) {
						levelCantrip = \`\${spells.lower}–\${lvl} 環\`;
						if (slots >= 0) slotsAtWill = slots > 0 ? \`（\${slots} 個 \${lvl} 環欄位）\` : \`\`;
					}
					tempList.items.push({type: "itemSpell", name: \`\${levelCantrip}\${slotsAtWill}：\`, entry: this._renderSpellcasting_getRenderableList(spells.spells).join("、") || "\\u2014"});`,
			],
			[
				`					name: \`\${isSkipPrefix ? "" : lvl}\${fnGetDurationText ? fnGetDurationText(lvl) : durationText}:\`,
					entry: this._renderSpellcasting_getRenderableList(perDur[lvl]).join(", "),`,
				`					name: \`\${__zhPer(prop, lvl, false) ?? \`\${isSkipPrefix ? "" : lvl}\${fnGetDurationText ? fnGetDurationText(lvl) : durationText}\`}：\`,
					entry: this._renderSpellcasting_getRenderableList(perDur[lvl]).join("、"),`,
			],
			[
				`					name: \`\${isSkipPrefix ? "" : lvl}\${fnGetDurationText ? fnGetDurationText(lvl) : durationText}\${isHideEach ? "" : \` each\`}:\`,
					entry: this._renderSpellcasting_getRenderableList(perDur[lvlEach]).join(", "),`,
				`					name: \`\${__zhPer(prop, lvl, !isHideEach) ?? \`\${isSkipPrefix ? "" : lvl}\${fnGetDurationText ? fnGetDurationText(lvl) : durationText}\${isHideEach ? "" : \` each\`}\`}：\`,
					entry: this._renderSpellcasting_getRenderableList(perDur[lvlEach]).join("、"),`,
			],
			[
				`	this._renderSpellcasting_getEntries_procPerDuration = function ({entry, hidden, tempList, prop, durationText, fnGetDurationText, isSkipPrefix}) {`,
				`	this._renderSpellcasting_getEntries_procPerDuration = function ({entry, hidden, tempList, prop, durationText, fnGetDurationText, isSkipPrefix}) {
		const __ZH_PER = {daily: "每日", weekly: "每週", monthly: "每月", yearly: "每年", rest: "每次休息", restLong: "每次長休"};
		const __zhPer = (prop, n, each) => {
			if (__ZH_PER[prop]) return \`\${__ZH_PER[prop]}\${each ? "各" : ""} \${n} 次\`;
			if (prop === "legendary") return \`\${n} 個傳奇動作\${each ? "（各）" : ""}\`;
			if (prop === "charges") return \`\${n} 充能\${each ? "（各）" : ""}\`;
			return null;
		};`,
			],
			// 語言
			[
				`	static getRenderedLanguages (languages, {styleHint = null} = {}) {`,
				`	static getRenderedLanguages (languages, {styleHint = null} = {}) {
		${LANG}`,
			],
			[
				`		const out = languages.map(it => Renderer.get().render(it)).join(", ");
		if (styleHint === "classic") return out;
		return out.uppercaseFirst();`,
				`		const out = languages.map(it => Renderer.get().render(it)).join(", ");
		const zh = __zhLang(out);
		if (zh !== out) return zh;
		if (styleHint === "classic") return out;
		return out.uppercaseFirst();`,
			],
			// CR 列：「17（XP 18,000，巢穴中為 20,000；熟練加值 +6）」
			[
				`				Renderer.monster.hasMythicActions(mon) ? \`\${(xpBase * 2).toLocaleStringVe()} as a mythic encounter\` : null,`,
				`				Renderer.monster.hasMythicActions(mon) ? \`神話遭遇時為 \${(xpBase * 2).toLocaleStringVe()}\` : null,`,
			],
			[
				`			if (mon.cr.lair || mon.cr.xpLair) ptsXp.push(\`\${(mon.cr.xpLair ? mon.cr.xpLair.toLocaleStringVe() : null) || Parser.crToXp(mon.cr.lair)} in lair\`);
			if (mon.cr.coven || mon.cr.xpCoven) ptsXp.push(\`\${(mon.cr.xpCoven ? mon.cr.xpCoven.toLocaleStringVe() : null) || Parser.crToXp(mon.cr.coven)} when part of a coven\`);
		}

		const ptPbVal = Renderer.monster.getPbPart(mon, {isPlainText});

		const ptParens = [
			ptsXp.length ? \`XP \${ptsXp.joinConjunct(", ", ", or ", true)}\` : "",
			ptPbVal ? \`\${isPlainText ? "PB" : \`<span title="Proficiency Bonus">PB</span>\`} \${ptPbVal}\` : "",
		]
			.filter(Boolean)
			.join("; ");

		return \`\${crBase || "None"}\${ptParens ? \` (\${ptParens})\` : ""}\`;`,
				`			if (mon.cr.lair || mon.cr.xpLair) ptsXp.push(\`巢穴中為 \${(mon.cr.xpLair ? mon.cr.xpLair.toLocaleStringVe() : null) || Parser.crToXp(mon.cr.lair)}\`);
			if (mon.cr.coven || mon.cr.xpCoven) ptsXp.push(\`加入女巫集會時為 \${(mon.cr.xpCoven ? mon.cr.xpCoven.toLocaleStringVe() : null) || Parser.crToXp(mon.cr.coven)}\`);
		}

		const ptPbVal = Renderer.monster.getPbPart(mon, {isPlainText});

		const ptParens = [
			ptsXp.length ? \`XP \${ptsXp.join("，")}\` : "",
			ptPbVal ? \`熟練加值 \${ptPbVal}\` : "",
		]
			.filter(Boolean)
			.join("；");

		return \`\${crBase || "無"}\${ptParens ? \`（\${ptParens}）\` : ""}\`;`,
			],
			// 傳奇動作說明
			[
				`		if (styleHint === "classic") {
			return {
				entries: [
					\`\${legendaryNameTitle} can take`,
				`		${ZN}
		const __zhName = __zn(mon);
		if (__zhName) {
			const lair = legendaryActionsLair !== legendaryActions;
			if (styleHint === "classic") {
				return {entries: [\`\${__zhName}可以執行 \${legendaryActions} 次傳奇動作\${lair ? \`（在巢穴中為 \${legendaryActionsLair} 次）\` : ""}，從下列選項中選擇。一次只能使用一個傳奇動作，且只能在另一個生物的回合結束時使用。\${__zhName}在其回合開始時恢復已消耗的傳奇動作。\`]};
			}
			return {entries: [\`{@note 傳奇動作次數：\${legendaryActions}\${lair ? \`（巢穴中為 \${legendaryActionsLair}）\` : ""}。在另一個生物的回合結束後，\${__zhName}可以立即消耗一次次數，執行下列動作之一。\${__zhName}在其每個回合開始時恢復所有已消耗的次數。}\`]};
		}

		if (styleHint === "classic") {
			return {
				entries: [
					\`\${legendaryNameTitle} can take`,
			],
		],
	},
];
