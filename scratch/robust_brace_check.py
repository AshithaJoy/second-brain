def check_braces(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()

    n = len(code)
    i = 0
    line_num = 1
    
    stack = []
    
    while i < n:
        char = code[i]
        
        # Track line number
        if char == '\n':
            line_num += 1
            i += 1
            continue
            
        # Handle single-line comment //
        if char == '/' and i + 1 < n and code[i+1] == '/':
            while i < n and code[i] != '\n':
                i += 1
            continue
            
        # Handle multi-line comment /* */
        if char == '/' and i + 1 < n and code[i+1] == '*':
            i += 2
            while i + 1 < n and not (code[i] == '*' and code[i+1] == '/'):
                if code[i] == '\n':
                    line_num += 1
                i += 1
            i += 2 # skip */
            continue
            
        # Handle string literals: '...', "...", `...`
        if char in ('"', "'", "`"):
            # Check if single quote is just an apostrophe (like Let's, don't, I'll)
            if char == "'" and i > 0 and i + 1 < n and code[i-1].isalpha() and code[i+1].isalpha():
                i += 1
                continue
                
            quote_char = char
            start_line = line_num
            i += 1
            while i < n:
                if code[i] == '\\':
                    if code[i+1] == '\n':
                        line_num += 1
                    i += 2
                elif code[i] == quote_char:
                    i += 1
                    break
                else:
                    if code[i] == '\n':
                        line_num += 1
                    i += 1
            continue
            
        # Push opening brackets
        if char in '{[(':
            stack.append((char, line_num, i))
            
        # Pop and check closing brackets
        elif char in '}])':
            if not stack:
                print(f"Extra closing '{char}' at line {line_num}")
                lines = code.split('\n')
                start_l = max(0, line_num - 5)
                end_l = min(len(lines), line_num + 5)
                for l in range(start_l, end_l):
                    prefix = '>>>' if l == line_num - 1 else '   '
                    print(f"{prefix} {l+1}: {lines[l]}")
                i += 1
                continue
                
            top, orig_line, _ = stack.pop()
            
            if (top == '{' and char != '}') or (top == '[' and char != ']') or (top == '(' and char != ')'):
                print(f"Mismatch: '{top}' at line {orig_line} closed by '{char}' at line {line_num}")
                lines = code.split('\n')
                start_l = max(0, line_num - 5)
                end_l = min(len(lines), line_num + 5)
                for l in range(start_l, end_l):
                    prefix = '>>>' if l == line_num - 1 else '   '
                    print(f"{prefix} {l+1}: {lines[l]}")
                    
        i += 1
        
    if stack:
        print(f"Unclosed openers: {len(stack)}")
        lines = code.split('\n')
        for item in stack[-10:]:
            print(f"  Opener '{item[0]}' at line {item[1]}:")
            print(f"    {lines[item[1]-1].strip()}")
    else:
        print("Brace/parenthesis check clean!")

if __name__ == '__main__':
    check_braces('src/App.jsx')
