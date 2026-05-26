with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')
# addingCollab section starts at line 986 and ends at line 1283
adding_collab_lines = lines[985:1283]

stack = []
for idx, line in enumerate(adding_collab_lines):
    line_num = 986 + idx
    # Find all <div> and </div> tags in the line
    import re
    # Match tags
    for match in re.finditer(r'</?(div)(?:\s+[^>]*?)?/?>', line):
        tag = match.group(0)
        is_close = tag.startswith('</')
        is_self_close = tag.endswith('/>')
        
        if is_self_close:
            continue
            
        if is_close:
            if not stack:
                print(f"L{line_num}: Extra closing </div>")
            else:
                top_line = stack.pop()
                print(f"L{line_num}: Close </div> matching L{top_line}")
        else:
            stack.append(line_num)
            print(f"L{line_num}: Open <div>")

print("Unclosed <div> lines at end of addingCollab section:")
print(stack)
