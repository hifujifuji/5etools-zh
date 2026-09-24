// 用法：node work/_exadd.mjs file.json（{英文: 中文}）→ 合併進 i18n/exact-strings.json
import fs from "fs";
const p = "i18n/exact-strings.json";
const j = JSON.parse(fs.readFileSync(p));
const add = JSON.parse(fs.readFileSync(process.argv[2]));
let n = 0; for (const [k, v] of Object.entries(add)) if (j[k] !== v) { j[k] = v; n++; }
fs.writeFileSync(p, JSON.stringify(j, null, "\t") + "\n");
console.log("加入", n);
