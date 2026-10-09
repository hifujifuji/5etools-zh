// 魔法變體重複句型的規則
const DT = {fire: "火焰", radiant: "光耀", "acid or poison": "酸蝕或毒素", "lightning or thunder": "閃電或雷鳴", necrotic: "死靈", cold: "寒冰", force: "力場", psychic: "精神"};
const PL = {Fernian: "費尼亞", Irian: "伊里安", Kythrian: "基斯瑞", Lamannian: "拉曼尼亞", Mabaran: "瑪巴爾", Risian: "里西亞", Shavarran: "沙瓦拉斯", Xorian: "佐瑞亞特"};
const MAT = {Ash: "白蠟木", Rosewood: "玫瑰木", Manchineel: "毒番石榴木", Oak: "橡木", Ebony: "烏木", Pine: "松木", Birch: "樺木", Wenge: "雞翅木", Basalt: "玄武岩", Quartz: "石英", Skarn: "矽卡岩", Flint: "燧石", Obsidian: "黑曜石", Shale: "頁岩", Chert: "燧岩", Marble: "大理石"};
const lv = l => l === "Cantrip" ? "戲法" : `${l.replace("Level ", "")} 環`;
const R = [
	[/^Enspelled (Armor|Weapon) \((Cantrip|Level \d)\)$/, (m, k, l) => `法術封存${k === "Armor" ? "護甲" : "武器"}（${lv(l)}）`],
	[/^Bound into this (armor|weapon) is a (cantrip|level (\d) spell)\. The (?:cantrip|spell) is determined when the (?:armor|weapon) is created and must belong to the \{@filter ([^|]+)\|(spells\|[^}]+)\} school of magic\. The (?:armor|weapon) has 6 charges and regains \{@dice 1d6\} expended charges daily at dawn\. While (wearing|holding) the (?:armor|weapon), you can expend 1 charge to cast its spell\.$/,
		(m, k, c, n, sch, f, w) => { const K = k === "armor" ? "護甲" : "武器"; const S = c === "cantrip" ? "戲法" : "法術"; const zs = sch.includes("Abjuration") ? "防護或幻術" : "咒法、預言、塑能、死靈或變化"; return `這件${K}中封存著一道${n ? `${n} 環法術` : "戲法"}。該${S}在${K}製作時決定，且必須屬於{@filter ${zs}|${f}}學派。這件${K}有 6 點充能，每天黎明時恢復 {@dice 1d6} 點已消耗的充能。${w === "wearing" ? "穿著" : "持握"}這件${K}時，你可以消耗 1 點充能來施放其中的法術。`; }],
	[/^You have a \+(\d) bonus to attack and damage rolls made with this piece of magic ammunition\. Once it hits a target, the ammunition is no longer magical\.$/, (m, n) => `你以這枚魔法彈藥進行的攻擊檢定與傷害擲骰具有 +${n} 加值。一旦命中目標，這枚彈藥便不再具有魔法。`],
	[/^This ammunition is typically found or sold in quantities of ten or twenty pieces\. Ten pieces of this ammunition are equivalent in value to a potion of the same rarity \{@note \(\{@table ([^}|]+\|XDMG)\|([\d,]+ GP)\}\)\}\.$/, (m, t, gp) => `這種彈藥通常以十枚或二十枚為單位被發現或販售。十枚這種彈藥的價值等同於一瓶相同稀有度的藥水{@note （{@table ${t}|${gp}}）}。`],
	[/^\+(\d) Shield \(\*\)$/, (m, n) => `盾牌+${n}（*）`],
	[/^\{@note \* This generic variant has the same name and source as the item (\{@item [^}]+\})\}\.$/, (m, it) => `{@note * 這個通用變體與物品${it}的名稱與來源相同}。`],
	[/^While holding this shield, you have a (\+\d|\{=bonusAc\}) bonus to AC\. This bonus is in addition to the shield's normal bonus to AC\.$/, (m, b) => `持握這面盾牌時，你的 AC 具有 ${b} 加值。這項加值是在盾牌正常的 AC 加值之外額外獲得的。`],
	[/^While holding this Shield, you have a (\+\d|\{=bonusAc\}) bonus to \{@variantrule Armor Class\|XPHB\}, in addition to the Shield's normal bonus to AC\.$/, (m, b) => `持握這面盾牌時，你的{@variantrule Armor Class|XPHB|護甲等級}具有 ${b} 加值，這是在盾牌正常的 AC 加值之外額外獲得的。`],
	[/^Imbued Wood \((\w+) (\w+)\)$/, (m, p, w) => `蘊能木（${PL[p]}${MAT[w]}）`],
	[/^Orb of Shielding \((\w+) (\w+)\)$/, (m, p, w) => `護盾法球（${PL[p]}${MAT[w]}）`],
	[/^When you cast a damage-dealing spell using this item as your spellcasting focus, you gain a \+1 bonus to one (.+) damage roll of the spell\.$/, (m, d) => `當你以這件物品作為施法法器施放造成傷害的法術時，該法術的一次${DT[d]}傷害擲骰獲得 +1 加值。`],
	[/^If you're holding the orb when you take (.+) damage, you can use your reaction to reduce the damage by \{@dice 1d4\} \(to a minimum of 0\)\.$/, (m, d) => `若你受到${DT[d]}傷害時正持握這顆法球，你可以用你的反應使該傷害減少 {@dice 1d4}（最低為 0）。`],
	[/^Drow \+(\d) (Armor|Weapon)$/, (m, n, k) => `卓爾${k === "Armor" ? "護甲" : "武器"}+${n}`],
	[/^Armor of Vulnerability \((\w+)\)$/, (m, d) => `易傷護甲（${{Bludgeoning: "鈍擊", Piercing: "穿刺", Slashing: "劈砍"}[d]}）`],
	[/^While wearing this armor, you have \{@variantrule Resistance\|XPHB\} to (\w+) damage\.$/, (m, d) => `穿著這件護甲時，你具有${{Bludgeoning: "鈍擊", Piercing: "穿刺", Slashing: "劈砍"}[d]}傷害{@variantrule Resistance|XPHB|抗性}。`],
	[/^This armor is cursed, a fact that is revealed only when the \{@spell Identify\|XPHB\} spell is cast on the armor or you attune to it\. Attuning to the armor curses you until you are targeted by a \{@spell Remove Curse\|XPHB\} spell or similar magic; removing the armor fails to end the curse\. While cursed, you have \{@variantrule Vulnerability\|XPHB\} to (\w+) and (\w+) damage\.$/, (m, a, b) => { const D = {Bludgeoning: "鈍擊", Piercing: "穿刺", Slashing: "劈砍"}; return `這件護甲受到詛咒，只有對護甲施放{@spell Identify|XPHB}法術或你與它同調時才會揭露這件事。與這件護甲同調會使你受到詛咒，直到你成為{@spell Remove Curse|XPHB}法術或類似魔法的目標為止；脫下護甲無法終止詛咒。受詛咒期間，你具有${D[a]}與${D[b]}傷害{@variantrule Vulnerability|XPHB|易傷}。`; }],
	[/^\{#itemEntry [^}]+\}$/, m => m],
];
export const rule = s => { for (const [re, fn] of R) { const m = re.exec(s); if (m) return fn(...m); } return null; };
