"use client";

import React, { useRef, useState, useEffect } from "react";
import { Image as ImageIcon, UploadCloud, Loader2, Trash2 } from "lucide-react";
import { useScoreboardStore } from "@/store/useScoreboardStore";
import { uploadBackgroundImage, injectFontFace } from "@/lib/supabase/storage";

export default function ScoreboardPreview() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    layout,
    team1,
    team2,
    elements,
    setBackgroundImageUrl,
  } = useScoreboardStore();

  // Inject font jika ada custom font URL
  useEffect(() => {
    if (layout.customFontUrl && layout.fontFamily) {
      injectFontFace(layout.fontFamily, layout.customFontUrl);
    }
  }, [layout.customFontUrl, layout.fontFamily]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processUpload(file);
  };

  const processUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Harap upload file gambar (PNG, JPG, WebP).");
      return;
    }

    setIsUploading(true);
    const uploadedUrl = await uploadBackgroundImage(file, layout.id || "");
    setIsUploading(false);

    if (uploadedUrl) {
      setBackgroundImageUrl(uploadedUrl);
    } else {
      alert("Gagal meng-upload gambar background ke Supabase Storage.");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  // Kalkulasi persentase koordinat 1920x1080 untuk rendering di preview
  const getStyle = (key: keyof typeof elements) => {
    const el = elements[key];
    return {
      left: `${(el.x / 1920) * 100}%`,
      top: `${(el.y / 1080) * 100}%`,
      width: `${(el.width / 1920) * 100}%`,
      textAlign: el.align as React.CSSProperties["textAlign"],
    };
  };

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
        <div className="flex items-center gap-3">
          {layout.backgroundImageUrl && (
            <button
              onClick={() => setBackgroundImageUrl(null)}
              className="flex items-center gap-1.5 px-3 py-1 text-[11px] tracking-wider text-red-400 hover:text-red-300 border border-red-500/20 rounded-full bg-red-500/10 transition-colors cursor-pointer"
              title="Hapus Background"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove BG</span>
            </button>
          )}
          <div className="px-3 py-1 text-[12px] tracking-widest font-mono text-zinc-400 border border-white/10 rounded-full bg-white/5 uppercase">
            1920x1080
          </div>
        </div>
      </div>

      {/* Preview Canvas 16:9 */}
      <div className="relative w-full aspect-video rounded-[8px] bg-[#121212] border border-white/10 flex items-center justify-center overflow-hidden shadow-inner group">
        {layout.backgroundImageUrl ? (
          // Background Image
          <img
            src={layout.backgroundImageUrl}
            alt="Scoreboard Background"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <p className="font-poppins text-zinc-600 font-medium tracking-wide pointer-events-none select-none">
            No Background Uploaded
          </p>
        )}

        {/* Live Element Overlay Canvas */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ fontFamily: layout.fontFamily || "Montserrat" }}
        >
          {/* Team 1 Name */}
          <div
            className="absolute transform -translate-y-1/2 overflow-hidden whitespace-nowrap"
            style={{
              ...getStyle("team1_name"),
              fontSize: `${(layout.teamNameSize / 1080) * 100}vh`,
              color: team1.nameColor || "#ffffff",
            }}
          >
            {team1.name}
          </div>

          {/* Team 1 Score */}
          <div
            className="absolute transform -translate-y-1/2 overflow-hidden whitespace-nowrap font-bold"
            style={{
              ...getStyle("team1_score"),
              fontSize: `${(layout.scoreSize / 1080) * 100}vh`,
              color: team1.scoreColor || "#ffffff",
            }}
          >
            {team1.score}
          </div>

          {/* Team 2 Name */}
          <div
            className="absolute transform -translate-y-1/2 overflow-hidden whitespace-nowrap"
            style={{
              ...getStyle("team2_name"),
              fontSize: `${(layout.teamNameSize / 1080) * 100}vh`,
              color: team2.nameColor || "#ffffff",
            }}
          >
            {team2.name}
          </div>

          {/* Team 2 Score */}
          <div
            className="absolute transform -translate-y-1/2 overflow-hidden whitespace-nowrap font-bold"
            style={{
              ...getStyle("team2_score"),
              fontSize: `${(layout.scoreSize / 1080) * 100}vh`,
              color: team2.scoreColor || "#ffffff",
            }}
          >
            {team2.score}
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* Upload Dropzone */}
      <button
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        disabled={isUploading}
        className="flex flex-col items-center justify-center w-full py-4 rounded-[8px] border border-white/10 bg-[#141414] hover:bg-white/5 transition-colors cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <div className="flex items-center gap-2 text-zinc-300">
            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
            <span className="font-poppins text-sm font-medium">Uploading background image...</span>
          </div>
        ) : (
          <>
            <UploadCloud className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors mb-2" />
            <span className="font-poppins font-medium text-sm text-zinc-300">
              {layout.backgroundImageUrl ? "Replace Scoreboard Design" : "Upload Scoreboard Design"}
            </span>
            <span className="font-poppins text-[12px] text-zinc-500 mt-1">
              1920 x 1080 PNG or JPG - drag & drop or click to browse
            </span>
          </>
        )}
      </button>
    </div>
  );
}
