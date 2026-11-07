// ============================================================
// 首页逻辑：抽卡(随机旅行) + 城市搜索 + 文字云 + 心愿单
// ============================================================
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var cities = function () { return window.CITY_DATA || []; };

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  // ============ 1. 抽卡（随机旅行，每日一次） ============
  var drawnCity = null;

  function initDraw() {
    var btn = $("draw-btn");
    if (!btn) return;
    var lastDate = localStorage.getItem("wtg_draw_date");
    var lastCity = localStorage.getItem("wtg_draw_city");
    var today = todayStr();

    if (lastDate === today && lastCity && window.cityByName(lastCity)) {
      showDrawnCard(lastCity, false);
    } else {
      btn.disabled = false;
      btn.textContent = "抽一次 ✦";
    }

    btn.addEventListener("click", function () {
      if (btn.disabled) return;
      var list = cities();
      var c = list[Math.floor(Math.random() * list.length)];
      localStorage.setItem("wtg_draw_date", todayStr());
      localStorage.setItem("wtg_draw_city", c.name);
      showDrawnCard(c.name, true);
    });

    // 点击已揭晓的城市卡 -> 打开城市卡片
    var card = $("draw-card");
    if (card) {
      card.addEventListener("click", function () {
        if (card.classList.contains("revealed") && drawnCity) {
          window.showCityPopover(drawnCity);
        }
      });
    }
  }

  function showDrawnCard(name, animate) {
    var card = $("draw-card");
    var inner = $("draw-card-inner");
    var btn = $("draw-btn");
    var sparkles = $("draw-sparkles");
    var c = window.cityByName(name);
    if (!c) return;

    // 填正面内容
    $("draw-city").textContent = c.name;
    $("draw-prov").textContent = c.province || "";
    $("draw-tags").innerHTML = window.cityAllTags(c).slice(0, 4).map(function (t) {
      return '<span class="tag cat-' + (window.TAG_CATEGORY[t] || "none") + '">' + window.escHtml(t) + '</span>';
    }).join("");
    $("draw-note").textContent = c.notes || "";
    drawnCity = name;

    btn.disabled = true;
    btn.textContent = "明天再来";

    // 重置动画状态
    card.classList.remove("pop", "shake", "revealed");
    inner.classList.remove("flipped");
    sparkles.innerHTML = "";

    if (!animate) {
      // 已抽过：直接展示正面，无动画
      inner.classList.add("flipped");
      card.classList.add("revealed");
      return;
    }

    // 动画序列：弹出 -> 抖动 -> 翻转揭晓 -> 光效
    requestAnimationFrame(function () { card.classList.add("pop"); });
    setTimeout(function () { card.classList.remove("pop"); card.classList.add("shake"); }, 620);
    setTimeout(function () {
      card.classList.remove("shake");
      inner.classList.add("flipped");
      card.classList.add("revealed");
    }, 1060);
    setTimeout(function () { spawnSparkles(sparkles); }, 1600);
  }

  function spawnSparkles(el) {
    if (!el) return;
    for (var i = 0; i < 18; i++) {
      var s = document.createElement("span");
      s.className = "sparkle";
      s.style.left = (Math.random() * 100) + "%";
      s.style.top = (Math.random() * 100) + "%";
      s.style.setProperty("--d", (Math.random() * 0.9 + 0.3).toFixed(2) + "s");
      s.style.setProperty("--x", (Math.random() * 40 - 20) + "px");
      s.style.setProperty("--s", (Math.random() * 8 + 4) + "px");
      el.appendChild(s);
      setTimeout(function (n) { return function () { if (n.parentNode) n.parentNode.removeChild(n); }; }(s), 2200);
    }
  }

  // ============ 2. 城市搜索 ============
  function initSearch() {
    var input = $("search-input");
    var box = $("search-results");
    if (!input || !box) return;

    function doSearch() {
      var q = (input.value || "").trim().toLowerCase();
      box.innerHTML = "";
      if (!q) { box.classList.remove("open"); return; }
      var hits = cities().filter(function (c) {
        if (c.name.toLowerCase().indexOf(q) !== -1) return true;
        if ((c.province || "").toLowerCase().indexOf(q) !== -1) return true;
        return window.cityAllTags(c).some(function (t) { return t.toLowerCase().indexOf(q) !== -1; });
      }).slice(0, 8);
      if (!hits.length) {
        box.innerHTML = '<div class="search-empty">没有找到匹配的城市</div>';
      } else {
        hits.forEach(function (c) {
          var row = document.createElement("button");
          row.type = "button";
          row.className = "search-row";
          // 城市名（深色）+ 省份 / 标签（浅色小字）
          row.innerHTML =
            '<span class="search-row-name">' + window.escHtml(c.name) + '</span>' +
            '<span class="search-row-prov">' + window.escHtml(c.province || "") + '</span>' +
            '<span class="search-row-tags">' +
              window.cityAllTags(c).slice(0, 3).map(window.escHtml).join(" · ") +
            '</span>';
          row.addEventListener("click", function () { window.showCityPopover(c.name); });
          box.appendChild(row);
        });
      }
      box.classList.add("open");
    }

    input.addEventListener("input", doSearch);
    input.addEventListener("focus", doSearch);
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".search-box")) box.classList.remove("open");
    });
  }

  // ============ 3. 文字云 ============
  function initWordCloud() {
    var el = $("wordcloud");
    if (!el) return;
    buildCloud(el);
    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(function () { buildCloud(el); }, 200);
    });
  }

  function buildCloud(container) {
    container.innerHTML = "";
    var words = cities().map(function (c) {
      var fun = c.fun || 3;
      return { name: c.name, size: 13 + fun * 6.5, color: window.cityColor(c), city: c };
    });
    words.sort(function (a, b) { return b.size - a.size; });

    var W = container.clientWidth || 600;
    var H = 500;
    container.style.height = H + "px";
    var cx = W / 2, cy = H / 2;
    var placed = [];

    words.forEach(function (w) {
      // 测量尺寸
      var probe = document.createElement("span");
      probe.className = "wc-word";
      probe.style.fontSize = w.size + "px";
      probe.textContent = w.name;
      probe.style.position = "absolute";
      probe.style.left = "-9999px";
      probe.style.top = "-9999px";
      document.body.appendChild(probe);
      var ww = probe.offsetWidth + 6;
      var wh = probe.offsetHeight + 4;
      document.body.removeChild(probe);

      var angle = Math.random() * Math.PI * 2;
      var r = 0;
      for (var tries = 0; tries < 900; tries++) {
        var x = cx + r * Math.cos(angle);
        var y = cy + r * Math.sin(angle);
        var left = x - ww / 2, top = y - wh / 2;
        if (left >= 0 && top >= 0 && left + ww <= W && top + wh <= H && !hit(left, top, ww, wh, placed)) {
          var el = document.createElement("span");
          el.className = "wc-word";
          el.style.fontSize = w.size + "px";
          el.style.color = w.color;
          el.style.left = left + "px";
          el.style.top = top + "px";
          el.textContent = w.name;
          el.addEventListener("click", function () { window.showCityPopover(w.name); });
          container.appendChild(el);
          placed.push({ left: left, top: top, w: ww, h: wh });
          break;
        }
        angle += 0.33;
        r += 2.4;
      }
    });
  }

  function hit(l, t, w, h, placed) {
    for (var i = 0; i < placed.length; i++) {
      var p = placed[i];
      if (l < p.left + p.w && l + w > p.left && t < p.top + p.h && t + h > p.top) return true;
    }
    return false;
  }

  // ============ 4. 心愿单 ============
  function renderFavorites() {
    var list = $("fav-list");
    if (!list) return;
    var names = window.FAV.list();
    var box = $("fav-section");
    if (box) box.style.display = names.length ? "" : "none";
    list.innerHTML = "";
    if (!names.length) {
      list.innerHTML = '<div class="fav-empty">在文字云或对比页点「♡ 收藏」，就会出现在这里。</div>';
      return;
    }
    names.forEach(function (name) {
      var c = window.cityByName(name);
      if (!c) return;
      var chip = document.createElement("div");
      chip.className = "fav-chip";
      chip.innerHTML =
        '<span class="fav-chip-name">' + window.escHtml(name) + '</span>' +
        '<span class="fav-chip-prov">' + window.escHtml(c.province || "") + '</span>';
      chip.addEventListener("click", function () { window.showCityPopover(name); });
      var rm = document.createElement("button");
      rm.type = "button";
      rm.className = "fav-chip-del";
      rm.textContent = "×";
      rm.title = "移除";
      rm.addEventListener("click", function (e) {
        e.stopPropagation();
        window.FAV.remove(name);
        renderFavorites();
      });
      chip.appendChild(rm);
      list.appendChild(chip);
    });
  }

  // ============ 5. 地图总览 ============
  function initHomeMap() {
    var el = $("home-map");
    if (!el) return;
    if (!window.echarts || !window.CHINA_GEO) {
      el.innerHTML = '<div class="map-fallback">地图组件未加载。</div>';
      return;
    }
    window.echarts.registerMap("china", window.CHINA_GEO);
    var chart = window.echarts.init(el);
    var coords = window.CITY_COORDS || {};
    var points = [];
    cities().forEach(function (c) {
      var co = coords[c.name];
      if (!co) return;
      points.push({ name: c.name, value: [co.lng, co.lat] });
    });

    chart.setOption({
      tooltip: { trigger: "item", formatter: "{b}" },
      geo: {
        map: "china",
        roam: true,
        scaleLimit: { min: 0.7, max: 12 },
        center: [104, 36],
        zoom: 1.3,
        itemStyle: { areaColor: "#f2f3f5", borderColor: "#d5d7db", borderWidth: 0.6 },
        emphasis: { label: { show: false }, itemStyle: { areaColor: "#e3e9f0" } },
        label: { show: false },
        selectedMode: false
      },
      series: [{
        name: "城市",
        type: "scatter",
        coordinateSystem: "geo",
        symbolSize: 7,
        itemStyle: { color: "#0071e3", borderColor: "#fff", borderWidth: 1 },
        label: { show: false },
        data: points
      }]
    });

    chart.on("click", function (params) {
      if (params && params.componentType === "series" && params.seriesName === "城市" && params.name) {
        window.showCityPopover(params.name);
      }
    });
    window.addEventListener("resize", function () { try { chart.resize(); } catch (e) {} });
  }

  // ---------- 初始化 ----------
  initDraw();
  initSearch();
  initWordCloud();
  initHomeMap();
  renderFavorites();
  window.addEventListener("wtg-fav-change", renderFavorites);
})();
