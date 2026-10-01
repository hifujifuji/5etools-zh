// 牌組頁：卡牌標題用中文名、花色與點數中文化、繪者標示中文化。
// render.js 在 node 產生搜尋索引時也會跑，所以字典直接寫在程式裡。

const SUIT_ZH = {
	hearts: "紅心", diamonds: "方塊", spades: "黑桃", clubs: "梅花",
	swords: "劍", coins: "錢幣", stars: "星辰", glyphs: "符印",
	strength: "力量", intelligence: "智力", wisdom: "感知", charisma: "魅力",
};
const VALUE_ZH = {ace: "王牌", master: "大師", page: "侍從", knight: "騎士", queen: "王后", king: "國王", jack: "侍衛", joker: "鬼牌"};
const PLAYING = {ace: "A", king: "K", queen: "Q", jack: "J"};

export default [
	{
		file: "js/render.js",
		replace: [
			[
				`			if (suitAndValue.toLowerCase() !== ent.name.toLowerCase()) entries.unshift(\`{@i \${suitAndValue}}\`);`,
				`			if (suitAndValue.toLowerCase() !== ent.name.toLowerCase()) {
				const __suitZh = ${JSON.stringify(SUIT_ZH)}[ent.suit.toLowerCase()];
				const __isPlaying = ["hearts", "diamonds", "spades", "clubs"].includes(ent.suit.toLowerCase());
				const __vn = (ent.valueName || "").toLowerCase();
				const __valZh = __isPlaying
					? (${JSON.stringify(PLAYING)}[__vn] || (ent.value != null ? \`\${ent.value}\` : ent.valueName))
					: (${JSON.stringify(VALUE_ZH)}[__vn] || (ent.value != null ? "零一二三四五六七八九十".split("")[ent.value] || \`\${ent.value}\` : ent.valueName));
				entries.unshift(__suitZh && __valZh ? \`{@i \${__suitZh}\${__isPlaying ? " " : ""}\${__valZh}}\` : \`{@i \${suitAndValue}}\`);
			}`,
			],
			["ent.face?.credit ? `art credit: ${ent.face?.credit}` : null,", "ent.face?.credit ? `繪者：${ent.face?.credit}` : null,"],
			["(backCredit || ent.back?.credit) ? `art credit (reverse): ${backCredit || ent.back?.credit}` : null,", "(backCredit || ent.back?.credit) ? `繪者（背面）：${backCredit || ent.back?.credit}` : null,"],
			[
				`			.join(", ")
			.uppercaseFirst();
		if (ptCredits) entries.push(`,
				`			.join("、");
		if (ptCredits) entries.push(`,
			],
			// 牌組的懸浮視窗：卡牌清單
			[
				`			name: "Cards",
			entries: [
				{
					type: "list",
					columns: 3,
					items: ent.cards.map(card => \`{@card \${card.name}|\${card.set}|\${card.source}}\`),`,
				`			name: "卡牌",
			entries: [
				{
					type: "list",
					columns: 3,
					items: ent.cards.map(card => \`{@card \${card.name}|\${card.set}|\${card.source}\${card.name_zh && card._zhOf === card.name ? \`|\${card.name_zh}\` : ""}}\`),`,
			],
		],
	},
	{
		file: "js/render-decks.js",
		replace: [
			[
				`.render({name: card.name, entries: Renderer.card.getFullEntries(card, {backCredit: deck?.back?.credit})}, 1);`,
				`.render({name: card.name, name_zh: card.name_zh, _zhOf: card._zhOf, entries: Renderer.card.getFullEntries(card, {backCredit: deck?.back?.credit})}, 1);`,
			],
			[`decks__h-cards">Cards</h3>`, `decks__h-cards">卡牌</h3>`],
		],
	},
];
