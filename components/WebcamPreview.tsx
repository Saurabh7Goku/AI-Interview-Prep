"use client";
import { Camera, CameraOff, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function WebcamPreview({
  isActive,
}: {
  isActive: boolean;
  onToggleSize: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let mediaStream: MediaStream | null = null;
    let didCancel = false;

    const startCamera = async () => {
      try {
        // Always stop existing first (if any)
        if (videoRef.current?.srcObject instanceof MediaStream) {
          (videoRef.current.srcObject as MediaStream)
            .getTracks()
            .forEach((track) => track.stop());
        }

        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!didCancel && videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        } else {
          // stopped before it started
          mediaStream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        console.error("Camera access denied.", err);
      }
    };

    if (isActive) {
      startCamera();
    } else {
      // stop the stream when deactivating
      if (videoRef.current?.srcObject instanceof MediaStream) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      didCancel = true;
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (videoRef.current?.srcObject instanceof MediaStream) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [isActive]);


  return (
    <div className="relative rounded-2xl overflow-hidden border-2 border-blue-200 shadow-xl bg-gradient-to-br from-gray-900 to-black transition-all duration-300">
      {/* Video Content */}
      < div className="relative w-full h-full" >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
        {/* Subtle overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
      </div >
    </div >
  );
}
