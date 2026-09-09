"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

interface FeatureCard {
  title: string;
  description: string;
}

const FEATURES: FeatureCard[] = [
  {
    title: "REAL-TIME SYNC",
    description:
      "Powered by Supabase WebSockets to instantly push score updates to the OBS browser source with zero delay.",
  },
  {
    title: "CUSTOM LAYOUT CONTROL",
    description:
      "Empowers users to configure precise element positions, drag-and-drop elements, and upload custom typography",
  },
  {
    title: "MULTI-DEVICE ACCESS",
    description:
      "Functions as a remote control panel, enabling operators to manage scores seamlessly from a smartphone, tablet, or PC.",
  },
];

export default function MainFeatureSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            // Animate Heading
            if (headingRef.current) {
              tl.fromTo(
                headingRef.current,
                { opacity: 0, y: 35, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 1 },
                0
              );
            }

            // Animate 3 Cards with staggered entrance
            if (cardsRef.current) {
              const cards = cardsRef.current.children;
              tl.fromTo(
                cards,
                { opacity: 0, y: 40, scale: 0.94 },
                {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.9,
                  stagger: 0.18,
                },
                0.2
              );
            }

            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative w-full pt-8 pb-20 sm:pt-12 sm:pb-28 lg:pt-12 lg:pb-36 overflow-hidden bg-transparent"
    >
      {/* ── MAIN CONTAINER (1440px Canvas dengan 80px Padding Kiri-Kanan) ── */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20">
        
        {/* ── TITLE: MAIN FEATURE (Glow Effect) ── */}
        <div className="flex justify-center text-center mb-12 sm:mb-16 lg:mb-20">
          <h2
            ref={headingRef}
            className="font-montserrat font-bold text-4xl sm:text-5xl lg:text-6xl tracking-[3.29px] uppercase text-white drop-shadow-[0_0_22px_rgba(255,255,255,0.95)] opacity-0"
          >
            MAIN FEATURE
          </h2>
        </div>

        {/* ── 3 GLASSMORPHISM FEATURE CARDS ── */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 lg:gap-8 w-full"
        >
          {FEATURES.map((item, index) => (
            <div
              key={index}
              className="group relative flex flex-col justify-start items-center text-center
                p-6 sm:p-6 lg:p-7 rounded-[24px]
                bg-[#323232]/20 hover:bg-[#323232]/35 backdrop-blur-xl
                border border-white/[0.12] hover:border-white/30
                transition-all duration-400 ease-out
                hover:-translate-y-2 hover:shadow-[0_12px_36px_rgba(0,0,0,0.6)]
                opacity-0 cursor-default"
            >
              {/* Subtle top inner glow highlight */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

              {/* Card Title (Medium + Glow Effect) */}
              <h3 className="font-montserrat font-medium text-base sm:text-lg lg:text-[23px] leading-snug tracking-[0.22em] uppercase text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.85)] min-h-[52px] flex items-center justify-center">
                {item.title}
              </h3>

              {/* Card Description (Light font) */}
              <p className="font-montserrat font-light text-sm sm:text-[16px] leading-relaxed text-zinc-300/90 mt-4 max-w-[320px]">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
