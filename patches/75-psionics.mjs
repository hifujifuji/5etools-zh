// 秘術士靈能頁：選項名稱用中文、花費／專注標示、類型與修會名稱中文化
export default [
	{
		file: "psionics.html",
		replace: [["data-sort=\"order\">Order</button>", "data-sort=\"order\">修會</button>"]],
	},
	{
		file: "js/parser.js",
		replace: [
			[`Parser.PSI_ORDER_NONE = "None";`, `Parser.PSI_ORDER_NONE = "無";`],
			[
				`	if (type === Parser.PSI_ABV_TYPE_TALENT) out = {hasOrder: false, full: "Talent"};
	else if (type === Parser.PSI_ABV_TYPE_DISCIPLINE) out = {hasOrder: true, full: "Discipline"};`,
				`	if (type === Parser.PSI_ABV_TYPE_TALENT) out = {hasOrder: false, full: "靈能天賦", short: "天賦"};
	else if (type === Parser.PSI_ABV_TYPE_DISCIPLINE) out = {hasOrder: true, full: "靈能戒律", short: "戒律"};`,
			],
			[
				`	return order === undefined ? Parser.PSI_ORDER_NONE : order;`,
				`	return order === undefined ? Parser.PSI_ORDER_NONE : ({Avatar: "化身", Awakened: "覺醒", Immortal: "不朽", Nomad: "遊牧", "Wu Jen": "巫人", "Soul Knife": "靈魂之刃"}[order] || order);`,
			],
		],
	},
	{
		file: "js/render.js",
		replace: [
			[
				`		mode.name = [mode.name, Renderer.psionic._enhanceMode_getModeTitleBracketPart({mode: mode})].filter(Boolean).join(" ");

		if (mode.submodes) {
			mode.submodes.forEach(sm => {
				sm.name = [sm.name, Renderer.psionic._enhanceMode_getModeTitleBracketPart({mode: sm})].filter(Boolean).join(" ");`,
				`		const __zn = m => m.name_zh && (m._zhOf == null || m._zhOf === m.name) ? m.name_zh : m.name;
		mode.name = [__zn(mode), Renderer.psionic._enhanceMode_getModeTitleBracketPart({mode: mode})].filter(Boolean).join("");

		if (mode.submodes) {
			mode.submodes.forEach(sm => {
				sm.name = [__zn(sm), Renderer.psionic._enhanceMode_getModeTitleBracketPart({mode: sm})].filter(Boolean).join("");`,
			],
			["return `(${modeTitleBracketArray.join(\"; \")})`;", "return `（${modeTitleBracketArray.join(\"；\")}）`;"],
			["return `${costString} psi`;", "return `${costString} 靈能點`;"],
			[
				"return `conc., ${mode.concentration.duration} ${mode.concentration.unit}.`;",
				"return `專注，${mode.concentration.duration} ${({min: \"分鐘\", hr: \"小時\", rnd: \"輪\"})[mode.concentration.unit] || mode.concentration.unit}`;",
			],
			["entryFocus: ent.focus ? `{@b {@i Psychic Focus.}} ${ent.focus}` : null,", "entryFocus: ent.focus ? `{@b {@i 心靈專注。}}${ent.focus}` : null,"],
			[
				"? typeMeta.isAltDisplay ? `${typeMeta.full} (${psi.order})` : `${psi.order} ${typeMeta.full}`",
				"? typeMeta.isAltDisplay ? `${typeMeta.full}（${Parser.psiOrderToFull(psi.order)}）` : `${Parser.psiOrderToFull(psi.order)}${typeMeta.full.replace(/^靈能/, \"\")}`",
			],
		],
	},
];
