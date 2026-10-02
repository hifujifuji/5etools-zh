// 以子字串查站內既有怪物中文名：node work/_mnsub.mjs <詞…>
import fs from "fs";
const want=process.argv.slice(2).map(s=>s.toLowerCase());
const out=new Map();
for(const f of fs.readdirSync("dist/data/bestiary")){ if(!f.startsWith("bestiary-"))continue;
  const j=JSON.parse(fs.readFileSync("dist/data/bestiary/"+f,"utf8"));
  for(const m of j.monster||[]){ if(!m.name_zh)continue; const n=String(m.name).toLowerCase(); for(const w of want) if(n.includes(w)) { if(!out.has(w))out.set(w,new Map()); out.get(w).set(m.name,m.name_zh); } } }
for(const w of want){ const e=[...(out.get(w)||[])].slice(0,+process.env.N||4); console.log(w,"=>",e.map(([a,b])=>`${a}=${b}`).join("; ")||"?"); }
