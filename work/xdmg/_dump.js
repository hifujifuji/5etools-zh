// 列出指定章需要簡介的節（L2–L4、自身文字夠長、尚無簡介）
const fs=require("fs");const b=require("../../dist/data/book/book-xdmg.json");
const intro={};for(const f of fs.readdirSync("i18n/xdmg").filter(f=>f.startsWith("intro")))Object.assign(intro,JSON.parse(fs.readFileSync("i18n/xdmg/"+f)));
const strip=s=>s.replace(/\{@\w+ ([^|}]*)[^}]*\}/g,"$1");
const txt=o=>typeof o==="string"?strip(o):Array.isArray(o)?o.map(txt).join(" "):o&&typeof o==="object"&&o.type!=="table"&&o.type!=="statblock"?((o.name?o.name+": ":"")+txt(o.entries||o.items||o.entry||[])):"";
const [ch,maxD,min]=process.argv.slice(2).map(Number);const seen=new Set();
const walk=(o,d,path)=>{if(Array.isArray(o))return o.forEach(x=>walk(x,d,path));if(!o||typeof o!=="object")return;
if((o.type==="section"||o.type==="entries")&&o.name){const n=o._nameEn||o.name;
 const own=(o.entries||[]).filter(x=>typeof x==="string"||x.type==="list"||(x.type==="entries"&&!x.name)||x.type==="inset"&&!x.name?.includes("中文")).map(txt).join(" ");
 if(d>1&&d<=maxD&&!intro[n]&&!intro[ch+"|"+n]&&!seen.has(n)&&own.length>=min){seen.add(n);console.log(`## ${n} [L${d}] (${o.name_zh||""})\n${own}\n`)}
 return (o.entries||[]).forEach(x=>walk(x,d+1,path));}
for(const v of Object.values(o))walk(v,d,path)};
walk(b.data[ch].entries,1,"");
