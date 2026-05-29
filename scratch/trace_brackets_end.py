with open("C:/Users/HI10148/.gemini/antigravity/scratch/second-brain/src/App.jsx", "r", encoding="utf-8") as f:
    text = f.read()

lines = text.split('\n')

stack = []
trace_start = 3800
for i, line in enumerate(lines):
    line_num = 1 + i
    for col, char in enumerate(line):
        if char in "{[(":
            stack.append((char, line_num, col + 1))
            if line_num >= trace_start:
                print(f"PUSH: '{char}' at line {line_num}, col {col + 1}")
        elif char in "}])":
            if not stack:
                if line_num >= trace_start:
                    print(f"Extra closing '{char}' at line {line_num}, col {col + 1}")
                continue
            top, l, c = stack.pop()
            if line_num >= trace_start:
                print(f"POP: '{char}' at line {line_num}, col {col+1} matches '{top}' at line {l}, col {c}")
