import React from "react";

// same as ErrorMessage but for the dark auth pages (login/signup/reset) -
// the light red-50 banner is unreadable on a black background
export default function ErrorMessageDark({ children, className = "" }) {
  if (!children) return null;
  return (
    <div className={`p-3 rounded-xl border border-red-800 bg-red-900/30 text-red-200 text-sm ${className}`}>
      {children}
    </div>
  );
}
