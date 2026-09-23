import fill from "./_tcefill.mjs";
const ROLL = s => `進行${s}時，你可以擲一顆 {@dice d4} 並將結果加到該屬性檢定上。`;
const MS = m => `若你擁有施法或契約魔法職業特性，「${m}印記法術」表中的法術會加入你施法職業的法術列表。`;
const TBL = ["1 環", "=", "2 環", "=", "3 環", "=", "4 環", "=", "5 環"];
const MARK = (tbl) => [null, null, null, null, ...tbl];
const TIEF = "你的提夫林可能看起來與其他提夫林不同。不採用《玩家手冊》中描述的外貌特徵，而是從下列特徵中選擇 {@dice 1d4+1} 項：小角；尖牙或利齒；分岔的舌頭；貓一般的眼睛；每隻手有六根手指；山羊般的腿；偶蹄；分岔的尾巴；皮革般或長鱗的皮膚；紅色或深藍色的皮膚；沒有影子或倒影；散發硫磺味。";
const DRAGON_TBL = ["長 30 呎、寬 5 呎直線（敏捷豁免）", "15 呎錐形（敏捷豁免）", "15 呎錐形（體質豁免）"];
const DT = () => { const L = DRAGON_TBL[0], CD = DRAGON_TBL[1], CC = DRAGON_TBL[2]; const r = []; for (const [b, x] of [[1, L], [1, L], [1, L], [1, L], [1, L], [2, CD], [3, CC], [2, CD], [3, CC], [3, CC]]) { r.push(null, b === 2 || b === 1 && false ? null : null, x); } return r; };
const dt = () => { const out = []; const seq = [["L"], ["L"], ["火焰", "L"], ["L"], ["L"], ["火焰", "CD"], ["CC"], ["火焰", "CD"], ["CC"], ["CC"]]; const M = {L: DRAGON_TBL[0], CD: DRAGON_TBL[1], CC: DRAGON_TBL[2]};
	for (const s of seq) { out.push(null); out.push(s.length === 2 ? s[0] : null); out.push(M[s[s.length - 1]]); } return out; };
