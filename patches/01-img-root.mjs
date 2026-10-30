// 圖片不隨站上傳（dist 沒有 img/），改從 5etools 官方圖片庫載入
export default [
	{
		file: "js/utils.js",
		replace: [
			["globalThis.DEPLOYED_IMG_ROOT = undefined;", `globalThis.DEPLOYED_IMG_ROOT = "https://raw.githubusercontent.com/5etools-mirror-3/5etools-img/main/";`],
		],
	},
];
