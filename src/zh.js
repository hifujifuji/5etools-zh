"use strict";
// 5etools 中文化執行期輔助：
// - ZH.name / ZH.nameHtml：取實體中文名（資料裡的 name_zh），顯示成「中文 English」
// - 介面文字翻譯：用 MutationObserver 把「整段完全符合」詞典的文字節點換成中文，
//   另外用少量正規式處理「3rd-level evocation」這類組合字串。
//   只比對整段文字，所以不會動到內文段落。

(function () {
	const DICT = /* __ZH_DICT__ */ {};
	const RULES_SRC = /* __ZH_RULES__ */ [];
	// 只用於分頁標題的實體名稱（背景、專長…），避免影響頁面其他文字
	const TITLE = /* __ZH_TITLE__ */ {};

	const RULES = RULES_SRC.map(([re, repl]) => [new RegExp(`^${re}$`), repl]);

	const tOne = (s) => {
		const hit = DICT[s];
		if (hit != null) return hit;
		for (const [re, repl] of RULES) {
			const m = re.exec(s);
			if (!m) continue;
			// {n}：遞迴翻譯捕獲的片段；規則裡有 {n} 卻一個都翻不出來，就不套用這條
			let hasSub = false, nSub = 0;
			const out = repl.replace(/\$(\d)|\{(\d)\}/g, (_, a, b) => {
				const v = m[Number(a || b)] ?? "";
				if (b == null) return v;
				hasSub = true;
				const x = t(v);
				if (x != null) { ++nSub; return x; }
				return v;
			});
			if (hasSub && !nSub) continue;
			return out;
		}
		return null;
	};

	// 組合字串：「Dexterity +2; Intelligence +1」「Small/Medium」「Fire, Cold」
	// 每一段都翻得出來（或只是數字符號）才算數
	const RE_SPLIT = /(; |, | or | and |\/)/;
	const SEP_ZH = {"; ": "；", ", ": "、", " or ": "或", " and ": "和", "/": "／"};
	const RE_TRIVIAL = /^[\d\s+\-–—×().,/%]*$/;
	const t = (s) => {
		if (s == null) return s;
		const one = tOne(s);
		if (one != null) return one;
		if (!RE_SPLIT.test(s)) return null;
		const parts = s.split(RE_SPLIT);
		let nTranslated = 0;
		const out = parts.map((p, i) => {
			if (i % 2) return SEP_ZH[p];
			const x = tOne(p);
			if (x != null) { ++nTranslated; return x; }
			return RE_TRIVIAL.test(p) ? p : null;
		});
		if (!nTranslated || out.some(p => p == null)) return null;
		return out.join("");
	};

	const ZH = {
		t,
		/** 取中文名；_zhOf 不符（例如被 _copy 繼承到別的實體）就不算 */
		name (ent) {
			if (!ent || !ent.name_zh) return null;
			if (ent._zhOf != null && ent._zhOf !== ent.name) return null;
			return ent.name_zh;
		},
		/** 列表、標題用：「中文 <small>English</small>」 */
		nameHtml (ent, fallback) {
			const en = fallback ?? (ent?._displayName || ent?.name || "");
			const zh = ZH.name(ent);
			if (!zh) return `<span class="zh-nt">${en}</span>`;
			return `<span class="zh-nt">${zh}<span class="zh-en">${en}</span></span>`;
		},
		/** 純文字（title 屬性、排序…） */
		nameText (ent, fallback) {
			const en = fallback ?? (ent?._displayName || ent?.name || "");
			const zh = ZH.name(ent);
			return zh ? `${zh} ${en}` : en;
		},
		/** 渲染器用：把巢狀條目的顯示名稱換成中文 */
		withZhName (entry) {
			if (entry && typeof entry === "object" && entry.name_zh && (entry._zhOf == null || entry._zhOf === entry.name)) {
				const out = {...entry, name: entry.name_zh, _nameEn: entry.name, name_zh: undefined};
				// 「Level 3: Xxx」之類的顯示名稱也一併換掉英文名
				if (typeof entry._displayName === "string" && entry._displayName.includes(entry.name)) {
					out._displayName = entry._displayName.replace(entry.name, entry.name_zh);
				}
				return out;
			}
			return entry;
		},
		/** 全站搜尋：中文 token 加上所有後綴，讓「球術」「飛彈」這種片段也搜得到 */
		patchElasticlunr (lunr) {
			if (lunr.tokenizer.__zh) return;
			const orig = lunr.tokenizer;
			const RE_CJK = /[\u3400-\u9fff]/;
			const wrapped = function (...args) {
				const out = [];
				for (const tok of orig.apply(this, args)) {
					out.push(tok);
					if (RE_CJK.test(tok)) for (let i = 1; i < tok.length; ++i) out.push(tok.slice(i));
				}
				return out;
			};
			Object.assign(wrapped, orig, {__zh: true});
			lunr.tokenizer = wrapped;
		},
	};
	globalThis.ZH = ZH;

	// ---- DOM 介面翻譯 ----------------------------------------------------------
	const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "CODE", "PRE", "SELECT"]);
	const ATTRS = ["title", "placeholder", "aria-label"];
	const RE_TRIM = /^(\s*)(.*?)(\s*)$/s;

	const translateText = (node) => {
		const v = node.nodeValue;
		if (!v || v.length > 120) return;
		const m = RE_TRIM.exec(v);
		const core = m[2];
		if (!core || !/[A-Za-z]/.test(core)) return;
		let out = t(core);
		// 「Casting Time:」這類結尾標點
		if (out == null) {
			const mp = /^(.*?)([:：.]\s*)$/.exec(core);
			if (mp) { const x = t(mp[1]); if (x != null) out = `${x}${mp[2].startsWith(":") ? "：" : mp[2]}`; }
		}
		if (out != null && out !== core) node.nodeValue = `${m[1]}${out}${m[3]}`;
	};

	const isSkipped = (el) => {
		for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
			if (SKIP_TAGS.has(e.tagName) || e.isContentEditable) return true;
			const cl = e.classList;
			if (cl && (cl.contains("zh-nt") || cl.contains("zh-en"))) return true;
		}
		return false;
	};

	const translateAttrs = (el) => {
		for (const a of ATTRS) {
			const v = el.getAttribute?.(a);
			if (!v || !/[A-Za-z]/.test(v)) continue;
			const x = t(v.trim());
			if (x != null) el.setAttribute(a, x);
		}
	};

	const walk = (root) => {
		if (root.nodeType === 3) {
			if (!isSkipped(root.parentElement)) translateText(root);
			return;
		}
		if (root.nodeType !== 1 && root.nodeType !== 11) return;
		if (root.nodeType === 1 && isSkipped(root)) return;
		if (root.nodeType === 1) translateAttrs(root);
		const tw = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
			acceptNode (n) {
				if (n.nodeType === 1) {
					if (SKIP_TAGS.has(n.tagName) || n.classList.contains("zh-nt")) return NodeFilter.FILTER_REJECT;
					return NodeFilter.FILTER_ACCEPT;
				}
				return NodeFilter.FILTER_ACCEPT;
			},
		});
		let n;
		while ((n = tw.nextNode())) {
			if (n.nodeType === 3) translateText(n);
			else translateAttrs(n);
		}
	};

	const translateTitle = () => {
		const tt = document.title;
		const mT = /^(.+) - 5etools$/.exec(tt);
		const x = mT && TITLE[mT[1]] ? `${TITLE[mT[1]]} - 5etools 中文版` : t(tt);
		if (x != null && x !== tt) document.title = x;
	};

	const obs = new MutationObserver((muts) => {
		for (const mu of muts) {
			if (mu.type === "childList") {
				for (const n of mu.addedNodes) walk(n);
				if (mu.target.nodeName === "TITLE") translateTitle();
			} else if (mu.type === "characterData") {
				if (mu.target.parentElement?.nodeName === "TITLE") translateTitle();
				else if (!isSkipped(mu.target.parentElement)) translateText(mu.target);
			} else if (mu.type === "attributes") {
				if (!isSkipped(mu.target)) translateAttrs(mu.target);
			}
		}
	});
	obs.observe(document.documentElement, {childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS});
	document.addEventListener("DOMContentLoaded", () => { walk(document.body); translateTitle(); });
})();
