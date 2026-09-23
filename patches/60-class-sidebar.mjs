// 職業頁側欄：生命值、熟練、起始裝備、兼職條件的介面文字。
// render.js 在 node 產生搜尋索引時也會跑，所以不依賴 ZH。

const ABIL = `({str: "力量", dex: "敏捷", con: "體質", int: "智力", wis: "感知", cha: "魅力"})`;

export default [
	{
		file: "js/render.js",
		replace: [
			// 1 級生命值
			[
				`			? \`\${clsHd.number * clsHd.faces} + your Constitution modifier\`
			: \`\${clsHd.number * clsHd.faces} + Con. modifier\`;`,
				`			? \`\${clsHd.number * clsHd.faces} + 你的體質調整值\`
			: \`\${clsHd.number * clsHd.faces} + 體質調整值\`;`,
			],
			// 更高等級生命值
			[
				`			? \`\${Renderer.get().render(Renderer.class.getHitDiceEntry(clsHd, {styleHint}))} (or \${((clsHd.number * clsHd.faces) / 2 + 1)}) + your Constitution modifier per \${className} level after 1st\`
			: \`\${Renderer.get().render(Renderer.class.getHitDiceEntry(clsHd, {styleHint}))} + your Con. modifier, or, \${((clsHd.number * clsHd.faces) / 2 + 1)} + your Con. modifier\`;`,
				`			? \`1 級之後每個\${className}等級 \${Renderer.get().render(Renderer.class.getHitDiceEntry(clsHd, {styleHint}))}（或 \${((clsHd.number * clsHd.faces) / 2 + 1)}）+ 你的體質調整值\`
			: \`\${Renderer.get().render(Renderer.class.getHitDiceEntry(clsHd, {styleHint}))} + 你的體質調整值，或 \${((clsHd.number * clsHd.faces) / 2 + 1)} + 你的體質調整值\`;`,
			],
			[
				`		return \`<div><strong>Hit Point Die:</strong> \${renderer.render(Renderer.class.getHitDiceEntry(cls.hd, {styleHint}))} per \${cls.name} level</div>
		<div><strong>Hit Points at Level 1:</strong> \${Renderer.class.getHitPointsAtFirstLevel(cls.hd, {styleHint})}</div>
		<div><strong>Hit Points per additional \${cls.name} Level:</strong> \${Renderer.class.getHitPointsAtHigherLevels(cls.name, cls.hd, {styleHint})}</div>\`;`,
				`		const __clsZh = cls.name_zh || cls.name;
		return \`<div><strong>生命骰：</strong> 每個\${__clsZh}等級 \${renderer.render(Renderer.class.getHitDiceEntry(cls.hd, {styleHint}))}</div>
		<div><strong>1 級生命值：</strong> \${Renderer.class.getHitPointsAtFirstLevel(cls.hd, {styleHint})}</div>
		<div><strong>每增加一個\${__clsZh}等級的生命值：</strong> \${Renderer.class.getHitPointsAtHigherLevels(__clsZh, cls.hd, {styleHint})}</div>\`;`,
			],
			// 護甲：「輕甲、中甲與盾牌」
			[
				`			.map((a, i, arr) => Renderer.get().render(\`{@filter \${styleHint === "classic" ? a : a.toTitleCase()}\${styleHint === "classic" || i === arr.length - 1 ? " armor" : ""}|items|type=\${a} armor}\`));`,
				`			.map(a => Renderer.get().render(\`{@filter \${({light: "輕甲", medium: "中甲", heavy: "重甲"})[a]}|items|type=\${a} armor}\`));`,
			],
			[
				`				if (a === "shield") {
					if (styleHint === "classic") Renderer.get().render(\`{@item shield|PHB|shields}\`);
					return Renderer.get().render(\`{@item shield|XPHB|Shields}\`);
				}`,
				`				if (a === "shield") return Renderer.get().render(\`{@item shield|\${styleHint === "classic" ? "PHB" : "XPHB"}|盾牌}\`);`,
			],
			[
				`		if (styleHint === "classic") {
			return [
				...ptsArmor,
				...ptsOther,
			]
				.join(", ");
		}

		return [
			ptsArmor.joinConjunct(", ", " and "),
			...ptsOther,
		]
			.filter(Boolean)
			.joinConjunct(", ", " and ");`,
				`		return [
			...ptsArmor,
			...ptsOther,
		]
			.filter(Boolean)
			.joinConjunct("、", "與", true);`,
			],
			// 武器
			[
				`			.map((w, i, arr) => Renderer.get().render(\`{@filter \${styleHint === "classic" ? w : w.toTitleCase()}\${styleHint === "classic" || i === arr.length - 1 ? " weapons" : ""}|items|type=\${w} weapon}\`));`,
				`			.map(w => Renderer.get().render(\`{@filter \${({simple: "簡易武器", martial: "軍用武器"})[w]}|items|type=\${w} weapon}\`));`,
			],
			[
				`				if (w.optional) return \`<span class="ve-help ve-help--hover" title="Optional Proficiency">\${Renderer.get().render(w.proficiency)}</span>\`;`,
				`				if (w.optional) return \`<span class="ve-help ve-help--hover" title="選用熟練">\${Renderer.get().render(({firearms: "火器"})[w.proficiency] || w.proficiency)}</span>\`;`,
			],
			[
				`		return styleHint === "classic" ? pts.join(", ") : pts.joinConjunct(", ", " and ");
	}

	/**
	 * @param toolProfs`,
				`		return pts.joinConjunct("、", "與", true);
	}

	/**
	 * @param toolProfs`,
			],
			// 工具
			[
				`		const pts = toolProfs.map(it => Renderer.get().render(it));
		return styleHint === "classic" ? pts.join(", ") : pts.joinConjunct(", ", " and ");`,
				`		const pts = toolProfs.map(it => Renderer.get().render(it));
		return pts.joinConjunct("、", "與", true);`,
			],
			// 技能
			[
				`		return \`\${Parser.skillProficienciesToFull(skills, {styleHint}).uppercaseFirst()}.\`;`,
				`		const __s = Parser.skillProficienciesToFull(skills, {styleHint});
		return /[\\u3400-\\u9fff]/.test(__s) ? __s : \`\${__s.uppercaseFirst()}.\`;`,
			],
			// 種族／背景的屬性值加值說明：「擇一：(a) 任選一項 +2；另選一項 +1 (b) 任選三項不同屬性各 +1」
			[
				"Renderer._AbilityData = function ({asText, asTextShort, asCollection, areNegative} = {}) {",
				`Renderer._zhAbilityText = s => {
	const N = {two: "兩", three: "三", four: "四", five: "五", six: "六", one: "一", any: "任意"};
	const A = {Strength: "力量", Dexterity: "敏捷", Constitution: "體質", Intelligence: "智力", Wisdom: "感知", Charisma: "魅力"};
	return String(s)
		.replace(/Choose one of: /g, "擇一：")
		.replace(/[Cc]hoose (one|two|three|four|five|six) different ([+-]\\d)/g, (m, n, b) => \`任選\${N[n]}項不同屬性各 \${b}\`)
		.replace(/(^|[^\\w])(one|two|three|four|five|six) different ([+-]\\d)/g, (m, p, n, b) => \`\${p}任選\${N[n]}項不同屬性各 \${b}\`)
		.replace(/[Cc]hoose any other (one|two|three|four|five|six) unique ([+-]\\d)/g, (m, n, b) => \`另選\${N[n]}項不同屬性各 \${b}\`)
		.replace(/[Cc]hoose any (one|two|three|four|five|six) unique ([+-]\\d)/g, (m, n, b) => \`任選\${N[n]}項不同屬性各 \${b}\`)
		.replace(/[Cc]hoose any other ([+-]\\d)/g, "另選一項 $1")
		.replace(/[Cc]hoose any ([+-]\\d)/g, "任選一項 $1")
		.replace(/\\bany other ([+-]\\d)/g, "另選一項 $1")
		.replace(/\\bany ([+-]\\d)/g, "任選一項 $1")
		.replace(/one other ability to increase by (\\d)/g, "另一項屬性提升 $1")
		.replace(/one ability to increase by (\\d)/g, "一項屬性提升 $1")
		.replace(/one other ability to decrease by (\\d)/g, "另一項屬性降低 $1")
		.replace(/one ability to decrease by (\\d)/g, "一項屬性降低 $1")
		.replace(/From (.+?) choose /g, (m, x) => \`從\${x}中選擇 \`)
		.replace(/\\bChoose unique /g, "選擇不同的 ")
		.replace(/\\bChoose /g, "選擇 ")
		.replace(/\\b(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma)\\b/g, m => A[m])
		.replace(/, and |, | and /g, "、")
		.replace(/ or /g, "或")
		.replace(/; /g, "；");
};
Renderer._AbilityData = function ({asText, asTextShort, asCollection, areNegative} = {}) {
	if (asText) asText = Renderer._zhAbilityText(asText);`,
			],
			// 起始裝備
			[
				`			equip.additionalFromBackground ? "<p>You start with the following items, plus anything provided by your background.</p>" : "",`,
				`			equip.additionalFromBackground ? "<p>你起始擁有下列物品，外加背景提供的任何物品。</p>" : "",`,
			],
			[
				`			equip.goldAlternative != null ? \`<p>Alternatively, you may start with \${renderer.render(equip.goldAlternative)} gp to buy your own equipment.</p>\` : "",`,
				`			equip.goldAlternative != null ? \`<p>或者，你可以改為起始擁有 \${renderer.render(equip.goldAlternative)} gp，自行購買裝備。</p>\` : "",`,
			],
		],
	},
	{
		file: "js/parser.js",
		replace: [
			[
				`					ptChoose = styleHint === "classic"
						? \`choose any \${count === 1 ? "skill" : chObj.count}\`
						: Renderer.get().render(\`{@i Choose any \${chObj.count} \${count === 1 ? "skill" : "skills"}} (see {@book chapter 1|XPHB|1|Skill List})\`);`,
				`					ptChoose = styleHint === "classic"
						? \`任選 \${count} 項技能\`
						: Renderer.get().render(\`{@i 任選 \${count} 項技能}（見{@book 第 1 章|XPHB|1|Skill List}）\`);`,
			],
			[
				`					ptChoose = styleHint === "classic"
						? \`choose \${count} from \${chObj.from.map(it => getRenderedSkill(it)).joinConjunct(", ", " and ")}\`
						: Renderer.get().render(\`{@i Choose \${count}:} \${chObj.from.map(it => getRenderedSkill(it)).joinConjunct(", ", " or ")}\`);`,
				`					ptChoose = styleHint === "classic"
						? \`從\${chObj.from.map(it => getRenderedSkill(it)).joinConjunct("、", "與", true)}中選擇 \${count} 項\`
						: Renderer.get().render(\`{@i 選擇 \${count} 項：}\${chObj.from.map(it => getRenderedSkill(it)).joinConjunct("、", "或", true)}\`);`,
			],
		],
	},
	{
		file: "js/render-class.js",
		replace: [
			[
				`		const renderPart = (obj, joiner = ", ") => Object.keys(obj).filter(k => Parser.ABIL_ABVS.includes(k)).sort(SortUtil.ascSortAtts).map(k => \`\${Parser.attAbvToFull(k)} \${obj[k]}\`).join(joiner);
		const orPart = requirements.or ? requirements.or.map(obj => renderPart(obj, " or ")).join("; ") : "";`,
				`		const renderPart = (obj, joiner = "、") => Object.keys(obj).filter(k => Parser.ABIL_ABVS.includes(k)).sort(SortUtil.ascSortAtts).map(k => \`\${${ABIL}[k] || Parser.attAbvToFull(k)} \${obj[k]}\`).join(joiner);
		const orPart = requirements.or ? requirements.or.map(obj => renderPart(obj, "或")).join("；") : "";`,
			],
			[
				`		const abilityPart = [orPart, basePart].filter(Boolean).join("; ");`,
				`		const abilityPart = [orPart, basePart].filter(Boolean).join("；");`,
			],
			[
				`			abilityPart ? \`{@b Ability Score Minimum:} \${abilityPart}\` : null,`,
				`			abilityPart ? \`{@b 屬性值下限：} \${abilityPart}\` : null,`,
			],
			[
				`			? \`<div>To qualify for a new class, you must meet the \${mc.requirementsSpecial ? "" : "ability score "}prerequisites for both your current class and your new one.</div>\``,
				`			? \`<div>要兼職一個新職業，你必須同時符合目前職業與新職業的\${mc.requirementsSpecial ? "" : "屬性值"}先決條件。</div>\``,
			],
			[
				`			? \`To qualify for a new class, you must have a score of at least 13 in the primary ability of the new class and your current classes.\``,
				`			? \`要兼職一個新職業，你在新職業與目前各職業的主要屬性上都必須至少有 13 點。\``,
			],
			[
				`				<b>\${htmlMCcPrereqPreText ? "Other " : ""}Prerequisites:</b>`,
				`				<b>\${htmlMCcPrereqPreText ? "其他" : ""}先決條件：</b>`,
			],
			[
				`			? \`<div>When you gain a level in a class other than your first, you gain only some of that class's starting proficiencies.</div>\``,
				`			? \`<div>當你在初始職業以外的職業獲得等級時，只會獲得該職業部分的起始熟練。</div>\``,
			],
		],
	},
	{
		file: "js/classes.js",
		replace: [
			[
				`[\`{@note <span class="ve-clickable ve-roller" data-jump-select-a-subclass="true">Select a subclass</span> to view its feature(s) here.}\`]`,
				`[\`{@note <span class="ve-clickable ve-roller" data-jump-select-a-subclass="true">選擇一個子職業</span>以在此檢視其特性。}\`]`,
			],
		],
	},
];
