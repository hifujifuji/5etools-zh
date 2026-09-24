// 同 _fillidx，但先以建置結果中已有的中文為底
import F from "./_fillidx.mjs";
import base from "./_fromdist.mjs";
export default (batch, maps, dict = {}) => {
	const bs = base(batch);
	F(batch, bs.map((m, i) => ({...m, ...(maps[i] || {})})), dict);
};
