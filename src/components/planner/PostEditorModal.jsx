import { useState } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { VaultPicker } from "./VaultPicker";
import { schedulePost } from "../../api/planner.api";

const POST_TYPES = ["REEL", "IMAGE", "CAROUSEL", "STORY", "NOTE"];
const STATUS_OPTIONS = ["DRAFT", "REVIEW", "APPROVED", "SCHEDULED", "PUBLISHED", "FAILED", "ARCHIVED"];
const MOODS = ["cinematic", "soft", "chaotic", "reflective", "motivated", "low-energy", "rebuilding", "funny", "existential"];

export function PostEditorModal({ post, onSave, onClose, vault = [] }) {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    title: post?.title || "",
    date: post?.date || new Date().toISOString().split('T')[0],
    mood: post?.mood || "cinematic",
    type: post?.type || "REEL",
    status: post?.status || "DRAFT",
    caption: post?.caption || "",
    hashtags: post?.hashtags || "",
    notes: post?.notes || "",
    brollIds: post?.brolls?.map(b => b.id) || [],
    publishAtDate: post?.publishAt ? new Date(post.publishAt).toISOString().split('T')[0] : "",
    publishAtTime: post?.publishAt ? new Date(post.publishAt).toTimeString().substring(0, 5) : ""
  });
  const [showVaultPicker, setShowVaultPicker] = useState(false);
  const [schedulingError, setSchedulingError] = useState("");

  const updateForm = (patch) => setForm(f => ({ ...f, ...patch }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    
    let publishAt = null;
    if (form.publishAtDate && form.publishAtTime) {
      publishAt = new Date(`${form.publishAtDate}T${form.publishAtTime}`).toISOString();
    }
    
    onSave({ ...form, id: post?.id, publishAt });
  };

  const handleSchedule = async () => {
    setSchedulingError("");
    try {
      // First save the current form so the backend has the publishAt and assets
      let publishAt = null;
      if (form.publishAtDate && form.publishAtTime) {
        publishAt = new Date(`${form.publishAtDate}T${form.publishAtTime}`).toISOString();
      }
      // Assuming onSave returns a promise
      await onSave({ ...form, id: post?.id, publishAt });
      
      // Then call the schedule API
      if (post?.id) {
        await schedulePost(post.id);
        onClose(); // Close on success
      }
    } catch (err) {
      setSchedulingError(err.response?.data?.error || err.message || "Failed to schedule");
    }
  };

  const attachedBRolls = vault.filter(v => form.brollIds.includes(v.id));
  
  // Validation calculations for the preview panel
  const isInstagramConnected = !!(user?.instagramUserId && user?.instagramConnectedAt);
  const videoAssets = attachedBRolls.filter(b => b.format === "video").length;
  const imageAssets = attachedBRolls.filter(b => b.format === "image").length;
  
  let assetsValid = false;
  if (form.type === "REEL" && videoAssets >= 1) assetsValid = true;
  if (form.type === "IMAGE" && imageAssets >= 1) assetsValid = true;
  if (form.type === "STORY" && (videoAssets >= 1 || imageAssets >= 1)) assetsValid = true;
  if (form.type === "CAROUSEL" && attachedBRolls.length >= 2) assetsValid = true;

  const hasPublishAt = !!(form.publishAtDate && form.publishAtTime);
  let isPublishAtFuture = false;
  if (hasPublishAt) {
    const pDate = new Date(`${form.publishAtDate}T${form.publishAtTime}`);
    isPublishAtFuture = pDate > new Date();
  }

  const isApproved = form.status === "APPROVED";
  const isPublishingReady = isApproved && assetsValid && isInstagramConnected && isPublishAtFuture && form.type !== "NOTE";

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
        borderRadius: 16, width: "100%", maxWidth: 800, maxHeight: "90vh",
        display: "flex", flexDirection: "column",
        boxShadow: "var(--shadow-lg)"
      }}>
        <div style={{ padding: 24, borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>{post ? "Edit Post" : "New Post"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Title</span>
                <input value={form.title} onChange={e => updateForm({ title: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} placeholder="Post Title" />
              </div>
              <div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Date (Planner)</span>
                <input type="date" value={form.date} onChange={e => updateForm({ date: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Publish Type</span>
                <select value={form.type} onChange={e => updateForm({ type: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
                  {POST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Status</span>
                <select value={form.status} onChange={e => updateForm({ status: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Mood</span>
                <select value={form.mood} onChange={e => updateForm({ mood: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
                  {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: "600", color: "var(--text-primary)" }}>Attached Media Assets</span>
                <button 
                  onClick={() => setShowVaultPicker(true)}
                  style={{ background: "var(--accent-color)", color: "#fff", border: "none", padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
                >
                  + Attach Assets
                </button>
              </div>
              
              {attachedBRolls.length > 0 ? (
                <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
                  {attachedBRolls.map(b => (
                    <div key={b.id} style={{ position: "relative", minWidth: 100, height: 60, borderRadius: 8, overflow: "hidden", background: "#000" }}>
                      <img src={b.thumbnailUrl} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} alt={b.title} />
                      <button 
                        onClick={() => updateForm({ brollIds: form.brollIds.filter(id => id !== b.id) })}
                        style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 16, background: "var(--bg-primary)", border: "1px dashed var(--border-color)", borderRadius: 8, textAlign: "center", color: "var(--text-muted)", fontSize: 12 }}>
                  No assets attached. Click to add from B-Roll Vault.
                </div>
              )}
            </div>

            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 16 }}>
              <span style={{ fontSize: 13, fontWeight: "600", color: "var(--text-primary)", display: "block", marginBottom: 12 }}>Scheduling</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Publish Date</span>
                  <input type="date" value={form.publishAtDate} onChange={e => updateForm({ publishAtDate: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Publish Time</span>
                  <input type="time" value={form.publishAtTime} onChange={e => updateForm({ publishAtTime: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-primary)", color: "var(--text-primary)" }} />
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </div>
            </div>

          </div>

          <div style={{ width: 280, borderLeft: "1px solid var(--border-color)", padding: 24, display: "flex", flexDirection: "column", gap: 16, background: "var(--bg-primary)" }}>
            <h4 style={{ margin: 0, fontSize: 14 }}>Instagram Publishing Preview</h4>
            
            <div style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 8, background: "var(--bg-secondary)", padding: 16, borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Type:</span>
                <span>{form.type}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Status:</span>
                <span style={{ color: form.status === "APPROVED" ? "var(--accent-color)" : "inherit" }}>{form.status}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Assets:</span>
                <span style={{ color: assetsValid ? "var(--accent-color)" : "#f88" }}>{attachedBRolls.length} ({videoAssets}V, {imageAssets}I)</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Instagram Connected:</span>
                <span style={{ color: isInstagramConnected ? "var(--accent-color)" : "#f88" }}>{isInstagramConnected ? "Yes" : "No"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Scheduled Time:</span>
                <span style={{ color: isPublishAtFuture ? "var(--accent-color)" : "#f88" }}>
                  {hasPublishAt ? `${form.publishAtDate} ${form.publishAtTime}` : "Not set"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--border-color)" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: "bold" }}>Publishing Ready:</span>
                <span style={{ color: isPublishingReady ? "var(--accent-color)" : "#f88", fontWeight: "bold" }}>{isPublishingReady ? "Yes" : "No"}</span>
              </div>
            </div>

            {schedulingError && (
              <div style={{ fontSize: 12, color: "#f88", padding: "8px 12px", background: "rgba(255,136,136,0.1)", borderRadius: 8 }}>
                {schedulingError}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: 24, borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
             {isPublishingReady && post?.id && form.status === "APPROVED" && (
              <button onClick={handleSchedule} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--accent-color)", color: "#fff", cursor: "pointer", fontWeight: "bold" }}>Schedule for Publishing</button>
             )}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-primary)", cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSave} disabled={!form.title.trim()} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--text-primary)", color: "var(--bg-primary)", cursor: "pointer", opacity: !form.title.trim() ? 0.5 : 1 }}>Save Changes</button>
          </div>
        </div>
      </div>

      {showVaultPicker && (
        <VaultPicker 
          vault={vault}
          selectedIds={form.brollIds}
          onSelect={(ids) => updateForm({ brollIds: ids })}
          onClose={() => setShowVaultPicker(false)}
        />
      )}
    </div>
  );
}
