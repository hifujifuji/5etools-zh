// 書本目錄導覽是用「英文標題文字」比對的；標題顯示成中文後，追蹤用的標題仍要用英文原名。
export default [
	{
		file: "js/render.js",
		replace: [
			[/_handleTrackTitles\(entry\.name\)/g, "_handleTrackTitles(entry._nameEn ?? entry.name)"],
			[/_getEnumeratedTitleRel\(entry\.name\)/g, "_getEnumeratedTitleRel(entry._nameEn ?? entry.name)"],
		],
	},
];
