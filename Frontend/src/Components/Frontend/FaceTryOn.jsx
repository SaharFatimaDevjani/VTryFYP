import React, { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export default function FaceTryOn({ overlayUrl, type = "glasses" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [status, setStatus] = useState("Initializing…");

  const faceLandmarkerRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const overlayImgRef = useRef(null);

  // Load overlay image (transparent PNG)
  useEffect(() => {
    if (!overlayUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {};
    img.onerror = () => console.warn("Overlay image failed to load");
    img.src = overlayUrl;
    overlayImgRef.current = img;
  }, [overlayUrl]);

  useEffect(() => {
    let cancelled = false;

    async function start() {
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

        setStatus("Requesting camera permission…");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (cancelled) return;
        streamRef.current = stream;

        const video = videoRef.current;
        video.srcObject = stream;

        // Wait until video actually has frames
        await new Promise((resolve) => {
          const onReady = () => resolve();
          video.onloadeddata = onReady;
          video.onloadedmetadata = onReady;
        });

        await video.play();

        setStatus("Detecting face…");
        loop();
      } catch (e) {
        console.error(e);

        // Permission / device errors
        if (e?.name === "NotAllowedError") {
          setStatus("Camera blocked ❌ (Allow camera in browser site settings)");
        } else if (e?.name === "NotFoundError") {
          setStatus("No camera found ❌ (plug in / enable camera)");
        } else if (e?.name === "NotReadableError") {
          setStatus("Camera busy ❌ (close Zoom/Meet/Camera app)");
        } else {
          setStatus(`Error ❌ ${e?.message || "Camera/model failed"}`);
        }
      }
    }

    function stop() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      faceLandmarkerRef.current = null;
    }

    function loop() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const ctx = canvas.getContext("2d");

      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;

      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;

      // Clear overlay canvas (video is shown separately)
      ctx.clearRect(0, 0, w, h);

      const landmarker = faceLandmarkerRef.current;
      if (landmarker) {
        const result = landmarker.detectForVideo(video, performance.now());
        const face = result?.faceLandmarks?.[0];

        if (face && overlayImgRef.current?.complete && type === "glasses") {
          // Landmarks
          const leftEyeOuter = face[33];
          const rightEyeOuter = face[263];
          const noseBridge = face[168];

          const lx = leftEyeOuter.x * w;
          const ly = leftEyeOuter.y * h;
          const rx = rightEyeOuter.x * w;
          const ry = rightEyeOuter.y * h;
          const nx = noseBridge.x * w;
          const ny = noseBridge.y * h;

          const eyeDist = Math.hypot(rx - lx, ry - ly);

          // Tune size/position
          const overlayW = eyeDist * 2.2;
          const overlayH = overlayW * 0.45;

          const x = nx - overlayW / 2;
          const y = ny - overlayH / 2;

          ctx.drawImage(overlayImgRef.current, x, y, overlayW, overlayH);
          setStatus("Face detected ✅");
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [type]);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ color: "#fff", fontSize: 13, opacity: 0.9 }}>{status}</div>

      <div
        style={{
          position: "relative",
          width: "100%",
          maxHeight: "70vh",
          borderRadius: 12,
          overflow: "hidden",
          background: "#000",
        }}
      >
        {/* ✅ Show camera video */}
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            transform: "scaleX(-1)", // selfie mirror feel
          }}
        />

        {/* ✅ Overlay canvas on top */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
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
