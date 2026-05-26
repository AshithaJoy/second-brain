import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
text_from_return = '\n'.join(lines[985:])

# Remove comments
text_from_return = re.sub(r'//[^\n]*', '', text_from_return)
def remove_block_comments(match):
    return '\n' * match.group(0).count('\n')
text_from_return = re.compile(r'/\*.*?\*/', re.DOTALL).sub(remove_block_comments, text_from_return)

chars = list(text_from_return)
stack = []
line_num = 986
for i, c in enumerate(chars):
    if c == '\n':
        line_num += 1
    if c == '{':
        stack.append((i, line_num))
        if 1230 <= line_num <= 1285:
            print(f"[{line_num}] PUSH '{c}'. Stack size: {len(stack)}")
    elif c == '}':
        if stack:
            start_i, start_line = stack.pop()
            if 1230 <= line_num <= 1285:
                print(f"[{line_num}] POP '{c}' matching '{chars[start_i]}' from line {start_line}. Stack size: {len(stack)}")
        else:
            if 1230 <= line_num <= 1285:
                print(f"[{line_num}] POP '{c}' but stack is EMPTY!")
