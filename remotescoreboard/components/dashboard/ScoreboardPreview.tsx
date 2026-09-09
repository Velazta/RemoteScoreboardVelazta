"use client";

import React from "react";
import { Image as ImageIcon, UploadCloud } from "lucide-react";

export default function ScoreboardPreview() {
  return (
    <div className="flex flex-col w-full rounded-[12px] border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-6 gap-5 shadow-lg">
      {/* Header Panel */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3 text-white">
          <ImageIcon className="w-6 h-6 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <h2 className="font-montserrat font-medium text-lg tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
            Scoreboard Preview
          </h2>
        </div>
        <div className="px-3 py-1 text-[12px] tracking-widest font-mono text-zinc-400 border border-white/10 rounded-full bg-white/5 uppercase">
          1920x1080
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="relative w-full aspect-video rounded-[8px] bg-[#242424] border border-white/5 flex items-center justify-center overflow-hidden">
        <p className="font-poppins text-zinc-500 font-medium tracking-wide">
          No Background Uploaded
        </p>
      </div>

      {/* Upload Dropzone */}
      <button className="flex flex-col items-center justify-center w-full py-4 rounded-[8px] border border-white/10 bg-[#141414] hover:bg-white/5 transition-colors cursor-pointer group">
        <UploadCloud className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors mb-2" />
        <span className="font-poppins font-medium text-sm text-zinc-300">
          Upload Scoreboard Design
        </span>
        <span className="font-poppins text-[12px] text-zinc-500 mt-1">
          1920 x 1080 PNG or JPG - drag & drop or click to browse
        </span>
      </button>
    </div>
  );
}
