// 獎勵（reward）重複句型的規則翻譯：export rule(s) → 中文或 null
const A = {Strength: "力量", Dexterity: "敏捷", Constitution: "體質", Intelligence: "智力", Wisdom: "感知", Charisma: "魅力"};
export const GOD = {Athreos: "阿崔歐斯", Ephara: "艾法拉", Erebos: "厄瑞玻斯", Heliod: "希里歐", Iroas: "伊洛斯", Karametra: "卡拉梅特拉", Keranos: "克拉諾斯", Klothys: "克洛西斯", Kruphix: "克魯菲克斯", Mogis: "莫吉斯", Nylea: "妮蕾雅", Pharika: "法莉卡", Phenax: "費納克斯", Purphoros: "普耳佛洛斯", Thassa: "薩莎"};
const N = {three: "三", five: "五", seven: "七", nine: "九"};
const note = s => s.replace(/(\d+)(?:st|nd|rd|th)-level version/, "$1 環版本").replace(/save /, "豁免 ").replace(/; /, "；").replace(/violet light only/, "僅限紫光").replace(/level (\d+) version/, "$1 環版本");
const SP = "(\\{@spell [^{}]+\\})";
const AL = {LG: "守序善良", NG: "中立善良", CG: "混亂善良", LN: "守序中立", N: "絕對中立", CN: "混亂中立", LE: "守序邪惡", NE: "中立邪惡", CE: "混亂邪惡"};
const R = [
	[/^(\w+)'s (Devotee|Votary|Disciple)$/, (m, g, k) => GOD[g] ? `${GOD[g]}的${{Devotee: "奉獻者", Votary: "誓願者", Disciple: "門徒"}[k]}` : null],
	[/^(LG|NG|CG|LN|N|CN|LE|NE|CE)$/, (m, a) => AL[a]],
	[/^\{@i Piety (\d+)\+ (\w+) trait\}$/, (m, n, g) => `{@i 虔誠值 ${n}+ ${GOD[g]}特性}`],
	[/^You can increase your (\w+) or (\w+) score by 2 and also increase your maximum for that score by 2\.$/, (m, a, b) => `你可以使你的${A[a]}或${A[b]}值增加 2，該屬性值的上限也增加 2。`],
	[new RegExp(`^You can cast ${SP} with this trait(, requiring no material components?)?(,? a number of times equal to your (\\w+) modifier \\(minimum of once\\))?\\.$`), (m, sp, nm, t, a) => `你可以用這項特性施放${sp}${nm ? "，無需材料構材" : ""}${t ? `，次數等同於你的${A[a]}調整值（最少一次）` : ""}。`],
	[/^Once you cast the spell in this way, you can't do so again until you finish a long rest\.$/, () => "以此方式施放該法術後，你在完成長休之前無法再這麼做。"],
	[/^(\w+) is your spellcasting ability for (this spell|these spells)\.$/, (m, a, w) => `${w === "this spell" ? "這個法術" : "這些法術"}的施法屬性是${A[a]}。`],
	[/^You regain all expended uses when you finish a long rest\.$/, () => "你在完成長休時恢復所有已消耗的次數。"],
	[/^You can cast the spell in this way a number of times equal to your (\w+) modifier \(minimum of once\)\.$/, (m, a) => `你可以用此方式施放該法術的次數等同於你的${A[a]}調整值（最少一次）。`],
	[/^Once you use this trait, you can't (?:do so|use it) again until you finish a long rest\.$/, () => "使用這項特性後，你在完成長休之前無法再次使用它。"],
	[/^In addition, you have advantage on saving throws against being (?:knocked )?(\{@condition \w+\})\.$/, (m, c) => `此外，你在對抗${c}狀態的豁免檢定上具有優勢。`],
	[new RegExp(`^In addition, you know the ${SP} cantrip\\.$`), (m, sp) => `此外，你習得${sp}戲法。`],
	[new RegExp(`^This charm allows you to cast the ${SP} (spell|cantrip)(?: \\(([^()]*)\\))? as an action(, no components required)?\\.$`), (m, sp, k, nt, nc) => `這個護咒讓你能用一個動作施放${sp}${k === "spell" ? "法術" : "戲法"}${nt ? `（${note(nt)}）` : ""}${nc ? "，無需任何構材" : ""}。`],
	[/^Once used(?: (three|nine|five) times)?, (?:this|the) charm (?:vanishes from you|goes away|vanishes)\.$/i, (m, n) => `使用${n ? `${N[n]}次` : ""}後，這個護咒便會從你身上消失。`],
	[/^Once all its charges have been expended, (?:this|the) charm vanishes from you\.$/i, () => "所有充能耗盡後，這個護咒便會從你身上消失。"],
	[/^Once you use (?:this|the) charm, it vanishes from you\.$/, () => "使用這個護咒後，它便會從你身上消失。"],
	[new RegExp(`^(As an action, you|You) can cast ${SP}, requiring no (?:spell|material) components and using your Intelligence, Wisdom, or Charisma as the spellcasting ability \\(your choice\\)\\.$`), (m, p, sp) => `你可以${p.startsWith("As") ? "用一個動作" : ""}施放${sp}，無需法術構材，並以你的智力、感知或魅力作為施法屬性（由你選擇）。`],
	[/^When you cast the spell in this way, it lasts its full duration with no concentration required\.$/, () => "以此方式施放該法術時，它無需專注即可持續完整的持續時間。"],
	[/^After it has been used (three|seven) times, the dark gift vanishes\.$/, (m, n) => `使用${N[n]}次後，這項黑暗贈禮便會消失。`],
	[new RegExp(`^This (?:dark )?gift allows its beneficiary to cast the ${SP} spell as an action\\.$`), (m, sp) => `這項黑暗贈禮讓受益者能用一個動作施放${sp}法術。`],
	[/^Th(?:is|ese) benefits? lasts? for (\d+) days, after which the dark gift vanishes\.$/, (m, n) => `這項增益持續 ${n} 天，之後這項黑暗贈禮便會消失。`],
	[/^The host's (\w+) score becomes 23, unless it is already higher\.$/, (m, a) => `宿主的${A[a]}值變為 23，除非原本已更高。`],
	[new RegExp(`^This Charm allows you to cast ${SP}\\.$`), (m, sp) => `這個護咒讓你能施放${sp}。`],
	[/^Your (\w+) score increases by 2, (?:up )?to a maximum of 22\.$/, (m, a) => `你的${A[a]}值增加 2，上限為 22。`],
	[/^After spending a \{@variantrule Long Rest\|XPHB\} in your \{@book Bastion\|XDMG\|7\}, you gain a magical Charm \(see "\{@book Supernatural Gifts\|XDMG\|2\|Supernatural Gifts\}" in \{@book chapter 3\|XDMG\|2\}\) that lasts for 7 days or until you use it\.$/, () => "在你的{@book 堡壘|XDMG|7}中度過一次{@variantrule Long Rest|XPHB|長休}後，你獲得一個魔法護咒（見{@book 第 3 章|XDMG|2}的「{@book 超自然贈禮|XDMG|2|Supernatural Gifts}」），它持續 7 天或直到你使用它為止。"],
	[new RegExp(`^The Charm allows you to cast ${SP} (once )?without expending a spell slot( or using Material components)?\\.$`), (m, sp, o, mc) => `這個護咒讓你無需消耗法術位${mc ? "或使用材料構材" : ""}即可施放${o ? "一次" : ""}${sp}。`],
	[/^You can't gain this Charm again while you still have it\.$/, () => "你仍擁有這個護咒時，無法再次獲得它。"],
	[/^When you use a spell slot to cast a spell (from the Necromancy school|that deals Fire damage|that deals Cold damage|that restores Hit Points or deals Radiant damage), you can expend the Charm \(no action required\) to treat the spell as if it were cast using a spell slot 1 level above the slot expended\.$/, (m, k) => `當你使用法術位施放${{"from the Necromancy school": "死靈學派的法術", "that deals Fire damage": "造成火焰傷害的法術", "that deals Cold damage": "造成寒冰傷害的法術", "that restores Hit Points or deals Radiant damage": "恢復生命值或造成光耀傷害的法術"}[k]}時，你可以消耗這個護咒（無需動作），將該法術視為以比所消耗法術位高 1 環的法術位施放。`],
];
const one = s => { for (const [re, fn] of R) { const m = re.exec(s); if (m) return fn(...m); } return null; };
export const rule = s => {
	const whole = one(s); if (whole) return whole;
	const parts = s.split(/(?<=[.)]) (?=[A-Z])/);
	if (parts.length < 2) return null;
	const out = parts.map(one);
	return out.every(Boolean) ? out.join("") : null;
};
