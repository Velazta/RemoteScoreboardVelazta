"use client";

import { useEffect } from "react";
import { useScoreboardStore } from "@/store/useScoreboardStore";
import { getOrCreateInitialMatch } from "@/lib/supabase/scoreboardService";

export function useScoreboardInit() {
  const hydrateFromDatabase = useScoreboardStore((state) => state.hydrateFromDatabase);

  useEffect(() => {
    const controller = new AbortController();

    async function init() {
      const data = await getOrCreateInitialMatch();
      if (data && !controller.signal.aborted) {
        hydrateFromDatabase(data);
        console.log("✅ Scoreboard State berhasil di-hydrate dari Supabase!");
      }
    }

    init();

    return () => {
      controller.abort();
    };
  }, [hydrateFromDatabase]);
}
