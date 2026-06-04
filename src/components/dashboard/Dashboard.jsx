import React, { useMemo } from "react";

export function Dashboard({ posts = [], brolls = [], collabs = [], setTab }) {
  
  // Calculate Action Required metrics
  const postsMissingMedia = posts.filter(p => p.status === "DRAFT" && (!p.brolls || p.brolls.length === 0));
  const postsAwaitingReview = posts.filter(p => p.status === "REVIEW");
  const failedPublications = posts.filter(p => p.status === "FAILED");
  const deliverablesDue = collabs.flatMap(c => c.deliverables || []).filter(d => !d.completed);

  // Other widgets
  const drafts = posts.filter(p => p.status === "DRAFT");
  const approved = posts.filter(p => p.status === "APPROVED");
  const scheduled = posts.filter(p => p.status === "SCHEDULED");
  
  const todayStr = new Date().toISOString().split('T')[0];
  const publishingToday = scheduled.filter(p => p.publishAt && p.publishAt.startsWith(todayStr));
  
  const recentUploads = [...brolls].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <h2 style={{ margin: "0 0 8px 0", fontSize: 24 }}>Command Center</h2>
        <p style={{ margin: 0, color: "var(--text-muted)" }}>What should I work on next?</p>
      </div>

      {/* Action Required Widget */}
      <div style={{ background: "var(--bg-secondary)", borderRadius: 16, padding: 24, border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
        <h3 style={{ margin: "0 0 20px 0", fontSize: 18, color: "var(--status-error)" }}>⚠️ Action Required</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          
          <div onClick={() => setTab("planner")} style={{ background: "var(--bg-primary)", padding: 16, borderRadius: 12, border: "1px solid var(--border-color)", cursor: "pointer", transition: "0.2s", ":hover": { borderColor: "var(--status-error)" } }}>
            <div style={{ fontSize: 28, fontWeight: "bold", color: postsMissingMedia.length > 0 ? "var(--status-error)" : "var(--text-primary)" }}>{postsMissingMedia.length}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Posts Missing Media</div>
          </div>

          <div onClick={() => setTab("planner")} style={{ background: "var(--bg-primary)", padding: 16, borderRadius: 12, border: "1px solid var(--border-color)", cursor: "pointer" }}>
            <div style={{ fontSize: 28, fontWeight: "bold", color: postsAwaitingReview.length > 0 ? "orange" : "var(--text-primary)" }}>{postsAwaitingReview.length}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Awaiting Review</div>
          </div>

          <div onClick={() => setTab("planner")} style={{ background: "var(--bg-primary)", padding: 16, borderRadius: 12, border: "1px solid var(--border-color)", cursor: "pointer" }}>
            <div style={{ fontSize: 28, fontWeight: "bold", color: failedPublications.length > 0 ? "var(--status-error)" : "var(--text-primary)" }}>{failedPublications.length}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Failed Publications</div>
          </div>

          <div onClick={() => setTab("collabs")} style={{ background: "var(--bg-primary)", padding: 16, borderRadius: 12, border: "1px solid var(--border-color)", cursor: "pointer" }}>
            <div style={{ fontSize: 28, fontWeight: "bold", color: deliverablesDue.length > 0 ? "orange" : "var(--text-primary)" }}>{deliverablesDue.length}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Deliverables Due</div>
          </div>

        </div>
      </div>

      {/* Content Pipeline */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
        
        {/* Planner Overview */}
        <div style={{ background: "var(--bg-secondary)", borderRadius: 16, padding: 24, border: "1px solid var(--border-color)" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: 16 }}>Content Pipeline</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--border-color)" }}>
              <span style={{ color: "var(--text-muted)" }}>Drafts</span>
              <span style={{ fontWeight: "bold" }}>{drafts.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--border-color)" }}>
              <span style={{ color: "var(--text-muted)" }}>Approved</span>
              <span style={{ fontWeight: "bold", color: approved.length > 0 ? "var(--accent-color)" : "inherit" }}>{approved.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid var(--border-color)" }}>
              <span style={{ color: "var(--text-muted)" }}>Scheduled</span>
              <span style={{ fontWeight: "bold" }}>{scheduled.length}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
              <span style={{ color: "var(--text-muted)" }}>Publishing Today</span>
              <span style={{ fontWeight: "bold", color: publishingToday.length > 0 ? "var(--accent-color)" : "inherit" }}>{publishingToday.length}</span>
            </div>
          </div>
          <button onClick={() => setTab("planner")} style={{ width: "100%", marginTop: 24, padding: "10px", background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 8, color: "var(--text-primary)", cursor: "pointer", fontWeight: "bold" }}>
            Open Planner
          </button>
        </div>

        {/* Recent Uploads */}
        <div style={{ background: "var(--bg-secondary)", borderRadius: 16, padding: 24, border: "1px solid var(--border-color)" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: 16 }}>Recent Uploads</h3>
          {recentUploads.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No recent uploads.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {recentUploads.map(asset => (
                <div key={asset.id} style={{ aspectRatio: "9/16", borderRadius: 8, overflow: "hidden", position: "relative", background: "#000" }}>
                  <img src={asset.thumbnailUrl} alt={asset.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", padding: "4px 8px" }}>
                    <p style={{ margin: 0, fontSize: 10, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{asset.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setTab("vault")} style={{ width: "100%", marginTop: 24, padding: "10px", background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: 8, color: "var(--text-primary)", cursor: "pointer", fontWeight: "bold" }}>
            Open Vault
          </button>
        </div>

      </div>
    </div>
  );
}
