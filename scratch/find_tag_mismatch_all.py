import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Remove comments
cleaned = re.sub(r'//[^\n]*', '', text)
def remove_block_comments(match):
    return '\n' * match.group(0).count('\n')
cleaned = re.compile(r'/\*.*?\*/', re.DOTALL).sub(remove_block_comments, cleaned)

# Replace { ... } expressions with spaces to avoid parsing tags inside expressions (like in strings or style objects)
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

# Find all JSX tags
tag_pattern = re.compile(r'</?([a-zA-Z0-9_:\.-]+)(?:\s+[^>]*?)?/?>')

tag_stack = []
for match in tag_pattern.finditer(cleaned_text):
    tag_str = match.group(0)
    tag_name = match.group(1)
    
    offset = match.start()
    line_num = cleaned_text[:offset].count('\n') + 1
    
    # Strip spaces inside tag_str to check for ending '/>'
    cleaned_tag_str = re.sub(r'\s+', ' ', tag_str).strip()
    
    # Heuristics: skip self-closing or standard empty tags
    if cleaned_tag_str.endswith('/>') or tag_name in ['input', 'img', 'br', 'hr', 'link', 'meta', 'circle', 'path', 'rect', 'svg']:
        # print(f"L{line_num}: Skipping self-closing <{tag_name}>: {cleaned_tag_str}")
        continue
        
    if tag_str.startswith('</'):
        if not tag_stack:
            print(f"L{line_num}: Extra closing tag </{tag_name}>")
            continue
        top_name, top_line = tag_stack.pop()
        if top_name != tag_name:
            print(f"L{line_num}: Mismatch: opened <{top_name}> at L{top_line} closed by </{tag_name}> at L{line_num}")
            # print surrounding lines safely
            lines = text.split('\n')
            for idx in range(max(0, line_num-3), min(len(lines), line_num+3)):
                safe_line = lines[idx].encode('ascii', errors='replace').decode('ascii')
                print(f"  {idx+1}: {safe_line}")
            tag_stack.append((top_name, top_line))
    else:
        tag_stack.append((tag_name, line_num))

if tag_stack:
    print(f"Unclosed tags at end of file: {len(tag_stack)}")
    for tag_name, line in tag_stack[-10:]:
        print(f"  <{tag_name}> opened at L{line}")
else:
    print("All tags matched perfectly!")
