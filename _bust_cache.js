// 给 HTML 中的本地 css/js 引用加上版本号，避免浏览器缓存旧文件
const fs = require('fs');

const VER = process.argv[2] || Date.now().toString(36);
const files = ['index.html', 'test.html', 'recommender.html', 'compare.html'];

files.forEach(f => {
  let s = fs.readFileSync(f, 'utf8');
  const before = s;

  // style.css
  s = s.replace(/href="style\.css(?:\?v=[^"]*)?"/g, 'href="style.css?v=' + VER + '"');

  // 本地 js（排除 http 开头的外部地址）
  s = s.replace(/<script src="([a-zA-Z0-9_\-]+\.js)(?:\?v=[^"]*)?"><\/script>/g,
    (m, name) => '<script src="' + name + '?v=' + VER + '"></script>');

  if (s !== before) {
    fs.writeFileSync(f, s, 'utf8');
    const n = (s.match(/\?v=/g) || []).length;
    console.log(f + ' -> 已加版本号 ' + VER + '（' + n + ' 处）');
  } else {
    console.log(f + ' -> 无变化');
  }
});
console.log('\n版本号:', VER);
