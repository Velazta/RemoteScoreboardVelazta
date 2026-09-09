"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMatchByObsToken } from "@/lib/supabase/scoreboardService";
import { useScoreboardStore } from "@/store/useScoreboardStore";
import { injectFontFace } from "@/lib/supabase/storage";

// ---------------------------------------------------------------------------
// useScoreboardRealtime
//
// Fetches initial scoreboard data and keeps it live via Supabase Realtime.
// Key design decisions:
//   - Supabase client is created INSIDE the hook (not module scope) so each
//     OBS tab gets its own isolated connection — no shared state / stale refs.
//   - Uses a ref-based isMounted guard instead of AbortController so that
//     the hydrate callback is never called after unmount even across multiple
//     in-flight fetches (race condition safety).
//   - postgres_changes subscription logs its status so we can diagnose
//     whether Realtime is actually connected in the Supabase dashboard.
// ---------------------------------------------------------------------------

export function useScoreboardRealtime(obsToken: string) {
  const hydrateFromDatabase = useScoreboardStore(
    (state) => state.hydrateFromDatabase
  );
  const customFontUrl  = useScoreboardStore((s) => s.layout.customFontUrl);
  const fontFamily     = useScoreboardStore((s) => s.layout.fontFamily);
  const isMountedRef   = useRef(true);

  // Inject font whenever the URL changes
  useEffect(() => {
    if (customFontUrl && fontFamily) {
      injectFontFace(fontFamily, customFontUrl);
    }
  }, [customFontUrl, fontFamily]);

  useEffect(() => {
    isMountedRef.current = true;

    // Create a fresh Supabase client per effect run so that re-mounts
    // always get a clean WebSocket connection.
    const supabase = createClient();

    const fetchAndHydrate = async () => {
      try {
        const data = await getMatchByObsToken(obsToken);
        if (data && isMountedRef.current) {
          hydrateFromDatabase({ obsToken, ...data });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[useScoreboardRealtime] fetch error:", msg);
      }
    };

    // 1. Initial data load
    fetchAndHydrate();

    // 2. Subscribe to Realtime changes
    //    Using a single channel with three postgres_changes listeners.
    //    The status callback lets us confirm the WebSocket is SUBSCRIBED.
    const channel = supabase
      .channel(`obs-${obsToken}`, {
        config: { broadcast: { self: false } },
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams" },
        () => {
          fetchAndHydrate();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "layouts" },
        () => {
          fetchAndHydrate();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "layout_elements" },
        () => {
          fetchAndHydrate();
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log(`[Realtime] ✅ Subscribed to obs-${obsToken}`);
        }
        if (status === "CHANNEL_ERROR") {
          const msg = err instanceof Error ? err.message : String(err ?? "unknown");
          console.error(`[Realtime] ❌ Channel error: ${msg}`);
          fetchAndHydrate();
        }
        if (status === "TIMED_OUT") {
          console.warn("[Realtime] ⏱ Connection timed out — retrying fetch");
          fetchAndHydrate();
        }
      });

    // 3. Fallback Polling
    // In case Supabase Realtime Replication is not enabled in the dashboard,
    // or the WebSocket connection drops silently in OBS, we poll every 2 seconds.
    // This guarantees the overlay always updates without manual refresh.
    const pollInterval = setInterval(() => {
      fetchAndHydrate();
    }, 2000);

    return () => {
      isMountedRef.current = false;
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
    // hydrateFromDatabase is a stable Zustand action reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obsToken]);
}
