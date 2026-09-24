// 純人名清單（Adrik, Alberich, … 或單一名字）保留原文
const SMALL = new Set(["or", "and", "of", "the", "de", "da", "von", "van", "du", "la", "le"]);
export const isNameList = s => {
	const t = s.replace(/\.$/, "").trim();
	if (!t || /[.;:!?(){}"]/.test(t) || t.length > 1200) return false;
	const words = t.split(/[,\s]+/).filter(Boolean);
	return words.length > 0 && words.every(w => SMALL.has(w) || /^[A-Z][A-Za-z'’\-]*$/.test(w)) && (words.length === 1 ? t.length < 25 : /,/.test(t) || words.length <= 3);
};
