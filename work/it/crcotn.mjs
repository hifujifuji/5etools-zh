import F, {NEW} from "./_p.mjs";
import add from "../_addex.mjs";
Object.assign(NEW, {"Earring of Message": "傳訊耳環", "Jewel of Three Prayers (Awakened)": "三禱寶石（覺醒）", "Jewel of Three Prayers (Dormant)": "三禱寶石（休眠）", "Jewel of Three Prayers (Exalted)": "三禱寶石（昇華）",
	"Medal of Muscle": "肌肉獎章", "Medal of the Conch": "海螺獎章", "Medal of the Horizonback": "地平背獸獎章", "Medal of the Maze": "迷宮獎章", "Medal of the Meat Pie": "肉派獎章", "Medal of the Wetlands": "濕地獎章",
	"Medal of Wit": "機智獎章", "Ring of Red Fury": "赤怒戒指", "Ruidium Shield": "瑞迪姆盾", "Teleportation Tablet": "傳送石板"});
add({"Awakened State": "覺醒狀態", "Exalted State": "昇華狀態"}, "i18n/copy-names.json");
add({"In this state, the jewel has received the blessing of Avandra the Change Bringer. Three delicate spires unfurl from the jewel's center, like the buds of flowers opening in the spring. Three lapis lazuli stones rest like dewdrops on these spires.": "在此狀態下，寶石已獲得變革使者阿凡卓的祝福。三根精緻的尖柱從寶石中心展開，如同春天綻放的花苞。三顆青金石如露珠般停在這些尖柱上。",
 "The following benefits of the jewel improve:": "寶石的以下益處獲得提升：", "The bonus that the jewel confers to your AC increases to +2.": "寶石賦予你的 AC 加值提升至 +2。", "Its number of charges increases to 5.": "它的充能數增加至 5。",
 "The jewel gains the following additional properties, which you can use while wearing or holding it:": "寶石獲得以下額外屬性，你可以在穿戴或持握它時使用：",
 "You can expend 1 of the jewel's charges (no action required) to end one of the following conditions on yourself: {@condition grappled}, {@condition paralyzed}, or {@condition restrained}.": "你可以消耗寶石的 1 點充能（不需要動作），結束你自身的以下狀態之一：{@condition grappled}、{@condition paralyzed}或{@condition restrained}。",
 "When another creature you can see within 60 feet of you fails a saving throw, you can expend 1 of the jewel's charges as a reaction to enable that creature to reroll the saving throw, potentially turning a failure into a success. The creature must use the new roll.": "當你 60 呎內另一個你能看見的生物豁免檢定失敗時，你可以使用反應消耗寶石的 1 點充能，讓該生物重擲該次豁免檢定，可能將失敗轉為成功。該生物必須使用新的擲骰結果。",
 "In this state, the jewel has received the blessing of Corellon the Arch Heart. A gleaming emerald surrounded by a halo of gold appears on the jewel.": "在此狀態下，寶石已獲得至高之心柯瑞隆的祝福。一顆被金色光環圍繞、閃閃發亮的綠寶石出現在寶石上。",
 "The bonus that the jewel confers to your AC increases to +3.": "寶石賦予你的 AC 加值提升至 +3。", "Its number of charges increases to 7.": "它的充能數增加至 7。",
 "You gain the ability to breathe water, and you gain a swimming speed equal to your walking speed.": "你獲得在水中呼吸的能力，並獲得等同於步行速度的游泳速度。",
 "Each of your allies within 30 feet of you gains the ability to breathe water and gains a swimming speed equal to its walking speed.": "你 30 呎內的每名盟友都獲得在水中呼吸的能力，並獲得等同於其步行速度的游泳速度。",
 "As a bonus action, you can expend 1 of the jewel's charges to target yourself or one willing creature you can see within 15 feet of yourself. The target teleports to an unoccupied space of your choice within 15 feet of yourself, along with any equipment the target is wearing or carrying. The target appears in a flash of golden radiance, and each creature of your choice within 5 feet of the target's new location must make a {@dc 18} Constitution saving throw. On a failed save, the creature takes {@damage 4d10} radiant damage and is {@condition blinded} until the start of your next turn. On a successful save, the creature takes half as much damage and isn't {@condition blinded}.":
 "作為一個附贈動作，你可以消耗寶石的 1 點充能，以你自己或你 15 呎內一個你能看見的自願生物為目標。目標連同其穿戴或攜帶的任何裝備，傳送到你 15 呎內一個你選擇的未被佔據空間。目標在一陣金色光輝中出現，目標新位置 5 呎內每個你選擇的生物都必須進行一次 {@dc 18} 體質豁免檢定。豁免失敗時，該生物受到 {@damage 4d10} 點光耀傷害，並在你下個回合開始前處於{@condition blinded}狀態。豁免成功時，該生物受到的傷害減半，且不會{@condition blinded}。"});
