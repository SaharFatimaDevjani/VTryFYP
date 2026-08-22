import React, { useState } from "react";

// the 5 calibration points FaceTryOn.jsx knows how to use, matching the
// Product model's tryOn.meta schema field names
const POINT_DEFS = [
  { key: "leftLensPx", label: "Left Lens", color: "#22c55e" },
  { key: "rightLensPx", label: "Right Lens", color: "#3b82f6" },
  { key: "bridgePx", label: "Bridge", color: "#eab308" },
  { key: "leftTempleEndPx", label: "Left Temple", color: "#ef4444" },
  { key: "rightTempleEndPx", label: "Right Temple", color: "#a855f7" },
];

// click-to-calibrate tool: shows the uploaded overlay png, pick a point
// (left lens/right lens/bridge/temples), click where it is on the image,
// and this converts the click into real pixel coordinates on the original
// file - much easier than eyeballing pixel numbers in an image editor
export default function OverlayCalibrator({ imageUrl, points, onSetPoint, onClearPoint }) {
  const [activeKey, setActiveKey] = useState(POINT_DEFS[0].key);
  const [natural, setNatural] = useState(null);

  if (!imageUrl) return null;

  const handleImageLoad = (e) => {
    setNatural({ w: e.target.naturalWidth, h: e.target.naturalHeight });
  };

  const handleClick = (e) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    // separate x/y scale factors so this still works correctly even if
    // the displayed box isn't exactly the same aspect ratio as the image
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    onSetPoint(activeKey, { x, y });

    // jump to the next point that hasn't been set yet, so clicking
    // through all 5 in order doesn't need reselecting each one
    const next = POINT_DEFS.find((p) => p.key !== activeKey && !points?.[p.key]);
    if (next) setActiveKey(next.key);
  };

  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="flex flex-wrap gap-2 mb-3">
        {POINT_DEFS.map((p) => {
          const isSet = Boolean(points?.[p.key]);
          const isActive = activeKey === p.key;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setActiveKey(p.key)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium"
              style={{
                borderColor: isActive ? p.color : "#d1d5db",
                backgroundColor: isActive ? `${p.color}1a` : "#fff",
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border"
                style={{
                  backgroundColor: isSet ? p.color : "transparent",
                  borderColor: p.color,
                }}
              />
              {p.label}
              {isSet && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearPoint(p.key);
                  }}
                  className="ml-1 text-gray-400 hover:text-red-600"
                  title="Clear point"
                >
                  ✕
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="text-xs text-gray-500 mb-2">
        Click on the image to place "{POINT_DEFS.find((p) => p.key === activeKey)?.label}".
      </div>

      <div className="relative inline-block max-w-full bg-white border rounded" style={{ lineHeight: 0 }}>
        <img
          src={imageUrl}
          alt="overlay to calibrate"
          onLoad={handleImageLoad}
          onClick={handleClick}
          className="max-w-full cursor-crosshair"
          style={{ maxHeight: 320, display: "block" }}
        />

        {natural &&
          POINT_DEFS.map((p) => {
            const pt = points?.[p.key];
            if (!pt) return null;
            return (
              <div
                key={p.key}
                title={p.label}
                style={{
                  position: "absolute",
                  left: `${(pt.x / natural.w) * 100}%`,
                  top: `${(pt.y / natural.h) * 100}%`,
                  width: 10,
                  height: 10,
                  marginLeft: -5,
                  marginTop: -5,
                  borderRadius: "50%",
                  background: p.color,
                  border: "2px solid #fff",
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
                  pointerEvents: "none",
                }}
              />
            );
          })}
      </div>
    </div>
  );
}
