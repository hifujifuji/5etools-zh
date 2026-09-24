import F from "./_fillidx2.mjs";
const ASI = lv => `在 4 級，以及 ${lv} 級時，夥伴將一項由你選擇的屬性值提升 2，或將兩項由你選擇的屬性值各提升 1。夥伴無法使用此特性將屬性值提升到 20 以上。`;
const ASIS = {"At 4th level and again at 8th, 10th, 12th, 16th, and 19th level, the sidekick increases one ability score of your choice by 2, or the sidekick increases two ability scores of your choice by 1. The sidekick can't increase an ability score above 20 using this feature.": ASI("8、10、12、16 與 19"),
 "At 4th level and again at 8th, 12th, 16th, and 18th level, the sidekick increases one ability score of your choice by 2, or the sidekick increases two ability scores of your choice by 1. The sidekick can't increase an ability score above 20 using this feature.": ASI("8、12、16 與 18"),
 "At 4th level and again at 8th, 12th, 14th, 16th, and 19th level, the sidekick increases one ability score of your choice by 2, or the sidekick increases two ability scores of your choice by 1. The sidekick can't increase an ability score above 20 using this feature.": ASI("8、12、14、16 與 19")};
const EA = {"The sidekick can attack twice, instead of once, whenever it takes the {@action Attack} action on its turn.": "每當夥伴在其回合中採取{@action Attack}動作時，它可以攻擊兩次，而非一次。",
 "The number of attacks increases to three when the sidekick reaches 15th level.": "當夥伴達到 15 級時，攻擊次數增加為三次。",
 "If the sidekick has the Multiattack action, it can use Extra Attack or Multiattack on a turn, not both.": "若夥伴擁有多重攻擊動作，它在一回合中可以使用額外攻擊或多重攻擊，但不能兩者都用。"};
const IND = {"The sidekick can reroll a saving throw that it fails, but it must use the new roll. When it uses this feature, it can't use the feature again until it finishes a long rest.": "夥伴可以重擲一次失敗的豁免檢定，但必須使用新的擲骰結果。當它使用此特性後，在完成長休前無法再次使用。",
 "The sidekick can use this feature twice between long rests starting at 18th level.": "從 18 級開始，夥伴可以在兩次長休之間使用此特性兩次。"};
const EXP = "選擇夥伴的兩項技能熟練。夥伴使用任一所選熟練進行的任何屬性檢定，熟練加值加倍。";
const D = {...ASIS, ...EA, ...IND,
 "If your DM allows the use of feats, the sidekick may instead take a {@5etools feat|feats.html}.": "若你的 DM 允許使用專長，夥伴可以改為選擇一個{@5etools 專長|feats.html}。",
 "Choose two of the sidekick's skill proficiencies. The sidekick's proficiency bonus is doubled for any ability check it makes that uses any of the chosen proficiencies.": EXP,
 "Sidekick Class": "夥伴職業", "{@note Note: this class is intended for NPC {@variantrule sidekicks|tce}.}": "{@note 註：此職業是為 NPC {@variantrule sidekicks|tce|夥伴}設計的。}",
 "Expert Sidekick": "專家夥伴", "Spellcaster Sidekick": "施法者夥伴", "Warrior Sidekick": "戰士夥伴",
 "Helpful": "樂於助人", "Martial Role": "武術角色", "Coordinated Strike": "協同打擊", "Potent Cantrips": "強效戲法", "Battle Readiness": "戰鬥準備", "Improved Defense": "強化防禦",
 "Inspiring Help": "激勵協助", "Empowered Spells": "強化法術", "Extra Attack Improvement": "額外攻擊提升", "Indomitable Improvement": "不屈提升", "Sharp Mind": "敏銳心智",
 "Focused Casting": "專注施法", "Inspiring Help Improvement": "激勵協助提升", "Second Wind Improvement": "回氣提升"};
