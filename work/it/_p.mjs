// 物品批次填寫：自動套用既有物品中文名與常見小標
import fs from "fs";
import F from "../_fillfl.mjs";
const N = JSON.parse(fs.readFileSync("work/it/_names.json"));
export const NEW = {"Drow Poison": "卓爾毒",
"All-Purpose Tool": "萬用工具", "Amulet of the Devout": "虔信者護符", "Arcane Grimoire": "奧術魔典", "Bloodwell Vial": "血泉小瓶", "Moon Sickle": "月之鐮", "Rhythm-Maker's Drum": "節奏大師之鼓",
"Alchemical Compendium": "煉金大全", "Astral Shard": "星界碎片", "Astromancy Archive": "星象典藏", "Atlas of Endless Horizons": "無盡地平線地圖集",
"Barrier Tattoo (Large)": "屏障刺青（大）", "Barrier Tattoo (Medium)": "屏障刺青（中）", "Barrier Tattoo (Small)": "屏障刺青（小）", "Bell Branch": "鈴枝", "Blood Fury Tattoo": "血怒刺青", "Coiling Grasp Tattoo": "纏握刺青",
"Crook of Rao": "拉奧牧杖", "Crystalline Chronicle": "水晶編年史", "Devotee's Censer": "信徒香爐", "Duplicitous Manuscript": "欺詐手稿", "Eldritch Claw Tattoo": "魔能之爪刺青",
"Elemental Essence Shard": "元素精華碎片", "Elemental Essence Shard (Air)": "元素精華碎片（氣）", "Elemental Essence Shard (Earth)": "元素精華碎片（土）", "Elemental Essence Shard (Fire)": "元素精華碎片（火）", "Elemental Essence Shard (Water)": "元素精華碎片（水）",
"Far Realm Shard": "遠域碎片", "Feywild Shard": "妖精荒野碎片", "Fulminating Treatise": "爆裂論著", "Ghost Step Tattoo": "幽影步刺青", "Guardian Emblem": "守護者徽章", "Heart Weaver's Primer": "織心者入門書", "Illuminator's Tattoo": "繕寫者刺青",
"Libram of Souls and Flesh": "靈魂與血肉典籍", "Lifewell Tattoo": "生命之泉刺青", "Luba's Tarokka of Souls": "露芭的靈魂塔羅卡牌", "Lyre of Building": "建築里拉琴", "Masquerade Tattoo": "假面刺青", "Mighty Servant of Leuk-o": "盧克歐的強大僕從",
"Outer Essence Shard": "外層精華碎片", "Outer Essence Shard (Chaotic)": "外層精華碎片（混亂）", "Outer Essence Shard (Evil)": "外層精華碎片（邪惡）", "Outer Essence Shard (Good)": "外層精華碎片（善良）", "Outer Essence Shard (Lawful)": "外層精華碎片（守序）",
"Planecaller's Codex": "喚界者法典", "Protective Verses": "守護詩篇", "Reveler's Concertina": "狂歡者手風琴", "Shadowfell Brand Tattoo": "墮影冥界烙印刺青", "Shadowfell Shard": "墮影冥界碎片",
"Spellwrought Tattoo (1st Level)": "法術刺青（1 環）", "Spellwrought Tattoo (2nd Level)": "法術刺青（2 環）", "Spellwrought Tattoo (3rd Level)": "法術刺青（3 環）", "Spellwrought Tattoo (4th Level)": "法術刺青（4 環）", "Spellwrought Tattoo (5th Level)": "法術刺青（5 環）", "Spellwrought Tattoo (Cantrip)": "法術刺青（戲法）",
"Teeth of Dahlver-Nar": "達爾佛納之牙",
"Acid Absorbing Tattoo": "強酸吸收刺青", "Cold Absorbing Tattoo": "寒冷吸收刺青", "Fire Absorbing Tattoo": "火焰吸收刺青", "Force Absorbing Tattoo": "力場吸收刺青", "Lightning Absorbing Tattoo": "閃電吸收刺青", "Necrotic Absorbing Tattoo": "黯蝕吸收刺青", "Poison Absorbing Tattoo": "毒素吸收刺青", "Psychic Absorbing Tattoo": "心靈吸收刺青", "Radiant Absorbing Tattoo": "光耀吸收刺青", "Thunder Absorbing Tattoo": "雷鳴吸收刺青",
};
const nm = s => NEW[s] || N[s] || ((m => m && (NEW[m[2]] || N[m[2]]) ? `${m[1]} ${NEW[m[2]] || N[m[2]]}` : null)(/^(\+\d) (.+)$/.exec(s)));
const H = {"Random Properties": "隨機屬性", "Magic Weapon": "魔法武器", "Sentience": "知覺", "Personality": "個性", "Destroying the Book": "摧毀此書", "Destroying the Sword": "摧毀此劍", "Destroying the Wand": "摧毀此杖", "Destroying the Axe": "摧毀此斧", "Destroying the Orb": "摧毀寶珠", "Destroying the Eye and Hand": "摧毀眼與手"};
export default (batch, m) => {
	const en = JSON.parse(fs.readFileSync(`work/${batch}.en.json`)).items;
	en.forEach((it, i) => { m[i] ||= {}; it.s.forEach((s, j) => { const z = (j === 0 && nm(s)) || H[s]; if (z && m[i][j] == null) m[i][j] = z; }); });
	F(batch, m);
};
