// 列表頁：背景名稱顯示中文、2024 背景屬性欄「起源（力／體／魅）」

export default [
	{
		file: "js/backgrounds.js",
		replace: [
			[
				`<span class="ve-bold ve-col-2-5 ve-pl-0 ve-pr-1">\${name}</span>`,
				`<span class="ve-bold ve-col-2-5 ve-pl-0 ve-pr-1">\${ZH.nameHtml(bg)}</span>`,
			],
		],
	},
	{
		file: "js/render.js",
		replace: [
			[
				"return new Renderer._AbilityData({asTextShort: `Origin (${abArr[0].choose?.weighted?.from.map(it => it.uppercaseFirst()).join(\"/\")})`});",
				"return new Renderer._AbilityData({asTextShort: `起源（${abArr[0].choose?.weighted?.from.map(it => ({str: \"力量\", dex: \"敏捷\", con: \"體質\", int: \"智力\", wis: \"感知\", cha: \"魅力\"})[it] || it).join(\"／\")}）`});",
			],
			[
				"return new Renderer._AbilityData({asTextShort: `Origin (Any)`});",
				"return new Renderer._AbilityData({asTextShort: `起源（任意）`});",
			],
		],
	},
];
