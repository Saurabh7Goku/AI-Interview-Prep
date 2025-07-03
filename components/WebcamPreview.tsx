"use client";
import { Camera, CameraOff, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function WebcamPreview({ isMinimized, onToggleSize }: { isMinimized: boolean; onToggleSize: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isActive, setIsActive] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
        setIsActive(true);
      } catch (err) {
        console.log("Camera access denied.", err);
        setIsActive(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleCamera = () => {
    if (stream) {
      if (isActive) {
        stream.getTracks().forEach(track => track.stop());
        setIsActive(false);
      } else {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(mediaStream => {
            if (videoRef.current) {
              videoRef.current.srcObject = mediaStream;
            }
            setStream(mediaStream);
            setIsActive(true);
          })
          .catch(err => console.log("Camera restart failed", err));
      }
    }
  };

  // Responsive sizing
  const sizeClasses = isMinimized
    ? 'w-32 h-24 sm:w-40 sm:h-28 lg:w-48 lg:h-36'
    : 'w-48 h-36 sm:w-56 sm:h-40 lg:w-80 lg:h-60';

  return (
    <div className={`relative rounded-2xl overflow-hidden border-2 border-blue-200 shadow-xl bg-gradient-to-br from-gray-900 to-black transition-all duration-300 ${sizeClasses}`}>
      {/* Webcam Header */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600/90 to-blue-700/90 backdrop-blur-sm p-1.5 lg:p-2 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 lg:space-x-2">
            <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-white text-xs font-medium">
              {isActive ? 'Live' : 'Off'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={toggleCamera}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isActive ? (
                <Camera className="w-3 h-3 text-white" />
              ) : (
                <CameraOff className="w-3 h-3 text-white" />
              )}
            </button>
            <button
              onClick={onToggleSize}
              className="hidden lg:block p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              {isMinimized ? (
                <Maximize2 className="w-3 h-3 text-white" />
              ) : (
                <Minimize2 className="w-3 h-3 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Video Content */}
      <div className="relative w-full h-full">
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center">
              <CameraOff className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400 mx-auto mb-1 lg:mb-2" />
              <p className="text-gray-400 text-xs lg:text-sm">Camera disabled</p>
            </div>
          </div>
        )}

        {/* Subtle overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}
