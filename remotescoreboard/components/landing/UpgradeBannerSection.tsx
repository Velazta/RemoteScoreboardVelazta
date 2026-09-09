"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";

export default function UpgradeBannerSection() {
  const containerRef = useRef<HTMLElement>(null);
  const textImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const tl = gsap.timeline();

            // Entrance animation
            tl.fromTo(
              textImageRef.current,
              { opacity: 0, scale: 0.94, y: 40, filter: "drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.1))" },
              { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "power3.out" }
            )
            // Continuous breathing floating & radiant pulsing glow effect
            .to(textImageRef.current, {
              filter: "drop-shadow(0px 0px 40px rgba(255, 255, 255, 0.8)) drop-shadow(0px 0px 15px rgba(255, 255, 255, 0.5))",
              y: -8,
              scale: 1.025,
              duration: 2.2,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            });

            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative w-full flex flex-col items-center justify-end overflow-hidden mt-12 sm:mt-20"
    >
      {/* 
        Full-width container so the bottom asset extends across larger screens (up to 1920px or full viewport)
      */}
      <div className="relative w-full max-w-[1920px] mx-auto flex items-end justify-center overflow-hidden">
        
        {/* Layer 1: Bottom Asset (Background/Pedestal) - Scaled up so it doesn't look small/kecut */}
        <div className="relative w-[110%] sm:w-[105%] lg:w-full z-0 pointer-events-none flex justify-center -mb-2 sm:-mb-4">
          <Image
            src="/images/homepage/banner/bottom-asset.png"
            alt="Banner Pedestal Base"
            width={5760}
            height={3260}
            className="w-full h-auto object-cover object-bottom mix-blend-screen scale-105 sm:scale-110 lg:scale-100 origin-bottom"
            priority
          />
        </div>

        {/* Layer 2: Text Asset (Foreground) - Made bigger and offset nicely */}
        <div className="absolute z-10 bottom-0 w-full flex justify-center pb-[4%] sm:pb-[6%] lg:pb-[8%]">
          <Link href="/auth/register" className="cursor-pointer block w-[92%] sm:w-[85%] lg:w-[75%] max-w-[1200px]">
            <Image
              ref={textImageRef}
              src="/images/homepage/banner/upgrade-now.png"
              alt="Upgrade Now"
              width={5760}
              height={3793}
              className="w-full h-auto object-contain opacity-0 hover:scale-[1.03] transition-transform duration-300 cursor-pointer"
            />
          </Link>
        </div>

      </div>
    </section>
  );
}
