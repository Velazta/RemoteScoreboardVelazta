"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import gsap from "gsap";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    question: "What is Velazta Remote Scoreboard?",
    answer:
      "Velazta is a web-based broadcast tool designed specifically for esports live streams on OBS Studio and TikTok Live, allowing operators to build custom scoreboard overlays and control scores remotely from any device.",
  },
  {
    question: "How does real-time synchronization work?",
    answer:
      "Powered by Supabase Realtime WebSockets, any score or team name modification on the Remote Control Panel instantly updates the OBS Browser Source overlay with zero delay and without needing to refresh the page.",
  },
  {
    question: "Can I upload custom 1920x1080 backgrounds and custom fonts?",
    answer:
      "Yes, the Custom Layout Editor allows you to upload custom 1920x1080 background images, import custom typography (.ttf / .woff2 files), and configure exact coordinate positions (X, Y) for every scoreboard element.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            // Animate FAQ Heading
            if (headingRef.current) {
              tl.fromTo(
                headingRef.current,
                { opacity: 0, y: 35, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 1 },
                0
              );
            }

            // Animate FAQ Items Stagger
            if (itemsRef.current) {
              const items = itemsRef.current.children;
              tl.fromTo(
                items,
                { opacity: 0, y: 35 },
                { opacity: 1, y: 0, duration: 0.8, stagger: 0.16 },
                0.2
              );
            }

            observer.disconnect;
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
      id="faq"
      ref={sectionRef}
      className="relative w-full pt-12 pb-24 sm:pt-16 sm:pb-32 lg:pt-16 lg:pb-36 overflow-hidden bg-transparent"
    >
      {/* ── MAIN CONTAINER (1440px Canvas dengan 80px Padding Kiri-Kanan) ── */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-20">
        
        {/* ── TITLE: FAQ (Glow Effect) ── */}
        <div className="flex justify-center text-center mb-12 sm:mb-16 lg:mb-20">
          <h2
            ref={headingRef}
            className="font-montserrat font-bold text-4xl sm:text-5xl lg:text-6xl tracking-[3.29px] uppercase text-white drop-shadow-[0_0_22px_rgba(255,255,255,0.95)] opacity-0"
          >
            FAQ
          </h2>
        </div>

        {/* ── ACCORDION LIST CONTAINER ── */}
        <div
          ref={itemsRef}
          className="flex flex-col gap-4 sm:gap-5 w-full max-w-[1000px] mx-auto"
        >
          {FAQ_DATA.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="group rounded-[20px] sm:rounded-[24px]
                  bg-[#323232]/20 hover:bg-[#323232]/30 backdrop-blur-xl
                  border border-white/[0.12] hover:border-white/30
                  transition-all duration-300 overflow-hidden opacity-0"
              >
                {/* Accordion Trigger Header */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-6 sm:p-7 text-left cursor-pointer focus:outline-none select-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-montserrat font-medium text-base sm:text-lg lg:text-[19px] tracking-wide text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] pr-4">
                    {item.question}
                  </span>

                  {/* Chevron Icon with Rotation Animation */}
                  <div className="flex-shrink-0 flex items-center justify-center text-white/80 group-hover:text-white transition-colors">
                    <ChevronDown
                      className={`w-6 h-6 transition-transform duration-300 ease-out ${
                        isOpen ? "rotate-180 text-white" : "rotate-0 text-white/70"
                      }`}
                    />
                  </div>
                </button>

                {/* Accordion Content Panel */}
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100 px-6 sm:px-7 pb-6"
                      : "grid-rows-[0fr] opacity-0 px-6 sm:px-7 pb-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="font-montserrat font-light text-sm sm:text-[15px] leading-relaxed text-zinc-300/90 border-t border-white/[0.08] pt-4">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
