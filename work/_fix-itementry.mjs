// 把引用 itemEntry 範本（含 {{item.resist}} 等變數）的物品，改成直接寫出完整中文
import fs from "node:fs";
import path from "node:path";
import {UPSTREAM} from "../scripts/util.mjs";
const items = JSON.parse(fs.readFileSync(path.join(UPSTREAM, "data/items.json"), "utf8")).item.filter(e => e.source === "XDMG");
const byName = Object.fromEntries(items.map(e => [e.name, e]));
const DMG = {acid: "強酸", cold: "寒冷", fire: "火焰", force: "力場", lightning: "閃電", necrotic: "黯蝕", poison: "毒素", psychic: "心靈", radiant: "光耀", thunder: "雷鳴"};
const COLOR = {black: "黑", blue: "藍", brass: "黃銅", bronze: "青銅", copper: "赤銅", gold: "金", green: "綠", red: "紅", silver: "銀", white: "白"};
const GEM = {pearl: "珍珠", tourmaline: "碧璽", garnet: "石榴石", sapphire: "藍寶石", citrine: "黃水晶", jet: "煤玉", amethyst: "紫晶", jade: "翡翠", topaz: "黃玉", spinel: "尖晶石"};
const TYPE = {Aberration: "異怪", Beast: "野獸", Celestial: "天界生物", Construct: "構裝體", Dragon: "龍類", Elemental: "元素生物", Fey: "精類", Fiend: "邪魔", Giant: "巨人", Humanoid: "類人生物", Monstrosity: "怪獸", Ooze: "泥怪", Plant: "植物", Undead: "不死生物"};
const TEXT = {
	"Potion of Resistance": e => `喝下這瓶藥水時，你在 1 小時內對${DMG[e.resist[0]]}傷害具有{@variantrule Resistance|XPHB}。`,
	"Ring of Resistance": e => `戴著此戒指時，你對${DMG[e.resist[0]]}傷害具有{@variantrule Resistance|XPHB}。戒指上鑲著${GEM[e.detail1]}。`,
	"Dragon Scale Mail": e => `龍鱗甲以某一種龍的鱗片製成。有時龍會收集自己蛻下的鱗片並將其贈人；有時則是獵人小心保存了死龍的皮。無論哪種情況，龍鱗甲都極為珍貴。穿著此護甲時，你的{@variantrule Armor Class|XPHB}獲得 +1 加值，你對龍類吐息武器的豁免檢定具有{@variantrule Advantage|XPHB}，且你對${DMG[e.resist[0]]}傷害具有{@variantrule Resistance|XPHB}。此外，你可以作為一個{@action Magic|XPHB}動作集中感官，辨別你 30 哩內最近的一條${COLOR[e.detail1]}龍的距離與方向。直到下一個黎明前，都無法再次使用此動作。`,
	"Scroll of Protection": e => `使用一個{@action Magic|XPHB}動作閱讀此卷軸，會創造一個從你發出的 5 呎{@variantrule Emanation [Area of Effect]|XPHB|散發}範圍。在 5 分鐘內，${TYPE[e.detail1]}無法進入該區域或影響其中的任何東西。然而，若你的移動方式使得一個${TYPE[e.detail1]}會位於區域內，效果便會結束。作為一個{@action Magic|XPHB}動作，位於{@variantrule Emanation [Area of Effect]|XPHB|散發}範圍 5 呎內的生物可以嘗試突破它，這會迫使該生物進行一次 {@dc 15} 魅力豁免檢定。豁免成功時，該生物不再受到{@variantrule Emanation [Area of Effect]|XPHB|散發}範圍的影響。`,
};
let n = 0;
for (const f of fs.readdirSync("work").filter(f => /^xdmg-item-\d+\.en\.json$/.test(f))) {
	const en = JSON.parse(fs.readFileSync(`work/${f}`, "utf8"));
	const zf = `work/${f.replace(".en.", ".zh.")}`;
	const zh = JSON.parse(fs.readFileSync(zf, "utf8"));
	en.items.forEach((it, i) => it.s.forEach((s, j) => {
		const m = /^\{#itemEntry (.+)\|XDMG\}$/.exec(s);
		if (!m || !TEXT[m[1]]) return;
		zh[i][j] = TEXT[m[1]](byName[it.s[0]]);
		++n;
	}));
	fs.writeFileSync(zf, JSON.stringify(zh));
}
console.log("替換", n);
