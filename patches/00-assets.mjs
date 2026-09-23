// 產生 dist/js/zh.js（嵌入介面詞典）與 dist/css/zh.css，並在所有頁面載入它們。
import fs from "node:fs";
import path from "node:path";

export default function ({dist, root}) {
	const ui = JSON.parse(fs.readFileSync(path.join(root, "i18n", "ui.json"), "utf8"));
	const tpl = fs.readFileSync(path.join(root, "src", "zh.js"), "utf8");
	const js = tpl
		.replace("/* __ZH_DICT__ */ {}", JSON.stringify(ui.dict))
		.replace("/* __ZH_RULES__ */ []", JSON.stringify(ui.rules));
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
