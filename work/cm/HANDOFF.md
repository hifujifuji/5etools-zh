# 交接：翻譯《燭堡秘案》（Candlekeep Mysteries，CM）冒險正文

更新：2026-10-30（第 15 章完成）

## 目標

把 5etools 冒險頁 `adventure.html#cm` 的正文、標題、表格譯成繁體中文，做法比照已完成的《地下城主指南（2024）》（XDMG）與《怪物圖鑑（2025）》（XMM）書籍頁。

## 進度

- **已譯（正文、標題、表格全文）**：第 0～15 章。
- **已部署**：第 0～15 章。
- **已推上 GitHub**：到第 11 章（59a2bf7）；第 12～15 章還沒 push。
- **下一步**：第 16 章 The Scrivener's Tale（抄寫員的故事），之後依序翻到第 18 章。第 19 章 Credits 不譯。

| 章序 | 英文章名 | 中文章名 | 狀態 |
|---|---|---|---|
| 0 | A Book of Books | 書中之書 | 完成 |
| 1 | Candlekeep | 燭堡 | 完成 |
| 2 | The Joy of Extradimensional Spaces | 異次元空間之樂 | 完成 |
| 3 | Mazfroth's Mighty Digressions | 馬茲佛斯的浩瀚離題 | 完成 |
| 4 | Book of the Raven | 渡鴉之書 | 完成 |
| 5 | A Deep and Creeping Darkness | 深沉蔓延的黑暗 | 完成 |
| 6 | Shemshime's Bedtime Rhyme | 申辛的床邊童謠 | 完成 |
| 7 | The Price of Beauty | 美麗的代價 | 完成 |
| 8 | Book of Cylinders | 圓筒之書 | 完成 |
| 9 | Sarah of Yellowcrest Manor | 黃冠莊園的莎拉 | 完成 |
| 10 | Lore of Lurue | 盧露傳說 | 完成 |
| 11 | Kandlekeep Dekonstruktion | 燭堡解構 | 完成 |
| 12 | Zikran's Zephyrean Tome | 齊克蘭的西風典籍 | 完成 |
| 13 | The Curious Tale of Wisteria Vale | 紫藤谷奇譚 | 完成 |
| 14 | The Book of Inner Alchemy | 內丹之書 | 完成 |
| 15 | The Canopic Being | 卡諾卜之軀 | 完成 |
| 16 | The Scrivener's Tale | 抄寫員的故事 | 待譯（56k） |
| 17 | Alkazaar's Appendix | 阿卡札的附錄 | 待譯（53k） |
| 18 | Xanthoria | 贊索莉亞 | 待譯（40k） |
| 19 | Credits | 製作群 | 不譯 |

章名都已寫在 `i18n/cm/names-0.json`（目錄與 `{@adventure}` 連結共用）。若某章翻譯時發現站內已有不同譯名（例如怪物名），要回頭改 names-0.json 與 `work/cm/terms.md`，例如 Shemshime 改成「申辛」、Lurue 改成「盧露」。

## 每章的翻譯流程

1. `node scripts/build.mjs`（讓 dist 是最新的）。
2. 列出未譯字串：`BOOK=cm node work/xdmg/_paradump.mjs 〈章序〉`
   - 輸出 `work/cm/_ch〈章序+1〉para.txt`（每行「序號\t英文」）與 `_ch〈章序+1〉names.txt`（未譯標題）。
3. 查譯名：`node work/cm/_look.mjs 名稱 名稱…`（搜尋 dist 所有資料的 name → name_zh）。**怪物、法術、物品、神祇一律用站內既有譯名**；CM 自己的怪物也已有中文（例如 申辛、盧露、費爾、金瓦齊姆、凌弱精怪）。
4. 寫譯稿（每行「序號\t中文」，放在 scratchpad），只寫要翻的行；`map`、`mapPlayer` 這類圖片類型字串跳過。
5. 寫入：`BOOK=cm node work/xdmg/_paraput.mjs 〈章序+1〉 a 譯稿.txt` → `i18n/cm/paras-〈章序+1〉a.json`。長章分 a、b 兩批。**同一後綴會覆蓋舊檔**。
6. 標題寫進 `i18n/cm/names-〈章序〉.json`（英文標題 → 中文；整本共用，同名標題只需寫一次，如 Treasure、Development、Conclusion）。
7. 重新建置，再跑一次 `_paradump`，剩下應只有 `map`／`mapPlayer`，標題 0。
8. 檢查連結顯示文字：用下面的 node 片段（把 `slice(10,11)` 改成該章），只剩區域代號（如 `{@area C11|...}`）是正常的。
   ```
   node -e 'const d=require("./dist/data/adventure/adventure-cm.json").data.slice(10,11);const cj=/[㐀-鿿]/;const out=new Set();const w=o=>{if(typeof o==="string"){if(cj.test(o))for(const m of o.matchAll(/\{@(\w+) ([^{}]*)\}/g)){const p=m[2].split("|");const disp=["book","adventure","area"].includes(m[1])?p[0]:(m[1]==="deity"?p[3]:(p[2]||p[0]));if(!cj.test(disp||"")&&!["i","b","dice","note","dc","chance"].includes(m[1]))out.add(m[0]);}}else if(Array.isArray(o))o.forEach(w);else if(o&&typeof o==="object")Object.values(o).forEach(w)};w(d);console.log([...out].join("\n")||"全部有中文")'
   ```
