import fill from "./_tcefill.mjs";
import fs from "fs";
const only = (b, names) => fill(b, JSON.parse(fs.readFileSync(`work/${b}.en.json`)).items.map((e, i) => e.s.map((s, j) => j === 0 ? names[i] : null)));
fill("bg-PSI", [["審判官", null, null, null, "{@item Thieves' tools|phb}、一種{@filter 工匠工具|items|source=phb|miscellaneous=mundane|type=artisan's tools}", null, "一個{@item holy symbol|phb}、一套{@item traveler's clothes|phb}，以及一個裝有 15 gp 的腰間{@item pouch|phb}",
 "特性：合法權威", "身為教會的審判官，你有權逮捕罪犯。在沒有其他當局的情況下，你有權做出判決，甚至執行刑罰。然而，若你濫用這項權力，你在教會中的上級可能會剝奪它。"]]);
only("bg-LFL", ["洛溫專家", "影沼專家"]);
only("bg-ABH", ["狂歡者", "吸血鬼信徒", "吸血鬼倖存者"]);
fill("bg-AAG", [
["星界漂泊者", null, null, null, "兩種自選語言（建議{@language Celestial}或{@language Gith|MM}）", null, "一套{@item traveler's clothes|PHB}、一本日記、一支{@item ink pen|PHB}、一{@item Ink (1-ounce bottle)|PHB|瓶墨水}，以及一個裝有 10 gp 的{@item pouch|phb}",
 null, "你比外表看起來老 {@dice 20d6} 歲，因為你在星界之海中度過了那麼長的時間而沒有衰老。",
 "特性：神聖接觸", "你獲得{@book Player's Handbook|PHB}中的{@feat Magic Initiate||魔法新手專長}，且必須為該專長選擇牧師。",
 "在星界之海中，你與一位流浪的神祇不期而遇。這次邂逅短暫而平和，卻讓你留下了深刻的印象。這位神祇認為值得與你分享一個宇宙的祕密或冷僻知識。與你的 DM 合作決定這份知識的細節及其對戰役的影響。",
 "在「神聖接觸」表上擲骰決定你遇到的神祇，或與你的 DM 合作找出更合適的選擇。", "神聖接觸", null, "流浪的神祇",
 "柯瑞隆，藝術與魔法之神（混亂善良）", "泰摩拉，好運之神（混亂善良）", "法蘭根，地平線與旅行之神（中立善良）", "伊斯圖斯，命運與天命之神（中立）", "努阿達，戰爭與戰士之神（中立）", "齊維林，智慧之神（中立）", "阿隆，生與死之神（中立邪惡）", "赫卡忒，魔法與月亮之神（混亂邪惡）", "塞勒斯汀，星辰與漫遊者之神（中立）", "卜塔，知識與祕密之神（守序中立）"],
["蠻荒星域旅人", null, null, null, "{@item Navigator's tools|phb}、{@filter 載具（太空）|items|source=phb;dmg|miscellaneous=mundane|type=vehicle (space)}", null, "一根繫繩栓（{@item club|phb}）、一套{@item traveler's clothes|PHB}、一個{@item grappling hook|PHB}、{@item Hempen Rope (50 feet)|PHB|50 呎麻繩}，以及一個裝有 10 gp 的{@item pouch|phb}",
 "千鈞一髮的遭遇", "你曾與蠻荒星域眾多恐怖之物之一有過驚心動魄的遭遇。你僥倖逃過一劫，但這次遭遇讓你留下了一兩道傷疤，或許還有反覆出現的惡夢。在「千鈞一髮的遭遇」表上擲骰決定哪種生物差點要了你的命。標有星號的生物出自{@book Boo's Astral Menagerie|BAM}；其他則在{@book Monster Manual|MM}中有所描述。",
 "千鈞一髮的遭遇", null, null, "=", "=", "=", "=", "=", "=", "=", "=",
 "特性：蠻荒星域適應", "你獲得{@book Player's Handbook|PHB}中的{@feat Tough||健壯專長}。此外，你學會了如何適應零重力。失重不會使你的任何近戰攻擊檢定具有劣勢（見{@book chapter 2|AAG|2}的「{@book Weightlessness|AAG|2|失重}」）。"],
]);
