import F, {NEW} from "./_p.mjs";
import add from "../_addex.mjs";
Object.assign(NEW, {"Arcane Battery": "奧術電池", "Brooch of the Elements": "元素胸針", "Fork of Eddy Summoning": "召喚渦流音叉", "Hat of Vortexes": "漩渦帽", "Magen Handbell": "魔像手鈴",
	"Mask of Changed Appearance": "易容面具", "Mythallar Bracelet": "秘法核手環", "Mythallar Cloak": "秘法核斗篷",
	"Book of Vile Darkness (Variant)": "邪惡黑暗之書（變體）", "Constantori's Portrait": "康斯坦托里的肖像", "Shard of Xeluan": "澤魯安碎片",
	"Black Dragon Mask": "黑龍面具", "Dragongleam": "龍輝", "Hazirawn": "哈齊朗", "Insignia of Claws": "利爪徽記", "Tankard of Plenty": "豐饒酒杯", "Wand of Winter": "寒冬魔杖",
	"Boots of the Winding Path": "蜿蜒之路靴", "Helm of Awareness": "警覺頭盔", "Manifold Tool": "萬用工具", "Mind Sharpener": "心靈磨刀石", "Repulsion Shield": "排斥之盾", "Spell-Refueling Ring": "法術補充戒指"});
for (const [k, v] of Object.entries({"Black Sapphire": "黑藍寶石", Diamond: "鑽石", Jacinth: "紅鋯石", "Rainbow Pearl": "彩虹珍珠", Ruby: "紅寶石"})) NEW[`Shard Solitaire (${k})`] = `碎界獨石（${v}）`;
add({"Circle of Death": "死亡法陣", "Condition Immunities": "狀態免疫", "Evil Presence": "邪惡存在"}, "i18n/copy-names.json");
add({"The Book of Vile Darkness has the following properties:": "《邪惡黑暗之書》具有以下屬性：",
 "While attuned to the book, you can cast {@spell circle of death} (save {@dc 20}) from it as an action. After you cast the spell, roll a {@dice d6}. On a roll of 1-5, you can't use this property again until the next dawn.": "與這本書同調時，你可以使用一個動作從它施展{@spell circle of death}（豁免 {@dc 20}）。施展該法術後，擲一顆 {@dice d6}。若擲出 1–5，在下一個黎明之前你無法再次使用此屬性。",
 "While attuned to the book, you can't be {@condition charmed} or {@condition frightened}.": "與這本書同調時，你無法被{@condition charmed}或{@condition frightened}。",
 "The book houses an evil spirit that is hostile toward you. When you become attuned to the book, the spirit tries to leave the book and enter your body. If you fail a {@dc 20} Charisma saving throw, it succeeds, and you become an NPC under the DM's control until the intruding spirit is banished using magic such as the {@spell dispel evil and good} spell. The banished spirit returns to the book.": "這本書中住著一個對你懷有敵意的邪惡靈魂。當你與這本書同調時，靈魂會試圖離開書本進入你的身體。若你的 {@dc 20} 魅力豁免檢定失敗，它便會成功，你會成為由 DM 控制的 NPC，直到入侵的靈魂被{@spell dispel evil and good}法術等魔法放逐為止。被放逐的靈魂會回到書中。"});
