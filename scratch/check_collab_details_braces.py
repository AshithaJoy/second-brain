with open("C:/Users/HI10148/.gemini/antigravity/scratch/second-brain/src/App.jsx", "r", encoding="utf-8") as f:
    text = f.read()

lines = text.split('\n')
sub_lines = lines[1897:2163] # selectedCollab details card, excluding invoice

stack = []
for i, line in enumerate(sub_lines):
    line_num = 1898 + i
    for col, char in enumerate(line):
        if char in "{[(":
            stack.append((char, line_num, col + 1))
        elif char in "}])":
            if not stack:
                print(f"Extra closing '{char}' at line {line_num}, col {col + 1}")
                continue
            top, l, c = stack.pop()
            if (top == "{" and char != "}") or (top == "[" and char != "]") or (top == "(" and char != ")"):
                print(f"Mismatch: '{top}' at line {l}, col {c} closed by '{char}' at line {line_num}, col {col + 1}")

print("Collab details braces check complete. Remaining stack:")
for item in stack:
    print(item)
