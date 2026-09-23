// 把舊版中文物件的文字「結構對齊」地套到新版英文物件上。
//
// 原則：
// - 只替換「文字欄位」中、舊版確實是中文的字串；數值、代碼、篩選用的欄位一律保留新版。
// - 結構對不上的地方（段落數不同、類型不同）保留英文，寧可少翻也不要錯位。
// - 名稱一律不改（連結、雜湊、_copy 都靠英文名），中文名放在 name_zh，
//   並用 _zhOf 記下它對應的英文名，避免 5etools 複製實體時把中文名帶到別的項目上。

import {hasCjk} from "./util.mjs";

// 注意：怪物施法的 will/daily/spells 不翻，_copy 的 replaceSpells 要靠原字串比對
export const TEXT_KEYS = new Set([
	"entries", "entriesHigherLevel", "items", "colLabels", "rows", "caption", "entry", "headerEntries",
	"footerEntries", "footnotes", "text", "legendaryHeader", "mythicHeader", "actionHeader", "bonusHeader",
	"reactionHeader", "from", "condition", "title", "other", "note", "additionalEntries",
	"row", "cells", "lower", "upper",
]);

// 這些欄位底下都是程式用的結構化資料（技能 key、法術清單…），整棵不碰
export const SKIP_KEYS = new Set([
	"startingProficiencies", "proficiency", "skillProficiencies", "toolProficiencies", "languageProficiencies",
	"weaponProficiencies", "armorProficiencies", "skillToolLanguageProficiencies", "additionalSpells", "ability",
	"feats", "expertise", "requirements", "proficienciesGained", "resist", "immune", "vulnerable", "conditionImmune",
	"savingThrowForced", "abilityCheckForced", "classes", "subclasses", "otherSources", "reprintedAs", "srd", "srd52",
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
			if (k === "name" || SKIP_KEYS.has(k) || !(k in old)) continue;
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
			if (SKIP_KEYS.has(k)) continue;
			n[k] = this._mergeVal(n[k], o[k], TEXT_KEYS.has(k));
		}
		return n;
	}

	_mergeList (n, o, isText) {
		for (const [ni, oi] of this._alignList(n, o)) {
			if (typeof n[ni] === "string") n[ni] = this._mergeVal(n[ni], o[oi], isText);
			else if (Array.isArray(n[ni])) n[ni] = this._mergeList(n[ni], o[oi], isText);
			else n[ni] = this._mergeObj(n[ni], o[oi]);
		}
		return n;
	}

	// ---- 清單對齊 ------------------------------------------------------------
	// 1. 長度相同且每格種類一致 → 依序配對（最常見）
	// 2. 否則用「錨點」：英文名相同，或段落裡的數字／標籤目標夠相似（DP 找最佳單調配對）
	// 3. 相鄰錨點之間若兩邊剩下的元素數量、種類都一樣 → 依序補配對
	_alignList (n, o) {
		const kind = v => typeof v === "string" ? "s" : Array.isArray(v) ? "a" : isObj(v) ? `o:${v.type || "entries"}` : null;
		const nk = n.map(kind), ok = o.map(kind);

		if (n.length === o.length && nk.every((k, i) => k && k === ok[i])) {
			return n.map((_, i) => [i, i]).filter(([i]) => !this._isNameConflict(n[i], o[i]));
		}

		const sim = (i, j) => {
			if (!nk[i] || nk[i] !== ok[j]) return -1;
			// 書本章節：頁碼相同是很強的線索；頁碼不同則不配
			if (isObj(n[i]) && n[i].page != null && o[j].page != null) return n[i].page === o[j].page ? 1 : -1;
			if (this._isNameConflict(n[i], o[j])) return -1;
			if (isObj(n[i]) && typeof n[i].name === "string" && engOf(o[j]) && norm(engOf(o[j])) === norm(n[i].name)) return 1;
			return this._sigSim(n[i], o[j]);
		};

		// DP：最大化相似度總和的單調配對（只算相似度 ≥ 0.34 的配對）
		const N = n.length, M = o.length;
		if (N * M > 40000) return [];
		const S = Array.from({length: N}, (_, i) => Array.from({length: M}, (_, j) => sim(i, j)));
		const dp = Array.from({length: N + 1}, () => new Float64Array(M + 1));
		for (let i = N - 1; i >= 0; --i) {
			for (let j = M - 1; j >= 0; --j) {
				let best = Math.max(dp[i + 1][j], dp[i][j + 1]);
				if (S[i][j] >= 0.34) best = Math.max(best, dp[i + 1][j + 1] + S[i][j]);
				dp[i][j] = best;
			}
		}
		const anchors = [];
		for (let i = 0, j = 0; i < N && j < M;) {
			if (S[i][j] >= 0.34 && dp[i][j] === dp[i + 1][j + 1] + S[i][j]) { anchors.push([i, j]); ++i; ++j; } else if (dp[i + 1][j] >= dp[i][j + 1]) ++i; else ++j;
		}

		// 錨點之間補配對：同種類的元素（字串對字串、entries 對 entries…）數量一樣就依序配對，
		// 所以新版多插一張圖片不會打亂後面的段落
		const out = [...anchors];
		const bounds = [[-1, -1], ...anchors, [N, M]];
		for (let b = 0; b < bounds.length - 1; ++b) {
			const [i0, j0] = bounds[b], [i1, j1] = bounds[b + 1];
			const byKindN = {}, byKindO = {};
			for (let i = i0 + 1; i < i1; ++i) if (nk[i]) (byKindN[nk[i]] ||= []).push(i);
			for (let j = j0 + 1; j < j1; ++j) if (ok[j]) (byKindO[ok[j]] ||= []).push(j);
			for (const [k, is] of Object.entries(byKindN)) {
				const js = byKindO[k];
				if (!js || js.length !== is.length) continue;
				is.forEach((i, x) => { if (!this._isNameConflict(n[i], o[js[x]])) out.push([i, js[x]]); });
			}
		}
		return out;
	}

	/** 舊版有英文名，但跟新版名稱不同 → 不是同一個東西（書本章節頁碼相同時以頁碼為準，舊版 ENG_name 偶有錯字） */
	_isNameConflict (nv, ov) {
		if (!isObj(nv) || !isObj(ov) || !engOf(ov) || typeof nv.name !== "string") return false;
		if (nv.page != null && nv.page === ov.page) return false;
		return norm(engOf(ov)) !== norm(nv.name);
	}

	_sig (v, isOld) {
		const str = typeof v === "string" ? v : JSON.stringify(v);
		const s = isOld ? this.convertTags(str, {quiet: true}) : str;
		const out = new Set();
		for (const m of s.matchAll(/\{@(\w+) ([^|}]+)/g)) out.add(`${m[1]}:${m[2].trim().toLowerCase()}`);
		for (const m of s.matchAll(/\d+(?:d\d+)?/g)) out.add(m[0]);
		return out;
	}

	_sigSim (nv, ov) {
		const a = this._sig(nv, false), b = this._sig(ov, true);
		if (!a.size || !b.size) return 0;
		let inter = 0;
		for (const x of a) if (b.has(x)) ++inter;
		return inter / (a.size + b.size - inter);
	}

	// {@spell 火球術} → {@spell Fireball||火球術}
	static _NAME_TAGS = new Set([
		"spell", "creature", "item", "race", "background", "feat", "optfeature", "condition", "disease", "deity",
		"trap", "hazard", "reward", "object", "variantrule", "cult", "boon", "psionic", "vehicle", "class",
		"skill", "action", "sense", "status", "language", "table", "legroup", "card", "deck", "classFeature",
		"subclassFeature", "subclass", "itemProperty", "itemMastery",
	]);

	convertTags (str, {quiet = false} = {}) {
		return str.replace(/\{@(\w+) ([^{}]*)\}/g, (m, tag, body) => {
			if (!Merger._NAME_TAGS.has(tag)) return m;
			const parts = body.split("|");
			const zh = parts[0].trim();
			if (!hasCjk(zh)) return m;
			const en = this.lookup(tag, zh);
			if (!en) {
				if (quiet) return parts[2] || zh;
				this.stats.tagsUnresolved[`${tag}:${zh}`] = (this.stats.tagsUnresolved[`${tag}:${zh}`] || 0) + 1;
				return parts[2] || zh;
			}
			if (!quiet) this.stats.tagsResolved++;
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
