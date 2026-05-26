import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.split('\n')

for idx in range(1739, 1835):
    if idx < len(lines):
        line = lines[idx]
        safe_line = line.encode('ascii', errors='replace').decode('ascii')
        print(f"{idx+1}: {safe_line}")
