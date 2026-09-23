import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const UPSTREAM = process.env.UPSTREAM
	|| path.join(process.env.HOME, "Library/Mobile Documents/com~apple~CloudDocs/Main/TRPG/Dungeon & Dragons/5etools-2.25.3");

export const readJson = f => JSON.parse(fs.readFileSync(f, "utf8"));

export const writeJson = (f, obj, {pretty = true} = {}) => {
	fs.mkdirSync(path.dirname(f), {recursive: true});
	fs.writeFileSync(f, pretty ? `${JSON.stringify(obj, null, "\t")}\n` : JSON.stringify(obj));
};

const RE_CJK = /[㐀-鿿豈-﫿]/;
export const hasCjk = s => typeof s === "string" && RE_CJK.test(s);
