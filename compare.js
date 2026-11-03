// ============================================================
// 城市对比：搜索选城 + 雷达叠加 + 维度对照 + 底部城市卡片
// ============================================================
(function () {
  "use strict";

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function dimVal(q) { return clamp(Math.round(q), 1, 5); }
  function scoreView(q) {
    var v = dimVal(q);
    return window.scoreHtml ? window.scoreHtml(v) : String(v);
  }

  var DIMS = window.CITY_DIMS || [];
  var $ = function (id) { return document.getElementById(id); };

  var data = window.CITY_DATA || [];
  var names = data.map(function (c) { return c.name; }).sort(function (a, b) { return a.localeCompare(b, "zh"); });

  var state = { a: null, b: null };

  // ---------- 搜索选择 ----------
  function searchCities(q) {
    q = (q || "").trim().toLowerCase();
    if (!q) return [];
    return data.filter(function (c) {
      if (c.name.toLowerCase().indexOf(q) !== -1) return true;
      if ((c.province || "").toLowerCase().indexOf(q) !== -1) return true;
      return window.cityAllTags(c).some(function (t) { return t.toLowerCase().indexOf(q) !== -1; });
    }).slice(0, 8);
  }

  function initSearch(slot) {
    var input = $(slot === "a" ? "cmp-a-input" : "cmp-b-input");
    var box = $(slot === "a" ? "cmp-a-results" : "cmp-b-results");
    if (!input || !box) return;

    function close() { box.classList.remove("open"); box.innerHTML = ""; }

    function open() {
      var hits = searchCities(input.value);
      box.innerHTML = "";
      if (!hits.length) {
        box.innerHTML = '<div class="search-empty">' + (input.value.trim() ? "没有找到匹配的城市" : "输入城市名 / 省份 / 标签") + '</div>';
      } else {
        hits.forEach(function (c) {
          var row = document.createElement("button");
          row.type = "button";
          row.className = "search-row";
          row.innerHTML =
            '<span class="search-row-name">' + window.escHtml(c.name) + '</span>' +
            '<span class="search-row-prov">' + window.escHtml(c.province || "") + '</span>' +
            '<span class="search-row-tags">' + window.cityAllTags(c).slice(0, 3).map(window.escHtml).join(" · ") + '</span>';
          row.addEventListener("click", function () {
            setCity(slot, c.name);
            input.value = "";
            close();
          });
          box.appendChild(row);
        });
      }
      box.classList.add("open");
    }

    input.addEventListener("input", open);
    input.addEventListener("focus", open);
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".compare-search-box")) close();
    });
  }

  function setCity(slot, name) {
    state[slot] = name;
    render();
  }

  // ---------- 渲染 ----------
  function render() {
    renderChosen();
    renderRadar();
    renderTable();
    renderCards();
  }

  function renderChosen() {
    ["a", "b"].forEach(function (slot) {
      var el = $(slot === "a" ? "cmp-a-chosen" : "cmp-b-chosen");
      if (!el) return;
      el.innerHTML = "";
      var name = state[slot];
      if (!name) {
        el.innerHTML = '<span class="compare-chosen-empty">尚未选择城市</span>';
        return;
      }
      var c = window.cityByName(name);
      var wrap = document.createElement("div");
      wrap.className = "compare-chosen-inner " + slot;
      var label = document.createElement("span");
      label.className = "compare-chosen-name";
      label.textContent = name;
      if (c && c.province) {
        var pv = document.createElement("span");
        pv.className = "compare-chosen-prov";
        pv.textContent = c.province;
        wrap.appendChild(pv);
      }
      wrap.insertBefore(label, wrap.firstChild);

      // 收藏
      if (window.favButton) wrap.appendChild(window.favButton(name, function () { renderChosen(); }));

      var clear = document.createElement("button");
      clear.type = "button";
      clear.className = "compare-chosen-clear";
      clear.textContent = "×";
      clear.title = "清除";
      clear.addEventListener("click", function () {
        state[slot] = null;
        render();
        var input = $(slot === "a" ? "cmp-a-input" : "cmp-b-input");
        if (input) input.value = "";
      });
      wrap.appendChild(clear);
      el.appendChild(wrap);
    });
  }

  function renderRadar() {
    var el = $("compare-radar");
    if (!el) return;
    if (!window.echarts) { el.textContent = "图形组件未加载，已跳过雷达图。"; return; }
    var ca = window.cityByName(state.a), cb = window.cityByName(state.b);
    if (!ca || !cb) {
      el.innerHTML = '<div class="compare-placeholder">选择两座城市后，这里会出现雷达图对比</div>';
      return;
    }
    el.innerHTML = "";
    var chart = window.echarts.getInstanceByDom(el) || window.echarts.init(el);
    chart.resize();
    chart.setOption({
      tooltip: { trigger: "item" },
      legend: { bottom: 0, data: [ca.name, cb.name] },
      radar: {
        indicator: DIMS.map(function (d) { return { name: window.scaleNameOf(d.key, d.short), max: 100 }; }),
        radius: "62%",
        axisName: { color: "#6e6e73", fontSize: 12 }
      },
      series: [{
        type: "radar",
        data: [
          { value: DIMS.map(function (d) { return d.get(ca) / 5 * 100; }), name: ca.name, itemStyle: { color: "#0071e3" }, areaStyle: { color: "rgba(0,113,227,.12)" } },
          { value: DIMS.map(function (d) { return d.get(cb) / 5 * 100; }), name: cb.name, itemStyle: { color: "#ff9500" }, areaStyle: { color: "rgba(255,149,0,.12)" } }
        ]
      }]
    }, { notMerge: true });
  }

  function renderTable() {
    var ca = window.cityByName(state.a), cb = window.cityByName(state.b);
    var el = $("compare-table");
    if (!el) return;
    el.innerHTML = "";
    if (!ca || !cb) {
      el.innerHTML = '<div class="compare-placeholder">选择两座城市后，这里会逐维度对比</div>';
      return;
    }

    var head = document.createElement("div");
    head.className = "cmp-table-head";
    head.innerHTML =
      '<span class="cmp-dim-col">维度（1–5）</span>' +
      '<span class="cmp-city-col a">' + window.escHtml(ca.name) + '</span>' +
      '<span class="cmp-city-col b">' + window.escHtml(cb.name) + '</span>';
    el.appendChild(head);

    DIMS.forEach(function (d) {
      var row = document.createElement("div");
      row.className = "cmp-row";
      row.innerHTML =
        '<span class="cmp-dim-col">' + window.escHtml(window.scaleNameOf(d.key, d.short)) + '</span>' +
        '<span class="cmp-city-col a">' + scoreView(d.get(ca)) + '</span>' +
        '<span class="cmp-city-col b">' + scoreView(d.get(cb)) + '</span>';
      el.appendChild(row);
    });
  }

  // 底部：两座城市的完整卡片
  function renderCards() {
    var el = $("compare-cards");
    if (!el) return;
    el.innerHTML = "";
    var list = [state.a, state.b].filter(Boolean);
    if (!list.length) return;

    el.appendChild(sectionTitle("城市卡片"));
    var grid = document.createElement("div");
    grid.className = "compare-cards-grid";
    list.forEach(function (name) {
      var c = window.cityByName(name);
      if (!c) return;
      var card = document.createElement("div");
      card.className = "compare-city-card";
      card.innerHTML = window.cityBaiduButtonHtml(c) + window.cityCardBodyHtml(c);
      grid.appendChild(card);
    });
    el.appendChild(grid);
  }

  function sectionTitle(text) {
    var t = document.createElement("div");
    t.className = "result-section-title";
    t.textContent = text;
    return t;
  }

  // ---------- 初始化 ----------
  function init() {
    var qs = new URLSearchParams(location.search);
    var pre = qs.get("c");

    if (pre && names.indexOf(pre) !== -1) state.a = pre;
    else state.a = names[0] || null;

    var other = names.filter(function (n) { return n !== state.a; });
    state.b = other[0] || null;

    initSearch("a");
    initSearch("b");
    render();
  }

  init();
})();
