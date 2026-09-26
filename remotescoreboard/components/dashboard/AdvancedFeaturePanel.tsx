"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Type, Image as ImageIcon, Clock, ChevronDown } from "lucide-react";
import { useScoreboardStore } from "@/store/useScoreboardStore";
import CustomTextSettingCard from "./CustomTextSettingCard";
import CustomImageSettingCard from "./CustomImageSettingCard";
import TimerSettingCard from "./TimerSettingCard";

export default function AdvancedFeaturePanel() {
  const { customElements, addCustomElement } = useScoreboardStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load timer visibility from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("velazta_showTimer");
    if (saved === "true") {
      setShowTimer(true);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddText = () => {
    addCustomElement("text");
    setDropdownOpen(false);
  };

  const handleAddImage = () => {
    addCustomElement("image");
    setDropdownOpen(false);
  };

  const handleAddTimer = () => {
    setShowTimer(true);
    localStorage.setItem("velazta_showTimer", "true");
    setDropdownOpen(false);
  };

  const handleRemoveTimer = () => {
    setShowTimer(false);
    localStorage.removeItem("velazta_showTimer");
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Top Controls: Add Element + Dropdown Button */}
      <div className="flex items-center justify-end w-full relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 px-5 py-3 rounded-[10px] bg-[#242424] hover:bg-[#2c2c2c] border border-white/10 hover:border-white/20 text-white font-poppins text-sm font-medium tracking-wide transition-all duration-150 cursor-pointer shadow-lg active:scale-[0.98]"
        >
          <span>Add Element</span>
          <Plus className="w-4 h-4 text-cyan-400" />
          <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-52 bg-[#1A1A1A] border border-white/15 rounded-[12px] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={handleAddText}
              className="flex items-center justify-between w-full px-4 py-3 rounded-[8px] hover:bg-white/10 text-sm text-zinc-200 hover:text-white transition-colors cursor-pointer"
            >
              <span>Text+</span>
              <Type className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              onClick={handleAddImage}
              className="flex items-center justify-between w-full px-4 py-3 rounded-[8px] hover:bg-white/10 text-sm text-zinc-200 hover:text-white transition-colors cursor-pointer"
            >
              <span>Image</span>
              <ImageIcon className="w-4 h-4 text-cyan-400" />
            </button>
            <button
              onClick={handleAddTimer}
              className="flex items-center justify-between w-full px-4 py-3 rounded-[8px] hover:bg-white/10 text-sm text-zinc-200 hover:text-white transition-colors cursor-pointer"
            >
              <span>Timer</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        )}
      </div>

      {/* Render Custom Elements (Text & Image) */}
      <div className="space-y-6">
        {customElements.map((el, index) => {
          if (el.type === "text") {
            return <CustomTextSettingCard key={el.id} element={el} index={index} />;
          }
          return <CustomImageSettingCard key={el.id} element={el} index={index} />;
        })}

        {/* Render Timer Setting Card if active */}
        {showTimer && <TimerSettingCard onRemove={handleRemoveTimer} />}

        {customElements.length === 0 && !showTimer && (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-xl bg-[#141414]/50 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-500">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-sm text-zinc-400 font-poppins">
              Belum ada elemen tambahan. Klik <span className="text-cyan-400 font-semibold">&quot;Add Element +&quot;</span> di atas untuk menambahkan Teks, Gambar, atau Timer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
