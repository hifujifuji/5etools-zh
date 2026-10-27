// 自動選擇用的偏好設定：屬性優先順序、技能偏好、推薦法術、血系
"use strict";

const AB = ["str", "dex", "con", "int", "wis", "cha"];
const ABZH = {str: "力量", dex: "敏捷", con: "體質", int: "智力", wis: "感知", cha: "魅力"};
const STD_ARRAY = [15, 14, 13, 12, 10, 8];
const PB_COST = {8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9};

const DMG_ZH = {
	acid: "酸蝕", bludgeoning: "鈍擊", cold: "寒冰", fire: "火焰", force: "力場", lightning: "閃電",
	necrotic: "死靈", piercing: "穿刺", poison: "毒素", psychic: "精神", radiant: "光耀", slashing: "劈砍", thunder: "雷鳴",
	B: "鈍擊", P: "穿刺", S: "劈砍",
};
const SIZE_ZH = {S: "小型", M: "中型", L: "大型"};
const ALIGN = ["守序善良", "中立善良", "混亂善良", "守序中立", "絕對中立", "混亂中立", "守序邪惡", "中立邪惡", "混亂邪惡"];

// 屬性值優先順序（標準陣列由高到低分配）
const AB_PRI = {
	Artificer: ["int", "con", "dex", "wis", "str", "cha"],
	Barbarian: ["str", "con", "dex", "wis", "cha", "int"],
	Bard: ["cha", "dex", "con", "wis", "int", "str"],
	Cleric: ["wis", "con", "str", "dex", "cha", "int"],
	Druid: ["wis", "con", "dex", "int", "cha", "str"],
	Fighter: ["str", "con", "dex", "wis", "cha", "int"],
	Monk: ["dex", "wis", "con", "str", "int", "cha"],
	Paladin: ["str", "cha", "con", "wis", "dex", "int"],
	Ranger: ["dex", "wis", "con", "str", "int", "cha"],
	Rogue: ["dex", "con", "wis", "int", "cha", "str"],
	Sorcerer: ["cha", "con", "dex", "wis", "int", "str"],
	Warlock: ["cha", "con", "dex", "wis", "int", "str"],
	Wizard: ["int", "con", "dex", "wis", "cha", "str"],
};

const SK_ANY = ["perception", "stealth", "insight", "athletics", "persuasion", "survival", "acrobatics", "investigation", "arcana", "medicine", "deception", "intimidation", "nature", "history", "religion", "sleight of hand", "animal handling", "performance"];
const SK_PRI = {
	Artificer: ["arcana", "investigation", "perception", "sleight of hand", "history", "medicine", "nature"],
	Barbarian: ["perception", "athletics", "intimidation", "survival", "animal handling", "nature"],
	Bard: ["persuasion", "deception", "performance", "insight", "perception", "stealth", "arcana", "acrobatics", "sleight of hand", "investigation"],
	Cleric: ["insight", "medicine", "persuasion", "religion", "history"],
	Druid: ["perception", "nature", "insight", "animal handling", "medicine", "survival", "arcana", "religion"],
	Fighter: ["athletics", "perception", "intimidation", "survival", "acrobatics", "insight", "persuasion", "animal handling", "history"],
	Monk: ["acrobatics", "stealth", "insight", "athletics", "history", "religion"],
	Paladin: ["athletics", "persuasion", "insight", "intimidation", "medicine", "religion"],
	Ranger: ["perception", "stealth", "survival", "nature", "insight", "investigation", "athletics", "animal handling"],
	Rogue: ["stealth", "perception", "acrobatics", "sleight of hand", "deception", "insight", "investigation", "persuasion", "athletics", "intimidation"],
	Sorcerer: ["persuasion", "arcana", "deception", "insight", "intimidation", "religion"],
	Warlock: ["arcana", "deception", "intimidation", "investigation", "history", "nature", "religion"],
	Wizard: ["arcana", "investigation", "history", "insight", "medicine", "nature", "religion"],
};

