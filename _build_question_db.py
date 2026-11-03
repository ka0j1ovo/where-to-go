# -*- coding: utf-8 -*-
"""
生成《天选之城测试》题库 Excel —— 50 道题，按维度分组标色，供人工删改
"""
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

# ---------------------------------------------------------------
# 题目数据
# 每题: (分组, 题干, [选项...], 备注)
# 选项: (文案, want, weight, tags)
#   want   -1=滑条左端 +1=滑条右端 0=中立
#   weight 该选项涉及的维度权重 {维度: 1|2}
#   tags   该选项对应的城市标签列表，None=不限
# ---------------------------------------------------------------

GROUPS = [
    # (分组名, 建议保留道数, 填充色)
    ("A 抵达与第一印象", 2, "DDEBF7"),
    ("B 人文 / 自然", 4, "E2EFDA"),
    ("C 美食", 3, "FFF2CC"),
    ("D 大众 / 小众", 3, "FCE4D6"),
    ("E 消费", 3, "F8CBAD"),
    ("F 轻松 / 劳累", 4, "E4DFEC"),
    ("G 停留时间", 3, "D9E1F2"),
    ("H 出片度", 3, "DEEAF6"),
    ("J 取舍冲突题", 3, "FBE5D6"),
    ("K 景点类型 tag 题", 5, "EDEDED"),
]

QUESTIONS = []

def Q(group, text, options, note=""):
    QUESTIONS.append((group, text, options, note))

def opt(text, want=None, weight=None, tags=None):
    return {"text": text, "want": want or {}, "weight": weight or {}, "tags": tags}

# ============ A 抵达与第一印象（3 道）============
Q("A 抵达与第一印象",
  "高铁到站已是下午三点，酒店还没到入住时间，你先干嘛？",
  [
    opt("拖着箱子就奔老城，先看一眼城墙和牌坊", {"scenery": -1}, {"scenery": 2}),
    opt("找个能望见远处山的咖啡店坐下来", {"scenery": 1, "leisure": -1}, {"scenery": 2}),
    opt("问司机哪家馆子最地道，先吃一顿", {"food": 1}, {"food": 2}),
  ], "三选项结构，各维度权重相等")

Q("A 抵达与第一印象",
  "到一座陌生城市，你最先打开的是哪个 APP？",
  [
    opt("大众点评/小红书，搜「必吃」", {"food": 1}, {"food": 2}),
    opt("相册/取景器，看看哪里好拍", {"photo": 1}, {"photo": 2}),
    opt("地图，看看周边有什么可逛的", {"stay": 0}, {"stay": 2}),
    opt("什么都不查，出门随便走", {"popularity": 1, "leisure": -1}, {"popularity": 2}),
  ])

Q("A 抵达与第一印象",
  "下火车第一眼看到这座城市，什么样的画面会让你「哦」一声？",
  [
    opt("一眼望不到头的钢筋森林和霓虹", {"popularity": -1, "scenery": 1}, {"popularity": 1}),
    opt("出站就是古镇老街的石板路", {"scenery": -1}, {"scenery": 2}),
    opt("空气里有山和水汽的味道", {"scenery": 1}, {"scenery": 2}),
  ])

# ============ B 人文 / 自然（6 道）============
Q("B 人文 / 自然",
  "行程里只能保留一项，你留哪个？",
  [
    opt("一座千年古寺、一段城墙", {"scenery": -1}, {"scenery": 2}),
    opt("一片湖、一座雪山", {"scenery": 1}, {"scenery": 2}),
  ])

Q("B 人文 / 自然",
  "逛博物馆和逛山，哪个更能让你待一整个下午？",
  [
    opt("博物馆，一件文物能看半小时", {"scenery": -1, "stay": -1}, {"scenery": 2, "stay": 1}),
    opt("山，走到腿软也愿意", {"scenery": 1, "leisure": 1}, {"scenery": 2, "leisure": 1}),
  ])

Q("B 人文 / 自然",
  "如果只能选一种旅行主题？",
  [
    opt("看历史：遗迹、宗教、民俗", {"scenery": -1}, {"scenery": 2}),
    opt("看风景：山、水、草原、沙漠", {"scenery": 1}, {"scenery": 2}),
  ])

