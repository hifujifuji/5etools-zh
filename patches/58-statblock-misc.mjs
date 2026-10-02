// 數據區塊的零星英文：充能（Recharge）、感官備註（blind beyond this radius…）、被動感知、「Variant:」、技能「plus one of the following」。
// render.js 在 node 產生搜尋索引時也會跑，所以不依賴 ZH。

const SENSE = String.raw`
const __zhSense = str => str
	.replace(/(\d[\d,]*) ?ft\.?/g, "$1 呎")
	.replace(/ ?\((?:\{@condition blinded\|\|blind\}|blind) beyond this (?:radius|distance)\)/gi, "（超出此範圍視為目盲）")
	.replace(/ ?\(can't see beyond this radius\)/gi, "（無法看見此範圍以外）")
	.replace(/ ?\(unimpeded by magical (\{@variantrule Darkness\|XPHB)\}\)/gi, "（不受魔法$1|黑暗}阻礙）")
	.replace(/ ?\(penetrates magical darkness\)/gi, "（可穿透魔法黑暗）")
	.replace(/ ?\(including magical darkness\)/gi, "（包括魔法黑暗）")
	.replace(/ ?\(rat form only\)/gi, "（僅限鼠形態）")
	.replace(/ ?\(beast form only\)/gi, "（僅限野獸形態）")
	.replace(/ ?\(sentry only\)/gi, "（僅限哨兵）")
	.replace(/ ?\(can see invisible creatures out to the same range\)/gi, "（可看見相同範圍內的隱形生物）")
	.replace(/ or (\d+ 呎) while deafened/gi, "，耳聾時為 $1")
	.replace(/, /g, "、");
`;

export default [
	{
		file: "js/render.js",
		replace: [
			[
				"textStack[0] += `${flags && flags.includes(\"m\") ? \"\" : \"(\"}Recharge `;",
				"textStack[0] += `${flags && flags.includes(\"m\") ? \"\" : \"（\"}充能 `;",
			],
			[
				"textStack[0] += `${flags && flags.includes(\"m\") ? \"\" : \")\"}`;",
				"textStack[0] += `${flags && flags.includes(\"m\") ? \"\" : \"）\"}`;",
			],
			[
				"return `(Recharge ${asNum}${asNum < 6 ? `\\u20136` : \"\"})`;",
				"return `（充能 ${asNum}${asNum < 6 ? `\\u20136` : \"\"}）`;",
			],
			[
				"displayName: entry.name ? `Variant: ${entry.name}` : \"Variant\",",
				"displayName: entry.name ? `變體：${entry.name}` : \"變體\",",
			],
			[
				"return `plus one of the following: ${doSortMapJoinSkillKeys(it.oneOf, Object.keys(it.oneOf), true)}`;",
				"return `另加下列之一：${doSortMapJoinSkillKeys(it.oneOf, Object.keys(it.oneOf), true)}`;",
			],
			[
				"return joinWithOr ? toJoin.joinConjunct(\", \", \" or \") : toJoin.join(\", \");",
				"return joinWithOr ? toJoin.joinConjunct(\"、\", \"或\", true) : toJoin.join(\", \");",
			],
			[
				`	static getSensesEntry (senses, {isTitleCase = false} = {}) {`,
				`	static getSensesEntry (senses, {isTitleCase = false} = {}) {
		${SENSE}
		return __zhSense(Renderer.utils.__getSensesEntryEn(senses, {isTitleCase}));
	}

	static __getSensesEntryEn (senses, {isTitleCase = false} = {}) {`,
			],
			[
				"				? `${isTitleCase ? \"Passive\" : \"passive\"} Perception ${passive}`\n				: (isForcePassive || mon.senses) ? \"\\u2014\" : \"\",\n		]\n			.filter(Boolean);\n		return pts.join(\", \");",
				"				? `被動感知 ${passive}`\n				: (isForcePassive || mon.senses) ? \"\\u2014\" : \"\",\n		]\n			.filter(Boolean);\n		return pts.join(\"、\");",
			],
		],
	},
];
