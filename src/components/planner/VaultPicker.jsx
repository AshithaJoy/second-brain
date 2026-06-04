import React, { useState } from "react";
import { AssetCard } from "../broll/AssetCard";

export function VaultPicker({ vault, selectedIds = [], onSelect, onClose }) {
  const [search, setSearch] = useState("");

  const filteredVault = vault.filter(asset => 
    asset.title.toLowerCase().includes(search.toLowerCase()) || 
    asset.mood.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (asset) => {
    const isSelected = selectedIds.includes(asset.id);
    if (isSelected) {
      onSelect(selectedIds.filter(id => id !== asset.id));
    } else {
      onSelect([...selectedIds, asset.id]);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(18, 17, 16, 0.6)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 3000, padding: 20
    }}>
      <div style={{
        background: "var(--bg-secondary)", border: "1px solid var(--border-color)",
        borderRadius: 16, padding: 24, maxWidth: 800, width: "100%", maxHeight: "90vh",
        display: "flex", flexDirection: "column", gap: 16,
        boxShadow: "var(--shadow-lg)", overflow: "hidden"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Select B-Roll Assets</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 20 }}>×</button>
        </div>
        
        <input 
          placeholder="Search vault..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 16px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
        />

        <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {filteredVault.map(asset => (
              <div key={asset.id} style={{ position: "relative" }}>
                <AssetCard 
                  asset={asset}
                  selected={selectedIds.includes(asset.id)}
                  onSelect={handleToggle}
                />
                {selectedIds.includes(asset.id) && (
                  <div style={{
                    position: "absolute", top: -8, right: -8, width: 24, height: 24,
                    background: "var(--accent-color)", color: "#fff", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: "bold", fontSize: 14, zIndex: 10
                  }}>
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
          {filteredVault.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
              No B-Roll assets found.
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid var(--border-color)" }}>
          <button 
            onClick={onClose}
            style={{ padding: "8px 24px", borderRadius: 8, border: "none", background: "var(--accent-color)", color: "#fff", cursor: "pointer", fontWeight: "600" }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
