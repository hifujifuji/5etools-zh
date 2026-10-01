// 傷害抗性／免疫／易傷的顯示：傷害類型、附註（非魔法攻擊造成的…）與連接詞中文化。
// 中文語序把附註放在前面：「非魔法攻擊造成的鈍擊、穿刺與劈砍」。

const DMG = {acid: "酸蝕", bludgeoning: "鈍擊", cold: "寒冰", fire: "火焰", force: "力場", lightning: "閃電", necrotic: "死靈", piercing: "穿刺", poison: "毒素", psychic: "精神", radiant: "光耀", slashing: "劈砍", thunder: "雷鳴"};
// 放在傷害類型前面的附註
const PRE = {
	"from nonmagical attacks": "非魔法攻擊造成的",
	"from nonmagical attacks that aren't silvered": "非鍍銀的非魔法攻擊造成的",
	"from nonmagical attacks that aren't adamantine": "非精金的非魔法攻擊造成的",
	"from nonmagical attacks that aren't adamantine or silvered": "非精金或鍍銀的非魔法攻擊造成的",
	"from nonmagical attacks not made with silvered weapons": "非以鍍銀武器進行的非魔法攻擊造成的",
	"from nonmagical attacks not made with adamantine weapons": "非以精金武器進行的非魔法攻擊造成的",
	"from nonmagical weapons": "非魔法武器造成的",
	"from nonmagical weapons that aren't silvered": "非鍍銀的非魔法武器造成的",
	"damage from nonmagical weapons that aren't silvered": "非鍍銀的非魔法武器造成的",
	"damage from nonmagical weapons that aren't iron": "非鐵製的非魔法武器造成的",
	"that is nonmagical": "非魔法的",
	"nonmagical": "非魔法的",
	"from magical attacks": "魔法攻擊造成的",
	"from magic weapons": "魔法武器造成的",
	"from magic weapons wielded by good creatures": "善良生物持用的魔法武器造成的",
	"from metal weapons": "金屬武器造成的",
};
// 放在後面的附註
const POST = {
	"while in dim light or darkness": "（處於微光或黑暗中時）",
	"from nonmagical attacks while in dim light or darkness": "（處於微光或黑暗中時，來自非魔法攻擊）",
	"(from stoneskin)": "（來自石膚術）",
	"one of the following:": "下列之一：",
	"damage from spells": "法術造成的傷害",
	"(Fire only)": "（僅限火）", "(Air only)": "（僅限氣）", "(Earth only)": "（僅限土）", "(Water only)": "（僅限水）",
};

export default [
	{
		file: "js/parser.js",
		replace: [
			[
				`Parser._getFullImmRes_getRenderedString = (str, {isPlainText = false, isTitleCase = false} = {}) => {
	if (isTitleCase) str = str.toTitleCase();`,
				`Parser._IMMRES_DMG_ZH = ${JSON.stringify(DMG)};
Parser._IMMRES_PRE_ZH = ${JSON.stringify(PRE)};
Parser._IMMRES_POST_ZH = ${JSON.stringify(POST)};
Parser._getFullImmRes_getRenderedString = (str, {isPlainText = false, isTitleCase = false} = {}) => {
	const __zh = Parser._IMMRES_DMG_ZH[\`\${str}\`.toLowerCase()] ?? Parser._IMMRES_POST_ZH[str];
	if (__zh) return __zh;
	if (isTitleCase) str = str.toTitleCase();`,
			],
			[
				`	const prop = Parser._getFullImmRes_getNextProp(obj);
	if (prop) stack.push(Parser._getFullImmRes_getRenderedArray(obj[prop], {isPlainText, isTitleCase, isGroup: true}));

	if (obj.note) stack.push(Parser._getFullImmRes_getRenderedString(obj.note, {isPlainText}));

	return stack.join(" ");`,
				`	const prop = Parser._getFullImmRes_getNextProp(obj);
	const __pre = obj.note ? Parser._IMMRES_PRE_ZH[obj.note] : null;
	if (prop) stack.push(\`\${__pre || ""}\${Parser._getFullImmRes_getRenderedArray(obj[prop], {isPlainText, isTitleCase, isGroup: true})}\`);

	if (obj.note && !__pre) stack.push(Parser._getFullImmRes_getRenderedString(obj.note, {isPlainText}));

	return stack.join(/[\\u3400-\\u9fff（）：]/.test(stack.join("")) ? "" : " ");`,
			],
			[
				`		return "all damage"[isTitleCase ? "toTitleCase" : "toString"]();`,
				`		return "所有傷害";`,
			],
			[
				`			if (!isSimpleCur || !isSimpleNxt) return \`\${rendCur}; \`;
			if (!isGroup || i !== arr.length - 2 || arr.length < 2) return \`\${rendCur}, \`;
			if (arr.length === 2) return \`\${rendCur} and \`;
			return \`\${rendCur}, and \`;`,
				`			if (!isSimpleCur || !isSimpleNxt) return \`\${rendCur}；\`;
			if (!isGroup || i !== arr.length - 2 || arr.length < 2) return \`\${rendCur}、\`;
			return \`\${rendCur}與\`;`,
			],
		],
	},
];
