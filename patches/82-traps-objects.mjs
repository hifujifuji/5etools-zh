// 陷阱與危害頁、物體頁的介面字串：類型、威脅程度、等級範圍、陷阱小標（觸發／效果／反制手段…）、
// 物體的體型列與狀態免疫。trapHazType、threat 等資料值保留英文（篩選用），只在顯示時翻。

const TYPE = {MECH: "機械陷阱", MAG: "魔法陷阱", SMPL: "簡易陷阱", CMPX: "複雜陷阱", HAZ: "危害", WTH: "天氣", ENV: "環境危害", WLD: "荒野危害", GEN: "一般", EST: "異界風暴", TRP: "陷阱", HAUNT: "作祟陷阱"};
const THREAT = {nuisance: "擾人", setback: "妨礙", moderate: "中等", dangerous: "危險", deadly: "致命"};
const COND = {blinded: "目盲", charmed: "魅惑", deafened: "耳聾", exhaustion: "力竭", frightened: "恐懼", grappled: "被擒", incapacitated: "無力", invisible: "隱形", paralyzed: "麻痺", petrified: "石化", poisoned: "中毒", prone: "伏地", restrained: "束縛", stunned: "震懾", unconscious: "昏迷"};
const SENSE = {blindsight: "盲視", darkvision: "黑暗視覺", tremorsense: "震顫感知", truesight: "真實視覺"};
const SIZE = {T: "微型", S: "小型", M: "中型", L: "大型", H: "巨型", G: "超巨型"};

