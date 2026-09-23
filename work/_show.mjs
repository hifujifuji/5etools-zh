import fs from "fs";
import tm from "./_tm.mjs";
const b = process.argv[2];
const en = JSON.parse(fs.readFileSync(`work/${b}.en.json`)).items;
en.forEach((e, i) => { console.log(`#${i} ${e.key}`); e.s.forEach((s, j) => console.log(`  ${j}${tm[s] ? "=" : ":"} ${tm[s] ? tm[s] : s}`)); });
