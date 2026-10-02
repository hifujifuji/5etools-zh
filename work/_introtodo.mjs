// 列出某來源尚無中文簡介的 monsterFluff 條目（英文名 => 站內中文名）；用法：node work/_introtodo.mjs <SRC>
import fs from "fs";
const src=process.argv[2].toLowerCase();
const intro=JSON.parse(fs.readFileSync("i18n/monster-intro.json","utf8"));
const rd=f=>JSON.parse(fs.readFileSync("dist/data/bestiary/"+f,"utf8"));
const zh={}; for(const m of rd(`bestiary-${src}.json`).monster||[]) zh[m.name]=m.name_zh;
const out=[]; let copy=0;
for(const f of rd(`fluff-bestiary-${src}.json`).monsterFluff||[]){
  if(f._copy&&!f.entries){copy++;continue;}
  if(intro[`${f.name}|${f.source}`]) continue;
  out.push(`${f.name}=${zh[f.name]||"?"}`);
}
console.log(out.join("; ")); console.error(`待寫 ${out.length}，純 _copy ${copy}`);
