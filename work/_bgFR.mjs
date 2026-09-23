import fill from "./_tcefill.mjs";
import fs from "fs";
const en = JSON.parse(fs.readFileSync("work/bg-FRHoF.en.json")).items;
const NAMES = {"Chondathan Freebooter": "昌達斯海盜", "Dead Magic Dweller": "死魔地居民", "Dragon Cultist": "龍之教徒", "Emerald Enclave Caretaker": "翡翠飛地看守人", "Flaming Fist Mercenary": "烈焰拳傭兵", "Genie Touched": "巨靈之觸", "Harper": "豎琴手", "Ice Fisher": "冰上漁夫", "Knight of the Gauntlet": "鐵手套騎士", "Lords' Alliance Vassal": "領主聯盟封臣", "Moonwell Pilgrim": "月井朝聖者", "Mulhorandi Tomb Raider": "穆霍蘭迪盜墓者", "Mythalkeeper": "秘境守護者", "Purple Dragon Squire": "紫龍騎士侍從", "Rashemi Wanderer": "拉申流浪者", "Shadowmasters Exile": "暗影大師流亡者", "Spellfire Initiate": "法術之火新手", "Zhentarim Mercenary": "桑達林傭兵"};
fill("bg-FRHoF", en.map(e => e.s.map((s, j) => j === 0 ? NAMES[s] : null)));
