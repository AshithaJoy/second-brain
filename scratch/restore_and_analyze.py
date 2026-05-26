with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Reverse replacements
replacements = [
    ('onChange={e=>updatePost(selectedPost.id,{title:e.target.value})}} style={{...S.input',
     'onChange={e=>updatePost(selectedPost.id,{title:e.target.value})} style={{...S.input'),
     
    ('onClick={() => setSelectedPost(null)} style={{...S.ghost',
     'onClick={()=>setSelectedPost(null)} style={{...S.ghost'),
     
    ('onChange={e=>updatePost(selectedPost.id,{date:e.target.value})}}/></div>',
     'onChange={e=>updatePost(selectedPost.id,{date:e.target.value})}/></div>'),
     
    ('onClick={() => updatePost(selectedPost.id,{type:t})} style={{...S.btn',
     'onClick={()=>updatePost(selectedPost.id,{type:t})} style={{...S.btn'),
     
    ('onClick={() => updatePost(selectedPost.id,{status:st})} style={{...S.btn',
     'onClick={()=>updatePost(selectedPost.id,{status:st})} style={{...S.btn'),
     
    ('value={selectedPost.mood} onChange={m=>updatePost(selectedPost.id,{mood:m})}}/>',
     'value={selectedPost.mood} onChange={m=>updatePost(selectedPost.id,{mood:m})}/>'),
     
    ('onChange={e=>updatePost(selectedPost.id,{shootId:e.target.value?Number(e.target.value):null})}}>',
     'onChange={e=>updatePost(selectedPost.id,{shootId:e.target.value?Number(e.target.value):null})}>'),
     
    ('placeholder="what do you want to say..." onChange={e=>updatePost(selectedPost.id,{caption:e.target.value})}}/>',
     'placeholder="what do you want to say..." onChange={e=>updatePost(selectedPost.id,{caption:e.target.value})}/>'),
     
    ('placeholder="#yourhashtags" onChange={e=>updatePost(selectedPost.id,{hashtags:e.target.value})}}/>',
     'placeholder="#yourhashtags" onChange={e=>updatePost(selectedPost.id,{hashtags:e.target.value})}/>'),
     
    ('onClick={() => deletePost(selectedPost.id)}>delete forever',
     'onClick={()=>deletePost(selectedPost.id)}>delete forever')
]

modified = content
for old, new in replacements:
    if old in modified:
        modified = modified.replace(old, new)
        print("Undid one replacement")

# Write it back temporarily to analyze
with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(modified)

# Now, let's analyze the lines
lines = modified.split('\n')
targets = [1788, 1789, 1792, 1793, 1795, 1796, 1799, 1807, 1808, 1811]

print("\n--- ANALYZING TARGET LINES IN ORIGINAL CODE ---")
for line_num in targets:
    line = lines[line_num - 1]
    # Count braces inside event handler
    # We find onXXX=
    import re
    m = re.search(r'(on[A-Z][a-zA-Z]+)=\s*({)?', line)
    if m:
        handler = m.group(1)
        has_open = m.group(2) is not None
        
        # Let's count open/close braces after the '='
        expr_part = line[m.end():]
        open_count = 1 if has_open else 0
        close_count = 0
        
        # Heuristically check if it's missing { or }
        # If it has type:t} or value} but no onChange={ or onClick={
        # Let's count occurrences of { and } in the expression part until /> or >
        # We stop at /> or >
        term_idx = expr_part.find('/>')
        if term_idx == -1:
            term_idx = expr_part.find('>')
        if term_idx != -1:
            expr_part = expr_part[:term_idx]
            
        braces_stack = []
        for char in expr_part:
            if char == '{':
                braces_stack.append(char)
            elif char == '}':
                if braces_stack:
                    braces_stack.pop()
                else:
                    close_count += 1 # extra closing brace in the part
                    
        unclosed_openers_in_expr = len(braces_stack)
        
        print(f"L{line_num} ({handler}):")
        print(f"  Code: {line.strip()}")
        print(f"  Has open brace: {has_open}")
        print(f"  Unclosed openers in expr: {unclosed_openers_in_expr}")
        print(f"  Unmatched closing braces in expr: {close_count}")
