// 職業頁：特性標題、職業表、子職業按鈕顯示中文名

export default [
	// 子職業篩選預設下拉選單
	{
		file: "js/classes.js",
		replace: [
			['{name: "View Default", subHashes', '{name: "預設", subHashes'],
			['{name: "View Standard Plus Partnered", subHashes', '{name: "官方＋合作內容", subHashes'],
			['{name: "View Standard Plus Homebrew", subHashes', '{name: "官方＋自製內容", subHashes'],
			['{name: "View Most Recent", subHashes', '{name: "僅最新版本", subHashes'],
			['{name: "View All", subHashes', '{name: "全部顯示", subHashes'],
			['<option value="-1" disabled>Filter...</option>', '<option value="-1" disabled>篩選…</option>'],
			['title="Reset Selection"><span class="glyphicon glyphicon-refresh">', 'title="重設選取"><span class="glyphicon glyphicon-refresh">'],
		],
	},
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
