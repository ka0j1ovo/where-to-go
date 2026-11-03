// ============================================================
// 天选之城测试 —— 题库（由 _build_question_db.py 自动生成，请勿手改）
// 数据源：天选之城测试_题库50题.xlsx
// 设计原则：
//   1. 每题各选项的「总权重」必须相等，否则选项多的维度会系统性获胜
//   2. want 为带符号的推力：-1 指向滑条左端，+1 指向右端，0 表示中立
//   3. weight 为题目对该维度的区分度：1 = 一般，2 = 高区分度（界面不显示）
//   4. 全部为生活场景文风，避免「你更看重 X 还是 Y」式的直白问法
// 维度对照（与 app.js 的 DIMENSIONS 一一对应）：
//   scenery 人文/自然 · food 美食 · popularity 大众/小众 · cost 消费
//   leisure 轻松/劳累 · stay 停留时间 · photo 出片度
// 注：站长体验(fun)不参与测试打分，仅作为推荐器的参考维度。
//     fun 的处理方式：不参与计分、不参与硬性排除；
//     若最终推荐城市的站长评分偏低，在结果页追加一行提示说明。
//     判定阈值 fun <= 2（100 座城市中约 24% 落在此区间）。
//     语气要求：委婉、补充说明式，不否定推荐结果、不制造劝退感。
// ============================================================