const MM = "你的生命值上限";
const nf = [
 {1: "這顆光滑的橢圓形石頭上刻著微微發光的魔法符號。持握電池時，你可以執行一個{@action Magic|XPHB}動作，用電池觸碰一件魔法物品。若該魔法物品通常每天會恢復已消耗的充能，它會立即恢復 {@dice 1d4 + 1} 點已消耗的充能，而電池則失去魔法。"},
 {1: "這枚蝴蝶形胸針的中央寶石旋轉著五彩斑斕的虹彩。", 2: "胸針有 3 點充能，每天黎明恢復所有已消耗的充能。作為一個{@variantrule Reaction|XPHB|反應}，當你 60 呎內一個你能看見的生物以攻擊檢定命中目標並造成傷害時，你可以消耗 1 點充能，將該次攻擊造成的一種傷害類型改為以下之一：酸蝕、寒冷、火焰、閃電、毒素或雷鳴。"},
 {1: "這支微型音叉劈啪作響著無害的五彩魔法能量。作為一個{@action Magic|XPHB}動作，你可以用音叉敲擊任何物體，召喚一個{@creature Eldritch Eddy|NF}（見附錄 B）。渦流會出現在盡可能靠近你的一個未被佔據空間。渦流對你與你的盟友{@variantrule Friendly [Attitude]|XPHB|友善}，並服從你的命令。若你沒有下令，渦流會保護自己不受攻擊者傷害，但不採取其他行動。它會在你的{@variantrule Initiative|XPHB|先攻}順序上緊接在你之後進行它的回合。渦流在 1 小時後、死亡時，或你使用一個{@variantrule Bonus Action|XPHB|附贈動作}解散它時消失。在下一個黎明之前，無法再以此方式使用音叉。"},
 {1: "這頂帽子有 3 點充能，每天黎明恢復所有已消耗的充能。持握帽子時，你可以執行一個{@action Magic|XPHB}動作並消耗 1 點充能，從帽子釋放一道魔法漩渦。漩渦填滿從你發出的一個 10 呎{@variantrule Cube [Area of Effect]|XPHB|立方體}，持續 1 小時。漩渦存在期間，其區域為{@variantrule Difficult Terrain|XPHB|困難地形}。",
  2: "你在創造漩渦時決定它的視覺細節。例如，漩渦可能是五彩繽紛或閃閃發亮的。"},
 {1: "持握這個黃銅手鈴時，你可以執行一個{@action Magic|XPHB}動作搖響它，召喚一個{@creature Terran Magen|NF}（見附錄 B）。魔像出現在你 30 呎內一個你選擇的未被佔據空間，理解你的語言，服從你的命令，並在你的{@variantrule Initiative|XPHB|先攻}順序上緊接在你之後進行它的回合。魔像在 1 小時後、死亡時，或你使用一個{@variantrule Bonus Action|XPHB|附贈動作}解散它時消失。手鈴在 {@dice 1d6} 天內無法再以此方式使用。",
  3: "每當這件物品召喚的魔像以浴血狀態開始它的回合時，擲 {@dice 1d6}。若擲出 6，魔像會陷入狂暴。",
  4: "狂暴時，魔像不再服從你的命令，且你無法以{@variantrule Bonus Action|XPHB|附贈動作}解散它。在它的每個回合，狂暴的魔像會攻擊它能看見的最近生物。若沒有生物近到能讓魔像移動過去攻擊，魔像會攻擊一件物體。魔像會保持狂暴，直到它消失，或直到持握手鈴的生物執行一個{@action Influence|XPHB}動作，並成功通過一次 DC 15 魅力（{@skill Persuasion|XPHB}）檢定重新控制魔像為止。"},
 {1: "這副鑲有寶石的面具有 3 點充能。作為一個{@action Magic|XPHB}動作，你可以消耗 1 點充能改變你臉部的外觀。你無法讓自己看起來像另一個人，但你可以撫平或加深皺紋、美白牙齒、隱藏或突顯眼袋，或進行其他細微的外觀改變。當你的外觀被改變時，面具處於{@condition Invisible|XPHB|隱形}狀態。你改變後的外觀持續 1 小時。",
  3: "面具每天黎明恢復 {@dice 1d3} 點已消耗的充能。若你消耗最後 1 點充能，擲 {@dice 1d20}。若擲出 1，面具會在一團無害、香甜的粉末中爆炸並被摧毀。"},
 {1: "這條皮手環上串著三顆以退役秘法核製成的小水晶珠。作為一個{@action Magic|XPHB}動作，你可以從手環上摘下一顆珠子，在 1 分鐘內於力量（{@skill Athletics|XPHB}）檢定上獲得{@variantrule Advantage|XPHB|優勢}。", 2: "珠子被摘下後會立即消失。三顆珠子都被摘下後，手環便失去魔法。"},
 {1: "這件電光藍的斗篷上縫著許多水晶，它們是一個退役秘法核的碎片。斗篷有 10 點充能，每天黎明恢復 {@dice 1d10} 點已消耗的充能。",
  2: "穿著斗篷時，你可以執行一個{@variantrule Bonus Action|XPHB|附贈動作}並消耗 1 點充能啟動斗篷的魔法。魔法持續 1 分鐘，或直到你提早結束它（不需要動作）。",
  3: "斗篷的魔法啟動時，你獲得 30 呎的{@variantrule Fly Speed|XPHB|飛行速度}並可以懸浮。此外，在你的每個回合一次，當你以攻擊檢定命中一個生物並造成傷害時，你可以讓目標額外受到 {@damage 1d4} 點光耀傷害。若斗篷的魔法結束時你仍在空中，你會墜落。"}];
