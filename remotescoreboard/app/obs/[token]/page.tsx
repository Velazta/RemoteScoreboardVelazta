"use client";

import React, { use } from "react";
import { useScoreboardStore } from "@/store/useScoreboardStore";
import { useScoreboardRealtime } from "@/hooks/useScoreboardRealtime";

interface ObsOverlayPageProps {
  params: Promise<{ token: string }>;
}

export default function ObsOverlayPage({ params }: ObsOverlayPageProps) {
  // Dalam Next.js 15, params di-treat sebagai Promise (React.use)
  const resolvedParams = use(params);
  const obsToken = resolvedParams.token;

  useScoreboardRealtime(obsToken);

  const { layout, team1, team2, elements } = useScoreboardStore();

  const getStyle = (key: keyof typeof elements): React.CSSProperties => {
    const el = elements[key];
    return {
      position: "absolute",
      left: `${(el.x / 1920) * 100}%`,
      top: `${(el.y / 1080) * 100}%`,
      width: `${(el.width / 1920) * 100}%`,
      textAlign: el.align as React.CSSProperties["textAlign"],
      transform: "translateY(-50%)",
      whiteSpace: "nowrap",
      overflow: "hidden",
    };
  };

  return (
    <main 
      className="w-screen h-screen overflow-hidden relative"
      style={{
        backgroundColor: "transparent", 
        fontFamily: layout.fontFamily || "Montserrat"
      }}
    >
      {layout.backgroundImageUrl && (
        <img
          src={layout.backgroundImageUrl}
          alt="Overlay Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

      <div className="absolute inset-0 w-full h-full z-10">
        {/* Team 1 Name */}
        <div
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
          className="font-bold"
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
          className="font-bold"
          style={{
            ...getStyle("team2_score"),
            fontSize: `${(layout.scoreSize / 1080) * 100}vh`,
            color: team2.scoreColor || "#ffffff",
          }}
        >
          {team2.score}
        </div>
      </div>
    </main>
  );
}
