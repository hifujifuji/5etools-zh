import F, {NEW} from "./_p.mjs";
import add from "../_addex.mjs";
Object.assign(NEW, {"Cap of Vanishing": "消失帽", "Holly's Handy Haversack": "荷莉的便利袋", "Pipes of Pestilence": "瘟疫笛", "Poison Soaked Kukri": "浸毒廓爾喀刀", "Speaking Stones": "傳話石", "Spiked Shield": "尖刺盾",
	"Charm of Plant Command": "植物號令護符", "Cursed Luckstone": "詛咒幸運石", "Helm of Underwater Action": "水下行動頭盔", "Pipe of Remembrance": "回憶菸斗", "Pressure Capsule": "抗壓膠囊", "Sekolahian Worshiping Statuette": "賽柯拉崇拜小雕像",
	"Dowsing Dagger": "探水匕首", "Pirate's Cutlass": "海盜彎刀", "Primal Amulet": "原初護符", "Prying Blade": "撬刃", "Sorcerous Spyglass": "術法望遠鏡", "Vanquisher's Banner": "征服者旗幟",
	"Biza's Breath": "畢札之息", "Black Ghost Orchid Seed": "黑色幽靈蘭種子", "Hammock of Worlds": "世界吊床", "Lesser Hammock of Worlds": "次級世界吊床", "White Ghost Orchid Seed": "白色幽靈蘭種子"});
add({"Special Use:": "特殊用途："}, "i18n/copy-names.json");
add({"You have advantage on Charisma ({@skill Performance|XPHB}) checks you make to amuse Humanoid onlookers while the cloak is billowing.": "斗篷飄揚時，你為取悅類人生物旁觀者而進行的魅力（{@skill Performance|XPHB}）檢定具有優勢。",
 "You have {@variantrule Advantage|XPHB} on Charisma ({@skill Intimidation|XPHB}) checks you make to intimidate a Humanoid who sees you wearing this helm.": "你為威嚇看見你戴著這頂頭盔的類人生物而進行的魅力（{@skill Intimidation|XPHB}）檢定具有{@variantrule Advantage|XPHB|優勢}。"});
F("it-wtthc", [
 {1: "這頂帽子有 3 點充能，每天黎明恢復所有已消耗的充能。戴著帽子時，你可以執行一個{@action Magic|XPHB}動作並消耗 1 點充能，讓自己處於{@condition Invisible|XPHB|隱形}狀態 10 分鐘。若帽子被取下，或在你進行攻擊檢定、造成傷害或施展法術後，效果會立即提早結束。"},
 {},
 {1: "若你以一個{@action Magic|XPHB}動作吹奏這支笛子，你會在你 60 呎內一個未被佔據的空間召喚一群{@creature Swarm of Corrupted Rats|WttHC}。只要你每輪持續以{@action Magic|XPHB}動作吹奏笛子，鼠群就會對你與你的盟友保持{@variantrule Friendly [Attitude]|XPHB|友善}。{@variantrule Friendly [Attitude]|XPHB|友善}時，鼠群受你控制、服從你的命令，若你沒有下達命令，它除了保護自己之外不會採取任何行動。你的控制結束時，鼠群會消失，笛子在下一個黎明之前無法再次使用。"},
 {1: "你可以執行一個{@variantrule Bonus Action|XPHB|附贈動作}，以魔法讓這把匕首的刀刃塗上毒液。毒液持續 1 分鐘，或直到以這把武器進行的攻擊命中一個生物為止。該生物必須成功通過一次 DC 13 體質豁免檢定，否則受到 {@damage 2d8} 點毒素傷害，並處於{@condition Poisoned|XPHB|中毒}狀態 1 分鐘。在下一個黎明之前，無法再以此方式使用這個{@variantrule Bonus Action|XPHB|附贈動作}。"},
 {1: "傳話石成對出現，每顆石頭都雕刻得與另一顆相配。",
  2: "觸碰其中一顆石頭時，你可以執行一個{@action Magic|XPHB}動作，向另一顆石頭的持有者傳送一則 25 字以內的簡短訊息。該生物會在心中聽見訊息，若認識你便會認出你是發送者，並能立即以相同方式回覆。石頭讓生物能理解你訊息的意思。",
  3: "你可以跨越任何距離傳送訊息。若沒有生物持有另一顆石頭，你在使用石頭時便會立即知道這件事，且不會傳送訊息。",
  4: "任一顆石頭以此方式被用來傳送訊息後，這對石頭在下一個黎明之前都無法再次使用。若其中一顆石頭被摧毀，另一顆便會成為非魔法物品。"},
 {1: "粗糙的金屬尖刺裝飾著這面魔法盾牌。持握它時，你可以使用以下屬性。",
  3: "當你執行{@action Attack|XPHB}動作時，你可以用盾牌對你 5 呎內的一個目標進行其中一次攻擊檢定。在攻擊檢定上套用你的{@variantrule Proficiency|XPHB|熟練加值}與力量調整值。命中時，盾牌造成等於 {@dice 2d6} 加上你力量調整值的穿刺傷害。",
  5: "作為一個{@action Magic|XPHB}動作，你可以讓盾牌在 30 呎{@variantrule Cone [Area of Effect]|XPHB|錐形}內噴出尖刺。{@variantrule Cone [Area of Effect]|XPHB|錐形}內每個生物進行一次 DC 13 敏捷豁免檢定，失敗時受到 {@damage 3d6} 點穿刺傷害，成功時傷害減半。此屬性使用後，在下一個黎明之前無法再次使用。"}]);
