// 產生 dist/js/zh.js（嵌入介面詞典）與 dist/css/zh.css，並在所有頁面載入它們。
import fs from "node:fs";
import path from "node:path";

// 分頁標題用的名稱表：取自已合併翻譯的資料（name → name_zh）
const titleNames = dist => {
	const out = {};
	for (const [f, prop] of [["backgrounds.json", "background"], ["feats.json", "feat"], ["optionalfeatures.json", "optionalfeature"], ["variantrules.json", "variantrule"], ["conditionsdiseases.json", "condition"], ["conditionsdiseases.json", "disease"], ["conditionsdiseases.json", "status"], ["actions.json", "action"], ["psionics.json", "psionic"], ["deities.json", "deity"], ["recipes.json", "recipe"]]) {
		const p = path.join(dist, "data", f);
		if (!fs.existsSync(p)) continue;
		for (const e of JSON.parse(fs.readFileSync(p, "utf8"))[prop] || []) if (e.name_zh && e.name) out[e.name] ??= e.name_zh;
	}
	// 法術（分頁標題）
	const sd = path.join(dist, "data", "spells");
	if (fs.existsSync(sd)) for (const f of fs.readdirSync(sd).filter(f => /^spells-.*\.json$/.test(f))) for (const e of JSON.parse(fs.readFileSync(path.join(sd, f), "utf8")).spell || []) if (e.name_zh) out[e.name] ??= e.name_zh;
	return out;
};

// 書籍目錄用的標題表：書籍 id（小寫）→ {英文標題 → 中文}（取自書籍資料的 name_zh；「Chapter 2: X」另存「X」）
const bookHeaders = dist => {
	const out = {};
	const walk = (o, map) => {
		if (Array.isArray(o)) return o.forEach(x => walk(x, map));
		if (!o || typeof o !== "object") return;
		if (typeof o.name === "string" && o.name_zh && (o._zhOf == null || o._zhOf === o.name)) {
			map[o.name] ??= o.name_zh;
			const m = /^(?:Chapter \d+|Appendix [A-Z]): (.+)$/.exec(o.name), z = /^[^：:]+[：:]\s*(.+)$/.exec(o.name_zh);
			if (m && z) map[m[1]] = z[1];
		}
		for (const v of Object.values(o)) if (v && typeof v === "object") walk(v, map);
	};
	// 目錄的章名（books.json 的 contents）不一定與內文章名相同（如「Introduction」），依章序對應內文章名的中文
	// 冒險（data/adventure、adventures.json）同一套做法
	for (const [kind, list] of [["book", "books"], ["adventure", "adventures"]]) {
		const dir = path.join(dist, "data", kind);
		if (!fs.existsSync(dir)) continue;
		const books = JSON.parse(fs.readFileSync(path.join(dist, "data", `${list}.json`), "utf8"))[kind];
		for (const f of fs.readdirSync(dir).filter(f => f.startsWith(`${kind}-`) && f.endsWith(".json"))) {
			const id = f.slice(kind.length + 1, -5), map = {};
			const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")).data;
			walk(data, map);
			const contents = books.find(b => b.id.toLowerCase() === id)?.contents || [];
			contents.forEach((c, i) => { const z = data[i]?.name_zh; if (z && !map[c.name]) map[c.name] = z.replace(/^[^：:]+[：:]\s*/, ""); });
			if (Object.keys(map).length) out[id] = map;
		}
	}
	return out;
};

// 子職業中文名：「職業|子職業簡稱」→ 中文（法術頁的子職業清單用）
const subclassNames = dist => {
	const out = {};
	const cd = path.join(dist, "data", "class");
	for (const f of fs.readdirSync(cd).filter(f => /^class-.*\.json$/.test(f))) for (const sc of JSON.parse(fs.readFileSync(path.join(cd, f), "utf8")).subclass || []) if (sc.name_zh && sc.shortName) out[`${sc.className}|${sc.shortName}`] ??= sc.name_zh;
	return out;
};

export default function ({dist, root}) {
	const ui = JSON.parse(fs.readFileSync(path.join(root, "i18n", "ui.json"), "utf8"));
	const tpl = fs.readFileSync(path.join(root, "src", "zh.js"), "utf8");
	const js = tpl
		.replace("/* __ZH_DICT__ */ {}", JSON.stringify(ui.dict))
		.replace("/* __ZH_RULES__ */ []", JSON.stringify(ui.rules))
		.replace("/* __ZH_TITLE__ */ {}", JSON.stringify(titleNames(dist)))
		.replace("/* __ZH_SUBCLASS__ */ {}", JSON.stringify(subclassNames(dist)))
		.replace("/* __ZH_BOOKHDR__ */ {}", JSON.stringify(bookHeaders(dist)));
	fs.writeFileSync(path.join(dist, "js", "zh.js"), js);
	fs.copyFileSync(path.join(root, "src", "zh.css"), path.join(dist, "css", "zh.css"));

	return [
		{
			glob: "*.html",
			replace: [
				[`<html lang="en">`, `<html lang="zh-Hant">`],
				[`<link rel="stylesheet" href="css/main.css">`, `<link rel="stylesheet" href="css/main.css">\n\t<link rel="stylesheet" href="css/zh.css">`],
				[`<script type="text/javascript" src="js/navigation.js"></script>`, `<script type="text/javascript" src="js/zh.js"></script>\n\t<script type="text/javascript" src="js/navigation.js"></script>`],
			],
		},
	];
}
