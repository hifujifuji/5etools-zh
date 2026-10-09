// 堡壘設施頁與其他角色創建選項頁的介面字串。facilityType、space、orders、optionType 等資料值保留英文（篩選用），只在顯示時翻。

const SPACE = {cramped: "狹小", roomy: "寬敞", vast: "廣闊"};
const ORDER = {craft: "製作", empower: "賦能", harvest: "收成", maintain: "維護", recruit: "招募", research: "研究", trade: "貿易"};
const FTYPE = {basic: "基礎", special: "特殊", unknown: "未知"};
const OPT = {SG: "超自然贈禮", OF: "選用特性", DG: "黑暗贈禮", "RF:B": "替換特性：背景", CS: "角色秘密"};

// 先決條件（專長、設施共用）：組織成員、施法法器、專精
const ORG = {"Purple Dragon Knights": "紫龍騎士", "Cult of the Dragon": "龍之教團", "Emerald Enclave": "翡翠飛地", "Harpers": "豎琴手同盟", "Lords' Alliance": "領主聯盟", "Order of the Gauntlet": "鐵腕教團", "Red Wizards": "紅袍法師", "Zhentarim": "散塔林會"};
const SCF_ZH = {arcane: "奧術法器", druid: "德魯伊法器", holy: "聖徽", tool: "工具", artisansTool: "工匠工具"};
export const PREREQ = [
	[
		"					return [ptPrereqs, ptNote]\n						.filter(Boolean)\n						.join(\". \");",
		"					return [ptPrereqs, ptNote]\n						.filter(Boolean)\n						.join(ptNote && /[\\u4e00-\\u9fff]/.test(ptNote) ? \"。\" : \". \");",
	],
	[
		"const ptPrefix = isSkipPrefix ? \"\" : `Prerequisite${cntPrerequisites === 1 ? \"\" : \"s\"}: `;",
		"const ptPrefix = isSkipPrefix ? \"\" : (__t => /[\\u4e00-\\u9fff]/.test(__t) && !/[A-Za-z]{3}/.test(__t))(`${shared || \"\"}${joinedChoices || \"\"}`.replace(/<[^>]*>/g, \"\")) ? \"先決條件：\" : `Prerequisite${cntPrerequisites === 1 ? \"\" : \"s\"}: `;",
	],
	[
		"					const raceName = it.displayEntry ? (isTextOnly ? Renderer.stripTags(it.displayEntry) : Renderer.get().render(it.displayEntry)) : (i === 0 || styleHint !== \"classic\") ? it.name.toTitleCase() : it.name;",
		"					const raceName = it.displayEntry ? (isTextOnly ? Renderer.stripTags(it.displayEntry) : Renderer.get().render(it.displayEntry)) : it.name_zh ? it.name_zh : (i === 0 || styleHint !== \"classic\") ? it.name.toTitleCase() : it.name;",
	],
	[
		"			return isListMode ? parts.join(\"/\") : parts.joinConjunct(\", \", \" or \");\n		}\n\n		static _getHtml_background",
		"			return isListMode ? parts.join(\"/\") : v.every(it => it.name_zh) ? parts.joinConjunct(\"、\", \"或\").replace(/、或/g, \"或\") : parts.joinConjunct(\", \", \" or \");\n		}\n\n		static _getHtml_background",
	],
	[
		"				: `Membership in the ${v.joinConjunct(\", \", \" or \")}`;",
		"				: `${v.map(it => this.__zhOrg[it] ?? it).joinConjunct(\"、\", \"或\").replace(/、或/g, \"或\")}的成員`;",
	],
	[
		`		static _getHtml_membership ({v, isListMode}) {
			return isListMode
				? v.join("/")`,
		`		static __zhOrg = ${JSON.stringify(ORG)};
		static __zhScf = ${JSON.stringify(SCF_ZH)};
		static _getHtml_membership ({v, isListMode}) {
			return isListMode
				? v.map(it => this.__zhOrg[it] ?? it).join("/")`,
	],
	["if (prof === true) return isListMode ? `Skill Expertise` : `Expertise in a skill`;", "if (prof === true) return isListMode ? `技能專精` : `專精一項技能`;"],
	["				if (v === true) return `Spellcasting Focus`;\n				return v.map(n => this._SCF_TYPE_TO_NAME[n] || `Spellcasting ${n.toTitleCase()}`).join(\"/\");", "				if (v === true) return `施法法器`;\n				return v.map(n => this.__zhScf[n] || n).join(\"/\");"],
	["const ptScfSuffix = styleHint === \"classic\" ? \"spellcasting focus\" : \"{@variantrule Spellcasting Focus|XPHB}\";", "const ptScfSuffix = styleHint === \"classic\" ? \"施法法器\" : \"{@variantrule Spellcasting Focus|XPHB|施法法器}\";"],
	["const ent = `Ability to use a ${ptScfSuffix}`;", "const ent = `能使用${ptScfSuffix}`;"],
	[
		`					if (!i) {
						const a = Parser.getArticle(this._SCF_TYPE_TO_NAME[scf] || scf);
						if (!this._SCF_TYPE_TO_NAME[scf]) return \`\${a} \${scf}\`;
						return \`\${a} {@item \${this._SCF_TYPE_TO_NAME[scf]}\${styleHint === "classic" ? "" : "|XPHB"}}\`;
					}

					if (!this._SCF_TYPE_TO_NAME[scf]) return scf;
					return \`{@item \${this._SCF_TYPE_TO_NAME[scf]}\${styleHint === "classic" ? "" : "|XPHB"}}\`;
				})
				.joinConjunct(", ", " or ");

			const ent = \`Ability to use \${ptScf} as a \${ptScfSuffix}\`;`,
		`					if (!this._SCF_TYPE_TO_NAME[scf]) return this.__zhScf[scf] ?? scf;
					return \`{@item \${this._SCF_TYPE_TO_NAME[scf].replace("’", "'")}\${styleHint === "classic" ? "" : "|XPHB"}|\${this.__zhScf[scf] ?? ""}}\`;
				})
				.joinConjunct("、", "或").replace(/、或/g, "或");

			const ent = \`能使用\${ptScf}作為\${ptScfSuffix}\`;`,
	],
];

