import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTimerStore } from "@/store/useTimerStore";
import { useScoreboardStore } from "@/store/useScoreboardStore";

// useTimerAutoSave — Dashboard-side hook
// When timer state changes:
//   1. Saves to DB (for refresh resilience)  
//   2. Broadcasts to OBS via obs-channel (instant sync, no RLS issue)
// Ticks are broadcast every second BUT only saved to DB on significant changes.

export function useTimerAutoSave() {
  const { timer } = useTimerStore();
  const { obsToken } = useScoreboardStore();
  const prevTimerRef = useRef(timer);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);
  const supabaseRef = useRef(createClient());

  // Setup and maintain the broadcast channel
  useEffect(() => {
    if (!obsToken) return;

    const supabase = supabaseRef.current;
    const channel = supabase
      .channel(`obs-${obsToken}`, {
        config: { broadcast: { self: false } },
      });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channelRef.current = channel;
        console.log(`[TimerAutoSave] ✅ Broadcast channel ready: obs-${obsToken}`);
      }
    });

    // Listen for timer state requests from OBS (when OBS page first loads)
    channel.on("broadcast", { event: "request-timer-state" }, () => {
      const currentTimer = useTimerStore.getState().timer;
      channel.send({
        type: "broadcast",
        event: "timer-state",
        payload: currentTimer,
      });
    });

    return () => {
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [obsToken]);

  // Broadcast every tick when running
   useEffect(() => {
    if (!timer.matchId || !timer.timerToken) return;
    const prev = prevTimerRef.current;
    const remainingDiff = prev.remainingSeconds - timer.remainingSeconds;
    const isNormalTick = remainingDiff > 0 && remainingDiff <= 2;
    const isOnlyTick =
      timer.isRunning === prev.isRunning &&
      timer.durationSeconds === prev.durationSeconds &&
      timer.fontSize === prev.fontSize &&
      timer.audioVolume === prev.audioVolume &&
      timer.fontFamily === prev.fontFamily &&
      timer.customFontUrl === prev.customFontUrl &&
      timer.color === prev.color &&
      isNormalTick &&
      timer.isRunning === true;
    if (isOnlyTick) {
      prevTimerRef.current = timer;
      return;
    }
    // Significant change (play/pause/reset/font/color/add time)
    prevTimerRef.current = timer;
    // 1. BROADCAST LANGSUNG (Tanpa Timeout agar OBS instan sinkron dan tidak terkena cancel)
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "timer-state",
        payload: timer,
      });
    }
    // 2. SIMPAN DB DENGAN TIMEOUT (Debounce ringan)
    const timerId = setTimeout(async () => {
      await import("@/lib/supabase/dbUpdates").then((m) =>
        m.upsertMatchTimer({
          match_id: timer.matchId!,
          timer_token: timer.timerToken!,
          duration_seconds: timer.durationSeconds,
          remaining_seconds: timer.remainingSeconds,
          is_running: timer.isRunning,
          font_size: timer.fontSize,
          audio_volume: timer.audioVolume,
          font_family: timer.fontFamily,
          custom_font_url: timer.customFontUrl,
          color: timer.color,
        })
      );
    }, 500);
    return () => clearTimeout(timerId);
  }, [timer]);
}