Q("B 人文 / 自然",
  "在一座城市里，你更容易被哪种画面打动？",
  [
    opt("巷子深处亮灯的小庙、门楣上的匾额", {"scenery": -1}, {"scenery": 2}),
    opt("城市尽头突然出现的雪山轮廓", {"scenery": 1}, {"scenery": 2}),
  ])

# ============ C 美食（5 道）============
Q("C 美食",
  "为了一顿传说中的本地菜，你能接受？",
  [
    opt("排队两小时、打车跨半个城都行", {"food": 1}, {"food": 2}),
    opt("可以在附近找找，但别太折腾", {"food": 0}, {"food": 2}),
    opt("边走边吃便利店，吃不是重点", {"food": -1}, {"food": 2}),
  ])

Q("C 美食",
  "旅行结束后，你最可能回忆起什么？",
  [
    opt("那条巷子里的烟火气和小吃", {"food": 1}, {"food": 2}),
    opt("那片让人说不出话的风景", {"food": -1}, {"food": 2}),
  ])

Q("C 美食",
  "吃饭时间，你希望？",
  [
    opt("严格按攻略打卡必吃榜", {"food": 1, "leisure": 1}, {"food": 2, "leisure": 1}),
    opt("看到哪家本地人多就进哪家", {"food": 1}, {"food": 1}),
    opt("能吃饱就行，不想为吃发愁", {"food": -1, "leisure": -1}, {"food": 2, "leisure": 1}),
  ])

Q("C 美食",
  "一个地方没什么好吃的，但风景绝了，你还去吗？",
  [
    opt("去，风景换不来", {"food": -1}, {"food": 2}),
    opt("犹豫，吃的不好会很扫兴", {"food": 1}, {"food": 2}),
  ])

# ============ D 大众 / 小众（6 道）============
Q("D 大众 / 小众",
  "打开地图挑地方，你会先看？",
  [
    opt("那几个全国人民都去过的名字", {"popularity": -1}, {"popularity": 2}),
    opt("名字都没听过、但照片很对味的小城", {"popularity": 1}, {"popularity": 2}),
  ])

Q("D 大众 / 小众",
  "节假日景区人从众，你的感受是？",
  [
    opt("热闹才叫旅行，人多说明值得", {"popularity": -1}, {"popularity": 2}),
    opt("可以忍，但最好别太夸张", {"popularity": 0}, {"popularity": 2}),
    opt("当场想逃，宁可去没人知道的地方", {"popularity": 1}, {"popularity": 2}),
  ])

Q("D 大众 / 小众",
  "旅行照发出去，你希望评论区出现哪句？",
  [
    opt("「我也去过！」共鸣一片", {"popularity": -1}, {"popularity": 2}),
    opt("「这是哪儿？我怎么没听过」", {"popularity": 1}, {"popularity": 2}),
  ])

Q("D 大众 / 小众",
  "一座城市刚火了，朋友圈刷屏，你会？",
  [
    opt("趁热去，现在最热闹", {"popularity": -1}, {"popularity": 2}),
    opt("等风头过了再去", {"popularity": 1}, {"popularity": 2}),
  ])

Q("D 大众 / 小众",
  "在一个小县城吃饭，周围一句普通话都听不到，你感觉？",
  [
    opt("有点慌，还是想回熟悉的地方", {"popularity": -1}, {"popularity": 2}),
    opt("太好了，这就是我要的旅感", {"popularity": 1}, {"popularity": 2}),
  ])

# ============ E 消费（5 道）============
Q("E 消费",
  "订酒店时，你的心理价位更接近？",
  [
    opt("能睡就行，把钱省下来玩", {"cost": -1}, {"cost": 2}),
    opt("干净舒适的标准就行", {"cost": 0}, {"cost": 2}),
    opt("住得好一点本身就是旅行的一部分", {"cost": 1}, {"cost": 2}),
  ])

Q("E 消费",
  "看到当地一份 68 元的特色菜，你会？",
  [
    opt("有点肉疼，找找有没有便宜的替代", {"cost": -1, "food": 0}, {"cost": 2, "food": 1}),
    opt("来都来了，试试吧", {"cost": 0, "food": 1}, {"cost": 2, "food": 1}),
    opt("不贵，好东西就该花钱", {"cost": 1, "food": 1}, {"cost": 2, "food": 1}),
  ])

