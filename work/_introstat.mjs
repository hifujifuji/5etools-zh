// 各來源待寫簡介數量；用法：node work/_introstat.mjs
import fs from "fs";
const intro=JSON.parse(fs.readFileSync("i18n/monster-intro.json","utf8")); const o=[]; let tot=0;
for(const f of fs.readdirSync("dist/data/bestiary")){ const m=f.match(/^fluff-bestiary-(.+)\.json$/); if(!m) continue;
  const n=(JSON.parse(fs.readFileSync("dist/data/bestiary/"+f,"utf8")).monsterFluff||[]).filter(x=>!(x._copy&&!x.entries)&&!intro[`${x.name}|${x.source}`]).length;
  if(n){o.push([m[1],n]);tot+=n;} }
console.log(o.sort((a,b)=>b[1]-a[1]).map(([a,b])=>`${a} ${b}`).join("; "),"\n合計",tot);
