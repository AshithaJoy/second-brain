with open('src/App.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Revert ternary modifications
# Block 1: activeDump
text = text.replace('              :\n                <div style={{textAlign:"center",padding:"80px 20px",color:"var(--text-muted)",background:"var(--bg-secondary)",borderRadius:16,border:"1px solid var(--border-color)"}}>', '              ) : (\n                <div style={{textAlign:"center",padding:"80px 20px",color:"var(--text-muted)",background:"var(--bg-secondary)",borderRadius:16,border:"1px solid var(--border-color)"}}>')
text = text.replace('                  <div style={{display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap"}}>\n                    {DUMP_PLACEHOLDERS.map((pl,i)=><button key={i} onClick={()=>{\n                      const nd={id:Date.now(),title:pl,text:"",mood:"reflective",ts:"just now",archived:false};\n                      setDumps(ds=>[...ds,nd]);setActiveDumpId(nd.id);\n                    }} style={{...S.btn("var(--text-muted)",true),fontSize:11}}>{pl}</button>)}\n                  </div>\n                </div>\n              }', '                  <div style={{display:"flex",justifyContent:"center",gap:6,flexWrap:"wrap"}}>\n                    {DUMP_PLACEHOLDERS.map((pl,i)=><button key={i} onClick={()=>{\n                      const nd={id:Date.now(),title:pl,text:"",mood:"reflective",ts:"just now",archived:false};\n                      setDumps(ds=>[...ds,nd]);setActiveDumpId(nd.id);\n                    }} style={{...S.btn("var(--text-muted)",true),fontSize:11}}>{pl}</button>)}\n                  </div>\n                </div>\n              )}')

# Block 2: selectedShoot
text = text.replace('              :\n                <div style={{textAlign:"center",padding:"80px 20px",color:"var(--text-muted)",background:"var(--bg-secondary)",borderRadius:16,border:"1px solid var(--border-color)"}}>', '              ) : (\n                <div style={{textAlign:"center",padding:"80px 20px",color:"var(--text-muted)",background:"var(--bg-secondary)",borderRadius:16,border:"1px solid var(--border-color)"}}>')
text = text.replace('                  <p style={{fontSize:12}}>Pick or create a shoot session in the sidebar to organize your camera angles.</p>\n                </div>\n              }', '                  <p style={{fontSize:12}}>Pick or create a shoot session in the sidebar to organize your camera angles.</p>\n                </div>\n              )}')

# Block 3: addingJournal
text = text.replace('              :\n                <div style={{textAlign:"center",padding:"80px 20px",color:"var(--text-muted)",background:"var(--bg-secondary)",borderRadius:16,border:"1px solid var(--border-color)"}}>', '              ) : (\n                <div style={{textAlign:"center",padding:"80px 20px",color:"var(--text-muted)",background:"var(--bg-secondary)",borderRadius:16,border:"1px solid var(--border-color)"}}>')
text = text.replace('                  <p style={{fontSize:12,maxWidth:320,margin:"0 auto"}}>Growth is quieter than you think. Document the process, not just the milestones.</p>\n                </div>\n              }', '                  <p style={{fontSize:12,maxWidth:320,margin:"0 auto"}}>Growth is quieter than you think. Document the process, not just the milestones.</p>\n                </div>\n              )}')

# Block 4: addingCollab
text = text.replace('              {addingCollab ?\n                <div style={S.card} className="card-in">', '              {addingCollab ? (\n                <div style={S.card} className="card-in">')
text = text.replace('                : selectedCollab ?\n                  <div style={S.card} className="card-in">', '                ) : selectedCollab ? (\n                  <div style={S.card} className="card-in">')
text = text.replace('                  :\n                <div style={{textAlign:"center",padding:"80px 20px",color:"var(--text-muted)",background:"var(--bg-secondary)",borderRadius:16,border:"1px solid var(--border-color)"}}>', '                  ) : (\n                <div style={{textAlign:"center",padding:"80px 20px",color:"var(--text-muted)",background:"var(--bg-secondary)",borderRadius:16,border:"1px solid var(--border-color)"}}>')
text = text.replace('                  <p style={{fontSize:12,maxWidth:320,margin:"0 auto"}}>Keep relationships calm and rates documented. Soft systems still count as systems.</p>\n                </div>\n              }', '                  <p style={{fontSize:12,maxWidth:320,margin:"0 auto"}}>Keep relationships calm and rates documented. Soft systems still count as systems.</p>\n                </div>\n              )}')

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Restoration script run complete.")