// 推薦法術（依優先順序；不在清單內的法術排在後面）
const SP_PRI = {
	Artificer: {
		c: ["guidance", "fire bolt", "mage hand", "shocking grasp", "prestidigitation", "light", "ray of frost", "message", "thorn whip", "spare the dying", "acid splash", "poison spray", "resistance", "sorcerous burst"],
		s: ["cure wounds", "faerie fire", "grease", "absorb elements", "detect magic", "feather fall", "shield of faith", "sanctuary", "heroism", "identify", "jump", "longstrider", "aid", "lesser restoration", "magic weapon", "heat metal", "web", "invisibility", "enhance ability", "spider climb", "see invisibility", "haste", "fly", "revivify", "dispel magic", "protection from energy", "glyph of warding", "blink", "freedom of movement", "stoneskin", "fire shield", "death ward", "greater restoration", "wall of stone", "animate objects", "bigby's hand", "creation"],
	},
	Bard: {
		c: ["vicious mockery", "minor illusion", "mage hand", "prestidigitation", "light", "dancing lights", "friends", "message", "thunderclap", "starry wisp", "true strike", "mending", "blade ward"],
		s: ["healing word", "dissonant whispers", "faerie fire", "charm person", "sleep", "heroism", "thunderwave", "bane", "cure wounds", "detect magic", "silence", "invisibility", "hold person", "shatter", "suggestion", "lesser restoration", "hypnotic pattern", "fear", "dispel magic", "leomund's tiny hut", "bestow curse", "greater invisibility", "polymorph", "dimension door", "confusion", "synaptic static", "animate objects", "raise dead", "mass cure wounds", "otto's irresistible dance", "mass suggestion", "forcecage", "teleport", "mind blank", "power word stun", "foresight"],
	},
	Cleric: {
		c: ["sacred flame", "guidance", "toll the dead", "thaumaturgy", "light", "spare the dying", "word of radiance", "mending", "resistance"],
		s: ["bless", "healing word", "guiding bolt", "cure wounds", "shield of faith", "command", "detect magic", "sanctuary", "spiritual weapon", "aid", "lesser restoration", "hold person", "silence", "prayer of healing", "spirit guardians", "revivify", "dispel magic", "mass healing word", "remove curse", "banishment", "death ward", "guardian of faith", "freedom of movement", "greater restoration", "mass cure wounds", "flame strike", "raise dead", "heal", "harm", "word of recall", "blade barrier", "regenerate", "fire storm", "resurrection", "holy aura", "earthquake", "mass heal", "gate", "true resurrection"],
	},
	Druid: {
		c: ["guidance", "produce flame", "shillelagh", "starry wisp", "thorn whip", "druidcraft", "mending", "poison spray", "resistance", "thunderclap", "elementalism"],
		s: ["healing word", "entangle", "faerie fire", "goodberry", "cure wounds", "thunderwave", "fog cloud", "detect magic", "moonbeam", "pass without trace", "spike growth", "lesser restoration", "heat metal", "barkskin", "conjure animals", "call lightning", "plant growth", "dispel magic", "sleet storm", "polymorph", "wall of fire", "ice storm", "stoneskin", "mass cure wounds", "wall of stone", "insect plague", "greater restoration", "tree stride", "heal", "sunbeam", "wind walk", "transport via plants", "regenerate", "fire storm", "reverse gravity", "sunburst", "animal shapes", "foresight", "shapechange", "storm of vengeance"],
	},
	Paladin: {
		c: [],
		s: ["bless", "cure wounds", "shield of faith", "heroism", "command", "searing smite", "thunderous smite", "wrathful smite", "protection from evil and good", "detect magic", "aid", "lesser restoration", "magic weapon", "prayer of healing", "zone of truth", "revivify", "dispel magic", "crusader's mantle", "blinding smite", "elemental weapon", "aura of vitality", "remove curse", "banishment", "death ward", "aura of life", "aura of purity", "staggering smite", "destructive wave", "circle of power", "raise dead", "geas", "dispel evil and good", "banishing smite"],
	},
	Ranger: {
		c: [],
		s: ["cure wounds", "goodberry", "ensnaring strike", "hail of thorns", "fog cloud", "entangle", "longstrider", "speak with animals", "pass without trace", "spike growth", "lesser restoration", "silence", "barkskin", "summon beast", "conjure barrage", "lightning arrow", "plant growth", "protection from energy", "summon fey", "conjure animals", "freedom of movement", "stoneskin", "summon elemental", "conjure volley", "swift quiver", "tree stride", "steel wind strike"],
	},
	Sorcerer: {
		c: ["fire bolt", "mind sliver", "minor illusion", "mage hand", "prestidigitation", "light", "shocking grasp", "ray of frost", "sorcerous burst", "message", "chill touch"],
		s: ["shield", "magic missile", "chromatic orb", "sleep", "burning hands", "mage armor", "detect magic", "feather fall", "scorching ray", "misty step", "hold person", "invisibility", "mirror image", "suggestion", "fireball", "counterspell", "haste", "fly", "lightning bolt", "hypnotic pattern", "greater invisibility", "polymorph", "banishment", "dimension door", "wall of fire", "synaptic static", "cone of cold", "hold monster", "telekinesis", "chain lightning", "disintegrate", "globe of invulnerability", "sunbeam", "finger of death", "plane shift", "teleport", "sunburst", "dominate monster", "wish", "meteor swarm", "time stop", "power word kill"],
	},
	Warlock: {
		c: ["eldritch blast", "mind sliver", "minor illusion", "prestidigitation", "mage hand", "toll the dead", "chill touch", "friends", "blade ward"],
		s: ["hex", "armor of agathys", "hellish rebuke", "protection from evil and good", "charm person", "witch bolt", "misty step", "hold person", "invisibility", "mirror image", "suggestion", "darkness", "counterspell", "hypnotic pattern", "fly", "hunger of hadar", "banishment", "dimension door", "synaptic static", "hold monster", "circle of death", "mass suggestion", "arcane gate", "finger of death", "plane shift", "dominate monster", "power word stun", "foresight", "power word kill", "true polymorph"],
	},
	Wizard: {
		c: ["fire bolt", "mage hand", "minor illusion", "prestidigitation", "light", "mind sliver", "ray of frost", "shocking grasp", "message", "toll the dead"],
		s: ["shield", "magic missile", "mage armor", "detect magic", "find familiar", "sleep", "feather fall", "chromatic orb", "burning hands", "thunderwave", "misty step", "scorching ray", "invisibility", "mirror image", "hold person", "web", "fireball", "counterspell", "fly", "haste", "hypnotic pattern", "dispel magic", "polymorph", "greater invisibility", "banishment", "dimension door", "wall of force", "cone of cold", "telekinesis", "hold monster", "synaptic static", "disintegrate", "chain lightning", "globe of invulnerability", "forcecage", "teleport", "plane shift", "finger of death", "maze", "power word stun", "befuddlement", "wish", "time stop", "meteor swarm", "power word kill"],
	},
};

