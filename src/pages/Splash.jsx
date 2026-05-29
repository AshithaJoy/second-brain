import { useEffect } from "react";

export default function Splash() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      width: "100vw",
      background: "radial-gradient(circle at center, #1C1C1E 0%, #121214 100%)",
      color: "#F2F2F2",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 9999,
    }}>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.2; }
          50% { transform: scale(1.05); opacity: 0.6; }
          100% { transform: scale(0.95); opacity: 0.2; }
        }
        @keyframes float-logo {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
      <div style={{
        position: "absolute",
        width: 140,
        height: 140,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(94, 92, 230, 0.15) 0%, transparent 70%)",
        animation: "pulse-ring 3s infinite ease-in-out",
      }} />
      <div style={{
        fontSize: 48,
        fontWeight: 300,
        fontFamily: "var(--font-serif)",
        marginBottom: 16,
        letterSpacing: "-0.03em",
        animation: "float-logo 4s infinite ease-in-out",
        position: "relative",
      }}>
        Second Brain
      </div>
      <div style={{
        fontSize: 12,
        color: "var(--text-secondary)",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        opacity: 0.8,
      }}>
        Bootstrapping Creator OS...
      </div>
    </div>
  );
}
