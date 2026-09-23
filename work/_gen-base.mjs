import fs from "node:fs";
const en = JSON.parse(fs.readFileSync("work/xphb-base.en.json", "utf8"));
const NAME = {"Arrows (20)":"箭（20）","Bolt":"弩矢","Bolts (20)":"弩矢（20）","Firearm Bullet":"火器子彈","Firearm Bullets (10)":"火器子彈（10）","Needle":"吹針","Needles (50)":"吹針（50）","Sling Bullets (20)":"投石索彈丸（20）"};
const AMMO = t => `${t}需搭配具有彈藥屬性的武器進行遠程攻擊。每次以該武器攻擊時，你會消耗一件彈藥。從箭筒、箭匣或其他容器中取出彈藥是攻擊的一部分（裝填單手武器時你需要一隻空手）。戰鬥結束時，你可以花費一分鐘搜索戰場，回收一半已消耗的彈藥。`;
const STR = {
 "Ability:":"屬性：","Utilize:":"使用：","Craft:":"製作：",
 "Strength":"力量","Dexterity":"敏捷","Intelligence":"智力","Wisdom":"感知","Charisma":"魅力",
 "Identify a substance ({@dc 15}), or start a fire ({@dc 15})":"辨識一種物質（{@dc 15}），或生火（{@dc 15}）",
 "Play a known tune ({@dc 10}), or improvise a song ({@dc 15})":"演奏一首熟悉的曲子（{@dc 10}），或即興創作一首歌（{@dc 15}）",
 "Detect poisoned drink ({@dc 15}), or identify alcohol ({@dc 10})":"察覺飲料是否有毒（{@dc 15}），或辨識酒類（{@dc 10}）",
 "Write text with impressive flourishes that guard against forgery ({@dc 15})":"以華麗的筆法書寫難以偽造的文字（{@dc 15}）",
 "Seal or pry open a door or container ({@dc 20})":"封死或撬開一扇門或一個容器（{@dc 20}）",
 "Draft a map of a small area ({@dc 15})":"繪製一小塊區域的地圖（{@dc 15}）",
 "Modify footwear to give {@variantrule Advantage|XPHB} on the wearer's next Dexterity ({@skill Acrobatics|XPHB}) check ({@dc 10})":"改造鞋子，使穿著者下一次的敏捷（{@skill Acrobatics|XPHB}）檢定具有{@variantrule Advantage|XPHB}（{@dc 10}）",
 "Improve food's flavor ({@dc 10}), or detect spoiled or poisoned food ({@dc 15})":"改善食物的風味（{@dc 10}），或察覺腐壞或有毒的食物（{@dc 15}）",
 "Discern what a glass object held in the past 24 hours ({@dc 15})":"辨別一件玻璃物品在過去 24 小時內盛裝過什麼（{@dc 15}）",
 "Discern a gem's value ({@dc 15})":"辨別一顆寶石的價值（{@dc 15}）",
 "Add a design to a leather item ({@dc 10})":"在皮革物品上添加圖樣（{@dc 10}）",
 "Chisel a symbol or hole in stone ({@dc 10})":"在石頭上鑿出符號或孔洞（{@dc 10}）",
 "Paint a recognizable image of something you've seen ({@dc 10})":"畫出你看過之事物的可辨識圖像（{@dc 10}）",
 "Discern what a ceramic object held in the past 24 hours ({@dc 15})":"辨別一件陶瓷物品在過去 24 小時內盛裝過什麼（{@dc 15}）",
 "Pry open a door or container ({@dc 20})":"撬開一扇門或一個容器（{@dc 20}）",
 "Assemble a Tiny item composed of scrap, which falls apart in 1 minute ({@dc 20})":"用廢料組裝一件微型物品，該物品會在 1 分鐘後散架（{@dc 20}）",
 "Mend a tear in clothing ({@dc 10}), or sew a Tiny design ({@dc 10})":"縫補衣物的破洞（{@dc 10}），或縫製一個微型圖樣（{@dc 10}）",
 "Carve a pattern in wood ({@dc 10})":"在木頭上雕刻花紋（{@dc 10}）",
 "unless mounted":"除非騎乘中",
 "A Lance requires two hands to wield when you aren't mounted.":"未騎乘時，騎槍需要雙手才能揮舞。",
 "Firearm Bullets are destroyed upon use in a modern firearm.":"火器子彈在現代火器中使用後即損毀。",
 "Arrows are typically stored in a {@item Quiver|XPHB} (bought separately).":"箭通常存放在{@item Quiver|XPHB}中（需另購）。",
 "Bolts are typically stored in a {@item Crossbow Bolt Case|XPHB} (bought separately).":"弩矢通常存放在{@item Crossbow Bolt Case|XPHB}中（需另購）。",
 "Needles are typically stored in a {@item Pouch|XPHB} (bought separately).":"吹針通常存放在{@item Pouch|XPHB}中（需另購）。",
 "Sling Bullets are typically stored in a {@item Pouch|XPHB} (bought separately).":"投石索彈丸通常存放在{@item Pouch|XPHB}中（需另購）。",
 "Any Melee weapon (except {@item Club|XPHB}, {@item Greatclub|XPHB}, {@item Quarterstaff|XPHB}, and {@item Whip|XPHB}), Medium armor (except {@item Hide Armor|XPHB|Hide}), Heavy armor, {@item Ball Bearings|XPHB}, {@item Bucket|XPHB}, {@item Caltrops|XPHB}, {@item Chain|XPHB}, {@item Crowbar|XPHB}, {@item Firearm Bullets (10)|XPHB|Firearm Bullets}, {@item Grappling Hook|XPHB}, {@item Iron Pot|XPHB}, {@item Iron Spikes|XPHB}, {@item Sling Bullets (20)|XPHB|Sling Bullets}":
  "任何近戰武器（{@item Club|XPHB}、{@item Greatclub|XPHB}、{@item Quarterstaff|XPHB}與{@item Whip|XPHB}除外）、中甲（{@item Hide Armor|XPHB|生皮甲}除外）、重甲、{@item Ball Bearings|XPHB}、{@item Bucket|XPHB}、{@item Caltrops|XPHB}、{@item Chain|XPHB}、{@item Crowbar|XPHB}、{@item Firearm Bullets (10)|XPHB|火器子彈}、{@item Grappling Hook|XPHB}、{@item Iron Pot|XPHB}、{@item Iron Spikes|XPHB}、{@item Sling Bullets (20)|XPHB|投石索彈丸}",
 "{@item Club|XPHB}, {@item Greatclub|XPHB}, {@item Quarterstaff|XPHB}, Ranged weapons (except {@item Pistol|XPHB}, {@item Musket|XPHB}, and  {@item Sling|XPHB}), {@item Arcane Focus|XPHB}, {@item Arrows (20)|XPHB|Arrows}, {@item Bolts (20)|XPHB|Bolts}, {@item Druidic Focus|XPHB}, {@item Ink Pen|XPHB}, {@item Needles (50)|XPHB|Needles}":
  "{@item Club|XPHB}、{@item Greatclub|XPHB}、{@item Quarterstaff|XPHB}、遠程武器（{@item Pistol|XPHB}、{@item Musket|XPHB}與{@item Sling|XPHB}除外）、{@item Arcane Focus|XPHB}、{@item Arrows (20)|XPHB|箭}、{@item Bolts (20)|XPHB|弩矢}、{@item Druidic Focus|XPHB}、{@item Ink Pen|XPHB}、{@item Needles (50)|XPHB|吹針}",
};
const AMMO_SRC = {"Arrows":"箭","Crossbow bolts":"弩矢","Blowgun needles":"吹箭筒的吹針","Sling bullets":"投石索彈丸"};
const miss = [];
const out = en.items.map(it => it.s.map((s, i) => {
	if (i === 0) return NAME[s] || it.hint?.[s] || (miss.push(s), s);
	if (STR[s]) return STR[s];
	const m = /^(Arrows|Crossbow bolts|Blowgun needles|Sling bullets) are used with/.exec(s);
	if (m) return AMMO(AMMO_SRC[m[1]]);
	if (/^(\{@item [^}]+\}(, )?)+$/.test(s)) return s.split(", ").join("、"); // 純物品清單
	miss.push(s); return s;
}));
if (miss.length) { console.log("未翻：", miss); process.exit(1); }
fs.writeFileSync("work/xphb-base.zh.json", JSON.stringify(out, null, 0).replace(/\],\[/g, "],\n["));
console.log("ok", out.length);
