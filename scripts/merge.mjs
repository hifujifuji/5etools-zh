// 把舊版中文物件的文字「結構對齊」地套到新版英文物件上。
//
// 原則：
// - 只替換「文字欄位」中、舊版確實是中文的字串；數值、代碼、篩選用的欄位一律保留新版。
// - 結構對不上的地方（段落數不同、類型不同）保留英文，寧可少翻也不要錯位。
// - 名稱一律不改（連結、雜湊、_copy 都靠英文名），中文名放在 name_zh，
//   並用 _zhOf 記下它對應的英文名，避免 5etools 複製實體時把中文名帶到別的項目上。

import {hasCjk} from "./util.mjs";

// 注意：怪物施法的 will/daily/spells 不翻，_copy 的 replaceSpells 要靠原字串比對
const TEXT_KEYS = new Set([
	"entries", "entriesHigherLevel", "items", "colLabels", "rows", "caption", "entry", "headerEntries",
	"footerEntries", "footnotes", "text", "legendaryHeader", "mythicHeader", "actionHeader", "bonusHeader",
	"reactionHeader", "from", "condition", "title", "other", "note", "additionalEntries",
	"row", "cells", "lower", "upper",
]);

const engOf = o => (o?.ENG_name ?? o?.tENG_name ?? "").trim();
const isObj = v => v != null && typeof v === "object" && !Array.isArray(v);
const norm = s => (s || "").toLowerCase().replace(/\s+/g, " ").trim();

export class Merger {
	constructor ({glossary}) {
		this._glossary = glossary; // tag -> {中文: English}
		this.stats = {strings: 0, names: 0, tagsResolved: 0, tagsUnresolved: {}};
	}

	/** 設定實體的中文名（顯示用） */
	static setName (ent, zh) {
		if (!zh || !hasCjk(zh)) return;
		ent.name_zh = zh.trim();
		ent._zhOf = ent.name;
	}

	/** 把舊版中文 old 合併進新版英文 neu（直接修改 neu）。 */
	mergeEntity (neu, old) {
		if (hasCjk(old.name)) Merger.setName(neu, old.name);
		for (const k of Object.keys(neu)) {
			if (k === "name" || !(k in old)) continue;
			neu[k] = this._mergeVal(neu[k], old[k], TEXT_KEYS.has(k));
		}
		return neu;
	}

	/** 只合併某個子樹（例如書本的 data 陣列） */
	mergeTree (neu, old, isText = true) {
		return this._mergeVal(neu, old, isText);
	}

	_mergeVal (n, o, isText) {
		if (typeof n === "string") {
			if (isText && typeof o === "string" && hasCjk(o)) {
				this.stats.strings++;
				return this.convertTags(o);
			}
			return n;
		}
		if (Array.isArray(n)) return Array.isArray(o) ? this._mergeList(n, o, isText) : n;
		if (isObj(n)) return isObj(o) ? this._mergeObj(n, o) : n;
		return n;
	}

	_mergeObj (n, o) {
		// 型別不同就不要硬套
		if (n.type && o.type && n.type !== o.type) return n;
		for (const k of Object.keys(n)) {
			if (!(k in o)) continue;
			if (k === "name") {
				if (typeof o.name === "string" && hasCjk(o.name) && typeof n.name === "string") {
					n.name_zh = this.convertTags(o.name.trim());
					n._zhOf = n.name;
					this.stats.names++;
				}
				continue;
			}
			n[k] = this._mergeVal(n[k], o[k], TEXT_KEYS.has(k));
		}
		return n;
	}

