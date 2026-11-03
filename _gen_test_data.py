# -*- coding: utf-8 -*-
"""
从题库 Excel 生成 test_data.js
在 _build_question_db.py 的 QUESTIONS 数据基础上直接序列化，保证与 Excel 同源
"""
import sys, json, re
sys.stdout.reconfigure(encoding='utf-8')

SRC = '_build_question_db.py'
src = open(SRC, encoding='utf-8').read()
head = src.split('wb = Workbook()')[0]
ns = {}
exec(head, ns)
QUESTIONS = ns['QUESTIONS']

# 分组名 -> 简短 scene 标签
SCENE = {
    'A 抵达与第一印象': '抵达',
    'B 人文 / 自然': '景点类型',
    'C 美食': '吃饭',
    'D 大众 / 小众': '选目的地',
    'E 消费': '花钱',
    'F 轻松 / 劳累': '体力节奏',
    'G 停留时间': '行程长度',
    'H 出片度': '拍照',
    'J 取舍冲突题': '取舍',
    'K 景点类型 tag 题': '想看什么',
}

# 分组前缀 -> 题目 id 前缀
PREFIX = {
    'A 抵达与第一印象': 'arrive',
    'B 人文 / 自然': 'scenery',
    'C 美食': 'food',
    'D 大众 / 小众': 'popularity',
    'E 消费': 'cost',
    'F 轻松 / 劳累': 'leisure',
    'G 停留时间': 'stay',
    'H 出片度': 'photo',
    'J 取舍冲突题': 'tradeoff',
    'K 景点类型 tag 题': 'tag',
}

def js_obj(d):
    """把 dict 序列化为紧凑 JS 对象字面量，保持插入顺序"""
    if not d:
        return '{}'
    items = ', '.join(f'{k}: {v}' for k, v in d.items())
    return '{ ' + items + ' }'

def js_str(s):
    return json.dumps(s, ensure_ascii=False)

def fmt_opt(o):
    parts = [f'text: {js_str(o["text"])}',
             f'want: {js_obj(o["want"])}',
             f'weight: {js_obj(o["weight"])}']
    if o.get('tags'):
        tags = ', '.join(js_str(t) for t in o['tags'])
        parts.append(f'tags: [{tags}]')
    return '{ ' + ', '.join(parts) + ' }'

# 为每个分组内的题编号
counters = {}
groups_order = []
for g, _, _, _ in QUESTIONS:
    if g not in counters:
        counters[g] = 0
        groups_order.append(g)
    counters[g] += 1

lines = []
lines.append('// ============================================================')
lines.append('// 天选之城测试 —— 题库（由 _build_question_db.py 自动生成，请勿手改）')
lines.append('// 数据源：天选之城测试_题库50题.xlsx')
lines.append('// 设计原则：')
lines.append('//   1. 每题各选项的「总权重」必须相等，否则选项多的维度会系统性获胜')
lines.append('//   2. want 为带符号的推力：-1 指向滑条左端，+1 指向右端，0 表示中立')
lines.append('//   3. weight 为题目对该维度的区分度：1 = 一般，2 = 高区分度（界面不显示）')
lines.append('//   4. 全部为生活场景文风，避免「你更看重 X 还是 Y」式的直白问法')
lines.append('// 维度对照（与 app.js 的 DIMENSIONS 一一对应）：')
lines.append('//   scenery 人文/自然 · food 美食 · popularity 大众/小众 · cost 消费')
lines.append('//   leisure 轻松/劳累 · stay 停留时间 · photo 出片度')
lines.append('// 注：站长体验(fun)不参与测试打分，仅作为推荐器的参考维度。')
lines.append('//     fun 的处理方式：不参与计分、不参与硬性排除；')
lines.append('//     若最终推荐城市的站长评分偏低，在结果页追加一行提示说明。')
lines.append('//     判定阈值 fun <= 2（100 座城市中约 24% 落在此区间）。')
lines.append('//     语气要求：委婉、补充说明式，不否定推荐结果、不制造劝退感。')
lines.append('// ============================================================')
lines.append('')
lines.append('window.TEST_QUESTIONS = [')

seen = {}
cur_group = None
for g, text, options, note in QUESTIONS:
    if g != cur_group:
        if cur_group is not None:
            lines.append('')
        lines.append(f'  // ---------- {g} ----------')
        cur_group = g
    seen[g] = seen.get(g, 0) + 1
    qid = f'{PREFIX[g]}_{seen[g]}'
    lines.append('  {')
    lines.append(f'    id: {js_str(qid)},')
    lines.append(f'    group: {js_str(g)},')
    lines.append(f'    scene: {js_str(SCENE[g])},')
    lines.append(f'    q: {js_str(text)},')
    if note:
        lines.append(f'    note: {js_str(note)},')
    lines.append('    options: [')
    for i, o in enumerate(options):
        comma = ',' if i < len(options) - 1 else ''
        lines.append(f'      {fmt_opt(o)}{comma}')
    lines.append('    ]')
    lines.append('  },' if (g, text) != (QUESTIONS[-1][0], QUESTIONS[-1][1]) else '  }')

lines.append('];')

# 追加配置
lines.append('')
lines.append('// —— 测试配置 ——')
lines.append('window.TEST_META = {')
lines.append('  // 每套模板的题目数区间')
lines.append('  minQuestions: 20,')
lines.append('  maxQuestions: 30,')
lines.append('')
lines.append('  // 站长体验提示：fun <= 该值时，结果页追加一行委婉说明')
lines.append('  funHintThreshold: 2,')
lines.append('')
lines.append('  // 提示文案：委婉、补充式，按 fun 强度分两档')
lines.append('  funHints: {')
lines.append('    mild: "顺带一提，站长本人在那里的体验只是「还行」，也可以多对比两座看看。",')
lines.append('    weak: "小提示：站长对这里的个人感受比较一般，如果更看重游玩体验，不妨再看看备选城市。"')
lines.append('  }')
lines.append('};')
lines.append('')

out = '\n'.join(lines)
open('test_data.js', 'w', encoding='utf-8').write(out)

print('已生成 test_data.js')
print('题目总数:', len(QUESTIONS))
for g in groups_order:
    print(f'  {g}: {seen[g]} 道')
