"use client";

import React from "react";
import { Type, Lock, Unlock, AlignLeft, AlignCenter, AlignRight, AlignJustify, Trash2 } from "lucide-react";
import { FontPicker } from "./FontPicker";
import { useScoreboardStore, CustomElementState } from "@/store/useScoreboardStore";

interface CustomTextSettingCardProps {
  element: CustomElementState;
  index: number;
}

export default function CustomTextSettingCard({ element, index }: CustomTextSettingCardProps) {
  const { updateCustomElement, deleteCustomElement, layout } = useScoreboardStore();

  const handleAlignChange = (align: "left" | "center" | "right" | "justify") => {
    updateCustomElement(element.id, { align });
  };

  const handleToggleLock = () => {
    updateCustomElement(element.id, { isLocked: !element.isLocked });
  };

  return (
    <div className="flex flex-col w-full bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-[12px] p-6 shadow-lg space-y-5">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Type className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <h3 className="font-montserrat font-medium text-lg text-white uppercase tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
            TEXT #{index + 1}
          </h3>
        </div>
      </div>

      <div className="space-y-4 font-poppins">
        {/* TEXT CONTENT */}
        <div>
          <label className="block text-[13px] font-medium text-white/80 mb-2 uppercase tracking-wider">
            TEXT
          </label>
          <textarea
            value={element.content}
            onChange={(e) => updateCustomElement(element.id, { content: e.target.value })}
            className="w-full rounded-[8px] bg-[#242424] border border-white/10 px-4 py-3.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors min-h-[100px] resize-y"
            placeholder="Type your text here... Press Enter for new line."
          />
        </div>

        {/* FONT & COLOR ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* FONT SELECT */}
          <FontPicker
            label="FONT"
            valueFontFamily={element.fontFamily || "Montserrat"}
            valueCustomUrl={element.customFontUrl || null}
            onChange={(fontFamily, customFontUrl) =>
              updateCustomElement(element.id, { fontFamily, customFontUrl: customFontUrl || null })
            }
            layoutId={layout.id || "custom-text-fonts"}
          />

          {/* COLOR */}
          <div>
            <label className="block text-[13px] font-medium text-white/80 mb-2 uppercase tracking-wider">
              TEXT COLOR
            </label>
            <div className="flex items-center gap-3 bg-[#242424] border border-white/10 rounded-[8px] p-2">
              <input
                type="color"
                value={element.color || "#ffffff"}
                onChange={(e) => updateCustomElement(element.id, { color: e.target.value })}
                className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
              />
              <span className="text-sm font-mono text-white/90 uppercase">
                {element.color || "#ffffff"}
              </span>
            </div>
          </div>
        </div>

        {/* TEXT SIZE SLIDER */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[13px] font-medium text-white/80 uppercase tracking-wider">
              TEXT SIZE
            </label>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
              {element.fontSize || 40}px
            </span>
          </div>
          <input
            type="range"
            min={12}
            max={200}
            value={element.fontSize || 40}
            onChange={(e) => updateCustomElement(element.id, { fontSize: Number(e.target.value) })}
            className="w-full h-2 bg-[#242424] rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* TEXT LOCATION (X, Y, W, Align, Lock) */}
        <div>
          <label className="block text-[13px] font-medium text-white/80 mb-2 uppercase tracking-wider">
            TEXT LOCATION
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {/* X */}
            <div className="flex items-center gap-1.5 flex-1 min-w-[70px] bg-[#242424] border border-white/10 rounded-[8px] px-3 py-2">
              <span className="text-xs font-bold text-cyan-400">X</span>
              <input
                type="number"
                value={element.x}
                onChange={(e) => updateCustomElement(element.id, { x: Number(e.target.value) })}
                className="w-full bg-transparent text-sm text-white font-mono text-center focus:outline-none"
              />
            </div>

            {/* Y */}
            <div className="flex items-center gap-1.5 flex-1 min-w-[70px] bg-[#242424] border border-white/10 rounded-[8px] px-3 py-2">
              <span className="text-xs font-bold text-cyan-400">Y</span>
              <input
                type="number"
                value={element.y}
                onChange={(e) => updateCustomElement(element.id, { y: Number(e.target.value) })}
                className="w-full bg-transparent text-sm text-white font-mono text-center focus:outline-none"
              />
            </div>

            {/* W */}
            <div className="flex items-center gap-1.5 flex-1 min-w-[70px] bg-[#242424] border border-white/10 rounded-[8px] px-3 py-2">
              <span className="text-xs font-bold text-cyan-400">W</span>
              <input
                type="number"
                value={element.width}
                onChange={(e) => updateCustomElement(element.id, { width: Number(e.target.value) })}
                className="w-full bg-transparent text-sm text-white font-mono text-center focus:outline-none"
              />
            </div>

            {/* ALIGNMENT */}
            <div className="flex items-center bg-[#242424] border border-white/10 rounded-[8px] p-1 gap-1">
              <button
                onClick={() => handleAlignChange("left")}
                className={`p-1.5 rounded transition-colors ${element.align === "left" ? "bg-cyan-500/20 text-cyan-400" : "text-zinc-400 hover:text-white"}`}
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAlignChange("center")}
                className={`p-1.5 rounded transition-colors ${element.align === "center" ? "bg-cyan-500/20 text-cyan-400" : "text-zinc-400 hover:text-white"}`}
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAlignChange("right")}
                className={`p-1.5 rounded transition-colors ${element.align === "right" ? "bg-cyan-500/20 text-cyan-400" : "text-zinc-400 hover:text-white"}`}
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAlignChange("justify")}
                className={`p-1.5 rounded transition-colors ${element.align === "justify" ? "bg-cyan-500/20 text-cyan-400" : "text-zinc-400 hover:text-white"}`}
              >
                <AlignJustify className="w-4 h-4" />
              </button>
            </div>

            {/* LOCK TOGGLE */}
            <button
              onClick={handleToggleLock}
              className={`p-2.5 rounded-[8px] border transition-colors ${
                element.isLocked
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                  : "bg-[#242424] border-white/10 text-zinc-400 hover:text-white"
              }`}
              title={element.isLocked ? "Unlock Element" : "Lock Element"}
            >
              {element.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* DELETE BUTTON */}
        <button
          onClick={() => deleteCustomElement(element.id)}
          className="w-full py-3 mt-2 rounded-[8px] border border-red-500/40 hover:border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium text-sm transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
