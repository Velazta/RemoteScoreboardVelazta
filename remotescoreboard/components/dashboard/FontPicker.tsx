"use client";

import React, { useRef, useState, useMemo } from "react";
import { UploadCloud, Loader2, Check, Search, Globe, FileUp, X } from "lucide-react";
import { uploadCustomFont } from "@/lib/supabase/storage";
import { GOOGLE_FONTS } from "@/lib/fonts";

interface FontPickerProps {
  label: string;
  valueFontFamily: string;
  valueCustomUrl: string | null;
  onChange: (fontFamily: string, customFontUrl: string | null) => void;
  layoutId: string;
}

export function FontPicker({ label, valueFontFamily, valueCustomUrl, onChange, layoutId }: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"google" | "custom">("google");
  const [search, setSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredFonts = useMemo(() => {
    if (!search) return GOOGLE_FONTS;
    return GOOGLE_FONTS.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const result = await uploadCustomFont(file, layoutId);
    setIsUploading(false);

    if (result) {
      onChange(result.fontFamily, result.publicUrl);
      setIsOpen(false);
    } else {
      alert("Gagal meng-upload font ke Supabase Storage.");
    }
  };

  const handleSelectGoogleFont = (fontName: string) => {
    onChange(fontName, null);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2 font-montserrat relative">
      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</label>
      
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full bg-[#242424] border border-white/10 rounded-[8px] px-4 py-3 hover:bg-[#2a2a2a] transition-colors text-left"
      >
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm text-white truncate" style={{ fontFamily: valueFontFamily }}>
            {valueFontFamily || "Pilih Font"}
          </span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
            {valueCustomUrl ? "Custom Upload" : "Google Fonts"}
          </span>
        </div>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full z-50 bg-[#1A1A1A] border border-white/10 rounded-[8px] shadow-2xl flex flex-col overflow-hidden">
          
          <div className="flex items-center justify-between p-3 border-b border-white/10 bg-[#242424]">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-widest">Pilih Font</h4>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex w-full border-b border-white/10 bg-[#1E1E1E]">
            <button
              onClick={() => setTab("google")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs uppercase tracking-wider font-semibold transition-colors ${tab === "google" ? "text-purple-400 border-b-2 border-purple-400 bg-purple-400/5" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <Globe className="w-3.5 h-3.5" /> Google
            </button>
            <button
              onClick={() => setTab("custom")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs uppercase tracking-wider font-semibold transition-colors ${tab === "custom" ? "text-purple-400 border-b-2 border-purple-400 bg-purple-400/5" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <FileUp className="w-3.5 h-3.5" /> Custom
            </button>
          </div>

          {tab === "google" && (
            <div className="flex flex-col p-2">
              <div className="relative mb-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Cari Google Font..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0A0A0C] border border-white/10 rounded-[6px] pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
                {filteredFonts.map((font) => (
                  <button
                    key={font.name}
                    onClick={() => handleSelectGoogleFont(font.name)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-[6px] hover:bg-white/5 transition-colors text-left"
                  >
                    <span className="text-sm text-zinc-300" style={{ fontFamily: font.name }}>{font.name}</span>
                    {!valueCustomUrl && valueFontFamily === font.name && <Check className="w-4 h-4 text-green-400" />}
                  </button>
                ))}
                {filteredFonts.length === 0 && (
                  <div className="py-4 text-center text-xs text-zinc-500">Font tidak ditemukan.</div>
                )}
              </div>
            </div>
          )}

          {tab === "custom" && (
            <div className="p-4 flex flex-col items-center justify-center gap-4 bg-[#1E1E1E]">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFontUpload}
                accept=".ttf,.woff2,.woff,.otf"
                className="hidden"
              />
              <div className="text-center space-y-1">
                <p className="text-xs text-zinc-400">Punya font sendiri?</p>
                <p className="text-[10px] text-zinc-500">Mendukung format .ttf, .otf, .woff2</p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold py-2.5 rounded-[6px] transition-colors"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {isUploading ? "MENG-UPLOAD..." : "UPLOAD FONT"}
              </button>
              {valueCustomUrl && (
                <div className="flex items-center gap-1.5 text-[10px] text-green-400 mt-2 bg-green-400/10 px-2 py-1 rounded">
                  <Check className="w-3 h-3" /> Custom Font Aktif ({valueFontFamily})
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
