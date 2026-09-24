// 產生 dist/js/zh.js（嵌入介面詞典）與 dist/css/zh.css，並在所有頁面載入它們。
import fs from "node:fs";
import path from "node:path";

// 分頁標題用的名稱表：取自已合併翻譯的資料（name → name_zh）
const titleNames = dist => {
	const out = {};
	for (const [f, prop] of [["backgrounds.json", "background"], ["feats.json", "feat"], ["optionalfeatures.json", "optionalfeature"], ["variantrules.json", "variantrule"], ["conditionsdiseases.json", "condition"], ["conditionsdiseases.json", "disease"], ["conditionsdiseases.json", "status"], ["actions.json", "action"]]) {
		const p = path.join(dist, "data", f);
		if (!fs.existsSync(p)) continue;
		for (const e of JSON.parse(fs.readFileSync(p, "utf8"))[prop] || []) if (e.name_zh && e.name) out[e.name] ??= e.name_zh;
	}
	return out;
};

export default function ({dist, root}) {
	const ui = JSON.parse(fs.readFileSync(path.join(root, "i18n", "ui.json"), "utf8"));
	const tpl = fs.readFileSync(path.join(root, "src", "zh.js"), "utf8");
	const js = tpl
		.replace("/* __ZH_DICT__ */ {}", JSON.stringify(ui.dict))
		.replace("/* __ZH_RULES__ */ []", JSON.stringify(ui.rules))
		.replace("/* __ZH_TITLE__ */ {}", JSON.stringify(titleNames(dist)));
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
