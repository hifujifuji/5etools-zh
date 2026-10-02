// 統一簡介中的專有名詞（對齊站內既有譯名）；用法：node work/_introfix.mjs
import fs from "fs";
const P="i18n/monster-intro.json"; let s=fs.readFileSync(P,"utf8");
const R={"嚴西賓":"延希賓","歐呂德拉":"奧莉德拉","奧格瑞摩":"歐格莫克","焦熱地獄的戰場":"阿刻戎的戰場","塞爾蒂凡":"瑟斯","梅爾紹克":"梅爾肖克","德卓爾":"丹達","阿斯莫蒂爾斯":"阿斯莫德斯","焦熱地獄":"格漢那","混沌惡魔深獄":"潘迪蒙尼姆","墨菲斯托費利斯":"梅菲斯托費勒斯","利維斯特斯":"萊維斯圖斯","冥河界":"斯泰吉亞","凱尼亞":"卡尼亞","瑟寇拉":"塞科拉","普萊姆斯":"普萊默斯","維拉基斯":"弗拉基斯","阿賽瑞拉克":"阿塞瑞拉克","獸之荒野":"獸域","奧庫斯":"奧迦斯","朱比雷克斯":"朱伊布雷克斯"};
let n=0; for(const [a,b] of Object.entries(R)){ const c=s.split(a).length-1; if(c&&a!==b){ s=s.split(a).join(b); n+=c; } }
fs.writeFileSync(P,s); console.log("替換",n,"處");
