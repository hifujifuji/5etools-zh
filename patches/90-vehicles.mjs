// 載具頁的介面字串：體型列、容量、旅行速度、狀態免疫、部件標題、升級類型
const TYPE = {SHIP: "船隻", SPELLJAMMER: "魔法航行船", ELEMENTAL_AIRSHIP: "元素飛空艇", INFWAR: "煉獄戰爭機器", CREATURE: "生物", OBJECT: "物件", "SHP:H": "船隻升級：船身", "SHP:M": "船隻升級：移動", "SHP:W": "船隻升級：武器", "SHP:F": "船隻升級：船艏像", "SHP:O": "船隻升級：其他", "IWM:W": "煉獄戰爭機器變體：武器", "IWM:A": "煉獄戰爭機器升級：裝甲", "IWM:G": "煉獄戰爭機器升級：機關"};
const COND = {blinded: "目盲", charmed: "魅惑", deafened: "耳聾", exhaustion: "力竭", frightened: "恐懼", grappled: "被擒", incapacitated: "無力", invisible: "隱形", paralyzed: "麻痺", petrified: "石化", poisoned: "中毒", prone: "伏地", restrained: "束縛", stunned: "震懾", unconscious: "昏迷"};
const SZ = `(sz => ({T: "微型", S: "小型", M: "中型", L: "大型", H: "巨型", G: "超巨型"})[sz] ?? Parser.sizeAbvToFull(sz))`;

