// ============================================================
// 旅行城市推荐器 —— 匹配逻辑与界面（苹果风 Bento）
// 数据：data.js(window.CITY_DATA)、china.js(window.CHINA_GEO)、
//       geo.js(window.DEPARTURES / window.CITY_COORDS)
// ============================================================

// —— 看重程度 ——
var WEIGHT_LEVELS = [
  { label: "无所谓", value: 0 },
  { label: "纳入考虑", value: 1 },
  { label: "很重要", value: 3 }
];
var AUTHOR_WEIGHT_LEVELS = [
  { label: "不需要", value: 0 },
  { label: "纳入考虑", value: 1 },
  { label: "很重要", value: 3 }
];

// —— 景点类型 tag 分组 ——
var TAG_GROUPS = [
  { key: "mountain", label: "山",   emoji: "⛰️", tags: ["青山", "石头山", "丹霞山", "喀斯特山", "雪山"] },
  { key: "water",    label: "水",   emoji: "🌊", tags: ["江河湖", "盐湖海子", "海", "瀑布"] },
  { key: "wild",     label: "原野", emoji: "🌲", tags: ["草原", "沙漠", "湿地", "森林", "峡谷", "溶洞"] },
  { key: "culture",  label: "人文", emoji: "🏛️", tags: ["佛教", "古城古建", "红色", "园林", "水乡古镇", "文物遗迹", "民俗"] },
  { key: "urban",    label: "都市", emoji: "🌃", tags: ["夜景", "都市潮流", "赌场", "主题乐园"] }
];
var TAG_CATEGORY = {};
TAG_GROUPS.forEach(function (g) {
  g.tags.forEach(function (t) { TAG_CATEGORY[t] = g.key; });
});
var TAG_MODE_OPTIONS = [
  { label: "一定要在上述tag里找", value: "hard" },
  { label: "tag只作为意向参考", value: "soft" }
];

// —— 目的地交通（硬性条件，三档单选） ——
var TRANSIT_OPTIONS = [
  { label: "目的地一定要像有地铁那么便捷", value: 3, hint: "对于[目的地交通]要求最高、最严格" },
  { label: "目的地不一定非得有地铁，只要有公交、旅游大巴能到景区就行", value: 2, hint: "有一定要求" },
  { label: "我能接受连公交、旅游大巴都没有，靠打车/拼车/一日团也行", value: 1, hint: "完全没要求" }
];
var BUS_OPTIONS = [
  { label: "我可以坐大巴", value: true },
  { label: "我不能坐大巴", value: false }
];
var FLY_OPTIONS = [
  { label: "我一定要坐飞机", value: true },
  { label: "我可以不坐飞机", value: false }
];

// —— 旅行天数刻度 ——
var DAY_STOPS = [
  { label: "一天往返", value: 1 },
  { label: "1-2天", value: 2 },
  { label: "1-3天", value: 3 },
  { label: "1-5天", value: 5 },
  { label: "1-7天", value: 7 },
  { label: "不限", value: null }
];

// —— 软性维度 ——
function natureMix(c) {
  var culture = (c.culture === undefined ? 0 : c.culture);
  var nature = (c.nature === undefined ? 0 : c.nature);
  if (culture + nature <= 0) return 2.5;
  return Math.max(0, Math.min(5, 2.5 + (nature - culture) * 0.5));
}

var DIMENSIONS = [
  { key: "scenery", label: "我更倾向[人文景点]还是[自然景点]？", short: "人文/自然", left: "人文景点", right: "自然景点", scale: 5, levels: 5, opinions: ["只看人文", "多人文少自然", "有人文有自然", "多自然少人文", "只看自然"], get: function (c) { return natureMix(c); } },
  { key: "food", label: "我很在乎[美食]？", short: "美食", left: "没啥吃的", right: "遍地珍馐", scale: 5, levels: 5, opinions: ["美食荒漠", "吃的偏少", "美食不突出的城市", "可以找到特色美食", "遍地珍馐"], get: function (c) { return c.food; } },
  { key: "popularity", label: "我喜欢[大众热门都市]还是[小众冷门小城]？", short: "大众/小众", left: "大众热门都市", right: "小众冷门小城", reversed: true, scale: 5, levels: 5, opinions: ["大众热门城市", "著名旅游城市", "有景区的旅游城市", "游客稀少的城市", "只有当地人的小众宝藏城市"], get: function (c) { return c.popularity; } },
  { key: "cost", label: "我去的地方[消费水平]是？", short: "消费", left: "高性价比", right: "奢华沪币", scale: 5, levels: 5, opinions: ["物价像回到千禧年", "物价便宜双爽花", "不低不高", "物价有点小高但正常合理的旅游城市", "奢华沪币"], get: function (c) { return c.cost; } },
  { key: "leisure", label: "我这次想去[悠然自得的地方放松身心]，还是打算去[消耗精力挑战自我]？", short: "轻松/劳累", left: "轻松休闲", right: "劳累辛苦", scale: 5, levels: 5, opinions: ["松弛休闲慢节奏城市", "旅游时花一点点小精力", "旅游正常劳累程度", "去这里需要花费一定精力", "劳累有挑战！"], get: function (c) { return c.leisure === undefined ? 3 : c.leisure; } },
  { key: "stay", label: "我希望去一个景点[能支撑长时间停留]的城市，而不是去多个[短时间、快速逛完]的城市。", short: "停留时间", left: "宜久留景点多", right: "快速打卡景点少", reversed: true, scale: 5, levels: 5, opinions: ["一个城市竟然能待一周？", "可以玩三四天", "刚刚好", "停留一两天的地方", "路过这个地方来打个卡，很快就能逛完"], get: function (c) { return c.stay === undefined ? 3 : c.stay; } },
  { key: "photo", label: "我希望去一个[容易出片]的城市。", short: "出片度", left: "好处片的地方", right: "远离能出片的地方", reversed: true, scale: 5, levels: 5, opinions: ["随手一拍都是大片", "景色很容易出片", "可以拍出旅游照", "只适合记录日常", "完全不用打开相机"], get: function (c) { return c.photo === undefined ? 3 : c.photo; } },
  { key: "fun", label: "我想参考[站长的游玩体验]？", short: "站长体验", left: "站长体验差", right: "站长体验好", scale: 5, levels: 5, section: "author", weightLevels: AUTHOR_WEIGHT_LEVELS, opinions: ["根本没啥玩的", "有玩但也就那样，专程去一趟挺普通", "有特色的旅游城市", "很值得一去的地方", "特别好玩的地方"], get: function (c) { return c.fun; } }
];

