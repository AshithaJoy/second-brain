import React from "react";

export default function InstagramConnectionCard({
  connected,
  profile,
  lastSync,
  loading,
  error,
  syncing,
  syncStep = 0, // 0: None, 1: Profile, 2: Posts, 3: Analytics
  onConnect,
  onSync,
  onDisconnect,
  onViewIntelligence
}) {
  const S = {
    card: {
      background: "var(--bg-secondary)",
      borderRadius: "16px",
      border: "1px solid var(--border-color)",
      padding: "20px",
      boxShadow: "var(--shadow-sm)",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      width: "100%",
      boxSizing: "border-box"
    },
    logoContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "48px",
      height: "48px",
      borderRadius: "12px",
      background: "linear-gradient(135deg, #405DE6 0%, #5851DB 15%, #833AB4 30%, #C13584 45%, #E1306C 60%, #FD1D1D 75%, #F56040 90%, #FCAF45 100%)",
      color: "#FFFFFF",
      fontSize: "24px",
      fontWeight: "bold",
      flexShrink: 0
    },
    title: {
      fontSize: "15px",
      fontWeight: "600",
      color: "var(--text-primary)",
      margin: 0
    },
    desc: {
      fontSize: "12px",
      color: "var(--text-secondary)",
      lineHeight: "1.6",
      margin: 0
    },
    btn: (color = "var(--accent-color)", disabled = false) => {
      const isPrimary = color === "var(--accent-color)" || color === "#F13E93";
      const borderRadius = isPrimary ? "12px" : "24px";
      const bg = disabled ? "transparent" : (isPrimary ? "#F13E93" : `${color}15`);
      const fg = disabled ? "var(--text-muted)" : (isPrimary ? "#FFFFFF" : color);
      const border = `1.5px solid ${disabled ? "var(--border-color)" : (isPrimary ? "#F13E93" : color)}`;
      return {
        minHeight: "44px",
        padding: "10px 18px",
        borderRadius,
        border,
        background: bg,
        color: fg,
        fontSize: "13px",
        fontWeight: "600",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        width: "100%",
        ...(isPrimary && !disabled ? {
          "--btn-bg": "#F13E93",
          "--btn-color": "#FFFFFF",
          "--btn-border": "#F13E93",
          "--btn-hover-bg": "#F891BB",
          "--btn-hover-color": "#FFFFFF",
        } : {})
      };
    },
    checklist: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      marginTop: "12px"
    },
    checkItem: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "12px",
      color: active ? "var(--text-primary)" : "var(--text-muted)",
      fontWeight: active ? "500" : "400"
    }),
    checkCircle: (completed, current) => ({
      width: "16px",
      height: "16px",
      borderRadius: "50%",
      border: `1.5px solid ${completed ? "var(--accent-color)" : current ? "var(--border-focus)" : "var(--border-color)"}`,
      background: completed ? "var(--accent-color)" : "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#FFFFFF",
      fontSize: "10px",
      fontWeight: "bold",
      flexShrink: 0
    }),
    avatar: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      background: "var(--accent-light)",
      color: "var(--accent-color)",
      fontSize: "18px",
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      border: "2px solid var(--border-focus)"
    }
  };

  // State 1: Error
  if (error) {
    return (
      <div style={S.card} data-test-id="ig-card-error">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ ...S.logoContainer, background: "#f0a090" }}>⚠️</div>
          <div>
            <h4 style={S.title}>Instagram Connection Failed</h4>
            <span style={{ fontSize: "11px", color: "#f0a090", fontWeight: "500" }}>Error State</span>
          </div>
        </div>
        <p style={{ ...S.desc, color: "#f0a090", background: "rgba(240, 160, 144, 0.1)", padding: "10px 14px", borderRadius: "10px" }}>
          {error}
        </p>
        <button onClick={onConnect} style={S.btn("#f0a090")} data-test-id="ig-retry-btn">
          🔄 Retry Connection
        </button>
      </div>
    );
  }

  // State 2: Connecting (Meta Authentication)
  if (loading && !syncing) {
    return (
      <div style={S.card} data-test-id="ig-card-connecting">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ ...S.logoContainer, opacity: 0.6 }}>⚙️</div>
          <div>
            <h4 style={S.title}>Connecting Instagram...</h4>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Meta OAuth Flow</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", gap: "10px" }}>
          <div className="connection-spinner" style={{
            width: "28px", height: "28px", border: "3px solid var(--border-color)", borderTop: "3px solid var(--accent-color)", borderRadius: "50%",
            animation: "ig-spin 1s linear infinite"
          }} />
          <p style={{ ...S.desc, textAlign: "center", fontSize: "11px" }}>
            Authenticating with Meta... Please complete the login popup window.
          </p>
        </div>
        <button disabled style={S.btn("var(--border-color)", true)}>
          Connect Instagram
        </button>
      </div>
    );
  }

  // State 3: Syncing
  if (syncing) {
    return (
      <div style={S.card} data-test-id="ig-card-syncing">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={S.logoContainer}>🔄</div>
          <div>
            <h4 style={S.title}>Syncing Instagram...</h4>
            <span style={{ fontSize: "11px", color: "var(--accent-color)", fontWeight: "500" }}>Updating Creator Intelligence</span>
          </div>
        </div>
        <div style={{ padding: "8px 0" }}>
          <p style={S.desc}>Fetching your latest Instagram profile credentials, media items, and metrics:</p>
          
          <div style={S.checklist}>
            <div style={S.checkItem(syncStep >= 1)}>
              <div style={S.checkCircle(syncStep > 1, syncStep === 1)}>
                {syncStep > 1 ? "✓" : syncStep === 1 ? "●" : ""}
              </div>
              <span>Profile Credentials</span>
            </div>
            <div style={S.checkItem(syncStep >= 2)}>
              <div style={S.checkCircle(syncStep > 2, syncStep === 2)}>
                {syncStep > 2 ? "✓" : syncStep === 2 ? "●" : ""}
              </div>
              <span>Recent Posts & Media</span>
            </div>
            <div style={S.checkItem(syncStep >= 3)}>
              <div style={S.checkCircle(syncStep > 3, syncStep === 3)}>
                {syncStep > 3 ? "✓" : syncStep === 3 ? "●" : ""}
              </div>
              <span>Growth Analytics</span>
            </div>
          </div>
        </div>
        <button disabled style={S.btn("var(--border-color)", true)}>
          Syncing Channel...
        </button>
      </div>
    );
  }

  // State 4: Connected
  if (connected && profile) {
    const initials = profile.username ? profile.username.slice(0, 2).toUpperCase() : "IG";
    return (
      <div style={S.card} data-test-id="ig-card-connected">
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} style={{ ...S.avatar, objectFit: "cover" }} alt={profile.username} />
          ) : (
            <div style={S.avatar}>{initials}</div>
          )}
          <div style={{ flex: 1 }}>
            <h4 style={{ ...S.title, fontSize: "16px", color: "var(--accent-color)" }}>@{profile.username}</h4>
            <div style={{ display: "flex", gap: "12px", marginTop: "4px", fontSize: "11px", color: "var(--text-muted)", fontWeight: "500" }}>
              <span>Creator Account</span>
              <span>•</span>
              <span>{profile.mediaCount || 0} Posts</span>
            </div>
          </div>
        </div>

        <div style={{
          background: "var(--bg-primary)",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          padding: "12px 14px",
          fontSize: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "6px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)" }}>Last Synced:</span>
            <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>{lastSync || "Just now"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "var(--text-muted)" }}>Creator Intelligence:</span>
            <span style={{ color: "var(--accent-color)", fontWeight: "600", fontSize: "11px", background: "rgba(168, 200, 160, 0.15)", padding: "2px 8px", borderRadius: "10px" }}>
              Ready
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <button onClick={onSync} style={{ ...S.btn("var(--accent-color)"), height: "44px" }} data-test-id="ig-sync-btn">
              🔄 Sync Account
            </button>
            <button onClick={onViewIntelligence} style={{ ...S.btn("var(--accent-color)"), height: "44px" }} data-test-id="ig-intel-btn">
              📊 View Insights
            </button>
          </div>
          <button onClick={onDisconnect} style={{ ...S.btn("#f0a090"), height: "44px" }} data-test-id="ig-disconnect-btn">
            🔌 Disconnect Account
          </button>
        </div>
      </div>
    );
  }

  // State 5: Not Connected
  return (
    <div style={S.card} data-test-id="ig-card-not-connected">
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={S.logoContainer}>📸</div>
        <div>
          <h4 style={S.title}>Instagram Account</h4>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Not Linked</span>
        </div>
      </div>
      
      <p style={S.desc}>
        Connect your Instagram creator profile to authorize InstaBrain to audit content performance and recommend viral hook ideas.
      </p>

      <ul style={{ 
        margin: "0 0 4px", 
        paddingLeft: "20px", 
        fontSize: "11px", 
        color: "var(--text-secondary)",
        display: "flex",
        flexDirection: "column",
        gap: "6px"
      }}>
        <li>📊 <strong>Creator Intelligence:</strong> Overall health metrics scorecard</li>
        <li>🧬 <strong>Content Distribution:</strong> Format allocation visualizer</li>
        <li>🪝 <strong>Hook Intelligence:</strong> Viral hook database audits</li>
        <li>⚡ <strong>AI Suggestions:</strong> Personal content gap prompts</li>
      </ul>

      <button onClick={onConnect} style={{ ...S.btn("var(--accent-color)"), minHeight: "44px", fontWeight: "600" }} data-test-id="ig-connect-btn">
        🔌 Connect Instagram
      </button>
    </div>
  );
}
