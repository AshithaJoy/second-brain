with open("C:/Users/HI10148/.gemini/antigravity/scratch/second-brain/src/App.jsx", "r", encoding="utf-8") as f:
    text = f.read()

stack = []
in_string = None
escape = False

for i, char in enumerate(text):
    # Extremely simple tokenizer to ignore strings
    if in_string:
        if escape:
            escape = False
        elif char == '\\':
            escape = True
        elif char == in_string:
            in_string = None
        continue
    
    if char in ['"', "'", '`']:
        in_string = char
        continue
        
    if char in "{[(":
        stack.append((char, i))
    elif char in "}])":
        if not stack:
            print(f"Extra closing '{char}' at offset {i}")
            continue
        top, offset = stack.pop()
        if (top == "{" and char != "}") or (top == "[" and char != "]") or (top == "(" and char != ")"):
            print(f"Mismatch: '{top}' at offset {offset} closed by '{char}' at offset {i}")

print("Full file brace check complete. Remaining stack:")
for item in stack:
    # Print line number of the offset
    line_num = text[:item[1]].count('\n') + 1
    print(f"'{item[0]}' at line {line_num}")