Q("E 消费",
  "同样一趟旅行，你更接受哪种？",
  [
    opt("花得少、玩得多，累点也值", {"cost": -1, "leisure": 1}, {"cost": 2, "leisure": 2}),
    opt("多花点钱，换更从容的体验", {"cost": 1, "leisure": -1}, {"cost": 2, "leisure": 2}),
  ])

Q("E 消费",
  "旅行预算的大头，你更愿意花在？",
  [
    opt("住", {"cost": 1}, {"cost": 2}),
    opt("吃", {"cost": 0, "food": 1}, {"cost": 2, "food": 1}),
    opt("路上交通和门票", {"cost": -1}, {"cost": 2}),
  ])

Q("E 消费",
  "「这地方有点贵但值得」和「这地方便宜到爽」，你更想听哪句？",
  [
    opt("有点贵但值得", {"cost": 1}, {"cost": 2}),
    opt("便宜到爽", {"cost": -1}, {"cost": 2}),
  ])

Q("E 消费",
  "在景区门口，一杯 40 元的手冲你会买吗？",
  [
    opt("不买，能找到更划算的", {"cost": -1}, {"cost": 2}),
    opt("看心情，偶尔一次", {"cost": 0}, {"cost": 2}),
    opt("买，旅行就是要享受", {"cost": 1}, {"cost": 2}),
  ])

# ============ F 轻松 / 劳累（6 道）============
Q("F 轻松 / 劳累",
  "早上六点起床爬山看日出，你？",
  [
    opt("想到就累，我更愿意睡到自然醒", {"leisure": -1}, {"leisure": 2}),
    opt("偶尔一次可以接受", {"leisure": 0}, {"leisure": 2}),
    opt("这正是旅行的意义", {"leisure": 1}, {"leisure": 2}),
  ])

Q("F 轻松 / 劳累",
  "一天的行程排满还是留白？",
  [
    opt("排满，每分每秒都要利用起来", {"leisure": 1, "stay": 1}, {"leisure": 2, "stay": 1}),
    opt("上午一个、下午一个，够了", {"leisure": 0, "stay": 0}, {"leisure": 2, "stay": 1}),
    opt("只安排一件大事，其他随缘", {"leisure": -1, "stay": -1}, {"leisure": 2, "stay": 1}),
  ])

Q("F 轻松 / 劳累",
  "一整天走两万步、爬三千级台阶，你的反应？",
  [
    opt("这才叫旅行，来劲", {"leisure": 1}, {"leisure": 2}),
    opt("能接受的极限", {"leisure": 0}, {"leisure": 2}),
    opt("第三天就散架了，下次不来了", {"leisure": -1}, {"leisure": 2}),
  ])

Q("F 轻松 / 劳累",
  "理想的假期身体状态是？",
  [
    opt("回来比上班还累，但充实", {"leisure": 1}, {"leisure": 2}),
    opt("回来精神焕发", {"leisure": -1}, {"leisure": 2}),
  ])

Q("F 轻松 / 劳累",
  "景区有索道，但你得排队一小时，而徒步上去要两小时，你选？",
  [
    opt("徒步，路上风景也是景", {"leisure": 1}, {"leisure": 2}),
    opt("排队坐索道", {"leisure": -1}, {"leisure": 2}),
  ])

# ============ G 停留时间（5 道）============
Q("G 停留时间",
  "理想的两天旅行，你希望？",
  [
    opt("把两三处都逛遍，拍完打卡回家", {"stay": 1}, {"stay": 2}),
    opt("找一处停下来，待够本再走", {"stay": -1}, {"stay": 2}),
  ])

Q("G 停留时间",
  "旅行结束时你最容易觉得？",
  [
    opt("「还有一半地方没去，好可惜」", {"stay": 1}, {"stay": 2}),
    opt("「还想再待几天，还没待够」", {"stay": -1}, {"stay": 2}),
  ])

