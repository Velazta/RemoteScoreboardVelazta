"use client";

import React, { useState, useEffect } from "react";
import SplashScreen from "@/components/SplashScreen";
import Header from "@/components/common/header";
import HeroSection from "@/components/landing/HeroSection";
import EasySetupSection from "@/components/landing/EasySetupSection";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (showSplash) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [showSplash]);

  return (
    <main className="bg-[#0C0C0C] text-white overflow-x-hidden">
      {/* SplashScreen */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {!showSplash && (
        <>
          <Header />
          <HeroSection />
          <EasySetupSection />
        </>
      )}
    </main>
  );
}