// 執行期合成的實體（種族＋亞種、魔法物品變體）也組出中文名。
// 這段 render.js 在 node 產生搜尋索引時也會跑，所以不依賴 ZH。

const ZN = `const __zn = e => e?.name_zh && (e._zhOf == null || e._zhOf === e.name) ? e.name_zh : null;`;

export default [
	// 種族：血系自動補上的語言特性、隨機身高體重表
	{
		file: "js/render.js",
		replace: [
			['entries: ["You can speak, read, and write Common and one other language that you and your DM agree is appropriate for your character."],', 'entries: ["你能說、讀、寫通用語，以及一種你與 DM 同意適合你角色的其他語言。"],'],
			['const colLabels = ["Base Height", "Base Weight", "Height Modifier", "Weight Modifier"];', 'const colLabels = ["基礎身高", "基礎體重", "身高調整值", "體重調整值"];'],
			["weightMod || \"1\"}</span> lb.`", "weightMod || \"1\"}</span> 磅`"],
			["`× ${race.heightAndWeight.weightMod || \"1\"} lb.`", "`× ${race.heightAndWeight.weightMod || \"1\"} 磅`"],
			["`${race.heightAndWeight.baseWeight} lb.`,", "`${race.heightAndWeight.baseWeight} 磅`,"],
			['<div class="small">lb.</div>', '<div class="small">磅</div>'],
			['race__btn-roll-height-weight">Roll</button>', 'race__btn-roll-height-weight">擲骰</button>'],
			['"You may roll for your character\'s height and weight on the Random Height and Weight table. The roll in the Height Modifier column adds a number (in inches) to the character\'s base height. To get a weight, multiply the number you rolled for height by the roll in the Weight Modifier column and add the result (in pounds) to the base weight.",', '"你可以在「隨機身高與體重」表上擲骰決定角色的身高與體重。「身高調整值」欄的擲骰結果（以吋計）加到角色的基礎身高上。要決定體重，將你為身高擲出的數字乘以「體重調整值」欄的擲骰結果，再將結果（以磅計）加到基礎體重上。",'],
			['caption: "Random Height and Weight",', 'caption: "隨機身高與體重",'],
		],
	},
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
