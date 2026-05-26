import re
import sys

# Reconfigure stdout to use UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

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
lines_orig = text.split('\n')

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
            print(f'Line {line_num}: Extra closing {char}')
            # print lines around
            start_l = max(0, line_num - 5)
            end_l = min(len(lines_orig), line_num + 5)
            for l in range(start_l, end_l):
                prefix = '>>>' if l == line_num - 1 else '   '
                # Remove emojis to be safe
                safe_line = lines_orig[l].encode('ascii', errors='replace').decode('ascii')
                print(f'{prefix} {l+1}: {safe_line}')
            continue
        top, orig_line, offset = stack.pop()
        if (top == '{' and char != '}') or (top == '[' and char != ']') or (top == '(' and char != ')'):
            print(f'Mismatch: {top} at line {orig_line} closed by {char} at line {line_num}')
            start_l = max(0, line_num - 5)
            end_l = min(len(lines_orig), line_num + 5)
            for l in range(start_l, end_l):
                prefix = '>>>' if l == line_num - 1 else '   '
                safe_line = lines_orig[l].encode('ascii', errors='replace').decode('ascii')
                print(f'{prefix} {l+1}: {safe_line}')