// —— 工具 ——
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function hl(text) {
  return String(text).replace(/\[([^\]]+)\]/g, '<span class="hl">$1</span>');
}
function costLabel(v) {
  return ["", "很低", "低", "中等", "高", "很贵"][v] || v;
}
function transitLabel(v) {
  var arr = ["无交通", "仅可打车、一日团或拼车", "有便捷公交大巴", "有地铁"];
  return arr[v] !== undefined ? arr[v] : v;
}
function haversine(lat1, lng1, lat2, lng2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// —— 默认状态 ——
function defaultPrefs() {
  var p = {};
  DIMENSIONS.forEach(function (d) {
    var want;
    if (d.options) want = d.options[Math.floor(d.options.length / 2)].value;
    else want = Math.round(((d.levels || 5) - 1) / 2);
    p[d.key] = { weight: 0, want: want };
  });
  return p;
}
function defaultFilters() {
  return {
    tagMode: "hard",
    tags: [],
    departProvince: "310000",
    departCity: "",
    departCounty: "",
    minDist: 0,
    maxDist: 6000,
    dayIdx: 5,
    canBus: true,
    mustFly: false,
    transitIdx: 2,
    transitMin: 1
  };
}

var prefs = defaultPrefs();
var filters = defaultFilters();

// —— 地理查找 ——
var AREA_BY_CODE = {};
function buildAreaLookup() {
  AREA_BY_CODE = {};
  var deps = window.DEPARTURES || [];
  deps.forEach(function (p) {
    AREA_BY_CODE[p.adcode] = p;
    (p.children || []).forEach(function (c) {
      AREA_BY_CODE[c.adcode] = c;
      (c.children || []).forEach(function (d) { AREA_BY_CODE[d.adcode] = d; });
    });
  });
}
function findProvince(adcode) {
  var deps = window.DEPARTURES || [];
  for (var i = 0; i < deps.length; i++) if (deps[i].adcode === adcode) return deps[i];
  return null;
}
function provinceIsDirect(p) {
  if (!p) return false;
  var kids = p.children || [];
  return kids.length > 0 && !(kids[0].children && kids[0].children.length > 0);
}
function currentDeparture() {
  var prov = findProvince(filters.departProvince);
  var city = null, county = null;
  if (prov && filters.departCity) {
    var kids = prov.children || [];
    for (var j = 0; j < kids.length; j++) if (kids[j].adcode === filters.departCity) { city = kids[j]; break; }
  }
  if (city && filters.departCounty) {
    var ck = city.children || [];
    for (var k = 0; k < ck.length; k++) if (ck[k].adcode === filters.departCounty) { county = ck[k]; break; }
  }
  var node = county || city || prov;
  return node ? { lng: node.lng, lat: node.lat, name: node.name } : null;
}
function cityCoord(city) {
  var coords = window.CITY_COORDS || {};
  return coords[city.name] || null;
}
function cityDistanceKm(city, dep) {
  var coord = cityCoord(city);
  if (!dep || !coord) return null;
  return haversine(dep.lat, dep.lng, coord.lat, coord.lng);
}

// —— 评分 ——
function dimensionMatch(cityVal, want, scale) {
  return Math.max(0, 1 - Math.abs(cityVal - want) / scale);
}
function wantValue(d, want) {
  if (d.options) return want;
  var levels = d.levels || 5;
  var idx = d.reversed ? (levels - 1 - want) : want;
  return idx * (d.scale / (levels - 1));
}
function tagPrefActive() {
  return filters.tagMode === "soft" && filters.tags.length > 0;
}
function cityAllTags(c) {
  return (c.cultureTags || []).concat(c.natureTags || []);
}
function hasAny(arr, sel) {
  for (var i = 0; i < sel.length; i++) {
    if (arr.indexOf(sel[i]) !== -1) return true;
  }
  return false;
}
function cityHasTag(c) {
  return hasAny(cityAllTags(c), filters.tags);
}
// 至少选择这么多个维度，才认为结果可信
var MIN_ACTIVE_DIMS = 3;
function activeDimCount() {
  var n = 0;
  DIMENSIONS.forEach(function (d) { if (prefs[d.key].weight > 0) n++; });
  return n;
}
// 高匹配提示阈值（百分比）
var LOW_MATCH_THRESHOLD = 75;
var PERFECT_MATCH_THRESHOLD = 92;
// 推荐器结果：只展示匹配度 > 60% 的城市，最多 10 个
var MIN_MATCH_SCORE = 60;
var MAX_RESULT_CARDS = 10;
// 分数浮点误差容差：小于该差值视为同分
var SCORE_EPSILON = 1e-6;

function scoreCity(city) {
  var sum = 0, totalW = 0;
  var detail = {};
  for (var i = 0; i < DIMENSIONS.length; i++) {
    var d = DIMENSIONS[i];
    var w = prefs[d.key].weight;
    if (w <= 0) continue;
    var m = dimensionMatch(d.get(city), wantValue(d, prefs[d.key].want), d.scale);
    sum += w * m;
    totalW += w;
    detail[d.key] = m;
  }
  if (tagPrefActive()) {
    var tm = cityHasTag(city) ? 1 : 0;
    sum += tm;
    totalW += 1;
    detail.tags = tm;
  }
  return { score: totalW > 0 ? (sum / totalW) * 100 : null, detail: detail };
}

// —— 硬过滤 ——
function passesHardFilters(city) {
  if (filters.tagMode === "hard" && filters.tags.length > 0) {
    if (!cityHasTag(city)) return false;
  }

  var dep = currentDeparture();
  var dist = cityDistanceKm(city, dep);
  if (dist != null && (dist < filters.minDist || dist > filters.maxDist)) return false;

  var dv = DAY_STOPS[filters.dayIdx].value;
  if (dv != null && city.minDays > dv) return false;

  if (!filters.canBus && city.access === "仅大巴") return false;
  if (filters.mustFly && city.access !== "有机场火车站") return false;
  if (city.transit < filters.transitMin) return false;

  return true;
}

// —— 分段选择控件 ——
function fillButton(btn, opt) {
  if (opt.emoji) {
    btn.classList.add("has-emoji");
    var em = document.createElement("span");
    em.className = "emoji";
    em.textContent = opt.emoji;
    var tx = document.createElement("span");
    tx.className = "seg-text";
    tx.textContent = opt.label;
    btn.appendChild(em);
    btn.appendChild(tx);
  } else {
    btn.textContent = opt.label;
  }
}
function makeSegmented(options, selected, onChange) {
  var seg = document.createElement("div");
  seg.className = "seg";
  options.forEach(function (opt) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "seg-btn";
    fillButton(btn, opt);
    if (opt.value === selected) btn.classList.add("active");
    btn.addEventListener("click", function () {
      var list = seg.querySelectorAll(".seg-btn");
      for (var i = 0; i < list.length; i++) list[i].classList.remove("active");
      btn.classList.add("active");
      onChange(opt.value);
    });
    seg.appendChild(btn);
  });
  return seg;
}

