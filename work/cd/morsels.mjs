import {add} from "./_c.mjs";
const N = {
	"Bacon-Wrapped Smoked Mussels": "培根捲煙燻淡菜", "Beluir Salmon Spread": "貝魯爾鮭魚抹醬", "Black Lotus Root": "黑蓮藕", "Butternut Beer": "奶油堅果啤酒", "Chultan Zombie": "楚爾特殭屍",
	"Cloaks": "斗篷", "Cocoa Broth": "可可熱湯", "Dwarven Mulled Wine": "矮人香料熱紅酒", "Elverquisst": "艾弗奎斯特酒", "Exploding Cheese Puffs": "爆炸起司泡芙", "Feywild Eggs": "妖精荒野蛋",
	"Fig Cakes": "無花果糕", "Green Ice Rime": "綠冰霜", "Greenspear Bundles in Bacon": "培根綠矛捲", "Halfling Finger Sandwiches": "半身人手指三明治", "Halfling Oatmeal Sweet Nibbles": "半身人燕麥小甜點",
	"Hot River Crab Bites": "熱河蟹小點", "Hot Spiced Cider": "熱香料蘋果酒", "Introduction": "引言", "Irlymeyer's Dragonfire Punch": "厄利梅爾的龍火潘趣酒", "Iron Rations": "鐵口糧",
	"Lluirwood Salad": "盧爾森林沙拉", "Meal's End": "餐末點心", "Moonwood Artichoke Spread": "月林朝鮮薊抹醬", "Neverwinter Cheese Board": "絕冬城起司拼盤", "Neverwinter Nectar": "絕冬城甘露",
	"Night Hag's Delight": "夜鬼婆之喜", "Par-Salian's Tea": "帕薩理安的茶", "Potion of Restoration": "復原藥水", "Purple Grapemash No. 3": "紫葡萄醪三號", "Quith-pa": "奎斯帕", "Rollrum": "滾滾蘭姆",
	"Ruby Cordial": "紅寶石甜酒", "Saerloonian Glowfire": "塞爾倫輝火酒", "Salbread": "鹽麵包", "Spicy Brothers Honey-Glazed Hot Chips": "辣味兄弟蜜汁辣洋芋片", "Spicy Shredded Stirge Sliders": "香辣蚊蝠絲小漢堡",
	"Tamarind Balls": "羅望子球", "Tavern Crickets": "酒館蟋蟀", "Tika's Honey Mead": "提卡的蜂蜜酒", "Trail Mash'ums": "旅途雜糧", "Trolltide Candied Apples": "巨魔節糖蘋果",
	"Twice-Baked Cockatrice Wings": "二度烘烤雞蛇翅", "Underdark Forage Board": "幽暗地域採集拼盤", "Underdark Lotus with Fire Lichen Spread": "幽暗地域蓮藕佐火地衣抹醬",
	"Undermountain Alurlyath": "地底山脈艾露萊斯酒", "Waterdeep Charcuterie": "深水城肉品拼盤", "Wood Elf Forest Salad": "木精靈森林沙拉", "Zzar": "札爾酒",
};
const cards = Object.fromEntries(Object.entries(N).map(([k, v]) => [k, {0: v, 1: v}]));
cards["Beluir Salmon Spread"][1] = "貝魯爾水煮鮭魚";
Object.assign(cards.Introduction, {
	2: "{@style DUNGEONS & DRAGONS|dnd-font} 遠不只是怪物或寶藏；它建立在社群、友誼與想像力的基礎上——就像一頓好飯一樣。在這副《{@i 英雄盛宴：百味牌組}》中，你會找到一系列精選的 D&D 獨有食譜，橫跨廣闊的多元宇宙；這些食譜過去只有你遊戲中的角色才能享用。它們全都美味、容易準備，而且所用的食材在這個世界就能輕易取得。更棒的是，這些點心與飲品食譜提供了獨特的機會，能增進 D&D 這項社交體驗，無論那天剛好是遊戲之夜，還是你只是希望它是。",
	3: "不過，要對所有使用這件物品的人提出一句警告。這是一副充滿力量、充滿威能、充滿毫不掩飾之風味的牌組，可不是能隨便兒戲的。請小心使用，願骰運眷顧你！",
});
const E = "=";
cards["The Deck of Many Morsels"] = {0: "百味牌組", 1: "50 張用來變出點心、酒飲與甜食的卡牌", 2: "製作人員", 3: "作者：", 4: E, 5: "出版人：", 6: E, 7: "專案編輯：", 8: "Angelin Adams 與 Darian Keels", 9: "製作編輯：", 10: E, 11: "藝術總監暨設計：", 12: E, 13: "攝影總監：", 14: E, 15: "製作經理：", 16: E, 17: "攝影師：", 18: E, 19: "食物造型師：", 20: E, 21: "道具造型師：", 22: E, 23: "食譜開發：", 24: E, 25: "文字編輯：", 26: E, 27: "校對：", 28: "Andrea Connolly Peabbles 與 Kate Bolen", 29: "行銷：", 30: E, 31: "威世智團隊：", 32: E};
add("Deck of Many Morsels", "HFDoMM", cards);
