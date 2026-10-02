// 鍵可用「 || 」串接多個條目共用同一則。將 work/intro/<檔>.json 併入 i18n/monster-intro.json；用法：node work/_intromerge.mjs <檔…>
import fs from "fs";
const P="i18n/monster-intro.json"; const intro=JSON.parse(fs.readFileSync(P,"utf8"));
const valid=new Map();
for(const f of fs.readdirSync("dist/data/bestiary")) if(f.startsWith("fluff-bestiary-"))
  for(const m of JSON.parse(fs.readFileSync("dist/data/bestiary/"+f,"utf8")).monsterFluff||[]) valid.set(`${m.name}|${m.source}`.toLowerCase(),`${m.name}|${m.source}`);
let n=0;
for(const a of process.argv.slice(2)){ const j=JSON.parse(fs.readFileSync(`work/intro/${a}.json`,"utf8"));
  for(const [kk,v] of Object.entries(j)) for(let k of kk.split(" || ")){ const r=valid.get(k.toLowerCase()); if(!r){ console.log("找不到 fluff 條目（略過）：",k); continue; } k=r; if(!intro[k]) n++; intro[k]=v; } }
fs.writeFileSync(P,JSON.stringify(intro,null,"\t")+"\n"); console.log(`新增 ${n}，共 ${Object.keys(intro).length-1}`);
