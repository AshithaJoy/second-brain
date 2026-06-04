const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const targetStart = '{plannerView === "list" && (';
const targetEnd = '{/* Kept "all posts" at bottom for completeness (optional) */}';

const startIndex = app.indexOf(targetStart);
const endIndex = app.indexOf(targetEnd);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find start or end index");
  process.exit(1);
}

const replacement = `{plannerView === "list" && (
              <div style={{display:"flex",flexDirection:"column",gap:24}}>
                <div>
                  <h4 style={{fontSize:14,color:"var(--accent-color)",borderBottom:"1px solid var(--border-color)",paddingBottom:8,marginBottom:12}}>Publishing Pipeline</h4>
                  {posts.filter(p => ["SCHEDULED", "PUBLISHING", "PUBLISHED"].includes(p.status)).length === 0 && <div style={{fontSize:12,color:"var(--text-muted)"}}>No posts in pipeline.</div>}
                  {posts.filter(p => ["SCHEDULED", "PUBLISHING", "PUBLISHED"].includes(p.status)).sort((a,b)=>new Date(b.publishAt||b.date||0).getTime() - new Date(a.publishAt||a.date||0).getTime()).map(p => (
                    <div key={p.id} onClick={()=>setSelectedPost(p)} style={{...S.card,marginBottom:6,cursor:"pointer",padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:15,color:MOOD_COLORS[p.mood]}}>{TYPE_ICONS[p.type]}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,color:"var(--text-primary)",fontWeight:600}}>{p.title}</div>
                        <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>
                          {p.status === "PUBLISHED" ? "Published on" : "Scheduled for"}: {p.publishAt ? new Date(p.publishAt).toLocaleString() : "TBD"}
                        </div>
                      </div>
                      <Tag label={p.status} color={STATUS_COLORS[p.status] || "var(--accent-color)"}/>
                      <Tag label={p.type} color="#ccc" />
                    </div>
                  ))}
                </div>
                
                <div>
                  <h4 style={{fontSize:14,color:"orange",borderBottom:"1px solid var(--border-color)",paddingBottom:8,marginBottom:12}}>Production</h4>
                  {posts.filter(p => ["REVIEW", "APPROVED"].includes(p.status)).length === 0 && <div style={{fontSize:12,color:"var(--text-muted)"}}>No posts in production.</div>}
                  {posts.filter(p => ["REVIEW", "APPROVED"].includes(p.status)).sort((a,b)=>(a.date||"").localeCompare(b.date||"")).map(p => (
                    <div key={p.id} onClick={()=>setSelectedPost(p)} style={{...S.card,marginBottom:6,cursor:"pointer",padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:15,color:MOOD_COLORS[p.mood]}}>{TYPE_ICONS[p.type]}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,color:"var(--text-primary)"}}>{p.title}</div>
                        <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>
                          {isToday(p.date)?"today ✧":friendlyDate(p.date)} · {p.mood}
                        </div>
                      </div>
                      <Tag label={p.status} color={STATUS_COLORS[p.status]}/>
                      <Tag label={p.type} color="#ccc" />
                    </div>
                  ))}
                </div>

                <div>
                  <h4 style={{fontSize:14,color:"var(--text-secondary)",borderBottom:"1px solid var(--border-color)",paddingBottom:8,marginBottom:12}}>Ideation</h4>
                  {posts.filter(p => ["DRAFT"].includes(p.status)).length === 0 && <div style={{fontSize:12,color:"var(--text-muted)"}}>No draft posts.</div>}
                  {posts.filter(p => ["DRAFT"].includes(p.status)).sort((a,b)=>(a.date||"").localeCompare(b.date||"")).map(p => (
                    <div key={p.id} onClick={()=>setSelectedPost(p)} style={{...S.card,marginBottom:6,cursor:"pointer",padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:15,color:MOOD_COLORS[p.mood]}}>{TYPE_ICONS[p.type]}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,color:"var(--text-primary)"}}>{p.title}</div>
                        <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>
                          {isToday(p.date)?"today ✧":friendlyDate(p.date)} · {p.mood}
                        </div>
                      </div>
                      <Tag label={p.status} color={STATUS_COLORS[p.status]}/>
                      <Tag label={p.type} color="#ccc" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            `;

const newApp = app.substring(0, startIndex) + replacement + app.substring(endIndex);
fs.writeFileSync('src/App.jsx', newApp);
console.log("Successfully updated planner list view");
