"use client";

import React from "react";
import { Radio, Copy } from "lucide-react";

export default function StreamingSource() {
  const obsUrl = "https://velazta.live/obs/match-tqq02a";

  return (
    <div className="flex flex-col w-full rounded-[12px] border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-6 gap-3 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 text-white">
        <Radio className="w-6 h-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        <h2 className="font-montserrat font-medium text-lg tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          Streaming Browser Source
        </h2>
      </div>

      {/* Subtitle */}
      <p className="font-poppins text-[13px] text-zinc-400">
        Add this link as a Browser Source in OBS, set it to 1920 × 1080, and it will mirror every change made in this console live.
      </p>

      {/* Input & Button Layout */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full mt-1">
        <div className="flex-1 px-4 py-3.5 rounded-[8px] bg-[#242424] border border-white/10 flex items-center min-w-0">
          <span className="font-mono text-xs text-zinc-300 w-full select-all truncate overflow-hidden">
            {obsUrl}
          </span>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-[8px] bg-[#a855f7] hover:bg-[#9333ea] active:scale-95 transition-all text-white font-montserrat font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer whitespace-nowrap flex-shrink-0">
          <Copy className="w-4 h-4" />
          Copy Link
        </button>
      </div>
    </div>
  );
}
