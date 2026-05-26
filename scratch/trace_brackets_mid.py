import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Helper to clean comments and string literals safely
def clean_code(code):
    pattern = re.compile(
        r'//[^\n]*|/\*.*?\*/|\'(?:\\\\|\\\'|[^\'])*\'|\"(?:\\\\|\\\"|[^\"])*\"|`(?:\\\\|\\`|[^`])*`',
        re.DOTALL
    )
    def replacer(match):
        s = match.group(0)
        if s.startswith('//'):
            return ' ' * len(s)
        elif s.startswith('/*'):
            return '\n' * s.count('\n') + ' ' * (len(s) - s.count('\n'))
        else:
            return s[0] + ' ' * (len(s)-2) + s[-1]
    return pattern.sub(replacer, code)

cleaned = clean_code(text)

stack = []
line_num = 1
for i, char in enumerate(cleaned):
    if char == '\n':
        line_num += 1
        continue
    if char in '{[(':
        stack.append((char, line_num, i))
    elif char in '}])':
        if not stack:
            print(f'Line {line_num}: Extra closing {char}. Stack empty.')
            continue
        top, orig_line, offset = stack.pop()
        if (top == '{' and char != '}') or (top == '[' and char != ']') or (top == '(' and char != ')'):
            print(f'Mismatch: {top} at line {orig_line} closed by {char} at line {line_num}')
        
        # Log pops around the collabDetailContent area to debug
        if 1270 <= line_num <= 1300 or 1270 <= orig_line <= 1300:
            print(f'Line {line_num}: Pop {char} matching {top} from line {orig_line}. Remaining stack size: {len(stack)}')
