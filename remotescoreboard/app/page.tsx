"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import SplashScreen from "@/components/SplashScreen";
import Header from "@/components/common/header";
import HeroSection from "@/components/landing/HeroSection";
import EasySetupSection from "@/components/landing/EasySetupSection";
import MainFeatureSection from "@/components/landing/MainFeatureSection";

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

          {/* ── CONTINUOUS HOMEPAGE CONTENT WRAPPER (1440x2519 Background) ── */}
          <div className="relative w-full overflow-hidden bg-[#0C0C0C]">
            {/* Background Smoke Texture Image */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <Image
                src="/images/homepage/background-content.png"
                alt="Content Background"
                fill
                priority
                className="object-cover object-top opacity-75"
                sizes="100vw"
              />
              {/* Seamless Top & Bottom Blends */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#0C0C0C] via-transparent to-[#0C0C0C]" />
            </div>

            {/* Content Sections seamlessly rendered on the same background */}
            <div className="relative z-10 flex flex-col">
              <EasySetupSection />
              <MainFeatureSection />
            </div>
          </div>
        </>
      )}
    </main>
  );
}