// —— 字段 ——
function makeField(labelHtml, control) {
  var wrap = document.createElement("div");
  wrap.className = "field";
  var lb = document.createElement("div");
  lb.className = "field-label";
  lb.innerHTML = labelHtml;
  wrap.appendChild(lb);
  wrap.appendChild(control);
  return wrap;
}

// —— 单个离散滑块（带刻度） ——
function makeSliderRow(labelHtml, stops, idx, onChange, hint, ticks) {
  var wrap = document.createElement("div");
  wrap.className = "slider";

  var head = document.createElement("div");
  head.className = "slider-head";
  var lb = document.createElement("span");
  lb.className = "slider-label";
  lb.innerHTML = labelHtml;
  var val = document.createElement("span");
  val.className = "slider-val";
  head.appendChild(lb);
  head.appendChild(val);
  wrap.appendChild(head);

  var input = document.createElement("input");
  input.type = "range";
  input.min = "0";
  input.max = String(stops.length - 1);
  input.step = "1";
  input.value = String(idx);
  input.addEventListener("input", function () {
    idx = parseInt(input.value, 10);
    val.textContent = stops[idx].label;
    onChange(idx);
  });
  wrap.appendChild(input);

  if (ticks) {
    var t = document.createElement("div");
    t.className = "slider-ticks";
    ticks.forEach(function (tk) {
      var s = document.createElement("span");
      s.textContent = tk;
      t.appendChild(s);
    });
    wrap.appendChild(t);
  }

  if (hint) {
    var h = document.createElement("div");
    h.className = "slider-hint";
    h.textContent = hint;
    wrap.appendChild(h);
  }

  val.textContent = stops[idx].label;
  return wrap;
}

