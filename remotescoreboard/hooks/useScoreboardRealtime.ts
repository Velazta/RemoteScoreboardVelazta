"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMatchByObsToken } from "@/lib/supabase/scoreboardService";
import { useScoreboardStore } from "@/store/useScoreboardStore";
import { injectFontFace } from "@/lib/supabase/storage";

const supabase = createClient();

export function useScoreboardRealtime(obsToken: string) {
  const hydrateFromDatabase = useScoreboardStore((state) => state.hydrateFromDatabase);
  const layout = useScoreboardStore((state) => state.layout);

  // Injeksi font tiap kali berubah
  useEffect(() => {
    if (layout.customFontUrl && layout.fontFamily) {
      injectFontFace(layout.fontFamily, layout.customFontUrl);
    }
  }, [layout.customFontUrl, layout.fontFamily]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAndHydrate = async () => {
      const data = await getMatchByObsToken(obsToken);
      if (data && !controller.signal.aborted) {
        hydrateFromDatabase({ obsToken, ...data });
      }
    };

    // 1. Initial Fetch
    fetchAndHydrate();

    // 2. Realtime Subscriptions
    const channel = supabase
      .channel(`obs-overlay-${obsToken}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "teams" }, () => {
        fetchAndHydrate();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "layouts" }, () => {
        fetchAndHydrate();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "layout_elements" }, () => {
        fetchAndHydrate();
      })
      .subscribe();

    return () => {
      controller.abort();
      supabase.removeChannel(channel);
    };
  }, [obsToken, hydrateFromDatabase]);
}
