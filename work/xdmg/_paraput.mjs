// 把「序號\t中文」譯稿依 _ch<N>para.txt 的原文寫進 i18n/xdmg/paras-<N><後綴>.json：node work/xdmg/_paraput.mjs <N> <後綴> <譯稿>
import fs from "node:fs";
const [n, suf, f] = process.argv.slice(2);
const src = fs.readFileSync(`work/xdmg/_ch${n}para.txt`, "utf8").split("\n").map(l => l.replace(/^\d+\t/, ""));
const out = {};
for (const l of fs.readFileSync(f, "utf8").trim().split("\n")) { const [i, zh] = l.split("\t"); if (src[+i] === undefined || !zh) throw new Error(l); out[src[+i]] = zh; }
fs.writeFileSync(`i18n/xdmg/paras-${n}${suf}.json`, `${JSON.stringify(out, null, "\t")}\n`);
console.log(Object.keys(out).length);
