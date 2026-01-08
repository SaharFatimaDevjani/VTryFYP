import React, { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export default function FaceTryOn({
  overlayUrl,
  type = "glasses",

  /**
   * Overall scale multiplier applied to the head width to determine the overlay width.
   * Historically this defaulted to ~2.35 when measured off eye distance. With the new
   * algorithm we base the width off the temple‑to‑temple distance so values closer
   * to 1.0 are more appropriate. A value of 1.2–1.4 usually fills the face nicely.
   */
  scaleMult = 1.15,
  /**
   * Vertical offset multiplier applied relative to overlay height. Positive values
   * move the glasses downward. Typical range 0–0.2. A value near 0 aligns the
   * bridge with the computed anchor point between the eyes; larger values drop
   * the frame down slightly towards the nose.
   */
  yOffsetMult = -0.08,
  /**
   * Height ratio between overlay width and height. This should roughly match the
   * aspect ratio of the glasses asset. For most wide frames a value around 0.4–0.5
   * works well. The height will be computed as width * heightRatio.
   */
  heightRatio = 0.40,
  /**
   * Exponential smoothing factor for overlay parameters (0–1). Higher values
   * produce more smoothing by weighting the previous frame more heavily. A value
   * of 0.7–0.85 is recommended to reduce jitter while still responding quickly
   * to movement.
   */
  smoothing = 0.85,
  /**
   * Optional per‑product calibration metadata. Allows specifying where important
   * features (lens centres, bridge, temples) lie within the PNG. When provided,
   * positions should be in pixel coordinates of the original image. Keys:
   *   {
   *     leftLensPx: {x, y},
   *     rightLensPx: {x, y},
   *     bridgePx: {x, y},
   *     leftTempleEndPx: {x, y},
   *     rightTempleEndPx: {x, y}
   *   }
   * If omitted the overlay is anchored at its centre (0.5,0.5).
   */
  meta = null,
  /**
   * Enable debug rendering of landmark dots for alignment checks. When true,
   * small coloured dots marking key landmarks will be drawn on the video.
   */
  debug = false,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [status, setStatus] = useState("Initializing…");
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");

  const faceLandmarkerRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);

  const overlayImgRef = useRef(null);

  // store normalised meta anchor positions derived from the provided meta object
  const metaRef = useRef({
    anchorX: 0.5,
    anchorY: 0.5,
  });

  // previous frame smoothed transform parameters
  const prevRef = useRef({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    angle: 0,
  });

  // overlay image
  useEffect(() => {
    if (!overlayUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = overlayUrl;
    // compute calibration anchors once the image has loaded
    img.onload = () => {
      // If meta data is provided and contains lens positions, convert them to
      // normalised percentages so that drawing works regardless of PNG size.
      if (meta && img?.naturalWidth && img?.naturalHeight) {
        let anchorX = 0.5;
        let anchorY = 0.5;
        try {
          // Use the midpoint between left and right lens centres if provided,
          // otherwise fall back to the bridge or image centre. The anchor defines
          // the point on the PNG that will align with the computed face anchor.
          const w = img.naturalWidth;
          const h = img.naturalHeight;
          if (meta.leftLensPx && meta.rightLensPx) {
            anchorX =
              ((meta.leftLensPx.x + meta.rightLensPx.x) / 2) / w;
            anchorY =
              ((meta.leftLensPx.y + meta.rightLensPx.y) / 2) / h;
          } else if (meta.bridgePx) {
            anchorX = meta.bridgePx.x / w;
            anchorY = meta.bridgePx.y / h;
          }
        } catch (e) {
          console.warn("Failed to compute overlay anchors", e);
        }
        metaRef.current = { anchorX, anchorY };
      } else {
        metaRef.current = { anchorX: 0.5, anchorY: 0.5 };
      }
    };
    overlayImgRef.current = img;
  }, [overlayUrl, meta]);

  // load model once
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setStatus("Loading face model…");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          },
          runningMode: "VIDEO",
          numFaces: 1,
        });

        if (cancelled) return;
        faceLandmarkerRef.current = landmarker;
        setStatus("Model loaded ✅");
      } catch (e) {
        console.error(e);
        setStatus("Model load failed ❌");
      }
    })();

    return () => {
      cancelled = true;
      faceLandmarkerRef.current = null;
    };
  }, []);

  // list cameras after permission (labels appear only after permission)
  const loadDevices = async () => {
    const list = await navigator.mediaDevices.enumerateDevices();
    const cams = list.filter((d) => d.kind === "videoinput");
    setDevices(cams);
    if (!deviceId && cams.length) setDeviceId(cams[0].deviceId);
  };

  const stopStream = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startStream = async (selectedDeviceId) => {
    try {
      stopStream();
      setStatus("Requesting camera…");

      const constraints = {
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId } }
          : { facingMode: "user" },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const video = videoRef.current;
      video.srcObject = stream;

      // IMPORTANT: wait until metadata is ready
      await new Promise((resolve) => {
        const onLoaded = () => {
          video.removeEventListener("loadedmetadata", onLoaded);
          resolve();
        };
        video.addEventListener("loadedmetadata", onLoaded);
      });

      await video.play();
      setStatus("Detecting face…");
      loop();
    } catch (e) {
      console.error(e);
      if (e?.name === "NotAllowedError")
        setStatus("Camera blocked ❌ (Allow in site settings)");
      else if (e?.name === "NotFoundError")
        setStatus("No camera found ❌");
      else if (e?.name === "NotReadableError")
        setStatus("Camera busy ❌ (close other apps)");
      else setStatus(`Camera error ❌ ${e?.message || ""}`);
    }
  };

  // ask permission once to show device labels
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const temp = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        temp.getTracks().forEach((t) => t.stop());
        if (cancelled) return;
        await loadDevices();
      } catch (e) {
        console.error(e);
        setStatus("Permission failed ❌");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!deviceId) return;
    startStream(deviceId);
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  const drawDot = (ctx, x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  function loop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;

    // IMPORTANT: internal canvas size matches video pixel size
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    const landmarker = faceLandmarkerRef.current;
    const overlay = overlayImgRef.current;

    if (landmarker) {
      const result = landmarker.detectForVideo(video, performance.now());
      const face = result?.faceLandmarks?.[0];

      if (face) {
        // Indices for key points.  See MediaPipe face mesh docs for details:
        // 33 & 263 = eye outer corners, good for computing roll (rotation)
        // 1 = nose tip (approx centre of face)
        // 168 = nose bridge between the eyes (vertical alignment)
        // 234 & 454 = left/right temples/cheeks, approximate face width
        const leftEyeOuter = face[33];
        const rightEyeOuter = face[263];
        const noseTip = face[1];
        const noseBridge = face[168];
        const leftTemple = face[234];
        const rightTemple = face[454];

        // convert to pixel coordinates
        const lx = leftEyeOuter.x * w;
        const ly = leftEyeOuter.y * h;
        const rx = rightEyeOuter.x * w;
        const ry = rightEyeOuter.y * h;
        const nx = noseTip.x * w;
        const ny = noseTip.y * h;
        const nbx = noseBridge.x * w;
        const nby = noseBridge.y * h;
        const lx3 = leftTemple.x * w;
        const ly3 = leftTemple.y * h;
        const rx3 = rightTemple.x * w;
        const ry3 = rightTemple.y * h;

        // compute roll angle from eye line
        const roll = Math.atan2(ry - ly, rx - lx);

        // compute face width across temples; this is a more stable measurement
        const faceW = Math.hypot(rx3 - lx3, ry3 - ly3);
        // fallback to eye distance if temples are degenerate
        const eyeDist = Math.hypot(rx - lx, ry - ly);
        const baseW = faceW || eyeDist;

        // final width uses scaleMult; clamp to sensible bounds relative to face
        let drawW = baseW * Number(scaleMult || 1.0);
        // constrain width between 60% and 110% of face width to avoid extremes
        const minW = faceW * 0.6;
        const maxW = faceW * 1.1;
        drawW = Math.max(minW, Math.min(drawW, maxW));
        const drawH = drawW * Number(heightRatio || 0.45);

        // compute base anchor point: use blend of eye line and nose bridge to
        // ensure the frame sits on the nose rather than floating on the forehead.
        const eyeLineY = (ly + ry) / 2;
        const anchorYBase = eyeLineY * 0.55 + nby * 0.45;

        // yaw estimation using horizontal distances from nose tip to temples.
        const leftDistX = nx - lx3;
        const rightDistX = rx3 - nx;
        const yaw = (rightDistX - leftDistX) / (leftDistX + rightDistX + 1e-6);

        // adjust width and horizontal shift based on yaw.  When the head turns to
        // one side, the far side shrinks slightly and the overlay shifts
        // towards the near side.  This is an approximation for perspective.
        const yawScale = 1 - 0.25 * Math.abs(yaw); // shrink up to 25%
        drawW *= yawScale;
        // horizontal shift; positive yaw (turning right) should shift overlay
        // slightly to the right (user’s left).  Use 10% of width per unit yaw.
        const yawShift = yaw * drawW * 0.1;

        // vertical offset relative to height
        const yOffset = drawH * Number(yOffsetMult || 0);

        // compute target draw position
        let targetX = nx + yawShift;
        let targetY = anchorYBase + yOffset;

        // smoothing via exponential moving average
        const prev = prevRef.current;
        const alpha = Math.max(0, Math.min(1, Number(smoothing || 0)));
        const smooth = (prevVal, newVal) => prevVal * alpha + newVal * (1 - alpha);
        const smoothX = smooth(prev.x, targetX);
        const smoothY = smooth(prev.y, targetY);
        const smoothW = smooth(prev.w, drawW);
        const smoothH = smooth(prev.h, drawH);
        // unwrap angle differences to avoid jumps when crossing ±π
        let deltaAngle = roll - prev.angle;
        if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
        if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;
        const smoothAngle = prev.angle + deltaAngle * (1 - alpha);

        prevRef.current = {
          x: smoothX,
          y: smoothY,
          w: smoothW,
          h: smoothH,
          angle: smoothAngle,
        };

        if (debug) {
          ctx.save();
          ctx.fillStyle = "rgba(0,255,0,0.9)";
          drawDot(ctx, lx, ly);
          drawDot(ctx, rx, ry);
          ctx.fillStyle = "rgba(255,0,0,0.9)";
          drawDot(ctx, nx, ny);
          drawDot(ctx, lx3, ly3);
          drawDot(ctx, rx3, ry3);
          ctx.restore();
        }

        if (overlay?.complete && type === "glasses") {
          const { anchorX, anchorY } = metaRef.current;
          ctx.save();
          // translate to smoothed position
          ctx.translate(smoothX, smoothY);
          // rotate by smoothed roll (mirror video flips horizontally so we invert)
          ctx.rotate(smoothAngle);
          // mirror fix: because both video and canvas are already mirrored via
          // CSS transform scaleX(-1), we draw the overlay without flipping here
          // but adjust anchor so that the left/right remain consistent.
          ctx.drawImage(
            overlay,
            -smoothW * anchorX,
            -smoothH * anchorY,
            smoothW,
            smoothH
          );
          ctx.restore();
          setStatus("Face detected ✅");
        }
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ color: "#fff", fontSize: 13, opacity: 0.9 }}>{status}</div>

      {devices.length > 0 && (
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ color: "#fff", fontSize: 12, opacity: 0.85 }}>
            Camera:
          </div>
          <select
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            style={{ padding: 8, borderRadius: 10, width: "100%" }}
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || "Camera"}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* IMPORTANT: video and canvas MUST be same render box */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "70vh",
          borderRadius: 12,
          overflow: "hidden",
          background: "#000",
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transform: "scaleX(-1)", // mirror selfie
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none",
            transform: "scaleX(-1)", // mirror canvas TOO (must match video)
          }}
        />
      </div>

      {!overlayUrl ? (
        <div style={{ color: "#ffb3b3", fontSize: 13 }}>
          Overlay missing: product me <b>tryOn.overlayUrl</b> set karo.
        </div>
      ) : null}
    </div>
  );
}
