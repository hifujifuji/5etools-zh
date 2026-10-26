// 語言頁的介面字串
export default [
	{
		file: "js/render.js",
		replace: [
			["entryType: ent.type ? `{@i ${ent.type.toTitleCase()} language}` : null,", "entryType: ent.type ? `{@i ${({standard: \"標準\", exotic: \"異國\", rare: \"珍稀\", secret: \"秘密\"})[ent.type] ?? ent.type.toTitleCase()}語言}` : null,"],
			["`{@b Typical Speakers:} ${ent.typicalSpeakers.join(\", \")}`", "`{@b 典型使用者：} ${ent.typicalSpeakers.join(\"、\")}`"],
			["`{@b Origin:} ${ent.origin}`", "`{@b 起源：} ${ent.origin}`"],
			["`{@b Script:} ${ent.script}`", "`{@b 文字：} ${ent.script}`"],
			["entriesContent.push(`This language is a family which includes the following dialects: ${ent.dialects.sort(SortUtil.ascSortLower).join(\", \")}. Creatures that speak different dialects of the same language can communicate with one another.`);", "entriesContent.push(`這種語言是一個語族，包含下列方言：${ent.dialects.sort(SortUtil.ascSortLower).map(d => ({Githzerai: \"吉斯澤萊語\", Githyanki: \"吉斯洋基語\", Auran: \"氣族語\", Aquan: \"水族語\", Ignan: \"火族語\", Terran: \"土族語\"})[d] ?? d).join(\"、\")}。說同一語言不同方言的生物可以互相溝通。`);"],
			["entriesContent.push(\"{@i No information available.}\");", "entriesContent.push(\"{@i 沒有可用的資訊。}\");"],
		],
	},
];