export default [
	{
		file: "js/render.js",
		replace: [
			...PREREQ,
			// ---- 獎勵頁副標（類型、稀有度） ----
			[
				`			(ent.type || "").toTitleCase(),
			ent.rarity ? ent.rarity.toTitleCase() : "",
		]
			.filter(Boolean)
			.join(", ");`,
				`			globalThis.ZH?.t?.(ent.type || "") ?? (ent.type || "").toTitleCase(),
			ent.rarity ? (globalThis.ZH?.t?.(ent.rarity.toTitleCase()) ?? ent.rarity.toTitleCase()) : "",
		]
			.filter(Boolean)
			.join("、");`,
			],
			[
				`Renderer.facility = class {`,
				`Renderer.facility = class {
	static __zhSpace = ${JSON.stringify(SPACE)};
	static __zhOrder = ${JSON.stringify(ORDER)};`,
			],
			[
				`Renderer.facility._getSpaceEntry(spc, {isIncludeCostTime: ent.facilityType === "basic"})).joinConjunct(", ", " or ");`,
				`Renderer.facility._getSpaceEntry(spc, {isIncludeCostTime: ent.facilityType === "basic"})).joinConjunct("、", "或").replace(/、或/g, "或");`,
			],
			[
				"const ptSpace = hire.space ? ` {@style (${hire.space.toTitleCase()})|muted}` : \"\";",
				"const ptSpace = hire.space ? `{@style （${Renderer.facility.__zhSpace[hire.space] ?? hire.space.toTitleCase()}）|muted}` : \"\";",
			],
			[
				"if (hire.min != null) return `${hire.min}+ (see below${ptSpace ? \";\" : \"\"}${ptSpace})`;",
				"if (hire.min != null) return `${hire.min}+（見下文${ptSpace ? \"；\" : \"\"}${ptSpace}）`;",
			],
			[
				`			.filter(Boolean)
			.joinConjunct(", ", " or ");

		if (out) return out;`,
				`			.filter(Boolean)
			.joinConjunct("、", "或").replace(/、或/g, "或");

		if (out) return out;`,
			],
			[
				`return ent.orders.map(it => it.toTitleCase()).joinConjunct(", ", " or ");`,
				`return ent.orders.map(it => Renderer.facility.__zhOrder[it] ?? it.toTitleCase()).joinConjunct("、", "或").replace(/、或/g, "或");`,
			],
			["entsList.push({type: \"item\", name: `Prerequisite:`, entry: entRendered});", "entsList.push({type: \"item\", name: `先決條件：`, entry: entRendered});"],
			["entsList.push({type: \"item\", name: `Prerequisite:`, entry: \"None\"});", "entsList.push({type: \"item\", name: `先決條件：`, entry: \"無\"});"],
			["entsList.push({type: \"item\", name: `Space:`, entry: entrySpace});", "entsList.push({type: \"item\", name: `空間：`, entry: entrySpace});"],
			["entsList.push({type: \"item\", name: `Hirelings:`, entry: entryHirelings});", "entsList.push({type: \"item\", name: `雇工：`, entry: entryHirelings});"],
			["entsList.push({type: \"item\", name: `Order${ent.orders.length !== 1 ? \"s\" : \"\"}:`, entry: entryOrders});", "entsList.push({type: \"item\", name: `命令：`, entry: entryOrders});"],
			["entryLevel: ent.level ? `{@i Level ${ent.level} Bastion Facility}` : null,", "entryLevel: ent.level ? `{@i ${ent.level} 級堡壘設施}` : null,"],
			["sq ? `{@tip ${sq} sq|${sq} squares}` : null,", "sq ? `{@tip ${sq} 格|${sq} 格}` : null,"],
			[
				`			.join("; ");
		const ptSuffix = ptAdditional ? \` {@style [\${ptAdditional}]|muted;small}\` : "";

		return [spc.toTitleCase(), ptSuffix].filter(Boolean).join(" ");`,
				`			.join("；");
		const ptSuffix = ptAdditional ? \` {@style [\${ptAdditional}]|muted;small}\` : "";

		return [Renderer.facility.__zhSpace[spc] ?? spc.toTitleCase(), ptSuffix].filter(Boolean).join(" ");`,
			],
			["const ptTxt = `${cost} GP, ${time} days`;", "const ptTxt = `${cost} GP、${time} 天`;"],
			["const ptTipBasic = `${cost} GP and ${time} days to add`;", "const ptTipBasic = `增建需 ${cost} GP 與 ${time} 天`;"],
			[
				"return `{@tip ${ptTxt}|${ptTipBasic}, or, ${cost - costPrev} GP and ${time - timePrev} days to expand from a ${spcPrev.toTitleCase()} facility}`;",
				"return `{@tip ${ptTxt}|${ptTipBasic}；或從${Renderer.facility.__zhSpace[spcPrev]}設施擴建，需 ${cost - costPrev} GP 與 ${time - timePrev} 天}`;",
			],
			[
				"\"RF:B\": `{@note You may replace the standard feature of your background with this feature.}`,",
				"\"RF:B\": `{@note 你可以用這項特性取代你背景的標準特性。}`,",
			],
			[
				"\"CS\": `{@note See the {@adventure Character Secrets|IDRotF|0|character secrets} section for more information.}`,",
				"\"CS\": `{@note 更多資訊見{@adventure 角色秘密|IDRotF|0|character secrets}一節。}`,",
			],
		],
	},
	{
		file: "js/parser.js",
		replace: [
			[
				/Parser\.CHAR_OPTIONAL_FEATURE_TYPE_TO_FULL = \{[^}]*\};/,
				`Parser.CHAR_OPTIONAL_FEATURE_TYPE_TO_FULL = ${JSON.stringify(OPT)};`,
			],
		],
	},
	{
		file: "js/render-bastions.js",
		replace: [["<i>Level ${ent.level} Bastion Facility</i>", "<i>${ent.level} 級堡壘設施</i>"]],
	},
	{
		file: "js/bastions.js",
		replace: [
			[
				`const facilityType = (ent.facilityType || "Unknown").toTitleCase();`,
				`const facilityType = (${JSON.stringify(FTYPE)})[ent.facilityType || "unknown"] ?? ent.facilityType.toTitleCase();`,
			],
		],
	},
	{
		file: "js/filter-bastions.js",
		replace: [
			[`displayFn: it => it.toTitleCase(),`, `displayFn: it => (${JSON.stringify(FTYPE)})[it] ?? it.toTitleCase(),`],
		],
	},
];
