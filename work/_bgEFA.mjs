import fill from "./_tcefill.mjs";
import fs from "fs";
const en = JSON.parse(fs.readFileSync("work/bg-EFA.en.json")).items;
const NAMES = {"Aberrant Heir": "異常繼承人", "Archaeologist": "考古學家", "House Agent": "家族密探", "Inquisitive": "調查員", "House Cannith Heir": "坎尼斯家族繼承人", "House Deneith Heir": "迪內斯家族繼承人", "House Ghallanda Heir": "加蘭達家族繼承人", "House Jorasco Heir": "裘拉斯科家族繼承人", "House Kundarak Heir": "昆達拉克家族繼承人", "House Lyrandar Heir": "萊蘭達家族繼承人", "House Medani Heir": "梅達尼家族繼承人", "House Orien Heir": "歐瑞恩家族繼承人", "House Phiarlan Heir": "菲亞蘭家族繼承人", "House Sivis Heir": "西維斯家族繼承人", "House Tharashk Heir": "薩拉什克家族繼承人", "House Thuranni Heir": "圖蘭尼家族繼承人", "House Vadalis Heir": "瓦達利斯家族繼承人"};
const out = en.map(e => e.s.map((s, j) => j === 0 ? (NAMES[s] ?? null) : null));
try { fill("bg-EFA", out); } catch (err) { console.log(err.message); }
