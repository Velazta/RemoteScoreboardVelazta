"use client";

import React, { useEffect, useState, useRef } from "react";

interface AnimatedTeamNameProps {
  value: string;
  align?: "left" | "center" | "right" | "justify";
  className?: string;
}

// ============================================================================
// ⚙️ PENGATURAN ANIMASI HACKER DECODE / DIGITAL SCRAMBLE
// Anda dapat mengedit variabel di bawah ini untuk menyesuaikan gaya animasi
// ============================================================================

// 1. Karakter Acak: Kumpulan huruf, angka, atau simbol yang akan muncul saat scrambling.
// Bisa diubah menjadi "01" saja untuk efek binary matrix, atau simbol glitch.
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

// 2. Kecepatan Frame (ms): Menentukan seberapa cepat karakter acak berganti.
// Semakin kecil angkanya, animasinya semakin bergetar cepat (rekomendasi: 30-50).
const SCRAMBLE_SPEED_MS = 30;

// 3. Durasi Total (ms): Target waktu maksimal animasi berjalan sampai teks selesai.
// 600 = 0.6 detik.
const MAX_DURATION_MS = 600;

export default function AnimatedTeamName({ value, align = "center", className = "" }: AnimatedTeamNameProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let iteration = 0;
    
    // Hitung berapa banyak "frame" yang akan berjalan selama durasi maksimal
    const totalFrames = MAX_DURATION_MS / SCRAMBLE_SPEED_MS;
    
    // Kecepatan buka kunci huruf per frame (supaya durasinya konsisten baik kata pendek maupun panjang)
    // Minimal buka 0.5 huruf per frame agar tidak macet di kata yang sangat pendek.
    const revealSpeed = Math.max(value.length / totalFrames, 0.5);

    // Bersihkan interval sebelumnya jika ada update teks beruntun yang cepat
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setDisplayValue((prev) =>
        value
          .split("")
          .map((char, index) => {
            // Biarkan spasi tetap menjadi spasi (tidak ikut teracak)
            if (char === " " || char === "\n") return char;

            // Jika indeks huruf ini sudah lebih kecil dari iterasi saat ini, kunci huruf asli
            if (index < iteration) {
              return char;
            }

            // Jika belum, tampilkan karakter acak
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join("")
      );

      iteration += revealSpeed;

      // Jika semua huruf sudah terbuka, hentikan animasi dan pastikan nilainya persis sama
      if (iteration >= value.length) {
        clearInterval(intervalRef.current!);
        setDisplayValue(value);
      }
    }, SCRAMBLE_SPEED_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [value]);

  // Mapping alignment untuk CSS flex
  const justifyMap: Record<string, string> = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
    justify: "space-between",
  };

  const isMultiline = value.includes("\n");

  return (
    <span
      className={`relative flex items-center w-full h-full leading-none ${!isMultiline ? "overflow-hidden" : ""} ${className}`}
      style={{ justifyContent: justifyMap[align] }}
    >
      <span
        className={`${isMultiline ? "whitespace-pre-wrap" : "whitespace-nowrap"} w-full`}
        style={{ textAlign: align as React.CSSProperties["textAlign"] }}
      >
        {displayValue}
      </span>
    </span>
  );
}
