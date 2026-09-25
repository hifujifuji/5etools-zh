// 把 {英文: 中文} 加進 i18n/exact-strings.json（與 copy-names.json，用 --names）
import fs from "fs";
export default (map, file = "i18n/exact-strings.json") => {
	const j = JSON.parse(fs.readFileSync(file));
	let n = 0;
	for (const [k, v] of Object.entries(map)) if (j[k] !== v) { j[k] = v; ++n; }
	fs.writeFileSync(file, JSON.stringify(j, null, "\t") + "\n");
	console.log(`${file}: +${n}`);
};
