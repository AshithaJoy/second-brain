const fs = require('fs');
let c = fs.readFileSync('C:/Users/HI10148/.gemini/antigravity/scratch/second-brain/src/App.jsx', 'utf8');

if (!c.includes('apiGetPublishingHistory')) {
  // 1. Add api imports
  c = c.replace(
    '  getPosts as apiGetPosts,\n  createPost as apiCreatePost,',
    '  getPosts as apiGetPosts,\n  createPost as apiCreatePost,\n  getPublishingHistory as apiGetPublishingHistory,\n  retryPublishingJob as apiRetryPublishingJob,'
  );

  // 2. Add fetch logic inside the init effect
  c = c.replace(
    '        if (tab === "planner") {\n          const ps = await apiGetPosts();\n          setPosts(ps);',
    '        if (tab === "planner") {\n          const [ps, hist] = await Promise.all([apiGetPosts(), apiGetPublishingHistory()]);\n          setPosts(ps);\n          setPubHistory(hist);'
  );

  // 3. Add Publishing History Tab Button
  c = c.replace(
    '                  <button onClick={()=>setPlannerView("list")} style={{...S.ghost,padding:"4px 12px",borderRadius:6,background:plannerView==="list"?"var(--bg-secondary)":"transparent",color:plannerView==="list"?"var(--text-primary)":"var(--text-muted)"}}>List</button>\n                </div>\n              </div>\n              <button style={S.btn("var(--accent-color)")} onClick={async ()=>{const np=await createNewPost({title:"untitled post",type:"REEL",status:"DRAFT",mood:"soft"});setSelectedPost(np);}}>+ new post</button>',
    '                  <button onClick={()=>setPlannerView("list")} style={{...S.ghost,padding:"4px 12px",borderRadius:6,background:plannerView==="list"?"var(--bg-secondary)":"transparent",color:plannerView==="list"?"var(--text-primary)":"var(--text-muted)"}}>List</button>\n                  <button onClick={()=>setPlannerView("history")} style={{...S.ghost,padding:"4px 12px",borderRadius:6,background:plannerView==="history"?"var(--bg-secondary)":"transparent",color:plannerView==="history"?"var(--text-primary)":"var(--text-muted)"}}>Publishing History</button>\n                </div>\n              </div>\n              <button style={S.btn("var(--accent-color)")} onClick={async ()=>{const np=await createNewPost({title:"untitled post",type:"REEL",status:"DRAFT",mood:"soft"});setSelectedPost(np);}}>+ new post</button>'
  );

  // 4. Add the history view
  const historyView = `
            {plannerView === "history" && (
              <div style={{display:"flex",flexDirection:"column",gap:24}}>
                <div style={{display:"flex", gap:12, borderBottom:"1px solid var(--border-color)", paddingBottom:8}}>
                  {["Scheduled", "Published", "Failed"].map(ht => (
                    <button key={ht} onClick={() => setHistoryTab(ht)} style={{
                      ...S.ghost,
                      padding: "6px 16px",
                      borderRadius: 20,
                      background: historyTab === ht ? "var(--bg-secondary)" : "transparent",
                      color: historyTab === ht ? "var(--text-primary)" : "var(--text-muted)",
                      border: historyTab === ht ? "1px solid var(--border-focus)" : "1px solid transparent"
                    }}>
                      {ht}
                    </button>
                  ))}
                </div>

                <div>
                  {pubHistory.filter(j => 
                    historyTab === "Scheduled" ? ["PENDING", "PROCESSING"].includes(j.status) :
                    historyTab === "Published" ? j.status === "COMPLETED" :
                    j.status === "FAILED"
                  ).length === 0 && (
                    <div style={{fontSize:12,color:"var(--text-muted)", padding:"20px 0"}}>
                      No {historyTab.toLowerCase()} jobs found.
                    </div>
                  )}

                  {pubHistory.filter(j => 
                    historyTab === "Scheduled" ? ["PENDING", "PROCESSING"].includes(j.status) :
                    historyTab === "Published" ? j.status === "COMPLETED" :
                    j.status === "FAILED"
                  ).map(j => (
                    <div key={j.id} style={{...S.card,marginBottom:10,padding:"14px 18px",display:"flex",alignItems:"center",gap:16}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:14,color:"var(--text-primary)",fontWeight:600}}>{j.post?.title || "Unknown Post"}</div>
                        <div style={{fontSize:12,color:"var(--text-muted)",marginTop:4}}>
                          Publish At: {new Date(j.publishAt).toLocaleString()}
                        </div>
                        {j.lastError && (
                          <div style={{fontSize:11,color:"#f0a090",marginTop:4, background:"rgba(240, 160, 144, 0.1)", padding:"4px 8px", borderRadius:4}}>
                            Error: {j.lastError} (Attempts: {j.attempts})
                          </div>
                        )}
                        {j.instagramMediaId && (
                          <div style={{fontSize:11,color:"#a8c8a0",marginTop:4}}>
                            Media ID: {j.instagramMediaId}
                          </div>
                        )}
                      </div>
                      
                      <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8}}>
                        <Tag label={j.status} color={
                          j.status === "COMPLETED" ? "#a8c8a0" :
                          j.status === "FAILED" ? "#f0a090" :
                          "#e2c792"
                        } />
                        
                        {j.status === "FAILED" && (
                          <button 
                            onClick={async () => {
                              try {
                                await apiRetryPublishingJob(j.id);
                                showToast("Job retry queued successfully!");
                                const hist = await apiGetPublishingHistory();
                                setPubHistory(hist);
                              } catch(err) {
                                showToast("Failed to retry job", "error");
                              }
                            }}
                            style={{...S.ghost, fontSize:11, color:"var(--accent-color)", padding:"4px 12px", border:"1px solid var(--accent-light)", borderRadius:12}}
                          >
                            Retry Publish
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
`;

  c = c.replace(
    '            {plannerView === "list" && (',
    historyView + '\n            {plannerView === "list" && ('
  );

  fs.writeFileSync('C:/Users/HI10148/.gemini/antigravity/scratch/second-brain/src/App.jsx', c);
  console.log('App.jsx updated!');
} else {
  console.log('Already updated.');
}