const DRAG_ANC = "你擁有龍族血統。從「龍族血統」表中選擇一種龍。你的吐息武器由龍的種類決定，如表中所示。";
fill("subrace-ERLW", [
[null, "天生運動員", "你熟練{@skill Athletics}技能。", "變身特性", "每當你變身時，你額外獲得 {@dice 1d6} 臨時生命值。變身期間，你的護甲等級獲得 +1 加值。"],
[null, "兇猛", null, "變身特性", "變身期間，你可以用附贈動作以伸長的尖牙進行一次徒手打擊。若你以尖牙命中，你可以造成等同於 {@damage 1d6} + 你力量調整值的穿刺傷害，取代徒手打擊一般的鈍擊傷害。"],
[null, null, ROLL("感知（{@skill Animal Handling}）或智力（{@skill Nature}）檢定"), null, "你可以用此特性施展{@spell animal friendship}與{@spell speak with animals}法術，且不需要材料成分。以此特性施展其中任一道法術後，直到你完成短休或長休前都無法再以此特性施展該法術。感知是你施展這些法術的施法屬性。",
 "越大越好馴", "從 3 級開始，當你施展{@spell animal friendship}或{@spell speak with animals}時，只要生物的智力值為 3 或更低，你可以將野獸或怪獸作為目標。", null, MS("馴獸"), null, null, null, ...TBL],
[null, null, ROLL("感知（{@skill Medicine}）檢定或使用{@item herbalism kit|phb}的屬性檢定"), null, "你可以用此特性施展{@spell cure wounds}法術。從 3 級開始，你也可以用它施展{@spell lesser restoration}。以此特性施展其中任一道法術後，直到你完成長休前都無法再以此特性施展該法術。感知是你施展這些法術的施法屬性。", null, MS("治療"), null, null, null, ...TBL],
[null, null, ROLL("魅力（{@skill Persuasion}）檢定或涉及{@item brewer's supplies|PHB}或{@item cook's utensils|PHB}的屬性檢定"), null, "你知道{@spell prestidigitation}戲法。你也可以用此特性施展{@spell purify food and drink}與{@spell unseen servant}法術。以此特性施展其中任一道法術後，直到你完成長休前都無法再以此特性施展該法術。魅力是你施展這些法術的施法屬性。", null, MS("款待"), null, null, null, ...TBL],
[null, null, ROLL("{@skill Arcana}檢定或涉及{@filter 工匠工具|items|source=phb|miscellaneous=mundane|type=artisan's tools}的屬性檢定"), "製造者的天賦", "你獲得一種自選{@item artisan's tools|PHB}的熟練。", null,
 "你知道{@spell mending}戲法。你也可以用此特性施展{@spell magic weapon}法術。這麼做時，法術持續 1 小時且不需要{@status concentration}。以此特性施展此法術後，直到你完成長休前都無法再次這麼做。智力是你施展這些法術的施法屬性。", null, MS("製造"), null, null, null, ...TBL],
[null, null, "你的基礎步行速度增加到 35 呎。", null, ROLL("敏捷（{@skill Acrobatics}）檢定或任何操作或維護{@filter 陸上載具|items|source=phb;dmg|miscellaneous=mundane|type=vehicle (land)}的屬性檢定"), null, "你可以用此特性施展{@spell misty step}法術一次，並在完成長休時恢復施展它的能力。敏捷是你施展此法術的施法屬性。", null, MS("通行"), null, null, null, ...TBL],
[null, null, ROLL("智力（{@skill History}）檢定或使用{@item calligrapher's supplies|PHB}的屬性檢定"), null, "你知道{@spell message}戲法。你也可以用此特性施展{@spell comprehend languages}一次，並在完成短休或長休時恢復施展它的能力。從 3 級開始，你可以用此特性施展{@spell magic mouth}法術，並在完成長休時恢復施展它的能力。智力是你施展這些法術的施法屬性。", null, MS("書記"), null, null, null, ...TBL],
[null, null, ROLL("感知（{@skill Insight}）或感知（{@skill Perception}）檢定"), null, "你可以用此特性施展{@spell shield}法術一次，並在完成長休後恢復施展它的能力。感知是你施展此法術的施法屬性。", null, "當你 5 呎內一個你能看見的生物被攻擊檢定命中時，你可以使用你的反應與該生物交換位置，改由你被該攻擊命中。使用此特性後，直到你完成長休前都無法再次使用。", null, MS("哨兵"), null, null, null, ...TBL],
[null, null, ROLL("魅力（{@skill Performance}）或敏捷（{@skill Stealth}）檢定"), null, "你知道{@spell minor illusion}戲法。從 3 級開始，你可以用此特性施展{@spell invisibility}法術一次，並在完成長休時恢復施展它的能力。魅力是你施展這些法術的施法屬性。", null, MS("陰影"), null, null, null, ...TBL],
[null, null, ROLL("智力（{@skill Investigation}）檢定或使用{@item thieves' tools|PHB}的屬性檢定"), null, "你可以用此特性施展{@spell alarm}與{@spell mage armor}法術。從 3 級開始，你也可以用它施展{@spell arcane lock}法術。以此特性施展其中任一道法術後，直到你完成長休前都無法再以此特性施展該法術。智力是你施展這些法術的施法屬性，且以此特性施展時不需要材料成分。", null, MS("守護"), null, null, null, ...TBL],
[null, "優雅", "你熟練{@skill Acrobatics}技能。", "變身特性", null],
["變體；偵測印記", null, ROLL("智力（{@skill Investigation}）或感知（{@skill Insight}）檢定"), null, "你可以用此特性施展{@spell detect magic}與{@spell detect poison and disease}法術。從 3 級開始，你也可以用它施展{@spell see invisibility}法術。以此特性施展其中任一道法術後，直到你完成長休前都無法再以此特性施展該法術。感知是你施展這些法術的施法屬性，且不需要材料成分。", null, MS("偵測"), null, null, null, ...TBL],
["變體；尋覓印記", null, null, null, ROLL("感知（{@skill Perception}）或感知（{@skill Survival}）檢定"), null, "你可以用此特性施展{@spell hunter's mark}法術。從 3 級開始，你也可以用它施展{@spell locate object}法術。以此特性施展其中任一道法術後，直到你完成長休前都無法再以此特性施展該法術。感知是你施展這些法術的施法屬性。", null, null, null, MS("尋覓"), null, null, null, ...TBL],
["變體；尋覓印記", null, null, null, ROLL("感知（{@skill Perception}）或感知（{@skill Survival}）檢定"), null, "你可以用此特性施展{@spell hunter's mark}法術。從 3 級開始，你也可以用它施展{@spell locate object}法術。以此特性施展其中任一道法術後，直到你完成長休前都無法再以此特性施展該法術。感知是你施展這些法術的施法屬性。", null, null, null, MS("尋覓"), null, null, null, ...TBL],
["變體；暴風印記", null, ROLL("敏捷（{@skill Acrobatics}）檢定或任何涉及{@item navigator's tools|PHB}的屬性檢定"), null, "你具有閃電傷害抗性。", "逆風", "你知道{@spell gust|XGE}戲法。從 3 級開始，你可以用此特性施展{@spell gust of wind}法術一次，並在完成長休時恢復施展它的能力。魅力是你施展這些法術的施法屬性。", null, MS("暴風"), null, null, null, ...TBL],
[null, "天生追蹤者", "你熟練{@skill Survival}技能。", "變身特性", "變身期間，你的感知檢定具有優勢，且除非你處於{@condition incapacitated}狀態，否則你 30 呎內沒有任何生物能以優勢對你進行攻擊檢定。"],
]);
const VF = "變體特性（擇一）";
fill("subrace-SCAG", [
["深地侏／斯弗尼布林", null, "深地侏以地侏來說壽命較短。他們成熟的速度與人類相同，25 歲時便被視為完全成年。他們可活 200 到 250 年，但辛苦的勞動與幽暗地域的危險常常讓他們英年早逝。", null, "斯弗尼布林相信生存之道在於避免與其他生物糾纏、不樹敵，因此偏好中立陣營。他們很少對他人懷有惡意，也不太可能為他人冒險。",
 null, "典型的斯弗尼布林身高約 3 到 3½ 呎，體重 80 到 120 磅。你的體型為小型。", "高等黑暗視覺", "由於習慣了地底生活，你在黑暗與微光環境中擁有優越的視力。你能在你 120 呎內的微光中視物，如同在明亮光照中一樣；在黑暗中視物，如同在微光中一樣。你在黑暗中無法辨別顏色，只能辨別灰階。",
 "岩石偽裝", "你為在岩石地形中躲藏而進行的敏捷（{@skill Stealth}）檢定具有優勢。", null, "你能說、讀、寫通用語、地侏語與地底通用語。斯弗尼布林方言比地表的地侏語更多喉音，大多數斯弗尼布林只懂一點通用語，但與外人打交道的人（包括身為冒險者的你）會學到足以在其他地方應付的通用語。"],
["靈智", "無聲話語", "你可以用心靈感應與你 30 呎內的任何生物說話。只有當你們有共同語言時，該生物才能理解你。你一次只能以此方式與一個生物進行心靈感應交談。"],
["變體；水精靈後裔", VF, null, "你獲得兩項自選技能的熟練。", "游泳", "你獲得 30 呎的游泳速度。"],
["變體；魔鬼之舌", "外貌", TIEF, "魔鬼之舌", "你知道{@spell vicious mockery}戲法。當你達到 3 級時，你可以用此特性將{@spell charm person}法術作為 2 環法術施展一次。當你達到 5 級時，你可以用此特性施展{@spell enthrall}法術一次。你必須完成長休才能再以此特性施展這些法術。魅力是你施展它們的施法屬性。此特性取代煉獄傳承特性。"],
["變體；卓爾後裔", VF, null, "你獲得兩項自選技能的熟練。", "卓爾魔法", "你知道{@spell dancing lights}戲法。當你達到 3 級時，你可以每日施展{@spell faerie fire}法術一次；你必須完成長休才能再以此特性施展該法術。當你達到 5 級時，你也可以每日施展{@spell darkness}法術一次；你必須完成長休才能再以此特性施展該法術。魅力是你施展這些法術的施法屬性。"],
["變體；地獄火", "外貌", TIEF, "地獄火", "你知道{@spell thaumaturgy}戲法。當你達到 3 級時，你可以每日將{@spell burning hands}法術作為 2 環法術施展一次；你必須完成長休才能再以此特性施展該法術。當你達到 5 級時，你也可以施展{@spell darkness}法術；你必須完成長休才能再以此特性施展該法術。魅力是你施展這些法術的施法屬性。"],
["變體；煉獄傳承", "外貌", TIEF],
["變體；月精靈或日精靈後裔", VF, null, "你獲得兩項自選技能的熟練。", null, null, null, "你從{@filter 法師法術列表|spells|class=wizard|level=0}中知道一道自選戲法。智力是你施展它的施法屬性。"],
["變體；有翼", "外貌", TIEF, "有翼", "你的肩胛骨長出蝙蝠般的翅膀。未穿著重甲時，你擁有 30 呎的飛行速度。"],
["變體；木精靈後裔", VF, null, "你獲得兩項自選技能的熟練。", null, null, "健步如飛", "你的基礎步行速度增加到 35 呎。", "荒野面具", "即使你只受到樹葉、大雨、落雪、霧氣或其他自然現象的輕度遮蔽，你也可以嘗試躲藏。"],
]);
const GEN = (a, b) => [a, b];
fill("subrace-MPMM", [
[null, "無盡氣息", "只要你未處於{@condition incapacitated}狀態，你就能無限期屏住呼吸。", "閃電抗性", "你具有閃電傷害抗性。", "與風交融",
 "你知道{@spell shocking grasp}戲法。從 3 級開始，你可以用此特性施展{@spell feather fall}法術，且不需要材料成分。從 5 級開始，你也可以用此特性施展{@spell levitate}法術，且不需要材料成分。以此特性施展{@spell feather fall}或{@spell levitate}後，直到你完成長休前都無法再以此特性施展該法術。你也可以使用你擁有的適當環階法術欄位施展其中任一道法術。", null],
[null, "大地行走", "若你在地面或地板上使用步行速度移動，你可以穿越{@quickref difficult terrain||3|困難地形}而不消耗額外的移動。", "融入岩石",
 "你知道{@spell blade ward}戲法。你可以照常施展它，也可以用附贈動作施展它，次數等同於你的熟練加值，並在完成長休時恢復所有已消耗的使用次數。",
 "從 5 級開始，你可以用此特性施展{@spell pass without trace}法術，且不需要材料成分。以此特性施展此法術後，直到你完成長休前都無法再次這麼做。你也可以使用你擁有的任何 2 環或更高環的法術欄位施展它。", null],
[null, "火焰抗性", null, "觸及烈焰", "你知道{@spell produce flame}戲法。從 3 級開始，你可以用此特性施展{@spell burning hands}法術。從 5 級開始，你也可以用此特性施展{@spell flame blade}法術，且不需要材料成分。以此特性施展{@spell burning hands}或{@spell flame blade}後，直到你完成長休前都無法再以此特性施展該法術。你也可以使用你擁有的適當環階法術欄位施展其中任一道法術。", null],
[null, null, null, "強酸抗性", "你具有強酸傷害抗性。", null, "你能呼吸空氣與水。", "呼喚浪潮", "你知道{@spell acid splash}戲法。從 3 級開始，你可以用此特性施展{@spell create or destroy water}法術。從 5 級開始，你也可以用此特性施展{@spell water walk}法術，且不需要材料成分。以此特性施展{@spell create or destroy water}或{@spell water walk}後，直到你完成長休前都無法再以此特性施展該法術。你也可以使用你擁有的適當環階法術欄位施展其中任一道法術。", null],
]);
fill("subrace-EGW", [
["龍血裔", null, null, "強勢氣場", "你可以運用你對創意外交或威嚇的理解，將對話導向對你有利的方向。當你進行魅力（{@skill Intimidation}或{@skill Persuasion}）檢定時，你可以使該檢定具有優勢。使用此特性後，直到你完成短休或長休前都無法再次使用。", null, DRAG_ANC, null, null, null, null, ...dt()],
["朧蓮之地", "森林之子", "你知道{@spell druidcraft}戲法。當你達到 3 級時，你可以用此特性施展{@spell entangle}法術一次，並在完成長休時恢復這麼做的能力。當你達到 5 級時，你可以用此特性施展{@spell spike growth}法術一次，並在完成長休時恢復這麼做的能力。以此特性施展這些法術不需要材料成分。感知是你施展這些法術的施法屬性。",
 "林中行", "為追蹤你而進行的屬性檢定具有劣勢，且你可以穿越由非魔法植物與灌木叢構成的{@quickref difficult terrain||3|困難地形}而不消耗額外的移動。"],
["蒼白", "敏銳感知", "你的智力（{@skill Investigation}）與感知（{@skill Insight}）檢定具有優勢。", "月之織者的祝福", "你知道{@spell light}戲法。當你達到 3 級時，你可以用此特性施展{@spell sleep}法術一次，並在完成長休時恢復這麼做的能力。當你達到 5 級時，你可以用此特性施展{@spell invisibility}法術（只能以自己為目標）一次，並在完成長休時恢復這麼做的能力。以此特性施展這些法術不需要材料成分。感知是你施展這些法術的施法屬性。"],
["渡鴉裔", null, null, "復仇攻擊", "當你受到位於你所持用武器攻擊範圍內之生物的傷害時，你可以使用你的反應，以該武器對該生物進行一次攻擊。使用此特性後，直到你完成短休或長休前都無法再次使用。", null, DRAG_ANC, null, null, null, null, ...dt()],
]);
const PIDGIN = "{@language Common Trade Pidgin|PSX|通用語}（若你的戰役中存在）";
fill("subrace-PSX", [
["依夏蘭", null, "大多數哥布林都極度混亂，對善惡沒有特別的傾向，但有強烈的惡作劇傾向。", "敏捷攀爬者", "你擁有 25 呎的攀爬速度。穿著中甲或重甲時，你無法使用攀爬速度。（若你的戰役使用{@variantrule encumbrance|PHB|負重}變體規則，你在負重時無法使用攀爬速度。）", null, `你能說、讀、寫${PIDGIN}與{@language Goblin|PHB}。`],
["依夏蘭", null, "吸血鬼成熟與衰老的方式與其他種族不同。", null, "吸血鬼或許沒有天生的邪惡傾向，但他們之中許多人最終走向邪惡。無論邪惡與否，嚴格的階級制度使他們傾向守序陣營。", null, "吸血鬼的體型與身材與人類相同。你的體型為中型。",
 "血之盛宴", "當你以渴血能力汲取血液時，你會感到一股活力湧現。在 1 分鐘內，你的速度增加 10 呎，且你的力量與敏捷檢定及豁免檢定具有優勢。", null, `你能說、讀、寫${PIDGIN}與{@language Vampire|PSX}。`],
["依夏蘭；藍", null, "你從{@filter 法師法術列表|spells|class=wizard|level=0}中知道一道自選戲法。智力是你施展它的施法屬性。", "水之知識", "你獲得{@skill History}與{@skill Nature}技能的熟練。", null, `你能說、讀、寫${PIDGIN}、{@language Merfolk|PSX}，以及一種自選的額外語言。`],
["依夏蘭；綠", null, "你從{@filter 德魯伊法術列表|spells|class=Druid|level=0}中知道一道自選戲法。感知是你施展它的施法屬性。", "荒野面具", "即使你只受到樹葉、大雨、落雪、霧氣或其他自然現象的輕度遮蔽，你也可以嘗試躲藏。", null, `你能說、讀、寫${PIDGIN}、{@language Merfolk|PSX}，以及一種自選的額外語言。`],
]);
fill("subrace-PSZ", [
["喬拉加族", "荒野面具", "即使你只受到樹葉、大雨、落雪、霧氣或其他自然現象的輕度遮蔽，你也可以嘗試躲藏。", null, null, "健步如飛", "你的地面速度增加到 35 呎。"],
["穆爾達亞族", "穆爾達亞魔法", "你知道{@spell chill touch}戲法。當你達到 3 級時，你可以用此特性施展{@spell hex}法術一次，並在完成長休時恢復這麼做的能力。當你達到 5 級時，你可以用此特性施展{@spell darkness}法術一次，並在完成長休時恢復這麼做的能力。感知是你施展這些法術的施法屬性。",
 "高等黑暗視覺", "你的黑暗視覺範圍為 120 呎。", null, "當你、你的攻擊目標或你試圖察覺的事物位於直射陽光下時，你的攻擊檢定與依賴視覺的感知（{@skill Perception}）檢定具有劣勢。", null, null],
["塔朱魯族", null, "你獲得任意組合的兩項其他自選技能或{@book 工具|phb|5|tools}的熟練。"],
["贊迪卡", "空無轉化", "被你以渴血能力殺死的類人生物會成為{@creature Vampire Null|PSZ|空無者}。"],
["贊迪卡；寇西教義", null, "你從{@filter 吟遊詩人法術列表|spells|class=bard|level=0}中知道一道自選戲法。魅力是你施展它的施法屬性。", "詐術師教義", "你獲得{@skill Sleight of Hand}與{@skill Stealth}技能的熟練。"],
["贊迪卡；艾梅莉亞教義", null, "你從{@filter 德魯伊法術列表|spells|class=druid|level=0}中知道一道自選戲法。感知是你施展它的施法屬性。", "風之教義操縱", "你獲得{@skill Deception}與{@skill Persuasion}技能的熟練。"],
["贊迪卡；格羅塔格部落", "格羅塔格馴獸師", "你獲得{@skill Animal Handling}技能的熟練。"],
["贊迪卡；熔岩步部落", "熔岩步堅毅", "你為在岩石或地底環境中躲藏而進行的敏捷（{@skill Stealth}）檢定具有優勢。"],
["贊迪卡；圖克圖克部落", "圖克圖克的狡黠", "你獲得{@item thieves' tools|phb}的熟練。"],
["贊迪卡；烏拉教義", null, "你從{@filter 法師法術列表|spells|class=wizard|level=0}中知道一道自選戲法。智力是你施展它的施法屬性。", "水之教義導航", "你獲得{@item navigator's tools|phb}與{@skill Survival}技能的熟練。"],
]);
fill("subrace-PSK", [
["比夏塔與提拉哈", "健步如飛", "你的地面速度增加到 35 呎。", "荒野面具", "即使你只受到樹葉、大雨、落雪、霧氣或其他自然現象的輕度遮蔽，你也可以嘗試躲藏。"],
["瓦哈達", null, "你從{@filter 德魯伊法術列表|spells|class=druid|level=0}中知道一道自選戲法。感知是你施展它的施法屬性。", "額外語言", "你能說、讀、寫一種你所選的額外語言。"],
]);
