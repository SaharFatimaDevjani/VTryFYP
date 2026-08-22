import React from "react";

// standard error banner for light-background pages (shop, admin, profile,
// checkout). renders nothing if there's no message, so it's safe to drop
// straight in without an extra {error && ...} check
export default function ErrorMessage({ children, className = "" }) {
  if (!children) return null;
  return (
    <div className={`p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm ${className}`}>
      {children}
    </div>
  );
}
