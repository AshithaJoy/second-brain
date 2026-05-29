import { useEffect, useState } from "react";

const spinnerStyle = `
  .save-spinner {
    width: 12px;
    height: 12px;
    border: 2px solid var(--text-muted);
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: save-spin 0.8s linear infinite;
    display: inline-block;
  }
  @keyframes save-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export function SaveButton({ onClick, isDirty, saving, label = "Save Changes", style = {} }) {
  useEffect(() => {
    if (!document.getElementById("save-spinner-styles")) {
      const styleEl = document.createElement("style");
      styleEl.id = "save-spinner-styles";
      styleEl.innerHTML = spinnerStyle;
      document.head.appendChild(styleEl);
    }
  }, []);

  const btnStyle = {
    padding: "8px 17px",
    borderRadius: "20px",
    cursor: (isDirty && !saving) ? "pointer" : "not-allowed",
    fontFamily: "inherit",
    fontSize: "12px",
    transition: "all 0.18s",
    border: "1px solid var(--accent-color)",
    background: saving ? "transparent" : (isDirty ? "var(--accent-color)" : "transparent"),
    color: saving ? "var(--text-muted)" : (isDirty ? "var(--bg-secondary)" : "var(--text-muted)"),
    opacity: isDirty ? 1 : 0.4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    ...style
  };

  return (
    <button onClick={(isDirty && !saving) ? onClick : undefined} style={btnStyle} disabled={!isDirty || saving}>
      {saving ? (
        <>
          <span className="save-spinner"></span>
          Saving...
        </>
      ) : label}
    </button>
  );
}

export function SaveToast({ message, type = "success", onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // allow fadeout transition
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const toastStyle = {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    background: type === "success" ? "rgba(168, 200, 160, 0.95)" : "rgba(240, 160, 144, 0.95)",
    color: type === "success" ? "#1e331b" : "#4a1c14",
    border: `1px solid ${type === "success" ? "#a8c8a0" : "#f0a090"}`,
    borderRadius: "12px",
    padding: "12px 20px",
    fontSize: "13px",
    fontWeight: 500,
    boxShadow: "var(--shadow-lg)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transform: visible ? "translateY(0)" : "translateY(100px)",
    opacity: visible ? 1 : 0,
    transition: "all 0.3s ease-in-out",
    backdropFilter: "blur(8px)"
  };

  return (
    <div style={toastStyle}>
      <span>{type === "success" ? "✦" : "⚠"}</span>
      <span>{message}</span>
    </div>
  );
}