	_mergeList (n, o, isText) {
		// 字串：數量一致才依序對應
		const nStr = [], oStr = [];
		n.forEach((v, i) => typeof v === "string" && nStr.push(i));
		o.forEach((v, i) => typeof v === "string" && oStr.push(i));
		if (nStr.length === oStr.length) nStr.forEach((ni, j) => n[ni] = this._mergeVal(n[ni], o[oStr[j]], isText));

		// 巢狀陣列（表格列）：數量一致才依序對應
		const nArr = [], oArr = [];
		n.forEach((v, i) => Array.isArray(v) && nArr.push(i));
		o.forEach((v, i) => Array.isArray(v) && oArr.push(i));
		if (nArr.length === oArr.length) nArr.forEach((ni, j) => n[ni] = this._mergeList(n[ni], o[oArr[j]], isText));

		// 物件：先用英文名對應，其餘在數量一致時依序對應
		const nObj = [], oObj = [];
		n.forEach((v, i) => isObj(v) && nObj.push(i));
		o.forEach((v, i) => isObj(v) && oObj.push(i));
		const usedO = new Set();
		const pairs = new Map();
		for (const ni of nObj) {
			const nm = norm(typeof n[ni].name === "string" ? n[ni].name : "");
			if (!nm) continue;
			const oi = oObj.find(oi => !usedO.has(oi) && (norm(engOf(o[oi])) === nm || norm(o[oi].name) === nm));
			if (oi != null) { usedO.add(oi); pairs.set(ni, oi); }
		}
		if (nObj.length === oObj.length) {
			nObj.forEach((ni, j) => {
				if (pairs.has(ni)) return;
				const oi = oObj[j];
				if (usedO.has(oi)) return;
				const on = o[oi], nn = n[ni];
				// 舊版有英文名但對不上 → 不是同一個東西
				if (engOf(on) && typeof nn.name === "string" && norm(engOf(on)) !== norm(nn.name)) return;
				if ((on.type || "entries") !== (nn.type || "entries")) return;
				usedO.add(oi);
				pairs.set(ni, oi);
			});
		}
		for (const [ni, oi] of pairs) n[ni] = this._mergeObj(n[ni], o[oi]);
		return n;
	}

	// {@spell 火球術} → {@spell Fireball||火球術}
	static _NAME_TAGS = new Set([
		"spell", "creature", "item", "race", "background", "feat", "optfeature", "condition", "disease", "deity",
		"trap", "hazard", "reward", "object", "variantrule", "cult", "boon", "psionic", "vehicle", "class",
		"skill", "action", "sense", "status", "language", "table", "legroup", "card", "deck", "classFeature",
		"subclassFeature", "subclass", "itemProperty", "itemMastery",
	]);

	convertTags (str) {
		return str.replace(/\{@(\w+) ([^{}]*)\}/g, (m, tag, body) => {
			if (!Merger._NAME_TAGS.has(tag)) return m;
			const parts = body.split("|");
			const zh = parts[0].trim();
			if (!hasCjk(zh)) return m;
			const en = this.lookup(tag, zh);
			if (!en) {
				this.stats.tagsUnresolved[`${tag}:${zh}`] = (this.stats.tagsUnresolved[`${tag}:${zh}`] || 0) + 1;
				return parts[2] || zh;
			}
			this.stats.tagsResolved++;
			parts[0] = en;
			if (parts.length < 2) parts[1] = "";
			if (!parts[2]) parts[2] = zh;
			return `{@${tag} ${parts.join("|")}}`;
		});
	}

	lookup (tag, zh) {
		const g = this._glossary[tag];
		if (!g) return null;
		const hit = g[zh] ?? g[zh.replace(/\s+/g, "")];
		if (hit) return hit;
		if (tag === "item") {
			// 長劍+1 → +1 Longsword；精金鎖子甲 → Adamantine Chain Mail
			const mBonus = /^(.+?)\s*\+(\d)$/.exec(zh);
			if (mBonus) { const base = this.lookup("item", mBonus[1]); if (base) return `+${mBonus[2]} ${base}`; }
			for (const [pre, en] of [["精金", "Adamantine"], ["秘銀", "Mithral"]]) {
				if (zh.startsWith(pre)) { const base = this.lookup("item", zh.slice(pre.length)); if (base) return `${en} ${base}`; }
			}
		}
		return null;
	}
}
