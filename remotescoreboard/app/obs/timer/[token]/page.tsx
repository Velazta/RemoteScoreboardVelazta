"use client";

import React, { use, useEffect, useRef } from "react";
import { useTimerStore } from "@/store/useTimerStore";
import { useTimerRealtime } from "@/hooks/useTimerRealtime";
import AnimatedScore from "@/components/dashboard/AnimatedScore";

const CANVAS_H = 1080;

interface ObsTimerPageProps {
  params: Promise<{ token: string }>;
}

export default function ObsTimerPage({ params }: ObsTimerPageProps) {
  const resolvedParams = use(params);
  // Token is now the obs_token (same as scoreboard) — uses the same channel
  const obsToken = resolvedParams.token;

  useTimerRealtime(obsToken);

  const { timer, updateTimer } = useTimerStore();
  const isRunningRef = useRef(timer.isRunning);

  useEffect(() => {
    isRunningRef.current = timer.isRunning;
  }, [timer.isRunning]);

  // Local countdown ticker for OBS — only runs when isRunning transitions to true
  // The actual time display is driven by either:
  // 1. Broadcast tick from Dashboard (immediate, real-time)
  // 2. Local interval as backup (if broadcast drops)
  useEffect(() => {
    if (!timer.isRunning) return;

    const interval = setInterval(() => {
      if (!isRunningRef.current) {
        clearInterval(interval);
        return;
      }
      const currentTimer = useTimerStore.getState().timer;
      if (currentTimer.remainingSeconds > 0) {
        updateTimer({ remainingSeconds: currentTimer.remainingSeconds - 1 });
      } else {
        updateTimer({ isRunning: false });
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.isRunning]);

  // Format MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const timerFontSize = `${(timer.fontSize / CANVAS_H) * 100}vh`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          background-color: transparent !important;
          background: transparent !important;
          overflow: hidden !important;
        }
      `}} />
      <main className="w-screen h-screen overflow-hidden flex items-center justify-center bg-transparent relative">
        <div
          className="font-bold tracking-widest drop-shadow-[0_0_20px_rgba(6,182,212,0.8)] leading-none select-none"
          style={{ 
            fontSize: timerFontSize,
            fontFamily: timer.fontFamily || "Montserrat",
            color: timer.color || "#06b6d4"
          }}
        >
          <AnimatedScore value={formatTime(timer.remainingSeconds)} align="center" />
        </div>
      </main>
    </>
  );
}
