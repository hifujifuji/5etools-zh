import fs from "node:fs";
import {VALHALLA} from "./lib/common.mjs";
const isUid = s => /^[^{}]+\|[A-Za-z0-9]+$/.test(s);
const T = {
// itemEntry
"Armor of Resistance": "抗性護甲", "Dragon Scale Mail": "龍鱗甲", "Grenade": "手榴彈", "Ioun Stone": "艾恩石", "Potion of Resistance": "抗性藥水", "Ring of Resistance": "抗性戒指", "Scroll of Protection": "防護卷軸",
"You have {@variantrule Resistance|XPHB} to {{getFullImmRes item.resist}} damage while you wear this armor.": "穿著此護甲時，你對 {{getFullImmRes item.resist}} 傷害具有{@variantrule Resistance|XPHB}。",
"Dragon Scale Mail is made of the scales of one kind of dragon. Sometimes dragons collect their cast-off scales and gift them. Other times, hunters carefully preserve the hide of a dead dragon. In either case, Dragon Scale Mail is highly valued.": "龍鱗甲以某一種龍的鱗片製成。有時龍會收集自己蛻下的鱗片並將其贈人；有時則是獵人小心保存了死龍的皮。無論哪種情況，龍鱗甲都極為珍貴。",
"While wearing this armor, you gain a +1 bonus to {@variantrule Armor Class|XPHB}, you have {@variantrule Advantage|XPHB} on saving throws against the breath weapons of Dragons, and you have {@variantrule Resistance|XPHB} to {{getFullImmRes item.resist}} damage.": "穿著此護甲時，你的{@variantrule Armor Class|XPHB}獲得 +1 加值，你對龍類吐息武器的豁免檢定具有{@variantrule Advantage|XPHB}，且你對 {{getFullImmRes item.resist}} 傷害具有{@variantrule Resistance|XPHB}。",
"Additionally, you can focus your senses as a {@action Magic|XPHB} action to discern the distance and direction to the closest {{item.detail1}} dragon within 30 miles of yourself. This action can't be used again until the next dawn.": "此外，你可以作為一個{@action Magic|XPHB}動作集中感官，辨別你 30 哩內最近的一條 {{item.detail1}} 龍的距離與方向。直到下一個黎明前，都無法再次使用此動作。",
"As an action, you can either throw a grenade at a point up to 60 feet away or use a Grenade Launcher to propel the grenade to a point up to 1,000 feet away. The grenade explodes at that point, creating a particular effect in a 20-foot-radius {@variantrule Sphere [Area of Effect]|XPHB|Sphere}.": "作為一個動作，你可以將手榴彈投向至多 60 呎外的一點，或使用榴彈發射器將手榴彈射向至多 1,000 呎外的一點。手榴彈在該點爆炸，在 20 呎半徑的{@variantrule Sphere [Area of Effect]|XPHB|球形}範圍內產生特定效果。",
"Roughly marble sized, {@i Ioun Stones} are named after Ioun, a god of knowledge and prophecy revered on some worlds. Many types of {@i Ioun Stones} exist, each type a distinct combination of shape and color.": "{@i 艾恩石}約為彈珠大小，以艾恩——某些世界所崇敬的知識與預言之神——命名。{@i 艾恩石}有許多種類，每種都有獨特的形狀與顏色組合。",
"When you take a {@action Magic|XPHB} action to toss an {@i Ioun Stone} into the air, the stone orbits your head at a distance of {@dice 1d3} feet, conferring its benefit to you while doing so. You can have up to three {@i Ioun Stones} orbiting your head at the same time.": "當你執行一個{@action Magic|XPHB}動作將一顆{@i 艾恩石}拋向空中時，石頭會在距你頭部 {@dice 1d3} 呎處環繞運行，並在運行期間賦予你其益處。你最多可以同時讓三顆{@i 艾恩石}繞著你的頭部運行。",
"Each {@i Ioun Stone} orbiting your head is considered to be an object you are wearing. The orbiting stone avoids contact with other creatures and objects, adjusting its orbit to avoid collisions and thwarting all attempts by other creatures to attack or snatch it.": "每顆繞著你頭部運行的{@i 艾恩石}都視為你穿戴的物體。運行中的石頭會避免與其他生物和物體接觸，並調整軌道以避免碰撞，挫敗其他生物攻擊或奪取它的一切嘗試。",
"As a {@action Utilize|XPHB} action, you can seize and stow any number of {@i Ioun Stones} orbiting your head. If your {@variantrule Attunement|XPHB} to an Ioun Stone ends while it's orbiting your head, the stone falls as though you had dropped it.": "作為一個{@action Utilize|XPHB}動作，你可以抓住並收起任意數量繞著你頭部運行的{@i 艾恩石}。若艾恩石繞著你頭部運行時你與它的{@variantrule Attunement|XPHB}結束，石頭會如同被你丟下般掉落。",
"When you drink this potion, you have {@variantrule Resistance|XPHB} to {{getFullImmRes item.resist}} damage for 1 hour.": "喝下這瓶藥水時，你在 1 小時內對 {{getFullImmRes item.resist}} 傷害具有{@variantrule Resistance|XPHB}。",
"You have {@variantrule Resistance|XPHB} to {{getFullImmRes item.resist}} damage while wearing this ring. The ring is set with {{item.detail1}}.": "戴著此戒指時，你對 {{getFullImmRes item.resist}} 傷害具有{@variantrule Resistance|XPHB}。戒指上鑲著 {{item.detail1}}。",
"Using a {@action Magic|XPHB} action to read the scroll creates a 5-foot {@variantrule Emanation [Area of Effect]|XPHB|Emanation} originating from you. For 5 minutes, {{item.detail2}} can't enter or affect anything in the area. However, if you move in such a way that an {{item.detail1}} would be inside the area, the effect ends.": "使用一個{@action Magic|XPHB}動作閱讀此卷軸，會創造一個從你發出的 5 呎{@variantrule Emanation [Area of Effect]|XPHB|散發}範圍。在 5 分鐘內，{{item.detail2}} 無法進入該區域或影響其中的任何東西。然而，若你的移動方式使得一個 {{item.detail1}} 會位於區域內，效果便會結束。",
"As a {@action Magic|XPHB} action, a creature within 5 feet of the {@variantrule Emanation [Area of Effect]|XPHB|Emanation} can attempt to overcome it, which forces the creature to make a {@dc 15} Charisma saving throw. On a successful save, the creature ceases to be affected by the {@variantrule Emanation [Area of Effect]|XPHB|Emanation}.": "作為一個{@action Magic|XPHB}動作，位於{@variantrule Emanation [Area of Effect]|XPHB|散發}範圍 5 呎內的生物可以嘗試突破它，這會迫使該生物進行一次 {@dc 15} 魅力豁免檢定。豁免成功時，該生物不再受到{@variantrule Emanation [Area of Effect]|XPHB|散發}範圍的影響。",
// itemGroup XPHB
"Arcane Focus": "奧術法器", "Artisan's Tools": "工匠工具", "Druidic Focus": "德魯伊法器", "Gaming Set": "遊戲套組", "Holy Symbol": "聖徽", "Musical Instrument": "樂器",
// itemGroup XDMG
"You have {@variantrule Resistance|XPHB} to one type of damage while you wear this armor. The DM chooses the type or determines it randomly by rolling on the following table.": "穿著此護甲時，你對一種傷害類型具有{@variantrule Resistance|XPHB}。類型由 DM 選擇，或在下表隨機擲骰決定。",
"d10": "d10", "1d100": "1d100", "d20": "d20", "Damage Type": "傷害類型",
"Armor of Vulnerability": "易傷護甲", "Bag of Tricks": "魔術袋", "Belt of Giant Strength": "巨人力量腰帶",
"Belt": "腰帶", "Str.": "力量", "Rarity": "稀有度", "Rare": "珍稀", "Very Rare": "極珍稀", "Legendary": "傳說", "Uncommon": "非普通",
"{@item Belt of Frost Giant Strength|XDMG} or {@item Belt of Stone Giant Strength|XDMG}": "{@item Belt of Frost Giant Strength|XDMG}或{@item Belt of Stone Giant Strength|XDMG}",
"Carpet of Flying": "飛天魔毯",
"You can make this carpet hover and fly by taking a {@action Magic|XPHB} action and using the carpet's command word. It moves according to your directions if you are within 30 feet of it.": "你可以執行一個{@action Magic|XPHB}動作並說出魔毯的命令詞，使魔毯懸浮並飛行。若你位於其 30 呎內，它會依你的指示移動。",
"Four sizes of Carpet of Flying exist. The DM chooses the size of a given carpet or determines it randomly by rolling on the following table. A carpet can carry up to twice the weight shown on the table, but its {@variantrule Fly Speed|XPHB} is halved if it carries more than its normal capacity.": "飛天魔毯有四種尺寸。DM 選擇魔毯的尺寸，或在下表隨機擲骰決定。魔毯最多可載運表中所示重量的兩倍，但若載重超過其一般容量，其{@variantrule Fly Speed|XPHB}減半。",
"Applicable Carpet Sizes": "適用的魔毯尺寸", "Size": "尺寸", "Capacity": "容量", "Fly Speed": "飛行速度",
"200 lb.": "200 磅", "400 lb.": "400 磅", "600 lb.": "600 磅", "800 lb.": "800 磅", "80 feet": "80 呎", "60 feet": "60 呎", "40 feet": "40 呎", "30 feet": "30 呎",
"Elemental Gem": "元素寶石", "Enspelled Armor": "法術封存護甲", "Enspelled Staff": "法術封存之杖", "Enspelled Weapon": "法術封存武器",
"Eye and Hand of Vecna": "維克那之眼與手", "Figurine of Wondrous Power": "異能塑像", "Horn of Valhalla": "瓦爾哈拉號角",
"Four types of Horn of Valhalla are known to exist, each made of a different metal. The horn's type determines how many spirits it summons, as well as the requirement for its use. The DM chooses the horn's type or determines it randomly by rolling on the following table. If you blow the horn without meeting its requirement, the summoned spirits attack you.": "已知的瓦爾哈拉號角有四種，各以不同的金屬製成。號角的種類決定它能召喚多少戰士之靈，以及使用它的要求。DM 選擇號角的種類，或在下表隨機擲骰決定。若你在未符合要求的情況下吹響號角，被召喚的戰士之靈會攻擊你。",
"If you meet the requirement, they are {@variantrule Friendly [Attitude]|XPHB|Friendly} to you and your allies and follow your commands.": "若你符合要求，他們會對你和你的盟友{@variantrule Friendly [Attitude]|XPHB|友善}，並聽從你的命令。",
"Horn Type": "號角種類", "Spirits": "戰士之靈", "Requirement": "要求", "None": "無",
"{@variantrule Proficiency|XPHB} with all Simple weapons": "所有簡易武器的{@variantrule Proficiency|XPHB|熟練}", "Training with all Medium armor": "所有中甲的訓練", "{@variantrule Proficiency|XPHB} with all Martial weapons": "所有軍用武器的{@variantrule Proficiency|XPHB|熟練}",
"Instrument of the Bards": "吟遊詩人樂器",
"An Instrument of the Bards is superior to an ordinary instrument in every way. Seven types of these instruments exist, each named after a bard college. A creature that attempts to play the instrument without being attuned to it must succeed on a {@dc 15} Wisdom saving throw or take {@damage 2d4} Psychic damage.": "吟遊詩人樂器在各方面都優於普通樂器。這類樂器共有七種，各以一個吟遊詩人學院命名。未與樂器同調而嘗試演奏它的生物，必須通過一次 {@dc 15} 感知豁免檢定，否則受到 {@damage 2d4} 心靈傷害。",
"You can play the instrument to cast one of its spells. Once the instrument has been used to cast a spell, it can't be used to cast that spell again until the next dawn. The spells use your spellcasting ability and spell save DC.": "你可以演奏樂器來施展其法術之一。一旦樂器被用來施展某道法術，直到下一個黎明前都無法再用它施展該法術。這些法術使用你的施法屬性與法術豁免 DC。",
"All Instrument of the Bards can be used to cast the following spells: {@spell Fly|XPHB}, {@spell Invisibility|XPHB}, {@spell Levitate|XPHB}, {@spell Protection from Evil and Good|XPHB}": "所有吟遊詩人樂器都可以用來施展下列法術：{@spell Fly|XPHB}、{@spell Invisibility|XPHB}、{@spell Levitate|XPHB}、{@spell Protection from Evil and Good|XPHB}",
"{#itemEntry Ioun Stone|XDMG}": "{#itemEntry Ioun Stone|XDMG}", "The type of stone determines its rarity and effects.": "石頭的種類決定其稀有度與效果。",
"Manual of Golems": "魔像手冊",
"This tome contains information and incantations necessary to make a particular type of golem. To decipher and use the manual, you must be a spellcaster with at least two 5th-level spell slots. A creature that can't use a manual of golems and attempts to read it takes {@damage 6d6} psychic damage.": "這本巨著包含製作某種特定魔像所需的資訊與咒語。要解讀並使用此手冊，你必須是至少擁有兩個 5 環法術欄位的施法者。無法使用魔像手冊的生物若試圖閱讀它，會受到 {@damage 6d6} 心靈傷害。",
"Golem": "魔像", "Time": "時間", "Cost": "花費", "30 days": "30 天", "60 days": "60 天", "120 days": "120 天", "90 days": "90 天", "65,000 GP": "65,000 GP", "50,000 GP": "50,000 GP", "100,000 GP": "100,000 GP", "80,000 GP": "80,000 GP",
"To create a golem, you must spend the time shown on the table, working without interruption with the manual at hand and resting no more than 8 hours per day. You must also pay the specified cost to purchase supplies.": "要製作一個魔像，你必須花費表中所示的時間，手邊帶著手冊不間斷地工作，且每天休息不超過 8 小時。你還必須支付指定的花費購買材料。",
"Once you finish creating the golem, the book is consumed in eldritch flames. The golem becomes animate when the ashes of the manual are sprinkled on it. It is under your control, and it understands and obeys your spoken commands.": "完成魔像後，此書會在異界火焰中焚毀。將手冊的灰燼灑在魔像身上時，魔像便會活化。它受你控制，並能理解且服從你口頭下達的命令。",
"Potion of Giant Strength": "巨人之力藥水", "Potions of Healing": "治療藥水",
"When you drink this potion, you have {@variantrule Resistance|XPHB} to one type of damage for 1 hour. The DM chooses the type or determines it randomly by rolling on the following table.": "喝下這瓶藥水時，你在 1 小時內對一種傷害類型具有{@variantrule Resistance|XPHB}。類型由 DM 選擇，或在下表隨機擲骰決定。",
"Quaal's Feather Token": "誇爾的羽毛符記",
"This object looks like a feather. Different types of feather tokens exist, each with a different single-use effect. The DM chooses the kind of token or determines it randomly by rolling on the Quaal's Feather Tokens table. The type of token determines its rarity.": "此物體看起來像一根羽毛。羽毛符記有不同種類，各有不同的一次性效果。DM 選擇符記的種類，或在「誇爾的羽毛符記」表上隨機擲骰決定。符記的種類決定其稀有度。",
"Quaal's Feather Tokens": "誇爾的羽毛符記", "Token": "符記",
"Ring of Elemental Command": "元素指揮戒指",
"You have {@variantrule Resistance|XPHB} to one damage type while wearing this ring. The gemstone in the ring indicates the type, which the DM chooses or determines randomly by rolling on the following table.": "戴著此戒指時，你對一種傷害類型具有{@variantrule Resistance|XPHB}。戒指上的寶石代表其類型，由 DM 選擇或在下表隨機擲骰決定。",
"Gem": "寶石", "Pearl": "珍珠", "Tourmaline": "碧璽", "Garnet": "石榴石", "Sapphire": "藍寶石", "Citrine": "黃水晶", "Jet": "煤玉", "Amethyst": "紫晶", "Jade": "翡翠", "Topaz": "黃玉", "Spinel": "尖晶石",
"Rod of the Pact Keeper": "掌契者權杖",
"Each Scroll of Protection works against creatures of a specific creature type chosen by the DM or determined by rolling on the following table.": "每份防護卷軸都針對某一特定類型的生物，類型由 DM 選擇或在下表擲骰決定。",
"Creature Type": "生物類型",
"Using a {@action Magic|XPHB} action to read the scroll creates a 5-foot Emanation originating from you. For 5 minutes, creatures of the specified type can't enter or affect anything in the area. However, if you move in such a way that a creature of the specified type would be inside the area, the effect ends.": "使用一個{@action Magic|XPHB}動作閱讀此卷軸，會創造一個從你發出的 5 呎散發範圍。在 5 分鐘內，指定類型的生物無法進入該區域或影響其中的任何東西。然而，若你的移動方式使得一個指定類型的生物會位於區域內，效果便會結束。",
"As a {@action Magic|XPHB} action, a creature within 5 feet of the Emanation can attempt to overcome it, which forces the creature to make a {@dc 15} Charisma saving throw. On a successful save, the creature ceases to be affected by the Emanation.": "作為一個{@action Magic|XPHB}動作，位於散發範圍 5 呎內的生物可以嘗試突破它，這會迫使該生物進行一次 {@dc 15} 魅力豁免檢定。豁免成功時，該生物不再受到散發範圍的影響。",
"Scroll of Titan Summoning": "泰坦召喚卷軸",
"When you take a {@action Magic|XPHB} action to read this scroll, a particular titan named in the scroll appears in an unoccupied space on the ground or in water that you can see within 1 mile of yourself. The DM picks a suitable titan or determines it randomly by rolling on the table below.": "當你執行一個{@action Magic|XPHB}動作閱讀此卷軸時，卷軸中指名的特定泰坦會出現在你 1 哩內一處你能看見的地面或水中的未被佔據空間。DM 選擇適合的泰坦，或在下表隨機擲骰決定。",
"The titan is {@variantrule Hostile [Attitude]|XPHB|Hostile} toward all other creatures and disappears when it drops to 0 {@variantrule Hit Points|XPHB}. If the titan is summoned into a space that isn't large enough to contain it, the summoning fails, and the scroll is wasted.": "泰坦對所有其他生物都{@variantrule Hostile [Attitude]|XPHB|敵對}，並在其{@variantrule Hit Points|XPHB}降至 0 時消失。若泰坦被召喚到一個不足以容納牠的空間中，召喚會失敗，卷軸也會被浪費。",
"Titan": "泰坦",
"{@item Scroll of Titan Summoning (Kraken)|XDMG|Kraken} (a kraken requires a body of water large enough to contain it, or the summoning fails and the scroll is wasted)": "{@item Scroll of Titan Summoning (Kraken)|XDMG|克拉肯}（克拉肯需要一片大到足以容納牠的水域，否則召喚失敗，卷軸也會被浪費）",
"Spell Scroll": "法術卷軸", "Wand of the War Mage": "戰法師魔杖", "Wraps of Unarmed Power": "徒手之力裹布",
};
// 維克那之眼與手：沿用已翻好的單件內容
const VECNA = JSON.parse(fs.readFileSync("work/xdmg-item-06.zh.json", "utf8"))[24];
const VECNA_EN = JSON.parse(fs.readFileSync("work/xdmg-item-06.en.json", "utf8")).items[24].s;
VECNA_EN.forEach((s, i) => { T[s] ??= VECNA[i]; });
const HAND = JSON.parse(fs.readFileSync("work/xdmg-item-08.zh.json", "utf8"))[3];
const HAND_EN = JSON.parse(fs.readFileSync("work/xdmg-item-08.en.json", "utf8")).items[3].s;
HAND_EN.forEach((s, i) => { T[s] ??= HAND[i]; });
Object.assign(T, {
	"The {@item Eye of Vecna|XDMG} and the {@item Hand of Vecna|XDMG} are separate Artifacts that might be found together or separately. The eye looks like a bloodshot organ torn free from the socket. The hand is a shriveled left extremity.": "{@item Eye of Vecna|XDMG}與{@item Hand of Vecna|XDMG}是兩件獨立的神器，可能被一起或分別找到。眼睛看起來像一顆從眼窩中扯出、布滿血絲的器官。手則是一隻乾枯的左手。",
	"The {@item Eye of Vecna|XDMG} and the {@item Hand of Vecna|XDMG} each have the following random properties": "{@item Eye of Vecna|XDMG}與{@item Hand of Vecna|XDMG}各自具有以下隨機屬性",
	"The eye has 8 charges and regains {@dice 1d4 + 4} expended charges daily at dawn. You can cast a spell on the {@item Eye of Vecna|XDMG} Spells table from the eye (save {@dc 18}). The table indicates how many charges you must expend to cast the spell. Each time you cast a spell from the eye, there is a {@chance 5} chance that Vecna tears your soul from your body, devours it, and then takes control of the body like a puppet. If that happens, you become an NPC under the DM's control.": "此眼有 8 發充能，每天黎明恢復 {@dice 1d4 + 4} 發已消耗的充能。你可以從此眼施展「{@item Eye of Vecna|XDMG}法術」表中的一道法術（豁免 {@dc 18}）。表中列出施展該法術需消耗的充能數。每次你從此眼施展法術時，有 {@chance 5} 的機率維克那會將你的靈魂從身體中扯出並吞噬，然後像操縱木偶般控制你的身體。若這種情況發生，你會成為受 DM 控制的 NPC。",
	"Properties of the Eye and Hand": "眼與手的屬性",
	"While attuned to both the hand and eye, you gain the following additional benefits:": "同時與手和眼同調時，你獲得以下額外益處：",
	"Danger Sense": "險境感知", "You have {@variantrule Advantage|XPHB} on {@variantrule Initiative|XPHB} rolls.": "你的{@variantrule Initiative|XPHB}擲骰具有{@variantrule Advantage|XPHB}。",
	"Necrotic Reduction": "黯蝕消解",
	"As a {@action Magic|XPHB} action, you can target one creature you can see within 5 feet of yourself. The target makes a {@dc 18} Constitution saving throw, taking {@damage 7d6} Necrotic damage on a failed save or half as much damage on a successful one. A creature reduced to 0 {@variantrule Hit Points|XPHB} by this damage is transformed into {@hazard green slime|XDMG} (see chapter 3) that covers the ground in its space, each 5-foot square of slime representing a separate patch. Nonmagical objects worn or carried by the target that are made of metal or organic material are destroyed by the slime.": "作為一個{@action Magic|XPHB}動作，你可以以你 5 呎內一個你能看見的生物為目標。目標進行一次 {@dc 18} 體質豁免檢定，失敗時受到 {@damage 7d6} 黯蝕傷害，成功時傷害減半。被此傷害使{@variantrule Hit Points|XPHB}降至 0 的生物會化為覆蓋其空間地面的{@hazard green slime|XDMG|綠史萊姆}（見第 3 章），每 5 呎見方的史萊姆代表一塊獨立的區塊。目標穿戴或攜帶、由金屬或有機材料製成的非魔法物體會被史萊姆摧毀。",
	"Poison Immunity": "毒素免疫", "You have {@variantrule Immunity|XPHB} to Poison damage and the {@condition Poisoned|XPHB} condition.": "你對毒素傷害與{@condition Poisoned|XPHB}狀態具有{@variantrule Immunity|XPHB}。",
	"Regeneration": "再生", "If you start your turn with at least 1 {@variantrule Hit Points|XPHB|Hit Point}, you regain {@dice 1d10} {@variantrule Hit Points|XPHB}.": "若你在回合開始時至少有 1 點{@variantrule Hit Points|XPHB|生命值}，你恢復 {@dice 1d10} {@variantrule Hit Points|XPHB}。",
	"Wish": "祈願術", "You can cast {@spell Wish|XPHB}. Once used, this property can't be used again until 30 days have passed.": "你可以施展{@spell Wish|XPHB}。此屬性使用後，必須經過 30 天才能再次使用。",
	"Eye of Vecna Spells": "維克那之眼法術",
	"If the {@item Eye of Vecna|XDMG} and the {@item Hand of Vecna|XDMG} are both attached to the same creature and that creature is slain by the {@item Sword of Kas|XDMG}, both the eye and the hand burst into flame, turn to ash, and are destroyed. Any other attempt to destroy the eye or hand seems to work, but the Artifact reappears in one of Vecna's many hidden vaults, where it waits to be rediscovered.": "若{@item Eye of Vecna|XDMG}與{@item Hand of Vecna|XDMG}都附著在同一個生物身上，而該生物被{@item Sword of Kas|XDMG}殺死，眼與手都會燃起火焰、化為灰燼並被摧毀。任何其他摧毀眼或手的嘗試看似有效，但神器會重新出現在維克那眾多隱藏寶庫的其中之一，等待被再次發現。",
	"You can take a {@action Magic|XPHB} action to blow this horn. In response, warrior spirits from the plane of Ysgard appear in unoccupied spaces within 60 feet of you. Each spirit uses the {@creature Berserker|XMM} stat block and returns to Ysgard after 1 hour or when it drops to 0 {@variantrule Hit Points|XPHB}. The spirits look like living, breathing warriors, and they have {@variantrule Immunity|XPHB} to the {@condition Charmed|XPHB} and {@condition Frightened|XPHB} conditions. Once you use the horn, it can't be used again until 7 days have passed.": VALHALLA[0], "Hand of Vecna Spells": "維克那之手法術",
});
const miss = [];
for (const b of ["xphb-itemgroup", "xdmg-itemgroup", "xdmg-itementry"]) {
	const en = JSON.parse(fs.readFileSync(`work/${b}.en.json`, "utf8"));
	const out = en.items.map(it => it.s.map((s, i) => {
		if (i > 0 && isUid(s)) return s;
		if (T[s] != null) return T[s];
		miss.push(`${it.key}: ${s.slice(0, 80)}`); return s;
	}));
	fs.writeFileSync(`work/${b}.zh.json`, JSON.stringify(out));
}
console.log(miss.length ? miss.join("\n") : "全部完成");