F("it-gos", [
 {1: "這個拳頭大小的護符以一束用銀線纏繞的乾燥植物莖製成。它掛在一條皮繩上，通常戴在脖子上或繫在腰帶上。",
  2: "這個護符有 3 點充能。攜帶護符時，你可以使用一個動作消耗 1 點充能施展{@spell speak with plants}法術。在法術持續時間內，你為影響植物的行為、舉止與態度而進行的魅力檢定也具有優勢。護符每天黎明恢復所有已消耗的充能。"},
 {1: "這塊扁平、灰黑相間的河石上刻著一個未知的奧術符號，摸起來冰涼。攜帶這顆石頭時，你可以讓一次你選擇的屬性檢定具有優勢。在下一個黎明之前，無法再以此方式使用這顆石頭。",
  3: "此物品受到詛咒。與它同調會詛咒你，直到你成為{@spell remove curse}法術或類似魔法的目標為止。只要你仍受到詛咒，你便無法丟棄這顆石頭，它會立即傳送回你的口袋或背包中。在你使用石頭的魔法之後，你接下來兩次屬性檢定具有劣勢。"},
 {1: "戴著這頂黃銅頭盔時，你可以在水下呼吸，獲得範圍 60 呎的{@sense darkvision}，並獲得 30 呎的游泳速度。"},
 {1: "這支細長精緻的木菸斗有一個以光滑河石製成的菸斗碗。點燃菸斗時，從中吐出的煙霧不會消散，而是縈繞在持有者周圍。10 分鐘後，煙霧會形成移動的形狀，以 5 分鐘重演持有者最令人印象深刻的英勇事蹟。這場逼真的表演結束時，煙霧便會消散。在下一個黎明之前，無法再以此方式使用菸斗。"},
 {1: "這顆小膠囊以蜂蠟混合沙子與各種附魔的水生植物製成。服用抗壓膠囊的生物可以無視在超過 100 呎深處游泳的效果（見《地下城主指南》第 5 章的「{@book 特殊環境|dmg|5|Unusual Environments}」）。"},
 {1: "這座 1 呎高的小雕像以砂岩巧妙雕成，描繪一條張著嘴在水中翻轉的鯊魚。若任何微型的海洋動物位於小雕像的嘴 1 吋內，鯊魚會瞬間活過來並對它造成 1 點穿刺傷害。鯊魚每小時最多只能以此方式造成一次傷害。"}]);