export default [
	{
		file: "js/parser.js",
		replace: [
			[
				/Parser\.TRAP_HAZARD_TYPE_TO_FULL = \{[^}]*\};/,
				`Parser.TRAP_HAZARD_TYPE_TO_FULL = ${JSON.stringify(TYPE)};`,
			],
			[
				`	if (styleHint === "classic") return \`\${range.map(n => Parser.getOrdinalForm(n)).join("\\u2013")} Level\`;
	return \`Levels \${range.join("\\u2013")}\`;`,
				`	return \`\${range.join("\\u2013")} 級\`;`,
			],
			[`Parser.TRAP_INIT_TO_FULL[1] = "initiative count 10";`, `Parser.TRAP_INIT_TO_FULL[1] = "先攻順位 10";`],
			[`Parser.TRAP_INIT_TO_FULL[2] = "initiative count 20";`, `Parser.TRAP_INIT_TO_FULL[2] = "先攻順位 20";`],
			[`Parser.TRAP_INIT_TO_FULL[3] = "initiative count 20 and initiative count 10";`, `Parser.TRAP_INIT_TO_FULL[3] = "先攻順位 20 與先攻順位 10";`],
		],
	},
	{
		file: "js/render.js",
		replace: [
			// ---- 陷阱 ----
			[`					name: "Trigger:",\n					entries: ent.trigger,`, `					name: "觸發：",\n					entries: ent.trigger,`],
			[`					name: "Duration:",\n					entries: [\n						Renderer.generic.getRenderableDurationEntriesMeta(ent.duration`, `					name: "持續時間：",\n					entries: [\n						Renderer.generic.getRenderableDurationEntriesMeta(ent.duration`],
			[`					name: "Haunt Bonus:",`, `					name: "作祟加值：",`],
			[
				`					name: "Detection:",
					entry: \`passive Wisdom ({@skill Perception}) score equals or exceeds \${10 + Number(ent.hauntBonus)}\`,`,
				`					name: "偵測：",
					entry: \`被動感知（{@skill Perception}）值達到或超過 \${10 + Number(ent.hauntBonus)}\`,`,
			],
			[`					name: "Trigger",\n					entries: ent.trigger,`, `					name: "觸發",\n					entries: ent.trigger,`],
			[`					name: "Effect",\n					entries: ent.effect,`, `					name: "效果",\n					entries: ent.effect,`],
			[`					name: "Initiative",\n					entries: Renderer.trap.getTrapInitiativeEntries(ent),`, `					name: "先攻",\n					entries: Renderer.trap.getTrapInitiativeEntries(ent),`],
			[`					name: "Active Elements",`, `					name: "主動要素",`],
			[`					name: "Dynamic Elements",`, `					name: "動態要素",`],
			[`					name: "Constant Elements",`, `					name: "常駐要素",`],
			[`					name: "Countermeasures",`, `					name: "反制手段",`],
			[
				"return [`The trap acts on ${Parser.trapInitToFull(ent.initiative)}${ent.initiativeNote ? ` (${ent.initiativeNote})` : \"\"}.`];",
				"return [`陷阱的行動時機為${Parser.trapInitToFull(ent.initiative)}${ent.initiativeNote ? `（${ent.initiativeNote}）` : \"\"}。`];",
			],
			[
				`				const ptThreat = rating.threat ? rating.threat.toTitleCase() : "";

				const ptThreatType = [ptThreat, ptType]
					.filter(Boolean)
					.join(" ");`,
				`				const ptThreat = rating.threat ? (${JSON.stringify(THREAT)}[rating.threat] ?? rating.threat.toTitleCase()) : "";

				const ptThreatType = [ptThreat, ptType]
					.filter(Boolean)
					.join("");`,
			],
			[
				`					ptLevelTier ? \`(\${ptLevelTier})\` : "",
				]
					.filter(Boolean)
					.join(" ");
			})
			.filter(Boolean)
			.joinConjunct(", ", " or ");`,
				`					ptLevelTier ? \`（\${ptLevelTier}）\` : "",
				]
					.filter(Boolean)
					.join("");
			})
			.filter(Boolean)
			.joinConjunct("、", "或");`,
			],
			[
				`		const ptLevelLabel = styleHint === "classic" ? "level" : "Levels";
		return \`\${ptLevelLabel} \${rating.level.min}\${rating.level.min !== rating.level.max ? \`\\u2013\${rating.level.max}\` : ""}\`;`,
				`		return \`\${rating.level.min}\${rating.level.min !== rating.level.max ? \`\\u2013\${rating.level.max}\` : ""} 級\`;`,
			],
			// ---- 物體 ----
			[
				`			entrySize: \`{@i \${ent.objectType !== "GEN" ? \`\${Renderer.utils.getRenderedSize(ent.size)} \${ent.creatureType ? Parser.monTypeToFullObj(ent.creatureType).asText : "object"}\` : \`Variable size object\`}}\`,`,
				`			entrySize: \`{@i \${ent.objectType !== "GEN" ? \`\${[ent.size].flat().map(sz => (${JSON.stringify(SIZE)})[sz] ?? Renderer.utils.getRenderedSize(sz)).join("或")}\${ent.creatureType ? Parser.monTypeToFullObj(ent.creatureType).asText : "物體"}\` : \`體型不定的物體\`}}\`,`,
			],
			[
				`\`{@b Condition Immunities:} \${Parser.getFullCondImm(ent.conditionImmune, {isEntry: true})}\``,
				`\`{@b Condition Immunities:} \${ent.conditionImmune.every(c => typeof c === "string") ? ent.conditionImmune.map(c => \`{@condition \${c}||\${(${JSON.stringify(COND)})[c] ?? c}}\`).join("、") : Parser.getFullCondImm(ent.conditionImmune, {isEntry: true})}\``,
			],
			[
				"? `{@b Senses:} ${Renderer.utils.getSensesEntry(ent.senses)}`",
				"? `{@b Senses:} ${Renderer.utils.getSensesEntry(ent.senses).replace(/\\{@sense (\\w+)(\\|[^|}]*)?\\}/g, (m, s, src) => `{@sense ${s}${src || \"|\"}|${(" + JSON.stringify(SENSE) + ")[s.toLowerCase()] ?? s}}`)}`",
			],
			// ---- {@dcYourSpellSave} 的預設顯示文字 ----
			[`textStack[0] += displayText || "your spell save DC";`, `textStack[0] += displayText || "你的法術豁免 DC";`],
			[`return displayText || "your spell save DC";`, `return displayText || "你的法術豁免 DC";`],
		],
	},
];
