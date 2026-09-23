// 全站搜尋支援中文：
// - elasticlunr 的 trimmer 用 \W 去頭尾，會把中文字整個刪掉 → 改成 Unicode 版
// - 中文名額外產生後綴 token（火球術 → 火球術/球術/術），搭配前綴展開就能搜任意片段

export default [
	{
		file: "lib/elasticlunr.js",
		replace: [[
			`return e.replace(/^\\W+/,"").replace(/\\W+$/,"")`,
			`return e.replace(/^[^\\p{L}\\p{N}_]+/u,"").replace(/[^\\p{L}\\p{N}_]+$/u,"")`,
		]],
	},
	{
		file: "js/omnisearch/omnisearch-backing.js",
		replace: [[
			`		elasticlunr.clearStopWords();
		this._searchIndex = elasticlunr(function () {`,
			`		elasticlunr.clearStopWords();
		globalThis.ZH?.patchElasticlunr(elasticlunr);
		this._searchIndex = elasticlunr(function () {`,
		]],
	},
];
