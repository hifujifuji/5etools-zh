// 用法：node work/it/_exp.mjs <batch> <source> [--all]：匯出該來源尚未翻完的物品
import fs from "fs";
import {execFileSync} from "child_process";
const [batch, source] = process.argv.slice(2);
const j = JSON.parse(fs.readFileSync("dist/data/items.json"));
const eng = o => { let e = false; JSON.stringify(o.entries || [], (k, v) => { if (typeof v === "string" && k !== "_zhOf" && k !== "name" && /[a-z]{4} [a-z]{3,}/.test(v.replace(/\{@[^}]*\}/g, ""))) e = true; return v; }); return e; };
const names = j.item.filter(i => i.source === source && (!i.name_zh || eng(i))).map(i => i.name.replace(/[()+?.*\[\]^$|\\]/g, "\\$&"));
if (!names.length) { console.log("無"); process.exit(0); }
console.log(execFileSync("node", ["scripts/tr.mjs", "export", batch, "--prop", "item", "--source", source, "--name", `^(${names.join("|")})$`]).toString().trim());
