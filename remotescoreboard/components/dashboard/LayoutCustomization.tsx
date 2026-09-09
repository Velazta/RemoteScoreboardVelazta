"use client";

import React, { useState } from "react";
import { Type, UploadCloud, AlignLeft, AlignCenter, AlignRight, AlignJustify, Lock } from "lucide-react";

export default function LayoutCustomization() {
  const [teamNameSize, setTeamNameSize] = useState(90);
  const [scoreSize, setScoreSize] = useState(90);

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Font Settings Card */}
      <div className="flex flex-col w-full bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-[12px] p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Type className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <h3 className="font-montserrat font-medium text-lg text-white tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
            Font Settings
          </h3>
        </div>

        <div className="space-y-6 font-montserrat">
          {/* Upload Font */}
          <button className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full rounded-[8px] bg-[#242424] border border-white/10 px-4 py-3 hover:bg-[#2a2a2a] transition-colors cursor-pointer group gap-2 sm:gap-0">
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
              <UploadCloud className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
              <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors truncate">
                Upload custom font (.ttf, .woff2)
              </span>
            </div>
            <span className="text-sm text-zinc-500 group-hover:text-zinc-400">browse</span>
          </button>

          {/* Sliders */}
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[14px] font-medium text-white uppercase tracking-wider">TEAM NAME SIZE</label>
                <span className="text-xs text-white">{teamNameSize}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={teamNameSize}
                onChange={(e) => setTeamNameSize(Number(e.target.value))}
                className="w-full h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#a855f7]"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[14px] font-medium text-white uppercase tracking-wider">SCORE SIZE</label>
                <span className="text-xs text-white">{scoreSize}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={scoreSize}
                onChange={(e) => setScoreSize(Number(e.target.value))}
                className="w-full h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#a855f7]"
              />
            </div>
          </div>

          {/* Color Pickers */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <div className="flex-1 w-full">
              <label className="block text-[14px] font-medium text-white mb-2 uppercase tracking-wider">TEAM NAME COLOR</label>
              <div className="flex items-center gap-3 w-full rounded-[8px] bg-[#242424] border border-white/10 px-4 py-3 hover:bg-[#2a2a2a] transition-colors cursor-pointer group relative overflow-hidden">
                <input type="color" defaultValue="#ffffff" className="absolute top-1/2 left-4 -translate-y-1/2 w-6 h-6 opacity-0 cursor-pointer z-10" />
                <div className="w-6 h-6 rounded-[4px] bg-white border border-white/20 group-hover:border-white/40 transition-colors pointer-events-none" />
                <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors pointer-events-none">#ffffff</span>
              </div>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-[14px] font-medium text-white mb-2 uppercase tracking-wider">SCORE COLOR</label>
              <div className="flex items-center gap-3 w-full rounded-[8px] bg-[#242424] border border-white/10 px-4 py-3 hover:bg-[#2a2a2a] transition-colors cursor-pointer group relative overflow-hidden">
                <input type="color" defaultValue="#ffffff" className="absolute top-1/2 left-4 -translate-y-1/2 w-6 h-6 opacity-0 cursor-pointer z-10" />
                <div className="w-6 h-6 rounded-[4px] bg-white border border-white/20 group-hover:border-white/40 transition-colors pointer-events-none" />
                <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors pointer-events-none">#ffffff</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Element Positioning Card */}
      <div className="flex flex-col w-full bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-[12px] p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Type className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <h3 className="font-montserrat font-medium text-lg text-white tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
            Element Positioning
          </h3>
        </div>

        <div className="space-y-6 font-montserrat">
          
          {/* Team 1 Name */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
            <div className="w-32">
              <span className="text-[11px] font-medium text-zinc-300 uppercase tracking-wider">TEAM 1 NAME</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 flex-1 sm:ml-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#a855f7]">X</span>
                <input type="text" defaultValue="300" className="w-14 sm:w-16 rounded-[6px] bg-[#242424] border border-white/10 px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-white/30 min-w-0" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#a855f7]">Y</span>
                <input type="text" defaultValue="300" className="w-14 sm:w-16 rounded-[6px] bg-[#242424] border border-white/10 px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-white/30 min-w-0" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#a855f7]">W</span>
                <input type="text" defaultValue="300" className="w-14 sm:w-16 rounded-[6px] bg-[#242424] border border-white/10 px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-white/30 min-w-0" />
              </div>
            </div>
            <div className="flex items-center gap-4 justify-between sm:justify-start w-full sm:w-auto">
              <div className="flex items-center rounded-[6px] bg-[#242424] border border-white/10 p-1">
                <button className="p-1.5 rounded-[4px] text-zinc-400 hover:text-white transition-colors"><AlignLeft className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-[4px] bg-[#a855f7] text-white"><AlignCenter className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-[4px] text-zinc-400 hover:text-white transition-colors"><AlignRight className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-[4px] text-zinc-400 hover:text-white transition-colors"><AlignJustify className="w-4 h-4" /></button>
              </div>
              <Lock className="w-4 h-4 text-zinc-600" />
            </div>
          </div>

          {/* Team 1 Score */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
            <div className="w-32">
              <span className="text-[11px] font-medium text-zinc-300 uppercase tracking-wider">TEAM 1 SCORE</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 flex-1 sm:ml-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#a855f7]">X</span>
                <input type="text" defaultValue="300" className="w-14 sm:w-16 rounded-[6px] bg-[#242424] border border-white/10 px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-white/30 min-w-0" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#a855f7]">Y</span>
                <input type="text" defaultValue="300" className="w-14 sm:w-16 rounded-[6px] bg-[#242424] border border-white/10 px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-white/30 min-w-0" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#a855f7]">W</span>
                <input type="text" defaultValue="300" className="w-14 sm:w-16 rounded-[6px] bg-[#242424] border border-white/10 px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-white/30 min-w-0" />
              </div>
            </div>
            <div className="flex items-center gap-4 justify-between sm:justify-start w-full sm:w-auto">
              <div className="flex items-center rounded-[6px] bg-[#242424] border border-white/10 p-1">
                <button className="p-1.5 rounded-[4px] text-zinc-400 hover:text-white transition-colors"><AlignLeft className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-[4px] bg-[#a855f7] text-white"><AlignCenter className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-[4px] text-zinc-400 hover:text-white transition-colors"><AlignRight className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-[4px] text-zinc-400 hover:text-white transition-colors"><AlignJustify className="w-4 h-4" /></button>
              </div>
              <Lock className="w-4 h-4 text-zinc-600" />
            </div>
          </div>

          {/* Team 2 Name */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
            <div className="w-32">
              <span className="text-[11px] font-medium text-zinc-300 uppercase tracking-wider">TEAM 2 NAME</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 flex-1 sm:ml-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#eab308]">X</span>
                <input type="text" defaultValue="300" className="w-14 sm:w-16 rounded-[6px] bg-[#242424] border border-white/10 px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-white/30 min-w-0" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#eab308]">Y</span>
                <input type="text" defaultValue="300" className="w-14 sm:w-16 rounded-[6px] bg-[#242424] border border-white/10 px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-white/30 min-w-0" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#eab308]">W</span>
                <input type="text" defaultValue="300" className="w-14 sm:w-16 rounded-[6px] bg-[#242424] border border-white/10 px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-white/30 min-w-0" />
              </div>
            </div>
            <div className="flex items-center gap-4 justify-between sm:justify-start w-full sm:w-auto">
              <div className="flex items-center rounded-[6px] bg-[#242424] border border-white/10 p-1">
                <button className="p-1.5 rounded-[4px] text-zinc-400 hover:text-white transition-colors"><AlignLeft className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-[4px] bg-[#eab308] text-[#1a1a1a]"><AlignCenter className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-[4px] text-zinc-400 hover:text-white transition-colors"><AlignRight className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-[4px] text-zinc-400 hover:text-white transition-colors"><AlignJustify className="w-4 h-4" /></button>
              </div>
              <Lock className="w-4 h-4 text-zinc-600" />
            </div>
          </div>

          {/* Team 2 Score */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
            <div className="w-32">
              <span className="text-[11px] font-medium text-zinc-300 uppercase tracking-wider">TEAM 2 SCORE</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 flex-1 sm:ml-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#eab308]">X</span>
                <input type="text" defaultValue="300" className="w-14 sm:w-16 rounded-[6px] bg-[#242424] border border-white/10 px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-white/30 min-w-0" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#eab308]">Y</span>
                <input type="text" defaultValue="300" className="w-14 sm:w-16 rounded-[6px] bg-[#242424] border border-white/10 px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-white/30 min-w-0" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#eab308]">W</span>
                <input type="text" defaultValue="300" className="w-14 sm:w-16 rounded-[6px] bg-[#242424] border border-white/10 px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-white/30 min-w-0" />
              </div>
            </div>
            <div className="flex items-center gap-4 justify-between sm:justify-start w-full sm:w-auto">
              <div className="flex items-center rounded-[6px] bg-[#242424] border border-white/10 p-1">
                <button className="p-1.5 rounded-[4px] text-zinc-400 hover:text-white transition-colors"><AlignLeft className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-[4px] bg-[#eab308] text-[#1a1a1a]"><AlignCenter className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-[4px] text-zinc-400 hover:text-white transition-colors"><AlignRight className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-[4px] text-zinc-400 hover:text-white transition-colors"><AlignJustify className="w-4 h-4" /></button>
              </div>
              <Lock className="w-4 h-4 text-zinc-600" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
