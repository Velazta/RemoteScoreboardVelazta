"use client";

import React, { useRef, useState } from "react";
import {
  Type,
  UploadCloud,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Lock,
  Loader2,
  Check,
} from "lucide-react";
import { useScoreboardStore } from "@/store/useScoreboardStore";
import { uploadCustomFont } from "@/lib/supabase/storage";
import { ElementKey, TextAlignment } from "@/types/database";

export default function LayoutCustomization() {
  const fontInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingFont, setIsUploadingFont] = useState(false);

  const {
    layout,
    team1,
    team2,
    elements,
    setTeamNameSize,
    setScoreSize,
    setTeamColor,
    setCustomFontUrl,
    setElementPosition,
  } = useScoreboardStore();

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFont(true);
    const result = await uploadCustomFont(file, layout.id || "");
    setIsUploadingFont(false);

    if (result) {
      setCustomFontUrl(result.publicUrl, result.fontFamily);
    } else {
      alert("Gagal meng-upload font ke Supabase Storage.");
    }
  };

  const handleAlignChange = (key: ElementKey, align: TextAlignment) => {
    setElementPosition(key, { align });
  };

  const handlePosChange = (
    key: ElementKey,
    field: "x" | "y" | "width",
    val: string
  ) => {
    const num = Number(val) || 0;
    setElementPosition(key, { [field]: num });
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Hidden Font Input */}
      <input
        type="file"
        ref={fontInputRef}
        onChange={handleFontUpload}
        accept=".ttf,.woff2,.woff,.otf"
        className="hidden"
      />

      {/* Font Settings Card */}
      <div className="flex flex-col w-full bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-[12px] p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <Type className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <h3 className="font-montserrat font-medium text-lg text-white tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
            Font Settings
          </h3>
        </div>

        <div className="space-y-6 font-montserrat">
          {/* Upload Font Button */}
          <button
            onClick={() => fontInputRef.current?.click()}
            disabled={isUploadingFont}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full rounded-[8px] bg-[#242424] border border-white/10 px-4 py-3 hover:bg-[#2a2a2a] transition-colors cursor-pointer group gap-2 sm:gap-0 disabled:opacity-50"
          >
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
              {isUploadingFont ? (
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin flex-shrink-0" />
              ) : (
                <UploadCloud className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
              )}
              <span className="text-sm text-zinc-300 truncate">
                {layout.customFontUrl
                  ? `Custom Font Active: ${layout.fontFamily}`
                  : "Upload custom font (.ttf, .woff2)"}
              </span>
            </div>
            <span className="text-sm text-zinc-500 group-hover:text-zinc-400">
              {layout.customFontUrl ? "change" : "browse"}
            </span>
          </button>

          {/* Sliders */}
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[14px] font-medium text-white uppercase tracking-wider">
                  TEAM NAME SIZE
                </label>
                <span className="text-xs text-white">{layout.teamNameSize}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={layout.teamNameSize}
                onChange={(e) => setTeamNameSize(Number(e.target.value))}
                className="w-full h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#a855f7]"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[14px] font-medium text-white uppercase tracking-wider">
                  SCORE SIZE
                </label>
                <span className="text-xs text-white">{layout.scoreSize}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={layout.scoreSize}
                onChange={(e) => setScoreSize(Number(e.target.value))}
                className="w-full h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#a855f7]"
              />
            </div>
          </div>

          {/* Color Pickers */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <div className="flex-1 w-full">
              <label className="block text-[14px] font-medium text-white mb-2 uppercase tracking-wider">
                TEAM NAME COLOR
              </label>
              <div className="flex items-center gap-3 w-full rounded-[8px] bg-[#242424] border border-white/10 px-4 py-3 hover:bg-[#2a2a2a] transition-colors cursor-pointer group relative overflow-hidden">
                <input
                  type="color"
                  value={team1.nameColor || "#ffffff"}
                  onChange={(e) => {
                    setTeamColor("team1", "name", e.target.value);
                    setTeamColor("team2", "name", e.target.value);
                  }}
                  className="absolute top-1/2 left-4 -translate-y-1/2 w-6 h-6 opacity-0 cursor-pointer z-10"
                />
                <div
                  className="w-6 h-6 rounded-[4px] border border-white/20 group-hover:border-white/40 transition-colors pointer-events-none"
                  style={{ backgroundColor: team1.nameColor || "#ffffff" }}
                />
                <span className="text-sm text-zinc-300 font-mono uppercase">
                  {team1.nameColor || "#ffffff"}
                </span>
              </div>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-[14px] font-medium text-white mb-2 uppercase tracking-wider">
                SCORE COLOR
              </label>
              <div className="flex items-center gap-3 w-full rounded-[8px] bg-[#242424] border border-white/10 px-4 py-3 hover:bg-[#2a2a2a] transition-colors cursor-pointer group relative overflow-hidden">
                <input
                  type="color"
                  value={team1.scoreColor || "#ffffff"}
                  onChange={(e) => {
                    setTeamColor("team1", "score", e.target.value);
                    setTeamColor("team2", "score", e.target.value);
                  }}
                  className="absolute top-1/2 left-4 -translate-y-1/2 w-6 h-6 opacity-0 cursor-pointer z-10"
                />
                <div
                  className="w-6 h-6 rounded-[4px] border border-white/20 group-hover:border-white/40 transition-colors pointer-events-none"
                  style={{ backgroundColor: team1.scoreColor || "#ffffff" }}
                />
                <span className="text-sm text-zinc-300 font-mono uppercase">
                  {team1.scoreColor || "#ffffff"}
                </span>
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
          {(["team1_name", "team1_score", "team2_name", "team2_score"] as ElementKey[]).map(
            (key) => {
              const el = elements[key];
              const isTeam1 = key.startsWith("team1");
              const accentColor = isTeam1 ? "#a855f7" : "#eab308";
              const labelText = key.replace("_", " ").toUpperCase();

              return (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4"
                >
                  <div className="w-36">
                    <span className="text-[11px] font-medium text-zinc-300 uppercase tracking-wider">
                      {labelText}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 flex-1 sm:ml-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: accentColor }}>
                        X
                      </span>
                      <input
                        type="number"
                        value={el.x}
                        onChange={(e) => handlePosChange(key, "x", e.target.value)}
                        className="w-16 sm:w-20 rounded-[6px] bg-[#242424] border border-white/10 px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-white/30 min-w-0"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: accentColor }}>
                        Y
                      </span>
                      <input
                        type="number"
                        value={el.y}
                        onChange={(e) => handlePosChange(key, "y", e.target.value)}
                        className="w-16 sm:w-20 rounded-[6px] bg-[#242424] border border-white/10 px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-white/30 min-w-0"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: accentColor }}>
                        W
                      </span>
                      <input
                        type="number"
                        value={el.width}
                        onChange={(e) => handlePosChange(key, "width", e.target.value)}
                        className="w-16 sm:w-20 rounded-[6px] bg-[#242424] border border-white/10 px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-white/30 min-w-0"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-start w-full sm:w-auto">
                    <div className="flex items-center rounded-[6px] bg-[#242424] border border-white/10 p-1">
                      {(["left", "center", "right", "justify"] as TextAlignment[]).map(
                        (alignType) => {
                          const isActive = el.align === alignType;
                          const IconComp =
                            alignType === "left"
                              ? AlignLeft
                              : alignType === "center"
                              ? AlignCenter
                              : alignType === "right"
                              ? AlignRight
                              : AlignJustify;

                          return (
                            <button
                              key={alignType}
                              onClick={() => handleAlignChange(key, alignType)}
                              className={`p-1.5 rounded-[4px] transition-colors ${
                                isActive
                                  ? isTeam1
                                    ? "bg-[#a855f7] text-white"
                                    : "bg-[#eab308] text-[#1a1a1a]"
                                  : "text-zinc-400 hover:text-white"
                              }`}
                            >
                              <IconComp className="w-4 h-4" />
                            </button>
                          );
                        }
                      )}
                    </div>
                    <Lock className="w-4 h-4 text-zinc-600" />
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}
