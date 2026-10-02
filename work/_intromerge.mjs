// 將 work/intro/<檔>.json 併入 i18n/monster-intro.json；用法：node work/_intromerge.mjs <檔…>
import fs from "fs";
const P="i18n/monster-intro.json"; const intro=JSON.parse(fs.readFileSync(P,"utf8"));
const valid=new Set();
for(const f of fs.readdirSync("dist/data/bestiary")) if(f.startsWith("fluff-bestiary-"))
  for(const m of JSON.parse(fs.readFileSync("dist/data/bestiary/"+f,"utf8")).monsterFluff||[]) valid.add(`${m.name}|${m.source}`);
let n=0;
for(const a of process.argv.slice(2)){ const j=JSON.parse(fs.readFileSync(`work/intro/${a}.json`,"utf8"));
  for(const [k,v] of Object.entries(j)){ if(!valid.has(k)) console.log("找不到 fluff 條目：",k); if(!intro[k]) n++; intro[k]=v; } }
fs.writeFileSync(P,JSON.stringify(intro,null,"\t")+"\n"); console.log(`新增 ${n}，共 ${Object.keys(intro).length-1}`);