// —— 双滑块（出行距离 0-6000 公里） ——
function makeDualRange(min, max, step, lo, hi, onChange) {
  var wrap = document.createElement("div");
  wrap.className = "dual-range";

  var track = document.createElement("div");
  track.className = "track";
  var fill = document.createElement("div");
  fill.className = "range-fill";
  wrap.appendChild(track);
  wrap.appendChild(fill);

  var loIn = document.createElement("input");
  loIn.type = "range"; loIn.min = String(min); loIn.max = String(max); loIn.step = String(step); loIn.value = String(lo);
  loIn.style.zIndex = "5";
  var hiIn = document.createElement("input");
  hiIn.type = "range"; hiIn.min = String(min); hiIn.max = String(max); hiIn.step = String(step); hiIn.value = String(hi);
  hiIn.style.zIndex = "4";

  function pct(v) { return ((v - min) / (max - min)) * 100; }
  function sync() {
    var l = Math.min(lo, hi), h = Math.max(lo, hi);
    fill.style.left = pct(l) + "%";
    fill.style.width = (pct(h) - pct(l)) + "%";
  }

  loIn.addEventListener("input", function () {
    lo = parseInt(loIn.value, 10);
    if (lo > hi) { hi = lo; hiIn.value = String(hi); }
    sync();
    onChange(lo, hi);
  });
  hiIn.addEventListener("input", function () {
    hi = parseInt(hiIn.value, 10);
    if (hi < lo) { lo = hi; loIn.value = String(lo); }
    sync();
    onChange(lo, hi);
  });

  wrap.appendChild(loIn);
  wrap.appendChild(hiIn);
  sync();
  return wrap;
}

// —— 景点类型：tag 分组多选 ——
function makeTagGroup(g) {
  var box = document.createElement("div");
  box.className = "tag-group";

  var head = document.createElement("div");
  head.className = "tag-group-head";
  var em = document.createElement("span");
  em.className = "tag-emoji";
  em.textContent = g.emoji;
  var nm = document.createElement("span");
  nm.className = "tag-group-name";
  nm.textContent = g.label;
  head.appendChild(em);
  head.appendChild(nm);
  box.appendChild(head);

  var chips = document.createElement("div");
  chips.className = "chips";
  g.tags.forEach(function (tg) {
    var chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = tg;
    if (filters.tags.indexOf(tg) !== -1) chip.classList.add("active");
    chip.addEventListener("click", function () {
      var idx = filters.tags.indexOf(tg);
      if (idx === -1) { filters.tags.push(tg); chip.classList.add("active"); }
      else { filters.tags.splice(idx, 1); chip.classList.remove("active"); }
      render();
    });
    chips.appendChild(chip);
  });
  box.appendChild(chips);
  return box;
}
function makeTagControl() {
  var wrap = document.createElement("div");
  TAG_GROUPS.forEach(function (g) { wrap.appendChild(makeTagGroup(g)); });

  var modeWrap = document.createElement("div");
  modeWrap.style.marginTop = "16px";

  var modeLabel = document.createElement("div");
  modeLabel.className = "field-label";
  modeLabel.textContent = "tag 筛选方式";
  modeWrap.appendChild(modeLabel);

  var hint = document.createElement("div");
  hint.className = "tag-mode-hint";
  function refreshTagHint() {
    hint.textContent = filters.tagMode === "hard" ? "精确筛选 · 只推荐含所选 tag 的城市" : "模糊筛选 · tag 仅作加分参考";
  }
  modeWrap.appendChild(makeSegmented(TAG_MODE_OPTIONS, filters.tagMode, function (v) {
    filters.tagMode = v;
    refreshTagHint();
    render();
  }));
  refreshTagHint();
  modeWrap.appendChild(hint);

  wrap.appendChild(modeWrap);
  return wrap;
}

// —— 出发地：省 / 市 / 县 ——
function makeDepartureControl() {
  var wrap = document.createElement("div");
  wrap.className = "selects";

  var selA = document.createElement("select");
  var selB = document.createElement("select");
  var selC = document.createElement("select");

  (window.DEPARTURES || []).forEach(function (p) {
    var o = document.createElement("option");
    o.value = p.adcode;
    o.textContent = p.name;
    if (p.adcode === filters.departProvince) o.selected = true;
    selA.appendChild(o);
  });

  function fillB() {
    selB.innerHTML = "";
    var prov = findProvince(filters.departProvince);
    var none = document.createElement("option");
    none.value = "";
    none.textContent = "（" + (prov ? prov.name : "") + "全域）";
    selB.appendChild(none);
    if (!prov) return;
    (prov.children || []).forEach(function (c) {
      var o = document.createElement("option");
      o.value = c.adcode;
      o.textContent = c.name;
      selB.appendChild(o);
    });
    if (filters.departCity) selB.value = filters.departCity;
  }

  function fillC() {
    selC.innerHTML = "";
    var prov = findProvince(filters.departProvince);
    var direct = provinceIsDirect(prov);
    var city = filters.departCity ? AREA_BY_CODE[filters.departCity] : null;
    var none = document.createElement("option");
    none.value = "";
    none.textContent = "（" + (city ? city.name : "全域") + "）";
    selC.appendChild(none);
    if (direct || !city) { selC.style.display = "none"; return; }
    selC.style.display = "";
    (city.children || []).forEach(function (d) {
      var o = document.createElement("option");
      o.value = d.adcode;
      o.textContent = d.name;
      selC.appendChild(o);
    });
    if (filters.departCounty) selC.value = filters.departCounty;
  }

  selA.addEventListener("change", function () {
    filters.departProvince = selA.value;
    filters.departCity = "";
    filters.departCounty = "";
    fillB();
    fillC();
    render();
  });
  selB.addEventListener("change", function () {
    filters.departCity = selB.value;
    filters.departCounty = "";
    fillC();
    render();
  });
  selC.addEventListener("change", function () {
    filters.departCounty = selC.value;
    render();
  });

  fillB();
  fillC();
  wrap.appendChild(selA);
  wrap.appendChild(selB);
  wrap.appendChild(selC);
  return wrap;
}