const BP = (sv, rest) => ({1: `夥伴從下列豁免檢定中選擇一項獲得熟練：${sv}。`, ...rest});
const WPN = "{@filter 簡易或軍用武器|items|source=phb|category=basic|type=martial weapon;simple weapon}";
const m = [];
m[0] = BP("敏捷、智力或魅力", {2: `此外，夥伴從由你選擇的五項技能獲得熟練，並獲得輕甲的熟練。若它是類人生物，或其數據欄中有${WPN}，它也獲得所有簡易武器以及兩種由你選擇之工具的熟練。`});
m[1] = BP("感知、智力或魅力", {2: "此外，夥伴從下列技能中選擇兩項獲得熟練：{@skill Arcana}、{@skill History}、{@skill Insight}、{@skill Investigation}、{@skill Medicine}、{@skill Performance}、{@skill Persuasion}與{@skill Religion}。",
 3: `夥伴獲得輕甲的熟練，若它是類人生物，或其數據欄中有${WPN}，它也獲得所有簡易武器的熟練。`});
m[2] = BP("力量、敏捷或體質", {2: "此外，夥伴從下列技能中選擇兩項獲得熟練：{@skill Acrobatics}、{@skill Animal Handling}、{@skill Athletics}、{@skill Intimidation}、{@skill Nature}、{@skill Perception}與{@skill Survival}。",
 3: `夥伴獲得所有護甲的熟練，若它是類人生物，或其數據欄中有${WPN}，它獲得盾牌以及所有簡易與軍用武器的熟練。`});
m[3] = {1: "夥伴擅長適時提供協助；夥伴可以作為一個附贈動作採取{@action Help}動作。"};
m[4] = {1: "每位戰士在訓練中專注於進攻或防守。從下列選項中選擇一項：", 2: "攻擊者", 3: "夥伴的所有攻擊檢定獲得 +2 加值。", 4: "防禦者",
 5: "當夥伴 5 呎內的一個生物對夥伴以外的目標進行攻擊檢定時，只要夥伴能看見攻擊者，夥伴可以使用其反應使該攻擊檢定具有劣勢。"};
m[5] = {1: "要獲得專家職業，生物的數據欄中必須至少有一種它能說的語言。"};
m[6] = {1: "要獲得施法者職業，生物的數據欄中必須至少有一種它能說的語言。"};
m[8] = {1: "夥伴獲得施展法術的能力。（若該生物已擁有施法特質，此特性取代該特質。）選擇施法者的角色：法師、治療者或奇才。此選擇決定夥伴使用的法術列表與施法屬性，如「施法」表所示。",
 4: "法術列表", 5: "屬性", 10: "奇才",
 13: "施法者表顯示夥伴擁有多少法術欄位來施展其 1 環或更高的施法者法術。要施展這些法術之一，夥伴必須消耗一個該法術環階或更高的欄位。夥伴在完成長休時恢復所有已消耗的法術欄位。",
 14: "已知法術", 15: "夥伴從其法術列表中知曉兩個戲法與一個 1 環法術，由你選擇。以下是各角色 1 級施法者的建議：",
 16: "法師：", 18: "治療者：", 20: "奇才：",
 22: "施法者表的「已知戲法」與「已知法術」欄顯示夥伴何時會學會更多由你選擇的法術。「已知法術」欄中的每個法術都必須是夥伴擁有法術欄位的環階，如表中所示。例如，當夥伴在此職業達到 5 級時，它可以學會一個新的 1 環或 2 環法術。",
 23: "此外，當夥伴在此職業提升一個等級時，你可以選擇它從此職業習得的一個法術，並將其替換為其法術列表中的另一個法術。新法術必須是戲法，或是夥伴擁有法術欄位的環階。",
 25: "夥伴施展這些法術的施法屬性取決於你在「施法」表上的選擇。",
 26: "每當法術提及施法屬性時，夥伴都使用其施法屬性。此外，在設定其所施展法術的豁免 DC 以及以法術進行攻擊檢定時，它使用其施法屬性調整值。",
 30: "夥伴可以依據你在「施法」表上的選擇為其法術使用法器。法師可以使用奧術法器，治療者可以使用聖徽，奇才可以使用奧術法器或{@item musical instrument|PHB}。"};
