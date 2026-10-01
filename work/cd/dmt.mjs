import {add, NAMES, RULES} from "./_c.mjs";
const ONCE = "此屬性使用後，在下一個黎明之前無法再次使用。";
add("Deck of Many Things", "BMT", {
 Balance: {1: "作為一個動作，你可以對你 30 呎內一個你能看見的生物揮舞這張牌，汲取它的生命力。目標必須成功通過一次 {@dc 17} 體質豁免檢定，否則受到 {@damage 4d8} 點黯蝕傷害。你接著恢復等同於目標所受黯蝕傷害的生命值。" + ONCE},
 Flames: {1: "你可以使用這張牌召喚一隻魔鬼。這張牌與一隻挑戰等級 8 或更低的特定魔鬼同調。作為一個動作，你可以高舉這張牌召喚那隻魔鬼，牠會出現在你 30 呎內一個你能看見的未被佔據空間。魔鬼一開始對你與你的同伴不友善。為魔鬼擲先攻，牠有自己的回合。DM 持有該生物的數據。在你的每個回合，你可以對魔鬼下達一個口頭命令（你不需要使用動作），只要你持握這張牌，魔鬼就會服從你的命令。否則，牠由 DM 控制並依其本性行動——若牠認為自己能占上風，可能會攻擊你，或試圖誘惑你做出邪惡的行為以換取牠進一步的服務。1 分鐘後，或當魔鬼的生命值降至 0 時，魔鬼會回到下層位面。" + ONCE},
 Gem: {1: "這張牌儲存著一道{@filter 6 環法術|spells|source=|level=6}（由 DM 選擇）。作為一個動作，你可以揮舞這張牌，用它施展儲存在其中的法術（法術攻擊加值 {@hit 9}，豁免 {@dc 17}）。" + ONCE},
 Jester: {1: "作為一個動作，你可以揮舞這張牌，用它施展{@spell Otto's Irresistible Dance}法術（豁免 {@dc 17}），且你為維持對它的專注而進行的體質豁免檢定具有優勢。" + ONCE},
 Skull: {1: "作為一個動作，你可以揮舞這張牌，用它以 6 環法術施展{@spell Spirit of Death|BMT}（見{@book 第 7 章|BMT|6|Spirit of Death}）（法術攻擊加值 +9，豁免 {@dc 17}）。" + ONCE}});
add("Deck of Many More Things", "BMT", {
 Euryale: {1: "這張牌上如{@creature medusa}般的面容詛咒了你。以此方式受到詛咒時，你的豁免檢定承受 −2 減值。只有神祇或{@card Fates|Deck of Many More Things|BMT}牌的魔法能結束這個詛咒。"},
 Sun: {1: "你獲得 50,000 XP，且{@filter 一件奇物|items|source=|type=wondrous item|category=}（由 DM 隨機決定）會出現在你手中。"}});
add("Deck of Several Things", "LLK", {Gem: {1: "{@table Wilderness Encounters|LLK}表（見附錄 A）中矮妖那 1,000 gp 的寶藏出現在你腳邊。若該寶藏已被領取，你獲得一份等值的寶藏。"}});
Object.assign(NAMES, {"Archmage and Mage Apprentice": "大法師與法師學徒", "Bandit Captain and Three Bandits": "強盜頭子與三名強盜", "Gnoll": "豺狼人", "Knight and Four Guards": "騎士與四名守衛", "Ogre Mage": "食人魔法師",
	"Priest and Two Acolytes": "祭司與兩名侍僧", "Succubus/Incubus": "魅魔／夢魔", "The Card Drawer": "抽牌者", "Veteran": "老兵", "You (The Deck's Owner)": "你（牌組的主人）"});
RULES.push([/^This card creates an illusion of an? (\{@creature [^}]+\})\.$/, m => `這張牌會創造出一隻${m[1]}的幻象。`], [/^This card creates an illusion of a the card drawer\.$/, () => "這張牌會創造出抽牌者的幻象。"]);
