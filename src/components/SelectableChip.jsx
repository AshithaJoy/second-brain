import React from "react";

export default function SelectableChip({
  selected,
  onClick,
  variant = "default", // default | semantic | filter
  mood = "", // reflective | motivated | excited | calm | frustrated
  icon,
  children,
  className = "",
  style = {},
  ...props
}) {
  // Map App.jsx moods to the 5 semantic mood groups
  let semanticClass = "";
  if (variant === "semantic" && mood) {
    const m = mood.toLowerCase();
    if (m === "reflective" || m === "existential") {
      semanticClass = "mood-reflective";
    } else if (m === "motivated") {
      semanticClass = "mood-motivated";
    } else if (m === "excited" || m === "chaotic" || m === "funny") {
      semanticClass = "mood-excited";
    } else if (m === "calm" || m === "soft" || m === "quiet" || m === "dreamy") {
      semanticClass = "mood-calm";
    } else if (m === "frustrated" || m === "low-energy" || m === "exhausted" || m === "rebuilding") {
      semanticClass = "mood-frustrated";
    }
  }

  const variantClass = variant === "filter" ? "variant-filter" : (variant === "semantic" ? "variant-semantic" : "variant-default");

  return (
    <button
      type="button"
      className={`selectable-chip ${variantClass} ${semanticClass} ${selected ? "selected" : ""} ${className}`}
      onClick={onClick}
      style={style}
      {...props}
    >
      {icon && <span className="chip-icon" style={{ marginRight: 6, display: "inline-flex", alignItems: "center" }}>{icon}</span>}
      <span className="chip-label">{children}</span>
    </button>
  );
}
