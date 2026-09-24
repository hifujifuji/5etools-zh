// 法術頁介面：持續時間、子職業名稱、選用／變體職業標籤
const DUR = `const __ZH_DUR_UNIT = {turn: "回合", round: "輪", minute: "分鐘", hour: "小時", day: "天", week: "週", month: "個月", year: "年"};`;
export default [
	{
		file: "js/render.js",
		replace: [
			[
				"return `${duration.concentration ? `{@status Concentration${ptSrcStatus}}, ` : \"\"}${duration.concentration ? \"u\" : duration.duration.upTo ? \"U\" : \"\"}${duration.concentration || duration.duration.upTo ? \"p to \" : \"\"}${duration.duration.amount} ${duration.duration.amount === 1 ? duration.duration.type : `${duration.duration.type}s`}${ptCondition}`;",
				`{ ${DUR} return \`\${duration.concentration ? \`{@status Concentration\${ptSrcStatus}}，\` : ""}\${duration.concentration || duration.duration.upTo ? "至多 " : ""}\${duration.duration.amount} \${__ZH_DUR_UNIT[duration.duration.type] || duration.duration.type}\${ptCondition}\`; }`,
			],
			["return `Special${ptCondition}`;", "return `特殊${ptCondition}`;"],
			["return `Instantaneous${ptCondition}`;", "return `即效${ptCondition}`;"],
			["if (!duration.ends) return `Permanent${ptCondition}`;", "if (!duration.ends) return `永久${ptCondition}`;"],
			["return `Until ${endsToJoin.joinConjunct(\", \", \" or \")}${ptCondition}`;", "return `直到${endsToJoin.joinConjunct(\"、\", \"或\")}${ptCondition}`;"],
			["entryDuration: `${outParts.joinConjunct(hasSubOr ? \"; \" : \", \", \" or \")}${durations.length > 1 ? \" (see below)\" : \"\"}`,", "entryDuration: `${outParts.joinConjunct(hasSubOr ? \"；\" : \"、\", \"或\")}${durations.length > 1 ? \"（見下文）\" : \"\"}`,"],
			[">Optional/Variant Classes: </span>${Parser.spMainClassesToFull(current)}</div>`);", ">選用／變體職業：</span>${Parser.spMainClassesToFull(current)}</div>`);"],
		],
	},
	{
		file: "js/render-spells.js",
		replace: [
			[">Optional/Variant Classes: </span>${Parser.spMainClassesToFull(current)}</div>`);", ">選用／變體職業：</span>${Parser.spMainClassesToFull(current)}</div>`);"],
			[">Optional/Variant Classes (legacy): </span>", ">選用／變體職業（舊版）：</span>"],
			["<span class=\"ve-bold\">Classes (legacy): </span>", "<span class=\"ve-bold\">職業（舊版）：</span>"],
			["<span class=\"ve-bold\">Subclasses (legacy): </span>", "<span class=\"ve-bold\">子職業（舊版）：</span>"],
		],
	},
	{
		file: "js/parser.js",
		replace: [
			['"dispel": "dispelled",\n\t"trigger": "triggered",\n\t"discharge": "discharged",', '"dispel": "被解除",\n\t"trigger": "被觸發",\n\t"discharge": "被釋放",'],
			// 子職業名稱：用子職業的中文名（全站子職業清單在 ZH 名稱表中）
			[
				"const text = `${sc.shortName}${sc.subSubclass ? ` (${sc.subSubclass})` : \"\"}`;",
				"const __scZh = globalThis.ZH?.subclassName?.(c.name, sc.shortName) || sc.shortName;\n\tconst text = `${__scZh}${sc.subSubclass ? `（${sc.subSubclass}）` : \"\"}`;",
			],
		],
	},
];
