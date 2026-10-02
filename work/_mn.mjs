import fs from "fs";
const want=process.argv.slice(2).map(s=>s.toLowerCase());
const out={};
for(const f of fs.readdirSync("dist/data/bestiary")){ if(!f.startsWith("bestiary-"))continue;
  const j=JSON.parse(fs.readFileSync("dist/data/bestiary/"+f,"utf8"));
  for(const m of j.monster||[]){ const n=String(m.name).toLowerCase(); if(want.includes(n)&&m.name_zh) out[m.name]=m.name_zh; } }
for(const w of process.argv.slice(2)) { const k=Object.keys(out).find(k=>k.toLowerCase()===w.toLowerCase()); console.log(w,"=>",k?out[k]:"?"); }
