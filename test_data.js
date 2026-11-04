// ============================================================
// 天选之城测试 —— 题库（由 _xlsx_to_test_data.py 从 Excel 生成，请勿手改）
// 数据源：天选之城测试_题库50题.xlsx
// 注意：「停留时间」维度不参与测试，已在转换时剔除
// ============================================================

window.TEST_QUESTIONS = [
  // ---------- A 抵达与第一印象 ----------
  {
    id: "arrive_1",
    group: "A 抵达与第一印象",
    scene: "抵达",
    q: "到一座陌生城市，你最先打开的是哪个 APP？",
    options: [
      { text: "打开大众点评，找找附近吃的", want: { food: 1 }, weight: { food: 2 } },
      { text: "打开小红书/抖音，搜下当地拍照机位", want: { photo: 1 }, weight: { photo: 2 } },
      { text: "打开小红书/地图，搜下周边有什么可逛的", want: {}, weight: {} },
      { text: "什么都不查，出门随便走", want: { popularity: 1, leisure: -1 }, weight: { popularity: 2 } }
    ]
  },
  {
    id: "arrive_2",
    group: "A 抵达与第一印象",
    scene: "抵达",
    q: "下火车第一眼看到这座城市，什么样的画面会让你「哦」一声？",
    options: [
      { text: "一眼望不到头的高楼大厦", want: { popularity: -1, scenery: 1 }, weight: { popularity: 1 } },
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
      { text: "看一座千年古寺、一段城墙", want: { scenery: -1 }, weight: { scenery: 2 } },
      { text: "看一片湖、一座雪山", want: { scenery: 1 }, weight: { scenery: 2 } }
    ]
  },
  {
    id: "scenery_2",
    group: "B 人文 / 自然",
    scene: "景点类型",
    q: "哪个能让你待一整个下午，去博物馆还是去爬山？",
    options: [
      { text: "博物馆，慢慢看文物能看好久", want: { scenery: -1 }, weight: { scenery: 2 } },
      { text: "爬山，爬到腿软也愿意", want: { scenery: 1, leisure: 1 }, weight: { scenery: 2, leisure: 1 } }
    ]
  },
  {
    id: "scenery_3",
    group: "B 人文 / 自然",
    scene: "景点类型",
    q: "如果只能选一种旅行主题，你会选？",
    options: [
      { text: "看历史：遗迹、宗教、民俗", want: { scenery: -1 }, weight: { scenery: 2 } },
      { text: "看风景：山、水、草原、沙漠", want: { scenery: 1 }, weight: { scenery: 2 } }
    ]
  },
  {
    id: "scenery_4",
    group: "B 人文 / 自然",
    scene: "景点类型",
    q: "你更容易被哪种画面打动？",
    options: [
      { text: "巷子深处亮灯的小庙", want: { scenery: -1 }, weight: { scenery: 2 } },
      { text: "城市尽头出现的雪山轮廓", want: { scenery: 1 }, weight: { scenery: 2 } }
    ]
  },

  // ---------- C 美食 ----------
  {
    id: "food_1",
    group: "C 美食",
    scene: "吃饭",
    q: "为了吃当地特色菜，你能接受？",
    options: [
      { text: "排队两小时、打车跨半个城直奔这家店都行", want: { food: 1 }, weight: { food: 2 } },
      { text: "在附近找找有没有这种吃的，不会太折腾", want: { food: 0 }, weight: { food: 2 } },
      { text: "在团购平台就近找一口吃的", want: { food: -1 }, weight: { food: 2 } }
    ]
  },
  {
    id: "food_2",
    group: "C 美食",
    scene: "吃饭",
    q: "旅行结束后，你第一时间会想到什么？",
    options: [
      { text: "巷子里的烟火气和小吃", want: { food: 1 }, weight: { food: 2 } },
      { text: "让人说不出话的美景", want: { food: -1 }, weight: { food: 2 } }
    ]
  },
  {
    id: "food_3",
    group: "C 美食",
    scene: "吃饭",
    q: "要吃饭的时候，你会怎么做？",
    options: [
      { text: "严格按小红书的攻略，打卡当地必吃美食", want: { food: 1, leisure: 1 }, weight: { food: 2, leisure: 1 } },
      { text: "看到路边哪家人多就去哪家", want: { food: 1 }, weight: { food: 1 } },
      { text: "在团购平台就近找一口吃的", want: { food: -1, leisure: -1 }, weight: { food: 2, leisure: 1 } }
    ]
  },
  {
    id: "food_4",
    group: "C 美食",
    scene: "吃饭",
    q: "有个地方没什么吃的，但风景绝了，你还考虑去吗？",
    options: [
      { text: "去，风景好看就行，吃的对付一下", want: { food: -1 }, weight: { food: 2 } },
      { text: "犹豫，吃的不好会很扫兴", want: { food: 1 }, weight: { food: 2 } }
    ]
  },

  // ---------- D 大众 / 小众 ----------
  {
    id: "popularity_1",
    group: "D 大众 / 小众",
    scene: "选目的地",
    q: "做旅行攻略的时候，你会优先看？",
    options: [
      { text: "拥有鼎鼎大名的那几个旅游城市的名字", want: { popularity: -1 }, weight: { popularity: 2 } },
      { text: "去搜一些名字没听过、照片很对味的小城", want: { popularity: 1 }, weight: { popularity: 2 } }
    ]
  },
  {
    id: "popularity_2",
    group: "D 大众 / 小众",
    scene: "选目的地",
    q: "节假日景区全是人，你的感受是？",
    options: [
      { text: "全是人说明来对地方了，人多证明好玩", want: { popularity: -1 }, weight: { popularity: 2 } },
      { text: "理解，忍一下", want: { popularity: 0 }, weight: { popularity: 2 } },
      { text: "想逃到没人知道的地方", want: { popularity: 1 }, weight: { popularity: 2 } }
    ]
  },
  {
    id: "popularity_3",
    group: "D 大众 / 小众",
    scene: "选目的地",
    q: "社交媒体上发布游玩照片后，你最希望评论区说什么？",
    options: [
      { text: "评论都在说“我也去过！”，收获一堆大家拍的照片", want: { popularity: -1 }, weight: { popularity: 2 } },
      { text: "好多人来问“这是哪儿？我怎么没听过”", want: { popularity: 1 }, weight: { popularity: 2 } }
    ]
  },
  {
    id: "popularity_4",
    group: "D 大众 / 小众",
    scene: "选目的地",
    q: "一个地方突然爆火，小红书刷屏了，你会？",
    options: [
      { text: "趁热去去凑凑热闹", want: { popularity: -1 }, weight: { popularity: 2 } },
      { text: "等风头过了再去", want: { popularity: 1 }, weight: { popularity: 2 } }
    ]
  },
  {
    id: "popularity_5",
    group: "D 大众 / 小众",
    scene: "选目的地",
    q: "去一个小县城吃饭，周围一句普通话都听不到，你感觉？",
    options: [
      { text: "有点慌，还是喜欢旅行中受掌控的地方", want: { popularity: -1 }, weight: { popularity: 2 } },
      { text: "这才是我要的旅行的陌生感", want: { popularity: 1 }, weight: { popularity: 2 } }
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
      { text: "不贵，钱就应该花在美食上", want: { cost: 1, food: 1 }, weight: { cost: 2, food: 1 } }
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
    q: "在景区，一杯 40 元的咖啡你会买吗？",
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
    q: "如果需要早上五点起床爬山看日出，你会？",
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
      { text: "排满，每分每秒都要利用起来", want: { leisure: 1 }, weight: { leisure: 2 } },
      { text: "上午一个、下午一个够了", want: { leisure: 0 }, weight: { leisure: 2 } },
      { text: "一天只安排一个行程，剩余时间随缘", want: { leisure: -1 }, weight: { leisure: 2 } }
    ]
  },
  {
    id: "leisure_3",
    group: "F 轻松 / 劳累",
    scene: "体力节奏",
    q: "如果去一个地方要走两万步，你的反应？",
    options: [
      { text: "这才叫旅行，对了对了，冲冲冲", want: { leisure: 1 }, weight: { leisure: 2 } },
      { text: "这已经是能接受的极限了", want: { leisure: 0 }, weight: { leisure: 2 } },
      { text: "第二天就散架了，下次不来了", want: { leisure: -1 }, weight: { leisure: 2 } }
    ]
  },
  {
    id: "leisure_4",
    group: "F 轻松 / 劳累",
    scene: "体力节奏",
    q: "理想的旅行身体状态是？",
    options: [
      { text: "旅行回来比平时还累，但充实就值了", want: { leisure: 1 }, weight: { leisure: 2 } },
      { text: "旅行休闲放松，回来神清气爽", want: { leisure: -1 }, weight: { leisure: 2 } }
    ]
  },
  {
    id: "leisure_5",
    group: "F 轻松 / 劳累",
    scene: "体力节奏",
    q: "你能接受坐好几个小时车只为去一个交通不便的小众秘境吗？",
    options: [
      { text: "会，这太有意思了", want: {}, weight: {} },
      { text: "不会，我接受不了长时间坐车", want: { leisure: -1 }, weight: { leisure: 2 } }
    ]
  },

  // ---------- H 出片度 ----------
  {
    id: "photo_1",
    group: "H 出片度",
    scene: "拍照",
    q: "每次旅行，你的准备是？",
    options: [
      { text: "带好相机，要修图发社交媒体", want: { photo: 1 }, weight: { photo: 2 } },
      { text: "手机随手记录下就行", want: { photo: 0 }, weight: { photo: 2 } },
      { text: "不喜欢拍照，感受景色就行", want: { photo: -1 }, weight: { photo: 2 } }
    ]
  },
  {
    id: "photo_2",
    group: "H 出片度",
    scene: "拍照",
    q: "为了拍一张照片，你愿意？",
    options: [
      { text: "专门等到机位没人的时候，等1个小时也会等", want: { photo: 1, leisure: 1 }, weight: { photo: 2, leisure: 1 } },
      { text: "有人的话可以接受排一小会队", want: { photo: 0 }, weight: { photo: 2 } },
      { text: "不会特意去拍，拍不了就算了", want: { photo: -1, leisure: -1 }, weight: { photo: 2, leisure: 1 } }
    ]
  },
  {
    id: "photo_3",
    group: "H 出片度",
    scene: "拍照",
    q: "看到美景，是赶紧拍照发社交媒体，还是完全沉浸在景色中？",
    options: [
      { text: "还是想发图的，社交媒体被点赞是一种旅行的意义", want: { photo: 1 }, weight: { photo: 2 } },
      { text: "沉浸于景色不想被打扰，那一刻就够了", want: { photo: -1 }, weight: { photo: 2 } }
    ]
  },
  {
    id: "photo_4",
    group: "H 出片度",
    scene: "拍照",
    q: "旅行结束，你第一件事是？",
    options: [
      { text: "导照片、修图、发出去", want: { photo: 1 }, weight: { photo: 2 } },
      { text: "跟朋友讲或记录下路上遇到的事", want: { photo: 0 }, weight: { photo: 1 } },
      { text: "睡一觉，什么都不想", want: { photo: -1 }, weight: { photo: 1 } }
    ]
  },
  {
    id: "photo_5",
    group: "H 出片度",
    scene: "拍照",
    q: "网红打卡机位排着长队，你会去吗？",
    options: [
      { text: "去，来都来了必须拍同款", want: { photo: 1, popularity: -1 }, weight: { photo: 2, popularity: 1 } },
      { text: "会去，但不想排队太久", want: { photo: 0 }, weight: { photo: 2 } },
      { text: "不去，我更想拍自己的视角", want: { photo: -1 }, weight: { photo: 2 } }
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
      { text: "雪山、草原、海子那种辽阔景象", want: {}, weight: {}, tags: ["雪山", "草原", "盐湖海子"] },
      { text: "丹霞、峡谷、溶洞那种奇诡景象", want: {}, weight: {}, tags: ["丹霞山", "峡谷", "溶洞"] },
      { text: "江河湖、瀑布那种湿润景象", want: {}, weight: {}, tags: ["江河湖", "瀑布"] },
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
    q: "特别喜欢去主题乐园？",
    options: [
      { text: "很想，主题乐园必去", want: {}, weight: {}, tags: ["主题乐园"] },
      { text: "只想看夜景和都市潮流", want: {}, weight: {}, tags: ["夜景", "都市潮流"] },
      { text: "都不需要", want: {}, weight: {} }
    ]
  },
];

// —— 测试配置 ——
window.TEST_META = {
  minQuestions: 20,
  maxQuestions: 30,
  // 至少要有这么多个维度有明确倾向，才给出推荐结果
  minActiveDims: 3,
  // 站长体验提示：fun <= 该值时，结果页追加一行委婉说明
  funHintThreshold: 2,
  funHints: {
    mild: "顺带一提，站长本人在那里的体验只是「还行」，也可以多对比两座看看。",
    weak: "小提示：站长对这里的个人感受比较一般，如果更看重游玩体验，不妨再看看备选城市。"
  }
};
