import F from "./_fillidx.mjs";
const C = {Lorehold: "羅爾霍德", Prismari: "普里斯馬瑞", Quandrix: "寬德里克斯", Silverquill: "銀羽", Witherbloom: "凋花"};
const common = c => ({
 [`Feature: ${c} Initiate`]: `特性：${C[c]}新生`,
 [`You gain the {@feat Strixhaven Initiate|SCC} feat and must choose ${c} within it.`]: `你獲得{@feat Strixhaven Initiate|SCC}專長，且必須在其中選擇${C[c]}。`,
 [`In addition, if you have the Spellcasting or Pact Magic feature, the spells on the ${c} Spells table are added to the spell list of your spellcasting class. (If you are a multiclass character with multiple spell lists, these spells are added to all of them.)`]: `此外，若你擁有施法或契約魔法特性，「${C[c]}法術」表中的法術會加入你施法職業的法術列表。（若你是擁有多個法術列表的兼職角色，這些法術會加入所有列表。）`,
 [`${c} Spells`]: `${C[c]}法術`, [`Building a ${c} Character`]: `建立${C[c]}角色`, [`${c} Personality Traits`]: `${C[c]}個性特徵`, [`${c} Trinkets`]: `${C[c]}小飾品`, [`${c} Student`]: `${C[c]}學生`,
 [`When you make your character, you may roll once on the {@item ${c} Trinket|SCC|${c} Trinkets} table, instead of on the {@item trinket|phb|Trinkets table} in the {@book Player's Handbook|PHB}, for your starting trinket.`]: `創建角色時，你可以在{@item ${c} Trinket|SCC|${C[c]}小飾品}表上擲骰一次決定你的起始小飾品，而非{@book Player's Handbook|PHB}中的{@item trinket|phb|小飾品表}。`,
});
const D = Object.assign({}, ...Object.keys(C).map(common));
const INK = "一{@item Ink (1-ounce bottle)|PHB|瓶黑墨水}、一支{@item ink pen|PHB}";
F("bg-SCC", [
{2: "{@skill History}、{@skill Religion}", 6: `${INK}、一把{@item hammer|PHB}、一盞{@item hooded lantern|PHB}、一個{@item tinderbox|PHB}、一本歷史典籍、一套校服，以及一個裝有 15 gp 的{@item pouch|phb}`,
 23: "可以考慮自訂你施法時法術的外觀。你的羅爾霍德法術可能會展現出金色光芒。你可能會用一本典籍或一卷卷軸作為施法法器，而你的法術效果可能會反映出你所研讀參考書的樣貌。",
 25: "任何與過去知識相關的職業或子職業都很適合羅爾霍德。吟遊詩人在羅爾霍德如魚得水，法師（特別是{@class Wizard|PHB|School of Divination|預言|PHB}學派的法師）在其學生中為數眾多。牧師（通常屬於{@class Cleric|PHB|Knowledge|知識|PHB}或{@class Cleric|PHB|Light|光明|PHB}領域）也相當常見。",
 26: "若想以更不尋常的方式詮釋羅爾霍德學生，可以考慮扮演一名與過去有著原始連結的野蠻人（或許採用{@book Xanathar's Guide to Everything|XGE}中的{@class Barbarian|PHB|Path of the Ancestral Guardian|祖靈守護者|XGE}道途），或是一名以{@class Paladin|PHB|Oath of the Ancients|遠古|PHB}誓言與歷史建立具體連結的聖騎士。",
 28: "羅爾霍德學院的成員中，既有一絲不苟的歷史學家，也有大膽的冒險者。「羅爾霍德個性特徵」表提供了各種你可以為角色採用的特徵。",
 32: "我熱愛冷僻的知識。在日常對話中能引用的歷史典故越冷僻越好。", 33: "我希望在尋找這些失落神器的過程中，也能找到真正的自己。", 34: "我幾乎一分鐘都忍不住不談我的研究。我腦袋裡有這麼多知識，總得找個地方宣洩！", 35: "和死者的靈魂聊天，比和活著的同學聊天有趣多了。", 36: "我能口若懸河地談論一場古代戰爭的歷史影響。但叫我做兩位數加法，我就一團亂。", 37: "到頭來，一切都只是熵。萬物終有一天都會崩解。"},
{2: "{@skill Acrobatics}、{@skill Performance}", 4: "一種{@filter 樂器|items|source=phb|miscellaneous=mundane|type=instrument}或{@filter 工匠工具|items|source=phb|miscellaneous=mundane|type=artisan's tools}",
 8: `${INK}、一套{@filter 工匠工具|items|source=phb|miscellaneous=mundane|type=artisan's tools}或一件{@filter 樂器|items|source=phb|miscellaneous=mundane|type=instrument}（自選一種）、一套校服，以及一個裝有 10 gp 的{@item pouch|phb}`,
 25: "可以考慮自訂你施法時法術的外觀。你施展普里斯馬瑞法術時，可能伴隨著充滿動感的姿勢動作——既是舞蹈，也是姿勢成分。即使是你手中的一陣火焰，也是一件雕塑出的藝術品；當你擲出法術時，元素之力會化為宏偉的圖案。法術消散後，這些力量可能會以裝飾元素的形式殘留在你的身體或衣服上，例如火花在你的髮間跳躍，你的觸碰在任何東西上留下霜的痕跡。",
 27: "任何運用寒冷、火焰、閃電與風等元素之力的職業或子職業都很適合普里斯馬瑞。德魯伊與術士在普里斯馬瑞很常見，研習{@class Wizard|PHB|Evocation|塑能|PHB}或{@class Wizard|PHB|Transmutation|變化|PHB}學派的法師也不少。牧師在這個學院並不常見，但有些{@class Cleric|PHB|Tempest domain|暴風|PHB}領域的牧師最後會來到這裡。",
 28: "除了傳統的施法者之外，普里斯馬瑞的學生也包括奉行{@class Monk|PHB|Way of the Four Elements|四象|PHB}之道的武僧。一些擅長特技的遊蕩者與戰士（包括效法{@class Fighter|PHB|Eldritch Knight|奧法騎士|PHB}範型的戰士）也熱愛普里斯馬瑞表演的運動性。",
 30: "雖然普里斯馬瑞學院的課程吸引了許多外向又積極的藝術家，但學院中也不乏害羞的學者與懶散的吹牛大王。「普里斯馬瑞個性特徵」表提供了各種你可以為角色採用的特徵。",
 34: "我是派對的靈魂人物，走進房間時我期待所有人的注意。", 35: "兩週前，我還對我最新的作品著迷不已。現在，我覺得它是垃圾，應該被銷毀。", 36: "我相信每個人都能透過藝術表達最真實的自我，而我很樂意默默地推他們一把。", 37: "每個人都是評論家，而我努力贏得他們所有人的認可。", 38: "我對我的藝術感到一股排山倒海的倦怠。再也沒有什麼能真正吸引我的注意。", 39: "我不去面對負面情緒，而是把它們導入爆炸性的藝術表現中。"},
{2: "{@skill Arcana}、{@skill Nature}", 4: "一種{@filter 工匠工具|items|source=phb|miscellaneous=mundane|type=artisan's tools}", 8: `${INK}、一個{@item abacus|PHB}、一本奧術理論書、一套校服，以及一個裝有 15 gp 的{@item pouch|phb}`,
 25: "可以考慮自訂你施法時法術的外觀。你的寬德里克斯法術可能會在萬花筒般旋轉的碎形圖案中顯現，放大你姿勢成分最細微的動作。當你的魔法創造或改變生物時，可能會短暫地以閃爍的碎形圖案或鑲嵌圖樣環繞目標。",
 27: "任何施法職業或子職業都很適合寬德里克斯角色。法師的學術專注（特別是研習{@class Wizard|PHB|Abjuration|防護|PHB}、{@class Wizard|PHB|Illusion|幻術|PHB}或{@class Wizard|PHB|Transmutation|變化|PHB}學派的法師）與術士的超魔法操控，在寬德里克斯都很受歡迎，許多德魯伊也在寬德里克斯探索自然的模式。少數牧師，特別是{@class Cleric|PHB|Knowledge|知識|PHB}或{@class Cleric|PHB|Nature|自然|PHB}領域的牧師，也在寬德里克斯學習。",
 28: "除了傳統施法者之外，也有一些其他職業的角色在寬德里克斯找到歸屬。一些戰士、武僧、遊俠與遊蕩者在這裡學習，運用寬德里克斯的原理訓練他們的心智。",
 30: "寬德里克斯學院的學科從實際有形的事物到矛盾奇異的現象都有，學生群體也因此包羅萬象。「寬德里克斯個性特徵」表提供了各種你可以為角色採用的特徵。",
 34: "當我找到一個感興趣的主題時，不把它的一切都搞懂我絕不罷休。這讓我徹夜難眠。", 35: "我希望有一天這一切對我來說都能說得通。在那之前，我會繼續裝懂。", 36: "方程式與規律在我腦中自然而然地浮現。真希望友誼也能這麼容易。", 37: "我相信我永遠是房間裡最聰明的人。而且我會證明這一點，即使沒人要求。", 38: "如果這些課教會了我什麼，那就是現實是謊言，什麼都不重要。所以何必費心呢？", 39: "畢業之前，我要完成一件數學上不可能的事。我必須留下傳奇！"},
{2: "{@skill Intimidation}、{@skill Persuasion}", 6: `${INK}、一本詩集、一套校服，以及一個裝有 15 gp 的{@item pouch|phb}`,
 23: "可以考慮自訂你施法時法術的外觀。你的銀羽法術可能伴隨著類似墨漬或金色光芒漣漪般擴散的視覺效果。你法術的任何聽覺效果，聽起來常像是你自己唸出法術言語成分時被放大的回聲——即使是在雷電轟鳴或烈焰爆發之中。",
 25: "許多吟遊詩人在銀羽找到歸屬，將他們聲音的力量運用在銀羽魔法上。法師（特別是研習{@class Wizard|PHB|Illusion|幻術|PHB}與{@class Wizard|PHB|Enchantment|惑控|PHB}學派的法師）在銀羽很常見，邪術師也是。{@class Cleric|PHB|Light|光明|PHB}與{@class Cleric|PHB|Trickery|詭術|PHB}領域的牧師也能很好地融入銀羽的法師之中。",
 26: "也有不少聖騎士與遊蕩者就讀銀羽學院，突顯了學生群體的多樣性。",
 28: "在學院嚴格標準的壓力下，銀羽學生從自大無情到不堪重負的完美主義者都有。「銀羽個性特徵」表提供了各種你可以為角色採用的特徵。",
 32: "為了維持崇高的社會地位，我什麼話都說得出口。", 33: "比起漂亮的謊言，我寧可說出直白的真相，而且我不太在乎會傷到誰的感情。", 34: "我相信提攜同儕是成功的最佳方法。", 35: "我精通以幽默作為防禦的技巧，總是準備好一個迷人的笑話。", 36: "我說話前總會先等一下，分析情況，找出對我的目標最有利的角度。", 37: "沒人知道我為了讓我的魔法看起來毫不費力而熬了多少個通宵，而我打算繼續保密下去。"},
{2: "{@skill Nature}、{@skill Survival}", 7: `${INK}、一本植物鑑定書、一個{@item iron pot|PHB}、一個{@item herbalism kit|PHB}、一套校服，以及一個裝有 15 gp 的{@item pouch|phb}`,
 24: "可以考慮自訂你施法時法術的外觀。你的凋花法術可能依賴取自凋花沼澤環境的材料成分或施法法器，而你的法術可能呈現出暗示這些自然元素的外觀。沼澤動物或植物的幽靈形體可能會在你的法術效果中成形。",
 26: "德魯伊與邪術師構成了凋花學生群體的大多數。少數法師（大多是研習{@class Wizard|PHB|School of Necromancy|死靈|PHB}學派的法師）與牧師（包括{@class Cleric|PHB|Life|生命|PHB}或{@class Cleric|PHB|Nature|自然|PHB}領域的牧師）也在凋花找到歸屬。",
 27: "也有不少遊俠與野蠻人在凋花學習，一些遊蕩者則在這個學院學習如何製作與使用毒藥。",
 29: "凋花學院的學生，可能在為治療酊劑採集草藥，也可能騎著殭屍化的沼澤野獸穿越河口沼澤。「凋花個性特徵」表提供了各種你可以為角色採用的特徵。",
 33: "我喜歡調製新配方，即使有些人可能對我選擇的材料感到反感。或是對成品感到反感。或是兩者都有。", 34: "我的時尚品味就像我的花園：枯萎、黝黑又古怪。", 35: "就算要我拚上性命，我也要和這片沼澤裡的每一隻怪物交朋友。", 36: "這世上的一切終究會死。問題是，你要用剩下的時間做什麼？", 37: "我知道我們才剛認識，但你死了以後，可以把你的骨頭給我嗎？做研究用的。", 38: "別打擾我；我在沉思。"},
], D);