F("it-nf", nf);
const SS1 = "這顆寶石內含一道不穩定的異次元裂隙。它的刻面上佈滿似乎會自行移動的虹彩紋路。已知的碎界獨石有五種，每種都是不同的寶石，如「碎界獨石種類」表所示。";
const SS3 = "作為一個附贈動作，穿戴或持握碎界獨石時，你可以將你自己連同你穿戴或攜帶的任何物品，傳送到你 30 呎內一個你能看見的未被佔據空間。";
const SS4 = "使用此屬性時，你可以汲取寶石異次元裂隙的不穩定力量，將傳送距離增加至多 30 呎，但若你使用裂隙步傳送超過 30 呎，你必須在傳送後立即成功通過一次 {@dc 16} 體質豁免檢定，否則受到 {@damage 3d10} 點力場傷害。";
const SS6 = (g, sp) => `寶石有 6 點充能，每天黎明恢復 {@dice 1d6} 點已消耗的充能。作為一個動作，你可以消耗所需數量的充能施展寶石的一道法術，不需要材料構材（豁免 {@dc 16}）。${g}碎界獨石可以用來施展以下法術：{@spell banishment}（3 點充能；目標在法術持續時間內被放逐到寶石的異次元空間）、{@spell mirror image}（1 點充能）、${sp}。`;
const SS = (g, sp) => ({1: SS1, 3: SS3, 4: SS4, 6: SS6(g, sp)});
const kf = [{},
 {1: "這幅由著名畫家德凱西·關所繪的畫作描繪了康斯坦托里，一位美麗的朝臣，他收取了驚人的酬勞擔任德凱西的模特兒。康斯坦托里的真實外貌是否與畫作相符，至今仍有爭議。這幅肖像是已故的犯罪首領黛雅妮·葛瑞斯索恩委託繪製的數幅畫作之一，她經常將魔法畫作作為禮物送給她最尊敬的同夥。",
  3: "康斯坦托里的肖像是一件具有知覺的守序邪惡物品，智力 14、感知 12、魅力 8。它能在 120 呎範圍內聽見聲音，並具有範圍 60 呎的{@sense darkvision}，但它看不見自己背後的任何東西。",
  4: "這幅畫能如同活人般以通用語、龍語與精靈語交談，不過康斯坦托里的嘴巴不會動。每當肖像的聽覺範圍內有對話發生時，這幅畫會熱切地蒐集秘密、說出秘密者的名字、重大事件或任何政治對話。",
  6: "康斯坦托里的肖像要求多、傲慢又虛榮。它不喜歡被遮蓋或被放在看不見的地方，並會大聲譴責任何試圖將它從金箔畫框中取出的人。",
  8: "這幅畫的主要目的是觀察並記住對話。在過去數十年間，康斯坦托里的肖像默默觀察了無數對話，如今擁有無法計量的知識——從犯罪陰謀到秘密通關密語無所不包。由 DM 決定這幅畫知道什麼、不知道什麼。",
  9: "與這幅畫同調時，只要你與畫位於同一個存在位面，你可以使用一個動作以心靈感應跨越任何距離聯繫它。然而，這幅畫無法以心靈感應聯繫你。維持與畫的心靈感應聯繫需要你的{@status concentration}（如同{@status concentration||專注}於一道法術）。",
  11: "與這幅畫同調時，你可以命令它守衛其所在位置，對抗一或多個你指認為畫之敵人的生物。這幅畫會執行此功能，直到你命令它停止，或直到你與畫的同調結束為止。",
  12: "這幅畫有 3 點充能。當一個被畫認定為敵人的生物在畫能看見的空間開始其回合時，畫會消耗 1 點充能施展{@spell magic missile}（3 發飛彈），以該生物為目標。這幅畫每天黎明恢復所有已消耗的充能。",
  13: "這幅畫是一件小型物體，AC 為 12，有 20 點生命值，並免疫毒素傷害。連同金箔畫框，這幅畫重 15 磅。若畫至少有 1 點生命值並成為{@spell mending}法術的目標，它恢復 {@dice 2d6} 點生命值。"},
 {1: "這塊 1 呎長的黑曜石碎片冰冷的表面下有銀與金的紋路。", 3: "持握這塊碎片時，你可以將它作為施法法器，且它使你的法術攻擊檢定獲得 +1 加值。",
  5: "當碎片在你身上時，你的力量值增加 4。碎片無法將你的力量值提升到 22 以上。",
  7: "與此物品同調會使它的詛咒延伸到你身上。你會保持受詛咒狀態，直到你成為{@spell remove curse}法術或類似魔法的目標，或直到碎片被重新接回澤魯安{@condition petrified}的心臟為止。",
  8: "碎片的詛咒會讓你遭遇不幸。當你在攻擊檢定、屬性檢定或豁免檢定上擲出 1 時，在「碎片不幸」表上擲骰決定不幸的內容。只要此不幸持續，其他碎片不幸便不會降臨在你身上。",
  11: "你不小心被碎片割傷，在下一個黎明之前處於{@condition poisoned}狀態。", 12: "你看見一場古代災難的幻象——一座美麗的城市受到崩塌的山脈與噴發的火山威脅——並在你下個回合結束前處於{@condition stunned}狀態。",
  13: "有幾秒鐘，你腳下的地面在搖晃。你與你 10 呎內的每個生物都必須成功通過一次 {@dc 16} 敏捷豁免檢定，否則被擊倒為{@condition prone}。",
  14: "碎片釋放出三道發光的魔法力場飛鏢，以你 30 呎內一個隨機生物為目標。若沒有這樣的目標，你便成為目標。每道飛鏢自動命中，對目標造成 3（{@damage 1d4 + 1}）點力場傷害。",
  15: "在下一個黎明之前，智力值 3 或更低的野獸對你懷有敵意。", 16: "你似乎諸事不順。在下一個黎明之前，你在屬性檢定上具有劣勢。"},
 SS("黑藍寶石", "{@spell blight}（3 點充能）、{@spell finger of death}（6 點充能）"), SS("鑽石", "{@spell ice storm}（3 點充能）、{@spell simulacrum}（6 點充能；法術創造的複製品具有與其所模仿之生物相同的生命值）"),
 SS("紅鋯石", "{@spell fireball}（2 點充能）、{@spell fire storm}（6 點充能）"), SS("彩虹珍珠", "{@spell prismatic spray}（6 點充能）、{@spell water breathing}（2 點充能）"), SS("紅寶石", "{@spell fly}（2 點充能）、{@spell teleport}（6 點充能）")];
