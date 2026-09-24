import F from "../_fillfl.mjs";
const PB = "{@variantrule Proficiency|XPHB|熟練加值}", ST = "{@variantrule Saving Throw|XPHB|豁免檢定}";
F("vr-XPHB-5", [
{1: "臨時生命值由某些效果給予，作為失去真正{@variantrule Hit Points|XPHB}前的緩衝。"},
{1: "你可以不使用武器進行近戰攻擊，改用拳打、腳踢、頭槌或類似的強力一擊。在遊戲規則中，這就是徒手打擊——一種以你的身體對你 5 呎內的目標造成傷害、擒抱或推撞的近戰攻擊。",
 2: "每當你使用徒手打擊時，從下列選項中選擇一項作為其效果。",
 4: `你對目標進行一次攻擊檢定。你在該擲骰上的加值等於你的力量調整值加上你的${PB}。命中時，目標受到等同於 1 加上你力量調整值的鈍擊傷害。`,
 6: `目標必須成功通過一次力量或敏捷${ST}（由它選擇），否則陷入{@condition Grappled|XPHB}狀態。該${ST}以及任何脫逃嘗試的 DC 等於 8 加上你的力量調整值與${PB}。只有當目標的體型比你大不超過一級，且你有一隻空著的手可以抓住它時，才能進行這種擒抱。`,
 8: `目標必須成功通過一次力量或敏捷${ST}（由它選擇），否則你將它推離 5 呎，或使其陷入{@condition Prone|XPHB}狀態。該${ST}的 DC 等於 8 加上你的力量調整值與${PB}。只有當目標的體型比你大不超過一級時，才能進行這種推撞。`},
{1: "若某個空間中沒有生物，也沒有被物件完全填滿，該空間便是未被佔據的。"},
{1: "若你對某種{@variantrule Damage Types|XPHB|傷害類型}具有易傷，該類型的傷害對你加倍。易傷對同一次傷害只會套用一次。"},
{1: "武器是屬於{@filter 簡易|items|category=basic|type=simple weapon}或{@filter 軍用|items|category=basic|type=martial weapon}武器類別的物件。"},
{1: "武器攻擊是以武器進行的攻擊檢定。"},
]);
