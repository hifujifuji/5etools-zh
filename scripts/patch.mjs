// 套用 patches/*.mjs 裡定義的字串替換到 dist/。
// 每個 patch 都必須找得到目標字串，找不到就報錯（上游改版時才會知道要更新）。

import fs from "node:fs";
import path from "node:path";
import {pathToFileURL} from "node:url";

export async function applyPatches ({dist, root}) {
	const dir = path.join(root, "patches");
	const files = fs.readdirSync(dir).filter(f => f.endsWith(".mjs")).sort();
	let nOk = 0;
	const errors = [];
	for (const f of files) {
		const mod = await import(pathToFileURL(path.join(dir, f)).href);
		const patches = typeof mod.default === "function" ? await mod.default({dist, root}) : mod.default;
		for (const p of patches || []) {
			const targets = p.glob ? globFiles(dist, p.glob) : [p.file];
			for (const rel of targets) {
				const file = path.join(dist, rel);
				let src = fs.readFileSync(file, "utf8");
				for (const [find, repl, opts = {}] of p.replace) {
					const isRe = find instanceof RegExp;
					const hit = isRe ? find.test(src) : src.includes(find);
					if (isRe) find.lastIndex = 0;
					if (!hit) {
						if (!opts.optional && !p.glob) errors.push(`${f}: ${rel} 找不到：${String(find).slice(0, 120)}`);
						continue;
					}
					src = isRe ? src.replace(find, repl) : src.split(find).join(repl);
					nOk++;
				}
				fs.writeFileSync(file, src);
			}
		}
	}
	console.log(`套用 patch：${nOk} 處`);
	if (errors.length) {
		console.error(errors.join("\n"));
		throw new Error(`${errors.length} 個 patch 失敗`);
	}
}

function globFiles (dist, glob) {
	// 只支援 "dir/*.ext" 或 "*.ext"
	const dir = path.dirname(glob);
	const re = new RegExp(`^${path.basename(glob).replace(/\./g, "\\.").replace(/\*/g, ".*")}$`);
	return fs.readdirSync(path.join(dist, dir)).filter(f => re.test(f)).map(f => path.join(dir, f));
}
