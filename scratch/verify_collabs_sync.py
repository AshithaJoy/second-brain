with open("C:/Users/HI10148/.gemini/antigravity/scratch/second-brain/src/App.jsx", "r", encoding="utf-8") as f:
    text = f.read()

lines = text.split('\n')
sub_lines = lines[1560:2307] # Collabs CRM block (line 1561 to 2307)

sub_text = "\n".join(sub_lines)

# Very simple scanner
import re
tokens = []
# Find braces, parentheses, tags
pattern = re.compile(r'({|}|\[|\]|\(|\)|</?[a-zA-Z0-9]+(?:\s+[^>]*?)?/?>)')

line_num = 1561
for line in sub_lines:
    # Scan line
    # Ignore comments
    clean_line = re.sub(r'//.*', '', line)
    clean_line = re.sub(r'{\s*/\*.*?\*/\s*}', '', clean_line)
    
    for match in pattern.finditer(clean_line):
        token = match.group(0)
        # Check if it is a self-closing tag or default tags like input/img
        if (token.startswith('<') and token.endswith('/>')) or token in ['<input/>', '<img/>', '<br/>', '<hr/>'] or any(token.startswith(x) for x in ['<input', '<img', '<br', '<hr']):
            continue
        tokens.append((token, line_num, match.start() + 1))
    line_num += 1

print(f"Scanned {len(tokens)} tokens.")

# Let's match them
stack = []
for tok, l, c in tokens:
    if tok in ["{", "(", "["] or (tok.startswith('<') and not tok.startswith('</')):
        stack.append((tok, l, c))
    elif tok in ["}", ")", "]"] or tok.startswith('</'):
        if not stack:
            print(f"Extra closing '{tok}' at line {l}, col {c}")
            continue
        top, tl, tc = stack.pop()
        
        # Check matching
        mismatch = False
        if tok == "}" and top != "{": mismatch = True
        elif tok == ")" and top != "(": mismatch = True
        elif tok == "]" and top != "[": mismatch = True
        elif tok.startswith('</') and (not top.startswith('<') or top[1:1+len(tok)-3] != tok[2:-1]): mismatch = True
        
        if mismatch:
            print(f"Mismatch: opened '{top}' at line {tl}, col {tc} closed by '{tok}' at line {l}, col {c}")
            # Put top back to recover stack state
            stack.append((top, tl, tc))

print("Stack at end of block:")
for item in stack:
    print(item)
