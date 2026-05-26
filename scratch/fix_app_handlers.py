with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's define the exact replacements to fix the malformed React event handlers.
# We will do exact string replacements to be 100% safe.

replacements = [
    # 1. Line 1788 input onChange (missing closing brace)
    ('onChange={e=>updatePost(selectedPost.id,{title:e.target.value})} style={{...S.input',
     'onChange={e=>updatePost(selectedPost.id,{title:e.target.value})}} style={{...S.input'),
     
    # 2. Line 1789 button onClick (missing braces completely)
    ('onClick={()=>setSelectedPost(null)} style={{...S.ghost',
     'onClick={() => setSelectedPost(null)} style={{...S.ghost'),
     
    # 3. Line 1792 input onChange (missing closing brace)
    ('onChange={e=>updatePost(selectedPost.id,{date:e.target.value})}/></div>',
     'onChange={e=>updatePost(selectedPost.id,{date:e.target.value})}}/></div>'),
     
    # 4. Line 1793 button onClick (missing braces completely)
    ('onClick={()=>updatePost(selectedPost.id,{type:t})} style={{...S.btn',
     'onClick={() => updatePost(selectedPost.id,{type:t})} style={{...S.btn'),
     
    # 5. Line 1795 button onClick (missing braces completely)
    ('onClick={()=>updatePost(selectedPost.id,{status:st})} style={{...S.btn',
     'onClick={() => updatePost(selectedPost.id,{status:st})} style={{...S.btn'),
     
    # 6. Line 1796 MoodPicker onChange (missing closing brace)
    ('value={selectedPost.mood} onChange={m=>updatePost(selectedPost.id,{mood:m})}/>',
     'value={selectedPost.mood} onChange={m=>updatePost(selectedPost.id,{mood:m})}}/>'),
     
    # 7. Line 1799 select onChange (missing closing brace)
    ('onChange={e=>updatePost(selectedPost.id,{shootId:e.target.value?Number(e.target.value):null})}>',
     'onChange={e=>updatePost(selectedPost.id,{shootId:e.target.value?Number(e.target.value):null})}}>'),
     
    # 8. Line 1807 textarea onChange (missing closing brace)
    ('placeholder="what do you want to say..." onChange={e=>updatePost(selectedPost.id,{caption:e.target.value})}/>',
     'placeholder="what do you want to say..." onChange={e=>updatePost(selectedPost.id,{caption:e.target.value})}}/>'),
     
    # 9. Line 1808 textarea onChange (missing closing brace)
    ('placeholder="#yourhashtags" onChange={e=>updatePost(selectedPost.id,{hashtags:e.target.value})}/>',
     'placeholder="#yourhashtags" onChange={e=>updatePost(selectedPost.id,{hashtags:e.target.value})}}/>'),
     
    # 10. Line 1811 button onClick (missing braces completely)
    ('onClick={()=>deletePost(selectedPost.id)} style={{...S.btn',
     'onClick={() => deletePost(selectedPost.id)} style={{...S.btn')
]

modified = content
for old, new in replacements:
    if old in modified:
        print(f"Replacing malformed handler pattern...")
        modified = modified.replace(old, new)
    else:
        print(f"Warning: pattern NOT found: {repr(old[:50])}")

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(modified)

print("Replacement complete!")
