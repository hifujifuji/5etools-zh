// 來源說明：「TCE，第 9 頁。重印為 奇械師（EFA）。亦見於 ERLW，第 54 頁。收錄於 SRD 5.1 與基本規則（5e/2014）。」

export default [
	{
		file: "js/render.js",
		replace: [
			[
				"static getSourceAndPageTrHtml (it) {\n\t\tconst html = Renderer.utils.getSourceAndPageHtml(it);\n\t\treturn html ? `<b>Source:</b> ${html}` : \"\";",
				"static getSourceAndPageTrHtml (it) {\n\t\tconst html = Renderer.utils.getSourceAndPageHtml(it);\n\t\treturn html ? `<b>來源：</b> ${html}` : \"\";",
			],
			[
				"${!isStringList && Renderer.utils.isDisplayPage(as.page) ? `, page ${as.page}` : \"\"}`;\n\t\t\t})\n\t\t\t.join(\"; \")}`;",
				"${!isStringList && Renderer.utils.isDisplayPage(as.page) ? `，第 ${as.page} 頁` : \"\"}`;\n\t\t\t})\n\t\t\t.join(\"；\")}`;",
			],
			[
				"return `${introText} ${ent[prop]",
				"return `${({\"Also found in\": \"亦見於\", \"Referenced in\": \"引用於\", \"Additional information from\": \"補充資訊來自\", \"External sources:\": \"外部來源：\"})[introText] || introText} ${ent[prop]",
			],
			[
				"return `${Renderer.stripTags(displayText || name)} in ${Parser.sourceJsonToAbv(source)}`;",
				"return `${Renderer.stripTags(displayText || name)}（${Parser.sourceJsonToAbv(source)}）`;",
			],
			[
				"return `${Renderer.get().render(asTag)} in <i class=\"ve-help-subtle\" title=\"${Parser.sourceJsonToFull(source).qq()}\">${Parser.sourceJsonToAbv(source)}</i>`;\n\t\t\t})\n\t\t\t.join(\"; \");\n\n\t\treturn `Reprinted as ${ptReprinted}`;",
				"return `${Renderer.get().render(asTag)}（<i class=\"ve-help-subtle\" title=\"${Parser.sourceJsonToFull(source).qq()}\">${Parser.sourceJsonToAbv(source)}</i>）`;\n\t\t\t})\n\t\t\t.join(\"；\");\n\n\t\treturn `重印為 ${ptReprinted}`;",
			],
			[
				"${Parser.sourceJsonToAbv(ent.source)}${sourceSub}${isText ? \"\" : `</i>`}${Renderer.utils.isDisplayPage(ent.page) ? `, page ${ent.page}` : \"\"}`;",
				"${Parser.sourceJsonToAbv(ent.source)}${sourceSub}${isText ? \"\" : `</i>`}${Renderer.utils.isDisplayPage(ent.page) ? `，第 ${ent.page} 頁` : \"\"}`;",
			],
			[
				"? `${isText ? \"\" : `the <span title=\"Systems Reference Document (5.2)\">`}SRD 5.2.1${isText ? \"\" : `</span>`}${typeof ent.srd === \"string\" ? ` (as &quot;${ent.srd}&quot;)` : \"\"}`",
				"? `${isText ? \"\" : `<span title=\"系統參考文件（5.2）\">`}SRD 5.2.1${isText ? \"\" : `</span>`}${typeof ent.srd === \"string\" ? `（名為「${ent.srd}」）` : \"\"}`",
			],
			[
				"? `${isText ? \"\" : `the <span title=\"Systems Reference Document (5.1)\">`}SRD 5.1${isText ? \"\" : `</span>`}${typeof ent.srd === \"string\" ? ` (as &quot;${ent.srd}&quot;)` : \"\"}`",
				"? `${isText ? \"\" : `<span title=\"系統參考文件（5.1）\">`}SRD 5.1${isText ? \"\" : `</span>`}${typeof ent.srd === \"string\" ? `（名為「${ent.srd}」）` : \"\"}`",
			],
			[
				"? `the Basic Rules (5.5e/2024)${typeof ent.basicRules2024 === \"string\" ? ` (as &quot;${ent.basicRules2024}&quot;)` : \"\"}`",
				"? `基本規則（5.5e/2024）${typeof ent.basicRules2024 === \"string\" ? `（名為「${ent.basicRules2024}」）` : \"\"}`",
			],
			[
				"? `the Basic Rules (5e/2014)${typeof ent.basicRules === \"string\" ? ` (as &quot;${ent.basicRules}&quot;)` : \"\"}`",
				"? `基本規則（5e/2014）${typeof ent.basicRules === \"string\" ? `（名為「${ent.basicRules}」）` : \"\"}`",
			],
			[
				"const srdAndBasicRulesText = (srdText || basicRulesText) ? `Available in ${[srdText, basicRulesText].filter(it => it).join(\" and \")}` : \"\";",
				"const srdAndBasicRulesText = (srdText || basicRulesText) ? `收錄於 ${[srdText, basicRulesText].filter(it => it).join(\" 與 \")}` : \"\";",
			],
			[
				"srdAndBasicRulesText, externalSourceText].filter(it => it).join(\". \")}${baseText && (addSourceText || otherSourceText || referenceSourceText || srdAndBasicRulesText || externalSourceText) ? \".\" : \"\"}`;",
				"srdAndBasicRulesText, externalSourceText].filter(it => it).join(\"。\")}${baseText && (addSourceText || otherSourceText || referenceSourceText || srdAndBasicRulesText || externalSourceText) ? \"。\" : \"\"}`;",
			],
		],
	},
	{
		file: "js/classes.js",
		replace: [
			["<b>Class source:</b> ${htmlSource}", "<b>職業來源：</b> ${htmlSource}"],
		],
	},
];
