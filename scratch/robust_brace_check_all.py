with open("C:/Users/HI10148/.gemini/antigravity/scratch/second-brain/src/App.jsx", "r", encoding="utf-8") as f:
    text = f.read()

lines = text.split('\n')

stack = []
for i, line in enumerate(lines):
    line_num = 1 + i
    # Simple scanner that ignores strings to avoid comments/strings messing it up
    # actually, let's do a simple character scanner first
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

print("Remaining stack length:", len(stack))
print("Top 20 items in stack:")
for item in stack[:20]:
    print(item)
print("Bottom 20 items in stack:")
for item in stack[-20:]:
    print(item)