m[9] = {1: "夥伴的敏捷或機敏讓它能迅速行動。在戰鬥中的回合，它可以作為一個附贈動作採取{@action Dash}、{@action Disengage}或{@action Hide}動作。"};
m[10] = {1: "夥伴可以在其回合中使用一個附贈動作，恢復等同於 {@dice 1d10} + 其在此職業等級的生命值。一旦它使用此特性，必須完成短休或長休後才能再次使用。", 2: "從 20 級開始，夥伴可以在兩次休息之間使用此特性兩次。"};
m[11] = {2: "在 15 級時，再選擇夥伴的兩項技能熟練獲得此好處。"};
m[12] = {1: "夥伴的攻擊檢定在 {@dice d20} 擲出 19 或 20 時即為重擊。"};
m[16] = {1: "夥伴擅長與同伴協同作戰。當夥伴使用樂於助人特性協助盟友攻擊一個生物時，該目標可以位於夥伴 30 呎內，且夥伴在當前回合結束前下一次以攻擊檢定命中該目標時，可以對其造成額外 {@damage 2d6} 傷害。額外傷害的類型與該攻擊造成的傷害類型相同。"};
m[18] = {1: "夥伴可以將其施法屬性調整值加到其以任何戲法造成的傷害上。"};
m[19] = {1: "夥伴在先攻擲骰上具有優勢。"};
m[20] = {1: "由於非比尋常的好運，夥伴擅長躲避危險。當夥伴受到一個允許它進行敏捷豁免檢定以只受一半傷害的效果影響時，若豁免成功，它改為不受傷害，若失敗則只受一半傷害。夥伴陷入{@condition incapacitated}時無法受益於此特性。"};
m[25] = {1: "夥伴的護甲等級增加 1。"};
m[27] = {1: "當夥伴採取{@action Help}動作時，接受協助的生物在 {@dice d20} 擲骰上也獲得 {@dice 1d6} 加值。若該擲骰是攻擊檢定，該生物可以放棄將加值加到檢定上，而在攻擊命中時，將此加值加到對一個目標的攻擊傷害擲骰上。", 2: "在 20 級時，加值增加為 {@dice 2d6}。"};
m[32] = {1: "選擇一個魔法學派。每當夥伴消耗法術欄位施展該學派的法術時，夥伴可以將其施法屬性調整值加到該法術的傷害擲骰或治療擲骰上（若有的話）。"};
m[33] = {1: "夥伴已將其技能磨練到非凡的程度。每當夥伴進行一次包含其完整熟練加值的屬性檢定時，它可以將 {@dice d20} 擲出的 9 或更低視為 10。"};
m[41] = {1: "夥伴從下列豁免檢定中選擇一項獲得熟練：智力、感知或魅力。"};
m[44] = {1: "受到傷害不會打斷夥伴對法術的{@status concentration}。"};
m[45] = {1: "在 20 級時，夥伴的激勵協助所給予的加值骰增加為 {@dice 2d6}。"};
m[46] = {1: "夥伴可以在兩次休息之間使用其回氣特性兩次。"};
F("sk", Array.from({length: 47}, (_, i) => m[i] || {}), D);
F("sk2", [{}, {}, {}, {}], D);
F("cfl-TCE", [{}, {0: "專家夥伴", 1: "專家夥伴", 2: "專家精通特定的任務或知識，以機智取勝而非蠻力。它可能是斥候、樂師、圖書館員、聰明的街頭孩子、狡猾的商人或竊賊。", 3: "專家，由左至右：一名龜人、一名有翼狗頭人與一名鴉人"},
 {0: "施法者夥伴", 1: "施法者夥伴", 2: "成為施法者的夥伴走上魔法之道。夥伴可能是鄉野巫師、祭司、預言者、魔法表演者，或血脈中流淌著魔法的人。", 3: "施法者，由左至右：一名蛙人、一名地精與一名塔巴西人"},
 {0: "戰士夥伴", 1: "戰士夥伴", 2: "戰士夥伴在你身旁戰鬥時，武藝會不斷成長。它可能是士兵、城鎮守衛、受過戰鬥訓練的野獸，或任何其他為戰鬥而磨練的生物。", 3: "戰士，由左至右：一名阿斯莫、一名費爾伯格與一匹狼"}], D);
