import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')

for idx, line in enumerate(lines):
    line_num = idx + 1
    # Search for onClick or onChange
    for match in re.finditer(r'(on[A-Z][a-zA-Z]+)=\s*({|(?:\(\s*\)\s*=>)|(?:[a-zA-Z0-9_]+\s*=>))', line):
        start = match.start()
        # Find the end of this attribute.
        # Heuristically, in JSX, event handlers end with either } or are malformed.
        # Let's extract 120 characters after the start
        snippet = line[start:start+120]
        # Let's clean print to be safe from unicode
        safe_snippet = snippet.encode('ascii', errors='replace').decode('ascii')
        print(f"L{line_num}: {safe_snippet}")
