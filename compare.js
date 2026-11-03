// ============================================================
// 城市对比：两座城市并排比 7 个维度 + 雷达图叠加
// ============================================================
(function () {
  "use strict";

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function dimVal(q) { return clamp(Math.round(q), 1, 5); }
  function scoreView(q) {
    var v = dimVal(q);
    return window.scoreHtml ? window.scoreHtml(v) : String(v);
  }

  // 7 个维度复用 common.js 的单一数据源
  var DIMS = window.CITY_DIMS || [];

  var $ = function (id) { return document.getElementById(id); };
  var data = window.CITY_DATA || [];
  var names = data.map(function (c) { return c.name; }).sort(function (a, b) { return a.localeCompare(b, "zh"); });

  function fillSelect(sel) {
    names.forEach(function (n) {
      var o = document.createElement("option");
      o.value = n;
      o.textContent = n;
      sel.appendChild(o);
    });
  }

  function init() {
    var a = $("cmp-a"), b = $("cmp-b");
    fillSelect(a); fillSelect(b);

    // URL 参数 ?c=name 预填城市 A
    var qs = new URLSearchParams(location.search);
    var pre = qs.get("c");
    if (pre && names.indexOf(pre) !== -1) a.value = pre;
    if (names.indexOf(b.value) === -1 || a.value === b.value) {
      // 默认 A、B 取前两座不同城市
      b.value = names.find(function (n) { return n !== a.value; }) || names[1] || names[0];
    }

    a.addEventListener("change", render);
    b.addEventListener("change", render);
    renderFav();
    render();
  }

  function renderFav() {
    var a = $("cmp-a"), b = $("cmp-b");
    var fa = $("fav-a"), fb = $("fav-b");
    fa.innerHTML = ""; fb.innerHTML = "";
    fa.appendChild(window.favButton(a.value, function () { renderFav(); }));
    fb.appendChild(window.favButton(b.value, function () { renderFav(); }));
  }

  function render() {
    var a = $("cmp-a"), b = $("cmp-b");
    renderFav();
    renderRadar(a.value, b.value);
    renderTable(a.value, b.value);
  }

  function renderRadar(nameA, nameB) {
    var el = $("compare-radar");
    if (!window.echarts) { el.textContent = "图形组件未加载，已跳过雷达图。"; return; }
    var ca = window.cityByName(nameA), cb = window.cityByName(nameB);
    if (!ca || !cb) return;

    var chart = window.echarts.getInstanceByDom(el) || window.echarts.init(el);
    chart.setOption({
      tooltip: { trigger: "item" },
      legend: { bottom: 0, data: [nameA, nameB] },
      radar: {
        indicator: DIMS.map(function (d) { return { name: d.short, max: 100 }; }),
        radius: "62%",
        axisName: { color: "#6e6e73", fontSize: 12 }
      },
      series: [{
        type: "radar",
        data: [
          { value: DIMS.map(function (d) { return d.get(ca) / 5 * 100; }), name: nameA, itemStyle: { color: "#0071e3" }, areaStyle: { color: "rgba(0,113,227,.12)" } },
          { value: DIMS.map(function (d) { return d.get(cb) / 5 * 100; }), name: nameB, itemStyle: { color: "#ff9500" }, areaStyle: { color: "rgba(255,149,0,.12)" } }
        ]
      }]
    });
    window.addEventListener("resize", function () { try { chart.resize(); } catch (e) {} });
  }

  function renderTable(nameA, nameB) {
    var ca = window.cityByName(nameA), cb = window.cityByName(nameB);
    var el = $("compare-table");
    el.innerHTML = "";
    if (!ca || !cb) return;

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

  init();
})();
