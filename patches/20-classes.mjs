// 職業頁：特性標題、職業表、子職業按鈕顯示中文名

export default [
	{
		file: "js/render.js",
		replace: [
			[
				"return {_displayName: `Level ${ent.level}: ${ent._displayName || ent.name}`, ...ent};",
				"return {_displayName: `${ent.level} 級：${ent._displayName || (globalThis.ZH && ZH.name(ent)) || ent.name}`, ...ent};",
			],
		],
	},
	{
		file: "js/classes.js",
		replace: [
			[
				"const lnk = ee`<a>${it._displayNameTable || it._displayName || it.name}</a>`",
				"const lnk = ee`<a>${ZH.name(it) || it._displayNameTable || it._displayName || it.name}</a>`",
			],
			[
				"dispName.txt(this._state.isShowScSources ? ClassesPage.getBaseShortName(sc) : sc.shortName);",
				"dispName.txt(ZH.name(sc) || (this._state.isShowScSources ? ClassesPage.getBaseShortName(sc) : sc.shortName));",
			],
		],
	},
];