Q("G 停留时间",
  "只剩一个周末，你的第一反应？",
  [
    opt("周边找个地方，两天认真看完几处", {"stay": 1, "popularity": 1}, {"stay": 2, "popularity": 1}),
    opt("找个能待住的地方，睡饱再回", {"stay": -1, "leisure": -1}, {"stay": 2, "leisure": 1}),
  ])

Q("G 停留时间",
  "同一座城市，你更想？",
  [
    opt("去一次，把该看的都看完", {"stay": 1}, {"stay": 2}),
    opt("去很多次，每次只逛一点点", {"stay": -1}, {"stay": 2}),
  ])

Q("G 停留时间",
  "一座城市能让你待够多久才算「玩明白了」？",
  [
    opt("一两天，打卡完就走", {"stay": 1}, {"stay": 2}),
    opt("三四天，刚好", {"stay": 0}, {"stay": 2}),
    opt("一周以上，慢慢泡进去", {"stay": -1}, {"stay": 2}),
  ])

Q("G 停留时间",
  "在同一个城市待第三天，你通常？",
  [
    opt("有点腻了，想换个地方", {"stay": 1, "popularity": -1}, {"stay": 2, "popularity": 1}),
    opt("刚进入状态，还有好多想去没去", {"stay": -1}, {"stay": 2}),
  ])

# ============ H 出片度（5 道）============
Q("H 出片度",
  "这次旅行你带的东西？",
  [
    opt("设备齐全，回来要修图发九宫格", {"photo": 1}, {"photo": 2}),
    opt("手机随手拍拍就行", {"photo": 0}, {"photo": 2}),
    opt("几乎不拍，用眼睛记住就好", {"photo": -1}, {"photo": 2}),
  ])

Q("H 出片度",
  "一个地方很美但完全拍不出片，你去吗？",
  [
    opt("去，好看和能拍是两码事", {"photo": -1}, {"photo": 2}),
    opt("会犹豫，可能就不去了", {"photo": 1}, {"photo": 2}),
  ])

Q("H 出片度",
  "为了拍一张照片，你愿意？",
  [
    opt("凌晨四点起来等光线", {"photo": 1, "leisure": 1}, {"photo": 2, "leisure": 1}),
    opt("排队半小时可以接受", {"photo": 0}, {"photo": 2}),
    opt("绝不，拍不好就算了", {"photo": -1, "leisure": -1}, {"photo": 2, "leisure": 1}),
  ])

Q("H 出片度",
  "朋友圈九宫格 vs 一口气看完的震撼，你选？",
  [
    opt("九宫格，被点赞也是一种满足", {"photo": 1}, {"photo": 2}),
    opt("震撼，那一刻就够了", {"photo": -1}, {"photo": 2}),
  ])

Q("H 出片度",
  "旅行回来，你第一件事是？",
  [
    opt("导照片、修图、发出去", {"photo": 1}, {"photo": 2}),
    opt("跟朋友讲路上遇到的事", {"photo": 0}, {"photo": 1}),
    opt("睡一觉，什么都不想", {"photo": -1}, {"photo": 1}),
  ])

Q("H 出片度",
  "「网红机位」排着长队，你会去吗？",
  [
    opt("去，来都来了必须拍同款", {"photo": 1, "popularity": -1}, {"photo": 2, "popularity": 1}),
    opt("会去，但不想排队太久", {"photo": 0}, {"photo": 2}),
    opt("不去，我更想拍自己的视角", {"photo": -1}, {"photo": 2}),
  ])

# ============ J 取舍冲突题（3 道）============
Q("J 取舍冲突题",
  "美食多但完全拍不出片 vs 随手都是大片但吃得很普通，选哪个？",
  [
    opt("宁可吃好，照片无所谓", {"food": 1, "photo": -1}, {"food": 2, "photo": 2}),
    opt("宁可拍好，吃差点没关系", {"food": -1, "photo": 1}, {"food": 2, "photo": 2}),
  ], "冲突题：两边都打 2 权重，用来拉开区分度")

Q("J 取舍冲突题",
  "慢节奏但没那么好玩 vs 好玩刺激但一路折腾，选哪个？",
  [
    opt("慢一点，舒服最重要", {"leisure": -1, "stay": -1}, {"leisure": 2, "stay": 2}),
    opt("折腾也值，要的就是体验", {"leisure": 1, "stay": 1}, {"leisure": 2, "stay": 2}),
  ])

