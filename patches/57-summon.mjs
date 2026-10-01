// 召喚物數據的介面殘留英文：「your spell attack modifier」「the spell's level」「Summoned By:」。

export default [
	{
		file: "js/render.js",
		replace: [
			[`displayText: displayText || "your spell attack modifier",`, `displayText: displayText || "你的法術攻擊調整值",`],
			[`return displayText || "your spell attack modifier";`, `return displayText || "你的法術攻擊調整值";`],
			[`.replace(/summonSpellLevel/g, "the spell's level");`, `.replace(/summonSpellLevel/g, "法術環階");`],
			[`.replace(/summonClassLevel/g, "your class level");`, `.replace(/summonClassLevel/g, "你的職業等級");`],
			[`<div><b>Summoned By:</b>`, `<div><b>召喚自：</b>`],
		],
	},
	{
		file: "js/render-bestiary.js",
		replace: [
			[`<b>Summoned By:</b>`, `<b>召喚自：</b>`],
		],
	},
];
