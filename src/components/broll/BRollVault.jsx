import React, { useState } from "react";
import { UploadModal } from "./UploadModal";
import { AssetCard } from "./AssetCard";
import { 
  createBRoll as apiCreateBRoll,
  updateBRoll as apiUpdateBRoll,
  deleteBRoll as apiDeleteBRoll 
} from "../../api/broll.api";

// Reusing existing SelectableChip/styles or simple versions if needed
const MOODS = ["cinematic","energetic","melancholic","mysterious","upbeat","raw"];
const ENERGIES = ["soft","dynamic","chaotic","steady"];

export function BRollVault({ vault, setVault, vaultSearchQuery, setVaultSearchQuery, showToast }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  
  const [form, setForm] = useState(null);

  const emptyForm = () => ({
    title: "", description: "", mood: "cinematic", energy: "soft",
    fileUrl: "", thumbnailUrl: "", clipType: "video"
  });

  const handleUploadComplete = async (assetData) => {
    setShowUploadModal(false);
    
    // We open the edit form immediately after upload to fill out metadata
    setForm({
      ...emptyForm(),
      ...assetData
    });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      showToast("Title is required", "error");
      return;
    }

    try {
      if (editingAsset) {
        const updated = await apiUpdateBRoll(editingAsset.id, form);
        setVault(v => v.map(a => a.id === updated.id ? updated : a));
        showToast("Asset updated successfully");
      } else {
        const created = await apiCreateBRoll(form);
        setVault(v => [created, ...v]);
        showToast("Asset uploaded to vault");
      }
      setForm(null);
      setEditingAsset(null);
    } catch (err) {
      console.error(err);
      showToast("Failed to save asset", "error");
    }
  };

  const handleDelete = async (asset) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    try {
      await apiDeleteBRoll(asset.id);
      setVault(v => v.filter(a => a.id !== asset.id));
      showToast("Asset deleted");
    } catch (err) {
      showToast("Failed to delete asset", "error");
    }
  };

  const filteredVault = vault.filter(v => 
    v.title.toLowerCase().includes(vaultSearchQuery.toLowerCase()) ||
    v.mood.toLowerCase().includes(vaultSearchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: "0 0 8px 0", fontSize: 24 }}>B-Roll Vault</h1>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>Manage and tag your raw video assets</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          style={{ padding: "10px 20px", borderRadius: 8, background: "var(--accent-color)", color: "#fff", border: "none", cursor: "pointer", fontWeight: "600" }}
        >
          + Upload Video
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search by title or mood..."
          value={vaultSearchQuery}
          onChange={e => setVaultSearchQuery(e.target.value)}
          style={{ width: "100%", maxWidth: 400, padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
        {filteredVault.map(asset => (
          <AssetCard 
            key={asset.id} 
            asset={asset} 
            onEdit={(a) => { setEditingAsset(a); setForm(a); }}
            onDelete={handleDelete}
          />
        ))}
        
        {filteredVault.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "var(--text-secondary)", border: "1px dashed var(--border-color)", borderRadius: 12 }}>
            No assets found. Click 'Upload Video' to add some!
          </div>
        )}
      </div>

      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {/* Metadata Edit Form Modal */}
      {form && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(18, 17, 16, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: 20
        }}>
          <div style={{
            background: "var(--bg-secondary)", border: "1px solid var(--border-color)",
            borderRadius: 16, padding: 24, maxWidth: 500, width: "100%",
            boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", gap: 16
          }}>
            <h3 style={{ margin: 0 }}>{editingAsset ? "Edit Asset Details" : "Asset Details"}</h3>
            
            {form.fileUrl && (
              <video src={form.fileUrl} controls style={{ width: "100%", borderRadius: 8, maxHeight: 200, backgroundColor: "#000" }} />
            )}

            <input 
              placeholder="Title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
            />
            
            <textarea 
              placeholder="Description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: 80 }}
            />

            <div style={{ display: "flex", gap: 12 }}>
              <select 
                value={form.mood}
                onChange={e => setForm(f => ({ ...f, mood: e.target.value }))}
                style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
              >
                {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              
              <select 
                value={form.energy}
                onChange={e => setForm(f => ({ ...f, energy: e.target.value }))}
                style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}
              >
                {ENERGIES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 12 }}>
              <button 
                onClick={() => { setForm(null); setEditingAsset(null); }}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--accent-color)", color: "#fff", cursor: "pointer" }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
