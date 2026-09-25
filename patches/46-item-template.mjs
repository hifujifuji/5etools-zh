// 物品模板（itemEntry）代入的值：傷害類型、顏色、寶石等改用中文。
// render.js 在 node 產生搜尋索引時也會跑，所以字典直接寫在程式裡。

const TPL_ZH = {
	acid: "酸蝕", cold: "寒冷", fire: "火焰", force: "力場", lightning: "閃電", necrotic: "黯蝕",
	poison: "毒素", psychic: "心靈", radiant: "光耀", thunder: "雷鳴",
	bludgeoning: "鈍擊", piercing: "穿刺", slashing: "劈砍",
	green: "綠色", blue: "藍色", red: "紅色", white: "白色", yellow: "黃色", black: "黑色",
	violet: "紫色", silver: "銀色", gold: "金色", orange: "橙色",
	pearl: "珍珠", tourmaline: "電氣石", garnet: "石榴石", sapphire: "藍寶石", citrine: "黃水晶",
	jet: "煤玉", amethyst: "紫水晶", jade: "玉", topaz: "黃玉", spinel: "尖晶石",
	"drips acid": "滴著酸液", "crackles with lightning": "劈啪閃著電光", "issues green gas": "冒出綠色氣體",
	"is wreathed in fire": "被火焰環繞", "is covered in frost": "覆上一層霜",
};

const HELPER = `const __tplZh = ${JSON.stringify(TPL_ZH)};
		const __tplMap = v => typeof v === "string" ? (__tplZh[v.toLowerCase()] || v)
			: Array.isArray(v) && v.every(x => typeof x === "string") ? v.map(x => __tplZh[x.toLowerCase()] || x).join("、")
			: v;`;

export default [
	{
		file: "js/render.js",
		replace: [
			[
				`			if (args.length === 1) {
				return Renderer.utils._applyTemplate_getValue(ent, args[0]);
			} else if (args.length === 2) {
				const val = Renderer.utils._applyTemplate_getValue(ent, args[1]);
				switch (args[0]) {
					case "getFullImmRes": return Parser.getFullImmRes(`,
				`			${HELPER}
			if (args.length === 1) {
				return __tplMap(Renderer.utils._applyTemplate_getValue(ent, args[0]));
			} else if (args.length === 2) {
				const val = Renderer.utils._applyTemplate_getValue(ent, args[1]);
				if (args[0] === "getFullImmRes" && Array.isArray(val) && val.every(x => typeof x === "string")) return __tplMap(val);
				switch (args[0]) {
					case "getFullImmRes": return Parser.getFullImmRes(`,
			],
			// {@chance 5} →「5%」
			["if (entry.successThresh != null) return `${entry.successThresh} percent`;", "if (entry.successThresh != null) return `${entry.successThresh}%`;"],
			["return displayText || `${rollText} percent`;", "return displayText || `${rollText}%`;"],
		],
	},
];
