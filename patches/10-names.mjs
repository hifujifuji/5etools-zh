// 讓實體名稱顯示成「中文 English」，並讓列表／全站搜尋也能用中文找。
// 資料裡的 name 維持英文（連結、雜湊都靠它），中文名在 name_zh。

export default [
	{
		file: "js/render.js",
		replace: [
			// 內文裡所有巢狀條目（特性、動作、章節標題…）都經過這裡：換成中文名顯示
			[
				`if (entry == null) return; // Avoid dying on nully entries`,
				`if (entry == null) return; // Avoid dying on nully entries\n\t\tif (globalThis.ZH) entry = ZH.withZhName(entry);`,
			],
			// 數據區塊標題
			[
				`\${opts.prefix || ""}\${name}\${opts.suffix || ""}</h1>`,
				`\${opts.prefix || ""}\${globalThis.ZH ? ZH.nameHtml(ent, name) : name}\${opts.suffix || ""}</h1>`,
			],
		],
	},
	{
		// 列表搜尋框能搜中文名
		file: "js/list2.js",
		replace: [[
			`alias: (ent.alias || []).map(it => \`"\${it}"\`).join(","),`,
			`alias: (ent.alias || []).map(it => \`"\${it}"\`).join(","),\n\t\t\tzh: ent.name_zh && ent._zhOf === ent.name ? ent.name_zh : "",`,
		]],
	},
	{
		// 各列表頁的名稱欄
		glob: "js/*.js",
		replace: [
			[/(<span class="[^"]*\bve-bold\b[^"]*">)\$\{(\w+)\.name\}(<\/span>)/g, "$1${ZH.nameHtml($2)}$3"],
			[/(clazz: `[^`]*\bve-bold\b[^`]*`, )text: (\w+)\.name\}/g, "$1html: ZH.nameHtml($2)}"],
		],
	},
	{
		// 全站搜尋索引：中文名也加進索引，且不要被 toAscii() 洗掉
		file: "js/omnidexer.js",
		replace: [
			[
				`if (name) name = name.toAscii();`,
				`if (name && !/[\\u3400-\\u9fff]/.test(name)) name = name.toAscii();`,
			],
			[
				`			if (it.alias?.length) {
				for (const a of it.alias) {
					ixOffset++;
					await this._pAddToIndex_pHandleItem(state, it, ix + ixOffset, a);
				}
			}`,
				`			if (it.alias?.length) {
				for (const a of it.alias) {
					ixOffset++;
					await this._pAddToIndex_pHandleItem(state, it, ix + ixOffset, a);
				}
			}

			if (it.name_zh && it._zhOf === name) {
				ixOffset++;
				await this._pAddToIndex_pHandleItem(state, it, ix + ixOffset, it.name_zh);
			}`,
			],
		],
	},
];
