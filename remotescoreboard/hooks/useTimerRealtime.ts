import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTimerStore, TimerState } from "@/store/useTimerStore";
import { getTimerByToken } from "@/lib/supabase/scoreboardService";
import { injectFontFace } from "@/lib/supabase/storage";

// useTimerRealtime — OBS Timer page hook
// Uses the SAME obs-channel as the scoreboard for broadcast communication.
// This bypasses RLS since Supabase broadcast doesn't require table permissions.
// Falls back to DB polling every 3 seconds for refresh resilience.

export function useTimerRealtime(obsToken?: string | null) {
  const { hydrateTimer, updateTimer } = useTimerStore();
  const customFontUrl = useTimerStore((s) => s.timer.customFontUrl);
  const fontFamily = useTimerStore((s) => s.timer.fontFamily);
  const isMountedRef = useRef(true);

  // Inject font whenever the URL changes
  useEffect(() => {
    if (customFontUrl && fontFamily) {
      injectFontFace(fontFamily, customFontUrl);
    }
  }, [customFontUrl, fontFamily]);

  useEffect(() => {
    isMountedRef.current = true;
    if (!obsToken) return;

    const supabase = createClient();

    const fetchAndHydrate = async () => {
      if (!isMountedRef.current) return;
      // getTimerByToken supports both timer_token and obs_token (fallback)
      const data = await getTimerByToken(obsToken);
      if (data && isMountedRef.current) {
        hydrateTimer(data);
      }
    };

    // Initial load from DB
    fetchAndHydrate();

    // Subscribe to the SAME channel as scoreboard OBS
    // This channel is open to anon users (no RLS restriction)
    const channel = supabase
      .channel(`obs-${obsToken}`, {
        config: { broadcast: { self: false } },
      })
      .on(
        "broadcast",
        { event: "timer-state" },
        ({ payload }: { payload: TimerState }) => {
          if (payload && isMountedRef.current) {
            hydrateTimer(payload);
          }
        }
      )
      .on(
        "broadcast",
        { event: "timer-tick" },
        ({ payload }: { payload: { remainingSeconds: number } }) => {
          if (payload && isMountedRef.current) {
            // Direct tick update — no merge logic needed
            updateTimer({ remainingSeconds: payload.remainingSeconds, isRunning: true });
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`[TimerRealtime] ✅ Subscribed to obs-${obsToken}`);
          // Request current timer state from dashboard
          channel.send({
            type: "broadcast",
            event: "request-timer-state",
          });
        }
      });

    // Fallback polling every 3 seconds for DB sync on reconnect/refresh
    const pollInterval = setInterval(() => {
      fetchAndHydrate();
    }, 3000);

    return () => {
      isMountedRef.current = false;
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [obsToken, hydrateTimer, updateTimer]);
}
