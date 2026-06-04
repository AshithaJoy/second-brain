import React, { useState, useEffect } from 'react';
import { getInstagramIntelligence, getInstagramHooks, getInstagramOpportunities } from '../api/instagram.api';

// Confidence color mapping
const getConfidenceColor = (score) => {
  if (score >= 0.9) return "#a8c8a0"; // Green
  if (score >= 0.7) return "#f0c870"; // Yellow
  return "#b8b8c8"; // Gray
};

export default function CreatorIntelligenceDashboard({ userId, onNavigateToSettings }) {
  const [intel, setIntel] = useState(null);
  const [hooks, setHooks] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // We'd typically fetch these in parallel
        const intelData = await getInstagramIntelligence();
        const hooksData = await getInstagramHooks();
        const oppsData = await getInstagramOpportunities();
        
        setIntel(intelData.intelligence || intelData);
        setHooks(hooksData.hooks || []);
        setOpportunities(oppsData.opportunities || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load intelligence");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="card-in" style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 24, opacity: 0.5, marginBottom: 12 }}>◎</div>
        <div style={{ color: "var(--text-primary)" }}>Analyzing your Instagram footprint...</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>This may take a minute.</div>
      </div>
    );
  }

  if (error && error.includes("Not enough")) {
    return (
      <div className="card-in empty-state-card" style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 36, opacity: 0.2, marginBottom: 12 }}>◎</div>
        <h3 style={{ margin: "0 0 8px", color: "var(--text-primary)" }}>Not Enough Data</h3>
        <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 400, margin: "0 auto 20px" }}>
          We need at least 5 Instagram posts to generate a reliable Creator DNA and intelligence profile. Keep posting!
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-in" style={{ padding: 40, textAlign: "center", color: "#f0a090" }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="card-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 400, color: "var(--text-primary)" }}>Creator Intelligence</h2>
        {intel?.confidenceScore && (
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Overall Confidence: <span style={{ color: getConfidenceColor(intel.confidenceScore), fontWeight: 600 }}>{Math.round(intel.confidenceScore * 100)}%</span>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        
        {/* Creator DNA Card */}
        <div style={{ background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)", padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 16px" }}>Inferred Creator DNA</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Primary Niche</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{intel?.primaryNiche || "Unknown"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Tone of Voice</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{intel?.toneOfVoice || "Unknown"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Creator Stage</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{intel?.creatorStage || "Unknown"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Posting Style</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{intel?.postingStyle || "Unknown"}</span>
            </div>
          </div>
          <button 
            onClick={onNavigateToSettings}
            style={{ 
              marginTop: 20, width: "100%", padding: "8px", borderRadius: 12, 
              border: "1px solid var(--accent-light)", background: "transparent", color: "var(--accent-color)", 
              fontSize: 12, cursor: "pointer", fontFamily: "inherit"
            }}
          >
            Review & Edit DNA
          </button>
        </div>

        {/* Hook Intelligence */}
        <div style={{ background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)", padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 16px" }}>Hook Intelligence</h3>
          {hooks.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>No hook patterns detected yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {hooks.slice(0, 3).map((hook, i) => (
                <div key={i} style={{ borderLeft: "2px solid var(--accent-color)", paddingLeft: 12 }}>
                  <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500, marginBottom: 4 }}>"{hook.hookText}"</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Category: {hook.hookCategory}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Opportunities Panel */}
        <div style={{ background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)", padding: 20, gridColumn: "1 / -1" }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 16px" }}>Content Opportunities</h3>
          {opportunities.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>No immediate opportunities detected.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
              {opportunities.map((opp, i) => (
                <div key={i} style={{ padding: 16, background: "var(--bg-primary)", borderRadius: 12, border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: 11, color: "var(--accent-color)", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>{opp.type}</div>
                  <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>{opp.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Themes Map */}
        <div style={{ background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border-color)", padding: 20, gridColumn: "1 / -1" }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, margin: "0 0 16px" }}>Content Themes Map</h3>
          {!intel?.contentPillars || intel.contentPillars.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>No recurring themes detected yet.</div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {intel.contentPillars.map((pillar, i) => (
                <span key={i} style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  background: "var(--accent-light)",
                  color: "var(--accent-dark)",
                  fontSize: 12,
                  fontWeight: 500,
                  border: "1px solid var(--border-color)"
                }}>
                  {pillar}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
