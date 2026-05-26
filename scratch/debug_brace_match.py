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

# Find where 'Soft systems still count as systems' is in cleaned
idx = cleaned.find('Soft systems still count as systems.')
if idx != -1:
    print("Found pivot in cleaned text")
    # Let's print 300 characters after pivot
    sub = cleaned[idx:idx+300]
    print("Sub:", repr(sub))
    
    # Let's trace stack from the beginning up to idx + 300
    stack = []
    for i, char in enumerate(cleaned):
        line_num = cleaned[:i].count('\n') + 1
        if char in '{[(':
            stack.append((char, line_num, i))
        elif char in '}])':
            if not stack:
                continue
            top, orig_line, offset = stack.pop()
            
            # Print if within the sub-range of interest
            if idx <= i <= idx + 300:
                print(f"Char '{char}' at index {i} (line {line_num}) popped '{top}' (from line {orig_line})")
                print(f"  Remaining stack size: {len(stack)}")
                if stack:
                    print(f"  Stack top: {stack[-3:]}")
else:
    print("Pivot not found in cleaned text")