window.TEST_QUESTIONS = [
  // ---------- A 抵达与第一印象 ----------
  {
    id: "arrive_1",
    group: "A 抵达与第一印象",
    scene: "抵达",
    q: "高铁到站已是下午三点，酒店还没到入住时间，你先干嘛？",
    note: "三选项结构，各维度权重相等",
    options: [
      { text: "拖着箱子就奔老城，先看一眼城墙和牌坊", want: { scenery: -1 }, weight: { scenery: 2 } },
      { text: "找个能望见远处山的咖啡店坐下来", want: { scenery: 1, leisure: -1 }, weight: { scenery: 2 } },
      { text: "问司机哪家馆子最地道，先吃一顿", want: { food: 1 }, weight: { food: 2 } }
    ]
  },
  {
    id: "arrive_2",
    group: "A 抵达与第一印象",
    scene: "抵达",
    q: "到一座陌生城市，你最先打开的是哪个 APP？",
    options: [
      { text: "大众点评/小红书，搜「必吃」", want: { food: 1 }, weight: { food: 2 } },
      { text: "相册/取景器，看看哪里好拍", want: { photo: 1 }, weight: { photo: 2 } },
      { text: "地图，看看周边有什么可逛的", want: { stay: 0 }, weight: { stay: 2 } },
      { text: "什么都不查，出门随便走", want: { popularity: 1, leisure: -1 }, weight: { popularity: 2 } }
    ]
  },
  {
    id: "arrive_3",
    group: "A 抵达与第一印象",
    scene: "抵达",
    q: "下火车第一眼看到这座城市，什么样的画面会让你「哦」一声？",
    options: [
      { text: "一眼望不到头的钢筋森林和霓虹", want: { popularity: -1, scenery: 1 }, weight: { popularity: 1 } },
      { text: "出站就是古镇老街的石板路", want: { scenery: -1 }, weight: { scenery: 2 } },
      { text: "空气里有山和水汽的味道", want: { scenery: 1 }, weight: { scenery: 2 } }
    ]
  },

  // ---------- B 人文 / 自然 ----------
  {
    id: "scenery_1",
    group: "B 人文 / 自然",
    scene: "景点类型",
    q: "行程里只能保留一项，你留哪个？",
    options: [
      { text: "一座千年古寺、一段城墙", want: { scenery: -1 }, weight: { scenery: 2 } },
      { text: "一片湖、一座雪山", want: { scenery: 1 }, weight: { scenery: 2 } }
    ]
  },
  {
    id: "scenery_2",
    group: "B 人文 / 自然",
    scene: "景点类型",
    q: "逛博物馆和逛山，哪个更能让你待一整个下午？",
    options: [
      { text: "博物馆，一件文物能看半小时", want: { scenery: -1, stay: -1 }, weight: { scenery: 2, stay: 1 } },
      { text: "山，走到腿软也愿意", want: { scenery: 1, leisure: 1 }, weight: { scenery: 2, leisure: 1 } }
    ]
  },
  {
    id: "scenery_3",
    group: "B 人文 / 自然",
    scene: "景点类型",
    q: "如果只能选一种旅行主题？",
    options: [
      { text: "看历史：遗迹、宗教、民俗", want: { scenery: -1 }, weight: { scenery: 2 } },
      { text: "看风景：山、水、草原、沙漠", want: { scenery: 1 }, weight: { scenery: 2 } }
    ]
  },
  {
    id: "scenery_4",
    group: "B 人文 / 自然",
    scene: "景点类型",
    q: "在一座城市里，你更容易被哪种画面打动？",
    options: [
      { text: "巷子深处亮灯的小庙、门楣上的匾额", want: { scenery: -1 }, weight: { scenery: 2 } },
      { text: "城市尽头突然出现的雪山轮廓", want: { scenery: 1 }, weight: { scenery: 2 } }
    ]
  },

  // ---------- C 美食 ----------
  {
    id: "food_1",
    group: "C 美食",
    scene: "吃饭",
    q: "为了一顿传说中的本地菜，你能接受？",
    options: [
      { text: "排队两小时、打车跨半个城都行", want: { food: 1 }, weight: { food: 2 } },
      { text: "可以在附近找找，但别太折腾", want: { food: 0 }, weight: { food: 2 } },
      { text: "边走边吃便利店，吃不是重点", want: { food: -1 }, weight: { food: 2 } }
    ]
  },
  {
    id: "food_2",
    group: "C 美食",
    scene: "吃饭",
    q: "旅行结束后，你最可能回忆起什么？",
    options: [
      { text: "那条巷子里的烟火气和小吃", want: { food: 1 }, weight: { food: 2 } },
      { text: "那片让人说不出话的风景", want: { food: -1 }, weight: { food: 2 } }
    ]
  },
  {
    id: "food_3",
    group: "C 美食",
    scene: "吃饭",
    q: "吃饭时间，你希望？",
    options: [
      { text: "严格按攻略打卡必吃榜", want: { food: 1, leisure: 1 }, weight: { food: 2, leisure: 1 } },
      { text: "看到哪家本地人多就进哪家", want: { food: 1 }, weight: { food: 1 } },
      { text: "能吃饱就行，不想为吃发愁", want: { food: -1, leisure: -1 }, weight: { food: 2, leisure: 1 } }
    ]
  },
  {
    id: "food_4",
    group: "C 美食",
    scene: "吃饭",
    q: "一个地方没什么好吃的，但风景绝了，你还去吗？",
    options: [
      { text: "去，风景换不来", want: { food: -1 }, weight: { food: 2 } },
      { text: "犹豫，吃的不好会很扫兴", want: { food: 1 }, weight: { food: 2 } }
    ]
  },

  // ---------- D 大众 / 小众 ----------
  {
    id: "popularity_1",
    group: "D 大众 / 小众",
    scene: "选目的地",
    q: "打开地图挑地方，你会先看？",
    options: [
      { text: "那几个全国人民都去过的名字", want: { popularity: -1 }, weight: { popularity: 2 } },
      { text: "名字都没听过、但照片很对味的小城", want: { popularity: 1 }, weight: { popularity: 2 } }
    ]
  },
  {
    id: "popularity_2",
    group: "D 大众 / 小众",
    scene: "选目的地",
    q: "节假日景区人从众，你的感受是？",
    options: [
      { text: "热闹才叫旅行，人多说明值得", want: { popularity: -1 }, weight: { popularity: 2 } },
      { text: "可以忍，但最好别太夸张", want: { popularity: 0 }, weight: { popularity: 2 } },
      { text: "当场想逃，宁可去没人知道的地方", want: { popularity: 1 }, weight: { popularity: 2 } }
    ]
  },
  {
    id: "popularity_3",
    group: "D 大众 / 小众",
    scene: "选目的地",
    q: "旅行照发出去，你希望评论区出现哪句？",
    options: [
      { text: "「我也去过！」共鸣一片", want: { popularity: -1 }, weight: { popularity: 2 } },
      { text: "「这是哪儿？我怎么没听过」", want: { popularity: 1 }, weight: { popularity: 2 } }
    ]
  },
  {
    id: "popularity_4",
    group: "D 大众 / 小众",
    scene: "选目的地",
    q: "一座城市刚火了，朋友圈刷屏，你会？",
    options: [
      { text: "趁热去，现在最热闹", want: { popularity: -1 }, weight: { popularity: 2 } },
      { text: "等风头过了再去", want: { popularity: 1 }, weight: { popularity: 2 } }
    ]
  },
  {
    id: "popularity_5",
    group: "D 大众 / 小众",
    scene: "选目的地",
    q: "在一个小县城吃饭，周围一句普通话都听不到，你感觉？",
    options: [
      { text: "有点慌，还是想回熟悉的地方", want: { popularity: -1 }, weight: { popularity: 2 } },
      { text: "太好了，这就是我要的旅感", want: { popularity: 1 }, weight: { popularity: 2 } }
    ]
  },

  // ---------- E 消费 ----------
  {
    id: "cost_1",
    group: "E 消费",
    scene: "花钱",
    q: "订酒店时，你的心理价位更接近？",
    options: [
      { text: "能睡就行，把钱省下来玩", want: { cost: -1 }, weight: { cost: 2 } },
      { text: "干净舒适的标准就行", want: { cost: 0 }, weight: { cost: 2 } },
      { text: "住得好一点本身就是旅行的一部分", want: { cost: 1 }, weight: { cost: 2 } }
    ]
  },
  {
    id: "cost_2",
    group: "E 消费",
    scene: "花钱",
    q: "看到当地一份 68 元的特色菜，你会？",
    options: [
      { text: "有点肉疼，找找有没有便宜的替代", want: { cost: -1, food: 0 }, weight: { cost: 2, food: 1 } },
      { text: "来都来了，试试吧", want: { cost: 0, food: 1 }, weight: { cost: 2, food: 1 } },
      { text: "不贵，好东西就该花钱", want: { cost: 1, food: 1 }, weight: { cost: 2, food: 1 } }
    ]
  },
  {
    id: "cost_3",
    group: "E 消费",
    scene: "花钱",
    q: "同样一趟旅行，你更接受哪种？",
    options: [
      { text: "花得少、玩得多，累点也值", want: { cost: -1, leisure: 1 }, weight: { cost: 2, leisure: 2 } },
      { text: "多花点钱，换更从容的体验", want: { cost: 1, leisure: -1 }, weight: { cost: 2, leisure: 2 } }
    ]
  },
  {
    id: "cost_4",
    group: "E 消费",
    scene: "花钱",
    q: "旅行预算的大头，你更愿意花在？",
    options: [
      { text: "住", want: { cost: 1 }, weight: { cost: 2 } },
      { text: "吃", want: { cost: 0, food: 1 }, weight: { cost: 2, food: 1 } },
      { text: "路上交通和门票", want: { cost: -1 }, weight: { cost: 2 } }
    ]
  },
  {
    id: "cost_5",
    group: "E 消费",
    scene: "花钱",
    q: "「这地方有点贵但值得」和「这地方便宜到爽」，你更想听哪句？",
    options: [
      { text: "有点贵但值得", want: { cost: 1 }, weight: { cost: 2 } },
      { text: "便宜到爽", want: { cost: -1 }, weight: { cost: 2 } }
    ]
  },
  {
    id: "cost_6",
    group: "E 消费",
    scene: "花钱",
    q: "在景区门口，一杯 40 元的手冲你会买吗？",
    options: [
      { text: "不买，能找到更划算的", want: { cost: -1 }, weight: { cost: 2 } },
      { text: "看心情，偶尔一次", want: { cost: 0 }, weight: { cost: 2 } },
      { text: "买，旅行就是要享受", want: { cost: 1 }, weight: { cost: 2 } }
    ]
  },

  // ---------- F 轻松 / 劳累 ----------
  {
    id: "leisure_1",
    group: "F 轻松 / 劳累",
    scene: "体力节奏",
    q: "早上六点起床爬山看日出，你？",
    options: [
      { text: "想到就累，我更愿意睡到自然醒", want: { leisure: -1 }, weight: { leisure: 2 } },
      { text: "偶尔一次可以接受", want: { leisure: 0 }, weight: { leisure: 2 } },
      { text: "这正是旅行的意义", want: { leisure: 1 }, weight: { leisure: 2 } }
    ]
  },
  {
    id: "leisure_2",
    group: "F 轻松 / 劳累",
    scene: "体力节奏",
    q: "一天的行程排满还是留白？",
    options: [
      { text: "排满，每分每秒都要利用起来", want: { leisure: 1, stay: 1 }, weight: { leisure: 2, stay: 1 } },
      { text: "上午一个、下午一个，够了", want: { leisure: 0, stay: 0 }, weight: { leisure: 2, stay: 1 } },
      { text: "只安排一件大事，其他随缘", want: { leisure: -1, stay: -1 }, weight: { leisure: 2, stay: 1 } }
    ]
  },
  {
    id: "leisure_3",
    group: "F 轻松 / 劳累",
    scene: "体力节奏",
    q: "一整天走两万步、爬三千级台阶，你的反应？",
    options: [
      { text: "这才叫旅行，来劲", want: { leisure: 1 }, weight: { leisure: 2 } },
      { text: "能接受的极限", want: { leisure: 0 }, weight: { leisure: 2 } },
      { text: "第三天就散架了，下次不来了", want: { leisure: -1 }, weight: { leisure: 2 } }
    ]
  },
  {
    id: "leisure_4",
    group: "F 轻松 / 劳累",
    scene: "体力节奏",
    q: "理想的假期身体状态是？",
    options: [
      { text: "回来比上班还累，但充实", want: { leisure: 1 }, weight: { leisure: 2 } },
      { text: "回来精神焕发", want: { leisure: -1 }, weight: { leisure: 2 } }
    ]
  },
  {
    id: "leisure_5",
    group: "F 轻松 / 劳累",
    scene: "体力节奏",
    q: "景区有索道，但你得排队一小时，而徒步上去要两小时，你选？",
    options: [
      { text: "徒步，路上风景也是景", want: { leisure: 1 }, weight: { leisure: 2 } },
      { text: "排队坐索道", want: { leisure: -1 }, weight: { leisure: 2 } }
    ]
  },

  // ---------- G 停留时间 ----------
  {
    id: "stay_1",
    group: "G 停留时间",
    scene: "行程长度",
    q: "理想的两天旅行，你希望？",
    options: [
      { text: "把两三处都逛遍，拍完打卡回家", want: { stay: 1 }, weight: { stay: 2 } },
      { text: "找一处停下来，待够本再走", want: { stay: -1 }, weight: { stay: 2 } }
    ]
  },
  {
    id: "stay_2",
    group: "G 停留时间",
    scene: "行程长度",
    q: "旅行结束时你最容易觉得？",
    options: [
      { text: "「还有一半地方没去，好可惜」", want: { stay: 1 }, weight: { stay: 2 } },
      { text: "「还想再待几天，还没待够」", want: { stay: -1 }, weight: { stay: 2 } }
    ]
  },
  {
    id: "stay_3",
    group: "G 停留时间",
    scene: "行程长度",
    q: "只剩一个周末，你的第一反应？",
    options: [
      { text: "周边找个地方，两天认真看完几处", want: { stay: 1, popularity: 1 }, weight: { stay: 2, popularity: 1 } },
      { text: "找个能待住的地方，睡饱再回", want: { stay: -1, leisure: -1 }, weight: { stay: 2, leisure: 1 } }
    ]
  },
  {
    id: "stay_4",
    group: "G 停留时间",
    scene: "行程长度",
    q: "同一座城市，你更想？",
    options: [
      { text: "去一次，把该看的都看完", want: { stay: 1 }, weight: { stay: 2 } },
      { text: "去很多次，每次只逛一点点", want: { stay: -1 }, weight: { stay: 2 } }
    ]
  },
  {
    id: "stay_5",
    group: "G 停留时间",
    scene: "行程长度",
    q: "一座城市能让你待够多久才算「玩明白了」？",
    options: [
      { text: "一两天，打卡完就走", want: { stay: 1 }, weight: { stay: 2 } },
      { text: "三四天，刚好", want: { stay: 0 }, weight: { stay: 2 } },
      { text: "一周以上，慢慢泡进去", want: { stay: -1 }, weight: { stay: 2 } }
    ]
  },
  {
    id: "stay_6",
    group: "G 停留时间",
    scene: "行程长度",
    q: "在同一个城市待第三天，你通常？",
    options: [
      { text: "有点腻了，想换个地方", want: { stay: 1, popularity: -1 }, weight: { stay: 2, popularity: 1 } },
      { text: "刚进入状态，还有好多想去没去", want: { stay: -1 }, weight: { stay: 2 } }
    ]
  },

  // ---------- H 出片度 ----------
  {
    id: "photo_1",
    group: "H 出片度",
    scene: "拍照",
    q: "这次旅行你带的东西？",
    options: [
      { text: "设备齐全，回来要修图发九宫格", want: { photo: 1 }, weight: { photo: 2 } },
      { text: "手机随手拍拍就行", want: { photo: 0 }, weight: { photo: 2 } },
      { text: "几乎不拍，用眼睛记住就好", want: { photo: -1 }, weight: { photo: 2 } }
    ]
  },
  {
    id: "photo_2",
    group: "H 出片度",
    scene: "拍照",
    q: "一个地方很美但完全拍不出片，你去吗？",
    options: [
      { text: "去，好看和能拍是两码事", want: { photo: -1 }, weight: { photo: 2 } },
      { text: "会犹豫，可能就不去了", want: { photo: 1 }, weight: { photo: 2 } }
    ]
  },
  {
    id: "photo_3",
    group: "H 出片度",
    scene: "拍照",
    q: "为了拍一张照片，你愿意？",
    options: [
      { text: "凌晨四点起来等光线", want: { photo: 1, leisure: 1 }, weight: { photo: 2, leisure: 1 } },
      { text: "排队半小时可以接受", want: { photo: 0 }, weight: { photo: 2 } },
      { text: "绝不，拍不好就算了", want: { photo: -1, leisure: -1 }, weight: { photo: 2, leisure: 1 } }
    ]
  },
  {
    id: "photo_4",
    group: "H 出片度",
    scene: "拍照",
    q: "朋友圈九宫格 vs 一口气看完的震撼，你选？",
    options: [
      { text: "九宫格，被点赞也是一种满足", want: { photo: 1 }, weight: { photo: 2 } },
      { text: "震撼，那一刻就够了", want: { photo: -1 }, weight: { photo: 2 } }
    ]
  },
  {
    id: "photo_5",
    group: "H 出片度",
    scene: "拍照",
    q: "旅行回来，你第一件事是？",
    options: [
      { text: "导照片、修图、发出去", want: { photo: 1 }, weight: { photo: 2 } },
      { text: "跟朋友讲路上遇到的事", want: { photo: 0 }, weight: { photo: 1 } },
      { text: "睡一觉，什么都不想", want: { photo: -1 }, weight: { photo: 1 } }
    ]
  },
  {
    id: "photo_6",
    group: "H 出片度",
    scene: "拍照",
    q: "「网红机位」排着长队，你会去吗？",
    options: [
      { text: "去，来都来了必须拍同款", want: { photo: 1, popularity: -1 }, weight: { photo: 2, popularity: 1 } },
      { text: "会去，但不想排队太久", want: { photo: 0 }, weight: { photo: 2 } },
      { text: "不去，我更想拍自己的视角", want: { photo: -1 }, weight: { photo: 2 } }
    ]
  },

  // ---------- J 取舍冲突题 ----------
  {
    id: "tradeoff_1",
    group: "J 取舍冲突题",
    scene: "取舍",
    q: "美食多但完全拍不出片 vs 随手都是大片但吃得很普通，选哪个？",
    note: "冲突题：两边都打 2 权重，用来拉开区分度",
    options: [
      { text: "宁可吃好，照片无所谓", want: { food: 1, photo: -1 }, weight: { food: 2, photo: 2 } },
      { text: "宁可拍好，吃差点没关系", want: { food: -1, photo: 1 }, weight: { food: 2, photo: 2 } }
    ]
  },
  {
    id: "tradeoff_2",
    group: "J 取舍冲突题",
    scene: "取舍",
    q: "慢节奏但没那么好玩 vs 好玩刺激但一路折腾，选哪个？",
    options: [
      { text: "慢一点，舒服最重要", want: { leisure: -1, stay: -1 }, weight: { leisure: 2, stay: 2 } },
      { text: "折腾也值，要的就是体验", want: { leisure: 1, stay: 1 }, weight: { leisure: 2, stay: 2 } }
    ]
  },
  {
    id: "tradeoff_3",
    group: "J 取舍冲突题",
    scene: "取舍",
    q: "小众秘境但要折腾 vs 大众热门但省心，选哪个？",
    options: [
      { text: "折腾我也要去小众的", want: { popularity: 1, leisure: 1 }, weight: { popularity: 2, leisure: 2 } },
      { text: "省心更重要，去热门的", want: { popularity: -1, leisure: -1 }, weight: { popularity: 2, leisure: 2 } }
    ]
  },
  {
    id: "tradeoff_4",
    group: "J 取舍冲突题",
    scene: "取舍",
    q: "人文底蕴拉满但城市很旧 vs 现代方便但没什么故事，选哪个？",
    options: [
      { text: "宁可旧，有故事才值得", want: { scenery: -1, popularity: 1 }, weight: { scenery: 2, popularity: 2 } },
      { text: "宁可新，住得舒服更重要", want: { scenery: 1, popularity: -1 }, weight: { scenery: 2, popularity: 2 } }
    ]
  },

  // ---------- K 景点类型 tag 题 ----------
  {
    id: "tag_1",
    group: "K 景点类型 tag 题",
    scene: "想看什么",
    q: "翻相册，你最想多看几眼的风景是？",
    note: "tag 题不推维度，只选景点类型",
    options: [
      { text: "雪山、草原、海子那种辽阔", want: {}, weight: {}, tags: ["雪山", "草原", "盐湖海子"] },
      { text: "丹霞、峡谷、溶洞那种奇诡", want: {}, weight: {}, tags: ["丹霞山", "峡谷", "溶洞"] },
      { text: "江河湖、瀑布那种湿润", want: {}, weight: {}, tags: ["江河湖", "瀑布"] },
      { text: "随便什么自然都行", want: {}, weight: {} }
    ]
  },
  {
    id: "tag_2",
    group: "K 景点类型 tag 题",
    scene: "想看什么",
    q: "城市里，你更容易被什么打动？",
    options: [
      { text: "古城古建、文物遗迹", want: { scenery: -1 }, weight: { scenery: 1 }, tags: ["古城古建", "文物遗迹"] },
      { text: "园林、水乡古镇", want: { scenery: -1 }, weight: { scenery: 1 }, tags: ["园林", "水乡古镇"] },
      { text: "民俗、宗教文化", want: { scenery: -1 }, weight: { scenery: 1 }, tags: ["民俗", "佛教"] },
      { text: "夜景、都市潮流、主题乐园", want: { scenery: 1 }, weight: { scenery: 1 }, tags: ["夜景", "都市潮流", "主题乐园"] }
    ]
  },
  {
    id: "tag_3",
    group: "K 景点类型 tag 题",
    scene: "想看什么",
    q: "一定要在海边还是山里？",
    options: [
      { text: "想听海", want: {}, weight: {}, tags: ["海"] },
      { text: "想进山", want: {}, weight: {}, tags: ["青山", "石头山", "喀斯特山"] },
      { text: "湿地、森林、沙漠也行", want: {}, weight: {}, tags: ["湿地", "森林", "沙漠"] },
      { text: "无所谓", want: {}, weight: {} }
    ]
  },
  {
    id: "tag_4",
    group: "K 景点类型 tag 题",
    scene: "想看什么",
    q: "你更喜欢哪种「高处」？",
    options: [
      { text: "雪山之巅的冰川", want: {}, weight: {}, tags: ["雪山"] },
      { text: "丹霞赤壁的日落", want: {}, weight: {}, tags: ["丹霞山"] },
      { text: "喀斯特峰林的云雾", want: {}, weight: {}, tags: ["喀斯特山"] },
      { text: "普通青山的徒步道", want: {}, weight: {}, tags: ["青山"] }
    ]
  },
  {
    id: "tag_5",
    group: "K 景点类型 tag 题",
    scene: "想看什么",
    q: "古城 vs 红色景区，哪个更有吸引力？",
    options: [
      { text: "古城古建、老街区", want: {}, weight: {}, tags: ["古城古建"] },
      { text: "革命旧址、红色遗迹", want: {}, weight: {}, tags: ["红色"] },
      { text: "都一般", want: {}, weight: {} }
    ]
  },
  {
    id: "tag_6",
    group: "K 景点类型 tag 题",
    scene: "想看什么",
    q: "宗教人文类，你更想去看？",
    options: [
      { text: "佛教寺庙、石窟", want: {}, weight: {}, tags: ["佛教"] },
      { text: "少数民族民俗、节庆", want: {}, weight: {}, tags: ["民俗"] },
      { text: "都不太感冒", want: {}, weight: {} }
    ]
  },
  {
    id: "tag_7",
    group: "K 景点类型 tag 题",
    scene: "想看什么",
    q: "想不想去主题乐园/赌场这类地方？",
    options: [
      { text: "很想，主题乐园必去", want: {}, weight: {}, tags: ["主题乐园"] },
      { text: "有赌场更热闹", want: {}, weight: {}, tags: ["赌场"] },
      { text: "只想看夜景和都市潮流", want: {}, weight: {}, tags: ["夜景", "都市潮流"] },
      { text: "都不需要", want: {}, weight: {} }
    ]
  }
];

// —— 测试配置 ——
window.TEST_META = {
  // 每套模板的题目数区间
  minQuestions: 20,
  maxQuestions: 30,

  // 站长体验提示：fun <= 该值时，结果页追加一行委婉说明
  funHintThreshold: 2,

  // 提示文案：委婉、补充式，按 fun 强度分两档
  funHints: {
    mild: "顺带一提，站长本人在那里的体验只是「还行」，也可以多对比两座看看。",
    weak: "小提示：站长对这里的个人感受比较一般，如果更看重游玩体验，不妨再看看备选城市。"
  }
};
