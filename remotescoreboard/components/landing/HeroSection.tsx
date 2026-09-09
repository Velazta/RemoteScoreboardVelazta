"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";

export default function HeroSection() {
  const textRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const remoteRef = useRef<HTMLHeadingElement>(null);
  const scoringRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    const remoteText = "REMOTE";
    const scoringText = "SCORING OVERLAY";

    if (remoteRef.current) remoteRef.current.textContent = "";
    if (scoringRef.current) scoringRef.current.textContent = "";

    // REMOTE SEKALI
    tl.to({}, {
      duration: 0.6,
      delay: 0.3, // Delay sesuai request
      onUpdate: function () {
        if (remoteRef.current) {
          const progress = this.progress();
          const currentLength = Math.floor(progress * remoteText.length);
          remoteRef.current.textContent = remoteText.substring(0, currentLength);
        }
      },
    });

    // ── Typewriter: "SCORING OVERLAY" (pertama kali, lalu masuk loop) ──
  tl.to({}, {
    duration: 1.2,
    ease: "none",
    onUpdate: function () {
      if (scoringRef.current) {
        const len = Math.floor(this.progress() * scoringText.length);
        scoringRef.current.textContent = scoringText.substring(0, len);
      }
    },
    onComplete: () => {
      // Pastikan teks penuh dulu sebelum loop dimulai
      if (scoringRef.current) {
        scoringRef.current.textContent = scoringText;
      }
      const loopTypewriter = () => {
        // ── PHASE 1: Jeda 5 detik (teks penuh terlihat) ──
        gsap.to({}, {
          duration: 3,
          onComplete: () => {
            // ── PHASE 2: BACKWARD — hapus karakter dari kanan ke kiri ──
            gsap.to({}, {
              duration: 1.0,
              ease: "none",
              onUpdate: function () {
                if (scoringRef.current) {
                  // Progress 0→1, berarti sisa karakter dari kanan berkurang
                  const charsLeft = scoringText.length - Math.floor(this.progress() * scoringText.length);
                  scoringRef.current.textContent = scoringText.substring(0, charsLeft);
                }
              },
              onComplete: () => {
                if (scoringRef.current) scoringRef.current.textContent = "";
                // ── PHASE 3: Jeda pendek sebelum ketik ulang ──
                gsap.to({}, {
                  duration: 0.4,
                  onComplete: () => {
                    // ── PHASE 4: FORWARD — ketik lagi dari awal ──
                    gsap.to({}, {
                      duration: 1.2,
                      ease: "none",
                      onUpdate: function () {
                        if (scoringRef.current) {
                          const len = Math.floor(this.progress() * scoringText.length);
                          scoringRef.current.textContent = scoringText.substring(0, len);
                        }
                      },
                      onComplete: () => {
                        if (scoringRef.current) {
                          scoringRef.current.textContent = scoringText;
                        }
                        // Ulangi dari PHASE 1
                        loopTypewriter();
                      },
                    });
                  },
                });
              },
            });
          },
        });
      };
      loopTypewriter();
    },
  });

    if (textRef.current) {
      const els = textRef.current.querySelectorAll("[data-anim]");
      tl.fromTo(
        els,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15 },
        0.4
      );
    }

    if (btnRef.current) {
      tl.fromTo(
        btnRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.8 },
        1.1
      );
    }

    if (modelRef.current) {
      tl.fromTo(
        modelRef.current,
        { opacity: 0, x: 60 },
        { opacity: 1, x: 0, duration: 1.4, ease: "power2.out" },
        0.2
      );

      gsap.to(modelRef.current, {
        y: -20,
        duration: 2.5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1.6,
      });
    }
  }, []);

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-[#0C0C0C]">
      {/* ── LAYER 0: BACKGROUND ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/homepage/hero/background-homepage.png"
          alt="Hero Background"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0C0C0C] via-[#0C0C0C]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C] via-transparent to-transparent" />
      </div>

      {/* ── MAIN CONTENT WRAPPER ── */}
      <div className="relative z-10 w-full min-h-screen flex items-center pointer-events-none">
        
        {/* ── LAYER 1: MODEL ── */}
        <div className="absolute inset-0 flex flex-col justify-start lg:justify-center items-center lg:items-end pt-20 lg:pt-0 overflow-hidden">
          <div
            ref={modelRef}
            className="relative w-[120%] sm:w-[420px] h-[55vh] sm:h-[60vh] lg:w-[65vw] max-w-[1000px] lg:h-[110vh] lg:translate-x-[5%] xl:translate-x-0 opacity-0"
          >
            <Image
              src="/images/homepage/hero/MODEL.png"
              alt="Hero Model"
              fill
              priority
              className="object-contain object-center lg:object-right"
              sizes="(max-width: 1024px) 100vw, 65vw"
            />
          </div>
        </div>

        {/* ── LAYER 2: TEXT CONTENT ── */}
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-1.5 lg:px-3 flex flex-col items-center lg:place-items-start justify-end lg:justify-center min-h-screen pb-24 pt-[45vh] lg:pb-0 lg:pt-0">
          
          <div
            ref={textRef}
            className="flex flex-col gap-3 lg:gap-4 max-w-[2000px] lg:max-w-[2080px] items-center lg:items-start text-center lg:text-left pointer-events-auto"
          >
            {/* Title 1: REMOTE */}
            <h1
              ref={remoteRef}
              data-anim
              className="font-montserrat font-bold text-[clamp(2.5rem,5.5vw,6rem)] leading-[1.05] tracking-[0.06em] sm:tracking-[0.05em] uppercase text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]"
              style={{ mixBlendMode: "difference" }}
            >
              REMOTE
            </h1>

            {/* Title 2: SCORING OVERLAY (Dipisah agar style bisa dikustomisasi secara independen) */}
            <h1
              ref={scoringRef}
              data-anim
              className="font-montserrat font-bold text-[clamp(2.5rem,5.5vw,6rem)] leading-[1.05] tracking-[0.06em] sm:tracking-[0.05em] uppercase text-[#B9B9B9] drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]"
              style={{ mixBlendMode: "difference" }}
            >
              SCORING OVERLAY
            </h1>

            {/* Subtitle dengan Glow */}
            <h1
              data-anim
              className="font-montserrat font-medium text-[clamp(1.5rem,3vw,0.6rem)] leading-[1.1] tracking-[0.1em] sm:tracking-[0.9em] text-white uppercase mt-1 drop-shadow-[0_0_4px_rgba(255,255,255,2)]"
            >
              VIOLENCE DISTRICT TOURNAMENT
            </h1>

            {/* Description */}
            <p
              data-anim
              className="font-montserrat font-light text-lg-justify text-sm-center text-[clamp(0.75rem,1vw,2rem)] leading-relaxed text-white/70 max-w-187.5 mx-auto lg:mx-0"
            >
              a web-based broadcast tool platform specifically designed to
              automate scoring systems (remote scoring) and live broadcast
              overlay management for district tournaments
            </p>

            {/* CTA Button */}
            <Link
              ref={btnRef}
              href="/auth/register"
              className="group mt-4 self-center lg:self-start opacity-0 inline-flex items-center gap-3 px-8 py-4 rounded-full
                bg-[#1A1A1A]/80 backdrop-blur-md border border-white/20
                font-montserrat font-medium text-[18px] tracking-widest text-white uppercase
                hover:bg-white/10 hover:border-white/40 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]
                transition-all duration-300 ease-out shadow-[0_4px_24px_rgba(0,0,0,0.5)] cursor-pointer"
            >
              CREATE CUSTOM
              <span className="text-lg leading-none transform translate-y-[-1px] group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── BOTTOM FADE ── */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0C0C0C] to-transparent z-30 pointer-events-none" />
    </section>
  );
}