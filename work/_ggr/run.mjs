import F from "../_fillidx.mjs";
import {COMMON} from "./common.mjs";
const maps = [];
for (let i = 0; i < 10; ++i) maps.push((await import(`./${i}.mjs`)).default);
F("bg-GGR", maps, COMMON);
