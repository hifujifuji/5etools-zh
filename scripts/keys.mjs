// 翻譯檔的 key 規則（build 與 tr 共用）。
//
// 主要 key 一律包含來源，避免 2014／2024 同名項目（例如兩個版本的 Path of the Berserker）互相覆蓋。
// hazmole 抽出來的子職業資料沒有記來源，所以另有「舊式 key」，只用在非 2024 來源的實體上。

import fs from "node:fs";
import path from "node:path";
import {readJson} from "./util.mjs";

export const S = s => (s || "").toUpperCase();

export const SOURCES_2024 = new Set(["XPHB", "XDMG", "XMM"]);

/** subclassFeature 只記 shortName，要查回子職業完整名稱 */
export function loadSubclassFullNames (dataDir) {
	const out = {};
	for (const f of fs.readdirSync(path.join(dataDir, "class"))) {
		if (!f.startsWith("class-")) continue;
		for (const sc of readJson(path.join(dataDir, "class", f)).subclass || []) {
			out[`${sc.className}|${sc.shortName}|${S(sc.source)}`] = sc.name;
		}
	}
	return out;
}

export function makeKeyFns (subclassFullName) {
	const scName = e => subclassFullName[`${e.className}|${e.subclassShortName}|${S(e.subclassSource)}`];
	const KEY = {
		deity: e => `${e.name}|${S(e.source)}|${e.pantheon || ""}`,
		subrace: e => `${e.raceName}|${e.name}|${S(e.source)}`,
		classFeature: e => `${e.name}|${e.className}|${S(e.classSource)}|${e.level}`,
		subclassFeature: e => `${e.name}|${e.className}|${scName(e)}|${S(e.source)}`,
		subclass: e => `${e.name}|${e.className}|${S(e.source)}`,
		magicvariant: e => `${e.name}|${S(e.inherits?.source || e.source)}`,
	};
	const LEGACY = {
		subclassFeature: e => `${e.name}|${e.className}|${scName(e)}`,
		subclass: e => `${e.name}|${e.className}`,
	};
	return {
		key: (prop, e) => (KEY[prop] || (x => `${x.name}|${S(x.source)}`))(e),
		/** 其他可接受的 key（舊式 key、舊版名稱寫法） */
		altKeys: (prop, e) => {
			const out = [];
			if (LEGACY[prop] && !SOURCES_2024.has(S(e.source))) out.push(LEGACY[prop](e));
			if (prop === "magicvariant") {
				const m = /^\+(\d) (.+)$/.exec(e.name);
				if (m) {
					const src = S(e.inherits?.source || e.source);
					out.push(`${m[2]} +${m[1]}|${src}`, `${m[2]}, +${m[1]}|${src}`, `${m[2]} +${m[1]}|DMG`, `${m[2]}, +${m[1]}|DMG`);
				}
			}
			return out;
		},
	};
}
