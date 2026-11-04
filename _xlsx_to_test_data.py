# -*- coding: utf-8 -*-
"""
把「天选之城测试_题库50题.xlsx」转换成 test_data.js

用法：python _xlsx_to_test_data.py

规则：
  · Excel 是唯一数据源，改完 Excel 重跑本脚本即可
  · 「停留时间」维度不参与测试，解析时整列剔除
  · 选项文本去掉 "A. " 前缀；want 由「←左端/→右端/·中立」解析
"""
import sys, json, re
sys.stdout.reconfigure(encoding='utf-8')
from openpyxl import load_workbook

XLSX = '天选之城测试_题库50题.xlsx'
OUT = 'test_data.js'

# 中文件名 -> 维度 key
CN2KEY = {
    '人文/自然': 'scenery',
    '美食': 'food',
    '大众/小众': 'popularity',
    '消费': 'cost',
    '轻松/劳累': 'leisure',
    '停留时间': 'stay',
    '出片度': 'photo',
    '站长体验': 'fun',
}
# 不参与测试的维度
EXCLUDE_DIMS = {'stay'}
# 不参与测试的分组（取舍冲突题不做考量）
EXCLUDE_GROUPS = {'J 取舍冲突题'}

# 分组 -> (id 前缀, scene)
GROUP_META = {
    'A 抵达与第一印象': ('arrive', '抵达'),
    'B 人文 / 自然': ('scenery', '景点类型'),
    'C 美食': ('food', '吃饭'),
    'D 大众 / 小众': ('popularity', '选目的地'),
    'E 消费': ('cost', '花钱'),
    'F 轻松 / 劳累': ('leisure', '体力节奏'),
    'G 停留时间': ('stay', '行程长度'),
    'H 出片度': ('photo', '拍照'),
    'J 取舍冲突题': ('tradeoff', '取舍'),
    'K 景点类型 tag 题': ('tag', '想看什么'),
}

ARROW = [('→右端', 1), ('←左端', -1), ('·中立', 0)]


def parse_dir(text):
    """'人文/自然→右端 / 轻松/劳累←左端' -> {'scenery':1,'leisure':-1}"""
    out = {}
    if not text:
        return out
    for token in str(text).split(' / '):
        token = token.strip()
        if not token:
            continue
        for mark, val in ARROW:
            if token.endswith(mark):
                name = token[:-len(mark)].strip()
                key = CN2KEY.get(name)
                if key and key not in EXCLUDE_DIMS:
                    out[key] = val
                break
    return out


def parse_weight(text):
    """'人文/自然×2 / 停留时间×1' -> {'scenery':2}"""
    out = {}
    if not text:
        return out
    for token in str(text).split(' / '):
        token = token.strip()
        if not token or '×' not in token:
            continue
        name, num = token.rsplit('×', 1)
        key = CN2KEY.get(name.strip())
        if key and key not in EXCLUDE_DIMS:
            try:
                out[key] = int(num)
            except ValueError:
                pass
    return out


def parse_tags(text):
    if not text:
        return []
    return [t.strip() for t in str(text).split('、') if t.strip()]


def strip_letter(text):
    return re.sub(r'^[A-Z][\.、]\s*', '', str(text or '')).strip()


def js_obj(d):
    if not d:
        return '{}'
    return '{ ' + ', '.join(f'{k}: {v}' for k, v in d.items()) + ' }'


