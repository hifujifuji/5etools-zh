// 從已合併翻譯的書籍內文（dist）與上游書籍並排走訪，建立 {英文句: 中文句} 對照表
import fs from "fs";
import path from "path";
import {UPSTREAM} from "../scripts/util.mjs";
const cjk = /[㐀-鿿]/;
const out = {};
const walk = (u, d) => {
	if (typeof u === "string") { if (typeof d === "string" && cjk.test(d) && !cjk.test(u)) out[u] ??= d; return; }
	if (Array.isArray(u)) { if (Array.isArray(d)) u.forEach((x, i) => walk(x, d[i])); return; }
	if (u && typeof u === "object" && d && typeof d === "object") {
		if (typeof u.name === "string" && d.name_zh && !cjk.test(u.name)) out[u.name] ??= d.name_zh;
		for (const k of Object.keys(u)) if (k !== "name") walk(u[k], d[k]);
	}
};
for (const b of process.argv.slice(2)) {
	const f = `book/book-${b}.json`;
	walk(JSON.parse(fs.readFileSync(path.join(UPSTREAM, "data", f))).data, JSON.parse(fs.readFileSync(path.join("dist/data", f))).data);
}
fs.writeFileSync("work/_bookmap.json", JSON.stringify(out));
console.log(Object.keys(out).length);
