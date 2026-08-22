import React, { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

// module-level cache so the (multi-MB) wasm runtime + model file only ever
// get downloaded and initialized once per page load, not every time someone
// opens/closes the try-on modal. shared across every FaceTryOn instance.
let landmarkerPromise = null;
function getFaceLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        },
        runningMode: "VIDEO",
        numFaces: 1,
      });
    })().catch((e) => {
      // let the next mount retry instead of getting stuck on a failed load forever
      landmarkerPromise = null;
      throw e;
    });
  }
  return landmarkerPromise;
}

export default function FaceTryOn({
  overlayUrl,
  type = "glasses",

  // multiplies the measured temple-to-temple width to get the overlay
  // width. switched from measuring off eye distance to temple distance
  // since it was more stable, so this used to default around 2.35 and
  // now 1.15-1.4 is the right range instead
  scaleMult = 1.15,
  // shifts the overlay up/down as a fraction of its own height. negative
  // moves it up toward the eyes, positive drops it toward the nose
  yOffsetMult = -0.08,
  // overlay height = width * this. should roughly match the actual
  // aspect ratio of whatever glasses png is being used, ~0.4-0.5 for
  // most wide frames
  heightRatio = 0.40,
  // 0-1, how much weight the previous frame's position keeps each frame.
  // higher = smoother but laggier, lower = snappier but jittery.
  // 0.7-0.85 felt like a decent balance when testing
  smoothing = 0.85,
  // optional calibration data per product, in case the glasses png isn't
  // centered the way i expect. pixel coords on the original image:
  //   { leftLensPx, rightLensPx, bridgePx, leftTempleEndPx, rightTempleEndPx }
  // falls back to just anchoring at the image center (0.5, 0.5) if not given
  meta = null,
  // draws little dots on the tracked landmarks so i can actually see
  // what the model is picking up while tuning the numbers above
  debug = false,
  // toggles the blurred shadow drawn under the overlay, see the shadow
  // block in loop() below
  shadow = true,
  // toggles the highlight + edge vignette drawn over the overlay, see
  // the gloss block in loop() below
  gloss = true,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [status, setStatus] = useState("Initializing…");
  const [devices, setDevices] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  // gates the save-photo button - no point offering it before there's an
  // actual video frame to capture
  const [streaming, setStreaming] = useState(false);

  const faceLandmarkerRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);

  const overlayImgRef = useRef(null);

  // the 0-1 anchor point computed from meta once the overlay image loads
  const metaRef = useRef({
    anchorX: 0.5,
    anchorY: 0.5,
  });

  // keeps last frame's smoothed values around so the smoothing math has
  // something to blend against on the next frame
  const prevRef = useRef({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    angle: 0,
  });

  // loads the glasses png and figures out where its "center point" should
  // be, based on the per-product meta if there is any
  useEffect(() => {
    if (!overlayUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = overlayUrl;
    img.onload = () => {
      // only bother with this if we actually got lens/bridge pixel coords
      // for this product, otherwise just anchor at the image center below
      if (meta && img?.naturalWidth && img?.naturalHeight) {
        let anchorX = 0.5;
        let anchorY = 0.5;
        try {
          // anchor = the point on the png that should line up with the
          // face anchor point, prefer the midpoint of both lenses, then
          // the bridge, expressed as a 0-1 fraction so it works regardless
          // of how big the actual png is
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

  // grabs the shared model instance - instant if some earlier FaceTryOn on
  // this page already loaded it, otherwise this is the one that pays for it
  useEffect(() => {
    let cancelled = false;

    setStatus("Loading face model…");
    getFaceLandmarker()
      .then((landmarker) => {
        if (cancelled) return;
        faceLandmarkerRef.current = landmarker;
        setStatus("Model loaded ✅");
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) setStatus("Model load failed ❌");
      });

    return () => {
      cancelled = true;
      faceLandmarkerRef.current = null;
    };
  }, []);

  // browser only gives you real camera names/labels after permission was
  // granted at least once - before that they just show up blank
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
    setStreaming(false);
  };

  const startStream = async (selectedDeviceId) => {
    try {
      stopStream();
      setStatus("Requesting camera…");

      // phones generally have weaker cpus/gpus than laptops, and detecting
      // a face on every frame at full 720p is real work - asking for a
      // smaller frame on narrow screens keeps this running smoothly instead
      // of the detection loop falling behind and the overlay lagging
      const isNarrowScreen = typeof window !== "undefined" && window.innerWidth < 640;

      const constraints = {
        video: {
          ...(selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId } }
            : { facingMode: "user" }),
          width: { ideal: isNarrowScreen ? 640 : 1280 },
          height: { ideal: isNarrowScreen ? 480 : 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const video = videoRef.current;
      video.srcObject = stream;

      // videoWidth/videoHeight are 0 until this event fires, and the
      // detection loop needs real dimensions to work with
      await new Promise((resolve) => {
        const onLoaded = () => {
          video.removeEventListener("loadedmetadata", onLoaded);
          resolve();
        };
        video.addEventListener("loadedmetadata", onLoaded);
      });

      await video.play();
      setStatus("Detecting face…");
      setStreaming(true);
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

  // grabs the camera once just to trigger the permission prompt, then
  // immediately stops it - this is only so loadDevices() can read real
  // camera labels afterward, the actual stream starts separately below
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

  // flattens the current video frame + overlay canvas into one png and
  // triggers a download - lets people actually keep/share how the glasses
  // looked instead of just seeing it live and losing it when they close the tab
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = canvas.width || video.videoWidth;
    const h = canvas.height || video.videoHeight;
    if (!w || !h) return;

    try {
      const out = document.createElement("canvas");
      out.width = w;
      out.height = h;
      const octx = out.getContext("2d");

      // video + the try-on canvas are only mirrored via css (scaleX(-1)) on
      // screen - their actual pixel content isn't flipped, so mirror here too
      // or the saved photo comes out backwards compared to what was shown
      octx.save();
      octx.translate(w, 0);
      octx.scale(-1, 1);
      octx.drawImage(video, 0, 0, w, h);
      octx.drawImage(canvas, 0, 0, w, h);
      octx.restore();

      out.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `try-on-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (e) {
      // most likely a CORS-tainted canvas (overlay hosted somewhere without
      // proper cross-origin headers) - nothing useful to do but let the
      // user know instead of failing silently
      console.error("Failed to save photo", e);
      setStatus("Couldn't save photo ❌");
    }
  };

  const drawDot = (ctx, x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  // how long to keep the overlay held at its last known spot after the
  // model briefly loses the face (quick head turn, hand passing by, etc)
  // before actually hiding it - long enough to smooth over a blip, short
  // enough that it doesn't look stuck if you actually walk away
  const LOST_FACE_GRACE_MS = 350;
  const lastSeenRef = useRef(0);

  // draws the overlay (+ shadow/gloss) at whatever position/size/angle it's
  // given - shared by both the "face detected this frame" path and the
  // "holding last known position" grace-period path below
  const drawOverlay = (ctx, x, y, w, h, angle) => {
    const overlay = overlayImgRef.current;
    if (!overlay?.complete || type !== "glasses") return;

    const { anchorX, anchorY } = metaRef.current;
    const drawX = -w * anchorX;
    const drawY = -h * anchorY;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // fake contact shadow underneath the frame so it looks like it's
    // resting on the face instead of just pasted flat on top of it
    if (shadow) {
      ctx.save();
      ctx.filter = `blur(${Math.max(2, w * 0.03)}px)`;
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(0, h * 0.32, w * 0.42, h * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // video + canvas are both mirrored via the scaleX(-1) css below,
    // so drawing normally here already comes out correct on screen -
    // no need to flip the image again
    ctx.drawImage(overlay, drawX, drawY, w, h);

    if (gloss) {
      // subtle highlight, clipped to just the glasses shape via
      // source-atop so it doesn't bleed outside the png
      ctx.save();
      ctx.globalCompositeOperation = "source-atop";
      const highlight = ctx.createLinearGradient(drawX, drawY, drawX, drawY + h);
      highlight.addColorStop(0, "rgba(255,255,255,0.22)");
      highlight.addColorStop(0.45, "rgba(255,255,255,0.05)");
      highlight.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = highlight;
      ctx.fillRect(drawX, drawY, w, h);

      // darkens the outer edge a bit so the hard png cutout blends
      // in instead of looking like a sticker
      ctx.globalCompositeOperation = "destination-in";
      const vignette = ctx.createRadialGradient(
        drawX + w / 2,
        drawY + h / 2,
        w * 0.35,
        drawX + w / 2,
        drawY + h / 2,
        w * 0.62
      );
      vignette.addColorStop(0, "rgba(0,0,0,1)");
      vignette.addColorStop(1, "rgba(0,0,0,0.72)");
      ctx.fillStyle = vignette;
      ctx.fillRect(drawX, drawY, w, h);
      ctx.restore();
    }

    ctx.restore();
  };

  function loop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;

    // canvas needs its actual pixel size set to match the video, separate
    // from whatever css size it's displayed at, or drawing coords will be off
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const landmarker = faceLandmarkerRef.current;

    if (landmarker) {
      const result = landmarker.detectForVideo(video, performance.now());
      const face = result?.faceLandmarks?.[0];

      if (face) {
        // these landmark index numbers come from the mediapipe face mesh
        // map (468 points total) - the ones actually needed here:
        // 33/263 = outer eye corners, 1 = nose tip, 168 = nose bridge,
        // 234/454 = temples (roughly, used for face width)
        const leftEyeOuter = face[33];
        const rightEyeOuter = face[263];
        const noseTip = face[1];
        const noseBridge = face[168];
        const leftTemple = face[234];
        const rightTemple = face[454];

        // landmarks come back normalized (0-1), need actual pixels for drawing
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

        // angle of the line between the two eyes = how much the head is tilted
        const roll = Math.atan2(ry - ly, rx - lx);

        // temple-to-temple distance tracks head size better than eye distance,
        // eye distance is just there in case temple points get weird
        const faceW = Math.hypot(rx3 - lx3, ry3 - ly3);
        const eyeDist = Math.hypot(rx - lx, ry - ly);
        const baseW = faceW || eyeDist;

        let drawW = baseW * Number(scaleMult || 1.0);
        // don't let glasses get so big/small they look obviously wrong,
        // clamp to a range around the actual measured face width
        const minW = faceW * 0.6;
        const maxW = faceW * 1.1;
        drawW = Math.max(minW, Math.min(drawW, maxW));
        const drawH = drawW * Number(heightRatio || 0.45);

        // blending eye line + nose bridge y so the frame sits on the nose
        // instead of floating up on the forehead
        const eyeLineY = (ly + ry) / 2;
        const anchorYBase = eyeLineY * 0.55 + nby * 0.45;

        // rough yaw (left/right head turn) from how off-center the nose
        // sits between the two temples
        const leftDistX = nx - lx3;
        const rightDistX = rx3 - nx;
        const yaw = (rightDistX - leftDistX) / (leftDistX + rightDistX + 1e-6);

        // when the head turns, shrink the overlay a bit and nudge it toward
        // the side facing the camera - not a real perspective transform,
        // just enough to fake it convincingly
        const yawScale = 1 - 0.25 * Math.abs(yaw); // shrink up to 25%
        drawW *= yawScale;
        const yawShift = yaw * drawW * 0.1;

        const yOffset = drawH * Number(yOffsetMult || 0);

        let targetX = nx + yawShift;
        let targetY = anchorYBase + yOffset;

        // exponential smoothing so the overlay doesn't jitter frame to frame
        const prev = prevRef.current;
        const alpha = Math.max(0, Math.min(1, Number(smoothing || 0)));
        const smooth = (prevVal, newVal) => prevVal * alpha + newVal * (1 - alpha);
        const smoothX = smooth(prev.x, targetX);
        const smoothY = smooth(prev.y, targetY);
        const smoothW = smooth(prev.w, drawW);
        const smoothH = smooth(prev.h, drawH);
        // angle wraps around at +-180deg, without this the glasses would
        // spin the long way round whenever roll crosses that boundary
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
        lastSeenRef.current = performance.now();

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

        drawOverlay(ctx, smoothX, smoothY, smoothW, smoothH, smoothAngle);
        setStatus("Face detected ✅");
      } else {
        // model missed the face this frame - hold the overlay at its last
        // known spot for a bit instead of letting it just blink out, but
        // only if we've actually seen a face recently (not on first load)
        const elapsed = performance.now() - lastSeenRef.current;
        if (lastSeenRef.current && elapsed < LOST_FACE_GRACE_MS) {
          const p = prevRef.current;
          drawOverlay(ctx, p.x, p.y, p.w, p.h, p.angle);
        } else {
          setStatus("Detecting face…");
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

      {/* video and canvas are stacked absolute in the same box on purpose -
          if their sizes ever drift apart the overlay stops lining up */}
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

      {streaming && (
        <button
          type="button"
          onClick={capturePhoto}
          style={{
            justifySelf: "start",
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.35)",
            background: "transparent",
            color: "#fff",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          📸 Save Photo
        </button>
      )}

      {!overlayUrl ? (
        <div style={{ color: "#ffb3b3", fontSize: 13 }}>
          Overlay missing: product me <b>tryOn.overlayUrl</b> set karo.
        </div>
      ) : null}
    </div>
  );
}
