import { useState } from "react";
import { useAuthStore } from "../stores/auth.store";
import { GoogleLogin } from "@react-oauth/google";

export default function Register({ onSwitchToLogin }) {
  const [creatorName, setCreatorName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const register = useAuthStore((state) => state.register);
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const googleLoginStore = useAuthStore((state) => state.googleLogin);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!creatorName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg("Please fill in all details");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long");
      return;
    }
    setErrorMsg("");
    try {
      await register(creatorName, email, password);
      await login(email, password);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      width: "100vw",
      background: "radial-gradient(circle at center, #1C1C1E 0%, #121214 100%)",
      color: "#F2F2F2",
      fontFamily: "var(--font-sans)",
      padding: "20px",
      boxSizing: "border-box"
    }} className="card-in">
      <div style={{
        width: "100%",
        maxWidth: "400px",
        background: "rgba(28, 28, 30, 0.65)",
        backdropFilter: "blur(12px)",
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        padding: "40px 32px",
        boxShadow: "0 24px 64px rgba(0, 0, 0, 0.6)",
        textAlign: "center",
        position: "relative",
      }}>
        <div style={{
          position: "absolute",
          top: -30,
          left: "50%",
          transform: "translateX(-50%)",
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--accent-color) 0%, var(--accent-dark) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          boxShadow: "0 8px 24px var(--accent-light)",
        }}>
          ✨
        </div>

        <h2 style={{
          fontSize: 28,
          fontWeight: 400,
          fontFamily: "var(--font-serif)",
          color: "var(--text-primary)",
          marginTop: 10,
          marginBottom: 8,
          letterSpacing: "-0.01em"
        }}>
          register creator ID
        </h2>
        <p style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          marginBottom: 32,
          fontStyle: "italic"
        }}>
          initialize your creator identity
        </p>

        {errorMsg && (
          <div style={{
            background: "rgba(240, 160, 144, 0.15)",
            border: "1px solid rgba(240, 160, 144, 0.3)",
            borderRadius: "12px",
            color: "#f0a090",
            fontSize: 13,
            padding: "12px",
            marginBottom: 24,
            textAlign: "left"
          }} className="card-in">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block",
              fontSize: 11,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8
            }}>
              creator name
            </label>
            <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Elena Rostova"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                background: "rgba(18, 18, 20, 0.6)",
                color: "#FFFFFF",
                fontSize: 14,
                outline: "none",
                transition: "all 0.2s"
              }}
              required
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: "block",
              fontSize: 11,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8
            }}>
              email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="creator@secondbrain.ai"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                background: "rgba(18, 18, 20, 0.6)",
                color: "#FFFFFF",
                fontSize: 14,
                outline: "none",
                transition: "all 0.2s"
              }}
              required
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{
              display: "block",
              fontSize: 11,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8
            }}>
              password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (min 6 chars)"
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid var(--border-color)",
                background: "rgba(18, 18, 20, 0.6)",
                color: "#FFFFFF",
                fontSize: 14,
                outline: "none",
                transition: "all 0.2s"
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(135deg, var(--accent-color) 0%, var(--accent-dark) 100%)",
              color: "#FFFFFF",
              fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 8px 24px rgba(94, 92, 230, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            }}
          >
            {loading ? "Initializing Workspace..." : "Create Creator OS Profile →"}
          </button>
        </form>

        <div style={{
          display: "flex",
          alignItems: "center",
          margin: "20px 0 16px 0",
          color: "var(--text-secondary)",
          fontSize: 11
        }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-color)", opacity: 0.5 }}></div>
          <span style={{ padding: "0 10px", textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.6 }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-color)", opacity: 0.5 }}></div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              setErrorMsg("");
              try {
                // If creating via Google, we can pass a fallback creator name just in case
                await googleLoginStore(credentialResponse.credential, creatorName);
              } catch (err) {
                setErrorMsg("Failed to authenticate with Google");
              }
            }}
            onError={() => {
              setErrorMsg("Failed to initiate Google login");
            }}
            theme="filled_black"
            text="continue_with"
            shape="rectangular"
          />
        </div>

        <div style={{
          marginTop: 24,
          fontSize: 13,
          color: "var(--text-secondary)"
        }}>
          already registered?{" "}
          <button
            onClick={onSwitchToLogin}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent-color)",
              cursor: "pointer",
              padding: 0,
              fontSize: "inherit",
              textDecoration: "underline"
            }}
          >
            Login to workspace
          </button>
        </div>
      </div>
    </div>
  );
}
