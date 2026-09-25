// 物品共用句
export const ART = (n, kind, one) => `${n} {@table Artifact Properties; ${kind} Properties|dmg|${({"Minor Beneficial": "次要有益屬性", "Major Beneficial": "主要有益屬性", "Minor Detrimental": "次要有害屬性", "Major Detrimental": "主要有害屬性"})[kind]}}`;
export const POI = (dc, rest) => `受此毒藥影響的生物必須${rest.replace("DC", `{@dc ${dc}}`)}`;
export const HARV = c => `此毒藥必須從死亡或{@condition incapacitated}的{@creature ${c}}身上採集。`;