export default [
	{
		file: "js/parser.js",
		replace: [
			[/Parser\.VEHICLE_TYPE_TO_FULL = \{[^}]*\};/, m => { const keep = [...m.matchAll(/"([^"]+)": "([^"]+)"/g)].map(([, k, v]) => [k, TYPE[k] ?? v]); return `Parser.VEHICLE_TYPE_TO_FULL = ${JSON.stringify(Object.fromEntries(keep))};`; }],
		],
	},
	{
		file: "js/render.js",
		replace: [
			["`{@b Condition Immunities} ${Parser.getFullCondImm(ent.conditionImmune, {isEntry: true})}`", "`{@b Condition Immunities} ${ent.conditionImmune.every(c => typeof c === \"string\") ? ent.conditionImmune.map(c => `{@condition ${c}||${(" + JSON.stringify(COND) + ")[c] ?? c}}`).join(\"、\") : Parser.getFullCondImm(ent.conditionImmune, {isEntry: true})}`"],
			["entrySizeDimensions: `{@i ${Parser.sizeAbvToFull(ent.size)} vehicle${ent.dimensions ? ` (${ent.dimensions.join(\" by \")})` : \"\"}}`,", "entrySizeDimensions: `{@i " + "${" + SZ + "(ent.size)}載具${ent.dimensions ? `（${ent.dimensions.join(\" × \").replace(/ ft\\./g, \" 呎\")}）` : \"\"}}`,"],
			["`{@b Creature Capacity} ${Renderer.vehicle.getShipCreatureCapacity(ent)}`", "`{@b 生物容量} ${Renderer.vehicle.getShipCreatureCapacity(ent)}`"],
			["`{@b Cargo Capacity} ${Renderer.vehicle.getShipCargoCapacity(ent)}`", "`{@b 載貨容量} ${Renderer.vehicle.getShipCargoCapacity(ent)}`"],
			["`{@b Travel Pace} ${ent.pace} miles per hour (${ent.pace * 24} miles per day)`", "`{@b 旅行速度} 每小時 ${ent.pace} 哩（每天 ${ent.pace * 24} 哩）`"],
			["`[{@b Speed} ${ent.pace * 10} ft.]`", "`[{@b 速度} ${ent.pace * 10} 呎]`"],
			["name: `Locomotion (${loc.mode})`,", "name: `移動方式（${globalThis.ZH?.t?.(loc.mode) ?? loc.mode}）`,"],
			["name: `Speed (${spd.mode})`,", "name: `速度（${({air: \"空中\", water: \"水上\", land: \"陸上\"})[spd.mode] ?? spd.mode}）`,"],
			["${isEach ? ` each` : \"\"}${entry.dt ? ` (damage threshold ${entry.dt})` : \"\"}", "${isEach ? `（每個）` : \"\"}${entry.dt ? `（傷害閾值 ${entry.dt}）` : \"\"}"],
			["<h3 class=\"ve-stats__sect-header-inner\">Control: ${control.name}</h3>", "<h3 class=\"ve-stats__sect-header-inner\">操控：${control.name_zh ?? control.name}</h3>"],
			["<h3 class=\"ve-stats__sect-header-inner\">${move.isControl ? `Control and ` : \"\"}Movement: ${move.name}</h3>", "<h3 class=\"ve-stats__sect-header-inner\">${move.isControl ? `操控與` : \"\"}移動：${move.name_zh ?? move.name}</h3>"],
			["<h3 class=\"ve-stats__sect-header-inner\">Weapons: ${weap.name}${weap.count ? ` (${weap.count})` : \"\"}</h3>", "<h3 class=\"ve-stats__sect-header-inner\">武器：${weap.name_zh ?? weap.name}${weap.count ? `（${weap.count}）` : \"\"}</h3>"],
			["`{@tip ${isMulti && mode !== \"walk\" ? `${mode} ` : \"\"}${pace} mph|${asNum * 24} miles per day}`", "`{@tip ${isMulti && mode !== \"walk\" ? `${mode} ` : \"\"}時速 ${pace} 哩|每天 ${asNum * 24} 哩}`"],
			["`{@b Cargo:} ${ent.capCargo ? `${ent.capCargo} ton${ent.capCargo === 1 ? \"\" : \"s\"}` : \"\\u2014\"}`", "`{@b 貨物：} ${ent.capCargo ? `${ent.capCargo} 噸` : \"\\u2014\"}`"],
			["`{@b Crew:} ${ent.capCrew ?? \"\\u2014\"}", "`{@b 船員：} ${ent.capCrew ?? \"\\u2014\"}"],
			["`{@b Damage Threshold:} ${ent.hull?.dt ?? \"\\u2014\"}`", "`{@b 傷害閾值：} ${ent.hull?.dt ?? \"\\u2014\"}`"],
			["`{@b Keel/Beam:} ${(ent.dimensions || [\"\\u2014\"]).join(\"/\")}`", "`{@b 龍骨長／船寬：} ${(ent.dimensions || [\"\\u2014\"]).join(\"／\").replace(/ ft\\./g, \" 呎\")}`"],
			["${entry.crew ? ` (Crew: ${entry.crew}${isMultiple ? \" each\" : \"\"})` : \"\"}", "${entry.crew ? `（船員：${isMultiple ? \"各 \" : \"\"}${entry.crew}）` : \"\"}"],
			["veh.capCrew ? `${veh.capCrew} crew` : null,", "veh.capCrew ? `${veh.capCrew} 名船員` : null,"],
			["veh.capPassenger ? `${veh.capPassenger} passenger${veh.capPassenger === 1 ? \"\" : \"s\"}` : null,\n		].filter(Boolean).join(\", \");", "veh.capPassenger ? `${veh.capPassenger} 名乘客` : null,\n		].filter(Boolean).join(\"、\");"],
			["return typeof veh.capCargo === \"string\" ? veh.capCargo : `${veh.capCargo} ton${veh.capCargo === 1 ? \"\" : \"s\"}`;", "return typeof veh.capCargo === \"string\" ? veh.capCargo : `${veh.capCargo} 噸`;"],
			["ent.hp.dt != null ? `damage threshold ${ent.hp.dt}` : null,", "ent.hp.dt != null ? `傷害閾值 ${ent.hp.dt}` : null,"],
			["ent.hp.mt != null ? `mishap threshold ${ent.hp.mt}` : null,\n			]\n				.filter(Boolean)\n				.join(\", \");", "ent.hp.mt != null ? `事故閾值 ${ent.hp.mt}` : null,\n			]\n				.filter(Boolean)\n				.join(\"、\");"],
			["`${19 + dexMod} (19 while motionless)`", "`${19 + dexMod}（靜止時 19）`"],
			["entrySizeWeight: `{@i ${Parser.sizeAbvToFull(ent.size)} vehicle (${ent.weight.toLocaleStringVe()} lb.)}`,", "entrySizeWeight: `{@i " + "${" + SZ + "(ent.size)}載具（${ent.weight.toLocaleStringVe()} 磅）}`,"],
			["entryCreatureCapacity: `{@b Creature Capacity} ${Renderer.vehicle.getInfwarCreatureCapacity(ent)}`,", "entryCreatureCapacity: `{@b 生物容量} ${Renderer.vehicle.getInfwarCreatureCapacity(ent)}`,"],
			["entryCargoCapacity: `{@b Cargo Capacity} ${Parser.weightToFull(ent.capCargo)}`,", "entryCargoCapacity: `{@b 載貨容量} ${Parser.weightToFull(ent.capCargo)}`,"],
			["entrySpeedNote: `[{@b Travel Pace} ${Math.floor(ent.speed / 10)} miles per hour (${Math.floor(ent.speed * 24 / 10)} miles per day)]`,", "entrySpeedNote: `[{@b 旅行速度} 每小時 ${Math.floor(ent.speed / 10)} 哩（每天 ${Math.floor(ent.speed * 24 / 10)} 哩）]`,"],
			["title: \"Action Stations\",", "title: \"動作崗位\","],
			["entryName: `${isMultiple ? `${entry.count} ` : \"\"}${entry.name}${entry.crew", "entryName: `${isMultiple ? `${entry.count} ` : \"\"}${entry.name_zh ?? entry.name}${entry.crew"],
			["return `${veh.capCreature} Medium creatures`;", "return `${veh.capCreature} 個中型生物`;"],
		],
	},
];
