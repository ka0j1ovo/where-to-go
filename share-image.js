// ============================================================
// 分享图片生成：把测试结果画成一张可下载的卡片
// 依赖：qrdata.js（window.SITE_QR_DATAURI / window.SITE_URL）
// 用法：window.buildShareImage(payload, cb) -> cb(dataUrl)
//   payload = { cityName, province, score, dims:[{name, value}] }
// ============================================================
(function () {
  "use strict";

  var W = 720, H = 1000, PAD = 60;
  var FONT = '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif';

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw(payload) {
    return new Promise(function (resolve) {
      var dims = payload.dims || [];
      var rowH = 64;                                  // 行距（加大）
      var top = 336;
      var footerTop = top + dims.length * rowH + 24;  // 底部区域随内容下移
      var h = footerTop + 224;                        // 画布高度随内容
      var scale = 2;
      var canvas = document.createElement("canvas");
      canvas.width = W * scale;
      canvas.height = h * scale;
      var ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);

      // 背景
      var bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#ffffff");
      bg.addColorStop(1, "#f5f7fb");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, h);

      // 顶部品牌
      ctx.fillStyle = "#0071e3";
      ctx.font = "700 30px " + FONT;
      ctx.textBaseline = "alphabetic";
      ctx.fillText("旅·问", PAD, 86);
      ctx.fillStyle = "#8e8e93";
      ctx.font = "400 20px " + FONT;
      ctx.fillText("天选之城测试", PAD + 92, 86);

      // 标题
      ctx.fillStyle = "#8e8e93";
      ctx.font = "400 21px " + FONT;
      ctx.fillText("我的天选之城", PAD, 164);

      // 城市名（过长时自动缩小字号，避免溢出）
      var nameFont = 66;
      ctx.font = "800 " + nameFont + "px " + FONT;
      var maxNameW = W - PAD * 2;
      while (ctx.measureText(payload.cityName).width > maxNameW && nameFont > 30) {
        nameFont -= 4;
        ctx.font = "800 " + nameFont + "px " + FONT;
      }
      ctx.fillStyle = "#1d1d1f";
      ctx.fillText(payload.cityName, PAD, 240);

      // 省份 + 匹配度
      ctx.fillStyle = "#8e8e93";
      ctx.font = "400 21px " + FONT;
      ctx.fillText(payload.province || "", PAD, 276);

      if (payload.score != null) {
        ctx.fillStyle = "#0071e3";
        ctx.font = "800 44px " + FONT;
        var scoreText = Math.round(payload.score) + "%";
        var sw = ctx.measureText(scoreText).width;
        ctx.fillText(scoreText, W - PAD - sw, 244);
        ctx.fillStyle = "#8e8e93";
        ctx.font = "400 19px " + FONT;
        var lab = "匹配度";
        var lw = ctx.measureText(lab).width;
        ctx.fillText(lab, W - PAD - lw, 270);
      }

      // 分隔线
      ctx.strokeStyle = "#e8e8ed";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD, 306);
      ctx.lineTo(W - PAD, 306);
      ctx.stroke();

      // 维度列表
      ctx.textBaseline = "middle";
      dims.forEach(function (d, i) {
        var y = top + i * rowH;
        // 名称
        ctx.fillStyle = "#4b5563";
        ctx.font = "500 21px " + FONT;
        ctx.fillText(d.name, PAD, y);
        // 数字
        ctx.textAlign = "right";
        ctx.fillStyle = "#0071e3";
        ctx.font = "700 24px " + FONT;
        ctx.fillText(String(d.value), W - PAD - 104, y);
        ctx.textAlign = "left";
        // 5 格刻度条
        var segW = 16, segH = 20, gap = 6;
        var barX = W - PAD - (segW * 5 + gap * 4);
        for (var k = 0; k < 5; k++) {
          var x = barX + k * (segW + gap);
          ctx.fillStyle = k < d.value ? "#0071e3" : "#e5e5ea";
          roundRect(ctx, x, y - segH / 2, segW, segH, 4);
          ctx.fill();
        }
      });
      ctx.textBaseline = "alphabetic";

      // 底部区域
      ctx.strokeStyle = "#e8e8ed";
      ctx.beginPath();
      ctx.moveTo(PAD, footerTop);
      ctx.lineTo(W - PAD, footerTop);
      ctx.stroke();

      // 引导文字
      ctx.fillStyle = "#1d1d1f";
      ctx.font = "700 23px " + FONT;
      ctx.fillText("扫码，测出你的天选之城", PAD, footerTop + 60);
      ctx.fillStyle = "#8e8e93";
      ctx.font = "400 18px " + FONT;
      ctx.fillText("旅·问 · 100 座城市的真实旅行数据", PAD, footerTop + 96);
      ctx.fillStyle = "#c7c7cc";
      ctx.font = "400 16px " + FONT;
      ctx.fillText((window.SITE_URL || "").replace(/^https?:\/\//, "").replace(/\/$/, ""), PAD, footerTop + 126);

      // 二维码
      var qrSize = 124;
      var qrX = W - PAD - qrSize - 8;
      var qrY = footerTop + 26;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 10);
      ctx.fill();
      ctx.strokeStyle = "#e8e8ed";
      ctx.lineWidth = 1;
      roundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 10);
      ctx.stroke();

      // 二维码下方提示
      ctx.fillStyle = "#1d1d1f";
      ctx.font = "700 20px " + FONT;
      ctx.textAlign = "center";
      ctx.fillText("你也来试试↑", qrX + qrSize / 2, qrY + qrSize + 38);
      ctx.textAlign = "left";

      var qrSrc = window.SITE_QR_DATAURI;
      if (!qrSrc) { resolve(canvas.toDataURL("image/png")); return; }

      var done = false;
      function finish() {
        if (done) return;
        done = true;
        resolve(canvas.toDataURL("image/png"));
      }

      var img = new Image();
      img.onload = function () {
        try { ctx.drawImage(img, qrX, qrY, qrSize, qrSize); } catch (e) {}
        finish();
      };
      img.onerror = finish;
      // 兜底：二维码加载失败/超时也必须出图
      setTimeout(finish, 1200);
      img.src = qrSrc;
    });
  }

  // ---------- 推荐器分享图 ----------
  // payload = { count, cities: [{ name, province, score }, ...] }
  function drawRecommender(payload) {
    return new Promise(function (resolve) {
      var H2 = 860;
      var scale = 2;
      var canvas = document.createElement("canvas");
      canvas.width = W * scale;
      canvas.height = H2 * scale;
      var ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);

      var bg = ctx.createLinearGradient(0, 0, 0, H2);
      bg.addColorStop(0, "#ffffff");
      bg.addColorStop(1, "#f5f7fb");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H2);

      ctx.textBaseline = "alphabetic";

      // 顶部品牌
      ctx.fillStyle = "#0071e3";
      ctx.font = "700 30px " + FONT;
      ctx.fillText("旅·问", PAD, 86);
      ctx.fillStyle = "#8e8e93";
      ctx.font = "400 20px " + FONT;
      ctx.fillText("旅游城市推荐器", PAD + 92, 86);

      // 标题
      ctx.fillStyle = "#8e8e93";
      ctx.font = "400 21px " + FONT;
      ctx.fillText("我的推荐结果", PAD, 162);

      var cities = payload.cities || [];
      var top = cities[0];
      if (top) {
        // 第一名
        var nameFont = 50;
        ctx.font = "800 " + nameFont + "px " + FONT;
        while (ctx.measureText(top.name).width > W - PAD * 2 - 140 && nameFont > 28) {
          nameFont -= 3;
          ctx.font = "800 " + nameFont + "px " + FONT;
        }
        ctx.fillStyle = "#1d1d1f";
        ctx.fillText(top.name, PAD, 232);

        var st = Math.round(top.score) + "%";
        ctx.fillStyle = "#0071e3";
        ctx.font = "800 44px " + FONT;
        var sw = ctx.measureText(st).width;
        ctx.fillText(st, W - PAD - sw, 230);

        ctx.fillStyle = "#8e8e93";
        ctx.font = "400 19px " + FONT;
        ctx.fillText(top.province || "", PAD, 262);
        ctx.fillText("共匹配 " + (payload.count || cities.length) + " 座城市", W - PAD - 130, 262);

        // 分隔线
        ctx.strokeStyle = "#e8e8ed";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(PAD, 302);
        ctx.lineTo(W - PAD, 302);
        ctx.stroke();

        // 2-5 名
        var rows = cities.slice(1, 5);
        rows.forEach(function (c, i) {
          var y = 356 + i * 64;
          ctx.fillStyle = "#c7c7cc";
          ctx.font = "700 19px " + FONT;
          ctx.fillText(String(i + 2), PAD, y);

          ctx.fillStyle = "#1d1d1f";
          ctx.font = "600 23px " + FONT;
          ctx.fillText(c.name, PAD + 34, y);
          var nw = ctx.measureText(c.name).width;

          ctx.fillStyle = "#8e8e93";
          ctx.font = "400 17px " + FONT;
          ctx.fillText(c.province || "", PAD + 34 + nw + 12, y);

          ctx.textAlign = "right";
          ctx.fillStyle = "#0071e3";
          ctx.font = "700 23px " + FONT;
          ctx.fillText(Math.round(c.score) + "%", W - PAD, y);
          ctx.textAlign = "left";
        });
      }

      // 底部
      var footerTop = 636;
      ctx.strokeStyle = "#e8e8ed";
      ctx.beginPath();
      ctx.moveTo(PAD, footerTop);
      ctx.lineTo(W - PAD, footerTop);
      ctx.stroke();

      ctx.fillStyle = "#1d1d1f";
      ctx.font = "700 23px " + FONT;
      ctx.fillText("扫码，找到你的城市", PAD, footerTop + 60);
      ctx.fillStyle = "#8e8e93";
      ctx.font = "400 18px " + FONT;
      ctx.fillText("旅·问 · 100 座城市的真实旅行数据", PAD, footerTop + 96);
      ctx.fillStyle = "#c7c7cc";
      ctx.font = "400 16px " + FONT;
      ctx.fillText((window.SITE_URL || "").replace(/^https?:\/\//, "").replace(/\/$/, ""), PAD, footerTop + 126);

      // 二维码
      var qrSize = 120;
      var qrX = W - PAD - qrSize - 8;
      var qrY = footerTop + 26;
      ctx.fillStyle = "#ffffff";
      roundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 10);
      ctx.fill();
      ctx.strokeStyle = "#e8e8ed";
      ctx.lineWidth = 1;
      roundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 10);
      ctx.stroke();

      // 二维码下方提示
      ctx.fillStyle = "#1d1d1f";
      ctx.font = "700 20px " + FONT;
      ctx.textAlign = "center";
      ctx.fillText("你也来试试↑", qrX + qrSize / 2, qrY + qrSize + 38);
      ctx.textAlign = "left";

      var qrSrc = window.SITE_QR_DATAURI;
      if (!qrSrc) { resolve(canvas.toDataURL("image/png")); return; }

      var finished = false;
      function finish() {
        if (finished) return;
        finished = true;
        resolve(canvas.toDataURL("image/png"));
      }
      var img = new Image();
      img.onload = function () {
        try { ctx.drawImage(img, qrX, qrY, qrSize, qrSize); } catch (e) {}
        finish();
      };
      img.onerror = finish;
      setTimeout(finish, 1200);
      img.src = qrSrc;
    });
  }

  window.buildRecommenderImage = function (payload, cb) {
    drawRecommender(payload).then(function (url) {
      if (cb) cb(url);
    }).catch(function () {
      if (cb) cb(null);
    });
  };

  window.buildShareImage = function (payload, cb) {
    draw(payload).then(function (dataUrl) {
      if (cb) cb(dataUrl);
    }).catch(function () {
      if (cb) cb(null);
    });
  };

  // 展示分享图：点击图片即下载
  window.showShareImage = function (dataUrl, filename) {
    var old = document.getElementById("share-image-overlay");
    if (old) old.remove();

    var overlay = document.createElement("div");
    overlay.id = "share-image-overlay";
    overlay.className = "popover-overlay";
    overlay.innerHTML =
      '<div class="share-image-box">' +
        '<button class="popover-close" type="button" aria-label="关闭">×</button>' +
        '<div class="share-image-tip">点击图片保存到本地</div>' +
        '<img class="share-image" alt="分享图" src="' + dataUrl + '">' +
      '</div>';
    document.body.appendChild(overlay);

    var img = overlay.querySelector(".share-image");
    img.addEventListener("click", function () {
      var a = document.createElement("a");
      a.href = dataUrl;
      a.download = filename || "旅问-天选之城.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector(".popover-close").addEventListener("click", function () { overlay.remove(); });
  };
})();
