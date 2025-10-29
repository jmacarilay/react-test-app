import { useEffect, useRef, useState, useCallback } from "react";

// Small helper type aliases
type TimeoutRef = ReturnType<typeof setTimeout> | null;

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectionLoopStopRef = useRef<(() => void) | null>(null);
  const popupTimer = useRef<TimeoutRef>(null);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<string>("");
  const [focusGood, setFocusGood] = useState<boolean>(false);
  const [lightGood, setLightGood] = useState<boolean>(false);
  const [popupMsg, setPopupMsg] = useState<string>("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState<boolean>(false);

  // --- Camera setup ---
  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera API not supported in this browser.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled) return;
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // play can sometimes reject due to autoplay policies; ignore error
            videoRef.current.play().catch(() => {});
        }
        setCameraReady(true);
        detectionLoopStopRef.current = startDetectionLoop();
      } catch (err: any) {
        console.error("Camera error:", err);
        setCameraError(err?.message || "Unable to access camera");
        showPopup("❌ Camera access failed");
      }
    }

    startCamera();

    // Handle page visibility to pause detection when tab hidden
    const handleVisibility = () => {
      if (document.hidden) {
        detectionLoopStopRef.current?.();
      } else if (cameraReady) {
        detectionLoopStopRef.current = startDetectionLoop();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      detectionLoopStopRef.current?.();
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [cameraReady]);

  // --- Focus and lighting detection ---
  const startDetectionLoop = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => {};
    canvas.width = 320;
    canvas.height = 240;

    const FOCUS_THRESHOLD = 200;
    const BRIGHTNESS_THRESHOLD = 80;
    let lastFocus: boolean | null = null;
    let lastLight: boolean | null = null;
    let rafId: number;
    let stopped = false;

    function loop() {
      if (stopped) return;
      const video = videoRef.current;
      if (!video || !video.videoWidth) {
        rafId = requestAnimationFrame(loop);
        return;
      }
      if (!ctx) {
        rafId = requestAnimationFrame(loop);
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const gray = toGrayscale(imgData);
      const lap = applyLaplacianFilter(gray, canvas.width, canvas.height);
      const variance = calculateVariance(lap);
      const brightness = detectBrightness(imgData);

      const isInFocus = variance > FOCUS_THRESHOLD;
      const isBrightEnough = brightness > BRIGHTNESS_THRESHOLD;

      if (lastFocus !== isInFocus) {
        setFocusGood(isInFocus);
        if (lastFocus !== null) showPopup(isInFocus ? "✅ Focus OK" : "❌ Out of Focus");
      }
      if (lastLight !== isBrightEnough) {
        setLightGood(isBrightEnough);
        if (lastLight !== null) showPopup(isBrightEnough ? "💡 Lighting OK" : "⚠️ Too Dark");
      }

      lastFocus = isInFocus;
      lastLight = isBrightEnough;

      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
    };
  };

  // --- Popup helper ---
  const showPopup = useCallback((msg: string) => {
    setPopupMsg(msg);
    if (popupTimer.current) clearTimeout(popupTimer.current);
    popupTimer.current = setTimeout(() => setPopupMsg(""), 1500);
  }, []);

  // --- Image capture + upload ---
  const handleCapture = () => {
    if (!focusGood || !lightGood) {
      showPopup("⚠️ Fix focus/lighting first!");
      return;
    }
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(imageData);

    // toBlob is async; fallback if unavailable
    if (canvas.toBlob) {
      canvas.toBlob((blob) => blob && uploadImage(blob), "image/jpeg", 0.9);
    } else {
      fetch(imageData)
        .then((r) => r.blob())
        .then((blob) => uploadImage(blob))
        .catch((e) => console.error("Blob fallback error", e));
    }
  };

  const uploadImage = async (blob: Blob) => {
    setUploading(true);
    setUploadResult("");
    try {
      const formData = new FormData();
      formData.append("file", blob, "capture.jpg");
      // Allow overriding endpoint via environment variable (e.g. VITE_UPLOAD_ENDPOINT)
      const endpoint = import.meta.env.VITE_UPLOAD_ENDPOINT || "https://your-api.com/upload";
      const response = await fetch(endpoint, { method: "POST", body: formData });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      // attempt json but allow non-json response
      let result: any = null;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = await response.text();
      }
      console.log("Upload result:", result);
      setUploadResult("✅ Upload successful!");
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadResult("❌ Upload failed: " + (err?.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  // --- Helper functions ---
  const toGrayscale = (img: ImageData) => {
    const { data, width, height } = img;
    const gray = new Uint8ClampedArray(width * height);
    for (let i = 0; i < data.length; i += 4) {
      gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    return gray;
  };

  const applyLaplacianFilter = (gray: Uint8ClampedArray, width: number, height: number) => {
    const k = [0, -1, 0, -1, 4, -1, 0, -1, 0];
    const out = new Float32Array(width * height);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            sum += k[(ky + 1) * 3 + (kx + 1)] * gray[(y + ky) * width + (x + kx)];
          }
        }
        out[y * width + x] = sum;
      }
    }
    return out;
  };

  const calculateVariance = (arr: Float32Array) => {
    // Avoid creating a second array; compute stats in one pass excluding zeros
    let count = 0;
    let mean = 0;
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      if (v === 0) continue;
      count++;
      const delta = v - mean;
      mean += delta / count;
    }
    if (count === 0) return 0;
    let variance = 0;
    for (let i = 0; i < arr.length; i++) {
      const v = arr[i];
      if (v === 0) continue;
      const diff = v - mean;
      variance += diff * diff;
    }
    return variance / count;
  };

  const detectBrightness = (img: ImageData) => {
    const { data } = img;
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    return total / (data.length / 4);
  };

  // --- UI ---
  return (
    <div style={{ textAlign: "center", color: "#fff", background: "#000", minHeight: "100vh" }}>
      <h2 style={{ padding: "10px 0" }}>📸 Camera Capture with Focus & Lighting Popup</h2>
      {cameraError && (
        <div style={{ color: "#ff5252", marginBottom: 12 }} role="alert">
          {cameraError} — please check permissions.
        </div>
      )}

      <div style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}>
        <video
          ref={videoRef}
          playsInline
          muted
          aria-label="Live camera preview"
          style={{ width: "100%", borderRadius: "8px", background: "#000" }}
        />
        <div
          className={`guide ${
            !focusGood ? "out-of-focus" : lightGood ? "good" : "too-dark"
          }`}
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            borderRadius: "8px",
            transition: "all 0.3s ease",
          }}
        />

        {/* 🔔 Popup message overlay */}
        {popupMsg && (
          <div
            className="popup"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(0,0,0,0.6)",
              padding: "12px 20px",
              borderRadius: "8px",
              fontSize: "1.2rem",
              animation: "fade 1.5s ease",
            }}
          >
            {popupMsg}
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, fontFamily: "monospace" }}>
        <div>
          Focus:{" "}
          <span style={{ color: focusGood ? "#4fc3f7" : "#f44336" }}>
            {focusGood ? "OK" : "Blurry"}
          </span>
        </div>
        <div>
          Lighting:{" "}
          <span style={{ color: lightGood ? "#4fc3f7" : "#ff9800" }}>
            {lightGood ? "Good" : "Too Dark"}
          </span>
        </div>
      </div>

      <button
        onClick={handleCapture}
        disabled={uploading || !cameraReady}
        style={{
          marginTop: 20,
          background: focusGood && lightGood && cameraReady ? "#4fc3f7" : "#666",
          color: "#000",
          border: "none",
          padding: "10px 20px",
          borderRadius: 6,
          cursor: focusGood && lightGood && cameraReady ? "pointer" : "not-allowed",
          fontWeight: "bold",
        }}
        aria-disabled={uploading || !cameraReady}
        aria-label="Capture image and upload"
      >
        {uploading ? "Uploading..." : cameraReady ? "📷 Capture & Upload" : "Initializing camera..."}
      </button>

      {capturedImage && (
        <div style={{ marginTop: 20 }}>
          <h3>Preview</h3>
          <img
            src={capturedImage}
            alt="Captured"
            style={{ maxWidth: "100%", borderRadius: 8, border: "2px solid #333" }}
          />
          <p>{uploadResult}</p>
        </div>
      )}

      <style>
        {`
          .guide.good { border: 4px solid rgba(0,255,0,0.9); box-shadow: 0 0 12px rgba(0,255,0,0.5); }
          .guide.out-of-focus { border: 4px solid rgba(255,0,0,0.9); box-shadow: 0 0 12px rgba(255,0,0,0.5); }
          .guide.too-dark { border: 4px solid rgba(255,165,0,0.9); box-shadow: 0 0 12px rgba(255,165,0,0.5); }

          @keyframes fade {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            90% { opacity: 1; }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          }
        `}
      </style>
    </div>
  );
}