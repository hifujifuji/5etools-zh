// 遭遇表列：「1 {@creature x} and {@dice 1d4} {@creature y} (see {@adventure appendix C|GoS|10})」轉中文
export const enc = s => {
	let t = s
		.replace(/\{@creature ([^|}]+)\|([^|}]*)\|[^|}]*\}/g, (m, a, b) => `{@creature ${a}${b ? "|" + b : ""}}`)
		.replace(/ \(see \{@adventure appendix C\|GoS\|10\} for both\)/g, "（兩者皆見{@adventure 附錄 C|GoS|10}）")
		.replace(/ \(see \{@adventure appendix C\|GoS\|10\}\)/g, "（見{@adventure 附錄 C|GoS|10}）")
		.replace(/^A rank (\d) whirlpool connected to the Elemental Plane of Water \(see "\{@adventure Whirlpools\|GoS\|8\|Whirlpools\}"\)$/, "一個連接水元素位面的 $1 級漩渦（見「{@adventure 漩渦|GoS|8|Whirlpools}」）")
		.replace(/^A ship \(generated at random\)$/, "一艘船（隨機產生）")
		.replace(/^A mysterious island \(generated at random\)$/, "一座神秘島嶼（隨機產生）")
		.replace(/A coven of (\d+) (\{@creature [^}]+\})/, "由 $1 隻$2組成的集會")
		.replace(/(^|and |, )(\d+|\{@dice [^}]+\}) (\{@creature)/g, (m, p, n, c) => `${p}${n} 隻${c}`)
		.replace(/,? and /g, "與").replace(/\}, (?=\d|\{@)/g, "}、").replace(/）, (?=\d|\{@)/g, "）、");
	return t;
};