F("it-xmts", [
 {1: "這把由河流先驅打造的彎曲玉刃是一把{@item +1 dagger}，能偵測持用者 200 呎內是否有淡水。"},
 {1: "這把{@item +1 shortsword}是一把帶有鋸齒刃緣的可怕武器。揮舞它時，持用者在魅力（{@skill Intimidation}）檢定上具有優勢。"},
 {1: "這條串珠玉項鍊上有河流先驅的古老標誌。佩戴時，原初護符讓佩戴者能施展{@spell speak with animals}、{@spell locate object}與{@spell pass without trace}。護符被用來施展一道法術後，在下一個黎明之前無法再用來施展該法術。"},
 {1: "這把帶鉤的刀刃在船上或作為荒野中的切割工具都很有用，這把{@item +1 shortsword}讓持用者在為攀爬或在{@condition restrained}時脫逃而進行的力量（{@skill Athletics}）檢定上具有優勢。"},
 {1: "這支優雅的黃銅{@item spyglass|phb}有精巧的鏡片機構。透過術法望遠鏡觀看的生物，在為察覺可見事物而進行的感知（{@skill Perception}）檢定上具有優勢。此外，使用者透過望遠鏡觀看時可以看見魔法靈光，如同受到{@spell detect magic}法術的效果影響。"},
 {1: "這面飽經戰火但未曾折斷的軍旗上印有暮影軍團其中一支部隊的徽記。持握征服者旗幟的生物可以使用一個附贈動作，讓一名盟友在其下一次攻擊檢定、豁免檢定或屬性檢定上具有優勢。"}]);
F("it-jttrc", [
 {1: "受到這種毒素影響的生物必須成功通過一次 {@dc 16} 體質豁免檢定，否則{@condition poisoned} 1 分鐘。{@condition poisoned}的生物必須使用它的動作，對其觸及範圍內一個隨機決定的生物進行一次近戰攻擊。若其觸及範圍內沒有其他生物，{@condition poisoned}的生物在它的回合什麼也不做。該生物可以在它每個回合結束時重複豁免檢定，成功時結束自身的效果。"},
 {1: "每隔幾年，一片幽靈蘭群落會長出一個人類拳頭粗的黑色莢果，裡面有三顆柔軟的黑色種子。吃下其中一顆黑色種子的生物會受到{@spell feign death}法術的影響。若該生物不知道莢果的效果或不希望受到影響，它可以成功通過一次 {@dc 16} 體質豁免檢定來抵抗此效果。否則，它被視為該法術的自願接受者。"},
 {1: "世界吊床是一張以傳統阿塔瓜圖案編織而成的彩色吊床。只有名為綠醫師之教團的成員才能使用它。",
  2: "你可以使用一個動作將世界吊床展開並放在堅固的表面上，它會創造一道雙向傳送門，通往妖精荒野的幽靈蘭平頂山，或遠域的乾旱長老（由使用者選擇）。你可以使用一個動作抓住布料的邊緣並將它摺起，關閉開啟的傳送門。世界吊床開啟一道傳送門後，在 {@dice 1d8} 小時內無法再次如此。"},
 {1: "世界吊床是一張以傳統阿塔瓜圖案編織而成的彩色吊床。",
  2: "你可以使用一個動作將次級版本的世界吊床展開並放在堅固的表面上，它會創造一道通往另一個世界或存在位面的雙向傳送門。每次此物品開啟傳送門時，由 DM 決定它通往何處，或使用者可以讓它總是可靠地連接到幽靈蘭平頂山。你可以使用一個動作抓住布料的邊緣並將它摺起，關閉開啟的傳送門。次級版本的世界吊床開啟一道傳送門後，在 {@dice 1d8} 小時內無法再次如此。"},
 {1: "更罕見地，蘭花會長出一個較小的莢果，裡面只有一顆白色種子。在它的各種魔法屬性中，若將白色種子磨碎並撒在屍體上，屍體會受到{@spell resurrection}法術的影響。吃下白色幽靈蘭種子沒有效果。"}]);