F("it-kftgv", kf);
const hd = [
 {1: "這副帶角的光亮烏木面具有角，並呈現骷髏般的面貌。面具會改變形狀以配合與它同調的佩戴者。戴著面具並與它同調時，你可以使用以下屬性。",
  3: "你具有酸蝕傷害抗性。若你已經從其他來源獲得酸蝕傷害抗性，你改為獲得酸蝕傷害免疫。若你已經從其他來源獲得酸蝕傷害免疫，你恢復等於你受到之任何酸蝕傷害一半的生命值。",
  5: "當你沒有穿著護甲時，你可以將你的魅力加值加到護甲等級上。", 7: "若你擁有需要休息才能恢復的吐息武器，它改為具有充能 6 的恢復方式。",
  9: "你獲得半徑 60 呎的{@sense darkvision}，若你已經擁有該感官，則額外增加 60 呎的{@sense darkvision}。每天一次，你可以獲得範圍 30 呎的{@sense blindsight}，持續 5 分鐘。",
  11: "你能說並理解龍語。你在對黑龍進行的任何魅力檢定上也具有優勢。", 13: "（每日 1 次）若你豁免檢定失敗，你可以選擇改為成功。", 15: "你可以在水下呼吸。"},
 {1: "這支矛附有 10 點充能的{@spell daylight}法術，供在暮色或黑暗的森林灌木叢中使用。命令語「提雅瑪特之眼閃耀」以龍語符文寫在矛的護手上。"},
 {1: "哈齊朗是一把具有知覺（中立邪惡）的巨劍，能說通用語與耐瑟瑞爾語。即使你沒有與這把劍同調，你以這把武器進行的攻擊檢定與傷害擲骰也獲得 +1 加值。若你沒有與哈齊朗同調，你以這把武器命中時額外造成 {@damage 1d6} 點黯蝕傷害。",
  3: "與這把武器同調時，它的攻擊與傷害擲骰加值提升至 +2，命中時額外造成 {@damage 2d6} 點黯蝕傷害（而非 {@dice 1d6}）。",
  5: "哈齊朗有 4 點充能可用來施展法術。只要這把劍與你同調且你手持它，你可以施展{@spell detect magic}（1 點充能）、{@spell detect evil and good}（1 點充能）或{@spell detect thoughts}（2 點充能）。每晚午夜，哈齊朗恢復 {@dice 1d4} 點已消耗的充能。",
  7: "與這把武器同調時，任何被你以哈齊朗命中的生物在 1 分鐘內無法恢復生命值。目標可以在它每個回合結束時進行一次 {@dc 15} 體質豁免檢定，成功時提早結束此效果。"},
 {1: "當你進入戰鬥時，龍之教團徽記上的寶石會閃耀紫色光芒，強化你天生的拳頭或天生武器。", 2: "佩戴徽記時，你以徒手打擊與天生武器進行的攻擊檢定與傷害擲骰獲得 +1 加值。這類攻擊視為魔法攻擊。"},
 {1: "這只金色啤酒杯飾有跳舞的矮人與穀物圖案。握住把手時說出命令語（「伊勒法恩」），會讓酒杯裝滿三品脫濃郁的矮人麥酒。此力量每天最多可以使用三次。"},
 {1: "這根魔杖的外觀與觸感都像一根冰柱。你必須與魔杖同調才能使用它。",
  2: "魔杖有 7 點充能，用來為其中的法術提供能量。手持魔杖時，即使你無法施法，你也可以使用你的動作從魔杖施展以下法術之一：{@spell ray of frost}（不消耗充能，或消耗 1 點充能以 5 級施展；遠程法術攻擊命中 +5）、{@spell sleet storm}（3 點充能；法術豁免 {@dc 15}）或{@spell ice storm}（4 點充能；法術豁免 {@dc 15}）。不需要任何構材。魔杖每天黎明恢復 {@dice 1d6 + 1} 點已消耗的充能。若你消耗魔杖的最後 1 點充能，擲一顆 {@dice d20}。若擲出 20，魔杖會融化並永遠被摧毀。"}];
