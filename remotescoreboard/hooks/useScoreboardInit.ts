"use client";

import { useEffect } from "react";
import { useScoreboardStore } from "@/store/useScoreboardStore";
import { getOrCreateInitialMatch } from "@/lib/supabase/scoreboardService";
import { useTimerStore } from "@/store/useTimerStore";

export function useScoreboardInit() {
  const hydrateFromDatabase = useScoreboardStore((state) => state.hydrateFromDatabase);
  const hydrateTimer = useTimerStore((state) => state.hydrateTimer);

  useEffect(() => {
    const controller = new AbortController();

    async function init() {
      const data = await getOrCreateInitialMatch();
      if (data && !controller.signal.aborted) {
        hydrateFromDatabase(data);
        hydrateTimer({
          matchId: data.matchId,
          timerToken: data.timer?.timerToken || data.obsToken,
          durationSeconds: data.timer?.durationSeconds ?? 300,
          remainingSeconds: data.timer?.remainingSeconds ?? 300,
          isRunning: data.timer?.isRunning ?? false,
          fontSize: data.timer?.fontSize ?? 90,
          audioVolume: data.timer?.audioVolume ?? 100,
          fontFamily: data.timer?.fontFamily ?? "Montserrat",
          customFontUrl: data.timer?.customFontUrl ?? null,
          color: data.timer?.color ?? "#06b6d4",
          updatedAt: data.timer?.updatedAt,
        });
        console.log("✅ Scoreboard State berhasil di-hydrate dari Supabase!");
      }
    }

    init();

    return () => {
      controller.abort();
    };
  }, [hydrateFromDatabase, hydrateTimer]);
}
