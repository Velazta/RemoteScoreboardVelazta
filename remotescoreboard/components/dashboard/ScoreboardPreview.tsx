"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Image as ImageIcon, UploadCloud, Loader2, Trash2, GripVertical, Lock } from "lucide-react";
import { useScoreboardStore } from "@/store/useScoreboardStore";
import { uploadBackgroundImage, injectFontFace } from "@/lib/supabase/storage";
import type { ElementKey } from "@/types/database";
import AnimatedScore from "./AnimatedScore";
import AnimatedTeamName from "./AnimatedTeamName";

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
  isLocked,
}: {
  x: number;
  y: number;
  accent: string;
  dragging: boolean;
  isLocked?: boolean;
}) {
  return (
    <div
      className="absolute pointer-events-none z-30 -translate-y-full px-1.5 py-0.5 rounded text-[10px] tabular-nums whitespace-nowrap flex items-center gap-1 transition-opacity"
      style={{
        top: `${(y / CANVAS_H) * 100}%`,
        left: `${(x / CANVAS_W) * 100}%`,
        marginTop: "-4px",
        backgroundColor: "rgba(9,9,11,0.92)",
        border: `1px solid ${isLocked ? "#f59e0b99" : `${accent}${dragging ? "" : "77"}`}`,
        color: isLocked ? "#fbbf24" : accent,
        opacity: dragging ? 1 : 0.75,
        fontFamily: "monospace",
      }}
    >
      {isLocked ? (
        <Lock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
      ) : (
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ backgroundColor: accent }}
        />
      )}
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
  const isLocked = !!el.isLocked;

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
        cursor: isLocked ? "not-allowed" : isDragging ? "grabbing" : "grab",
        outline: isLocked
          ? "1px dashed rgba(245,158,11,0.35)"
          : isDragging
          ? `2px dashed ${accent}`
          : `1px dashed ${accent}55`,
        outlineOffset: 5,
        transition: isDragging ? "none" : "outline 0.15s ease",
        zIndex: isDragging ? 20 : 10,
      }}
    >
      {children}
      {isLocked && (
        <span
          className="absolute -top-3 -right-3 p-0.5 rounded bg-black/80 border border-amber-500/40 text-amber-400 pointer-events-none shadow-sm flex items-center justify-center"
          title="Element is locked"
        >
          <Lock className="w-2.5 h-2.5" />
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function ScoreboardPreview() {
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [scale, setScale]             = useState(1);
  const [draggingKey, setDraggingKey] = useState<ElementKey | null>(null);
  const [draggingCustomId, setDraggingCustomId] = useState<string | null>(null);

  const {
    layout,
    team1,
    team2,
    elements,
    customElements,
    isElementsVisible,
    setBackgroundImageUrl,
    setElementPosition,
    updateCustomElement,
  } = useScoreboardStore();

  // Inject font whenever it changes
  useEffect(() => {
    if (layout.nameCustomFontUrl && layout.nameFontFamily) {
      injectFontFace(layout.nameFontFamily, layout.nameCustomFontUrl);
    }
    if (layout.scoreCustomFontUrl && layout.scoreFontFamily) {
      injectFontFace(layout.scoreFontFamily, layout.scoreCustomFontUrl);
    }
    customElements.forEach(el => {
      if (el.customFontUrl && el.fontFamily) {
        injectFontFace(el.fontFamily, el.customFontUrl);
      }
    });
  }, [layout.nameCustomFontUrl, layout.nameFontFamily, layout.scoreCustomFontUrl, layout.scoreFontFamily, customElements]);

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
      const rawX = (e.clientX - rect.left) / scale;
      const rawY = (e.clientY - rect.top)  / scale;
      const x = clamp(Math.round(rawX - dragOffsetRef.current.x), CANVAS_W);
      const y = clamp(Math.round(rawY - dragOffsetRef.current.y), CANVAS_H);
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

  // Drag handling for Custom Elements (Text+ & Image)
  useEffect(() => {
    if (!draggingCustomId) return;

    const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);

    const handleMove = (e: PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const rawX = (e.clientX - rect.left) / scale;
      const rawY = (e.clientY - rect.top)  / scale;
      const x = clamp(Math.round(rawX - dragOffsetRef.current.x), CANVAS_W);
      const y = clamp(Math.round(rawY - dragOffsetRef.current.y), CANVAS_H);
      updateCustomElement(draggingCustomId, { x, y });
    };

    const handleUp = () => {
      setDraggingCustomId(null);
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
  }, [draggingCustomId, scale, updateCustomElement]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, key: ElementKey) => {
      if (elements[key]?.isLocked) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      dragOffsetRef.current = {
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top) / scale,
      };
      setDraggingKey(key);
    },
    [scale, elements]
  );

  const handleCustomPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, id: string) => {
      const el = customElements.find((c) => c.id === id);
      if (el?.isLocked) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      dragOffsetRef.current = {
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top) / scale,
      };
      setDraggingCustomId(id);
    },
    [scale, customElements]
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

  const getFontFamily = (key: ElementKey) =>
    key === "team1_score" || key === "team2_score" ? (layout.scoreFontFamily || "Montserrat") : (layout.nameFontFamily || "Montserrat");

  const getContent = (key: ElementKey) => {
    if (key === "team1_name")  return <AnimatedTeamName value={team1.name || "TEAM 1"} align={elements[key].align as "left" | "center" | "right"} />;
    if (key === "team2_name")  return <AnimatedTeamName value={team2.name || "TEAM 2"} align={elements[key].align as "left" | "center" | "right"} />;
    if (key === "team1_score") return <AnimatedScore value={team1.score} align={elements[key].align as "left" | "center" | "right"} />;
    return <AnimatedScore value={team2.score} align={elements[key].align as "left" | "center" | "right"} />;
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
    <div className="flex flex-col w-full rounded-[12px] border border-white/10 bg-[#1A1A1A]/80 backdrop-blur-xl p-4 sm:p-6 gap-4 sm:gap-5 shadow-lg overflow-hidden">
      {/* Header — Title on left, actions stacked vertically on right */}
      <div className="flex items-start justify-between gap-3 w-full">
        {/* Left: Icon & Title */}
        <div className="flex items-start gap-2.5 sm:gap-3 text-white min-w-0 pt-0.5">
          <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <h2 className="font-montserrat font-medium text-sm sm:text-base md:text-lg tracking-wider sm:tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] leading-tight">
            Scoreboard Preview
          </h2>
        </div>

        {/* Right: Actions stacked column on mobile, row on tablet/desktop */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
          {layout.backgroundImageUrl && (
            <button
              onClick={() => setBackgroundImageUrl(null)}
              className="flex items-center gap-1.5 px-3 py-1 text-[11px] tracking-wider text-red-400 hover:text-red-300 border border-red-500/20 rounded-full bg-red-500/10 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              title="Hapus Background"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove BG</span>
            </button>
          )}
          {!isElementsVisible && (
            <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] sm:text-[12px] tracking-wider font-mono text-amber-400 border border-amber-500/30 rounded-full bg-amber-500/10 shrink-0 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>TEXT INVISIBLE</span>
            </div>
          )}
          <div className="px-3 py-1 text-[11px] sm:text-[12px] tracking-wider sm:tracking-widest font-mono text-zinc-400 border border-white/10 rounded-full bg-white/5 uppercase shrink-0 whitespace-nowrap">
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
          <div
            className="transition-opacity duration-300"
            style={{
              opacity: isElementsVisible ? 1 : 0,
              pointerEvents: isElementsVisible ? "auto" : "none",
            }}
          >
            {ELEMENTS.map(({ key, accent }) => (
              <DraggableElement
                key={key}
                posKey={key}
                accent={accent}
                isDragging={draggingKey === key}
                onPointerDown={handlePointerDown}
                fontSize={getFontSize(key)}
                color={getColor(key)}
                fontFamily={getFontFamily(key)}
                elements={elements}
              >
                {getContent(key)}
              </DraggableElement>
            ))}

            {/* Custom Elements (Text+ & Image) */}
            {customElements.map((el) => {
              const isLocked = !!el.isLocked;
              const isDragging = draggingCustomId === el.id;
              const accent = el.type === "text" ? "#06b6d4" : "#eab308";

              return (
                <div
                  key={el.id}
                  onPointerDown={(e) => handleCustomPointerDown(e, el.id)}
                  className={`absolute select-none flex items-center ${el.type === 'text' ? 'whitespace-pre-wrap' : 'whitespace-nowrap'}`}
                  style={{
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    textAlign: el.align as React.CSSProperties["textAlign"],
                    fontFamily: el.fontFamily || "Montserrat",
                    fontSize: `${el.fontSize || 40}px`,
                    color: el.color || "#ffffff",
                    fontWeight: 700,
                    textShadow: "0 2px 12px rgba(0,0,0,0.65)",
                    cursor: isLocked ? "not-allowed" : isDragging ? "grabbing" : "grab",
                    outline: isLocked
                      ? "1px dashed rgba(245,158,11,0.35)"
                      : isDragging
                      ? `2px dashed ${accent}`
                      : `1px dashed ${accent}55`,
                    outlineOffset: 5,
                    transition: isDragging ? "none" : "outline 0.15s ease",
                    zIndex: isDragging ? 20 : 10,
                    transform: `rotate(${el.rotation || 0}deg)`,
                  }}
                >
                  {el.type === "text" ? (
                    <span className="w-full block" style={{ textAlign: el.align as React.CSSProperties["textAlign"] }}>
                      {el.content || "TEXT DEFAULT"}
                    </span>
                  ) : el.content ? (
                    <img src={el.content} alt="Custom Element" className="w-full object-contain pointer-events-none" />
                  ) : (
                    <div className="w-full h-16 bg-cyan-950/40 border border-dashed border-cyan-500/40 flex items-center justify-center text-xs text-cyan-300">
                      NO IMAGE UPLOADED
                    </div>
                  )}

                  {isLocked && (
                    <span
                      className="absolute -top-3 -right-3 p-0.5 rounded bg-black/80 border border-amber-500/40 text-amber-400 pointer-events-none shadow-sm flex items-center justify-center"
                      title="Element is locked"
                    >
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Coordinate badges — sit outside scaled layer, in % space */}
        {isElementsVisible && (
          <>
            {ELEMENTS.map(({ key, accent }) => (
              <CoordBadge
                key={key}
                x={elements[key].x}
                y={elements[key].y}
                accent={accent}
                dragging={draggingKey === key}
                isLocked={elements[key].isLocked}
              />
            ))}
            {customElements.map((el) => (
              <CoordBadge
                key={el.id}
                x={el.x}
                y={el.y}
                accent={el.type === "text" ? "#06b6d4" : "#eab308"}
                dragging={draggingCustomId === el.id}
                isLocked={el.isLocked}
              />
            ))}
          </>
        )}
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
