def check_braces(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()

    n = len(code)
    i = 0
    line_num = 1
    
    stack = []
    
    while i < n:
        char = code[i]
        
        # Track line and column numbers
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
            quote_char = char
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
            if 1545 <= line_num <= 1685:
                print(f"L{line_num}: Push '{char}'. Stack: {[s[0] for s in stack]}")
            
        # Pop and check closing brackets
        elif char in '}])':
            if not stack:
                if 1545 <= line_num <= 1685:
                    print(f"L{line_num}: Extra closing '{char}'. Stack empty.")
                i += 1
                continue
                
            top, orig_line, _ = stack.pop()
            if 1545 <= line_num <= 1685:
                print(f"L{line_num}: Pop '{char}' matching '{top}' from L{orig_line}. Stack: {[s[0] for s in stack]}")
            
            if (top == '{' and char != '}') or (top == '[' and char != ']') or (top == '(' and char != ')'):
                print(f"  Mismatch: '{top}' from L{orig_line} closed by '{char}' at L{line_num}")
                    
        i += 1

if __name__ == '__main__':
    check_braces('src/App.jsx')
