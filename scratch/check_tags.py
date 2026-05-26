import re

with open("C:/Users/HI10148/.gemini/antigravity/scratch/second-brain/src/App.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

sub_lines = lines[1897:2294] # selectedCollab block

text = "".join(sub_lines)

# Clean comments
text = re.sub(r'{\s*/\*.*?\*/\s*}', '', text, flags=re.DOTALL)
text = re.sub(r'//.*?\n', '\n', text)

# Find all tags
tag_pattern = re.compile(r'</?([a-zA-Z0-9]+)(?:\s+[^>]*?)?/?>')

stack = []
for match in tag_pattern.finditer(text):
    tag_str = match.group(0)
    tag_name = match.group(1)
    
    # Calculate line and column
    offset = match.start()
    line_num = 1898 + text[:offset].count('\n')
    
    # Ignore self-closing tags
    if tag_str.endswith('/>') or tag_name in ['input', 'img', 'br', 'hr']:
        continue
        
    if tag_str.startswith('</'):
        if not stack:
            print(f"Extra closing tag '{tag_name}' at line {line_num}")
            continue
        top_name, top_line = stack.pop()
        if top_name != tag_name:
            print(f"Mismatch: opened '{top_name}' at line {top_line} closed by '{tag_name}' at line {line_num}")
    else:
        stack.append((tag_name, line_num))

print("Tag check complete. Remaining stack:")
for item in stack:
    print(item)
