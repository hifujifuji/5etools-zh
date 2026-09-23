// 魔法物品常見重複段落
export const FIG = [
	"{@item Figurine of Wondrous Power|XDMG}是一尊小到能放進口袋的小雕像。若你執行一個{@action Magic|XPHB}動作，將塑像扔向你 60 呎內地面上的一點，塑像會變成下方塑像說明中指定的活生物。若生物會出現的空間被其他生物或物體佔據，或空間不足以容納該生物，塑像就不會變成生物。",
	"該生物對你和你的盟友{@variantrule Friendly [Attitude]|XPHB|友善}。它懂得你的語言，服從你的命令，並在你的{@variantrule Initiative|XPHB}順序中緊接在你之後行動。若你沒有下達命令，該生物會自我防衛，但不會採取其他動作。",
	"生物存在的持續時間依各塑像而定。持續時間結束時，生物會恢復為塑像形態。若其生物形態的{@variantrule Hit Points|XPHB}降至 0，或你在碰觸該生物時執行一個{@action Magic|XPHB}動作使其恢復為塑像形態，它會提早恢復為塑像。當生物再次變回塑像後，必須經過一定時間才能再次使用其屬性，如下所述。",
];
export const ELEM = e => `這顆寶石中蘊含一絲元素能量。當你執行一個{@action Utilize|XPHB}動作打碎寶石時，會召喚出一隻{@creature ${e}|XMM}，寶石也不再具有魔力。元素生物出現在盡可能靠近碎裂寶石的未被佔據空間中，懂得你的語言，服從你的命令，並在你的{@variantrule Initiative|XPHB}順序中緊接在你之後行動。元素生物會在 1 小時後、死亡時，或你以一個{@variantrule Bonus Action|XPHB}解散它時消失。`;
export const ENSPELL = (what, kind, dc, hit, mundane) => [
	`此${kind}中封存著${what}。法術在${kind}被製作時決定，可以是任何學派。此${kind}有 6 發充能，每天黎明恢復 {@dice 1d6} 發已消耗的充能。持有此${kind}時，你可以消耗 1 發充能施展其法術。若你消耗了${kind}的最後一發充能，擲 {@dice 1d20}。擲出 1 時，此${kind}失去其屬性，變成一${mundane}。`,
	`此法術的豁免 DC 為 ${dc}，攻擊加值為 {@hit ${hit}}。`,
];
export const VECNA = other => [
	"{@book 維克那|XDMG|8|Vecna}是一位強大的法師，他藉由魔法與征服建立了一個可怕的帝國。然而，儘管擁有如此力量，維克那仍畏懼死亡，並採取措施成為巫妖以避免自己的消亡。",
	"一名名叫卡斯的奸詐副官在一場慘烈的戰役中終結了維克那的統治。維克那只留下了一隻手和一隻眼睛，這兩件可怖的神器仍在世上試圖實現維克那的意志。",
	other,
];
export const VALHALLA = [
	"你可以執行一個{@action Magic|XPHB}動作吹響此號角。作為回應，來自伊斯嘉德位面的戰士之靈會出現在你 60 呎內的未被佔據空間中。每個戰士之靈使用{@creature Berserker|XMM}的數據資料，並在 1 小時後或其{@variantrule Hit Points|XPHB}降至 0 時返回伊斯嘉德。戰士之靈看起來像是活生生、有呼吸的戰士，並對{@condition Charmed|XPHB}與{@condition Frightened|XPHB}狀態具有{@variantrule Immunity|XPHB}。使用號角後，必須經過 7 天才能再次使用。",
];
export const VALHALLA_END = "若你在未符合要求的情況下吹響號角，被召喚的{@creature Berserker|XMM|狂戰士}會攻擊你。若你符合要求，他們會對你和你的盟友{@variantrule Friendly [Attitude]|XPHB|友善}，並聽從你的命令。";
export const BARD = "吟遊詩人樂器在各方面都優於普通樂器。這類樂器共有七種，各以一個吟遊詩人學院命名。未與樂器同調而嘗試演奏它的生物，必須通過一次 {@dc 15} 感知豁免檢定，否則受到 {@damage 2d4} 心靈傷害。";
export const BARD_END = (n) => `一旦${n}被用來施展某道法術，直到下一個黎明前都無法再用它施展該法術。這些法術使用你的施法屬性與法術豁免 DC。`;
export const BARD_BASE = "{@spell Fly|XPHB}、{@spell Invisibility|XPHB}、{@spell Levitate|XPHB}、{@spell Protection from Evil and Good|XPHB}";
export const HORSESHOE = "這些馬蹄鐵四個一組。作為一個{@action Magic|XPHB}動作，你可以將其中一個馬蹄鐵碰觸馬或類似生物的蹄，馬蹄鐵便會固定在蹄上。取下馬蹄鐵同樣需要一個{@action Magic|XPHB}動作。";
export const GIANT_POT = (zh, score, giant) => [`${zh}之力藥水`, `喝下這瓶藥水時，你的力量值在 1 小時內變為 ${score}。若你的力量已等於或高於該數值，則此藥水對你沒有效果。`, `這瓶藥水的透明液體中漂浮著一小片${giant}的指甲。`];
export const RES_POT = zh => [`${zh}抗性藥水`, "{#itemEntry Potion of Resistance|XDMG}"];
export const RES_RING = zh => [`${zh}抗性戒指`, "{#itemEntry Ring of Resistance|XDMG}"];
export const ELEM_RING = (zh, plane, focusName, focus, spells) => [`元素指揮戒指（${zh}）`, `元素指揮戒指（${zh}）與${plane}相連。每枚元素指揮戒指都具有以下兩項屬性：`, "元素剋星", "戴著此戒指時，你對元素生物的攻擊檢定具有{@variantrule Advantage|XPHB}，而它們對你的攻擊檢定具有{@variantrule Disadvantage|XPHB}。", "元素驅使", "戴著此戒指時，你可以執行一個{@action Magic|XPHB}動作，嘗試驅使你 60 呎內一個你能看見的元素生物。該元素生物進行一次 {@dc 18} 感知豁免檢定。豁免失敗時，該元素生物處於{@condition Charmed|XPHB}狀態直到你的下個回合開始，並由你決定它在其下個回合中如何移動與執行什麼動作。", "元素專注", "戴著此戒指時，你獲得與戒指所連結之元素位面相應的額外屬性：", focusName, focus, "施法", `戒指有 5 發充能，每天黎明恢復 {@dice 1d4 + 1} 發已消耗的充能。戴著戒指時，你可以從中施展法術。從戒指施展的法術豁免 DC 為 18。從下列清單中選擇法術：${spells}`];
