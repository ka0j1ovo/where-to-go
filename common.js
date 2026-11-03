// ============================================================
// 公共模块：收藏(心愿单)、城市查找、tag 分类、小工具
// 被 index / compare / test / recommender 等页面复用
// ============================================================
(function () {
  "use strict";

  // ---------- 收藏（localStorage） ----------
  var FAV_KEY = "wtg_favorites";
  var FAV = {
    list: function () {
      try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); }
      catch (e) { return []; }
    },
    has: function (name) { return FAV.list().indexOf(name) !== -1; },
    toggle: function (name) {
      var a = FAV.list();
      var i = a.indexOf(name);
      if (i === -1) { a.push(name); localStorage.setItem(FAV_KEY, JSON.stringify(a)); return true; }
      a.splice(i, 1); localStorage.setItem(FAV_KEY, JSON.stringify(a)); return false;
    },
    add: function (name) { if (!FAV.has(name)) { var a = FAV.list(); a.push(name); localStorage.setItem(FAV_KEY, JSON.stringify(a)); } },
    remove: function (name) {
      var a = FAV.list().filter(function (x) { return x !== name; });
      localStorage.setItem(FAV_KEY, JSON.stringify(a));
    },
    onchange: function (fn) {
      window.addEventListener("storage", function (e) { if (e.key === FAV_KEY) fn(); });
      // 同页触发：包装 toggle 不自动通知，由调用方在操作后主动 render
    }
  };
  window.FAV = FAV;

  // ---------- 城市查找 ----------
  window.cityByName = function (name) {
    var data = window.CITY_DATA || [];
    for (var i = 0; i < data.length; i++) if (data[i].name === name) return data[i];
    return null;
  };
  window.cityAllTags = function (c) {
    return (c.cultureTags || []).concat(c.natureTags || []);
  };

  // ---------- tag 分类（与 app.js TAG_GROUPS 一致） ----------
  var TAG_CATEGORY = {};
  var TAG_COLOR = {};
  (function () {
    var groups = [
      { key: "mountain", color: "#5a7a3a", tags: ["青山", "石头山", "丹霞山", "喀斯特山", "雪山"] },
      { key: "water",    color: "#1f6fb2", tags: ["江河湖", "盐湖海子", "海", "瀑布"] },
      { key: "wild",     color: "#2f8f4f", tags: ["草原", "沙漠", "湿地", "森林", "峡谷", "溶洞"] },
      { key: "culture",  color: "#a8682a", tags: ["佛教", "古城古建", "红色", "园林", "水乡古镇", "文物遗迹", "民俗"] },
      { key: "urban",    color: "#6d52b5", tags: ["夜景", "都市潮流", "赌场", "主题乐园"] }
    ];
    groups.forEach(function (g) {
      g.tags.forEach(function (t) { TAG_CATEGORY[t] = g.key; TAG_COLOR[t] = g.color; });
    });
  })();
  window.TAG_CATEGORY = TAG_CATEGORY;

  // 城市的主色：取第一个可分类的 tag 颜色，无则中性灰
  window.cityColor = function (c) {
    var tags = window.cityAllTags(c);
    for (var i = 0; i < tags.length; i++) {
      if (TAG_COLOR[tags[i]]) return TAG_COLOR[tags[i]];
    }
    return "#8e8e93";
  };

  // ---------- 小工具 ----------
  window.escHtml = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  // ---------- 打分显示用的「单调程度名」 ----------
  // 数字 1→5 越大表示该属性越强，方向自明，无需额外文字说明
  var SCALE_NAME = {
    scenery: "自然程度",     // 1=偏人文  5=偏自然
    food: "美食",           // 1=荒漠    5=珍馐
    popularity: "热门程度",   // 1=小众    5=热门
    cost: "物价水平",         // 1=便宜    5=贵
    leisure: "劳累程度",      // 1=轻松    5=累
    stay: "可玩时长",         // 1=短      5=能待很久
    photo: "出片度"          // 1=难拍    5=好拍
  };
  window.SCALE_NAME = SCALE_NAME;
  window.scaleNameOf = function (key, fallback) {
    return SCALE_NAME[key] || fallback || key;
  };

  // 打分视图：数字 + 5 格刻度条（纯图形，无文字，方向由维度名决定）
  window.scoreHtml = function (n) {
    var v = Math.max(1, Math.min(5, Math.round(n)));
    var bars = "";
    for (var i = 1; i <= 5; i++) bars += "<i" + (i <= v ? ' class="on"' : "") + "></i>";
    return '<span class="score-view"><b class="score-num">' + v + "</b>" +
           '<span class="score-bar">' + bars + "</span></span>";
  };

  // ---------- 7 个维度的唯一数据源 ----------
  // get(c) 返回该维度的「正向值」1-5（scenery 为 0-5 连续）；
  // reversed 表示滑条左端对应数值高端（仅测试偏好换算时需要）
  function natureMix(c) {
    var cu = c.culture === undefined ? 0 : c.culture;
    var na = c.nature === undefined ? 0 : c.nature;
    if (cu + na <= 0) return 2.5;
    return Math.max(0, Math.min(5, 2.5 + (na - cu) * 0.5));
  }
  window.natureMix = natureMix;
  window.CITY_DIMS = [
    { key: "scenery",    short: "人文/自然", reversed: false, get: function (c) { return natureMix(c); } },
    { key: "food",       short: "美食",      reversed: false, get: function (c) { return c.food; } },
    { key: "popularity", short: "大众/小众", reversed: true,  get: function (c) { return c.popularity; } },
    { key: "cost",       short: "消费",      reversed: false, get: function (c) { return c.cost; } },
    { key: "leisure",    short: "轻松/劳累", reversed: false, get: function (c) { return c.leisure === undefined ? 3 : c.leisure; } },
    { key: "stay",       short: "停留时间",  reversed: true,  get: function (c) { return c.stay === undefined ? 3 : c.stay; } },
    { key: "photo",      short: "出片度",    reversed: true,  get: function (c) { return c.photo === undefined ? 3 : c.photo; } }
  ];
  window.dimScoreValue = function (q) { return Math.max(1, Math.min(5, Math.round(q))); };
  // 城市某维度的打分 HTML
  window.cityDimScoreHtml = function (d, c) {
    return window.scoreHtml(window.dimScoreValue(d.get(c)));
  };

  window.costLabel = function (v) { return ["", "很低", "低", "中等", "高", "很贵"][v] || v; };
  window.transitLabel = function (v) {
    return ["无交通", "仅可打车、一日团或拼车", "有便捷公交大巴", "有地铁"][v] || v;
  };

  // 心愿单按钮（返回一个可点击的 ♥ 按钮，调用后自动刷新）
  window.favButton = function (name, afterToggle) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "fav-btn";
    function sync() {
      var on = FAV.has(name);
      btn.classList.toggle("on", on);
      btn.textContent = on ? "♥ 已收藏" : "♡ 收藏";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      FAV.toggle(name);
      sync();
      if (afterToggle) afterToggle();
      // 通知同页的心愿单刷新
      try { window.dispatchEvent(new CustomEvent("wtg-fav-change")); } catch (err) {}
    });
    sync();
    return btn;
  };

  // 城市卡片右上角的百度搜索按钮（图标 + 文字）
  window.cityBaiduButtonHtml = function (c) {
    var url = "https://www.baidu.com/s?wd=" + encodeURIComponent(c.name + " 景点");
    return '<a class="popover-baidu" href="' + url + '" target="_blank" rel="noopener">🔎 百度搜索</a>';
  };

  // 城市卡片主体（弹层与对比页共用）
  window.cityCardBodyHtml = function (c) {
    var dimsHtml = (window.CITY_DIMS || []).map(function (d) {
      return '<div class="popover-dim">' +
        '<span class="popover-dim-name">' + window.escHtml(window.scaleNameOf(d.key, d.short)) + '</span>' +
        window.cityDimScoreHtml(d, c) +
      '</div>';
    }).join("");
    var funStars = c.fun != null ? "★".repeat(Math.max(1, c.fun)) : "—";

    return '<div class="popover-head">' +
        '<div class="popover-city">' + window.escHtml(c.name) + '</div>' +
        '<div class="popover-prov">' + window.escHtml(c.province || "") + '</div>' +
      '</div>' +
      '<div class="popover-meta">' +
        '<span>建议 ' + (c.minDays === c.maxDays ? c.minDays + " 天" : c.minDays + "-" + c.maxDays + " 天") + '</span>' +
        '<span>消费 ' + window.costLabel(c.cost) + '</span>' +
        '<span>公交 ' + window.transitLabel(c.transit) + '</span>' +
        '<span>站长体验 ' + funStars + '</span>' +
      '</div>' +
      '<div class="popover-dims">' + dimsHtml + '</div>' +
      '<div class="popover-notes">' + window.escHtml(c.notes || "暂无备注。") + '</div>' +
      '<div class="popover-tags">' + window.cityAllTags(c).map(function (t) {
        return '<span class="tag cat-' + (TAG_CATEGORY[t] || "none") + '">' + window.escHtml(t) + '</span>';
      }).join("") + '</div>';
  };

  // 城市卡片（弹层）：点击文字云 / 搜索结果 / 随机旅行 / 推荐器卡片打开
  window.showCityPopover = function (name) {
    var c = window.cityByName(name);
    if (!c) return;
    var old = document.getElementById("city-popover");
    if (old) old.remove();

    var overlay = document.createElement("div");
    overlay.id = "city-popover";
    overlay.className = "popover-overlay";
    overlay.innerHTML =
      '<div class="popover">' +
        '<button class="popover-close" type="button" aria-label="关闭">×</button>' +
        window.cityBaiduButtonHtml(c) +
        window.cityCardBodyHtml(c) +
        '<div class="popover-actions"></div>' +
      '</div>';
    document.body.appendChild(overlay);

    var actions = overlay.querySelector(".popover-actions");
    actions.appendChild(window.favButton(name));
    var toCmp = document.createElement("a");
    toCmp.className = "popover-link";
    toCmp.href = "compare.html?c=" + encodeURIComponent(name);
    toCmp.textContent = "加入对比 →";
    actions.appendChild(toCmp);

    overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector(".popover-close").addEventListener("click", function () { overlay.remove(); });
  };
})();
