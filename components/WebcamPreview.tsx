"use client";
import { useEffect, useRef } from "react";

export default function WebcamPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        alert("Camera access denied.");
      }
    };

    startCamera();
  }, []);

  return (
    <div className="mt-4 rounded overflow-hidden border shadow-sm bg-black w-full max-w-md mx-auto">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto"
        style={{ transform: "scaleX(-1)" }}
      />
    </div>
  );
}