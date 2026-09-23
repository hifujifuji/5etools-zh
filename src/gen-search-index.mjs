// 在 dist/ 裡重新產生全站搜尋索引（改自 5etools node/generate-search-index.js，拿掉 commander 依賴）。
// 由 scripts/build.mjs 複製到 dist/node/ 後執行，cwd 必須是 dist/。
import fs from "fs";
import "../js/parser.js";
import "../js/utils.js";
import "../js/utils-ui.js";
import "../js/utils-config.js";
import "../js/render.js";
import "../js/render-dice.js";
import "../js/hist.js";
import "../js/filter.js";
import "../js/utils-brew.js";
import * as utS from "./util-search-index.js";

const index = await utS.UtilSearchIndex.pGetIndex({doLogging: false});
fs.writeFileSync("search/index.json", JSON.stringify(index), "utf8");
const indexItems = await utS.UtilSearchIndex.pGetIndexAdditional(Parser.CAT_ID_ITEM, {doLogging: false});
fs.writeFileSync("search/index-item.json", JSON.stringify(indexItems), "utf8");
const indexAltSpells = await utS.UtilSearchIndex.pGetIndexAlternate("spell", {doLogging: false});
fs.writeFileSync("search/index-alt-spell.json", JSON.stringify(indexAltSpells), "utf8");
console.log(`搜尋索引：${(index.x || index).length} 筆`);
