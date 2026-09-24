// 職業等級表的列標題被翻譯記憶誤成「N 環」，改回「N 級」
import fs from "fs";
for (const f of ["i18n/custom/subclassFeature.json", "i18n/custom/classFeature.json"]) {
	const j = JSON.parse(fs.readFileSync(f)); let n = 0;
	const walk = o => {
		if (Array.isArray(o)) return o.forEach(walk);
		if (!o || typeof o !== "object") return;
		if (o.type === "table" && o.rows && /等級/.test(String(o.colLabels?.[0] ?? "")))
			for (const r of o.rows) if (typeof r[0] === "string" && /^\d+ 環$/.test(r[0])) { r[0] = r[0].replace("環", "級"); n++; }
		Object.values(o).forEach(walk);
	};
	walk(j); fs.writeFileSync(f, JSON.stringify(j, null, "\t") + "\n"); console.log(f, n);
}
