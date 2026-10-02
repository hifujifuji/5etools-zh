// 以既有簡介（預設 MM）為底，為另一來源同名（含複數形）條目產生 work/intro/<src>-auto.json，並列出仍待寫者
// 用法：node work/_introreuse.mjs <SRC> [FROM=MM]
import fs from "fs";
const [src,...froms]=process.argv.slice(2); if(!froms.length) froms.push("MM");
const intro=JSON.parse(fs.readFileSync("i18n/monster-intro.json","utf8"));
const rd=f=>JSON.parse(fs.readFileSync("dist/data/bestiary/"+f,"utf8"));
const zh={}; for(const m of rd(`bestiary-${src.toLowerCase()}.json`).monster||[]) zh[m.name]=m.name_zh;
const sing=n=>[n,n.replace(/ \(\*\)$/,""),n.replace(/s$/,""),n.replace(/es$/,""),n.replace(/ies$/,"y"),n.replace(/pes$/,"ps"),n.replace(/i$/,""),n+"s",n+"es",n.replace(/y$/,"ies")];
const out={},left=[];
for(const f of rd(`fluff-bestiary-${src.toLowerCase()}.json`).monsterFluff||[]){
  if(f._copy&&!f.entries) continue; const k=`${f.name}|${f.source}`; if(intro[k]) continue;
  const hit=froms.flatMap(from=>sing(f.name).map(n=>`${n}|${from}`)).find(x=>intro[x]);
  if(hit) out[k]=intro[hit]; else left.push(`${f.name}=${zh[f.name]||"?"}`);
}
fs.writeFileSync(`work/intro/${src.toLowerCase()}-auto.json`,JSON.stringify(out,null,"\t"));
console.log(`沿用 ${Object.keys(out).length}；待寫 ${left.length}：\n`+left.join("; "));
