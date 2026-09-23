import fill from "./_tcefill.mjs";
const NOTE = "{@note 由{@subclassFeature Eldritch Cannon|Artificer|TCE|Artillerist|TCE|3}子職業特性創造。}";
fill("tce-art-mon", [
["侏儒僕從", "天生護甲", "反射閃避", "若侏儒僕從受到一個允許它進行敏捷豁免檢定以只受一半傷害的效果影響，它在豁免成功時改為不受傷害，豁免失敗時只受一半傷害。若它處於{@condition incapacitated}狀態，便無法使用此特性。",
 "力場打擊", "{@atk rw} {@hitYourSpellAttack}命中，射程 30 呎，一個你能看見的目標。{@h}{@damage 1d4 + PB} 力場傷害。",
 "引導魔法", "侏儒僕從傳遞一道你施展的、射程為觸碰的法術。侏儒僕從必須位於你 120 呎內。"],
[null, "天生護甲", "警戒", "衛士無法被{@status surprised}。", null,
 "{@atk mw} {@hitYourSpellAttack}命中，觸及 5 呎，一個你能看見的目標。{@h}{@damage 1d8 + PB} 力場傷害。", null,
 "衛士體內的魔法機械為自身或其 5 呎內的一個構裝生物或物件恢復 {@dice 2d8 + PB} 生命值。", null,
 "衛士對其 5 呎內一個它能看見的生物的攻擊檢定施加劣勢，前提是該攻擊檢定的目標不是衛士本身。"],
]);
fill("tce-art-obj", [
["異界砲（噴火器）", NOTE, null, "砲朝你指定的相鄰 15 呎錐形範圍噴吐火焰。該區域內的每個生物必須進行一次對抗你法術豁免 DC 的敏捷豁免檢定，豁免失敗時受到 {@damage 2d8} 火焰傷害，成功則傷害減半。火焰會點燃區域內未被穿戴或攜帶的易燃物件。", null],
["異界砲（力場弩砲）", NOTE, null, "以砲為起點，對其 120 呎內的一個生物或物件進行一次遠程法術攻擊。命中時，目標受到 {@damage 2d8} 力場傷害；若目標是生物，它被推離砲至多 5 呎。", null],
["異界砲（守護者）", NOTE, null, "砲釋放一陣正能量，使自身與其 10 呎內每個由你選擇的生物獲得臨時生命值，數值等同於 {@damage 1d8} + 你的智力調整值（至少 +1）。", null],
]);
