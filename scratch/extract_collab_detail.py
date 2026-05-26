import re

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's find the start and end of the block we want to extract
start_marker = '              {addingCollab ?'
# Let's support both LF and CRLF for end marker
end_pattern = re.compile(
    r'Keep relationships calm and rates documented\. Soft systems still count as systems\.</p>\s*</div>\s*\}'
)

start_idx = text.find(start_marker)
match = end_pattern.search(text)

if start_idx == -1:
    print("Error: Start marker not found")
elif not match:
    print("Error: End marker not found")
else:
    end_idx = match.end()
    print(f"Found block from index {start_idx} to {end_idx}")
    
    # Extract the block
    block = text[start_idx:end_idx]
    
    # Replace the block in the original text with {collabDetailContent}
    modified_text = text[:start_idx] + '              {collabDetailContent}' + text[end_idx:]
    
    # Let's process the block to make it a valid JS variable definition:
    # Remove the outer curly braces
    # The block starts with '              {addingCollab ?'
    # and ends with '}'
    
    # We want to change:
    # {addingCollab ?
    #    <div ...>
    #    ...
    #  : selectedCollab ?
    #    <div ...>
    #    ...
    #  :
    #    <div ...>
    #    ...
    # }
    # To:
    # const collabDetailContent = addingCollab ? (
    #    <div ...>
    #    ...
    # ) : selectedCollab ? (
    #    <div ...>
    #    ...
    # ) : (
    #    <div ...>
    #    ...
    # );
    
    # Let's do the string replacements on the block:
    processed_block = block
    # Remove leading curly brace from the start
    processed_block = processed_block.replace('{addingCollab ?', 'addingCollab ? (')
    
    # Replace the middle ternary operators with parenthesised versions
    processed_block = processed_block.replace(': selectedCollab ?', ') : selectedCollab ? (')
    # Replace the last else colon
    # We want to match '                  :' specifically to avoid replacing other colons
    processed_block = processed_block.replace('                  :', '                  ) : (')
    
    # Remove the trailing curly brace at the end and replace it with );
    # The end of the block is '}'
    if processed_block.endswith('}'):
        processed_block = processed_block[:-1] + ')'
    
    # Combine into the variable definition
    var_definition = '  const collabDetailContent = ' + processed_block.strip() + ';\n\n'
    
    # Now find where to insert the variable definition
    # We want to insert it right before the '  return(' statement (line 986)
    return_marker = '  return('
    return_idx = modified_text.find(return_marker)
    if return_idx == -1:
        # try return (
        return_marker = '  return ('
        return_idx = modified_text.find(return_marker)
        
    if return_idx == -1:
        print("Error: return statement not found")
    else:
        final_text = modified_text[:return_idx] + var_definition + modified_text[return_idx:]
        
        with open('src/App.jsx', 'w', encoding='utf-8') as f:
            f.write(final_text)
        print("Successfully extracted collab detail block into a separate variable!")
