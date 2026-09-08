import React from "react";

export default function AuthBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[#0C0C0C]">
      {/* Soft Ambient Diffuse White Gradients */}
      <div
        className="absolute top-[28%] left-[22%] -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] md:w-[540px] md:h-[540px] rounded-full opacity-[0.14] filter blur-[110px] bg-white pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-[68%] left-[72%] -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] md:w-[580px] md:h-[580px] rounded-full opacity-[0.12] filter blur-[120px] bg-white pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full opacity-[0.05] filter blur-[90px] bg-zinc-300 pointer-events-none"
        aria-hidden="true"
      />

      {/* Subtle Corner Circle Arcs (Vector lines as seen in design reference) */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {/* Top-Left Corner Arc */}
        <circle
          cx="0"
          cy="0"
          r="190"
          fill="none"
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="1.2"
        />

        {/* Bottom-Left Corner Arc */}
        <circle
          cx="0"
          cy="100%"
          r="230"
          fill="none"
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="1.2"
        />

        {/* Bottom-Right Corner Arc */}
        <circle
          cx="100%"
          cy="100%"
          r="210"
          fill="none"
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  );
}
