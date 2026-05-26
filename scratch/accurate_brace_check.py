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
lines = cleaned.split('\n')

stack = []
for i, char in enumerate(cleaned):
    line_num = cleaned[:i].count('\n') + 1
    if char in '{[(':
        stack.append((char, line_num, i))
        if 2280 <= line_num <= 2310:
            print(f'Line {line_num}: Pushed {char}')
    elif char in '}])':
        if not stack:
            if 2280 <= line_num <= 2310:
                print(f'Line {line_num}: Extra closing {char}')
            continue
        top, orig_line, offset = stack.pop()
        if 2280 <= line_num <= 2310:
            print(f'Line {line_num}: Popped {top} (from line {orig_line}) with {char}')
            print(f'  Stack size after pop: {len(stack)}')
        if (top == '{' and char != '}') or (top == '[' and char != ']') or (top == '(' and char != ')'):
            print(f'Mismatch: {top} at line {orig_line} closed by {char} at line {line_num}')

print('Trace complete.')
