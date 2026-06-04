import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { apiBaseUrl } from "../api/axios";

export function UnifiedMediaPicker({ onClose, onSelect }) {
  const [activeTab, setActiveTab] = useState("upload"); // upload, vault
  
  // Upload State
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Vault State
  const [vaultAssets, setVaultAssets] = useState([]);
  const [isLoadingVault, setIsLoadingVault] = useState(false);

  useEffect(() => {
    if (activeTab === "vault") {
      fetchVaultAssets();
    }
  }, [activeTab]);

  const fetchVaultAssets = async () => {
    setIsLoadingVault(true);
    try {
      const token = localStorage.getItem("sb-creator-token");
      const res = await axios.get(`${apiBaseUrl}/broll`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sort by latest first
      const assets = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setVaultAssets(assets);
    } catch (err) {
      console.error("Failed to load vault assets:", err);
    } finally {
      setIsLoadingVault(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    if (!selectedFile.type.startsWith("video/") && !selectedFile.type.startsWith("image/")) {
      setError("Please select a valid media file (video or image).");
      return;
    }
    
    setFile(selectedFile);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      // 1. Signature
      const token = localStorage.getItem("sb-creator-token");
      const sigResponse = await axios.post(
        `${apiBaseUrl}/broll/upload-signature`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const { signature, timestamp, cloudName, apiKey } = sigResponse.data;

      // 2. Cloudinary Upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", "broll-vault");

      const resourceType = file.type.startsWith("video/") ? "video" : "image";

      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          },
        }
      );

      const secureUrl = uploadRes.data.secure_url;
      const thumbnailUrl = resourceType === "video" ? secureUrl.replace(/\.[^/.]+$/, ".jpg") : secureUrl;
      
      // 3. Auto Create BRoll Record
      const brollData = {
        title: file.name,
        description: "",
        mood: "cinematic",
        visualTags: [],
        emotionTags: [],
        clipType: resourceType,
        energy: "soft",
        fileUrl: secureUrl,
        thumbnailUrl: thumbnailUrl,
        status: "READY",
        fileSize: uploadRes.data.bytes,
        duration: Math.round(uploadRes.data.duration || 0),
        resolution: `${uploadRes.data.width}x${uploadRes.data.height}`,
        mimeType: file.type
      };

      const createRes = await axios.post(
        `${apiBaseUrl}/broll`,
        brollData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Return the generated asset
      onSelect(createRes.data);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload media. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(18, 17, 16, 0.6)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 2000, padding: 20
    }}>
      <div style={{
        background: "var(--bg-secondary)", border: "1px solid var(--border-color)",
        borderRadius: 16, padding: 24, maxWidth: 600, width: "100%", maxHeight: "80vh",
        display: "flex", flexDirection: "column", gap: 16,
        boxShadow: "var(--shadow-lg)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Attach Media</h3>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 20, color: "var(--text-muted)" }}>&times;</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 16, borderBottom: "1px solid var(--border-color)", paddingBottom: 8 }}>
          <button 
            onClick={() => setActiveTab("upload")}
            style={{
              background: "transparent", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500,
              color: activeTab === "upload" ? "var(--text-primary)" : "var(--text-muted)",
              borderBottom: activeTab === "upload" ? "2px solid var(--accent-color)" : "none",
              paddingBottom: 4
            }}
          >
            Upload Device
          </button>
          <button 
            onClick={() => setActiveTab("vault")}
            style={{
              background: "transparent", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500,
              color: activeTab === "vault" ? "var(--text-primary)" : "var(--text-muted)",
              borderBottom: activeTab === "vault" ? "2px solid var(--accent-color)" : "none",
              paddingBottom: 4
            }}
          >
            Asset Vault (Recent)
          </button>
        </div>

        {activeTab === "upload" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {!isUploading && (
              <div 
                style={{
                  border: "2px dashed var(--border-color)", borderRadius: 12, padding: 48,
                  textAlign: "center", cursor: "pointer", background: "var(--bg-primary)"
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  accept="video/*,image/*" 
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
                {file ? (
                  <p style={{ margin: 0, color: "var(--accent-color)", fontWeight: "600" }}>{file.name}</p>
                ) : (
                  <p style={{ margin: 0, color: "var(--text-secondary)" }}>Click or drag to select media</p>
                )}
              </div>
            )}

            {error && <p style={{ color: "var(--status-error)", fontSize: 13, margin: 0 }}>{error}</p>}

            {isUploading && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "20px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-primary)" }}>
                  <span>Uploading to Secure Vault...</span>
                  <span>{progress}%</span>
                </div>
                <div style={{ height: 8, background: "var(--border-color)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent-color)", transition: "width 0.2s" }} />
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <button 
                onClick={handleUpload}
                disabled={!file || isUploading}
                style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "var(--accent-color)", color: "#fff", cursor: (!file || isUploading) ? "not-allowed" : "pointer", opacity: (!file || isUploading) ? 0.5 : 1, fontWeight: 600 }}
              >
                {isUploading ? "Uploading..." : "Upload & Attach"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "vault" && (
          <div style={{ overflowY: "auto", flex: 1, paddingRight: 8 }}>
            {isLoadingVault ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>Loading assets...</div>
            ) : vaultAssets.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No assets found in vault.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
                {vaultAssets.map(asset => (
                  <div 
                    key={asset.id} 
                    onClick={() => onSelect(asset)}
                    style={{
                      border: "1px solid var(--border-color)", borderRadius: 8, overflow: "hidden", cursor: "pointer",
                      position: "relative", aspectRatio: "9/16", background: "var(--bg-primary)"
                    }}
                  >
                    <img src={asset.thumbnailUrl} alt={asset.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", padding: "4px 8px" }}>
                      <p style={{ margin: 0, fontSize: 11, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{asset.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