// —— 出行距离 + 地图 ——
function makeDistanceControl() {
  var wrap = document.createElement("div");

  var valEl = document.createElement("div");
  valEl.className = "hint hint-accent";

  wrap.appendChild(makeDualRange(0, 6000, 10, filters.minDist, filters.maxDist, function (lo, hi) {
    filters.minDist = lo;
    filters.maxDist = hi;
    valEl.textContent = lo + " – " + hi + " 公里";
    render();
  }));

  var labels = document.createElement("div");
  labels.className = "dual-range-labels";
  var l0 = document.createElement("span");
  l0.textContent = "0 公里";
  var l1 = document.createElement("span");
  l1.textContent = "6000 公里";
  labels.appendChild(l0);
  labels.appendChild(l1);
  wrap.appendChild(labels);

  valEl.textContent = filters.minDist + " – " + filters.maxDist + " 公里";
  wrap.appendChild(valEl);

  return wrap;
}

// —— 目的地交通：三档单选 ——
function makeTransitControl() {
  var wrap = document.createElement("div");

  var hint = document.createElement("div");
  hint.className = "hint";

  var selected = filters.transitIdx;
  TRANSIT_OPTIONS.forEach(function (opt, i) {
    var row = document.createElement("button");
    row.type = "button";
    row.className = "opt-row" + (i === selected ? " active" : "");
    var dot = document.createElement("span");
    dot.className = "opt-dot";
    var text = document.createElement("span");
    text.className = "opt-text";
    text.innerHTML = hl(opt.label);
    row.appendChild(dot);
    row.appendChild(text);
    row.addEventListener("click", function () {
      selected = i;
      filters.transitIdx = i;
      filters.transitMin = opt.value;
      var rows = wrap.querySelectorAll(".opt-row");
      for (var k = 0; k < rows.length; k++) rows[k].classList.remove("active");
      row.classList.add("active");
      hint.innerHTML = hl(opt.hint);
      render();
    });
    wrap.appendChild(row);
  });

  hint.innerHTML = hl(TRANSIT_OPTIONS[selected].hint);
  wrap.appendChild(hint);
  return wrap;
}

// —— 维度行 ——
function makeDimRow(d) {
  var wrap = document.createElement("div");
  wrap.className = "dim";
  wrap.setAttribute("data-dim", d.key);

  var label = document.createElement("div");
  label.className = "dim-label";
  label.innerHTML = hl(d.label);
  var badge = document.createElement("span");
  badge.className = "dim-badge";
  badge.textContent = "着重考虑";
  label.appendChild(badge);
  wrap.appendChild(label);

  var control = document.createElement("div");
  control.className = "dim-control";
  var wl = d.weightLevels || WEIGHT_LEVELS;

  function applyWeight() {
    var w = prefs[d.key].weight;
    if (w <= 0) {
      control.style.display = "none";
      control.classList.remove("important");
      badge.style.display = "none";
    } else {
      control.style.display = "";
      if (w === 3) {
        control.classList.add("important");
        wrap.classList.add("dim-focus");
        badge.style.display = "";
      } else {
        control.classList.remove("important");
        wrap.classList.remove("dim-focus");
        badge.style.display = "none";
      }
    }
  }

  wrap.appendChild(makeSegmented(wl, prefs[d.key].weight, function (v) {
    prefs[d.key].weight = v;
    applyWeight();
    render();
  }));

  if (d.options) {
    control.appendChild(makeSegmented(d.options, prefs[d.key].want, function (v) { prefs[d.key].want = v; render(); }));
  } else {
    var body = document.createElement("div");
    body.className = "dim-pref";
    var left = document.createElement("span");
    left.className = "endpoint";
    left.textContent = d.left;
    var slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = String((d.levels || 5) - 1);
    slider.step = "1";
    slider.value = prefs[d.key].want;
    var right = document.createElement("span");
    right.className = "endpoint";
    right.textContent = d.right;
    slider.addEventListener("input", function () { prefs[d.key].want = parseInt(slider.value, 10); render(); });
    body.appendChild(left);
    body.appendChild(slider);
    body.appendChild(right);
    control.appendChild(body);

    // 五个档位对应的说明文字
    var opinions = d.opinions || [];
    var opinion = document.createElement("div");
    opinion.className = "dim-opinion";
    function applyOpinion() {
      var text = opinions[prefs[d.key].want] || "";
      opinion.textContent = text;
      opinion.style.display = text ? "" : "none";
    }
    applyOpinion();
    control.appendChild(opinion);
  }
  wrap.appendChild(control);

  if (d.hint) {
    var hintEl = document.createElement("div");
    hintEl.className = "dim-hint";
    hintEl.textContent = d.hint;
    wrap.appendChild(hintEl);
  }

  applyWeight();
  return wrap;
}

// 同步所有维度的「当前档位说明文字」——滑条拖动后由 render() 调用
function syncOpinions() {
  var rows = document.querySelectorAll("#prefs .dim, #author .dim");
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var key = row.getAttribute("data-dim");
    var d = null;
    for (var j = 0; j < DIMENSIONS.length; j++) if (DIMENSIONS[j].key === key) { d = DIMENSIONS[j]; break; }
    if (!d || !d.opinions) continue;
    var el = row.querySelector(".dim-opinion");
    if (!el) continue;
    var text = d.opinions[prefs[key].want] || "";
    el.textContent = text;
    el.style.display = text ? "" : "none";
  }
}