9. 瀏覽器預覽：`preview_start`（設定名 `5etools-zh`，port 5055），開 `http://localhost:5055/adventure.html#cm,〈章序〉`。先在頁面執行清 caches、註銷 service worker、`fetch("/data/adventure/adventure-cm.json",{cache:"reload"})`，**再 reload 一次**才會看到新內容。
10. 在 `work/cm/terms.md` 補上這章的自訂譯名，HANDOFF 的進度表更新，然後 commit（不要 commit `_ch*para.txt`、`_ch*names.txt`）。

## 譯文寫法

- 標籤保留英文目標，build 會自動補中文顯示文字：`{@creature Mage||法師}` 或直接 `{@creature mage}` 都可以。
- `{@area 顯示文字|id|旗標}` 不會自動補，顯示文字直接寫中文，慣例寫「區域 B7」：`{@area 區域 B7|2bb|x}`。
- `{@book 章節名|DMG|…}` 的第一欄直接寫中文（例如 `{@book 超自然贈禮|DMG|7|Charms}`）。書名連結（PHB、DMG、MM）的中文在 `i18n/cm/names-links.json`。
- `{@i 書名}`（書中提到的書名）直接把書名翻成中文。`{@i}` 裡若保留英文，且英文剛好是已譯的章名，build 會把它改寫成「英文||中文」的怪樣子，附原文時不要包 `{@i}`。
- `_paraput` 依「目前」的 `_paradump` 輸出對應序號，寫入後若要改單句，直接改 `paras-*.json`，不要重跑 `_paraput`。
- 標題本身是連結（如 `{@item Serpent Scale Armor|CM}`）時，names 的值寫成 `{@item Serpent Scale Armor|CM|蛇鱗甲}`。
- 角色扮演用的人格特質／理念／牽絆／缺點引句都照翻；童謠、詩句盡量押韻。
- 「讀出來的方框文字」（insetReadaloud）、表格字串、側欄都是一般字串，照翻。

## 這段期間對 build 的修改（已 commit）

- 冒險檔支援：`BOOK_ZH` 清單含 `cm`；`applyBookZh` 也套用 `adventure/adventure-*.json`；書籍標籤補中文那步、`patches/00-assets.mjs` 的目錄 `BOOKHDR` 都已支援冒險。
- `_paradump.mjs` 自動判斷書或冒險路徑，並另外輸出未譯標題。
- 內部欄位 `_zhOf` 不再被正文譯文或補標籤步驟改寫（原本會讓章名、連結型標題顯示成英文）。
- i18n 書籍譯稿的 TERM_FIX 只套在譯文值上，不再改到英文原文鍵（原本含 `{@quickref …}` 的段落比對不到）。這也可能讓 XDMG 少數含 quickref 的段落開始套用，沒有逐一檢查。
- `i18n/ui.json` 加了「檢視整篇冒險／檢視全書」。
- 篩選器預設不勾選清單（`scripts/off-settings.json`）加了 TLotRR（瀏覽器自行載入的《魔戒角色扮演》自製／合作內容），`patches/66-off-settings.mjs` 讓自製／合作內容的預設勾選也套用這份清單。

## 用語規範

- **一律先查站內既有譯名**（`_look.mjs`），找不到再自訂，並記進 `work/cm/terms.md`。
- 易錯：kenku＝天狗、tabaxi＝斑貓人、grippli＝格立普力蛙人、meenlock＝凌弱精怪、Lurue＝盧露、Shemshime＝申辛、Selûne＝蘇倫、Mielikki＝梅莉凱、Sune＝淑妮、Torm＝扥姆、Chult＝楚爾特、Vistani＝維斯塔尼人、shadow crossing＝幽影通道、fey crossing＝妖精通道。
- 燭堡用語（立誓者、求知者、典籍守護者、大閱讀者、翡翠門、爐邊酒館……）見 `work/cm/terms.md`。
- tenday＝十日週、DR＝谷地紀年（DR）。

## 部署與推送

- 部署：`node scripts/deploy.mjs`（網址 https://5etools-zh.graphia.workers.dev/）。偶爾第一次會中途失敗（只看到 Node 版本訊息），重跑即可。
- 圖片從 5etools 官方圖片庫載入（`patches/01-img-root.mjs` 設定 `DEPLOYED_IMG_ROOT`），dist 不含 img/。
- 推上 GitHub 前要先問使用者；同意後 `git fetch && git rebase origin/main` 再 push。工作區有未 commit 的暫存檔時 rebase 會被擋，先確認 origin 沒有新提交再直接 push，或先 stash。
- 回報上線時只說已上線，不列更新清單；但有修正問題時要說明。