def main():
    wb = load_workbook(XLSX, data_only=True)
    ws = wb['题库']

    questions = []          # [{'id','group','scene','q','note','options':[...]}]
    by_qid = {}
    order = []

    for r in range(2, ws.max_row + 1):
        group = ws.cell(row=r, column=2).value
        qid = ws.cell(row=r, column=3).value
        stem = ws.cell(row=r, column=4).value
        opt_text = ws.cell(row=r, column=5).value
        if not group or not qid or not stem:
            continue
        group = str(group).strip()
        qid = str(qid).strip()
        if group in EXCLUDE_GROUPS:
            continue

        if qid not in by_qid:
            meta = GROUP_META.get(group)
            if not meta:
                print('⚠ 未知分组，跳过:', group)
                continue
            suffix = sum(1 for k in by_qid if by_qid[k]['group'] == group) + 1
            q = {
                'id': f'{meta[0]}_{suffix}',
                'group': group,
                'scene': meta[1],
                'q': str(stem).strip(),
                'note': ws.cell(row=r, column=9).value,
                'options': [],
            }
            by_qid[qid] = q
            order.append(qid)
            questions.append(q)

        if opt_text is None or str(opt_text).strip() == '':
            continue

        by_qid[qid]['options'].append({
            'text': strip_letter(opt_text),
            'want': parse_dir(ws.cell(row=r, column=6).value),
            'weight': parse_weight(ws.cell(row=r, column=7).value),
            'tags': parse_tags(ws.cell(row=r, column=8).value),
        })

    # ---------- 输出 JS ----------
    lines = []
    lines.append('// ============================================================')
    lines.append('// 天选之城测试 —— 题库（由 _xlsx_to_test_data.py 从 Excel 生成，请勿手改）')
    lines.append('// 数据源：天选之城测试_题库50题.xlsx')
    lines.append('// 注意：「停留时间」维度不参与测试，已在转换时剔除')
    lines.append('// ============================================================')
    lines.append('')
    lines.append('window.TEST_QUESTIONS = [')

    cur_group = None
    for q in questions:
        if q['group'] != cur_group:
            if cur_group is not None:
                lines.append('')
            lines.append(f'  // ---------- {q["group"]} ----------')
            cur_group = q['group']
        lines.append('  {')
        lines.append(f'    id: {json.dumps(q["id"])},')
        lines.append(f'    group: {json.dumps(q["group"], ensure_ascii=False)},')
        lines.append(f'    scene: {json.dumps(q["scene"], ensure_ascii=False)},')
        lines.append(f'    q: {json.dumps(q["q"], ensure_ascii=False)},')
        if q['note']:
            lines.append(f'    note: {json.dumps(str(q["note"]).strip(), ensure_ascii=False)},')
        lines.append('    options: [')
        for i, o in enumerate(q['options']):
            parts = [f'text: {json.dumps(o["text"], ensure_ascii=False)}',
                     f'want: {js_obj(o["want"])}',
                     f'weight: {js_obj(o["weight"])}']
            if o['tags']:
                parts.append('tags: [' + ', '.join(json.dumps(t, ensure_ascii=False) for t in o['tags']) + ']')
            comma = ',' if i < len(q['options']) - 1 else ''
            lines.append('      { ' + ', '.join(parts) + ' }' + comma)
        lines.append('    ]')
        lines.append('  },')
    lines.append('];')
    lines.append('')
    lines.append('// —— 测试配置 ——')
    lines.append('window.TEST_META = {')
    lines.append('  minQuestions: 20,')
    lines.append('  maxQuestions: 30,')
    lines.append('  // 站长体验提示：fun <= 该值时，结果页追加一行委婉说明')
    lines.append('  funHintThreshold: 2,')
    lines.append('  funHints: {')
    lines.append('    mild: "顺带一提，站长本人在那里的体验只是「还行」，也可以多对比两座看看。",')
    lines.append('    weak: "小提示：站长对这里的个人感受比较一般，如果更看重游玩体验，不妨再看看备选城市。"')
    lines.append('  }')
    lines.append('};')
    lines.append('')

    open(OUT, 'w', encoding='utf-8').write('\n'.join(lines))

    print('已生成', OUT)
    print('题目总数:', len(questions))
    from collections import Counter
    c = Counter(q['group'] for q in questions)
    for g, n in c.items():
        print(f'  {g}: {n} 题')
    # 维度覆盖检查
    dims = Counter()
    for q in questions:
        for o in q['options']:
            for k in o['weight']:
                dims[k] += 1
    print('维度选项覆盖:', dict(dims))
    # 空权重选项提示
    empty = [(q['id'], i) for q in questions for i, o in enumerate(q['options'])
             if not o['weight'] and not o['tags']]
    if empty:
        print('⚠ 既无维度也无标签的选项（不参与计分）:', empty)


if __name__ == '__main__':
    main()