Q("J 取舍冲突题",
  "小众秘境但要折腾 vs 大众热门但省心，选哪个？",
  [
    opt("折腾我也要去小众的", {"popularity": 1, "leisure": 1}, {"popularity": 2, "leisure": 2}),
    opt("省心更重要，去热门的", {"popularity": -1, "leisure": -1}, {"popularity": 2, "leisure": 2}),
  ])

Q("J 取舍冲突题",
  "人文底蕴拉满但城市很旧 vs 现代方便但没什么故事，选哪个？",
  [
    opt("宁可旧，有故事才值得", {"scenery": -1, "popularity": 1}, {"scenery": 2, "popularity": 2}),
    opt("宁可新，住得舒服更重要", {"scenery": 1, "popularity": -1}, {"scenery": 2, "popularity": 2}),
  ])

# ============ K 景点类型 tag 题（8 道）============
Q("K 景点类型 tag 题",
  "翻相册，你最想多看几眼的风景是？",
  [
    opt("雪山、草原、海子那种辽阔", None, None, ["雪山", "草原", "盐湖海子"]),
    opt("丹霞、峡谷、溶洞那种奇诡", None, None, ["丹霞山", "峡谷", "溶洞"]),
    opt("江河湖、瀑布那种湿润", None, None, ["江河湖", "瀑布"]),
    opt("随便什么自然都行", None, None, None),
  ], "tag 题不推维度，只选景点类型")

Q("K 景点类型 tag 题",
  "城市里，你更容易被什么打动？",
  [
    opt("古城古建、文物遗迹", {"scenery": -1}, {"scenery": 1}, ["古城古建", "文物遗迹"]),
    opt("园林、水乡古镇", {"scenery": -1}, {"scenery": 1}, ["园林", "水乡古镇"]),
    opt("民俗、宗教文化", {"scenery": -1}, {"scenery": 1}, ["民俗", "佛教"]),
    opt("夜景、都市潮流、主题乐园", {"scenery": 1}, {"scenery": 1}, ["夜景", "都市潮流", "主题乐园"]),
  ])

Q("K 景点类型 tag 题",
  "一定要在海边还是山里？",
  [
    opt("想听海", None, None, ["海"]),
    opt("想进山", None, None, ["青山", "石头山", "喀斯特山"]),
    opt("湿地、森林、沙漠也行", None, None, ["湿地", "森林", "沙漠"]),
    opt("无所谓", None, None, None),
  ])

Q("K 景点类型 tag 题",
  "你更喜欢哪种「高处」？",
  [
    opt("雪山之巅的冰川", None, None, ["雪山"]),
    opt("丹霞赤壁的日落", None, None, ["丹霞山"]),
    opt("喀斯特峰林的云雾", None, None, ["喀斯特山"]),
    opt("普通青山的徒步道", None, None, ["青山"]),
  ])

Q("K 景点类型 tag 题",
  "古城 vs 红色景区，哪个更有吸引力？",
  [
    opt("古城古建、老街区", None, None, ["古城古建"]),
    opt("革命旧址、红色遗迹", None, None, ["红色"]),
    opt("都一般", None, None, None),
  ])

Q("K 景点类型 tag 题",
  "宗教人文类，你更想去看？",
  [
    opt("佛教寺庙、石窟", None, None, ["佛教"]),
    opt("少数民族民俗、节庆", None, None, ["民俗"]),
    opt("都不太感冒", None, None, None),
  ])

Q("K 景点类型 tag 题",
  "想不想去主题乐园/赌场这类地方？",
  [
    opt("很想，主题乐园必去", None, None, ["主题乐园"]),
    opt("有赌场更热闹", None, None, ["赌场"]),
    opt("只想看夜景和都市潮流", None, None, ["夜景", "都市潮流"]),
    opt("都不需要", None, None, None),
  ])

# ---------------------------------------------------------------
# 写出 Excel
# ---------------------------------------------------------------
DIMS = ["scenery", "food", "popularity", "cost", "leisure", "stay", "photo"]
DIM_CN = {
    "scenery": "人文/自然", "food": "美食", "popularity": "大众/小众",
    "cost": "消费", "leisure": "轻松/劳累", "stay": "停留时间",
    "photo": "出片度",
}

