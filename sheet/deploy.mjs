// 自動角色卡：產生資料後上傳到 Cloudflare（https://dnd-sheet.graphia.workers.dev/）
//   node sheet/deploy.mjs   需先執行 node scripts/build.mjs
import {execFileSync} from "node:child_process";
import path from "node:path";
import {fileURLToPath} from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
execFileSync("node", [path.join(HERE, "build.mjs")], {stdio: "inherit"});
execFileSync("npx", ["-y", "wrangler@4.153.0", "deploy"], {cwd: HERE, stdio: "inherit"});
console.log("已部署到 https://dnd-sheet.graphia.workers.dev/");
