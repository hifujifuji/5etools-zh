// 執行期合成的實體（種族＋亞種、魔法物品變體）也組出中文名。
// 這段 render.js 在 node 產生搜尋索引時也會跑，所以不依賴 ZH。

const ZN = `const __zn = e => e?.name_zh && (e._zhOf == null || e._zhOf === e.name) ? e.name_zh : null;`;

export default [
	{
		file: "js/render.js",
		replace: [
			// 種族＋亞種：「精靈（高等）」
			[
				`			cpy.name = Renderer.race.getSubraceName(cpy.name, cpySr.name);
			delete cpySr.name;`,
				`			cpy.name = Renderer.race.getSubraceName(cpy.name, cpySr.name);
			{
				${ZN}
				const zr = __zn(race), zs = __zn(cpySr);
				if (zr || zs) { cpy.name_zh = \`\${zr || race.name}（\${zs || cpySr.name}）\`; cpy._zhOf = cpy.name; }
				delete cpySr.name_zh;
				delete cpySr._zhOf;
			}
			delete cpySr.name;`,
			],
			// 魔法物品變體：「+1 長劍」「精金鎖子甲」「焰舌（長劍）」
			[
				`		Renderer.item._createSpecificVariants_mergeVulnerableResistImmune({specificVariant, inherits});`,
				`		Renderer.item._createSpecificVariants_mergeVulnerableResistImmune({specificVariant, inherits});

		{
			${ZN}
			const zv = __zn(genericVariant), zb = __zn(baseItem);
			const mBonus = /^\\+(\\d) /.exec(genericVariant.name);
			let zh = null;
			if (zb && mBonus) zh = \`+\${mBonus[1]} \${zb}\`;
			else if (zb && zv) zh = /武器|護甲|彈藥/.test(zv) ? zv.replace(/武器|護甲|彈藥/, zb) : \`\${zv}（\${zb}）\`;
			if (zh) { specificVariant.name_zh = zh; specificVariant._zhOf = specificVariant.name; } else { delete specificVariant.name_zh; delete specificVariant._zhOf; }
		}`,
			],
		],
	},
];
