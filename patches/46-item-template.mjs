// 物品模板（itemEntry）代入的值：傷害類型、顏色、寶石等改用中文。
// render.js 在 node 產生搜尋索引時也會跑，所以字典直接寫在程式裡。

const TPL_ZH = {
	acid: "酸蝕", cold: "寒冰", fire: "火焰", force: "力場", lightning: "閃電", necrotic: "死靈",
	poison: "毒素", psychic: "精神", radiant: "光耀", thunder: "雷鳴",
	bludgeoning: "鈍擊", piercing: "穿刺", slashing: "劈砍",
	green: "綠色", blue: "藍色", red: "紅色", white: "白色", yellow: "黃色", black: "黑色",
	violet: "紫色", silver: "銀色", gold: "金色", orange: "橙色",
	pearl: "珍珠", tourmaline: "電氣石", garnet: "石榴石", sapphire: "藍寶石", citrine: "黃水晶",
	jet: "煤玉", amethyst: "紫水晶", jade: "玉", topaz: "黃玉", spinel: "尖晶石",
	"drips acid": "滴著酸液", "crackles with lightning": "劈啪閃著電光", "issues green gas": "冒出綠色氣體",
	"is wreathed in fire": "被火焰環繞", "is covered in frost": "覆上一層霜",
};

const HELPER = `const __tplZh = ${JSON.stringify(TPL_ZH)};
		const __tplMap = v => typeof v === "string" ? (__tplZh[v.toLowerCase()] || v)
			: Array.isArray(v) && v.every(x => typeof x === "string") ? v.map(x => __tplZh[x.toLowerCase()] || x).join("、")
			: v;`;