wb = Workbook()

# ---------- Sheet 1: 题库 ----------
ws = wb.active
ws.title = "题库"

headers = ["保留?", "分组", "题号", "题干", "选项", "指向维度及其方向", "维度权重", "对应标签", "备注"]
ws.append(headers)

thin = Side(style="thin", color="BFBFBF")
border = Border(left=thin, right=thin, top=thin, bottom=thin)

hdr_fill = PatternFill("solid", fgColor="1F4E78")
for c in range(1, len(headers) + 1):
    cell = ws.cell(row=1, column=c)
    cell.font = Font(bold=True, color="FFFFFF", size=11)
    cell.fill = hdr_fill
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    cell.border = border
ws.row_dimensions[1].height = 30

group_fill = {g[0]: g[2] for g in GROUPS}

def fmt_want(want):
    if not want:
        return ""
    parts = []
    for k, v in want.items():
        arrow = "←左端" if v == -1 else ("→右端" if v == 1 else "·中立")
        parts.append(f"{DIM_CN.get(k, k)}{arrow}")
    return " / ".join(parts)

def fmt_weight(weight):
    if not weight:
        return ""
    return " / ".join(f"{DIM_CN.get(k, k)}×{v}" for k, v in weight.items())

row = 2
for group, text, options, note in QUESTIONS:
    fill = PatternFill("solid", fgColor=group_fill[group])
    start = row
    for i, o in enumerate(options):
        ws.cell(row=row, column=1, value="").alignment = Alignment(horizontal="center")
        ws.cell(row=row, column=2, value=group)
        ws.cell(row=row, column=3, value=f"Q{start - 1:02d}")
        ws.cell(row=row, column=4, value=text)
        ws.cell(row=row, column=5, value=f"{chr(65 + i)}. {o['text']}")
        ws.cell(row=row, column=6, value=fmt_want(o["want"]))
        ws.cell(row=row, column=7, value=fmt_weight(o["weight"]))
        ws.cell(row=row, column=8, value="、".join(o["tags"]) if o["tags"] else ("" if o["tags"] is None else ""))
        ws.cell(row=row, column=9, value=note if i == 0 else "")
        for c in range(1, len(headers) + 1):
            cell = ws.cell(row=row, column=c)
            cell.fill = fill
            cell.border = border
            cell.alignment = Alignment(vertical="top", wrap_text=(c in (4, 5, 6, 8)))
        row += 1

dv = DataValidation(type="list", formula1='"保留,修改,删除"', allow_blank=True)
ws.add_data_validation(dv)
dv.add(f"A2:A{row - 1}")

widths = {"A": 7, "B": 18, "C": 7, "D": 34, "E": 40, "F": 26, "G": 20, "H": 20, "I": 26}
for col, w in widths.items():
    ws.column_dimensions[col].width = w
ws.freeze_panes = "A2"

# ---------- Sheet 2: 分组说明 ----------
ws2 = wb.create_sheet("分组与题量")
ws2.append(["分组", "建议保留道数", "说明"])
for c in range(1, 4):
    cell = ws2.cell(row=1, column=c)
    cell.font = Font(bold=True, color="FFFFFF")
    cell.fill = hdr_fill
    cell.alignment = Alignment(horizontal="center")

notes = {
    "A 抵达与第一印象": "破冰题，让用户进入场景；同时测人文/自然、美食倾向",
    "B 人文 / 自然": "核心维度之一，需要足够题量保证稳定",
    "C 美食": "高频决策点",
    "D 大众 / 小众": "决定推荐的是热门都市还是冷门小城",
    "E 消费": "预算敏感度",
    "F 轻松 / 劳累": "体力与节奏",
    "G 停留时间": "决定推荐「能待久」还是「打卡即走」的城市",
    "H 出片度": "拍照取向",
    "J 取舍冲突题": "两个维度正面冲突，最能拉开区分度，建议至少留 2 道",
    "K 景点类型 tag 题": "直接对应城市标签，决定「山/水/人文/都市」大类",
}
r = 2
for g, keep, color in GROUPS:
    ws2.cell(row=r, column=1, value=g).fill = PatternFill("solid", fgColor=color)
    ws2.cell(row=r, column=2, value=keep).alignment = Alignment(horizontal="center")
    ws2.cell(row=r, column=3, value=notes.get(g, ""))
    for c in range(1, 4):
        ws2.cell(row=r, column=c).border = border
        ws2.cell(row=r, column=c).alignment = Alignment(vertical="top", wrap_text=True)
    r += 1

