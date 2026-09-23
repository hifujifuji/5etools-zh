import fs from "node:fs";
const en = JSON.parse(fs.readFileSync("work/efa-art-2.en.json", "utf8"));
const ASI = ["屬性值提升","你獲得{@feat Ability Score Improvement|XPHB}專長或另一個你符合資格的自選專長。"];
const SUB = ["子職業特性","你從你的奇械師子職業獲得一項特性。"];
const SPELLS = (zh, en) => [`${zh}法術`, `當你達到「${zh}法術」表中指定的奇械師等級時，你此後總是準備著所列的法術。`, `${zh}法術`, "奇械師等級", "法術", ...en.slice(5).map(s => s.replace(/, /g, "、"))];
const HAND = {
0: ["天才閃現","當你或你 30 呎內一個你能看見的生物在屬性檢定或豁免檢定中失敗時，你可以執行一個{@variantrule Reaction|XPHB}為該擲骰加上一個加值，可能使其成功。加值等同於你的智力調整值（至少 +1）。","你可以執行此{@variantrule Reaction|XPHB}的次數等同於你的智力調整值（至少一次）。你在完成一次{@variantrule Long Rest|XPHB}時恢復所有已消耗的次數。"],
1: ASI, 2: SUB,
3: ["魔法物品行家","你現在最多可以同時與四件魔法物品同調。"],
4: ["儲法物品","每當你完成一次{@variantrule Long Rest|XPHB}時，你可以碰觸一把簡易或軍用武器，或一件你能作為{@variantrule Spellcasting Focus|XPHB}使用的物品，並在其中儲存一道法術：選擇一道施法時間為一個動作、且不需要會被法術消耗之材料成分的 1、2 或 3 環奇械師法術（你不必已準備該法術）。","持有該物體時，生物可以執行一個{@action Magic|XPHB}動作，從中產生該法術的效果，使用你的施法屬性調整值。若該法術需要{@status Concentration|XPHB}，該生物必須專注。一旦生物使用該物體產生了法術效果，直到該生物的下個回合開始前，都無法再以此方式使用該物體。","法術會留在物體中，直到它被使用的次數等同於你智力調整值的兩倍（至少兩次），或直到你再次使用此特性將法術儲存於某個物體中為止。"],
5: ASI,
6: ["進階奇械","你獲得以下益處。","魔法物品學者","你現在最多可以同時與五件魔法物品同調。","天才復甦","當你完成一次{@variantrule Short Rest|XPHB}時，你恢復一次已消耗的{@classFeature Flash of Genius|Artificer|EFA|7|EFA|天才閃現}使用次數。"],
7: SUB, 8: ASI,
9: ["魔法物品大師","你現在最多可以同時與六件魔法物品同調。"],
10: ["史詩恩賜","你獲得一個史詩恩賜專長或另一個你符合資格的自選專長，推薦選擇{@feat Boon of Energy Resistance|XPHB}。"],
11: ["奇械之魂","你與你的魔法物品之間發展出一種神秘的連結，你可以從中汲取幫助。你獲得以下益處。","欺騙死亡","若你的{@variantrule Hit Points|XPHB}降至 0 但未被直接殺死，你可以使任意數量由你的複製魔法物品特性所製作的非普通或珍稀魔法物品崩解。若你這麼做，你的{@variantrule Hit Points|XPHB}改為變成等同於崩解之魔法物品數量 20 倍的數值。","魔法指引","當你完成一次{@variantrule Short Rest|XPHB}時，若你至少與一件魔法物品{@variantrule Attunement|XPHB|同調}，你會恢復所有已消耗的{@classFeature Flash of Genius|Artificer|EFA|7|EFA|天才閃現}使用次數。"],
12: ["冒險者地圖集","每當你在持有{@item Cartographer's Tools|XPHB}的情況下完成一次{@variantrule Long Rest|XPHB}時，你可以使用該工具，碰觸至少兩個生物（其中一個可以是你自己）來製作一組魔法地圖，生物數量上限等同於 1 + 你的智力調整值（至少兩個）。每個目標會得到一張魔法地圖，地圖會持續更新以顯示所有持圖者的相對位置，但對其他人而言無法辨讀。地圖會持續到你死亡或你再次使用此特性為止，屆時此特性先前製作的所有地圖都會立即消失。","攜帶地圖時，目標獲得以下益處。","警覺","目標的{@variantrule Initiative|XPHB}擲骰加上 {@dice 1d4}。","定位","目標知道與其位於同一個存在位面之所有其他持圖者的位置。在施展法術或產生其他需要能看見效果目標的效果時，只要另一名持圖者仍在效果的範圍內，持圖者就可以無視視線或掩護，以另一名持圖者為目標。"],
13: ["煉金師","煉金師是調配試劑以產生魔法效果的專家。煉金師運用他們的創造物來賦予生命，也能汲取生命。"],
15: ["奧術護甲","當你手中持有{@item Smith's Tools|XPHB}時，你可以作為一個{@action Magic|XPHB}動作，將你穿著的一套護甲轉變為奧術護甲。這套護甲會持續作為奧術護甲，直到你穿上另一套護甲或你死亡為止。","穿著你的奧術護甲時，你獲得以下益處。","無力量需求","若該護甲通常有力量需求，奧術護甲對你而言沒有此需求。","快速穿脫","你可以作為一個{@action Utilize|XPHB}動作穿上或脫下此護甲。此護甲無法違背你的意願被脫下。","施法法器","你可以將奧術護甲作為你奇械師法術的{@variantrule Spellcasting Focus|XPHB}。"],
16: ["護甲型號","你可以自訂你的奧術護甲。這麼做時，從下列護甲型號中選擇一種：{@subclassFeature Dreadnaught|Artificer|EFA|Armorer|EFA|3|EFA|無畏}、{@subclassFeature Guardian|Artificer|EFA|Armorer|EFA|3|EFA|守衛者}或{@subclassFeature Infiltrator|Artificer|EFA|Armorer|EFA|3|EFA|滲透者}。你選擇的型號會在你穿著時給予你特殊的益處。","每種型號都包含一件特殊武器。當你用該武器攻擊時，你可以在攻擊檢定與傷害擲骰上加上你的智力調整值，而非力量或敏捷調整值。","若你手中持有{@item Smith's Tools|XPHB}，每當你完成一次{@variantrule Short Rest|XPHB|短休}或{@variantrule Long Rest|XPHB}時，你可以更換護甲的型號。"],
17: ["裝甲師","裝甲師會改造護甲，使其運作起來幾乎像第二層皮膚。這套護甲經過強化，能磨練裝甲師的魔法、釋放強力的攻擊，並產生令人生畏的防禦。"],
19: ["魔炮師","魔炮師專精於運用魔法在戰場上投射能量、拋射物與爆炸。"],
21: ["整裝待戰","你的戰鬥訓練與魔法實驗在兩方面帶來了成果。","奧術強化","當你以魔法武器攻擊時，你可以在攻擊檢定與傷害擲骰上使用你的智力調整值，而非力量或敏捷調整值。","武器知識","你獲得{@filter 軍用武器|items|type=martial weapon}的熟練。你可以將一把你熟練的武器作為你奇械師法術的{@variantrule Spellcasting Focus|XPHB}。"],
22: ["戰鬥鐵匠","戰鬥鐵匠集守護者與醫護兵於一身，擅長保護他人並修復物資與人員。為了協助工作，戰鬥鐵匠會帶著一具{@creature Steel Defender|EFA|鋼鐵衛士}，那是他們親手打造的守護夥伴。"],
24: ["製圖師","製圖師是首屈一指的領航者與偵察員。運用他們的創造物，製圖師能標示威脅、保護盟友，並開闢通往遠方的傳送門。"],
26: ["無畏","你將護甲設計成戰場上高聳的巨獸。它具有以下特色：","力場粉碎器","一顆奧術破壞球或一把大鎚從你的護甲中伸出。粉碎器視為具有{@itemProperty R|XPHB|觸及}屬性的簡易近戰武器，命中時造成 {@damage 1d10} 力場傷害。若你以粉碎器命中一個至少比你小一級的生物，你可以將該生物直接推離你至多 10 呎，或將其拉向你至多 10 呎。","巨人之姿","作為一個{@variantrule Bonus Action|XPHB}，你將護甲變形並放大 1 分鐘。在持續時間內，你的觸及範圍增加 5 呎；若你小於大型，你連同所穿戴的一切變為大型。若沒有足夠的空間讓你變大，你的體型不會改變。你可以使用此{@variantrule Bonus Action|XPHB}的次數等同於你的智力調整值（至少一次）。你在完成一次{@variantrule Long Rest|XPHB}時恢復所有已消耗的次數。"],
};
const SPELLNAME = {14: "煉金師", 18: "裝甲師", 20: "魔炮師", 23: "戰鬥鐵匠", 25: "製圖師"};
const out = en.items.map((it, i) => HAND[i] ?? SPELLS(SPELLNAME[i], it.s));
en.items.forEach((it, i) => { if (out[i].length !== it.s.length) console.log("長度不符", i, out[i].length, it.s.length); });
fs.writeFileSync("work/efa-art-2.zh.json", JSON.stringify(out));