const MED = "此屬性使用後便無法再次使用，且獎章會成為非魔法物品。";
const RUI = "若你尚未承受瑞迪姆腐化，此豁免失敗時你會受到腐化。";
const m = [
/*0*/ {1: "這只耳環的藍水晶以精緻的銅線纏繞。耳環有 5 點充能。戴著它時，你可以使用一個動作消耗 1 點充能施展{@spell message}法術。耳環每天黎明恢復 {@dice 1d4 + 1} 點已消耗的充能。"},
/*1*/ {},
/*2*/ {1: "三禱寶石是一件分歧遺物（見「分歧遺物」側欄）。在遠古時代，神化者艾里克西安佩戴這個護符，作為他與三位主神——月之織者莎罕妮、變革使者阿凡卓與至高之心柯瑞隆——之間盟約的象徵。寶石被找到時，只有莎罕妮的力量在它休眠的核心中脈動。另外兩位神祇的力量等待著能追隨艾里克西安腳步的一位——或數位——英雄來重新喚醒。",
 3: "在此狀態下，三禱寶石是一個掛在精緻金鍊上、閃閃發亮的金色圓盤。鍊子會以魔法調整大小，成為佩戴它之生物的項鍊。", 4: "在休眠狀態下，寶石具有以下屬性：", 5: "佩戴寶石時，你的 AC 獲得 +1 加值。",
 6: "佩戴或持握寶石時，你可以使用一個動作讓它在 15 呎半徑內發出明亮光線，並在額外 15 呎內發出微光。光芒持續到你將它熄滅為止（不需要動作）。",
 7: "寶石有 3 點充能，每天黎明恢復所有已消耗的充能。持握寶石時，你可以消耗 1 點充能施展{@spell invisibility}法術。"},
/*3*/ {},
/*4*/ {1: "你可以使用一個動作將這枚獎章緊握在掌心。這麼做會讓你在 1 小時內於力量檢定與力量豁免檢定上具有優勢。" + MED},
/*5*/ {1: "當你使用一個動作摩擦這枚獎章時，你在 1 小時內獲得等同於步行速度的游泳速度。" + MED},
/*6*/ {1: "當你即將被一次攻擊命中時，你可以使用你的反應使你的 AC 增加 5，直到你下個回合開始，包括對抗觸發的那次攻擊。你必須佩戴著獎章，並能看見發動觸發攻擊的生物，才能使用此屬性。" + MED},
/*7*/ {1: "當你使用一個動作描繪這枚獎章上刻的迷宮時，你在 1 小時內於感知檢定上具有優勢，並知道任何非魔法路徑或迷宮通往終點的最快路線。" + MED},
/*8*/ {1: "當你使用一個動作將這枚獎章按在嘴上時，你獲得 {@dice 2d4 + 2} 點臨時生命值。" + MED, 2: "具有魔法時，這枚獎章摸起來微溫（彷彿剛出爐），並散發淡淡的烤派皮香氣。"},
/*9*/ {1: "當你使用一個動作描繪這枚獎章的邊緣時，{@quickref difficult terrain||3}在 1 小時內不會讓你消耗額外的移動。" + MED},
/*10*/ {1: "你可以使用一個動作將這枚獎章按在太陽穴上。這麼做會讓你在 1 小時內於智力檢定與智力豁免檢定上具有優勢。" + MED},
/*11*/ {1: "這枚戒指有一道貫穿其中的瑞迪姆條紋。戴著這枚戒指時，你獲得以下益處：", 2: "你可以在水中呼吸。", 3: "你獲得等同於步行速度的游泳速度。",
 5: "作為一個附贈動作，你可以使用戒指獲得以下益處，持續 1 分鐘，或直到你處於{@condition incapacitated}狀態為止：", 7: "當你以攻擊命中時，你可以將你的熟練加值加到傷害擲骰上。",
 8: "困難地形不會讓你消耗額外的移動，且你免疫{@condition paralyzed}與{@condition restrained}狀態。", 9: "在你完成一次長休之前，你無法再次使用戒指的此屬性。",
 11: "當你使用戒指的瑞迪姆狂怒屬性時，你必須進行一次 {@dc 20} 魅力豁免檢定。豁免失敗時，你獲得 1 級{@condition exhaustion}。" + RUI,
 12: "若瑞迪姆被摧毀", 13: "若神化者被殺死或被救贖，艾克森德里亞所有的瑞迪姆都會立即被摧毀，赤怒戒指會變成一枚{@item ring of free action}。"},
/*12*/ {1: "瑞迪姆的卷鬚延伸遍布這面盾牌的金屬表面。當這面盾牌在你身上時，你獲得以下益處：", 3: "你可以在水中呼吸。", 4: "你獲得等同於步行速度的游泳速度。",
 6: "當你持握盾牌時受到心靈傷害，你可以使用你的反應選擇你 30 呎內另一個你能看見的生物。該生物受到你原本會受到的心靈傷害。",
 8: "當你使用盾牌的心靈反射屬性時，你必須進行一次 {@dc 20} 魅力豁免檢定。豁免失敗時，你獲得 1 級{@condition exhaustion}。" + RUI,
 9: "若瑞迪姆被摧毀", 10: "若神化者被殺死或被救贖，艾克森德里亞所有的瑞迪姆都會立即被摧毀，瑞迪姆盾會變成一面{@item +2 shield}。"},
/*13*/ {1: "這塊黏土石板長八吋、寬四吋、厚半吋。上面刻著一座永久傳送法陣的符印序列。研究該序列 10 分鐘的生物可以進行一次 {@dc 21} 智力（{@skill Arcana}）檢定，成功時得知法陣的目的地。",
 2: "你可以使用一個動作將石板折成兩半，使它化為塵土。若石板在與其上刻有符印序列之傳送法陣位於同一個存在位面時被折斷，一座直徑 10 呎、發著藍光的傳送法陣會出現在你 30 呎內一個你選擇的未被佔據地面空間。這座傳送法陣具有以{@spell teleportation circle}法術創造之法陣的特徵，但它會連接到石板上所刻符印序列的傳送法陣。",
 3: "石板創造的傳送法陣會在你下個回合結束時消失。"},
];
F("it-crcotn", m);
