import { create } from "zustand";

export interface TeamState {
  id?: string;
  name: string;
  score: number;
  nameColor: string;
  scoreColor: string;
}

export interface ElementPositionState {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  align: "left" | "center" | "right" | "justify";
  isLocked?: boolean;
}

export interface LayoutConfigState {
  id?: string;
  name: string;
  backgroundImageUrl: string | null;
  nameFontFamily: string;
  nameCustomFontUrl: string | null;
  scoreFontFamily: string;
  scoreCustomFontUrl: string | null;
  teamNameSize: number;
  scoreSize: number;
}

export interface ScoreboardStore {
  matchId: string | null;
  obsToken: string | null;
  status: "live" | "finished" | "paused";
  team1: TeamState;
  team2: TeamState;
  layout: LayoutConfigState;
  elements: {
    team1_name: ElementPositionState;
    team1_score: ElementPositionState;
    team2_name: ElementPositionState;
    team2_score: ElementPositionState;
  };
  isLoading: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;

  setMatchId: (id: string, obsToken: string) => void;
  setMatchStatus: (status: "live" | "finished" | "paused") => void;
  setTeam1Name: (name: string) => void;
  setTeam1Score: (score: number) => void;
  setTeam2Name: (name: string) => void;
  setTeam2Score: (score: number) => void;
  swapTeams: () => void;
  resetScores: () => void;
  resetToDefault: () => void;
  setBackgroundImageUrl: (url: string | null) => void;
  setNameFont: (fontFamily: string, customFontUrl: string | null) => void;
  setScoreFont: (fontFamily: string, customFontUrl: string | null) => void;
  setTeamNameSize: (size: number) => void;
  setScoreSize: (size: number) => void;
  setTeamColor: (teamSlot: "team1" | "team2", type: "name" | "score", color: string) => void;
  setElementPosition: (
    key: "team1_name" | "team1_score" | "team2_name" | "team2_score",
    pos: Partial<ElementPositionState>
  ) => void;
  hydrateFromDatabase: (data: {
    matchId: string;
    obsToken: string;
    team1: TeamState;
    team2: TeamState;
    layout: LayoutConfigState;
    elements: ScoreboardStore["elements"];
  }) => void;
  setSavingStatus: (isSaving: boolean) => void;
}

const initialElements: ScoreboardStore["elements"] = {
  team1_name: { x: 300, y: 150, width: 300, height: 60, align: "center", isLocked: false },
  team1_score: { x: 650, y: 150, width: 120, height: 60, align: "center", isLocked: false },
  team2_name: { x: 1320, y: 150, width: 300, height: 60, align: "center", isLocked: false },
  team2_score: { x: 1150, y: 150, width: 120, height: 60, align: "center", isLocked: false },
};

export const useScoreboardStore = create<ScoreboardStore>((set) => ({
  matchId: null,
  obsToken: "match-tqq02a",
  status: "live",
  team1: { name: "SADNESS", score: 0, nameColor: "#ffffff", scoreColor: "#ffffff" },
  team2: { name: "NBA", score: 0, nameColor: "#ffffff", scoreColor: "#ffffff" },
  layout: {
    name: "Default Esports Layout",
    backgroundImageUrl: null,
    nameFontFamily: "Montserrat",
    nameCustomFontUrl: null,
    scoreFontFamily: "Bebas Neue",
    scoreCustomFontUrl: null,
    teamNameSize: 90,
    scoreSize: 90,
  },
  elements: initialElements,
  isLoading: false,
  isSaving: false,
  lastSavedAt: null,

  setMatchId: (id, obsToken) => set({ matchId: id, obsToken }),
  setMatchStatus: (status) => set({ status }),
  setTeam1Name: (name) => set((state) => ({ team1: { ...state.team1, name } })),
  setTeam1Score: (score) => set((state) => ({ team1: { ...state.team1, score: Math.max(0, score) } })),
  setTeam2Name: (name) => set((state) => ({ team2: { ...state.team2, name } })),
  setTeam2Score: (score) => set((state) => ({ team2: { ...state.team2, score: Math.max(0, score) } })),
  swapTeams: () =>
    set((state) => ({
      team1: { ...state.team2, id: state.team1.id },
      team2: { ...state.team1, id: state.team2.id },
    })),
  resetScores: () => set((state) => ({ team1: { ...state.team1, score: 0 }, team2: { ...state.team2, score: 0 } })),
  resetToDefault: () =>
    set((state) => ({
      team1: {
        ...state.team1,
        name: "TEAM 1",
        score: 0,
        nameColor: "#ffffff",
        scoreColor: "#ffffff",
      },
      team2: {
        ...state.team2,
        name: "TEAM 2",
        score: 0,
        nameColor: "#ffffff",
        scoreColor: "#ffffff",
      },
      layout: {
        ...state.layout,
        name: "Default Esports Layout",
        backgroundImageUrl: null,
        nameFontFamily: "Montserrat",
        nameCustomFontUrl: null,
        scoreFontFamily: "Bebas Neue",
        scoreCustomFontUrl: null,
        teamNameSize: 90,
        scoreSize: 90,
      },
      elements: {
        team1_name: { ...initialElements.team1_name, id: state.elements.team1_name.id },
        team1_score: { ...initialElements.team1_score, id: state.elements.team1_score.id },
        team2_name: { ...initialElements.team2_name, id: state.elements.team2_name.id },
        team2_score: { ...initialElements.team2_score, id: state.elements.team2_score.id },
      },
    })),
  setBackgroundImageUrl: (backgroundImageUrl) => set((state) => ({ layout: { ...state.layout, backgroundImageUrl } })),
  setNameFont: (fontFamily, customFontUrl) => set((state) => ({ layout: { ...state.layout, nameFontFamily: fontFamily, nameCustomFontUrl: customFontUrl } })),
  setScoreFont: (fontFamily, customFontUrl) => set((state) => ({ layout: { ...state.layout, scoreFontFamily: fontFamily, scoreCustomFontUrl: customFontUrl } })),
  setTeamNameSize: (teamNameSize) => set((state) => ({ layout: { ...state.layout, teamNameSize } })),
  setScoreSize: (scoreSize) => set((state) => ({ layout: { ...state.layout, scoreSize } })),
  setTeamColor: (teamSlot, type, color) =>
    set((state) => {
      const key = type === "name" ? "nameColor" : "scoreColor";
      return { [teamSlot]: { ...state[teamSlot], [key]: color } };
    }),
  setElementPosition: (key, pos) =>
    set((state) => ({
      elements: {
        ...state.elements,
        [key]: { ...state.elements[key], ...pos },
      },
    })),
  hydrateFromDatabase: (data) =>
    set({
      matchId: data.matchId,
      obsToken: data.obsToken,
      team1: data.team1,
      team2: data.team2,
      layout: data.layout,
      elements: data.elements,
      isLoading: false,
    }),
  setSavingStatus: (isSaving) => set({ isSaving, lastSavedAt: isSaving ? null : new Date() }),
}));