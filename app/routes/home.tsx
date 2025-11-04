import { useEffect, useRef, useState } from "react";

// Type alias removed (popup feature deprecated)

export default function Home() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Removed preview-related states (capturedImage, capturedBlob)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  // Removed uploadResult (will reintroduce when storage logic added)
  const [focusGood, setFocusGood] = useState<boolean>(false);
  const [lightGood, setLightGood] = useState<boolean>(false);

  // --- Camera setup + focus & lighting detection loop (inlined to satisfy exhaustive-deps) ---
  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationId: number | null = null;

    const setupAndStart = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (!videoRef.current) {
          return;
        }
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Detection loop setup
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return;
        } // Bail if 2D context not available
        canvas.width = 320;
        canvas.height = 240;

        const FOCUS_THRESHOLD = 200;
        const BRIGHTNESS_THRESHOLD = 80;
        let lastFocus: boolean | null = null;
        let lastLight: boolean | null = null;

        const loop = () => {
          const video = videoRef.current;
          if (!video || !video.videoWidth) {
            animationId = requestAnimationFrame(loop);
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

          setFocusGood(isInFocus);
          setLightGood(isBrightEnough);

          // Popup feedback removed; could add subtle border/glow changes instead.

          lastFocus = isInFocus;
          lastLight = isBrightEnough;
          animationId = requestAnimationFrame(loop);
        };
        loop();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Camera error:", err);
        alert("Camera access failed: " + message);
      }
    };

    void setupAndStart();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Popup helper removed.

  // --- Image capture + upload ---
  const handleCapture = (): void => {
    if (!focusGood || !lightGood) {
      // Previously showed a popup; now just block capture.
      return;
    }

    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Capture logic retained; storing image/ blob disabled until persistence feature added.
    // const imageData = canvas.toDataURL("image/jpeg", 0.9);
    // setCapturedImage(imageData);
    // canvas.toBlob((blob) => { if (blob) setCapturedBlob(blob); }, "image/jpeg", 0.9);
  };

  const uploadImage = async (blob: Blob | null): Promise<void> => {
    if (!blob) {
      return;
    }
    setUploading(true);
  // uploadResult cleared (state removed)

    try {
      const formData = new FormData();
      formData.append("file", blob, "capture.jpg");

      // ✅ Replace with your real API endpoint
      const response = await fetch("https://your-api.com/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result: unknown = await response.json();
      console.log("Upload result:", result);
  // uploadResult success message suppressed
    } catch (err) {
  console.error("Upload error:", err);
    } finally {
    setUploading(false);
    }
  };

  const triggerFileSelect = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Storing file and preview disabled until storage logic added.
    // auto upload after selection
    void uploadImage(file);
  };

  // --- Helper functions ---
  const toGrayscale = (img: ImageData): Uint8ClampedArray => {
    const { data, width, height } = img;
    const gray = new Uint8ClampedArray(width * height);
    for (let i = 0; i < data.length; i += 4) {
      gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    return gray;
  };

  const applyLaplacianFilter = (
    gray: Uint8ClampedArray,
    width: number,
    height: number,
  ): Float32Array => {
    const k = [0, -1, 0, -1, 4, -1, 0, -1, 0];
    const out = new Float32Array(width * height);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            sum +=
              k[(ky + 1) * 3 + (kx + 1)] * gray[(y + ky) * width + (x + kx)];
          }
        }
        out[y * width + x] = sum;
      }
    }
    return out;
  };

  const calculateVariance = (arr: Float32Array): number => {
    const valid = arr.filter((v) => v !== 0);
    const mean = valid.reduce((a, b) => a + b, 0) / (valid.length || 1);
    return valid.reduce((a, b) => a + (b - mean) ** 2, 0) / (valid.length || 1);
  };

  const detectBrightness = (img: ImageData): number => {
    const { data } = img;
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      total += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    return total / (data.length / 4);
  };

  const centerGuideBorder = !focusGood
    ? "border-[#ff0000]" // out of focus - red
    : lightGood
      ? "border-[#00ff5a]" // good lighting & focus - green-ish
      : "border-[#ff9900]"; // too dark - orange

  return (
    <div className="text-center text-[#ffffff] bg-[#000000] min-h-screen">
      <div className="relative max-w-[800px] mx-auto">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full rounded-[8px] bg-[#000000]"
        />

        {/* Center framing guide */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[80%] h-[80%] ${centerGuideBorder} border-[3px] rounded-[6px] pointer-events-none transition-colors duration-300`}
        />

        {/* Overlay bottom controls & status */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-4 pb-4">
          <div className="flex justify-center gap-10">
            <button
              onClick={handleCapture}
              disabled={uploading || !focusGood || !lightGood}
              className={`flex flex-col gap-1 items-center justify-center font-bold active:scale-95 transition-transform text-lg ${lightGood ? 'text-[#00ff5a]' : 'text-[#ff9800]'} ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              Take Photo
            </button>
            <button
              onClick={triggerFileSelect}
              disabled={uploading}
              className="text-white text-lg flex flex-col gap-1 items-center justify-center font-bold active:scale-95 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              {uploading ? "Uploading..." : "Upload Receipt"}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input for gallery/folder selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}