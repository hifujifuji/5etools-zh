// 列出某來源尚無中文簡介的 monsterFluff 條目（英文名 => 站內中文名）；用法：[S=字數] node work/_introtodo.mjs <SRC>
// S>0 時每筆一行，附生物類型／CR 與原文開頭 S 字元，供撰寫時核對事實（簡介仍須自撰，不照譯）
import fs from "fs";
const src=process.argv[2].toLowerCase(), S=+process.env.S||0;
const intro=JSON.parse(fs.readFileSync("i18n/monster-intro.json","utf8"));
const rd=f=>JSON.parse(fs.readFileSync("dist/data/bestiary/"+f,"utf8"));
const mon={}; try{ for(const m of rd(`bestiary-${src}.json`).monster||[]) mon[m.name]=m; }catch{}
const txt=e=>typeof e==="string"?e:Array.isArray(e)?e.map(txt).join(" "):e&&typeof e==="object"?(e.type==="image"||e.type==="quote"||e.type==="table"?"":txt(e.entries||e.items||"")):"";
const clean=s=>s.replace(/\{@\w+ ([^|}]+)[^}]*\}/g,"$1").replace(/\s+/g," ").trim();
const out=[]; let copy=0;
for(const f of rd(`fluff-bestiary-${src}.json`).monsterFluff||[]){
  if(f._copy&&!f.entries){copy++;continue;}
  if(intro[`${f.name}|${f.source}`]) continue;
  const m=mon[f.name]; let s=`${f.name}=${m?.name_zh||"?"}`;
  if(S){ const t=m?.type; s+=` [${typeof t==="string"?t:t?.type?.choose?.join("/")||t?.type||""}${t?.tags?"("+t.tags.map(x=>x.tag||x).join(",")+")":""} CR${m?.cr?.cr||m?.cr||"-"}] :: ${clean(txt(f.entries)).slice(0,S)}`; }
  out.push(s);
}
console.log(out.join(S?"\n":"; ")); console.error(`待寫 ${out.length}，純 _copy ${copy}`);
