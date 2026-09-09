"use client";

import { useEffect } from "react";
import { useScoreboardStore } from "@/store/useScoreboardStore";
import { updateTeam, updateLayout, updateElement } from "@/lib/supabase/dbUpdates";
import { ElementKey } from "@/types/database";

export function useAutoSave() {
  const { team1, team2, layout, elements, setSavingStatus, matchId } = useScoreboardStore();

  // ─── 1. Team 1 ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Guard: need both team id (from DB hydration) and matchId
    if (!team1.id || !matchId) {
      console.warn("[useAutoSave] team1 skip — id:", team1.id, "matchId:", matchId);
      return;
    }

    const timer = setTimeout(async () => {
      setSavingStatus(true);
      console.log("[useAutoSave] saving team1 id:", team1.id, "score:", team1.score);
      await updateTeam(team1.id as string, {
        name:        team1.name,
        score:       team1.score,
        name_color:  team1.nameColor,
        score_color: team1.scoreColor,
      });
      setSavingStatus(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [team1, matchId, setSavingStatus]);

  // ─── 2. Team 2 ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!team2.id || !matchId) {
      console.warn("[useAutoSave] team2 skip — id:", team2.id, "matchId:", matchId);
      return;
    }

    const timer = setTimeout(async () => {
      setSavingStatus(true);
      console.log("[useAutoSave] saving team2 id:", team2.id, "score:", team2.score);
      await updateTeam(team2.id as string, {
        name:        team2.name,
        score:       team2.score,
        name_color:  team2.nameColor,
        score_color: team2.scoreColor,
      });
      setSavingStatus(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [team2, matchId, setSavingStatus]);

  // ─── 3. Layout settings ───────────────────────────────────────────────────
  useEffect(() => {
    if (!layout.id || !matchId) {
      console.warn("[useAutoSave] layout skip — id:", layout.id, "matchId:", matchId);
      return;
    }

    const timer = setTimeout(async () => {
      setSavingStatus(true);
      await updateLayout(layout.id as string, {
        name_font_size:        layout.teamNameSize,
        score_font_size:       layout.scoreSize,
        background_image_url:  layout.backgroundImageUrl,
        custom_font_url:       layout.customFontUrl,
        font_family:           layout.fontFamily,
      });
      setSavingStatus(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [layout, matchId, setSavingStatus]);

  // ─── 4. Element positions ─────────────────────────────────────────────────
  useEffect(() => {
    if (!layout.id || !matchId) return;

    const timer = setTimeout(async () => {
      setSavingStatus(true);
      const keys: ElementKey[] = ["team1_name", "team1_score", "team2_name", "team2_score"];

      const promises = keys.map((key) => {
        const el = elements[key];
        if (!el.id) {
          console.warn("[useAutoSave] element", key, "has no id — skipping");
          return Promise.resolve();
        }
        return updateElement(el.id, {
          pos_x:  el.x,
          pos_y:  el.y,
          width:  el.width,
          height: el.height,
          align:  el.align,
        });
      });

      await Promise.all(promises);
      setSavingStatus(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [elements, layout.id, matchId, setSavingStatus]);
}