// 種族血系／血統：名稱與機制效果
const LINEAGE = {
	Dragonborn: {label: "龍族血統", opts: [
		{id: "black", zh: "黑龍", dmg: "acid"}, {id: "blue", zh: "藍龍", dmg: "lightning"}, {id: "brass", zh: "黃銅龍", dmg: "fire"},
		{id: "bronze", zh: "青銅龍", dmg: "lightning"}, {id: "copper", zh: "赤銅龍", dmg: "acid"}, {id: "gold", zh: "金龍", dmg: "fire"},
		{id: "green", zh: "綠龍", dmg: "poison"}, {id: "red", zh: "紅龍", dmg: "fire"}, {id: "silver", zh: "銀龍", dmg: "cold"}, {id: "white", zh: "白龍", dmg: "cold"},
	]},
	Elf: {label: "精靈血系", ab: true, opts: [
		{id: "drow", zh: "卓爾", dv: 120, sp: {1: ["dancing lights"], 3: ["faerie fire"], 5: ["darkness"]}},
		{id: "high", zh: "高等精靈", sp: {1: ["prestidigitation"], 3: ["detect magic"], 5: ["misty step"]}},
		{id: "wood", zh: "木精靈", speed: 35, sp: {1: ["druidcraft"], 3: ["longstrider"], 5: ["pass without trace"]}},
	]},
	Gnome: {label: "地侏血系", ab: true, opts: [
		{id: "forest", zh: "森林地侏", sp: {1: ["minor illusion", "speak with animals"]}},
		{id: "rock", zh: "岩石地侏", sp: {1: ["mending", "prestidigitation"]}},
	]},
	Goliath: {label: "巨人血統", opts: [
		{id: "cloud", zh: "雲之漫步（雲巨人）"}, {id: "fire", zh: "火之灼燒（火巨人）"}, {id: "frost", zh: "霜之寒意（霜巨人）"},
		{id: "hill", zh: "丘之翻滾（山丘巨人）"}, {id: "stone", zh: "石之堅忍（石巨人）"}, {id: "storm", zh: "暴風之雷（風暴巨人）"},
	]},
	Tiefling: {label: "邪魔傳承", ab: true, opts: [
		{id: "abyssal", zh: "深淵", res: "poison", sp: {1: ["poison spray", "thaumaturgy"], 3: ["ray of sickness"], 5: ["hold person"]}},
		{id: "chthonic", zh: "冥府", res: "necrotic", sp: {1: ["chill touch", "thaumaturgy"], 3: ["false life"], 5: ["ray of enfeeblement"]}},
		{id: "infernal", zh: "煉獄", res: "fire", sp: {1: ["fire bolt", "thaumaturgy"], 3: ["hellish rebuke"], 5: ["darkness"]}},
	]},
	Aasimar: {opts: null, sp: {1: ["light"]}},
};

const LANG_BY_SPECIES = {Elf: "Elvish", Dwarf: "Dwarvish", Halfling: "Halfling", Gnome: "Gnomish", Orc: "Orc", Dragonborn: "Draconic", Goliath: "Giant", Tiefling: "Elvish", Aasimar: "Dwarvish", Human: "Elvish"};
const LANG_ANY = ["Elvish", "Dwarvish", "Draconic", "Giant", "Halfling", "Gnomish", "Orc", "Goblin", "Common Sign Language"];

// 起源專長（人類多才多藝）與史詩恩賜的預設
const DEF_ORIGIN = "alert";
const DEF_BOON = cls => (["Artificer", "Wizard", "Sorcerer", "Warlock", "Cleric", "Druid", "Bard"].includes(cls) ? "boon of spell recall" : "boon of fortitude");
const DEF_FS = (cls, eq) => (cls === "Ranger" || (cls === "Fighter" && eq === "B") ? "archery" : "defense");
