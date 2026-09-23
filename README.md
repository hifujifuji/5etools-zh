# 5etools 中文版

以 [5etools](https://5e.tools) 2.25.3 為基礎的繁體中文 D&D 5e 資料站。
翻譯沿用 [hazmole/TheGiddyLimit.github.io](https://github.com/hazmole/TheGiddyLimit.github.io)（2021 年停更的中文版）。

## 使用

```bash
node scripts/build.mjs      # 建置到 dist/
node scripts/serve.mjs      # 本機預覽 http://127.0.0.1:5050/
```

上游 5etools 預設路徑是 iCloud 裡的 `5etools-2.25.3`，要換版本用 `UPSTREAM=<路徑> node scripts/build.mjs`。

## 運作方式

不直接改 5etools 原始碼，每次建置都從上游複製一份乾淨的再套用：

1. **資料合併**（`scripts/merge.mjs`）：把舊版中文物件「結構對齊」地套到新版英文資料上。
   - 只替換文字欄位，而且只在舊版確實是中文、結構對得上時才換；對不上的段落保留英文。
   - `name` 一律維持英文（連結、雜湊、`_copy` 都靠它），中文名放在 `name_zh`，並用 `_zhOf` 記下對應的英文名，
     避免 5etools 複製實體（例如衍生怪物、魔法物品變體）時把中文名帶到別的項目上。
   - 舊版內文裡的 `{@spell 火球術}` 會轉回 `{@spell Fireball||火球術}`，連結才點得到。
   - 沒有全文翻譯的新版內容（例如 2024 版法術）至少用名稱字典補上中文名。
2. **程式修改**（`patches/*.mjs`）：字串替換，找不到目標會報錯，方便上游改版時發現。
   - `00-assets`：注入 `js/zh.js`、`css/zh.css`
   - `10-names`：列表／標題顯示「中文 English」、渲染器顯示巢狀條目中文名、搜尋索引收錄中文名
   - `20-classes`：職業表、特性標題、子職業按鈕
   - `30-search`：全站搜尋支援中文（修正 elasticlunr 會刪掉中文字的問題、中文片段搜尋）
   - `40-races-items`：執行期合成的「精靈（高等）」「+1 長劍」等中文名
   - `50-books`：書本目錄導覽仍用英文標題比對
3. **介面翻譯**（`src/zh.js` + `i18n/ui.json`）：用 MutationObserver 把「整段完全符合」詞典的介面文字換成中文，
   另外用正規式處理「3rd-level evocation」這類組合字串。只比對整段，不會動到內文。
4. **搜尋索引**：用合併後的資料重新產生 `search/*.json`。

## 翻譯檔

| 路徑 | 內容 |
| --- | --- |
| `i18n/hazmole/` | 從 hazmole 版抽出的翻譯（`scripts/extract-hazmole.mjs` 產生，勿手改） |
| `i18n/custom/` | 自己補的翻譯，格式同上，優先於 hazmole |
| `i18n/glossary.json` | 標籤對照（技能、動作…）與名稱字典 |
| `i18n/ui.json` | 介面詞典與正規式規則 |

重新抽取 hazmole 翻譯：

```bash
git clone --depth 1 https://github.com/hazmole/TheGiddyLimit.github.io.git /tmp/hazmole
node scripts/extract-hazmole.mjs /tmp/hazmole
```

建置完會在 `.cache/report.json` 留下統計與無法解析的標籤清單。

## 發佈到 GitHub Pages

1. 在 GitHub 建立空的 repo（例如 `5etools-zh`，不要勾選 README）。
2. 設定 remote 並推上原始碼：
   `git remote add origin https://github.com/<帳號>/5etools-zh.git && git push -u origin main`
3. 建置並部署：`node scripts/build.mjs && node scripts/deploy.mjs`
   （把 `dist/` 推到 `gh-pages` 分支）
4. GitHub repo → Settings → Pages → Source 選「Deploy from a branch」，分支選 `gh-pages` / `(root)`。
5. 約一兩分鐘後可在 `https://<帳號>.github.io/5etools-zh/` 瀏覽。

之後更新翻譯只要重複第 3 步。
