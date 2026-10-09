// 異教與恩賜頁的欄位標籤
export default [
	{
		file: "js/render.js",
		replace: [
			[`				name: "Goals:",`, `				name: "目標：",`],
			[`				name: "Typical Cultists:",`, `				name: "典型教徒：",`],
			[`				name: "Signature Spells:",\n				entry: ent.signatureSpells.entry,`, `				name: "招牌法術：",\n				entry: ent.signatureSpells.entry,`],
			[`				name: "Ability Score Adjustment:",\n				entry: ent.ability ? ent.ability.entry : "None",`, `				name: "屬性值調整：",\n				entry: ent.ability ? ent.ability.entry : "無",`],
			[`				name: "Signature Spells:",\n				entry: ent.signatureSpells ? ent.signatureSpells.entry : "None",`, `				name: "招牌法術：",\n				entry: ent.signatureSpells ? ent.signatureSpells.entry : "無",`],
		],
	},
];