// —— 组装左侧面板 ——
function buildControls() {
  var types = document.getElementById("types");
  types.innerHTML = "";
  types.appendChild(makeTagControl());

  var trip = document.getElementById("trip");
  trip.innerHTML = "";
  trip.appendChild(makeField(hl("我的[出发地]是？"), makeDepartureControl()));
  trip.appendChild(makeField(hl("我计划的[出行距离]"), makeDistanceControl()));
  trip.appendChild(makeSliderRow(
    hl("我计划的[旅行天数]？"),
    DAY_STOPS,
    filters.dayIdx,
    function (i) { filters.dayIdx = i; render(); },
    null,
    DAY_STOPS.map(function (s) { return s.label; })
  ));
  trip.appendChild(makeField(hl("我能不能去[不通火车]的地方？"), makeSegmented(BUS_OPTIONS, filters.canBus, function (v) { filters.canBus = v; render(); })));
  trip.appendChild(makeField(hl("我能不能去[没有航班]的地方？"), makeSegmented(FLY_OPTIONS, filters.mustFly, function (v) { filters.mustFly = v; render(); })));
  trip.appendChild(makeField(hl("我对于[目的地交通]的接受程度是？"), makeTransitControl()));

  var prefsEl = document.getElementById("prefs");
  var authorEl = document.getElementById("author");
  prefsEl.innerHTML = "";
  authorEl.innerHTML = "";
  for (var i = 0; i < DIMENSIONS.length; i++) {
    var d = DIMENSIONS[i];
    (d.section === "author" ? authorEl : prefsEl).appendChild(makeDimRow(d));
  }
}

// —— 中国地图 ——
var chinaChart = null;
var lastRingKey = null;

function geoOption() {
  return {
    map: "china",
    roam: true,
    scaleLimit: { min: 0.6, max: 20 },
    itemStyle: { areaColor: "#f2f3f5", borderColor: "#d5d7db", borderWidth: 0.6 },
    emphasis: { label: { show: false }, itemStyle: { areaColor: "#e3e9f0" } },
    label: { show: false },
    selectedMode: false
  };
}

function ringCityList() {
  var dep = currentDeparture();
  var data = window.CITY_DATA || [];
  var list = [];
  if (!dep) return list;
  data.forEach(function (c) {
    if (!passesHardFilters(c)) return;   // 被硬性条件排除的城市不在图上显示
    var coord = cityCoord(c);
    if (!coord) return;
    var d = haversine(dep.lat, dep.lng, coord.lat, coord.lng);
    if (d >= filters.minDist && d <= filters.maxDist) {
      list.push({ name: c.name, lng: coord.lng, lat: coord.lat, dist: d });
    }
  });
  return list;
}

function refreshMap(scored) {
  if (!chinaChart) return;
  var dep = currentDeparture();
  // 维度不足时 scored 为 null/空 -> 地图上不显示任何城市蓝点
  var showCities = !!(scored && scored.length);

  // 地图只显示「当前结果列表」里的城市
  var ring = [];
  if (showCities) {
    scored.forEach(function (item) {
      var c = item.city;
      var coord = cityCoord(c);
      if (!coord) return;
      var d = dep ? haversine(dep.lat, dep.lng, coord.lat, coord.lng) : null;
      ring.push({ name: c.name, lng: coord.lng, lat: coord.lat, dist: d });
    });
  }
  var ringNames = {};
  ring.forEach(function (r) { ringNames[r.name] = true; });

  var top3Names = {};
  if (scored && scored.length) {
    // 只在真正展示的结果里取 Top3；scored 为空则只有普通小蓝点
    var count = 0;
    for (var i = 0; i < scored.length && count < 3; i++) {
      var n = scored[i].city.name;
      if (ringNames[n]) { top3Names[n] = true; count++; }
    }
  }

  var dotData = ring.map(function (r) {
    var isTop = !!top3Names[r.name];
    return {
      name: r.name,
      value: [r.lng, r.lat],
      symbolSize: isTop ? 11 : 7,
      label: isTop ? { show: true, position: "top", formatter: "{b}", color: "#1d1d1f", fontWeight: 700, fontSize: 10 } : { show: false }
    };
  });

  var series = [{
    name: "城市",
    type: "scatter",
    coordinateSystem: "geo",
    symbolSize: 7,
    itemStyle: { color: "#0071e3", borderColor: "#fff", borderWidth: 1 },
    label: { show: false },
    data: dotData
  }];

  if (dep) {
    series.push({
      name: "出发地",
      type: "scatter",
      coordinateSystem: "geo",
      symbol: "pin",
      symbolSize: 26,
      itemStyle: { color: "#ff3b30" },
      label: { show: true, position: "bottom", formatter: "{b}", color: "#ff3b30", fontWeight: 700, fontSize: 10 },
      data: [{ name: dep.name, value: [dep.lng, dep.lat] }]
    });
  }

  chinaChart.setOption({ series: series }, { replaceMerge: ["series"] });
  refreshRing();
}

