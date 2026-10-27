// 非被遺忘的國度世界觀的書（scripts/off-settings.json）：篩選器預設不勾選，仍可手動勾回
// 例外保留的條目（奇械師與其子職業、機關人）附加 XPHB 來源，預設篩選下照樣顯示
import fs from "node:fs";

const cfg = JSON.parse(fs.readFileSync(new URL("../scripts/off-settings.json", import.meta.url), "utf8"));
const keep = cfg.keep.map(k => k.split("|"));
const keepFn = `const ZH_OFF_KEEP = ent => ${JSON.stringify(keep)}.some(([kind, name, src]) => ent.source === src && (kind === "class" ? (ent.name === name && !ent.className) || (ent.className === name && ent.classSource === src) : ent.name === name && !ent.className));`;

export default [
	{
		file: "js/filter/filter-page-filter-base.js",
		replace: [
			["/** @abstract */\nexport class PageFilterBase {", `const ZH_OFF_SOURCES = new Set(${JSON.stringify(cfg.sources)});\n\n/** @abstract */\nexport class PageFilterBase {`],
			["static defaultSourceSelFnStandardPartnered (val) {\n", "static defaultSourceSelFnStandardPartnered (val) {\n\t\tif (ZH_OFF_SOURCES.has(val)) return false;\n"],
		],
	},
	{
		file: "js/filter/filter/filter-filter-source.js",
		replace: [
			["export class SourceFilterItem extends FilterItem {", `${keepFn}\n\nexport class SourceFilterItem extends FilterItem {`],
			[
				"static getCompleteFilterSources (ent, {isIncludeBaseSource = false} = {}) {",
				"static getCompleteFilterSources (ent, opts) {\n\t\tconst out = this._zhGetCompleteFilterSources(ent, opts);\n\t\tif (!ZH_OFF_KEEP(ent)) return out;\n\t\treturn [out].flat().concat(new SourceFilterItem({item: \"XPHB\", isIgnoreRed: true, isOtherSource: true}));\n\t}\n\n\tstatic _zhGetCompleteFilterSources (ent, {isIncludeBaseSource = false} = {}) {",
			],
		],
	},
];
