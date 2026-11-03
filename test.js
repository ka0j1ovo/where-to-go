// ============================================================
// 天选之城测试 —— 答题流程 + 计分引擎 + 结果渲染
// 依赖：data.js(window.CITY_DATA)、test_data.js、test_templates.js
//       echarts.min.js（可选，缺省时雷达图降级为文字）
// 说明：
//   · 测试只使用 7 个维度（不含 fun/站长体验），与推荐器的 DIMENSIONS 口径一致
//   · 计分：答案 -> 各维度推力 push -> raw -> want(0-4档) -> weight(0/1/3)
//           再复用推荐器的加权平均公式（scoreCity 同款），逐城市打分
// ============================================================

(function () {
  "use strict";

  // ---------- 7 维定义：复用 common.js 的单一数据源 ----------
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  // 打分制：正向值(1-5) -> 数字 + 极简刻度条
  function dimVal(q) { return clamp(Math.round(q), 1, 5); }
  function scoreView(q) {
    var v = dimVal(q);
    return window.scoreHtml ? window.scoreHtml(v) : String(v);
  }

  var DIMS = window.CITY_DIMS || [];
  var DIM_BY_KEY = {};
  DIMS.forEach(function (d) { DIM_BY_KEY[d.key] = d; });

  var SCALE = 5, LEVELS = 5;

  // ---------- 匹配度（与推荐器公式一致） ----------
  function dimensionMatch(cityVal, want, scale) {
    return Math.max(0, 1 - Math.abs(cityVal - want) / scale);
  }
  function wantValue(d, want) {
    var idx = d.reversed ? (LEVELS - 1 - want) : want;
    return idx * (SCALE / (LEVELS - 1));
  }

  // ---------- 工具 ----------
  function shuffle(arr) {
    var r = arr.slice();
    for (var i = r.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = r[i]; r[i] = r[j]; r[j] = t;
    }
    return r;
  }
  function cityAllTags(c) { return (c.cultureTags || []).concat(c.natureTags || []); }
  function hasAny(arr, sel) {
    for (var i = 0; i < sel.length; i++) if (arr.indexOf(sel[i]) !== -1) return true;
    return false;
  }

  // ---------- 状态 ----------
  var questions = [];
  var answers = [];       // 每题选中的选项 index，-1 = 未答
  var currentIdx = 0;
  var collectedTags = [];
  var pendingRadar = null;   // 待初始化的雷达图（须在插入文档后 init）

  var $ = function (id) { return document.getElementById(id); };
  function scrollTop() {
    try { window.scrollTo(0, 0); } catch (e) { /* 非浏览器环境忽略 */ }
  }

  // ---------- 抽题：固定模板 + 组内随机 ----------
  function drawQuestions() {
    var templates = window.TEST_TEMPLATES || [];
    if (!templates.length) return shuffle(window.TEST_QUESTIONS || []);
    var t = templates[Math.floor(Math.random() * templates.length)];
    var byGroup = {};
    (window.TEST_QUESTIONS || []).forEach(function (q) {
      (byGroup[q.group] = byGroup[q.group] || []).push(q);
    });
    var picked = [];
    Object.keys(t.pick || {}).forEach(function (g) {
      var pool = byGroup[g] || [];
      var mustSet = {};
      (t.must || []).forEach(function (id) {
        if (pool.some(function (q) { return q.id === id; })) mustSet[id] = true;
      });
      var mustQs = pool.filter(function (q) { return mustSet[q.id]; });
      var rest = shuffle(pool.filter(function (q) { return !mustSet[q.id]; }));
      var need = Math.max(0, (t.pick[g] || 0) - mustQs.length);
      picked = picked.concat(mustQs, rest.slice(0, need));
    });
    return shuffle(picked);
  }

  // ---------- 答题渲染 ----------
  function renderQuestion() {
    if (currentIdx >= questions.length) { finish(); return; }
    var q = questions[currentIdx];
    var total = questions.length;

    $("test-progress-cur").textContent = currentIdx + 1;
    $("test-progress-total").textContent = total;
    $("test-progress-fill").style.width = (currentIdx / total * 100) + "%";
    $("test-scene").textContent = q.scene || "";
    $("test-question").textContent = q.q;

    var opts = $("test-options");
    opts.innerHTML = "";
    q.options.forEach(function (opt, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "test-opt";
      if (answers[currentIdx] === i) btn.classList.add("active");
      btn.textContent = opt.text;
      btn.addEventListener("click", function () {
        answers[currentIdx] = i;
        renderQuestion();   // 重新渲染以高亮选中项，并更新下一步按钮
      });
      opts.appendChild(btn);
    });

    var hasAnswer = answers[currentIdx] !== -1;
    $("test-next").disabled = !hasAnswer;
    $("test-prev").disabled = (currentIdx === 0);

    // 最后一题按钮文案
    $("test-next").textContent = (currentIdx === total - 1) ? "看结果 ✦" : "下一题 →";

    scrollTop();
  }

  function startTest() {
    questions = drawQuestions();
    answers = questions.map(function () { return -1; });
    currentIdx = 0;
    collectedTags = [];
    pendingRadar = null;
    $("test-intro").hidden = true;
    $("test-quiz").hidden = false;
    $("result-view").hidden = true;
    renderQuestion();
  }

  function goNext() {
    if (answers[currentIdx] === -1) return;
    if (currentIdx < questions.length - 1) { currentIdx++; renderQuestion(); }
    else finish();
  }
  function goPrev() {
    if (currentIdx > 0) { currentIdx--; renderQuestion(); }
  }

  // ---------- 计分引擎 ----------
  function computePrefs() {
    var push = {}, totalW = {}, pos = {}, neg = {};
    DIMS.forEach(function (d) { push[d.key] = 0; totalW[d.key] = 0; pos[d.key] = 0; neg[d.key] = 0; });

    questions.forEach(function (q, qi) {
      var ans = answers[qi];
      if (ans < 0) return;
      var opt = q.options[ans];
      var want = opt.want || {}, weight = opt.weight || {};
      Object.keys(weight).forEach(function (k) {
        if (!DIM_BY_KEY[k]) return;
        var s = want[k] || 0;     // -1 / 0 / 1
        var m = weight[k] || 0;   // 1 / 2
        push[k] += s * m;
        totalW[k] += m;
        if (s > 0) pos[k] += s * m;
        if (s < 0) neg[k] += (-s) * m;
      });
      if (opt.tags && opt.tags.length) {
        opt.tags.forEach(function (tg) {
          if (collectedTags.indexOf(tg) === -1) collectedTags.push(tg);
        });
      }
    });

    var prefs = {}, inconsistent = [];
    DIMS.forEach(function (d) {
      var raw = totalW[d.key] > 0 ? push[d.key] / totalW[d.key] : 0;
      var want = Math.round(clamp(2 + raw * 2, 0, 4));
      var w = Math.abs(raw) >= 0.6 ? 3 : (Math.abs(raw) >= 0.25 ? 1 : 0);
      // 一致性检查：同维度方向打架则降权
      if (pos[d.key] >= 2 && neg[d.key] >= 2) {
        w = w === 3 ? 1 : 0;
        inconsistent.push(d.key);
      }
      prefs[d.key] = { weight: w, want: want, raw: raw };
    });

    // 兜底：若所有维度权重都为 0，取 |raw| 最大的两个维度设为「纳入考虑」
    var anyActive = DIMS.some(function (d) { return prefs[d.key].weight > 0; });
    if (!anyActive) {
      var sorted = DIMS.slice().sort(function (a, b) {
        return Math.abs(prefs[b.key].raw) - Math.abs(prefs[a.key].raw);
      });
      sorted.slice(0, 2).forEach(function (d) { prefs[d.key].weight = 1; });
    }

    return { prefs: prefs, inconsistent: inconsistent };
  }

  function scoreCity(city, prefs) {
    var sum = 0, totalW = 0, detail = {};
    DIMS.forEach(function (d) {
      var w = prefs[d.key].weight;
      if (w <= 0) return;
      var m = dimensionMatch(d.get(city), wantValue(d, prefs[d.key].want), SCALE);
      sum += w * m;
      totalW += w;
      detail[d.key] = m;
    });
    return { score: totalW > 0 ? (sum / totalW) * 100 : null, detail: detail };
  }

  function computeResults() {
    var cp = computePrefs();
    var data = window.CITY_DATA || [];
    var scored = data.map(function (c) {
      var s = scoreCity(c, cp.prefs);
      var tagHit = collectedTags.length && hasAny(cityAllTags(c), collectedTags) ? 1 : 0;
      return { city: c, score: s.score, detail: s.detail, tagHit: tagHit };
    }).filter(function (x) { return x.score != null; })
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        if (b.tagHit !== a.tagHit) return b.tagHit - a.tagHit;
        return a.city.name.localeCompare(b.city.name, "zh");
      });
    return { scored: scored, cp: cp };
  }

  // ---------- 结果渲染 ----------
  function finish() {
    var r = computeResults();
    pendingRadar = null;
    $("test-view").hidden = true;
    $("result-view").hidden = false;
    $("result-body").innerHTML = "";
    if (!r.scored.length) {
      $("result-body").innerHTML = '<div class="empty">这次没有算出匹配城市，再测一次试试吧。</div>';
      scrollTop();
      return;
    }
    $("result-body").appendChild(buildResult(r));
    // 图必须在插入文档后初始化，否则容器宽度为 0
    setTimeout(initRadarChart, 0);
    scrollTop();
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function buildResult(r) {
    var wrap = document.createElement("div");
    var best = r.scored[0];
    var cp = r.cp;
    var meta = window.TEST_META || {};

    // ---- 顶部标题 ----
    var head = document.createElement("div");
    head.className = "result-head";
    head.innerHTML =
      '<div class="result-kicker">你的天选之城</div>' +
      '<h1 class="result-city-name">' + esc(best.city.name) + '</h1>' +
      '<div class="result-score">' +
        '<span class="result-score-num">' + Math.round(best.score) + '</span>' +
        '<span class="result-score-pct">% 匹配</span>' +
      '</div>';
    wrap.appendChild(head);

    // ---- 城市卡 ----
    var card = document.createElement("div");
    card.className = "result-card";
    var metaParts = [
      "建议 " + (best.city.minDays === best.city.maxDays ? best.city.minDays + " 天" : best.city.minDays + "-" + best.city.maxDays + " 天"),
      "消费 " + (["", "很低", "低", "中等", "高", "很贵"][best.city.cost] || best.city.cost),
      "公交 " + (["无交通", "仅可打车、一日团或拼车", "有便捷公交大巴", "有地铁"][best.city.transit] || best.city.transit)
    ];
    var tagHtml = cityAllTags(best.city).map(function (t) {
      return '<span class="tag">' + esc(t) + '</span>';
    }).join("");
    card.innerHTML =
      '<div class="result-card-prov">' + esc(best.city.province || "") + '</div>' +
      '<div class="result-card-meta">' + metaParts.join(" · ") + '</div>' +
      '<div class="result-card-notes">' + esc(best.city.notes || "") + '</div>' +
      '<div class="result-card-tags">' + tagHtml + '</div>';
    wrap.appendChild(card);

    // ---- fun 委婉提示 ----
    var fun = best.city.fun;
    if (fun != null && fun <= (meta.funHintThreshold || 2)) {
      var hint = document.createElement("div");
      hint.className = "result-fun-hint";
      hint.textContent = (fun === 1 && meta.funHints && meta.funHints.weak)
        ? meta.funHints.weak
        : (meta.funHints && meta.funHints.mild || "顺带一提，站长本人在那里的体验只是「还行」。");
      wrap.appendChild(hint);
    }

    // ---- 一致性提示 ----
    if (cp.inconsistent.length) {
      var inc = document.createElement("div");
      inc.className = "result-inc-hint";
      var names = cp.inconsistent.map(function (k) { return DIM_BY_KEY[k].short; }).join("、");
      inc.textContent = "你在「" + names + "」上的选择有点左右摇摆，这些维度我们放轻了权重。";
      wrap.appendChild(inc);
    }

    // ---- tag 总结 ----
    if (collectedTags.length) {
      var tagBox = document.createElement("div");
      tagBox.className = "result-tag-summary";
      var hitTags = collectedTags.filter(function (t) { return cityAllTags(best.city).indexOf(t) !== -1; });
      var missTags = collectedTags.filter(function (t) { return cityAllTags(best.city).indexOf(t) === -1; });
      tagBox.innerHTML =
        '<div class="result-tag-line">你更偏爱：' + collectedTags.map(esc).join("、") + '</div>' +
        (hitTags.length
          ? '<div class="result-tag-line hit">这座城市正好有：' + hitTags.map(esc).join("、") + '</div>'
          : '') +
        (missTags.length
          ? '<div class="result-tag-line miss">它没有（但你更偏好的）：' + missTags.map(esc).join("、") + '</div>'
          : '');
      wrap.appendChild(tagBox);
    }

    // ---- 雷达图 ----
    var radar = buildRadar(best, cp);
    if (radar) wrap.appendChild(radar);

    // ---- 逐维度理由 ----
    var reasons = document.createElement("div");
    reasons.className = "result-reasons";
    var reasonsTitle = document.createElement("div");
    reasonsTitle.className = "result-section-title";
    reasonsTitle.textContent = "为什么是它（1–5）";
    reasons.appendChild(reasonsTitle);

    DIMS.forEach(function (d) {
      var p = cp.prefs[d.key];
      var row = document.createElement("div");
      row.className = "result-reason" + (p.weight > 0 ? "" : " muted");
      var cityVal = d.get(best.city);
      var m = best.detail[d.key];
      if (p.weight > 0) {
        row.innerHTML =
          '<div class="result-reason-head">' +
            '<span class="result-reason-dim">' + esc(window.scaleNameOf ? window.scaleNameOf(d.key, d.short) : d.short) + '</span>' +
            '<span class="result-reason-match">' + Math.round(m * 100) + '%</span>' +
          '</div>' +
          '<div class="result-reason-body">' +
            '<div>你选的：' + scoreView(d.reversed ? (5 - p.want) : (p.want + 1)) + '</div>' +
            '<div>这座城：' + scoreView(cityVal) + '</div>' +
          '</div>';
      } else {
        row.innerHTML =
          '<div class="result-reason-head">' +
            '<span class="result-reason-dim">' + esc(window.scaleNameOf ? window.scaleNameOf(d.key, d.short) : d.short) + '</span>' +
            '<span class="result-reason-skip">未纳入</span>' +
          '</div>' +
          '<div class="result-reason-body">你没有特别的倾向，这一项没参与匹配。</div>';
      }
      reasons.appendChild(row);
    });
    wrap.appendChild(reasons);

    // ---- 备选城市 ----
    if (r.scored.length > 1) {
      var alt = document.createElement("div");
      alt.className = "result-alt";
      var altTitle = document.createElement("div");
      altTitle.className = "result-section-title";
      altTitle.textContent = "也值得看看";
      alt.appendChild(altTitle);
      var altList = document.createElement("div");
      altList.className = "result-alt-list";
      r.scored.slice(1, 4).forEach(function (x) {
        var a = document.createElement("div");
        a.className = "result-alt-item";
        a.innerHTML =
          '<span class="result-alt-name">' + esc(x.city.name) + '</span>' +
          '<span class="result-alt-prov">' + esc(x.city.province || "") + '</span>' +
          '<span class="result-alt-score">' + Math.round(x.score) + '%</span>';
        altList.appendChild(a);
      });
      alt.appendChild(altList);
      wrap.appendChild(alt);
    }

    // ---- 操作 ----
    var actions = document.createElement("div");
    actions.className = "result-actions";
    actions.innerHTML =
      '<button id="retake-test" class="test-btn-ghost" type="button">再测一次</button>' +
      '<button id="share-test" class="test-btn-ghost" type="button">生成分享图</button>';
    if (window.favButton) actions.appendChild(window.favButton(best.city.name));
    var link = document.createElement("a");
    link.className = "test-btn-primary";
    link.href = "recommender.html";
    link.textContent = "加上现实条件再筛 →";
    actions.appendChild(link);
    wrap.appendChild(actions);

    // 重新测试 + 分享图片
    setTimeout(function () {
      var retake = $("retake-test");
      if (retake) retake.addEventListener("click", function () { location.href = location.pathname; });
      var share = $("share-test");
      if (share) share.addEventListener("click", function () {
        if (!window.buildShareImage) {          // 降级：没有画图能力时复制链接
          copyText(shareUrl(), share);
          return;
        }
        var payload = {
          cityName: best.city.name,
          province: best.city.province || "",
          score: best.score,
          dims: DIMS.map(function (d) {
            return {
              name: window.scaleNameOf ? window.scaleNameOf(d.key, d.short) : d.short,
              value: dimVal(d.get(best.city))
            };
          })
        };
        share.disabled = true;
        share.textContent = "生成中…";
        window.buildShareImage(payload, function (url) {
          share.disabled = false;
          share.textContent = "生成分享图";
          if (url && window.showShareImage) window.showShareImage(url);
          else copyText(shareUrl(), share);
        });
      });
    }, 0);

    return wrap;
  }

  // ---------- 分享：把题目+答案编码进 URL ----------
  function shareUrl() {
    var payload = { q: questions.map(function (q) { return q.id; }), a: answers };
    var enc;
    try { enc = btoa(JSON.stringify(payload)); }
    catch (e) { enc = encodeURIComponent(JSON.stringify(payload)); }
    return location.origin + location.pathname + "?r=" + enc;
  }
  function copyText(text, btn) {
    function done() {
      var old = btn.textContent;
      btn.textContent = "已复制 ✓";
      setTimeout(function () { btn.textContent = old; }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
    } else { fallbackCopy(text); done(); }
  }
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.left = "-9999px";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
  }

  // ---------- 从 URL 恢复分享结果 ----------
  function restoreFromShare() {
    var raw;
    try { raw = new URLSearchParams(location.search).get("r"); } catch (e) { return false; }
    if (!raw) return false;
    var p;
    try { p = JSON.parse(atob(raw)); } catch (e) { try { p = JSON.parse(decodeURIComponent(raw)); } catch (e2) { return false; } }
    if (!p || !Array.isArray(p.q) || !Array.isArray(p.a)) return false;

    var pool = window.TEST_QUESTIONS || [];
    var byId = {};
    pool.forEach(function (q) { byId[q.id] = q; });

    questions = [];
    answers = [];
    p.q.forEach(function (id, i) {
      if (byId[id] && p.a[i] != null) { questions.push(byId[id]); answers.push(p.a[i]); }
    });
    if (!questions.length) return false;
    currentIdx = questions.length;

    // 直接进入结果页
    $("test-intro").hidden = true;
    $("test-quiz").hidden = true;
    $("result-view").hidden = false;
    $("result-body").innerHTML = "";
    var r = computeResults();
    if (r.scored.length) {
      $("result-body").appendChild(buildResult(r));
      setTimeout(initRadarChart, 0);
    } else {
      $("result-body").innerHTML = '<div class="empty">这份分享结果已失效，再测一次吧。</div>';
    }
    return true;
  }

  function buildRadar(best, cp) {
    var el = document.createElement("div");
    el.className = "result-radar";

    var title = document.createElement("div");
    title.className = "result-section-title";
    title.textContent = "你的偏好画像";
    el.appendChild(title);

    if (!window.echarts) {
      el.classList.add("result-radar-fallback");
      var note = document.createElement("div");
      note.className = "result-radar-note";
      note.textContent = "图形组件未加载，已跳过偏好画像。";
      el.appendChild(note);
      return el;
    }

    var chartEl = document.createElement("div");
    chartEl.className = "result-radar-chart";
    chartEl.style.width = "100%";
    chartEl.style.height = "320px";
    el.appendChild(chartEl);

    // 记录参数，等插入文档后再 init（未挂载的元素宽度为 0，会渲染成空白）
    pendingRadar = { el: el, chartEl: chartEl, best: best, cp: cp };
    return el;
  }

  // 必须在结果 DOM 已插入文档后调用，否则 echarts 容器尺寸为 0
  function initRadarChart() {
    if (!pendingRadar || !window.echarts) return;
    var pr = pendingRadar;
    try {
      var chart = window.echarts.init(pr.chartEl);
      var userVals = DIMS.map(function (d) {
        return wantValue(d, pr.cp.prefs[d.key].want) / SCALE * 100;
      });
      var cityVals = DIMS.map(function (d) {
        return d.get(pr.best.city) / SCALE * 100;
      });
      chart.setOption({
        tooltip: { trigger: "item" },
        legend: { bottom: 0, data: ["你的偏好", "推荐城市"] },
        radar: {
          indicator: DIMS.map(function (d) { return { name: d.short, max: 100 }; }),
          radius: "62%",
          axisName: { color: "#6e6e73", fontSize: 12 }
        },
        series: [{
          type: "radar",
          data: [
            { value: userVals, name: "你的偏好", itemStyle: { color: "#0071e3" }, areaStyle: { color: "rgba(0,113,227,.12)" } },
            { value: cityVals, name: "推荐城市", itemStyle: { color: "#ff9500" }, areaStyle: { color: "rgba(255,149,0,.12)" } }
          ]
        }]
      });
      window.addEventListener("resize", function () { try { chart.resize(); } catch (e) {} });
    } catch (e) {
      pr.el.classList.add("result-radar-fallback");
      if (pr.chartEl.parentNode) pr.chartEl.parentNode.removeChild(pr.chartEl);
      var note = document.createElement("div");
      note.className = "result-radar-note";
      note.textContent = "偏好画像渲染失败，已跳过。";
      pr.el.appendChild(note);
    }
  }

  // ---------- 初始化 ----------
  $("start-test").addEventListener("click", startTest);
  $("test-next").addEventListener("click", goNext);
  $("test-prev").addEventListener("click", goPrev);

  // 若 URL 带分享参数，直接恢复结果
  restoreFromShare();

})();
