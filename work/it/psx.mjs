import F from "./_p.mjs";
const FA = {"Sun Empire": "太陽帝國", "Brazen Coalition": "銅鑄聯盟", "River Heralds": "河流先驅", "Legion of Dusk": "暮影軍團"};
const Z = {
"Amulet of dinosaur feathers": "恐龍羽毛護符", "Bejeweled ivory drinking horn with gold inlay": "鑲金嵌寶的象牙角杯", "Bronze spyglass": "青銅望遠鏡",
"Carved jade statuette": "玉雕小像", "Ceremonial silver dagger with gold pommel and black pearl": "金柄頭鑲黑珍珠的儀式銀匕首", "Copper stein with silver filigree": "銀絲細工銅啤酒杯",
"Feathered mantle with emerald clasp": "綠寶石扣環羽毛披風", "Fine gold chain with fire opals": "鑲火蛋白石的精緻金鍊", "Fine robe with dinosaur feathers and silver embroidery": "飾有恐龍羽毛與銀線刺繡的華美長袍",
"Fine steel rapier with gold filigree hilt": "金絲細工劍柄的精鋼刺劍", "Finely articulated jade glove": "關節精巧的玉手套", "Gold basin with rubies": "鑲紅寶石的金盆",
"Gold chalice": "金聖杯", "Gold chalice set with emeralds": "鑲綠寶石的金聖杯", "Gold pendant with black onyx": "鑲黑縞瑪瑙的金墜飾", "Gold ring with turquoise": "鑲綠松石的金戒指",
"Gold-plated ceremonial helmet and pauldrons": "鍍金儀式頭盔與肩甲", "Gold-plated sextant with topaz": "鑲黃玉的鍍金六分儀", "Jade bowl": "玉碗", "Jade breastplate": "玉胸甲",
"Jade headpiece": "玉頭飾", "Jade sword with amber": "鑲琥珀的玉劍", "Jade totem with diamond eyes": "鑽石眼玉圖騰", "Large jade totem": "大型玉圖騰",
"Lute crafted of exotic wood with mother-of-pearl inlay and zircon gems": "以珍奇木材製成、鑲珍珠母貝與鋯石的魯特琴", "Marble font with gold inlay": "鑲金大理石洗禮盆",
"Masterpiece painting in mahogany frame with gold inlay": "裝在鑲金桃花心木畫框中的名畫", "Necklace of electrum medallions with red and blue tourmalines": "鑲紅、藍電氣石的琥珀金圓章項鍊",
"Necklace of jade and pink pearls": "玉與粉紅珍珠項鍊", "Pewter mug with green spinels": "鑲綠尖晶石的白鑞馬克杯", "Platinum headdress with topaz sun symbol": "飾有黃玉太陽標誌的白金頭飾",
"Platinum ring with yellow sapphire": "鑲黃色藍寶石的白金戒指", "Platinum staff topped with amber": "頂端鑲琥珀的白金手杖", "Silver headdress with amber and red-coral feathers": "飾有琥珀與紅珊瑚羽毛的銀頭飾",
"Silver medallion": "銀圓章", "Silver necklace with an amber pendant": "附琥珀墜飾的銀項鍊", "Silver shoulder piece with amber and garnet": "鑲琥珀與石榴石的銀肩飾",
"Sun amulet on a beaded chain": "串珠鍊太陽護符", "Tiny jade figurine": "微型玉雕像", "Treasure chest crafted of exotic wood with gold fittings and opals": "以珍奇木材製成、飾有金配件與蛋白石的寶箱",
"Velvet doublet with gold buttons": "金鈕扣天鵝絨緊身上衣"};
const en = JSON.parse((await import("fs")).readFileSync("work/it-psx.en.json")).items;
F("it-psx", en.map(it => { const [, a, b] = /^(.+) \((.+)\)$/.exec(it.s[0]); return {0: `${Z[a]}（${FA[b]}）`}; }));
