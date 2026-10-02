// 查物品既有中文名：node work/_itn.mjs <英文名…>
import fs from "fs";
const want=process.argv.slice(2).map(s=>s.toLowerCase());
for(const f of ["items.json","items-base.json"]){const j=JSON.parse(fs.readFileSync("dist/data/"+f,"utf8"));for(const k of Object.keys(j)){if(!Array.isArray(j[k]))continue;for(const it of j[k]){if(it.name&&want.includes(it.name.toLowerCase())&&it.name_zh)console.log(it.name,it.source,it.name_zh)}}}