export default [
	{
		file: "js/render.js",
		replace: [
			["`{@note See the {@variantrule Tool Proficiencies|XGE} entry for more information.}`", "`{@note 更多資訊見{@variantrule Tool Proficiencies|XGE|工具熟練}條目。}`"],
			['"A {@class druid} can use this object as a spellcasting focus."', '"{@class druid}可以用這件物件作為施法法器。"'],
			["<div><b>Tool Proficiencies:</b> <span>", "<div><b>工具熟練：</b> <span>"],
			["\"An arcane focus is a special item\\u2014an orb, a crystal, a rod, a specially constructed staff, a wand-like length of wood, or some similar item\\u2014designed to channel the power of arcane spells. A {@class sorcerer}, {@class warlock}, or {@class wizard} can use such an item as a spellcasting focus.\"", "\"奧術法器是一種特殊物品——法球、水晶、權杖、特製的法杖、魔杖般的木棒或類似物品——設計來引導奧術法術的力量。{@class sorcerer}、{@class warlock}或{@class wizard}可以用這類物品作為施法法器。\""],
			["\"An Arcane Focus takes a specific form and is bejeweled or carved to channel arcane magic. A {@class Sorcerer|XPHB}, {@class Warlock|XPHB}, or {@class Wizard|XPHB} can use such an item as a {@variantrule Spellcasting Focus|XPHB}.\"", "\"奧術法器有特定的形式，並鑲有寶石或經過雕刻以引導奧術魔法。{@class Sorcerer|XPHB|術士}、{@class Warlock|XPHB|契術師}或{@class Wizard|XPHB|法師}可以用這類物品作為{@variantrule Spellcasting Focus|XPHB|施法法器}。\""],
			["\"A druidic focus might be a sprig of mistletoe or holly, a wand or scepter made of yew or another special wood, a staff drawn whole out of a living tree, or a totem object incorporating feathers, fur, bones, and teeth from sacred animals. A {@class druid} can use such an object as a spellcasting focus.\"", "\"德魯伊法器可以是一枝槲寄生或冬青、以紫杉或其他特殊木材製成的魔杖或權杖、從活樹上整根取下的法杖，或結合了聖獸羽毛、毛皮、骨頭與牙齒的圖騰物。{@class druid}可以用這類物件作為施法法器。\""],
			["\"A Druidic Focus takes a specific form and is carved, tied with ribbon, or painted to channel primal magic. A {@class Druid|XPHB} or {@class Ranger|XPHB} can use such an object as a {@variantrule Spellcasting Focus|XPHB}.\"", "\"德魯伊法器有特定的形式，並經過雕刻、繫上緞帶或彩繪以引導原初魔法。{@class Druid|XPHB|德魯伊}或{@class Ranger|XPHB|遊俠}可以用這類物件作為{@variantrule Spellcasting Focus|XPHB|施法法器}。\""],
			["\"A holy symbol is a representation of a god or pantheon. It might be an amulet depicting a symbol representing a deity, the same symbol carefully engraved or inlaid as an emblem on a shield, or a tiny box holding a fragment of a sacred relic. A cleric or paladin can use a holy symbol as a spellcasting focus. To use the symbol in this way, the caster must hold it in hand, wear it visibly, or bear it on a shield.\"", "\"聖徽是某位神祇或某個神系的象徵。它可以是一枚刻有神祇象徵符號的護符、以同樣的符號精心雕刻或鑲嵌在盾牌上的徽記，或一只裝著聖物碎片的小盒子。牧師或聖騎士可以用聖徽作為施法法器。要以此方式使用聖徽，施法者必須將它握在手中、明顯地佩戴在身上，或將它置於盾牌上。\""],
			["\"A Holy Symbol takes a specific form and is bejeweled or painted to channel divine magic. A {@class Cleric|XPHB} or {@class Paladin|XPHB} can use a Holy Symbol as a {@variantrule Spellcasting Focus|XPHB}.\"", "\"聖徽有特定的形式，並鑲有寶石或經過彩繪以引導神聖魔法。{@class Cleric|XPHB|牧師}或{@class Paladin|XPHB|聖騎士}可以用聖徽作為{@variantrule Spellcasting Focus|XPHB|施法法器}。\""],
			["\"An arcane focus is a special item designed to channel the power of arcane spells. A {@class sorcerer}, {@class warlock}, or {@class wizard} can use such an item as a spellcasting focus.\"", "\"奧術法器是設計來引導奧術法術力量的特殊物品。{@class sorcerer}、{@class warlock}或{@class wizard}可以用這類物品作為施法法器。\""],
			["\"A holy symbol is a representation of a god or pantheon. A {@class cleric} or {@class paladin} can use a holy symbol as a spellcasting focus. To use the symbol in this way, the caster must hold it in hand, wear it visibly, or bear it on a shield.\"", "\"聖徽是某位神祇或某個神系的象徵。{@class cleric}或{@class paladin}可以用聖徽作為施法法器。要以此方式使用聖徽，施法者必須將它握在手中、明顯地佩戴在身上，或將它置於盾牌上。\""],
			[
				"return `{@item ${base.name}|${base.source}} ({@item ${specificVariant.name}|${specificVariant.source}})`;",
				"const __z = e => e.name_zh && (e._zhOf == null || e._zhOf === e.name) ? `|${e.name_zh}` : \"\";\n								return `{@item ${base.name}|${base.source}${__z(base)}}（{@item ${specificVariant.name}|${specificVariant.source}${__z(specificVariant)}}）`;",
			],
			["<span class=\"ve-bold\">Found On: </span>${item.lootTables.sort(SortUtil.ascSortLower).map(tbl => renderer.render(`{@table ${tbl}}`)).join(\", \")}", "<span class=\"ve-bold\">出現於：</span>${item.lootTables.sort(SortUtil.ascSortLower).map(tbl => renderer.render(`{@table ${tbl}}`)).join(\"、\")}"],
			[`					name: "Base items",`, `					name: "基礎物品",`],
			[`"This item variant can be applied to the following base items:",`, `"這個物品變體可以套用在下列基礎物品上：",`],
			[
				"wrapped: `{@note The {@item ${baseItem.name}|${baseItem.source}|base item} can be found in ${Parser.sourceJsonToFull(baseItem.source)}${baseItem.page ? `, page ${baseItem.page}` : \"\"}.}`,",
				"wrapped: `{@note {@item ${baseItem.name}|${baseItem.source}|基礎物品}收錄於${globalThis.ZH?.t?.(Parser.sourceJsonToFull(baseItem.source)) ?? Parser.sourceJsonToFull(baseItem.source)}${baseItem.page ? `，第 ${baseItem.page} 頁` : \"\"}。}`,",
			],
			// {=prop} 代入：舊譯文的 {=genericBonus} 對應到現行的加值欄位；{=baseName} 用基礎物品的中文名
			[
				`			const [path, modifiers] = s.slice(2, -1).split("/");
			let fromProp = object[path];`,
				`			const [path, modifiers] = s.slice(2, -1).split("/");
			let fromProp = object[path];
			if (fromProp == null && path === "genericBonus") fromProp = object.bonusWeapon ?? object.bonusAc ?? object.bonusSpellAttack ?? object.bonusSavingThrow ?? "";
			if (path === "baseName" && object.__baseNameZh) { textStack += object.__baseNameZh; continue; }
			if (path === "dmgType" && typeof fromProp === "string") fromProp = ({acid: "酸蝕", bludgeoning: "鈍擊", cold: "寒冰", fire: "火焰", force: "力場", lightning: "閃電", necrotic: "死靈", piercing: "穿刺", poison: "毒素", psychic: "精神", radiant: "光耀", slashing: "劈砍", thunder: "雷鳴"})[fromProp.toLowerCase()] ?? fromProp;`,
			],
			[
				`			baseName: baseItem.name,`,
				`			baseName: baseItem.name,
			__baseNameZh: baseItem.name_zh && (baseItem._zhOf == null || baseItem._zhOf === baseItem.name) ? baseItem.name_zh : null,`,
			],
			[
				`			if (args.length === 1) {
				return Renderer.utils._applyTemplate_getValue(ent, args[0]);
			} else if (args.length === 2) {
				const val = Renderer.utils._applyTemplate_getValue(ent, args[1]);
				switch (args[0]) {
					case "getFullImmRes": return Parser.getFullImmRes(`,
				`			${HELPER}
			if (args.length === 1) {
				return __tplMap(Renderer.utils._applyTemplate_getValue(ent, args[0]));
			} else if (args.length === 2) {
				const val = Renderer.utils._applyTemplate_getValue(ent, args[1]);
				if (args[0] === "getFullImmRes" && Array.isArray(val) && val.every(x => typeof x === "string")) return __tplMap(val);
				switch (args[0]) {
					case "getFullImmRes": return Parser.getFullImmRes(`,
			],
			// 物品內文會把物品名改成斜體；_zhOf 也被改掉的話就和 name 對不上，中文小標便失效
			[`		Renderer.item._GET_RENDERED_ENTRIES_WALKER = Renderer.item._GET_RENDERED_ENTRIES_WALKER || MiscUtil.getWalker({
			keyBlocklist: new Set([
				...MiscUtil.GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST,
				"data",`, `		Renderer.item._GET_RENDERED_ENTRIES_WALKER = Renderer.item._GET_RENDERED_ENTRIES_WALKER || MiscUtil.getWalker({
			keyBlocklist: new Set([
				...MiscUtil.GENERIC_WALKER_ENTRIES_KEY_BLOCKLIST,
				"data", "_zhOf", "name_zh",`],
			// {@chance 5} →「5%」
			["if (entry.successThresh != null) return `${entry.successThresh} percent`;", "if (entry.successThresh != null) return `${entry.successThresh}%`;"],
			["return displayText || `${rollText} percent`;", "return displayText || `${rollText}%`;"],
		],
	},
];
