"use client";

import React, { useState, useRef } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 500); 
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0C0C0C] transition-opacity duration-500 ease-in-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        src="/video/splash-screen5.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        className="w-full h-full object-cover"
      />

      {/* Tombol Skip */}
      <button
        onClick={handleVideoEnd}
        className="absolute bottom-8 right-8 z-10 px-5 py-2.5 bg-black/60 border border-white/20 rounded-full text-white text-xs font-montserrat tracking-widest uppercase backdrop-blur-md hover:bg-white/20 transition-all duration-300"
      >
        Skip →
      </button>
    </div>
  );
}