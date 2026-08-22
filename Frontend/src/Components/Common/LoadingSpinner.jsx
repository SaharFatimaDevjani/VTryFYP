import React from "react";

// small shared loading indicator so every page doesn't invent its own
// "Loading..." text/markup - just pass whatever label makes sense
export default function LoadingSpinner({ label = "Loading...", className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-2 py-6 text-gray-600 ${className}`}>
      <span className="h-4 w-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
