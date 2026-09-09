"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Image as ImageIcon, UploadCloud, Loader2, Trash2, GripVertical } from "lucide-react";
import { useScoreboardStore } from "@/store/useScoreboardStore";
import { uploadBackgroundImage, injectFontFace } from "@/lib/supabase/storage";
import type { ElementKey } from "@/types/database";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CANVAS_W = 1920;
const CANVAS_H = 1080;

type ElementMeta = {
  key: ElementKey;
  label: string;
  accent: string;
};

const ELEMENTS: ElementMeta[] = [
  { key: "team1_name",  label: "Team 1 Name",  accent: "#a855f7" },
  { key: "team1_score", label: "Team 1 Score", accent: "#a855f7" },
  { key: "team2_name",  label: "Team 2 Name",  accent: "#0BE6C4" },
  { key: "team2_score", label: "Team 2 Score", accent: "#0BE6C4" },
];

// ---------------------------------------------------------------------------
// CoordBadge — live position label shown above each draggable element
// ---------------------------------------------------------------------------
function CoordBadge({
  x,
  y,
  accent,
  dragging,
}: {
  x: number;
  y: number;
  accent: string;
  dragging: boolean;
}) {
  return (
    <div
      className="absolute pointer-events-none z-30 -translate-y-full px-1.5 py-0.5 rounded text-[10px] tabular-nums whitespace-nowrap flex items-center gap-1 transition-opacity"
      style={{
        top: `${(y / CANVAS_H) * 100}%`,
        left: `${(x / CANVAS_W) * 100}%`,
        marginTop: "-4px",
        backgroundColor: "rgba(9,9,11,0.92)",
        border: `1px solid ${accent}${dragging ? "" : "77"}`,
        color: accent,
        opacity: dragging ? 1 : 0.75,
        fontFamily: "monospace",
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ backgroundColor: accent }}
      />
      {Math.round(x)}, {Math.round(y)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DraggableElement — single scoreboard canvas element
// ---------------------------------------------------------------------------
function DraggableElement({
  posKey,
  accent,
  isDragging,
  onPointerDown,
  fontSize,
  color,
  fontFamily,
  children,
  elements,
}: {
  posKey: ElementKey;
  accent: string;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, key: ElementKey) => void;
  fontSize: string;
  color: string;
  fontFamily: string;
  children: React.ReactNode;
  elements: ReturnType<typeof useScoreboardStore.getState>["elements"];
}) {
  const el = elements[posKey];
  return (
    <div
      onPointerDown={(e) => onPointerDown(e, posKey)}
      className="absolute whitespace-nowrap select-none"
      style={{
        left: el.x,
        top: el.y,
        width: el.width,
        textAlign: el.align as React.CSSProperties["textAlign"],
        fontFamily,
        fontSize,
        color,
        fontWeight: 700,
        textShadow: "0 2px 12px rgba(0,0,0,0.65)",
        cursor: isDragging ? "grabbing" : "grab",
        outline: isDragging
          ? `2px dashed ${accent}`
          : `1px dashed ${accent}55`,
        outlineOffset: 5,
        transition: isDragging ? "none" : "outline 0.15s ease",
        zIndex: isDragging ? 20 : 10,
      }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ScoreboardPreview() {
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [scale, setScale]             = useState(1);
  const [draggingKey, setDraggingKey] = useState<ElementKey | null>(null);

  const {
    layout,
    team1,
    team2,
    elements,
    setBackgroundImageUrl,
    setElementPosition,
  } = useScoreboardStore();

  // Inject font whenever it changes
  useEffect(() => {
    if (layout.customFontUrl && layout.fontFamily) {
      injectFontFace(layout.fontFamily, layout.customFontUrl);
    }
  }, [layout.customFontUrl, layout.fontFamily]);

  // Keep scale in sync with container width via ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / CANVAS_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Global drag handling — attaches once when draggingKey changes
  useEffect(() => {
    if (!draggingKey) return;

    const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);

    const handleMove = (e: PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = clamp(Math.round((e.clientX - rect.left) / scale), CANVAS_W);
      const y = clamp(Math.round((e.clientY - rect.top)  / scale), CANVAS_H);
      setElementPosition(draggingKey, { x, y });
    };

    const handleUp = () => {
      setDraggingKey(null);
      document.body.style.userSelect  = "";
      document.body.style.cursor      = "";
    };

    document.body.style.userSelect = "none";
    document.body.style.cursor     = "grabbing";
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup",   handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup",   handleUp);
    };
  }, [draggingKey, scale, setElementPosition]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, key: ElementKey) => {
      e.preventDefault();
      e.stopPropagation();
      setDraggingKey(key);
    },
    []
  );

  // ---- file upload helpers ----
  const processUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Harap upload file gambar (PNG, JPG, WebP).");
      return;
    }
    setIsUploading(true);
    const uploadedUrl = await uploadBackgroundImage(file, layout.id ?? "");
    setIsUploading(false);
    if (uploadedUrl) {
      setBackgroundImageUrl(uploadedUrl);
    } else {
      alert("Gagal meng-upload gambar background ke Supabase Storage.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processUpload(file);
  };

  // Font sizes in ABSOLUTE px — correct because elements live inside the
  // fixed 1920×1080 layer that is CSS-scaled down. cqh/vh would resolve
  // against the outer (small) container and produce wrong sizes.
  const nameFontSize  = `${layout.teamNameSize}px`;
  const scoreFontSize = `${layout.scoreSize}px`;
  const fontFamily    = layout.fontFamily || "Montserrat";

  const getContent = (key: ElementKey) => {
    if (key === "team1_name")  return team1.name  || "TEAM 1";
    if (key === "team2_name")  return team2.name  || "TEAM 2";
    if (key === "team1_score") return String(team1.score);
    return String(team2.score);
  };

  const getColor = (key: ElementKey): string => {
    if (key === "team1_name")  return team1.nameColor  || "#ffffff";
    if (key === "team1_score") return team1.scoreColor || "#ffffff";
    if (key === "team2_name")  return team2.nameColor  || "#ffffff";
    return team2.scoreColor || "#ffffff";
  };

  const getFontSize = (key: ElementKey) =>
    key === "team1_score" || key === "team2_score" ? scoreFontSize : nameFontSize;

  return (
    <div className="flex flex-col w-full rounded-[12px] border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-6 gap-5 shadow-lg">
      {/* Header */}
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
            1920×1080
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Preview Canvas — fixed 1920×1080 layer scaled to fit container      */}
      {/* ------------------------------------------------------------------ */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video rounded-[8px] bg-[#0A0A0C] border border-white/10 overflow-hidden touch-none"
        style={{ containerType: "size" }}
      >
        {/* Fixed-size inner canvas layer */}
        <div
          className="absolute top-0 left-0"
          style={{
            width:           CANVAS_W,
            height:          CANVAS_H,
            transform:       `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {/* Background */}
          {layout.backgroundImageUrl ? (
            <img
              src={layout.backgroundImageUrl}
              alt="Scoreboard Background"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              draggable={false}
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: "80px 80px",
              }}
            >
              <span className="font-montserrat text-[40px] tracking-[0.08em] text-white/10 select-none pointer-events-none">
                NO BACKGROUND UPLOADED
              </span>
            </div>
          )}

          {/* Draggable elements */}
          {ELEMENTS.map(({ key, accent }) => (
            <DraggableElement
              key={key}
              posKey={key}
              accent={accent}
              isDragging={draggingKey === key}
              onPointerDown={handlePointerDown}
              fontSize={getFontSize(key)}
              color={getColor(key)}
              fontFamily={fontFamily}
              elements={elements}
            >
              {getContent(key)}
            </DraggableElement>
          ))}
        </div>

        {/* Coordinate badges — sit outside scaled layer, in % space */}
        {ELEMENTS.map(({ key, accent }) => (
          <CoordBadge
            key={key}
            x={elements[key].x}
            y={elements[key].y}
            accent={accent}
            dragging={draggingKey === key}
          />
        ))}
      </div>

      {/* Drag tip */}
      <p className="flex items-center gap-1.5 text-xs text-zinc-600 -mt-2">
        <GripVertical className="w-3.5 h-3.5" />
        <span>Hold &amp; drag any element directly on the preview to reposition, or use the inputs in Layout Customization.</span>
      </p>

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
        onDragOver={(e) => e.preventDefault()}
        disabled={isUploading}
        className="flex flex-col items-center justify-center w-full py-4 rounded-[8px] border border-dashed border-white/10 bg-[#141414] hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
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
              1920 × 1080 PNG or JPG — drag &amp; drop or click to browse
            </span>
          </>
        )}
      </button>
    </div>
  );
}