function refreshRing() {
  if (!chinaChart) return;
  try {
    var dep = currentDeparture();
    var key = null;
    if (dep) {
      var c = chinaChart.convertToPixel({ geoIndex: 0 }, [dep.lng, dep.lat]);
      var n = chinaChart.convertToPixel({ geoIndex: 0 }, [dep.lng, dep.lat + 1]);
      if (c && n) {
        var pxPerKm = Math.abs(n[1] - c[1]) / 111;
        var r0 = Math.max(0, filters.minDist * pxPerKm);
        var r = Math.max(1, filters.maxDist * pxPerKm);
        key = [Math.round(c[0]), Math.round(c[1]), Math.round(r0), Math.round(r)].join(",");
        if (key !== lastRingKey) {
          lastRingKey = key;
          chinaChart.setOption({
            graphic: [{
              type: "ring",
              shape: { cx: c[0], cy: c[1], r: r, r0: r0 },
              style: { fill: "rgba(0,113,227,0.10)", stroke: "rgba(0,113,227,0.55)", lineWidth: 1.5 },
              z: 5,
              silent: true
            }]
          });
        }
      }
    }
    if (!key) {
      if (lastRingKey !== null) {
        lastRingKey = null;
        chinaChart.setOption({ graphic: [] });
      }
    }
  } catch (e) { /* 地图尚未就绪时忽略 */ }
}

function initChinaMap() {
  var el = document.getElementById("china-map");
  if (!el || !window.echarts || !window.CHINA_GEO) return;
  if (chinaChart) { chinaChart.dispose(); chinaChart = null; }
  lastRingKey = null;
  echarts.registerMap("china", window.CHINA_GEO);
  chinaChart = echarts.init(el);
  var geo = geoOption();
  geo.center = [104.0, 36.0];
  geo.zoom = 1.4;
  chinaChart.setOption({
    tooltip: { trigger: "item", formatter: "{b}" },
    geo: geo,
    series: []
  });
  chinaChart.on("georoam", function () { refreshRing(); });
  chinaChart.on("finished", function () { refreshRing(); });
  chinaChart.on("click", function (params) {
    if (!params || params.componentType !== "series" || params.seriesName !== "城市") return;
    var name = params.name;
    if (!name) return;
    var cards = document.querySelectorAll("#results .card");
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].getAttribute("data-city") === name) {
        cards[i].scrollIntoView({ behavior: "smooth", block: "center" });
        cards[i].classList.add("flash");
        setTimeout(function (node) { return function () { node.classList.remove("flash"); }; }(cards[i]), 1600);
        break;
      }
    }
  });
}

// —— 结果渲染 ——
function fitChip(label, m) {
  var cls = m >= 0.66 ? "good" : (m >= 0.4 ? "mid" : "bad");
  var mark = m >= 0.66 ? "✓" : (m >= 0.4 ? "△" : "✗");
  return '<span class="fit ' + cls + '">' + esc(label) + ' ' + mark + '</span>';
}

function makeCard(item, i, hasPref, dep, perfect) {
  var c = item.city;
  var el = document.createElement("div");
  el.className = "card";
  el.setAttribute("data-city", c.name);

  var days = c.minDays === c.maxDays ? c.minDays + "天" : c.minDays + "-" + c.maxDays + "天";

  var scoreHtml = "";
  if (hasPref && item.score != null) {
    scoreHtml = '<div class="score">' + Math.round(item.score) + '<span class="pct">%</span></div>';
  }

  var fitHtml = "";
  if (hasPref) {
    var parts = [];
    DIMENSIONS.forEach(function (d) {
      if (prefs[d.key].weight > 0) parts.push(fitChip(d.short || d.label, item.detail[d.key]));
    });
    if (tagPrefActive()) parts.push(fitChip("景点类型", item.detail.tags));
    fitHtml = '<div class="fits">' + parts.join("") + '</div>';
  }

  var metaParts = ["建议 " + days];
  if (dep) {
    var coord = cityCoord(c);
    if (coord) metaParts.push("距" + dep.name + " " + Math.round(haversine(dep.lat, dep.lng, coord.lat, coord.lng)) + " 公里");
  }
  metaParts.push("消费 " + costLabel(c.cost));
  metaParts.push("公交 " + transitLabel(c.transit));

  var tagHtml = cityAllTags(c).map(function (t) {
    var cat = TAG_CATEGORY[t] || "";
    return '<span class="tag cat-' + cat + '">' + esc(t) + '</span>';
  }).join("");

  el.innerHTML =
    '<div class="card-top">' +
      '<div class="rank">' + (i + 1) + '</div>' +
      '<div class="name-wrap">' +
        '<div class="name">' + esc(c.name) + '</div>' +
        '<div class="province">' + esc(c.province || "") + '</div>' +
      '</div>' +
      scoreHtml +
    '</div>' +
    '<div class="meta">' + metaParts.join(" · ") + '</div>' +
    fitHtml +
    (tagHtml ? '<div class="tags">' + tagHtml + '</div>' : "") +
    (c.notes ? '<div class="notes">' + esc(c.notes) + '</div>' : "") +
    (perfect ? '<div class="card-perfect">简直是你的天选城市！</div>' : "");
  return el;
}

