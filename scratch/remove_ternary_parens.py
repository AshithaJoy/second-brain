with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace ternary parentheses
# Line 1600: {addingCollab ? (
# Line 1898: ) : selectedCollab ? (
# Line 2295: ) : (
# Line 2301: )}

replacements = [
    ('{addingCollab ? (', '{addingCollab ?'),
    (') : selectedCollab ? (', ': selectedCollab ?'),
    (') : (', ':'),
    ('              )}', '              }')
]

modified = text
for old, new in replacements:
    if old in modified:
        print(f'Replacing {repr(old)} with {repr(new)}')
        modified = modified.replace(old, new)
    else:
        print(f'Warning: {repr(old)} not found in text!')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(modified)
