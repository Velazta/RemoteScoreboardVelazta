"use client";

import React from "react";
import Image from "next/image";

// ─── TAMBAHKAN PARTNER DI SINI ─────────────────────────────────────────────
// Untuk menambah partner baru, cukup tambahkan object baru ke array ini.
// Format: { name: "Nama Partner", logo: "/path/ke/logo.png" }
// Pastikan logo sudah ditempatkan di folder public/images/homepage/partners/
const PARTNERS = [
  {
    name: "Partner 1",
    logo: "/images/homepage/partners/velazta-1.png",
  },
  {
    name: "Partner 2",
    logo: "/images/homepage/partners/shifer-logo.png",
  },
];
// ───────────────────────────────────────────────────────────────────────────

export default function RunningLogoBanner() {
  // Duplikasi cukup banyak agar track selalu penuh di semua resolusi
  const loopItems = [
    ...PARTNERS,
    ...PARTNERS,
    ...PARTNERS,
    ...PARTNERS,
    ...PARTNERS,
    ...PARTNERS,
    ...PARTNERS,
    ...PARTNERS,
  ];

  return (
    <div className="relative w-full bg-[#111111]/80 overflow-hidden select-none z-20 border-y border-white/[0.06]">
      
      {/* Edge gradient fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-28 sm:w-40 bg-gradient-to-r from-[#111111] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 sm:w-40 bg-gradient-to-l from-[#111111] to-transparent z-10" />

      {/* Marquee wrapper */}
      <div className="flex overflow-hidden w-full py-4 sm:py-5">

        {/* Track 1 — padding-x pada setiap item agar jarak seragam termasuk di seam */}
        <div className="flex animate-marquee shrink-0 items-center">
          {loopItems.map((partner, i) => (
            <div
              key={`t1-${i}`}
              className="flex shrink-0 items-center justify-center opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0 px-4 sm:px-6 lg:px-8"
            >
              <div className="relative h-10 sm:h-12 lg:h-14 w-[100px] sm:w-[120px] lg:w-[140px]">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Track 2 — identical duplicate for seamless infinite loop */}
        <div className="flex animate-marquee shrink-0 items-center" aria-hidden="true">
          {loopItems.map((partner, i) => (
            <div
              key={`t2-${i}`}
              className="flex shrink-0 items-center justify-center opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0 px-4 sm:px-6 lg:px-8"
            >
              <div className="relative h-10 sm:h-12 lg:h-14 w-[100px] sm:w-[120px] lg:w-[140px]">
                <Image
                  src={partner.logo}
                  alt={partner.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
