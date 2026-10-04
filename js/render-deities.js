"use strict";

class RenderDeities {
	static getRenderedDeity (deity) {
		return ee`
			${Renderer.utils.getBorderTr()}
			${Renderer.utils.getExcludedTr({entity: deity, dataProp: "deity"})}
			${Renderer.utils.getNameTr(deity, {suffix: deity.title ? `, ${deity.title.toTitleCase()}` : "", page: UrlUtil.PG_DEITIES})}
			${RenderDeities._getDeityBody(deity)}
			${deity.reprinted ? `<tr><td colspan="6"><i class="ve-muted">註：此神祇已在較新的出版物中重印。</i></td></tr>` : ""}
			${Renderer.utils.getPageTr(deity)}
			${deity.previousVersions ? `
			${Renderer.utils.getDividerTr()}
			${deity.previousVersions.map((d, i) => RenderDeities._getDeityBody(d, i + 1)).join(Renderer.utils.getDividerTr())}
			` : ""}
			${Renderer.utils.getBorderTr()}
		`;
	}

	static _getDeityBody (deity, reprintIndex) {
		const renderer = Renderer.get();

		const renderStack = [];
		if (deity.entries) {
			renderer.recursiveRender(
				{
					entries: [
						...deity.customExtensionOf ? [`{@note 此條目以{@deity ${deity.customExtensionOf}|${ZH.name(deity) || deity.name}}為基礎，補充了 <i title="${Parser.sourceJsonToFull(deity.source).escapeQuotes()}">${Parser.sourceJsonToAbv(deity.source)}</i> 的額外資訊。}`] : [],
						...deity.entries,
					],
				},
				renderStack,
			);
		}

		if (deity.symbolImg) deity.symbolImg.style = deity.symbolImg.style || "deity-symbol";

		const entriesMeta = Renderer.deity.getDeityRenderableEntriesMeta(deity);

		return `
			${reprintIndex ? `
				<tr><td colspan="6">
				<i class="ve-muted">
				${reprintIndex === 1 ? `此神祇有重印版本。` : ""}以下為較早出版物中的版本（${Parser.sourceJsonToFull(deity.source)}${Renderer.utils.isDisplayPage(deity.page) ? `，第 ${deity.page} 頁` : ""}）。
				</i>
				</td></tr>
			` : ""}

			${entriesMeta.entriesAttributes.map(entry => `<tr><td colspan="6">${Renderer.get().render(entry)}</td></tr>`).join("")}

			${deity.symbolImg ? `<tr><td colspan="6">${renderer.render({entries: [deity.symbolImg]})}<div class="ve-mb-2"></div></td></tr>` : ""}
			${renderStack.length ? `<tr><td class="ve-pt-2" colspan="6">${renderStack.join("")}</td></tr>` : ""}
			`;
	}
}
