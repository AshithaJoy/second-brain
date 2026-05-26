import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')

# We want to find event handlers like onClick, onChange, etc.
# Heuristic: search for patterns like:
# 1. onClick=()=>  (missing {)
# 2. onChange=e=>  (missing {)
# 3. onClick={...  (missing matching })
# Let's inspect every line and search for event handlers

for idx, line in enumerate(lines):
    line_num = idx + 1
    
    # Heuristic 1: onClick= or onChange= followed by letters/parenthesis but no open brace
    # For example: onClick={()=>  or onClick=e=>
    m1 = re.search(r'(on[A-Z][a-zA-Z]+)=\s*([a-zA-Z0-9_\(\)]+)\s*=>', line)
    if m1:
        handler = m1.group(1)
        print(f"L{line_num}: Malformed handler (missing opening brace): {handler}")
        print(f"  Line: {line.strip()}")
        continue
        
    # Heuristic 2: handler has { but braces inside are not balanced.
    # For example, onChange={e=>updatePost(selectedPost.id,{date:e.target.value})}
    # Let's count braces on the line or look for specific pattern
    for match in re.finditer(r'(on[A-Z][a-zA-Z]+)=\s*({)', line):
        handler = match.group(1)
        # Find the expression container starting at {
        start_idx = match.end() - 1
        # Count braces matching from start_idx
        stack = []
        is_closed = False
        j = start_idx
        while j < len(line):
            c = line[j]
            # simple skip of strings inside quotes
            if c in ('"', "'", "`"):
                q = c
                j += 1
                while j < len(line) and line[j] != q:
                    if line[j] == '\\':
                        j += 2
                    else:
                        j += 1
            elif c == '{':
                stack.append(c)
            elif c == '}':
                if not stack:
                    # extra closing brace, should not happen in a line unless there's a bug
                    pass
                else:
                    stack.pop()
                    if not stack:
                        is_closed = True
                        break
            j += 1
            
        if not is_closed:
            print(f"L{line_num}: Malformed handler (missing closing brace): {handler}")
            print(f"  Line: {line.strip()}")
