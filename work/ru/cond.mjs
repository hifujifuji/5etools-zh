import F from "../_fillfl.mjs";
const W = (c, s = "以下效果") => `當你處於${c}狀態時，你會受到${s}。`;
const ADV = "{@action Attack|XPHB|攻擊}檢定對你具有{@variantrule Advantage|XPHB|優勢}";
const S0 = "你的{@variantrule Speed|XPHB|速度}為 0 且無法增加。";
const SAVEF = "你在力量與敏捷{@variantrule Saving Throw|XPHB|豁免檢定}上自動失敗。";
const CRIT = "若攻擊者位於你 5 呎內，任何命中你的攻擊檢定都是{@variantrule Critical Hit|XPHB|重擊}。";
const INC = "你處於{@condition Incapacitated|XPHB}狀態。";
const H = {"Attacks Affected": "攻擊受影響", "Speed 0": "速度 0", "Saving Throws Affected": "豁免檢定受影響", "Incapacitated": "無力", "Automatic Critical Hits": "自動重擊", "Ability Checks and Attacks Affected": "屬性檢定與攻擊受影響"};
const m = [
{0: "目盲", 1: W("目盲"), 2: "無法看見", 3: "你無法看見，且在任何需要視覺的屬性檢定中自動失敗。", 5: ADV + "，而你的攻擊檢定具有{@variantrule Disadvantage|XPHB|劣勢}。"},
{0: "魅惑", 1: W("魅惑"), 2: "無法傷害魅惑者", 3: "你無法攻擊魅惑者，也無法以具傷害性的能力或{@variantrule Magical Effect|XPHB|魔法效果}將魅惑者作為目標。", 4: "社交優勢", 5: "魅惑者在與你進行社交互動的任何屬性檢定上具有{@variantrule Advantage|XPHB|優勢}。"},
{0: "耳聾", 1: W("耳聾", "以下效果"), 2: "無法聽見", 3: "你無法聽見，且在任何需要聽覺的屬性檢定中自動失敗。"},
{0: "力竭", 1: W("力竭"), 2: "力竭等級", 3: "此狀態會累積。你每次獲得此狀態，便獲得 1 級力竭。若你的力竭等級達到 6，你便會死亡。", 4: "D20 檢定受影響", 5: "當你進行 D20 檢定時，擲骰結果減去你力竭等級的 2 倍。", 6: "速度降低", 7: "你的{@variantrule Speed|XPHB|速度}減少等於你力竭等級 5 倍的呎數。", 8: "移除力竭等級", 9: "完成一次{@variantrule Long Rest|XPHB|長休}會移除你 1 級力竭。當你的力竭等級降至 0 時，此狀態結束。"},
{0: "恐懼", 1: W("恐懼"), 3: "當恐懼的來源在你的視線範圍內時，你在屬性檢定與攻擊檢定上具有{@variantrule Disadvantage|XPHB|劣勢}。", 4: "無法接近", 5: "你無法自願移動得更接近恐懼的來源。"},
{0: "被擒", 1: W("被擒"), 3: S0, 5: "你對擒抱者以外任何目標的攻擊檢定具有{@variantrule Disadvantage|XPHB|劣勢}。", 6: "可被移動", 7: "擒抱者移動時可以拖拽或攜帶你，但除非你是微型或比它小兩個或更多體型，否則它每移動 1 呎都要額外花費 1 呎。"},
{0: "無力", 1: W("無力"), 2: "無法行動", 3: "你無法採取任何{@variantrule Action|XPHB|動作}、{@variantrule Bonus Action|XPHB|附贈動作}或{@variantrule Reaction|XPHB|反應}。", 4: "無法專注", 5: "你的{@status Concentration|XPHB|專注}被打斷。", 6: "無法說話", 7: "你無法說話。", 8: "突襲", 9: "若你在擲{@variantrule Initiative|XPHB|先攻}時處於無力狀態，你在該擲骰上具有{@variantrule Disadvantage|XPHB|劣勢}。"},
{0: "隱形", 1: W("隱形"), 2: "突襲", 3: "若你在擲{@variantrule Initiative|XPHB|先攻}時處於隱形狀態，你在該擲骰上具有{@variantrule Advantage|XPHB|優勢}。", 4: "隱蔽", 5: "除非效果的創造者能以某種方式看見你，否則你不受任何要求其目標可被看見的效果影響。你穿戴或攜帶的任何裝備也會被隱藏。", 7: "{@action Attack|XPHB|攻擊}檢定對你具有{@variantrule Disadvantage|XPHB|劣勢}，而你的攻擊檢定具有{@variantrule Advantage|XPHB|優勢}。若某個生物能以某種方式看見你，你對該生物便無法獲得此好處。"},
{0: "麻痺", 1: W("麻痺"), 3: INC, 5: S0, 7: SAVEF, 9: ADV + "。", 11: CRIT},
{0: "石化", 1: W("石化"), 2: "化為無生命物質", 3: "你連同你穿戴與攜帶的任何非魔法物體，一起被轉化為固態的無生命物質（通常是石頭）。你的重量增加為原本的十倍，且你停止老化。", 5: INC, 7: S0, 9: ADV + "。", 11: SAVEF, 12: "抵抗傷害", 13: "你對所有傷害具有{@variantrule Resistance|XPHB|抗性}。", 14: "毒素免疫", 15: "你對{@condition Poisoned|XPHB}狀態具有{@variantrule Immunity|XPHB|免疫}。"},
{0: "中毒", 1: W("中毒", "以下效果"), 3: "你在攻擊檢定與屬性檢定上具有{@variantrule Disadvantage|XPHB|劣勢}。"},
{0: "伏地", 1: W("伏地"), 2: "移動受限", 3: "你唯一的移動選項是{@variantrule Crawling|XPHB|爬行}，或花費等於你{@variantrule Speed|XPHB|速度}一半（無條件捨去）的移動力起身，從而結束此狀態。若你的{@variantrule Speed|XPHB|速度}為 0，你便無法起身。", 5: "你的攻擊檢定具有{@variantrule Disadvantage|XPHB|劣勢}。若攻擊者位於你 5 呎內，對你的攻擊檢定具有{@variantrule Advantage|XPHB|優勢}；否則該攻擊檢定具有{@variantrule Disadvantage|XPHB|劣勢}。"},
{0: "束縛", 1: W("束縛"), 3: S0, 5: ADV + "，而你的攻擊檢定具有{@variantrule Disadvantage|XPHB|劣勢}。", 7: "你在敏捷{@variantrule Saving Throw|XPHB|豁免檢定}上具有{@variantrule Disadvantage|XPHB|劣勢}。"},
{0: "震懾", 1: W("震懾"), 3: INC, 5: SAVEF, 7: ADV + "。"},
{0: "昏迷", 1: W("昏迷"), 2: "失去意識", 3: "你處於{@condition Incapacitated|XPHB}與{@condition Prone|XPHB}狀態，並掉落你手中持有的任何東西。此狀態結束時，你仍處於{@condition Prone|XPHB}狀態。", 5: S0, 7: ADV + "。", 9: SAVEF, 11: CRIT, 12: "無所察覺", 13: "你對周遭環境毫無察覺。"},
];
const en = (await import("fs")).default.readFileSync("work/ru-cond.en.json", "utf8");
const items = JSON.parse(en).items;
items.forEach((it, i) => it.s.forEach((s, j) => { if (m[i][j] == null && H[s]) m[i][j] = H[s]; }));
F("ru-cond", m);
F("ru-cond-p", [{0: "麻痺", 1: "麻痺的生物處於{@condition incapacitated}狀態，且無法移動或說話。", 2: "該生物在力量與敏捷豁免檢定上自動失敗。", 3: "對該生物的攻擊檢定具有優勢。", 4: "若攻擊者位於該生物 5 呎內，任何命中該生物的攻擊都是重擊。"}]);
