import fs from "fs";
const p = "i18n/ui.json"; const u = JSON.parse(fs.readFileSync(p));
const F = {"Shelter of the Faithful": "信徒庇護", "False Identity": "虛假身分", "Watcher's Eye": "守望者之眼", "Respect of the Stout Folk": "矮人族的敬重", "Library Access": "圖書館通行權", "Court Functionary": "宮廷官員", "Criminal Contact": "犯罪聯絡人", "Choose a Feature": "選擇一項特性", "By Popular Demand": "眾望所歸", "Safe Haven": "安全避風港", "All Eyes on You": "萬眾矚目", "Rustic Hospitality": "鄉野款待", "Guild Membership": "公會會員資格", "Discovery": "發現", "Inheritance": "遺產", "Knightly Regard": "騎士的尊重", "Mercenary Life": "傭兵生活", "Position of Privilege": "特權地位", "Wanderer": "流浪者", "Researcher": "研究者", "Ship's Passage": "搭船", "Military Rank": "軍階", "Ear to the Ground": "消息靈通", "City Secrets": "城市祕密", "Uthgardt Heritage": "烏斯伽傳承", "Kept in Style": "體面生活"};
for (const [k, v] of Object.entries(F)) { u.dict["Feature: " + k] = "特性：" + v; u.dict["Feature: " + k + "."] = "特性：" + v + "."; }
u.dict["Suggested Characteristics"] ||= "建議特徵";
fs.writeFileSync(p, JSON.stringify(u, null, "\t") + "\n");
