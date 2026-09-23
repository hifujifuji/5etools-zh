import fill from "./_tcefill.mjs";
const M = {Detection: "偵測", Finding: "尋覓", Handling: "馴獸", Healing: "治療", Hospitality: "款待", Making: "製造", Passage: "通行", Scribing: "書記", Sentinel: "哨兵", Shadow: "陰影", Storm: "暴風", Warding: "守護"};
const mk = m => `${M[m]}印記`;
const ROLL = (a, b) => `進行${a}時，你可以擲 {@dice 1d4} 並將結果加到該屬性檢定上。`;
const INT = i => ["增強直覺", `當你使用{@feat Mark of ${i[0]}|EFA}專長的「${i[1]}」益處時，你可以改擲 {@dice 1d6} 而非 {@dice 1d4}。`];
const CAST1 = (sp, lvl) => `你總是準備著${sp}法術。你可以不消耗法術欄位施展它一次，並在完成{@variantrule Long Rest|XPHB}時恢復以此方式施展它的能力。你也可以使用你擁有的${lvl ? "適當環階" : "任何"}法術欄位施展它。智力、感知或魅力為你施展此法術的施法屬性（於選擇此專長時決定）。`;
const CAST2 = (a, b, lvl) => `你總是準備著${a}與${b}法術。你可以不消耗法術欄位各施展它們一次，並在完成{@variantrule Long Rest|XPHB}時恢復以此方式施展它們的能力。你也可以使用你擁有的${lvl ? "適當環階" : "任何"}法術欄位施展這些法術。智力、感知或魅力為你施展這些法術的施法屬性（於選擇此專長時決定）。`;
const LV3 = sp => `當你達到角色等級 3 時，你也總是準備著${sp}法術，並能以同樣的方式施展它。`;
const SPELLS = m => ["印記法術", `若你擁有施法或契約魔法職業特性，「${mk(m)}法術」表中的法術會加入該特性的法術列表。`, `${mk(m)}法術`, "法術環階", null, "=", "=", "=", "="];
const G = "高等";
fill("feat-EFA", [
["異常龍紋", null, "異常堅韌", "當你的體質豁免檢定失敗時，你可以執行一個{@variantrule Reaction|XPHB}擲 {@dice 1d4}，並將結果加到該豁免上，可能使失敗轉為成功。使用此益處後，直到你完成{@variantrule Long Rest|XPHB}前都無法再次使用。",
 "異常魔法", "你知道一道{@filter 術士法術列表中的自選戲法|spells|level=0|class=Sorcerer}。此外，從該法術列表中選擇一道 1 環法術。你總是準備著該法術。你可以不消耗法術欄位施展它一次，並在完成{@variantrule Short Rest|XPHB|短休}或{@variantrule Long Rest|XPHB}時恢復以此方式施展它的能力。你也可以使用你擁有的任何法術欄位施展此法術。體質為你施展此法術的施法屬性。",
 "異常湧動", "當你施展來自此專長的 1 環法術時，你可以消耗一顆{@variantrule Hit Point Dice|XPHB}並擲骰。若擲出偶數，你獲得等同於擲骰結果的{@variantrule Temporary Hit Points|XPHB}。若擲出奇數，你 30 呎內的一個生物（不包括你）受到等同於擲骰結果的力場傷害。若範圍內沒有其他生物，則由你承受該傷害。"],
["西伯瑞斯的恩賜", null, "異常魔法", "從{@filter 術士法術列表|spells|class=Sorcerer|level=0;1;2;3;4;5;6;7;8}中選擇一道 8 環或更低環的法術，或從「西伯瑞斯龍紋法術」表中選擇一道法術（若你想將法術與某種龍紋連結，表中附有建議的龍紋）。你總是準備著該法術。你可以不消耗法術欄位或法術成分施展它一次，並在完成{@variantrule Short Rest|XPHB|短休}或{@variantrule Long Rest|XPHB}時恢復以此方式施展它的能力。你也可以使用你擁有的適當環階法術欄位施展此法術。智力、感知或魅力為你施展此法術的施法屬性（於獲得此專長時決定）。",
 "西伯瑞斯龍紋法術", null, "建議龍紋", M.Handling, null, M.Making, M.Hospitality, M.Warding, null, M.Passage, null, M.Healing, M.Scribing, M.Finding, M.Detection],
["高等異常印記", null, "強化堅韌", "當你使用異常龍紋專長的「異常堅韌」益處時，你可以改擲 {@dice 1d6} 而非 {@dice 1d4}。此外，現在每當你完成{@variantrule Short Rest|XPHB|短休}或{@variantrule Long Rest|XPHB}時，都會恢復「異常堅韌」的使用次數。",
 "靈感印記", "當你施展戲法時，你可以擲一或兩顆未消耗的{@variantrule Hit Point Dice|XPHB}。你獲得等同於擲骰結果加上你體質調整值的{@variantrule Temporary Hit Points|XPHB}，且你 30 呎內一個由你選擇的生物（不包括你）受到等同於擲骰結果的力場傷害。之後那些骰子便被消耗。",
 "你可以使用此益處的次數等同於你的{@variantrule Proficiency|XPHB|熟練加值}，並在完成{@variantrule Long Rest|XPHB}時恢復所有已消耗的使用次數。"],
[G + mk("Detection"), null, ...INT(["Detection", "演繹直覺"]), "共享偵測", "當你使用{@feat Mark of Detection|EFA}專長的「魔法偵測」益處不消耗法術欄位施展{@spell See Invisibility|XPHB}時，你可以選擇你 30 呎內一個你能看見的生物。該生物在法術持續期間也獲得該法術的益處。"],
[G + mk("Finding"), null, ...INT(["Finding", "獵人直覺"]), "強化尋覓", "當你使用{@feat Mark of Finding|EFA}的「尋覓者魔法」益處不消耗法術欄位施展{@spell Hunter's Mark|XPHB}時，法術的射程加倍，且你可以調整該法術，使目標在持續期間無法受益於{@condition Invisible|XPHB}狀態。"],
[G + mk("Handling"), null, ...INT(["Handling", "野性直覺"]), "強化馴獸", "騎乘時，當你以近戰攻擊檢定命中你坐騎 5 呎內的目標後，你的坐騎可以立即執行一個{@variantrule Reaction|XPHB}，移動至多其{@variantrule Speed|XPHB}，或執行{@action Attack|XPHB}動作但只進行一次攻擊（由你選擇）。",
 "壓制動物", "作為一個{@action Magic|XPHB}動作，你對你 30 呎內一個你能看見的野獸或怪獸施加支配力。目標必須通過一次感知豁免檢定（DC 等於 8 加上你的感知調整值與{@variantrule Proficiency|XPHB|熟練加值}），否則處於{@condition Frightened|XPHB}狀態直到你的下個回合開始。你可以使用此益處的次數等同於你的{@variantrule Proficiency|XPHB|熟練加值}，並在完成{@variantrule Long Rest|XPHB}時恢復所有已消耗的使用次數。"],
[G + mk("Healing"), null, ...INT(["Healing", "醫療直覺"]), "強化治療", "你現在可以使用{@feat Mark of Healing|EFA}專長的「治療之觸」益處，不消耗法術欄位施展{@spell Cure Wounds|XPHB}，次數等同於你的{@variantrule Proficiency|XPHB|熟練加值}，並在完成{@variantrule Long Rest|XPHB}時恢復所有已消耗的使用次數。此外，當你施展{@spell Cure Wounds|XPHB}並擲骰決定恢復的{@variantrule Hit Points|XPHB}時，可以將擲出的任何 1 或 2 視為 3。"],
[G + mk("Hospitality"), null, ...INT(["Hospitality", "賓至如歸"]), "強化款待", "當你施展{@spell Purify Food and Drink|XPHB}時，你可以調整該法術，使其不產生一般效果，而是讓你 30 呎內每個由你選擇的生物恢復精神。每個受影響生物的{@condition Exhaustion|XPHB}等級降低 1，並獲得等同於你{@variantrule Proficiency|XPHB|熟練加值}加上你智力、感知或魅力調整值（於選擇此專長時決定）的{@variantrule Temporary Hit Points|XPHB}。以此益處調整法術後，直到你完成{@variantrule Long Rest|XPHB}前都無法再次這麼做。"],
[G + mk("Making"), null, ...INT(["Making", "工匠直覺"]), "強化製造", "當你使用{@feat Mark of Making|EFA}專長的「法術鍛造」益處不消耗法術欄位施展{@spell Magic Weapon|XPHB}時，你以其 3 環版本施展該法術。"],
[G + mk("Passage"), null, ...INT(["Passage", "直覺行動"]), "強化通行", "當你使用{@feat Mark of Passage|EFA}專長的「魔法通行」益處不消耗法術欄位施展{@spell Misty Step|XPHB}時，你也可以在傳送前選擇你 30 呎內至多兩個你能看見的自願生物。每個目標接著可以執行一個{@variantrule Reaction|XPHB}，也傳送至多 30 呎到一處它能看見的未被佔據空間。"],
[G + mk("Scribing"), null, ...INT(["Scribing", "天賦書記"]), "靈感書寫", "當你施展{@spell Comprehend Languages|XPHB}時，你可以調整該法術，使其涵蓋你 30 呎內至多三個你能看見的自願生物。每個被選擇的生物在持續期間也獲得該法術的益處。此外，在法術持續期間，只要你與被選擇的生物彼此相距 1 哩內，就能互相以心靈感應交流。以此益處調整法術後，直到你完成{@variantrule Long Rest|XPHB}前都無法再次這麼做。"],
[G + mk("Sentinel"), null, ...INT(["Sentinel", "哨兵直覺"]), "強化哨兵", "當你使用{@feat Mark of Sentinel|EFA}專長的「警戒守護者」益處時，你也可以在同一個{@variantrule Reaction|XPHB}中以武器或{@variantrule Unarmed Strike|XPHB}進行一次攻擊。"],
[G + mk("Shadow"), null, ...INT(["Shadow", "狡黠直覺"]), "強化陰影", "當你使用{@feat Mark of Shadow|EFA}專長的「塑造陰影」益處不消耗法術欄位施展{@spell Invisibility|XPHB}時，你以其 3 環版本施展該法術。"],
[G + mk("Storm"), null, ...INT(["Storm", "駕風者直覺"]), "強化暴風", "當你使用{@feat Mark of Storm|EFA}專長的「風暴魔法」益處不消耗法術欄位施展{@spell Gust of Wind|XPHB}時，你在法術持續期間也獲得 60 呎的{@variantrule Fly Speed|XPHB}。"],
[G + mk("Warding"), null, ...INT(["Warding", "守護者直覺"]), "強化守護", "當一個生物對你或你 30 呎內一個你能看見的生物進行攻擊檢定時，你可以執行一個{@variantrule Reaction|XPHB}，使該檢定具有{@variantrule Disadvantage|XPHB}。你可以使用此益處的次數等同於你的{@variantrule Proficiency|XPHB|熟練加值}，並在完成{@variantrule Long Rest|XPHB}時恢復所有已消耗的使用次數。"],
[mk("Detection"), null, "演繹直覺", ROLL("智力（{@skill Investigation|XPHB}）或感知（{@skill Insight|XPHB}）檢定"), "魔法偵測", CAST2("{@spell Detect Magic|XPHB}", "{@spell Detect Poison and Disease|XPHB}", true), LV3("{@spell See Invisibility|XPHB}"), ...SPELLS("Detection")],
[mk("Finding"), null, "獵人直覺", ROLL("感知（{@skill Perception|XPHB}或{@skill Survival|XPHB}）檢定"), "尋覓者魔法", CAST1("{@spell Hunter's Mark|XPHB}", true), LV3("{@spell Locate Object|XPHB}"), ...SPELLS("Finding")],
[mk("Handling"), null, "野性直覺", ROLL("智力（{@skill Nature|XPHB}）或感知（{@skill Animal Handling|XPHB}）檢定"), "原初連結", CAST2("{@spell Animal Friendship|XPHB}", "{@spell Speak with Animals|XPHB}", false),
 "怪獸連結", "當你達到角色等級 3 時，若怪獸的智力值為 3 或更低，你施展{@spell Animal Friendship|XPHB}或{@spell Speak with Animals|XPHB}時可以將其作為目標。", ...SPELLS("Handling")],
[mk("Healing"), null, "醫療直覺", ROLL("感知（{@skill Medicine|XPHB}）檢定或使用{@item Herbalism Kit|XPHB}的屬性檢定"), "治療之觸", CAST1("{@spell Cure Wounds|XPHB}", true), LV3("{@spell Lesser Restoration|XPHB}"), ...SPELLS("Healing")],
[mk("Hospitality"), null, "賓至如歸", ROLL("魅力（{@skill Persuasion|XPHB}）檢定，或使用{@item Brewer's Supplies|XPHB}或{@item Cook's Utensils|XPHB}的屬性檢定"), "旅店主人的魔法", CAST2("{@spell Purify Food and Drink|XPHB}", "{@spell Unseen Servant|XPHB}", true), LV3("{@spell Calm Emotions|XPHB}"), ...SPELLS("Hospitality")],
[mk("Making"), null, "工匠直覺", ROLL("智力（{@skill Arcana|XPHB}）檢定或使用{@item Artisan's Tools|XPHB}的屬性檢定"), "法術鍛造", "你知道{@spell Mending|XPHB}戲法。你也總是準備著{@spell Magic Weapon|XPHB}法術。你可以不消耗法術欄位施展它一次，並在完成{@variantrule Long Rest|XPHB}時恢復以此方式施展它的能力。你也可以使用你擁有的任何法術欄位施展它。智力、感知或魅力為你施展這些法術的施法屬性（於選擇此專長時決定）。", ...SPELLS("Making")],
[mk("Passage"), null, "信使之速", null, "直覺行動", ROLL("力量（{@skill Athletics|XPHB}）或敏捷（{@skill Acrobatics|XPHB}）檢定"), "魔法通行", CAST1("{@spell Misty Step|XPHB}", false), ...SPELLS("Passage")],
[mk("Scribing"), null, "天賦書記", ROLL("智力（{@skill History|XPHB}）檢定或使用{@item Calligrapher's Supplies|XPHB}的屬性檢定"), "書記的洞見", "你知道{@spell Message|XPHB}戲法。你也總是準備著{@spell Comprehend Languages|XPHB}法術。你可以不消耗法術欄位施展它一次，並在完成{@variantrule Long Rest|XPHB}時恢復以此方式施展它的能力。你也可以使用你擁有的適當環階法術欄位施展它。智力、感知或魅力為你施展此法術的施法屬性（於選擇此專長時決定）。", LV3("{@spell Magic Mouth|XPHB}"), ...SPELLS("Scribing")],
[mk("Sentinel"), null, "哨兵直覺", ROLL("感知（{@skill Insight|XPHB}或{@skill Perception|XPHB}）檢定"), "守護者之盾", CAST1("{@spell Shield|XPHB}", false),
 "警戒守護者", "當你 5 呎內一個你能看見的生物被攻擊檢定命中時，你可以執行一個{@variantrule Reaction|XPHB}與該生物交換位置，改由你被該攻擊命中。你可以使用此特性的次數等同於你的{@variantrule Proficiency|XPHB|熟練加值}，並在完成{@variantrule Long Rest|XPHB}時恢復所有已消耗的使用次數。", ...SPELLS("Sentinel")],
[mk("Shadow"), null, "狡黠直覺", ROLL("敏捷（{@skill Stealth|XPHB}）或魅力（{@skill Performance|XPHB}）檢定"), "塑造陰影", "你知道{@spell Minor Illusion|XPHB}戲法。你也總是準備著{@spell Invisibility|XPHB}法術。你可以不消耗法術欄位施展它一次，並在完成{@variantrule Long Rest|XPHB}時恢復以此方式施展它的能力。你也可以使用你擁有的適當環階法術欄位施展它。智力、感知或魅力為你施展這些法術的施法屬性（於選擇此專長時決定）。", ...SPELLS("Shadow")],
[mk("Storm"), null, "駕風者直覺", ROLL("敏捷（{@skill Acrobatics|XPHB}）檢定或使用{@item Navigator's Tools|XPHB}的屬性檢定"), "風暴恩賜", "你對閃電傷害具有{@variantrule Resistance|XPHB}。",
 "風暴魔法", "你知道{@spell Thunderclap|XPHB}戲法。當你達到角色等級 3 時，你也總是準備著{@spell Gust of Wind|XPHB}法術。你可以不消耗法術欄位施展它一次，並在完成{@variantrule Long Rest|XPHB}時恢復以此方式施展它的能力。你也可以使用你擁有的適當環階法術欄位施展它。智力、感知或魅力為你施展這些法術的施法屬性（於選擇此專長時決定）。", ...SPELLS("Storm")],
[mk("Warding"), null, "守護者直覺", ROLL("智力（{@skill Investigation|XPHB}）檢定或使用{@item Thieves' Tools|XPHB}的屬性檢定"), "結界與封印",
 "你總是準備著{@spell Alarm|XPHB}與{@spell Mage Armor|XPHB}法術。你可以不消耗法術欄位各施展它們一次，並在完成{@variantrule Long Rest|XPHB}時恢復以此方式施展它們的能力。",
 "你也可以使用你擁有的適當環階法術欄位施展這些法術。智力、感知或魅力為你施展這些法術的施法屬性（於選擇此專長時決定）。", LV3("{@spell Arcane Lock|XPHB}"), ...SPELLS("Warding")],
["強效龍紋", null, "龍紋準備", "你總是準備著你「印記法術」清單上的法術（若有的話）。",
 "龍紋施法", "你擁有一個額外的法術欄位，用來施展你的龍紋專長所賦予的法術。該法術欄位的環階等於你等級的一半（向上取整），最高 5 環。完成{@variantrule Short Rest|XPHB|短休}或{@variantrule Long Rest|XPHB}時，你恢復這個已消耗的欄位。你只能用這個法術欄位施展因龍紋專長或此專長「龍紋準備」益處而準備的法術。"],
]);
