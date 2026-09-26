"use client";

import { useEffect, useRef } from "react";
import { useScoreboardStore } from "@/store/useScoreboardStore";
import { updateTeam, updateLayout, updateElement, updateMatchStatus } from "@/lib/supabase/dbUpdates";
import { ElementKey } from "@/types/database";

export function useAutoSave() {
  const { team1, team2, layout, elements, customElements, isElementsVisible, setSavingStatus, setCustomElements, matchId } = useScoreboardStore();

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
        name_font_family:      layout.nameFontFamily,
        name_custom_font_url:  layout.nameCustomFontUrl,
        score_font_family:     layout.scoreFontFamily,
        score_custom_font_url: layout.scoreCustomFontUrl,
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

  // ─── 5. Custom Elements ───────────────────────────────────────────────────
  useEffect(() => {
    if (!matchId) return;

    // Sanitize any non-UUID IDs (e.g. legacy 'custom_...' IDs)
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const hasInvalidId = customElements.some(el => !UUID_REGEX.test(el.id));
    if (hasInvalidId) {
      setCustomElements(customElements.map(el => {
        if (!UUID_REGEX.test(el.id)) {
          const newId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0;
                const v = c === "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
              });
          return { ...el, id: newId };
        }
        return el;
      }));
      return;
    }

    const timerId = setTimeout(async () => {
      setSavingStatus(true);
      const promises = customElements.map(el =>
        import("@/lib/supabase/dbUpdates").then(m => m.upsertCustomElement({
          id: el.id,
          match_id: matchId,
          type: el.type,
          content: el.content,
          font_family: el.fontFamily,
          custom_font_url: el.customFontUrl,
          font_size: el.fontSize,
          color: el.color,
          pos_x: el.x,
          pos_y: el.y,
          width: el.width,
          height: el.height,
          align: el.align,
          rotation: el.rotation,
          is_locked: el.isLocked,
        }))
      );
      await Promise.all(promises);
      setSavingStatus(false);
    }, 500);

    return () => clearTimeout(timerId);
  }, [customElements, matchId, setSavingStatus, setCustomElements]);

  // ─── 7. Match status (Visibility) ─────────────────────────────────────────
  // Note: We no longer save visibility to match.status because the database
  // has a check constraint restricting status to ('draft', 'live', 'archived').
  // Instead, visibility is managed dynamically via Realtime Broadcasts.
}
