import fs from "fs";
import {Merger} from "../scripts/merge.mjs";
const up = JSON.parse(fs.readFileSync(process.env.UPSTREAM + "/data/backgrounds.json", "utf8")).background.find(x => x.name === "Inquisitor");
const c = JSON.parse(fs.readFileSync("i18n/custom/background.json", "utf8"))["Inquisitor|PSI"];
const m = new Merger({glossary: {}});
m.mergeEntity(up, c);
console.log(JSON.stringify(up.entries[1]).slice(0, 300));
