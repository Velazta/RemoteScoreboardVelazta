"use client";

import React, { use, useEffect } from "react";
import { useScoreboardStore } from "@/store/useScoreboardStore";
import { useScoreboardRealtime } from "@/hooks/useScoreboardRealtime";
import { injectFontFace } from "@/lib/supabase/storage";
import AnimatedScore from "@/components/dashboard/AnimatedScore";

// ---------------------------------------------------------------------------
// OBS Overlay Page — /obs/[token]
//
// Coordinate system: same as the 1920×1080 scoreboard canvas.
// X/Y stored in db are top-left anchors in the 1920×1080 space.
// We convert to %-of-viewport so OBS sees pixel-accurate positions at
// any resolution while keeping 1920×1080 as the design baseline.
// ---------------------------------------------------------------------------

const CANVAS_W = 1920;
const CANVAS_H = 1080;

interface ObsOverlayPageProps {
  params: Promise<{ token: string }>;
}

export default function ObsOverlayPage({ params }: ObsOverlayPageProps) {
  const resolvedParams = use(params);
  const obsToken = resolvedParams.token;

  useScoreboardRealtime(obsToken);

  const { layout, team1, team2, elements } = useScoreboardStore();

  // Convert absolute 1920×1080 coordinates to viewport-percentage.
  // NO vertical centering transform — anchor is the TOP-LEFT of the text box,
  // matching the behaviour in ScoreboardPreview.tsx.
  const getStyle = (key: keyof typeof elements): React.CSSProperties => {
    const el = elements[key];
    return {
      position: "absolute",
      left:      `${(el.x     / CANVAS_W) * 100}%`,
      top:       `${(el.y     / CANVAS_H) * 100}%`,
      width:     `${(el.width / CANVAS_W) * 100}%`,
      textAlign: el.align as React.CSSProperties["textAlign"],
      // No translateY — anchor is top-left, identical to the draggable
      // elements in ScoreboardPreview so coordinates match 1-to-1.
      whiteSpace: "nowrap",
      overflow:   "hidden",
    };
  };

  // Font size: stored value is in the 1920×1080 coordinate space.
  // Converting to vh keeps the same visual proportion in OBS
  // (OBS browser source = 1920×1080 → 1 vh = 10.8 px → 90px = 8.333vh).
  const nameFontSize  = `${(layout.teamNameSize / CANVAS_H) * 100}vh`;
  const scoreFontSize = `${(layout.scoreSize    / CANVAS_H) * 100}vh`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          background-color: transparent !important;
          background: transparent !important;
          overflow: hidden !important;
        }
      `}} />
      <main
        className="w-screen h-screen overflow-hidden relative"
        style={{
          backgroundColor: "transparent",
        }}
      >
      {layout.backgroundImageUrl && (
        <img
          src={layout.backgroundImageUrl}
          alt="Overlay Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
          draggable={false}
        />
      )}

      <div className="absolute inset-0 w-full h-full z-10">
        {/* Team 1 Name */}
        <div
          style={{
            ...getStyle("team1_name"),
            fontFamily: layout.nameFontFamily || "Montserrat",
            fontSize:   nameFontSize,
            color:      team1.nameColor  || "#ffffff",
            fontWeight: 700,
          }}
        >
          {team1.name}
        </div>

        {/* Team 1 Score */}
        <div
          style={{
            ...getStyle("team1_score"),
            fontFamily: layout.scoreFontFamily || "Montserrat",
            fontSize:   scoreFontSize,
            color:      team1.scoreColor || "#ffffff",
            fontWeight: 700,
          }}
        >
          <AnimatedScore value={team1.score} align={elements.team1_score.align as "left" | "center" | "right"} />
        </div>

        {/* Team 2 Name */}
        <div
          style={{
            ...getStyle("team2_name"),
            fontFamily: layout.nameFontFamily || "Montserrat",
            fontSize:   nameFontSize,
            color:      team2.nameColor  || "#ffffff",
            fontWeight: 700,
          }}
        >
          {team2.name}
        </div>

        {/* Team 2 Score */}
        <div
          style={{
            ...getStyle("team2_score"),
            fontFamily: layout.scoreFontFamily || "Montserrat",
            fontSize:   scoreFontSize,
            color:      team2.scoreColor || "#ffffff",
            fontWeight: 700,
          }}
        >
          <AnimatedScore value={team2.score} align={elements.team2_score.align as "left" | "center" | "right"} />
        </div>
      </div>
    </main>
    </>
  );
}
