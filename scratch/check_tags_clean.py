import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's slice the text from line 986 onwards
lines = text.split('\n')
text_from_return = '\n'.join(lines[985:])

# Remove comments first
text_from_return = re.sub(r'//[^\n]*', '', text_from_return)
def remove_block_comments(match):
    return '\n' * match.group(0).count('\n')
text_from_return = re.compile(r'/\*.*?\*/', re.DOTALL).sub(remove_block_comments, text_from_return)

# Find all matching { } and replace their contents with spaces
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

# Now find all JSX tags in the cleaned text
tag_pattern = re.compile(r'</?([a-zA-Z0-9_:\.-]+)(?:\s+[^>]*?)?/?>')

stack = []
for match in tag_pattern.finditer(cleaned_text):
    tag_str = match.group(0)
    tag_name = match.group(1)
    
    offset = match.start()
    line_num = 986 + cleaned_text[:offset].count('\n')
    
    # Check if self-closing
    if tag_str.endswith('/>') or tag_name in ['input', 'img', 'br', 'hr', 'link', 'meta']:
        continue
        
    if tag_str.startswith('</'):
        if not stack:
            print(f'Extra closing tag </{tag_name}> at line {line_num}')
            continue
        top_name, top_line = stack.pop()
        if top_name != tag_name:
            print(f'Mismatch: opened <{top_name}> at line {top_line} closed by </{tag_name}> at line {line_num}')
            # Put top back to help recover
            stack.append((top_name, top_line))
    else:
        stack.append((tag_name, line_num))

print('Clean tag check complete. Remaining stack:')
for item in stack:
    print(item)
