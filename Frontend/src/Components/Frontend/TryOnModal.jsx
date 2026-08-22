import React, { useEffect } from "react";

export default function TryOnModal({ open, onClose, children }) {
  // lets people close the modal with the esc key, not just the close button
  useEffect(() => {
    function onEsc(e) {
      if (e.key === "Escape") onClose?.();
    }

    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(980px, 100%)",
          // caps height + scrolls instead of clipping off-screen - on a
          // phone the address bar eats into the viewport and the video
          // area + header + camera picker can add up to more than 100vh
          maxHeight: "92vh",
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          background: "#111",
          borderRadius: 16,
          position: "relative",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 12,
            color: "#fff",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div style={{ fontWeight: 700 }}>Virtual Try-On</div>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.35)",
              color: "#fff",
              borderRadius: 10,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        <div style={{ padding: 12 }}>{children}</div>
      </div>
    </div>
  );
}
