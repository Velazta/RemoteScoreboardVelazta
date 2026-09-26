import { create } from "zustand";

export interface TimerState {
  matchId?: string;
  timerToken?: string;
  durationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  fontSize: number;
  audioVolume: number;
  fontFamily?: string;
  customFontUrl?: string | null;
  color?: string;
  updatedAt?: string;
  // Used to track the last updatedAt at the moment timer started running
  // so we can discard stale DB polls that have the same or older updatedAt
  localStartUpdatedAt?: string;
}

interface TimerStore {
  timer: TimerState;
  updateTimer: (update: Partial<TimerState>) => void;
  setTimer: (timer: TimerState) => void;
  hydrateTimer: (data: TimerState) => void;
}

export const useTimerStore = create<TimerStore>((set) => ({
  timer: {
    durationSeconds: 300,
    remainingSeconds: 300,
    isRunning: false,
    fontSize: 90,
    audioVolume: 100,
    fontFamily: "Montserrat",
    customFontUrl: null,
    color: "#06b6d4",
  },
  updateTimer: (update) =>
    set((state) => ({
      timer: { ...state.timer, ...update },
    })),
  setTimer: (timer) => set({ timer }),
  hydrateTimer: (nextTimer) =>
    set((state) => {
      const current = state.timer;

      // If this is from DB polling (not broadcast), protect running countdown
      // from being overwritten by stale remaining_seconds from DB.
      // Broadcasts use updateTimer directly, not hydrateTimer.
      // DB polling is only for refresh resilience (gets the snapshot when play was pressed).
      if (current.isRunning && nextTimer.isRunning) {
        // Keep local countdown, only sync config
        return {
          timer: {
            ...current,
            timerToken: nextTimer.timerToken ?? current.timerToken,
            matchId: nextTimer.matchId ?? current.matchId,
            fontSize: nextTimer.fontSize,
            fontFamily: nextTimer.fontFamily,
            customFontUrl: nextTimer.customFontUrl,
            color: nextTimer.color,
            audioVolume: nextTimer.audioVolume,
          },
        };
      }

      // Not running locally → fully accept incoming data (play command or refresh)
      return { timer: nextTimer };
    }),
}));