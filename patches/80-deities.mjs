// 神祇頁：屬性標籤、神系／類別名稱中文化（資料中的 pantheon／category 保留英文，供篩選與網址使用）
import fs from "node:fs";
import path from "node:path";

export default function ({root}) {
	const df = JSON.parse(fs.readFileSync(path.join(root, "i18n", "deity-fields.json"), "utf8"));
	const domain = {Arcana: "奧秘", Death: "死亡", Forge: "鍛造", Grave: "墳墓", Knowledge: "知識", Life: "生命", Light: "光明", Nature: "自然", Order: "秩序", Peace: "和平", Tempest: "暴風", Trickery: "詭術", Twilight: "暮光", War: "戰爭", Unknown: "未知", None: "無"};
	const zh = JSON.stringify({pantheon: df.pantheon, category: df.category, domain});
	return [
		{
			file: "js/render.js",
			replace: [
				[
					`Renderer.deity = class {
	static _BASE_PART_TRANSLATORS = {
		"alignment": {
			name: "Alignment",`,
					`Renderer.deity = class {
	static __zh = ${zh};
	static __zhPantheon (it) { return Renderer.deity.__zh.pantheon[it] || it; }
	static __zhDomain (it) { return Renderer.deity.__zh.domain[it] || it; }
	static __zhCategory (it) { return Renderer.deity.__zh.category[it] || (globalThis.ZH?.t?.(it) ?? it); }
	static _BASE_PART_TRANSLATORS = {
		"alignment": {
			name: "陣營",`,
				],
				[
					`		"pantheon": {
			name: "Pantheon",
		},
		"category": {
			name: "Category",
			displayFn: it => typeof it === "string" ? it : it.join(", "),
		},
		"domains": {
			name: "Domains",
			displayFn: (it) => it.join(", "),
		},
		"province": {
			name: "Province",
		},
		"dogma": {
			name: "Dogma",
		},
		"altNames": {
			name: "Alternate Names",
			displayFn: (it) => it.join(", "),
		},
		"plane": {
			name: "Home Plane",
		},
		"worshipers": {
			name: "Typical Worshipers",
		},
		"symbol": {
			name: "Symbol",
		},
		"favoredWeapons": {
			name: "Favored Weapons",
		},`,
					`		"pantheon": {
			name: "神系",
			displayFn: it => Renderer.deity.__zhPantheon(it),
		},
		"category": {
			name: "類別",
			displayFn: it => [].concat(it).map(c => Renderer.deity.__zhCategory(c)).join("、"),
		},
		"domains": {
			name: "領域",
			displayFn: (it) => it.map(d => Renderer.deity.__zhDomain(d)).join("、"),
		},
		"province": {
			name: "神職",
		},
		"dogma": {
			name: "教義",
		},
		"altNames": {
			name: "別名",
			displayFn: (it) => it.join("、"),
		},
		"plane": {
			name: "所在位面",
		},
		"worshipers": {
			name: "常見信徒",
		},
		"symbol": {
			name: "聖徽",
		},
		"favoredWeapons": {
			name: "偏好武器",
		},`,
				],
				// 維持固定欄位順序（原本依英文標籤字母排序），標籤後用全形冒號
				[
					`							entry: \`{@b \${name}:} \${displayVal}\`,
						};
					})
					.filter(Boolean),
				...Object.entries(ent.customProperties || {})
					.map(([name, val]) => ({
						name,
						entry: \`{@b \${name}:} \${val}\`,
					})),
			]
				.sort(({name: nameA}, {name: nameB}) => SortUtil.ascSortLower(nameA, nameB))
				.map(({entry}) => entry),`,
					`							entry: \`{@b \${name}：}\${displayVal}\`,
						};
					})
					.filter(Boolean),
				...Object.entries(ent.customProperties || {})
					.map(([name, val]) => ({
						name,
						entry: \`{@b \${name}：}\${val}\`,
					})),
			]
				.map(({entry}) => entry),`,
				],
				["${Renderer.utils.getNameTr(ent, {suffix: ent.title ? `, ${ent.title.toTitleCase()}` : \"\", page: UrlUtil.PG_DEITIES})}", "${Renderer.utils.getNameTr(ent, {suffix: ent.title ? `，${ent.title.toTitleCase()}` : \"\", page: UrlUtil.PG_DEITIES})}"],
			],
		},
		{
			file: "js/deities.js",
			replace: [
				["const domains = it.domains.join(\", \");", "const domains = it.domains.map(d => Renderer.deity.__zhDomain(d)).join(\"、\");"],
				["const domains = ent.domains.join(\", \");", "const domains = ent.domains.map(d => Renderer.deity.__zhDomain(d)).join(\"、\");"],
				["const cellsText = [it.name, it.pantheon, alignment, domains];", "const cellsText = [it.name, Renderer.deity.__zhPantheon(it.pantheon), alignment, domains];"],
				["<span class=\"ve-col-2 ve-px-1 ve-text-center\">${ent.pantheon}</span>", "<span class=\"ve-col-2 ve-px-1 ve-text-center\">${Renderer.deity.__zhPantheon(ent.pantheon)}</span>"],
			],
		},
		{
			file: "js/render-deities.js",
			replace: [
				["Note: this deity has been reprinted in a newer publication.", "註：此神祇已在較新的出版物中重印。"],
				[
					"`{@note This deity is a custom extension of {@deity ${deity.customExtensionOf}} with additional information from <i title=\"${Parser.sourceJsonToFull(deity.source).escapeQuotes()}\">${Parser.sourceJsonToAbv(deity.source)}</i>.}`",
					"`{@note 此條目以{@deity ${deity.customExtensionOf}|${ZH.name(deity) || deity.name}}為基礎，補充了 <i title=\"${Parser.sourceJsonToFull(deity.source).escapeQuotes()}\">${Parser.sourceJsonToAbv(deity.source)}</i> 的額外資訊。}`",
				],
				[
					"${reprintIndex === 1 ? `This deity is a reprint.` : \"\"} The version below was printed in an older publication (${Parser.sourceJsonToFull(deity.source)}${Renderer.utils.isDisplayPage(deity.page) ? `, page ${deity.page}` : \"\"}).",
					"${reprintIndex === 1 ? `此神祇有重印版本。` : \"\"}以下為較早出版物中的版本（${Parser.sourceJsonToFull(deity.source)}${Renderer.utils.isDisplayPage(deity.page) ? `，第 ${deity.page} 頁` : \"\"}）。",
				],
			],
		},
		{
			file: "js/filter-deities.js",
			replace: [
				["items: [\"Death\", \"Knowledge\", \"Life\", \"Light\", \"Nature\", VeCt.STR_NONE, \"Tempest\", \"Trickery\", \"War\"],", "items: [\"Death\", \"Knowledge\", \"Life\", \"Light\", \"Nature\", VeCt.STR_NONE, \"Tempest\", \"Trickery\", \"War\"],\n\t\t\tdisplayFn: it => Renderer.deity.__zhDomain(it),"],
				["this._pantheonFilter = new Filter({header: \"Pantheon\", items: []});", "this._pantheonFilter = new Filter({header: \"Pantheon\", items: [], displayFn: it => Renderer.deity.__zhPantheon(it)});"],
				["this._categoryFilter = new Filter({header: \"Category\", items: [VeCt.STR_NONE]});", "this._categoryFilter = new Filter({header: \"Category\", items: [VeCt.STR_NONE], displayFn: it => Renderer.deity.__zhCategory(it)});"],
			],
		},
	];
}
