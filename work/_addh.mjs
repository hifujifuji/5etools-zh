// 用法：node work/_addh.mjs '{"English":"中文",...}'  加入標題字典
import fs from "fs";
const H = JSON.parse(fs.readFileSync("work/_headings.json"));
Object.assign(H, JSON.parse(process.argv[2]));
fs.writeFileSync("work/_headings.json", JSON.stringify(H, null, 1));
