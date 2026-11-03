// ============================================================
// 生成脚本：把「城市数据.csv」全量转换为 data.js，并补全 geo.js 的城市坐标
// 用法：node _gen_data.js
// 说明：
//   · data.js 以 CSV 为唯一数据源，字段随 CSV 列变化。
//   · geo.js 里已存在的城市坐标不变，只为缺失城市按「行政区名」追加坐标。
// ============================================================
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const csvPath = path.join(dir, '城市数据.csv');
const dataPath = path.join(dir, 'data.js');
const geoPath = path.join(dir, 'geo.js');

// —— 枚举映射 ——
const ACCESS_MAP = {
  '坐火车可达': '仅火车站',
  '飞机火车都可达': '有机场火车站',
  '火车不到只能大巴': '仅大巴'
};
const TRANSIT_MAP = {
  '有地铁': 3,
  '有便捷公交大巴': 2,
  '仅可打车、一日团或拼车': 1
};
const ACCESS_LABEL = Object.fromEntries(Object.entries(ACCESS_MAP).map(([k, v]) => [v, k]));
const TRANSIT_LABEL = Object.fromEntries(Object.entries(TRANSIT_MAP).map(([k, v]) => [v, k]));

// 已确认的笔误修正：城市名 -> 字段 -> CSV 原值 -> 采用值
const TAG_FIXES = {
  '仙居': { natureTags: { '山': '青山' } },
  // CSV 里 tag 误写为「主题公园」，统一更正
  '*': { cultureTags: { '主题公园': '主题乐园' } },
  '日照': { notes: { '海滨浴场、海鲜，山海日照、': '海滨浴场、海鲜，山海日照' } },
  '格尔木': { notes: { '察尔汗盐湖海子': '察尔汗盐湖' } }
};

// CSV 城市名 -> 行政区名（geo.js 里用来查经纬度）
const AREA_OVERRIDES = {
  '重庆主城': '重庆市',
  '三明沙县': '沙县',
  '西双版纳景洪': '景洪市',
  '迪庆（香格里拉/德钦）': '香格里拉市',
  '阿坝州': '阿坝藏族羌族自治州',
  '大理': '大理市'
};

// —— CSV 解析 ——
function parseCSV(text) {
  const clean = text.replace(/^\uFEFF/, '');
  // 跳过整行空白（如 ",,,,,"）——表中常见用于占位的空行
  const lines = clean.split(/\r?\n/).filter(l => l.split(',').some(cell => cell.trim() !== ''));
  const header = lines[0].split(',').map(s => s.trim());
  return lines.slice(1).map(line => {
    const cells = line.split(',');
    const row = {};
    header.forEach((h, i) => { row[h] = (cells[i] === undefined ? '' : cells[i]).trim(); });
    return row;
  });
}

function splitTags(s) {
  if (!s) return [];
  return s.split('、').map(x => x.trim()).filter(Boolean);
}

function jsStr(s) {
  return JSON.stringify(s);
}

function jsNum(v) {
  const n = Number(v);
  return isFinite(n) ? String(n) : '0';
}

// —— 读取原始 data.js（用于保留 fromShanghai 等 CSV 中没有的字段）——
function loadExistingCities() {
  const src = fs.readFileSync(dataPath, 'utf8');
  const box = {};
  new Function('window', src)(box);
  const list = box.CITY_DATA || [];
  const byName = {};
  list.forEach(c => { byName[c.name] = c; });
  return { list, byName };
}

function loadCoordMap() {
  const src = fs.readFileSync(geoPath, 'utf8');
  const box = {};
  new Function('window', src)(box);
  return box.CITY_COORDS || {};
}

// —— 从 china.js / china.json 建行政区名 -> 坐标 查询 ——
function loadAreaLookup() {
  const lookup = {};
  const add = (node) => {
    const name = node.name;
    if (name && node.lng != null && node.lat != null && !(node.lng === 0 && node.lat === 0)) {
      lookup[name] = { lng: node.lng, lat: node.lat };
    }
    (node.children || []).forEach(add);
  };
  const deps = (() => {
    const src = fs.readFileSync(geoPath, 'utf8');
    const box = {};
    new Function('window', src)(box);
    return box.DEPARTURES || [];
  })();
  deps.forEach(add);
  return lookup;
}

