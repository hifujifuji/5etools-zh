// 2024 版物品：武器屬性、精通屬性的名稱改用中文；中文全形標點的行內標題不再多加句點。
// render.js 在 node 產生搜尋索引時也會跑，所以不依賴 ZH。

const ZN = `const __zn = e => e?.name_zh && (e._zhOf == null || e._zhOf === e.name) ? e.name_zh : null;`;

export default [
	{
		file: "js/render.js",
		replace: [
			// 「屬性：」「使用：」這類中文標題後面不要再補「.」
			[
				`Renderer._INLINE_HEADER_TERMINATORS = new Set([".", ",", "!", "?", ";", ":", \`"\`]);`,
				`Renderer._INLINE_HEADER_TERMINATORS = new Set([".", ",", "!", "?", ";", ":", \`"\`, "。", "，", "！", "？", "；", "：", "」"]);`,
			],
			// 武器屬性名稱（2024 版名稱在 entries[0].name）：「多用 (1d10)」
			[
				`	static getPropertyName (ent) {
		return ent.name || (ent.entries || ent.entriesTemplate)[0]?.name || "Unknown";`,
				`	static getPropertyName (ent) {
		${ZN}
		const e0 = (ent.entries || ent.entriesTemplate)?.[0];
		return __zn(ent) || __zn(e0) || ent.name || e0?.name || "Unknown";`,
			],
			// 物品標頭的「精通屬性：削弱」
			[
				`			isSkipPrefix ? "" : "Mastery: ",
			item.mastery
				.map(info => {
					if (!info.uid) return renderer.render(\`{@itemMastery \${info}}\`);
					return renderer.render(\`{@itemMastery \${info.uid}} {@style (\${info.note})|small}\`);`,
				`			isSkipPrefix ? "" : "精通屬性：",
			item.mastery
				.map(info => {
					${ZN}
					const withZh = uid => {
						const zh = __zn(Renderer.item._getMastery(uid));
						if (!zh) return uid;
						const parts = String(uid).split("|");
						while (parts.length < 2) parts.push("");
						return [...parts.slice(0, 2), zh].join("|");
					};
					if (!info.uid) return renderer.render(\`{@itemMastery \${withZh(info)}}\`);
					return renderer.render(\`{@itemMastery \${withZh(info.uid)}} {@style (\${info.note})|small}\`);`,
			],
			// 物品內文的「精通屬性：削弱」段落標題
			[
				"name: `Mastery: ${mastery.name}`,",
				`name: \`精通屬性：\${(${ZN.replace(/^const __zn = /, "").replace(/;$/, "")})(mastery) || mastery.name}\`,`,
			],
			// 護甲的固定說明
			[
				`"The wearer has disadvantage on Dexterity ({@skill Stealth}) checks."`,
				`"穿戴者的敏捷（{@skill Stealth}）檢定具有劣勢。"`,
			],
			[
				`"The wearer has {@variantrule Disadvantage|XPHB} on Dexterity ({@skill Stealth|XPHB}) checks."`,
				`"穿戴者的敏捷（{@skill Stealth|XPHB}）檢定具有{@variantrule Disadvantage|XPHB}。"`,
			],
			[
				"wrapped: `If the wearer has a Strength score lower than ${item.strength}, their speed is reduced by 10 feet.`",
				"wrapped: `若穿戴者的力量值低於 ${item.strength}，其速度降低 10 呎。`",
			],
			[
				`wrapped: "Multiple variations of this item exist, as listed below:"`,
				`wrapped: "此物品有多種變體，列於下方："`,
			],
			[
				"const suffix = isAddDex ? ` + Dex${dexterityMax ? ` (max ${dexterityMax})` : \"\"}` : \"\";",
				"const suffix = isAddDex ? ` + 敏捷${dexterityMax ? `（最多 ${dexterityMax}）` : \"\"}` : \"\";",
			],
		],
	},
];
