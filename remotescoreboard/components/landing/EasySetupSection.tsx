"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";

export default function EasySetupSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intersection Observer untuk memicu animasi saat user scroll ke section ini
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            // Animate Mockup (Left)
            if (mockupRef.current) {
              tl.fromTo(
                mockupRef.current,
                { opacity: 0, x: -50, scale: 0.94 },
                { opacity: 1, x: 0, scale: 1, duration: 1.2 },
                0
              );

              // Floating halus berkelanjutan
              gsap.to(mockupRef.current, {
                y: -10,
                duration: 3,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
                delay: 1.2,
              });
            }

            // Animate Text Elements (Right)
            if (textRef.current) {
              const elements = textRef.current.querySelectorAll("[data-anim]");
              tl.fromTo(
                elements,
                { opacity: 0, y: 35 },
                { opacity: 1, y: 0, duration: 0.9, stagger: 0.16 },
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
      id="tutorials"
      ref={sectionRef}
      className="relative w-full pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-[79px] lg:pb-[60px] overflow-hidden bg-transparent"
    >
      {/* ── MAIN CONTAINER (1440px Canvas dengan 80px Padding Kiri-Kanan) ── */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-18">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-30 min-h-[500px]">
          
          {/* ── LEFT: TABLET MOCKUP OVERLAY (Proporsional & Centered) ── */}
          <div
            ref={mockupRef}
            className="w-full lg:w-[70%] flex items-center justify-center opacity-0"
          >
            <div className="relative w-full max-w-[640px] lg:max-w-[720px] h-[340px] sm:h-[420px] lg:h-[500px] flex items-center justify-center">
              <Image
                src="/images/homepage/easy-setup/tablet-object-overlay.png"
                alt="Tablet Scoreboard Mockup"
                fill
                priority
                className="object-contain object-center lg:object-left drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] drop-shadow-[0_0_60px_rgba(255,255,255,0.06)]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 52vw, 720px"
              />
            </div>
          </div>

          {/* ── RIGHT: DIAGONAL TEXT CONTENT & CTA BUTTON (Centered Vertically) ── */}
          <div
            ref={textRef}
            className="w-full lg:w-[48%] flex flex-col justify-center items-center lg:items-start text-center lg:text-left text-white"
          >
            {/* Title: EASY SETUP */}
            <h2
              data-anim
              className="font-montserrat font-bold text-4xl sm:text-5xl lg:text-[56px] xl:text-[70px] leading-[1.08] tracking-wide uppercase text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.85)] opacity-0"
            >
              EASY SETUP
            </h2>

            {/* Block 1: Visual Preview */}
            <div
              data-anim
              className="mt-5 sm:mt-6 max-w-[560px] text-sm sm:text-base xl:text-[17px] leading-relaxed text-zinc-300 font-montserrat font-light opacity-0"
            >
              <p>
                <span className="font-semibold text-white">Visual Preview:</span>{" "}
                Features a tablet mockup demonstrating the live scoreboard overlay interface in action during a tournament broadcast.
              </p>
            </div>

            {/* Block 2: Guided Onboarding (Diagonal Indentation on Desktop) */}
            <div
              data-anim
              className="mt-4 sm:mt-5 max-w-[560px] text-sm sm:text-base xl:text-[17px] leading-relaxed text-zinc-300 font-montserrat font-light lg:translate-x-8 xl:translate-x-12 opacity-0"
            >
              <p>
                <span className="font-semibold text-white">Guided Onboarding:</span>{" "}
                Accompanied by descriptive text placeholders and a Watch Tutorial button to help new tournament operators get started quickly.
              </p>
            </div>

            {/* Button: WATCH TUTORIAL → (Shifted Diagonally on Desktop, Centered on Mobile) */}
            <div
              data-anim
              className="mt-6 sm:mt-8 lg:ml-20 sm:mr-36 lg:mr-0 self-center lg:self-right lg:translate-x-14 xl:translate-x-20 opacity-0"
            >
              <Link
                href="#tutorial-video"
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-full
                  bg-[#1A1A1A]/80 backdrop-blur-md border border-white/20
                  font-montserrat font-medium text-[18px] tracking-widest text-white uppercase
                  hover:bg-white/10 hover:border-white/40 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]
                  transition-all duration-300 ease-out shadow-[0_4px_24px_rgba(0,0,0,0.5)] cursor-pointer"
              >
                WATCH TUTORIAL
                <span className="text-lg leading-none transform translate-y-[-1px] group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
