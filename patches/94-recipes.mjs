// 食譜頁的介面字串：份量／產量、器具、廚師筆記、飲食與其他篩選
export default [
	{
		file: "js/render.js",
		replace: [
			["? `{@b {@style Makes|small-caps}} ${ent._scaleFactor ? `${ent._scaleFactor}× ` : \"\"}${ent.makes}`", "? `{@b 產量} ${ent._scaleFactor ? `${ent._scaleFactor}× ` : \"\"}${ent.makes}`"],
			["? `{@b {@style Serves|small-caps}} ${ent.serves.min ?? ent.serves.exact}${ent.serves.min != null ? \" to \" : \"\"}${ent.serves.max ?? \"\"}${ent.serves.note ? ` ${ent.serves.note}` : \"\"}`", "? `{@b 份量} ${ent.serves.min ?? ent.serves.exact}${ent.serves.min != null ? \" 至 \" : \"\"}${ent.serves.max ?? \"\"} 人份${ent.serves.note ? `，${ent.serves.note}` : \"\"}`"],
			["<div class=\"ve-flex-vh-center ve-bold ve-mb-1 ve-small-caps\">Equipment</div>", "<div class=\"ve-flex-vh-center ve-bold ve-mb-1 ve-small-caps\">器具</div>"],
			["<div class=\"ve-flex-vh-center ve-bold ve-mb-1 ve-small-caps\">Cook's Notes</div>", "<div class=\"ve-flex-vh-center ve-bold ve-mb-1 ve-small-caps\">廚師筆記</div>"],
			["entryName: `{@b {@style ${prop.toTitleCase()} Time:|small-caps}}`,", "entryName: `{@b ${({total: \"總時間\", preparation: \"準備時間\", cooking: \"烹調時間\"})[prop] ?? `${prop.toTitleCase()} Time`}：}`,"],
		],
	},
	{
		file: "js/render-recipes.js",
		replace: [
			["<div class=\"ve-flex-vh-center ve-bold ve-mb-1 ve-small-caps\">Equipment</div>", "<div class=\"ve-flex-vh-center ve-bold ve-mb-1 ve-small-caps\">器具</div>"],
			["<div class=\"ve-flex-vh-center ve-bold ve-mb-1 ve-small-caps\">Cook's Notes</div>", "<div class=\"ve-flex-vh-center ve-bold ve-mb-1 ve-small-caps\">廚師筆記</div>"],
			["<div class=\"ve-mb-2\">Scale: ${opts.selScaleFactor}</div>", "<div class=\"ve-mb-2\">倍數：${opts.selScaleFactor}</div>"],
		],
	},
	{
		file: "js/recipes.js",
		replace: [
			["<select title=\"Scale Recipe\"", "<select title=\"調整份量\""],
		],
	},
	{
		file: "js/filter-recipes.js",
		replace: [
			["\"V\": \"Vegan\",\n\t\t\"C\": \"Vegetarian\",\n\t\t\"X\": \"Omni\",", "\"V\": \"純素\",\n\t\t\"C\": \"蛋奶素\",\n\t\t\"X\": \"葷食\","],
			["\"alcohol\": \"Contains Alcohol\",\n\t\t\"feast\": \"Feast Dish\",", "\"alcohol\": \"含酒精\",\n\t\t\"feast\": \"宴席菜\","],
			["header: \"Allergens\",", "header: \"過敏原\","],
			["new RangeFilter({header: \"Total\",", "new RangeFilter({header: \"總時間\","],
			["new RangeFilter({header: \"Preparation\",", "new RangeFilter({header: \"準備\","],
			["new RangeFilter({header: \"Cooking\",", "new RangeFilter({header: \"烹調\","],
		],
	},
	{
		file: "recipes.html",
		replace: [
			["title=\"We gratefully accept any and all corrections in our Discord, a link to which can be found on the homepage.\">Please note that allergen and other dietary information may be incomplete and/or inaccurate.</div>", "title=\"歡迎到首頁連結的 Discord 回報任何錯誤。\">請注意，過敏原與其他飲食資訊可能不完整或不正確。</div>"],
		],
	},
];
