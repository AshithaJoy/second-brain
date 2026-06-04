import React from "react";

export function AssetCard({ asset, onSelect, selected, onEdit, onDelete }) {
  return (
    <div 
      style={{
        background: "var(--bg-secondary)",
        border: `1px solid ${selected ? "var(--accent-color)" : "var(--border-color)"}`,
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        transition: "transform 0.2s, box-shadow 0.2s",
        transform: selected ? "translateY(-2px)" : "none",
        boxShadow: selected ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
      }}
      onClick={() => onSelect && onSelect(asset)}
    >
      <div style={{ position: "relative", aspectRatio: "16/9", background: "#000" }}>
        {asset.thumbnailUrl ? (
          <img 
            src={asset.thumbnailUrl} 
            alt={asset.title} 
            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            loading="lazy"
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
            No Preview
          </div>
        )}
        {asset.clipType === "video" && (
          <div style={{
            position: "absolute", top: 8, right: 8, 
            background: "rgba(0,0,0,0.6)", color: "#fff", 
            padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: "600"
          }}>
            VIDEO
          </div>
        )}
      </div>

      <div style={{ padding: 12 }}>
        <h4 style={{ margin: "0 0 4px 0", fontSize: 14, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {asset.title}
        </h4>
        <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {asset.mood} • {asset.energy}
        </p>

        {(onEdit || onDelete) && (
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {onEdit && (
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(asset); }}
                style={{ flex: 1, padding: "4px 8px", fontSize: 11, borderRadius: 6, border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)", cursor: "pointer" }}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(asset); }}
                style={{ flex: 1, padding: "4px 8px", fontSize: 11, borderRadius: 6, border: "1px solid rgba(220, 53, 69, 0.3)", background: "rgba(220, 53, 69, 0.1)", color: "#dc3545", cursor: "pointer" }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
