// 列出已填批次中仍含英文字詞（標籤外）的字串
import fs from "fs";
const b = process.argv[2];
const z = JSON.parse(fs.readFileSync(`work/${b}.zh.json`));
z.forEach((arr, i) => arr.forEach((s, j) => { const t = typeof s === "string" && s.replace(/\{@[^}]*\}/g, ""); if (t && /[A-Za-z]{3}/.test(t) && !(/[一-龥]/.test(t) && !/[a-z]{4}/.test(t))) console.log(i + ":" + j, JSON.stringify(s)); }));