F("it-hotdq", hd);
const ef = [
 {1: "穿著這雙靴子時，你可以執行一個{@variantrule Bonus Action|XPHB|附贈動作}，傳送至多 15 呎到一個你能看見的未被佔據空間。你必須在當前回合的某個時刻曾佔據該空間。"},
 {1: "戴著這頂頭盔時，你在{@variantrule Initiative|XPHB|先攻}擲骰上具有{@variantrule Advantage|XPHB|優勢}。"},
 {1: "這件工具的形式是一把扳手、一支螺絲起子或另一種基本工具。作為一個{@action Magic|XPHB}動作，你可以觸碰此物品，將它變成一種你選擇的{@item Artisan's Tools|XPHB}。無論工具呈現何種形式，你使用它時都熟練它。"},
 {1: "此物品有 4 點充能。當你為維持{@status Concentration|XPHB|專注}而進行的體質豁免檢定失敗時，你可以執行一個{@variantrule Reaction|XPHB|反應}並消耗此物品的 1 點充能，改為成功。此物品每天黎明恢復 {@dice 1d4} 點已消耗的充能。"},
 {1: "持用這面盾牌時，你的{@variantrule Armor Class|XPHB|護甲等級}獲得 +1 加值。", 2: "這面盾牌有 4 點充能。持握它時，當你 5 呎內一個大型或更小的生物以近戰攻擊檢定命中你，你可以執行一個{@variantrule Reaction|XPHB|反應}消耗盾牌的 1 點充能，將攻擊者直直推開至多 15 呎。盾牌每天黎明恢復 {@dice 1d4} 點已消耗的充能。"},
 {1: "戴著這枚戒指時，你可以使用一個{@variantrule Bonus Action|XPHB|附贈動作}恢復一個已消耗的法術位。恢復的法術位可以是 3 環或更低。使用後，戒指在下一個黎明之前無法再次使用。"}];
F("it-efa", ef);
