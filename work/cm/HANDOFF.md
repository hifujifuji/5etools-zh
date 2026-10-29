# 交接：翻譯《燭堡祕辛》（Candlekeep Mysteries，CM）冒險正文

更新：2026-10-29

## 目標

把 5etools 冒險頁 `adventure.html#cm` 的正文、標題、表格譯成繁體中文，做法比照已完成的《地下城主指南（2024）》（XDMG）與《怪物圖鑑（2025）》（XMM）書籍頁。

## 現況

- **怪物**：CM 的 42 隻怪物（`bestiary-cm.json`）已有中文名與全文，不用處理。
- **魔法物品**：CM 的 12 件魔法物品已有中文，不用處理。
- **建置支援冒險檔**：已完成（2026-10-29）。`BOOK_ZH` 清單含 `cm`、`applyBookZh` 也套用 `adventure/adventure-*.json`、標籤補中文與目錄 `BOOKHDR` 都已支援冒險；`_paradump.mjs` 會自動判斷書或冒險路徑，並另外輸出未譯標題到 `work/cm/_ch〈N+1〉names.txt`。
- **已譯章節**：第 0 章（書中之書）、第 1 章（燭堡）、第 2 章（異次元空間之樂）、第 3 章（馬茲佛斯的浩瀚離題）、第 4 章（渡鴉之書）、第 5 章（深沉蔓延的黑暗）、第 6 章（申辛的床邊童謠）、第 7 章（美麗的代價）、第 8 章（圓筒之書）。冒險章名（各篇標題）已全部放進 `i18n/cm/names-0.json`，連結會自動顯示中文。
- **冒險名稱**：`i18n/ui.json` 早已譯為「燭堡秘案」（執行期字典），沿用此名，不另外加 `name_zh`。
- **譯名表**：`work/cm/terms.md`（燭堡地點、職稱、NPC、各篇章名）；查站內既有譯名用 `node work/cm/_look.mjs 名稱…`。
- **冒險正文（原始狀態）**：`adventure-cm.json` 原本完全沒有中文。共 20 章，約 78 萬字元英文（不含數據區塊），每章約 3～6 萬字元；XDMG 全書約 64 萬字元，CM 的量比它還大。
- **冒險名稱**：`adventures.json` 裡 CM 沒有 `name_zh`，冒險列表與頁面標題仍是英文。

| 章序 | 英文章名 | 字元數 |
|---|---|---|
| 0 | A Book of Books | 8k |
| 1 | Candlekeep | 31k |
| 2 | The Joy of Extradimensional Spaces | 30k |
| 3 | Mazfroth's Mighty Digressions | 34k |
| 4 | Book of the Raven | 44k |
| 5 | A Deep and Creeping Darkness | 44k |
| 6 | Shemshime's Bedtime Rhyme | 49k |
| 7 | The Price of Beauty | 60k |
| 8 | Book of Cylinders | 32k |
| 9 | Sarah of Yellowcrest Manor | 54k |
| 10 | Lore of Lurue | 36k |
| 11 | Kandlekeep Dekonstruktion | 48k |
| 12 | Zikran's Zephyrean Tome | 32k |
| 13 | The Curious Tale of Wisteria Vale | 44k |
| 14 | The Book of Inner Alchemy | 34k |
| 15 | The Canopic Being | 52k |
| 16 | The Scrivener's Tale | 56k |
| 17 | Alkazaar's Appendix | 53k |
| 18 | Xanthoria | 40k |
| 19 | Credits | 2k（不譯） |

建議順序：先翻第 0、1 章（燭堡本身的設定，其他冒險都會引用這裡的地名與 NPC），再依需要逐篇翻冒險。每篇冒險各自獨立，翻完一篇就可以部署。

## 第一步：讓建置支援「冒險」檔（已完成，以下保留作為說明）

目前的書籍中譯機制只處理 `data/book/book-*.json`，冒險檔在 `data/adventure/adventure-*.json`，要先改程式。三個地方：

1. **`scripts/build.mjs` 的 `BOOK_ZH`**
   - 清單：`for (const id of ["xdmg", "xmm"])` 加上 `"cm"`，並建立 `i18n/cm/` 資料夾。
   - 套用條件：目前的 regex 是 `/^book\/book-(.+)\.json$/`（變數 `mBook`），改成同時接受 `adventure/adventure-(.+)\.json`，讓 `applyBookZh` 也套到冒險檔。
   - 注意：上面那段 `tr.book` 合併（hazmole 舊譯）只針對書籍；冒險沒有 hazmole 譯文，這段不要動。
2. **`scripts/build.mjs` 最後的「3‴‴. 書籍中譯段落裡的標籤補中文」**
   - 這段用 `/book-(.+)\.json$/` 判斷檔案，要改成也接受 `adventure-`，否則連結不會自動補中文。
3. **`patches/00-assets.mjs` 的 `bookHeaders`**
   - 這個函式產生左側目錄的中文對照（`zh.js` 的 `BOOKHDR`）。
   - 目前只讀 `data/book/`、只對 `books.json` 的 `contents`；要加讀 `data/adventure/` 與 `adventures.json`。
   - 還要確認 `src/zh.js` 在 `adventure.html` 上一樣會套用（它是用網址 hash 的 id 查表，`#cm` 應該可行，但要實測）。

另外在 `i18n/` 適當的地方補上 CM 的冒險中文名，讓冒險列表與標題顯示中文；先查清楚現有冒險名稱是在哪裡翻的。

## 翻譯流程（XDMG／XMM 用的同一套工具）

