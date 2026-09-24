// 法術批次填寫：自動套用法術名（dist 既有譯名＋新譯名）與常見小標
import fs from "fs";
import F from "../_fillfl.mjs";
const DIST = JSON.parse(fs.readFileSync("work/sp/_names.json"));
export const NEW = {
"Tasha's Caustic Brew": "塔莎腐蝕酸液", "Tasha's Mind Whip": "塔莎心靈鞭笞", "Intellect Fortress": "智識堡壘", "Spirit Shroud": "靈魂帷幕",
"Summon Shadowspawn": "召喚暗影之子", "Tasha's Otherworldly Guise": "塔莎異界形貌", "Blade of Disaster": "災厄之刃", "Dream of the Blue Veil": "藍帷之夢",
"Dark Star": "暗星", "Fortune's Favor": "命運眷顧", "Gift of Alacrity": "敏捷恩賜", "Gravity Fissure": "重力裂隙", "Gravity Sinkhole": "重力陷坑",
"Immovable Object": "不動之物", "Magnify Gravity": "重力增幅", "Pulse Wave": "脈衝波", "Ravenous Void": "飢餓虛空", "Reality Break": "現實崩解",
"Sapping Sting": "汲取之刺", "Temporal Shunt": "時間轉移", "Tether Essence": "本質繫結", "Time Ravage": "時光摧殘", "Wristpocket": "腕袋術",
"Ashardalon's Stride": "阿沙達隆之步", "Draconic Transformation": "龍化術", "Fizban's Platinum Shield": "費茲本白金盾", "Nathair's Mischief": "納瑟爾的惡作劇",
"Raulothim's Psychic Lance": "勞洛席姆心靈長槍", "Rime's Binding Ice": "萊姆束縛寒冰", "Summon Draconic Spirit": "召喚龍靈",
"Air Bubble": "空氣泡", "Create Spelljamming Helm": "製造星界舵",
"Distort Value": "扭曲價值", "Fast Friends": "速成朋友", "Gift of Gab": "三寸之舌", "Incite Greed": "煽動貪婪", "Jim's Glowing Coin": "吉姆的發光硬幣", "Jim's Magic Missile": "吉姆的魔法飛彈", "Motivational Speech": "激勵演說",
"Linked Glyphs": "連結符文", "Antagonize": "挑釁術", "Spirit of Death": "死亡之靈", "Spray of Cards": "紙牌噴射", "Homunculus Servant": "侏儒僕從",
"Create Magen": "製造魔像人", "Frost Fingers": "霜指術", "Gate Seal": "傳送門封印", "Warp Sense": "扭曲感知",
"Borrowed Knowledge": "借用知識", "Kinetic Jaunt": "動能疾行", "Silvery Barbs": "銀色倒刺", "Vortex Warp": "漩渦扭曲", "Wither and Bloom": "凋零與綻放",
"Alustriel's Mooncloak": "阿盧絲翠爾月之斗篷", "Backlash": "反噬", "Cacophonic Shield": "刺耳護盾", "Conjure Constructs": "咒喚構裝體", "Death Armor": "死亡護甲",
"Deryan's Helpful Homunculi": "戴利安的熱心小侏儒", "Dirge": "輓歌", "Doomtide": "末日浪潮", "Elminster's Effulgent Spheres": "伊爾明斯特耀光法球", "Elminster's Elusion": "伊爾明斯特遁影術",
"Holy Star of Mystra": "密斯特拉聖星", "Laeral's Silver Lance": "萊拉銀槍", "Simbul's Synostodweomer": "辛布爾的咒轉療術", "Songal's Elemental Suffusion": "松格爾元素灌注",
"Spellfire Flare": "法火閃焰", "Spellfire Storm": "法火風暴", "Syluné's Viper": "希露妮之蛇", "Wardaway": "驅護術",
};
const HEAD = {"At Higher Levels": "升環效果", "Cantrip Upgrade": "戲法升級", "Using a Higher-Level Spell Slot": "使用更高環階的法術欄位"};
export default (batch, m) => {
	const en = JSON.parse(fs.readFileSync(`work/${batch}.en.json`)).items;
	en.forEach((it, i) => { m[i] ||= {}; it.s.forEach((s, j) => { const z = (j === 0 && (NEW[s] || DIST[s])) || HEAD[s]; if (z && m[i][j] == null) m[i][j] = z; }); });
	F(batch, m);
};