function render() {
  var summary = document.getElementById("summary");
  var results = document.getElementById("results");
  var notice = document.getElementById("notice");
  var data = window.CITY_DATA || [];
  var dep = currentDeparture();

  // 左侧面板不重建，但档位说明文字需要跟着滑条更新
  syncOpinions();

  // 只统计维度；soft 模式下的 tag 不算作一个维度
  var activeCount = activeDimCount();
  var enoughDims = activeCount >= MIN_ACTIVE_DIMS;

  var included = data.filter(function (c) { return passesHardFilters(c); });
  var excludedCount = data.length - included.length;

  notice.textContent = "";
  notice.className = "notice";
  notice.style.display = "none";

  // 维度不够时不出结果、不画蓝点
  if (!enoughDims) {
    summary.textContent = "共匹配 " + included.length + " 座城市" +
      (excludedCount ? " · 已排除 " + excludedCount + " 座" : "");
    results.innerHTML = '<div class="empty">筛选的维度较少，不能给出准确的结果，再增加几个维度吧 :)</div>';
    updateShareBar([]);
    refreshMap([]);
    return;
  }

  var scored = included.map(function (c) {
    var s = scoreCity(c);
    return { city: c, score: s.score, detail: s.detail };
  }).sort(function (a, b) {
    var sa = a.score == null ? -1 : a.score;
    var sb = b.score == null ? -1 : b.score;
    // 浮点误差内的分数视为同分，再按出行距离升序
    if (Math.abs(sa - sb) > SCORE_EPSILON) return sb - sa;
    return distanceRank(a.city, dep) - distanceRank(b.city, dep);
  });

  // 只保留匹配度 > 60% 的城市，且最多展示 10 个
  var qualified = scored.filter(function (x) { return x.score != null && x.score > MIN_MATCH_SCORE; });
  var shown = qualified.slice(0, MAX_RESULT_CARDS);
  var truncated = qualified.length > shown.length;

  summary.textContent = "共匹配 " + shown.length + " 座城市" +
    (truncated ? "（仅显示匹配度最高的 " + shown.length + " 座）" : "") +
    (excludedCount ? " · 已排除 " + excludedCount + " 座" : "");

  results.innerHTML = "";
  if (shown.length === 0) {
    results.innerHTML = '<div class="empty">没有匹配度超过 ' + MIN_MATCH_SCORE +
      '% 的城市。<br>试试放宽硬性条件，或者把不太在意的维度设为「无所谓」。</div>';
    notice.style.display = "none";
  } else {
    // 先算最高分，决定第 1 张卡片是否带「天选城市」条
    var best = shown[0].score;
    var perfectTop = best != null && best > PERFECT_MATCH_THRESHOLD;

    shown.forEach(function (item, i) {
      results.appendChild(makeCard(item, i, true, dep, perfectTop && i === 0));
    });

    // 「天选城市」已移入卡片底部；这里只处理「高匹配偏少」的整体提示
    if (!perfectTop && best != null && best <= LOW_MATCH_THRESHOLD) {
      notice.textContent = "筛选后高匹配度城市较少，有些不在意的维度可以选择无所谓哦 :)";
      notice.className = "notice notice-sparse";
      notice.style.display = "";
    } else {
      notice.textContent = "";
      notice.className = "notice";
      notice.style.display = "none";
    }
  }

  refreshMap(shown);
  updateShareBar(shown);
}

// —— 分享按钮：有结果时才显示 ——
var lastShownCities = [];
function updateShareBar(shown) {
  lastShownCities = shown || [];
  var bar = document.getElementById("share-bar");
  if (!bar) return;
  bar.style.display = lastShownCities.length ? "" : "none";
}

// —— 同分时按出行距离排序：无法定位的城市排最后 ——
function distanceRank(city, dep) {
  var d = cityDistanceKm(city, dep);
  return d == null ? Infinity : d;
}

// —— 初始化 ——
document.getElementById("reset").addEventListener("click", function () {
  prefs = defaultPrefs();
  filters = defaultFilters();
  buildControls();
  initChinaMap();
  render();
});

window.addEventListener("resize", function () {
  if (!chinaChart) return;
  chinaChart.resize();
  refreshRing();
});

buildAreaLookup();
buildControls();
initChinaMap();
render();

// —— 生成结果分享图 ——
(function () {
  var btn = document.getElementById("rec-share");
  if (!btn) return;
  btn.addEventListener("click", function () {
    if (!lastShownCities.length) return;
    if (!window.buildRecommenderImage) return;
    var payload = {
      count: lastShownCities.length,
      cities: lastShownCities.map(function (x) {
        return { name: x.city.name, province: x.city.province || "", score: x.score };
      }),
      dims: (function () {
        var topItem = lastShownCities[0];
        var out = [];
        if (!topItem || !topItem.city) return out;
        // 用第一名的 7 个维度实际取值画雷达，保证维度完整
        DIMENSIONS.forEach(function (d) {
          if (d.options || d.key === "fun") return;
          var raw = d.get(topItem.city);
          if (typeof raw !== "number" || !isFinite(raw)) return;
          var v = Math.max(1, Math.min(5, Math.round(raw)));
          out.push({
            name: (window.scaleNameOf ? window.scaleNameOf(d.key, d.short) : d.short),
            value: v,
            ratio: v / 5
          });
        });
        return out;
      })()
    };
    btn.disabled = true;
    btn.textContent = "生成中…";
    window.buildRecommenderImage(payload, function (url) {
      btn.disabled = false;
      btn.textContent = "生成分享图";
      if (url && window.showShareImage) window.showShareImage(url, "旅问-城市推荐.png");
    });
  });
})();

document.getElementById("results").addEventListener("click", function (e) {
  var node = e.target;
  while (node && node.classList) {
    if (node.classList.contains("card")) {
      var name = node.getAttribute("data-city");
      if (name) {
        if (window.showCityPopover) window.showCityPopover(name);
      }
      return;
    }
    node = node.parentNode;
  }
});