工具在 `work/xdmg/`，用環境變數 `BOOK` 指定書（`BOOK=cm`）。但目前 `_paradump.mjs` 讀的路徑寫死為 `data/book/book-${BOOK}.json`，冒險要改成 `data/adventure/adventure-${BOOK}.json`，可以多加一個環境變數或自動判斷。

1. 先 `node scripts/build.mjs`，讓 dist 是最新的。
2. 列出某章（章序從 0 起）尚未有中文的字串：
   ```
   BOOK=cm node work/xdmg/_paradump.mjs 1
   ```
   輸出到 `work/cm/_ch2para.txt`（檔名是章序＋1），每行「序號\t英文」。
3. 寫譯稿，每行「序號\t中文」，放在暫存資料夾。只要寫需要翻的行；圖檔路徑、骰子算式、人名清單可以跳過。
4. 寫入翻譯檔：
   ```
   BOOK=cm node work/xdmg/_paraput.mjs 2 a 譯稿.txt
   ```
   產生 `i18n/cm/paras-2a.json`（第 2 個參數是章序＋1，第 3 個是批次後綴）。一章太長就分 a、b、c 批。
5. 標題另外放 `i18n/cm/names-*.json`（英文標題 → 中文）。可以先用 XMM 的做法，從 dist 的 `name_zh` 自動對應怪物與物品名稱。
6. 重新建置，再跑一次 `_paradump` 確認該章剩下的只有不需翻的東西。

### 譯文的寫法

- 譯文中的標籤保留英文目標，例如 `{@creature Mage|XMM}`、`{@spell Fireball|XPHB}`、`{@book chapter 3|CM|2}`。build 最後一步會依 dist 的 `name_zh` 自動補中文顯示文字。
- `{@area 顯示文字|id|旗標}` 不會自動補，顯示文字直接寫中文。書名連結（PHB、DMG、MM）的中文在 `i18n/cm/names-links.json`。
- 片語式連結文字（`{@book 這種|...}` 的第一欄、其他標籤的第三欄）若自動補不到，要嘛直接寫中文，要嘛加進對照表（XDMG 用 `i18n/xdmg/names-links.json`；CM 可以共用這種做法，但目前 `bookNames` 是每本書各自的 names，要確認冒險也讀得到）。
- 只有標籤的字串（例如「{@5etoolsImg Download PDF|...}」）不會自動處理，要寫進 paras。
- 表格的 `colLabelRows`、`caption`、`rows` 都會比對 paras 與 tables 的字串，整串完全相同才會替換。
- 「讀出來的方框文字」（`insetReadaloud`）也是一般字串，照翻。

## 用語規範

- **一律先查站內既有譯名，不要自己創譯名。**
  - 怪物：`dist/data/bestiary/*.json` 的 `name_zh`。
  - 法術、物品：`dist/data/spells/`、`items.json` 的 `name_zh`。
  - 規則詞彙：`i18n/glossary.json`、`i18n/terms-2024.md`。
- **易錯的怪物名**：goblin＝哥布林、hobgoblin＝大哥布林、bugbear＝熊地精、mimic＝擬身怪、aboleth＝底棲魔魚、mephit＝魔蝠、yugoloth＝羅斯魔、otyugh＝食腐獸、flumph＝呋嚕、modron＝魔冢。
- **規則用語**：Heroic Inspiration＝英勇激勵、Shadowfell＝墮影冥界、Limbo＝混沌海、Pandemonium＝喧癲空隧、Psychic＝精神、Necrotic＝死靈、Slashing＝劈砍。
- **被遺忘國度地名**（燭堡在劍灣）：Sword Coast＝劍灣、Waterdeep＝深水城、Baldur's Gate＝博德之門、Neverwinter＝絕冬城、Underdark＝幽暗地域。燭堡的建築、NPC 名先查 `i18n/xdmg/names-*.json` 與 `i18n/hazmole/`，再決定譯名，並在 CM 內保持一致。
- **專有名詞**：同一名詞在整本冒險裡必須一致。建議開一份 `work/cm/terms.md` 記錄自訂譯名，每翻一章就補上。

## 驗證

- 建置：`node scripts/build.mjs`，輸出不該有 error。
- 預覽：Claude 內建瀏覽器用 `preview_start`（設定名 `5etools-zh`，port 5055），開 `http://localhost:5055/adventure.html#cm,1`。
- 看到舊內容是 service worker 快取：在頁面執行清除 caches、註銷 service worker、`fetch(資料檔, {cache: "reload"})` 後再載入。
- 本機沒有書內插圖，console 的 404 是正常的。
- 檢查連結是否都顯示中文：參考 XDMG 時用過的 node 片段，掃 dist 的字串，找出顯示文字沒有中文的 `{@...}`。

## 部署與推送

- 部署：`node scripts/deploy.mjs`，網址是 https://5etools-zh.graphia.workers.dev/ 。
- 推上 GitHub 前必須先問使用者，同意後先 `git fetch && git rebase origin/main` 再 push。使用者會直接在 GitHub 上改 README。
- 回報上線時只說已上線，不列更新清單；但有修正問題時要說明。
- `work/*/_ch*para.txt` 是暫存清單，不要 commit。

## 參考：已完成的範例

- XDMG：`i18n/xdmg/paras-*.json`、`names-*.json`、`names-links.json`。
- XMM：`i18n/xmm/paras-*.json`、`names-0.json`（標題自動對應的做法）。
- 中文簡介方塊已關閉：`scripts/build.mjs` 的 `SHOW_BOOK_INTRO = false`，CM 不需要寫簡介。
