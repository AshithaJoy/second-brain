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
for i, c in enumerate(chars):
    if c == '{':
        stack.append(i)
    elif c == '}':
        if stack:
            start = stack.pop()
            if not stack:
                for j in range(start, i + 1):
                    if chars[j] != '\n':
                        chars[j] = ' '

cleaned_text = "".join(chars)
cleaned_lines = cleaned_text.split('\n')

start_line = 1230 - 986
end_line = 1280 - 986
for idx in range(start_line, end_line):
    if idx < len(cleaned_lines):
        print(f"{986+idx}: {repr(cleaned_lines[idx])}")
