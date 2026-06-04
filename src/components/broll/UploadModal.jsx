import React, { useState, useRef } from "react";
import axios from "axios";
import { api } from "../../api/axios";

export function UploadModal({ onClose, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Validate file type
    if (!selectedFile.type.startsWith("video/")) {
      setError("Please select a valid video file (.mp4, .mov)");
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
      // 1. Get upload signature from our backend
      const sigResponse = await api.post("/broll/upload-signature");
      
      const { signature, timestamp, cloudName, apiKey } = sigResponse.data;

      // 2. Prepare FormData for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", "broll-vault");

      // 3. Upload directly to Cloudinary
      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          },
        }
      );

      // 4. Return the URLs
      const secureUrl = uploadRes.data.secure_url;
      // Generate thumbnail URL by replacing extension with .jpg
      const thumbnailUrl = secureUrl.replace(/\.[^/.]+$/, ".jpg");
      
      onUploadComplete({ fileUrl: secureUrl, thumbnailUrl, clipType: "video" });
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload video. Please try again.");
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
        borderRadius: 16, padding: 24, maxWidth: 400, width: "100%",
        display: "flex", flexDirection: "column", gap: 16,
        boxShadow: "var(--shadow-lg)"
      }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>Upload Video</h3>
        
        {!isUploading && (
          <div 
            style={{
              border: "2px dashed var(--border-color)", borderRadius: 12, padding: 32,
              textAlign: "center", cursor: "pointer", background: "var(--bg-primary)"
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept="video/mp4,video/quicktime" 
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            {file ? (
              <p style={{ margin: 0, color: "var(--accent-color)", fontWeight: "600" }}>{file.name}</p>
            ) : (
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>Click to select a video (.mp4, .mov)</p>
            )}
          </div>
        )}

        {error && <p style={{ color: "var(--status-error)", fontSize: 13, margin: 0 }}>{error}</p>}

        {isUploading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)" }}>
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div style={{ height: 6, background: "var(--border-color)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent-color)", transition: "width 0.2s" }} />
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
          <button 
            onClick={onClose} 
            disabled={isUploading}
            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload}
            disabled={!file || isUploading}
            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--accent-color)", color: "#fff", cursor: (!file || isUploading) ? "not-allowed" : "pointer", opacity: (!file || isUploading) ? 0.5 : 1 }}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
