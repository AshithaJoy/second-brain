const fs = require('fs');
const file = 'C:/Users/HI10148/.gemini/antigravity/scratch/second-brain/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// First, add the `plannerView` state
if (!content.includes('const [plannerView, setPlannerView] = useState("calendar");')) {
  content = content.replace(
    'const [activeDumpId, setActiveDumpId] = useState(null);',
    'const [activeDumpId, setActiveDumpId] = useState(null);\n  const [plannerView, setPlannerView] = useState("calendar");'
  );
}

// Then find the block for tab==="planner"
const targetStartStr = '{/* 1. CONTENT PLANNER */}';
const targetEndStr = '{/* 2. BRAIN DUMP */}';

const startIdx = content.indexOf(targetStartStr);
const endIdx = content.indexOf(targetEndStr);

if (startIdx !== -1 && endIdx !== -1) {
  const before = content.substring(0, startIdx);
  const after = content.substring(endIdx);
  
  const newContent = `{/* 1. CONTENT PLANNER */}
        {tab==="planner"&&(
          <div className="card-in pane-planner">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                <span style={S.label}>Content Planner</span>
                <div style={{display:"flex",gap:4,background:"var(--bg-primary)",padding:4,borderRadius:8,border:"1px solid var(--border-color)"}}>
                  <button onClick={()=>setPlannerView("calendar")} style={{...S.ghost,padding:"4px 12px",borderRadius:6,background:plannerView==="calendar"?"var(--bg-secondary)":"transparent",color:plannerView==="calendar"?"var(--text-primary)":"var(--text-muted)"}}>Calendar</button>
                  <button onClick={()=>setPlannerView("list")} style={{...S.ghost,padding:"4px 12px",borderRadius:6,background:plannerView==="list"?"var(--bg-secondary)":"transparent",color:plannerView==="list"?"var(--text-primary)":"var(--text-muted)"}}>List</button>
                </div>
              </div>
              <button style={S.btn("var(--accent-color)")} onClick={async ()=>{const np=await createNewPost({title:"untitled post",type:"REEL",status:"DRAFT",mood:"soft"});setSelectedPost(np);}}>+ new post</button>
            </div>

            {plannerView === "calendar" && (
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <NavBtn onClick={()=>navigateCal("prev")}>‹</NavBtn>
                    <span style={{fontSize:16,fontWeight:500,color:"var(--text-secondary)",minWidth:164,textAlign:"center"}}>{MONTHS[calMonth]} {calYear}</span>
                    <NavBtn onClick={()=>navigateCal("next")}>›</NavBtn>
                    {!todayInView&&<NavBtn onClick={()=>navigateCal("today")} active color="var(--accent-color)">today</NavBtn>}
                  </div>
                </div>

                <div className={calFade?"cal-grid cal-fade":"cal-grid cal-show"} style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:22}}>
                  {DAYS.map(d=><div key={d} style={{fontSize:11,color:"var(--text-muted)",textAlign:"center",paddingBottom:6,letterSpacing:0.3}}>{d}</div>)}
                  {cells.map((d,i)=>{
                    const ds=d?toDateStr(new Date(calYear,calMonth,d)):null;
                    const tod=ds&&isToday(ds);
                    const dp=postsOnDay(d);
                    return(
                    <div key={i} style={{minHeight:66,borderRadius:12,padding:"5px 6px",background:d?(tod?"var(--accent-light)":"var(--bg-secondary)"):"transparent",border:d?(tod?"1.5px solid var(--border-focus)":"1px solid var(--border-color)"):"none"}}>
                      {d&&<><div style={{fontSize:11,color:tod?"var(--accent-color)":"var(--text-muted)",fontWeight:tod?600:400,marginBottom:3}}>{d}</div>
                      {dp.map(p=><div key={p.id} onClick={()=>setSelectedPost(p)} style={{fontSize:10,padding:"2px 5px",borderRadius:6,marginBottom:2,cursor:"pointer",background:MOOD_COLORS[p.mood]+"22",color:MOOD_COLORS[p.mood],overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
                        {TYPE_ICONS[p.type] || "•"} {p.title}
                        {p.publishAt && <span style={{display:"block",fontSize:9,color:"var(--accent-color)",marginTop:2}}>{new Date(p.publishAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
                      </div>)}</>}
                    </div>
                  );})}
                </div>
              </>
            )}

            {plannerView === "list" && (
              <div style={{display:"flex",flexDirection:"column",gap:24}}>
                <div>
                  <h4 style={{fontSize:14,color:"var(--accent-color)",borderBottom:"1px solid var(--border-color)",paddingBottom:8,marginBottom:12}}>Scheduled Content</h4>
                  {posts.filter(p => p.status === "SCHEDULED").length === 0 && <div style={{fontSize:12,color:"var(--text-muted)"}}>No posts scheduled.</div>}
                  {posts.filter(p => p.status === "SCHEDULED").sort((a,b)=>new Date(a.publishAt||0).getTime() - new Date(b.publishAt||0).getTime()).map(p => (
                    <div key={p.id} onClick={()=>setSelectedPost(p)} style={{...S.card,marginBottom:6,cursor:"pointer",padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:15,color:MOOD_COLORS[p.mood]}}>{TYPE_ICONS[p.type]}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,color:"var(--text-primary)",fontWeight:600}}>{p.title}</div>
                        <div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>
                          Scheduled for: {p.publishAt ? new Date(p.publishAt).toLocaleString() : "TBD"}
                        </div>
                      </div>
                      <Tag label="SCHEDULED" color={STATUS_COLORS["SCHEDULED"]}/>
                      <Tag label={p.type} color="#ccc" />
                    </div>
                  ))}
                </div>
                
                <div>
                  <h4 style={{fontSize:14,color:"var(--text-secondary)",borderBottom:"1px solid var(--border-color)",paddingBottom:8,marginBottom:12}}>Upcoming Content</h4>
                  {posts.filter(p => ["DRAFT", "REVIEW", "APPROVED"].includes(p.status)).length === 0 && <div style={{fontSize:12,color:"var(--text-muted)"}}>No upcoming posts.</div>}
                  {posts.filter(p => ["DRAFT", "REVIEW", "APPROVED"].includes(p.status)).sort((a,b)=>(a.date||"").localeCompare(b.date||"")).map(p => (
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
            
            {/* Kept "all posts" at bottom for completeness (optional) */}
            <div style={{marginTop:32}}><span style={{...S.label,marginBottom:10}}>all posts history</span>
              {["PUBLISHED", "FAILED", "ARCHIVED"].map(status=>{
                const group=posts.filter(p=>p.status===status).sort((a,b)=>(a.date||"").localeCompare(b.date||""));
                if(!group.length)return null;
                return(<div key={status} style={{marginBottom:18}}>
                  <div style={{fontSize:11,color:STATUS_COLORS[status],marginBottom:7,letterSpacing:0.5}}>{status==="PUBLISHED"?"released into the universe":status}</div>
                  {group.map(p=><div key={p.id} onClick={()=>setSelectedPost(p)} style={{...S.card,marginBottom:6,cursor:"pointer",padding:"10px 14px",display:"flex",alignItems:"center",gap:10,opacity:status==="ARCHIVED"?0.5:1}}>
                    <span style={{fontSize:15,color:MOOD_COLORS[p.mood]}}>{TYPE_ICONS[p.type]}</span>
                    <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,color:"var(--text-primary)",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{p.title}</div><div style={{fontSize:11,color:"var(--text-muted)",marginTop:2}}>{isToday(p.date)?"today ✧":friendlyDate(p.date)} · {p.mood}{p.shootId?" · 🎬":""}</div></div>
                    <Tag label={status==="PUBLISHED"?"released":status} color={STATUS_COLORS[status]}/>
                  </div>)}
                </div>);
              })}
            </div>
          </div>
        )}

        `;
        
  content = before + newContent + after;
}

fs.writeFileSync(file, content);
console.log("App.jsx updated with Content Planner Schedule view.");
