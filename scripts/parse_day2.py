import zipfile, xml.etree.ElementTree as ET, json, re, sys

sys.stdout.reconfigure(encoding='utf-8')

docx_path = r'C:\Users\uttim\Downloads\Super_60_CPP_Conditional_Statements_MCQ.docx'

paragraphs = []
with zipfile.ZipFile(docx_path) as z:
    xml_content = z.read('word/document.xml')
    tree = ET.fromstring(xml_content)
    for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
        parts = []
        for elem in p.iter():
            if elem.tag.endswith('t') and elem.text:
                parts.append(elem.text)
            elif elem.tag.endswith('br'):
                parts.append('\n')
        full = ''.join(parts).strip()
        if full:
            paragraphs.append(full)

print(f'Total paragraphs with br preserved: {len(paragraphs)}')

# Find Answer Key index
ak_idx = -1
for i, line in enumerate(paragraphs):
    if line.strip() == 'Answer Key':
        ak_idx = i
        break

print(f'Answer key starts at index: {ak_idx}')

q_lines = paragraphs[:ak_idx]

# Parse answer key
ak_table = paragraphs[ak_idx+5:ak_idx+65]
answers = {}
for i in range(0, len(ak_table), 3):
    q_num = int(ak_table[i].strip())
    correct_opt = ak_table[i+1].strip()
    ans_text = ak_table[i+2].strip()
    answers[q_num] = (correct_opt, ans_text)

print(f'Parsed answers count: {len(answers)}')

# Parse questions
questions = []
current_q = None

for line in q_lines:
    line_clean = line.strip()
    if not line_clean:
        continue
    
    # Check if section header
    if line_clean.startswith('Section A') or line_clean.startswith('Section B') or line_clean.startswith('SUPER 60') or line_clean.startswith('C++ Screening') or line_clean.startswith('Day 2:') or line_clean.startswith('20 MCQs') or line_clean.startswith('Instructions:'):
        continue

    q_match = re.match(r'^Q(\d+)\.\s*(.*)', line_clean)
    if q_match:
        if current_q:
            questions.append(current_q)
        q_num = int(q_match.group(1))
        title = q_match.group(2).strip()
        current_q = {
            'num': q_num,
            'title': title,
            'body_lines': [],
            'options': {}
        }
        continue
    
    if current_q:
        opt_match = re.match(r'^([A-D])\.\s*(.*)', line_clean, re.DOTALL)
        if opt_match:
            opt_letter = opt_match.group(1)
            opt_text = opt_match.group(2).strip()
            # Clean any trailing section headers like Section B
            opt_text = re.sub(r'\s*Section\s+[A-Z]\s*—.*$', '', opt_text).strip()
            current_q['options'][opt_letter] = opt_text
        else:
            if not current_q['options']:
                current_q['body_lines'].append(line)
            else:
                last_opt = max(current_q['options'].keys())
                current_q['options'][last_opt] += '\n' + line

if current_q:
    questions.append(current_q)

print(f'Parsed questions count: {len(questions)}')

parsed_final = []
for q in questions:
    correct_letter, expected_val = answers.get(q['num'], (None, None))
    body = '\n'.join(q['body_lines']).strip()
    prompt = f"**{q['title']}**\n\n{body}" if body else q['title']
    
    opts = [
        q['options'].get('A', '').strip(),
        q['options'].get('B', '').strip(),
        q['options'].get('C', '').strip(),
        q['options'].get('D', '').strip()
    ]
    
    correct_answer = q['options'].get(correct_letter, '').strip()
    
    item = {
        'num': q['num'],
        'title': q['title'],
        'prompt': prompt,
        'options': opts,
        'correctAnswer': correct_answer,
        'correctLetter': correct_letter,
        'marks': 5
    }
    parsed_final.append(item)
    print(f"--- Q{q['num']}: {q['title']} ---")
    print(f"Prompt:\n{prompt}")
    print(f"Options: {opts}")
    print(f"Correct: ({correct_letter}) {correct_answer}")

with open('scripts/day2_parsed_questions.json', 'w', encoding='utf-8') as f:
    json.dump(parsed_final, f, ensure_ascii=False, indent=2)

print("\nSuccessfully parsed and saved all 20 questions to scripts/day2_parsed_questions.json")