ws2.cell(row=r + 1, column=1, value="合计").font = Font(bold=True)
ws2.cell(row=r + 1, column=2, value=f"=SUM(B2:B{r - 1})").font = Font(bold=True)
ws2.cell(row=r + 1, column=3, value="删减后保留 20-30 道较合适")

ws2.column_dimensions["A"].width = 22
ws2.column_dimensions["B"].width = 14
ws2.column_dimensions["C"].width = 62
for rr in range(2, r + 1):
    ws2.row_dimensions[rr].height = 34

# ---------- Sheet 3: 维度参考 ----------
ws3 = wb.create_sheet("维度参考")
ws3.append(["维度key", "中文名", "左端(0档)", "右端(4档)", "本题库出现选项数"])
counts = {d: 0 for d in DIMS}
for _, _, options, _ in QUESTIONS:
    for o in options:
        for k in o["weight"]:
            counts[k] += 1

dim_info = {
    "scenery": ("人文/自然", "只看人文", "只看自然"),
    "food": ("美食", "美食荒漠", "遍地珍馐"),
    "popularity": ("大众/小众", "大众热门城市", "只有当地人的小众宝藏城市"),
    "cost": ("消费", "物价像回到千禧年", "奢华沪币"),
    "leisure": ("轻松/劳累", "松弛休闲慢节奏城市", "劳累有挑战！"),
    "stay": ("停留时间", "一个城市竟然能待一周？", "路过打个卡就逛完"),
    "photo": ("出片度", "随手一拍都是大片", "完全不用打开相机"),
}
for c in range(1, 6):
    cell = ws3.cell(row=1, column=c)
    cell.font = Font(bold=True, color="FFFFFF")
    cell.fill = hdr_fill
    cell.alignment = Alignment(horizontal="center")

r = 2
for d in DIMS:
    cn, left, right = dim_info[d]
    ws3.cell(row=r, column=1, value=d)
    ws3.cell(row=r, column=2, value=cn)
    ws3.cell(row=r, column=3, value=left)
    ws3.cell(row=r, column=4, value=right)
    ws3.cell(row=r, column=5, value=counts[d]).alignment = Alignment(horizontal="center")
    for c in range(1, 6):
        ws3.cell(row=r, column=c).border = border
    r += 1

for col, w in {"A": 14, "B": 14, "C": 26, "D": 32, "E": 18}.items():
    ws3.column_dimensions[col].width = w

# 说明：站长体验(fun)不在测试维度内
ws3.cell(row=r + 1, column=1, value="站长体验").font = Font(bold=True)
ws3.cell(row=r + 1, column=2,
         value="fun 不属于测试维度：不参与打分、不参与硬性排除。"
               "若最终推荐城市的 fun<=2，结果页以委婉语气追加一行补充说明（不否定推荐结果）。")
ws3.merge_cells(start_row=r + 1, start_column=2, end_row=r + 1, end_column=5)
ws3.cell(row=r + 1, column=2).alignment = Alignment(wrap_text=True, vertical="top")
ws3.row_dimensions[r + 1].height = 34

out = "天选之城测试_题库50题.xlsx"
wb.save(out)
print(f"已生成 {out}")
print(f"题目总数: {len(QUESTIONS)} 道")
print(f"选项总数: {sum(len(o) for _, _, o, _ in QUESTIONS)} 个")
print("\n各分组题量:")
for g, keep, _ in GROUPS:
    n = sum(1 for x in QUESTIONS if x[0] == g)
    print(f"  {g}: {n} 道（建议保留 {keep}）")
print("\n各维度出现次数:")
for d in DIMS:
    print(f"  {DIM_CN[d]}: {counts[d]}")