// —— 估算新增城市的「上海出发火车时间」：粗略按直线距离 / 250km/h + 1h ——
function estimateHours(depCoord, cityCoord) {
  if (!depCoord || !cityCoord) return 6;
  const R = 6371;
  const dLat = (cityCoord.lat - depCoord.lat) * Math.PI / 180;
  const dLng = (cityCoord.lng - depCoord.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(depCoord.lat * Math.PI / 180) * Math.cos(cityCoord.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const h = km / 250 + 1;
  return Math.round(h * 2) / 2;
}

const rows = parseCSV(fs.readFileSync(csvPath, 'utf8'));
const existing = loadExistingCities();
const coords = loadCoordMap();
const areaLookup = loadAreaLookup();

// 上海坐标用于估算时长
const shCoord = areaLookup['上海市'] || { lng: 121.472644, lat: 31.231706 };
const depCoord = { lng: shCoord.lng, lat: shCoord.lat };

const warnings = [];
const cities = [];

rows.forEach(row => {
  const name = row['城市'];
  const old = existing.byName[name];

  // —— tag ——
  let cultureTags = splitTags(row['人文tag']);
  let natureTags = splitTags(row['自然tag']);
  const applyFixes = (fix) => {
    if (!fix) return;
    if (fix.cultureTags) cultureTags = cultureTags.map(t => fix.cultureTags[t] || t);
    if (fix.natureTags) natureTags = natureTags.map(t => fix.natureTags[t] || t);
  };
  applyFixes(TAG_FIXES['*']);
  applyFixes(TAG_FIXES[name]);

  // —— 备注修正 ——
  let notes = row['备注'] || '';
  const noteFix = TAG_FIXES[name] && TAG_FIXES[name].notes;
  if (noteFix) {
    Object.keys(noteFix).forEach(from => { notes = notes.split(from).join(noteFix[from]); });
  }

  // —— 数值字段校验 ——
  const num = (label, min, max) => {
    const v = Number(row[label]);
    if (!(v >= min && v <= max)) warnings.push(`${name}: ${label} 越界「${row[label]}」`);
    return v;
  };

  // —— access / transit ——
  const access = ACCESS_MAP[row['到达方式']];
  if (access === undefined) warnings.push(`${name}: 到达方式无法识别「${row['到达方式']}」`);
  const transit = TRANSIT_MAP[row['公交']];
  if (transit === undefined) warnings.push(`${name}: 公交无法识别「${row['公交']}」`);

  // —— 1-5 分值字段 ——
  const culture = num('人文', 1, 5);
  const nature = num('自然', 1, 5);
  const food = num('美食', 1, 5);
  const popularity = num('小众→大众', 1, 5);
  const vibe = num('市井→繁华', 1, 5);
  const leisure = num('轻松休闲→劳累辛苦', 1, 5);
  const stay = num('停留时间', 1, 5);
  const photo = num('出片度', 1, 5);
  const fun = num('主观好玩指数', 1, 5);
  const cost = num('消费', 1, 5);
  const minDays = num('最少天数', 1, 99);
  const maxDays = num('最多天数', 1, 99);
  if (maxDays < minDays) warnings.push(`${name}: 最多天数(${maxDays}) < 最少天数(${minDays})`);

  // —— fromShanghai：CSV 里没有这一列，沿用旧值；新城市估算 ——
  let hours;
  if (old && old.fromShanghai && old.fromShanghai.hours != null) {
    hours = old.fromShanghai.hours;
  } else {
    const coord = coords[name];
    hours = estimateHours(depCoord, coord);
    warnings.push(`${name}: 新城市，上海出发历时按直线距离估算为 ${hours} 小时（请手动核对）`);
  }

  cities.push({
    name,
    province: row['省份'],
    culture,
    nature,
    cultureTags,
    natureTags,
    access,
    food,
    popularity,
    vibe,
    leisure,
    stay,
    photo,
    fun,
    cost,
    transit,
    hours,
    minDays,
    maxDays,
    notes
  });
});

const removed = existing.list.filter(c => !cities.some(n => n.name === c.name)).map(c => c.name);
const added = cities.filter(c => !existing.byName[c.name]).map(c => c.name);

// —— 输出 data.js ——
const header = `// ============================================================
// 城市数据文件 —— 由 _gen_data.js 从「城市数据.csv」自动生成，请勿手改
// 硬性条件：想看什么(人文tag/自然tag)、到达方式、出行距离、最多可用天数、公交。
// 软性维度：人文/自然、美食、大众/小众、消费、轻松休闲/劳累辛苦、停留时间、出片度、站长体验。
// 硬性条件不含分数，仅用 tag / 到达方式 / 距离 / 天数 / 公交做过滤。
// ============================================================

window.CITY_DATA = [
`;

const body = cities.map(c => {
  return [
    '  {',
    `    name: ${jsStr(c.name)},`,
    `    province: ${jsStr(c.province)},`,
    `    culture: ${jsNum(c.culture)},`,
    `    nature: ${jsNum(c.nature)},`,
    `    cultureTags: [${c.cultureTags.map(jsStr).join(', ')}],`,
    `    natureTags: [${c.natureTags.map(jsStr).join(', ')}],`,
    `    access: ${jsStr(c.access)},`,
    `    food: ${jsNum(c.food)},`,
    `    popularity: ${jsNum(c.popularity)},`,
    `    vibe: ${jsNum(c.vibe)},`,
    `    leisure: ${jsNum(c.leisure)},`,
    `    stay: ${jsNum(c.stay)},`,
    `    photo: ${jsNum(c.photo)},`,
    `    fun: ${jsNum(c.fun)},`,
    `    cost: ${jsNum(c.cost)},`,
    `    transit: ${jsNum(c.transit)},`,
    `    fromShanghai: { hours: ${jsNum(c.hours)} },`,
    `    minDays: ${jsNum(c.minDays)},`,
    `    maxDays: ${jsNum(c.maxDays)},`,
    `    notes: ${jsStr(c.notes)}`,
    '  },'
  ].join('\n');
}).join('\n');

const footer = `];

// ============================================================
// 字段说明：
//   culture / nature  人文/自然浓度 1-5
//   cultureTags  人文tag：佛教 古城古建 红色 园林 水乡古镇 文物遗迹 民俗 夜景 都市潮流 赌场 主题乐园
//   natureTags   自然tag：青山 石头山 丹霞山 喀斯特山 雪山 江河湖 草原 盐湖海子 海 沙漠 湿地 森林 瀑布 溶洞 峡谷
//   access       到达方式：有机场火车站 / 仅火车站 / 仅大巴
//   food 美食 1-5 / popularity 小众(1)→大众(5) / vibe 市井(1)→繁华(5)
//   leisure 轻松休闲(1)→劳累辛苦(5)
//   stay 快速打卡(1)→宜久留(5)
//   photo 远离出片(1)→好处片(5)
//   fun 主观好玩指数 1-5（站长体验，仅作参考）
//   cost 消费 1-5 / transit 公交 1-3
//   fromShanghai.hours 上海出发火车时间（小时）
//   minDays / maxDays / notes
// ============================================================
`;

fs.writeFileSync(dataPath, header + body + '\n' + footer, 'utf8');

// —— 补全 geo.js 缺失坐标 ——
const missing = cities.filter(c => !coords[c.name]);
if (missing.length) {
  let appended = 0;
  missing.forEach(c => {
    const areaName = AREA_OVERRIDES[c.name] || c.name;
    let hit = areaLookup[areaName];
    let usedArea = areaName;
    if (!hit) {
      // 行政区名带「市/县」后缀的兜底
      const candidates = [areaName + '市', areaName + '县', areaName + '区'];
      for (const cand of candidates) {
        if (areaLookup[cand]) { hit = areaLookup[cand]; usedArea = cand; break; }
      }
    }
    if (!hit) {
      warnings.push(`${c.name}: 未能在行政区数据中找到坐标，地图上不会显示该点`);
      return;
    }
    coords[c.name] = { lng: hit.lng, lat: hit.lat, area: usedArea };
    appended++;
  });
  if (appended) {
    const geoLines = fs.readFileSync(geoPath, 'utf8').split(/\r?\n/);
    // geo.js 第 2 行是 window.CITY_COORDS = {...};
    for (let i = 0; i < geoLines.length; i++) {
      if (geoLines[i].startsWith('window.CITY_COORDS = ')) {
        geoLines[i] = 'window.CITY_COORDS = ' + JSON.stringify(coords) + ';';
        break;
      }
    }
    fs.writeFileSync(geoPath, geoLines.join('\n'), 'utf8');
  }
  console.log('geo.js 补全坐标：' + appended + ' 座');
}

console.log('生成完成：' + cities.length + ' 座城市');
console.log('新增：' + (added.join('、') || '无'));
console.log('删除：' + (removed.join('、') || '无'));
console.log('\n=== 提示（' + warnings.length + '）===');
warnings.forEach(w => console.log('· ' + w));
