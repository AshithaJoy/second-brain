import re
import sys

def main():
    filepath = 'src/App.jsx'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Locate MoodPicker start
    mood_picker_start_match = re.search(r'function MoodPicker\(\{value,onChange,moods=MOODS\}\)\{', content)
    if not mood_picker_start_match:
        print("Could not find MoodPicker function start")
        sys.exit(1)
        
    start_idx = mood_picker_start_match.start()
    
    # Locate collabDetailContent definition start
    collab_content_start_match = re.search(r'const collabDetailContent = addingCollab \? \(', content[start_idx:])
    if not collab_content_start_match:
        print("Could not find collabDetailContent start")
        sys.exit(1)
        
    collab_start_idx = start_idx + collab_content_start_match.start()
    
    # Locate return( of MoodPicker
    # It starts with return( and maps over moods
    return_match = re.search(r'return\(\s*<div style=\{\{display:"flex",flexWrap:"wrap",gap:6,margin:"6px 0"\}\}>', content[collab_start_idx:])
    if not return_match:
        print("Could not find return of MoodPicker")
        sys.exit(1)
        
    return_idx = collab_start_idx + return_match.start()
    
    # Extract the collabDetailContent block (from collab_start_idx up to return_idx)
    # We should strip trailing whitespace and the semicolon before return
    collab_block = content[collab_start_idx:return_idx].strip()
    
    # Verify the block ends with );
    if not collab_block.endswith(');'):
        print(f"Warning: collab_block does not end with ');'. Ends with: {collab_block[-10:]}")
        # Find the last ); in collab_block
        last_semi = collab_block.rfind(');')
        if last_semi != -1:
            collab_block = collab_block[:last_semi+2]
            
    print("Extracted collabDetailContent block length:", len(collab_block))
    
    # Clean MoodPicker code
    clean_mood_picker = """function MoodPicker({value,onChange,moods=MOODS}){
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:6,margin:"6px 0"}}>
      {moods.map(m=>(
        <button key={m} onClick={()=>onChange(m===value?"":m)} style={{
          padding:"4px 13px",borderRadius:20,fontSize:12,cursor:"pointer",fontFamily:"inherit",
          border:value===m?`1.5px solid ${MOOD_COLORS[m]||"#c9b99a"}`:"1px solid var(--border-color)",
          background:value===m?(MOOD_COLORS[m]||"#c9b99a")+"22":"transparent",
          color:value===m?(MOOD_COLORS[m]||"#c9b99a"):"var(--text-secondary)",
          fontWeight:value===m?600:400,transition:"all 0.18s",
        }}>{m}</button>
      ))}
    </div>
  );
}"""

    # We will replace from start_idx up to the end of MoodPicker (which ends with the closing brace of MoodPicker function)
    # Find the closing brace of MoodPicker function.
    # From return_idx, search for the next closing brace at the beginning of a line (or line ending with '}')
    end_of_mood_picker_match = re.search(r'\}\s*\nfunction NavBtn', content[return_idx:])
    if not end_of_mood_picker_match:
        print("Could not find end of MoodPicker (NavBtn function)")
        sys.exit(1)
        
    end_idx = return_idx + end_of_mood_picker_match.start() + 1 # include the closing brace '}'
    
    # Replace MoodPicker in content with clean_mood_picker
    new_content = content[:start_idx] + clean_mood_picker + content[end_idx:]
    
    # Now locate where to insert collabDetailContent in App component
    # We want to place it right before return( of App
    app_return_pattern = r'const delList = selectedCollabDeliverables;\s*return\('
    app_return_match = re.search(app_return_pattern, new_content)
    if not app_return_match:
        print("Could not find insertion target in App (const delList = ... return()")
        sys.exit(1)
        
    insert_idx = app_return_match.start() + len("const delList = selectedCollabDeliverables;")
    
    # Insert it
    final_content = (
        new_content[:insert_idx] + 
        "\n\n  " + collab_block + 
        new_content[insert_idx:]
    )
    
    # Save the modified file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final_content)
        
    print("App.jsx updated successfully!")

if __name__ == '__main__':
    main()
