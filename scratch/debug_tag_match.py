import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove comments
cleaned = re.sub(r'//[^\n]*', '', text)
def remove_block_comments(match):
    return '\n' * match.group(0).count('\n')
cleaned = re.compile(r'/\*.*?\*/', re.DOTALL).sub(remove_block_comments, cleaned)

# Replace { ... } expressions with spaces
chars = list(cleaned)
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
lines = cleaned_text.split('\n')
print("Line 2157 in cleaned_text:")
print(repr(lines[2156]))

# Search for matches on line 2157
tag_pattern = re.compile(r'</?([a-zA-Z0-9_:\.-]+)(?:\s+[^>]*?)?/?>')
for match in tag_pattern.finditer(lines[2156]):
    tag_str = match.group(0)
    tag_name = match.group(1)
    cleaned_tag_str = re.sub(r'\s+', ' ', tag_str).strip()
    print(f"Match: {repr(tag_str)}")
    print(f"Name: {tag_name}")
    print(f"Ends with />: {cleaned_tag_str.endswith('/>')}")
