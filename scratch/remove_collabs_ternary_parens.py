with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace ternary parentheses only for Collabs CRM tab:
# 1. {addingCollab ? (  ->  {addingCollab ?
# 2. ) : selectedCollab ? (  ->  : selectedCollab ?
# 3. ) : (  ->  :  (but only for line 2295!)
# 4. )}  ->  }  (but only for line 2301!)

# We can target these precisely using unique surrounding context.

# Line 1600 context:
target_1 = '              {addingCollab ? (\n                <div style={S.card} className="card-in">'
replacement_1 = '              {addingCollab ?\n                <div style={S.card} className="card-in">'

# Line 1898 context:
target_2 = '                ) : selectedCollab ? (\n                  <div style={S.card} className="card-in">'
replacement_2 = '                : selectedCollab ?\n                  <div style={S.card} className="card-in">'

# Line 2295 context:
target_3 = '                  ) : (\n                <div style={{textAlign:"center",padding:"80px 20px",color:"var(--text-muted)",background:"var(--bg-secondary)",borderRadius:16,border:"1px solid var(--border-color)"}}>'
replacement_3 = '                  :\n                <div style={{textAlign:"center",padding:"80px 20px",color:"var(--text-muted)",background:"var(--bg-secondary)",borderRadius:16,border:"1px solid var(--border-color)"}}>'

# Line 2301 context:
target_4 = '                  <p style={{fontSize:12,maxWidth:320,margin:"0 auto"}}>Keep relationships calm and rates documented. Soft systems still count as systems.</p>\n                </div>\n              )}'
replacement_4 = '                  <p style={{fontSize:12,maxWidth:320,margin:"0 auto"}}>Keep relationships calm and rates documented. Soft systems still count as systems.</p>\n                </div>\n              }'

if target_1 in text:
    text = text.replace(target_1, replacement_1)
    print("Replaced 1")
else:
    # try CRLF version
    t = target_1.replace('\n', '\r\n')
    r = replacement_1.replace('\n', '\r\n')
    if t in text:
        text = text.replace(t, r)
        print("Replaced 1 (CRLF)")

if target_2 in text:
    text = text.replace(target_2, replacement_2)
    print("Replaced 2")
else:
    t = target_2.replace('\n', '\r\n')
    r = replacement_2.replace('\n', '\r\n')
    if t in text:
        text = text.replace(t, r)
        print("Replaced 2 (CRLF)")

if target_3 in text:
    text = text.replace(target_3, replacement_3)
    print("Replaced 3")
else:
    t = target_3.replace('\n', '\r\n')
    r = replacement_3.replace('\n', '\r\n')
    if t in text:
        text = text.replace(t, r)
        print("Replaced 3 (CRLF)")

if target_4 in text:
    text = text.replace(target_4, replacement_4)
    print("Replaced 4")
else:
    t = target_4.replace('\n', '\r\n')
    r = replacement_4.replace('\n', '\r\n')
    if t in text:
        text = text.replace(t, r)
        print("Replaced 4 (CRLF)")

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Finished.")
