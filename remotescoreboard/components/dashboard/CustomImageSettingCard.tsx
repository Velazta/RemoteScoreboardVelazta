"use client";

import React, { useRef, useState } from "react";
import { Image as ImageIcon, UploadCloud, Loader2, Lock, Unlock, AlignLeft, AlignCenter, AlignRight, AlignJustify, Trash2 } from "lucide-react";
import { useScoreboardStore, CustomElementState } from "@/store/useScoreboardStore";
import { uploadCustomImage } from "@/lib/supabase/storage";

interface CustomImageSettingCardProps {
  element: CustomElementState;
  index: number;
}

export default function CustomImageSettingCard({ element, index }: CustomImageSettingCardProps) {
  const { updateCustomElement, deleteCustomElement, layout } = useScoreboardStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAlignChange = (align: "left" | "center" | "right" | "justify") => {
    updateCustomElement(element.id, { align });
  };

  const handleToggleLock = () => {
    updateCustomElement(element.id, { isLocked: !element.isLocked });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Harap upload file gambar (PNG, JPG, WebP).");
      return;
    }

    setIsUploading(true);
    const uploadedUrl = await uploadCustomImage(file, element.id);
    setIsUploading(false);

    if (uploadedUrl) {
      updateCustomElement(element.id, { content: uploadedUrl });
    } else {
      alert("Gagal meng-upload gambar ke Supabase Storage.");
    }
  };

  return (
    <div className="flex flex-col w-full bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-[12px] p-6 shadow-lg space-y-5">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-5 h-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <h3 className="font-montserrat font-medium text-lg text-white uppercase tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
            IMAGE #{index + 1}
          </h3>
        </div>
      </div>

      <div className="space-y-4 font-poppins">
        {/* IMAGE UPLOAD / BROWSE */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp, image/svg+xml"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-between w-full px-4 py-3.5 rounded-[8px] bg-[#242424] border border-white/10 hover:border-white/30 cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {isUploading ? (
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />
              ) : (
                <UploadCloud className="w-5 h-5 text-zinc-400 group-hover:text-white shrink-0 transition-colors" />
              )}
              <span className="text-sm text-zinc-300 group-hover:text-white truncate">
                {element.content ? "Change Uploaded Image" : "Upload Image"}
              </span>
            </div>
            <span className="text-xs font-medium text-zinc-400 group-hover:text-white uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded">
              browse
            </span>
          </div>

          {/* Image Preview Thumbnail */}
          {element.content && (
            <div className="mt-3 relative w-full h-24 rounded-[8px] bg-[#141414] border border-white/10 overflow-hidden flex items-center justify-center p-2">
              <img src={element.content} alt="Custom Preview" className="max-h-full max-w-full object-contain" />
            </div>
          )}
        </div>

        {/* IMAGE SIZE SLIDER */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[13px] font-medium text-white/80 uppercase tracking-wider">
              IMAGE SIZE
            </label>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
              {element.width}px
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={1000}
            value={element.width}
            onChange={(e) => updateCustomElement(element.id, { width: Number(e.target.value) })}
            className="w-full h-2 bg-[#242424] rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* IMAGE ROTATION SLIDER */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[13px] font-medium text-white/80 uppercase tracking-wider">
              ROTATION
            </label>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
              {element.rotation || 0}°
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            value={element.rotation || 0}
            onChange={(e) => updateCustomElement(element.id, { rotation: Number(e.target.value) })}
            className="w-full h-2 bg-[#242424] rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* IMAGE LOCATION (X, Y, W, Align, Lock) */}
        <div>
          <label className="block text-[13px] font-medium text-white/80 mb-2 uppercase tracking-wider">
            IMAGE LOCATION
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
