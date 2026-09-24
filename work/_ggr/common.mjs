export const G = {Azorius: "阿佐理斯", Boros: "波洛斯", Dimir: "底密爾", Golgari: "葛加理", Gruul: "古魯", Izzet: "伊捷", Orzhov: "歐佐夫", Rakdos: "拉鐸斯", Selesnya: "瑟雷尼亞", Simic: "析米克"};
export const COMMON = {};
for (const [en, zh] of Object.entries(G)) Object.assign(COMMON, {
	[`${en} Guild Spells`]: `${zh}公會法術`,
	[`For you, the spells on the ${en} Guild Spells table are added to the spell list of your spellcasting class. (If you are a multiclass character with multiple spell lists, these spells are added to all of them.)`]: `對你而言，「${zh}公會法術」表中的法術會加入你施法職業的法術列表。（若你是擁有多個法術列表的兼職角色，這些法術會加入所有列表。）`,
	[`Roll twice on the ${en} Contacts table (for an ally and a rival) and once on the Non-${en} Contacts table.`]: `在「${zh}人脈」表上擲骰兩次（一位盟友與一位對手），並在「非${zh}人脈」表上擲骰一次。`,
	[`${en} Contacts`]: `${zh}人脈`, [`Non-${en} Contacts`]: `非${zh}人脈`,
	[`Roll an additional ${en} contact; you can decide if the contact is an ally or a rival.`]: `額外擲一位${zh}人脈；你可以決定該人脈是盟友還是對手。`,
});
Object.assign(COMMON, {"Contacts": "人脈", "Contact": "人脈", "How Do I Fit In?": "我該如何融入？", "{@b Guild}. My guild is all that really matters. (Any)": "{@b 公會}。我的公會才是唯一真正重要的。（任意）"});
