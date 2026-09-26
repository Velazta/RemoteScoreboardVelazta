import { createClient } from "./client";
import { TeamState, LayoutConfigState, ElementPositionState } from "@/store/useScoreboardStore";
import { DbMatch, DbLayout, DbTeam, DbLayoutElement, ElementKey, DbMatchTimer } from "@/types/database";

const supabase = createClient();

// Helper murni tanpa 'let'
function generateObsToken(): string {
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `match-${randomStr}`;
}

function generateTimerToken(): string {
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `timer-${randomStr}`;
}

// Fallback data default dengan tipe pasti
const DEFAULT_TEAM_1: DbTeam = {
  id: undefined,
  slot: "team1",
  name: "SADNESS",
  score: 0,
  name_color: "#ffffff",
  score_color: "#ffffff",
};

const DEFAULT_TEAM_2: DbTeam = {
  id: undefined,
  slot: "team2",
  name: "NBA",
  score: 0,
  name_color: "#ffffff",
  score_color: "#ffffff",
};

const DEFAULT_ELEMENTS: Record<ElementKey, ElementPositionState> = {
  team1_name: { x: 300, y: 150, width: 300, height: 60, align: "center" },
  team1_score: { x: 650, y: 150, width: 120, height: 60, align: "center" },
  team2_name: { x: 1320, y: 150, width: 300, height: 60, align: "center" },
  team2_score: { x: 1150, y: 150, width: 120, height: 60, align: "center" },
};

export async function getOrCreateInitialMatch() {
  // 1. Ambil session user aktif
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    console.warn("User belum login atau session tidak ditemukan.");
    return null;
  }

  const user = authData.user;

  // 2. Query data match dengan casting tipe pasti
  const { data: existingMatches, error: matchFetchError } = await supabase
    .from("matches")
    .select(`
      id,
      obs_token,
      status,
      layout_id,
      layouts (
        id,
        name,
        background_image_url,
        name_font_family,
        name_custom_font_url,
        score_font_family,
        score_custom_font_url,
        name_font_size,
        score_font_size,
        layout_elements (
          id,
          element_key,
          pos_x,
          pos_y,
          width,
          height,
          align
        )
      ),
      teams (
        id,
        slot,
        name,
        score,
        name_color,
        score_color
      ),
      custom_elements (*),
      match_timers (*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (matchFetchError) {
    console.error("Error fetching match:", matchFetchError.message);
  }

  // 3. JIKA MATCH SUDAH ADA (Hydrate data)
  if (existingMatches && existingMatches.length > 0) {
    const match = existingMatches[0] as unknown as DbMatch;
    const layoutData = Array.isArray(match.layouts) ? match.layouts[0] : match.layouts;
    const teamsList = (match.teams ?? []) as DbTeam[];

    // Sort by slot alphabetically so any slot naming works:
    // "a"/"b", "team1"/"team2", "1"/"2" etc. — first sorted = team1, second = team2.
    const sortedTeams = [...teamsList].sort((a, b) =>
      (a.slot ?? "").localeCompare(b.slot ?? "")
    );
    const team1Data = sortedTeams[0] ?? DEFAULT_TEAM_1;
    const team2Data = sortedTeams[1] ?? DEFAULT_TEAM_2;

    // Parsing elemen menggunakan map murni
    const elementsMap: Record<ElementKey, ElementPositionState> = { ...DEFAULT_ELEMENTS };

    if (layoutData?.layout_elements) {
      layoutData.layout_elements.forEach((el: DbLayoutElement) => {
        const key = el.element_key as ElementKey;
        if (key in elementsMap) {
          elementsMap[key] = {
            id: el.id,
            x: Number(el.pos_x),
            y: Number(el.pos_y),
            width: Number(el.width),
            height: Number(el.height),
            align: el.align ?? "center",
          };
        }
      });
    }

      let existingTimer = match.match_timers?.[0];
      let timerToken = existingTimer?.timer_token;

      if (!existingTimer) {
        timerToken = generateTimerToken();
        const { data: newTimer } = await supabase
          .from("match_timers")
          .insert({
            match_id: match.id,
            timer_token: timerToken,
            duration_seconds: 300,
            remaining_seconds: 300,
            is_running: false,
            font_size: 90,
            audio_volume: 100,
            font_family: "Montserrat",
            custom_font_url: null,
            color: "#06b6d4",
          })
          .select()
          .maybeSingle();
        if (newTimer) existingTimer = newTimer;
      } else if (!timerToken) {
        timerToken = generateTimerToken();
        await supabase
          .from("match_timers")
          .update({ timer_token: timerToken })
          .eq("id", existingTimer.id);
      }

      return {
        matchId: match.id,
        obsToken: match.obs_token,
        status: match.status,
        team1: {
          id: team1Data.id,
          name: team1Data.name,
          score: team1Data.score,
          nameColor: team1Data.name_color ?? "#ffffff",
          scoreColor: team1Data.score_color ?? "#ffffff",
        },
        team2: {
          id: team2Data.id,
          name: team2Data.name,
          score: team2Data.score,
          nameColor: team2Data.name_color ?? "#ffffff",
          scoreColor: team2Data.score_color ?? "#ffffff",
        },
        layout: {
          id: layoutData?.id,
          name: layoutData?.name ?? "Default Esports Layout",
          backgroundImageUrl: layoutData?.background_image_url ?? null,
          nameFontFamily: layoutData?.name_font_family ?? "Montserrat",
          nameCustomFontUrl: layoutData?.name_custom_font_url ?? null,
          scoreFontFamily: layoutData?.score_font_family ?? "Bebas Neue",
          scoreCustomFontUrl: layoutData?.score_custom_font_url ?? null,
          teamNameSize: layoutData?.name_font_size ?? 90,
          scoreSize: layoutData?.score_font_size ?? 90,
        },
        elements: elementsMap,
        customElements: (match.custom_elements ?? []).map((el: any) => ({
          id: el.id,
          matchId: el.match_id,
          type: el.type,
          content: el.content,
          fontFamily: el.font_family,
          customFontUrl: el.custom_font_url,
          fontSize: el.font_size,
          color: el.color,
          x: Number(el.pos_x),
          y: Number(el.pos_y),
          width: Number(el.width),
          height: Number(el.height),
          align: el.align,
          rotation: el.rotation,
          isLocked: el.is_locked,
        })),
        timer: {
          timerToken: timerToken || match.obs_token,
          durationSeconds: existingTimer?.duration_seconds ?? 300,
          remainingSeconds: existingTimer?.remaining_seconds ?? 300,
          isRunning: existingTimer?.is_running ?? false,
          fontSize: existingTimer?.font_size ?? 90,
          audioVolume: existingTimer?.audio_volume ?? 100,
          fontFamily: existingTimer?.font_family ?? "Montserrat",
          customFontUrl: existingTimer?.custom_font_url ?? null,
          color: existingTimer?.color ?? "#06b6d4",
          updatedAt: existingTimer?.updated_at,
        },
      };
    }

  // 4. JIKA BELUM ADA: Auto-seed baru
  console.log("Melakukan auto-seed data awal untuk operator...");

  const { data: newLayout, error: layoutInsertError } = await supabase
    .from("layouts")
    .insert({
      user_id: user.id,
      name: "Default Esports Layout",
      name_font_family: "Montserrat",
      score_font_family: "Bebas Neue",
      name_font_size: 90,
      score_font_size: 90,
      is_default: true,
    })
    .select()
    .single();

  if (layoutInsertError || !newLayout) {
    console.error("Gagal membuat layout default:", layoutInsertError?.message);
    return null;
  }

  const defaultElementsToInsert = [
    { layout_id: newLayout.id, element_key: "team1_name", pos_x: 300, pos_y: 150, width: 300, height: 60, align: "center" },
    { layout_id: newLayout.id, element_key: "team1_score", pos_x: 650, pos_y: 150, width: 120, height: 60, align: "center" },
    { layout_id: newLayout.id, element_key: "team2_name", pos_x: 1320, pos_y: 150, width: 300, height: 60, align: "center" },
    { layout_id: newLayout.id, element_key: "team2_score", pos_x: 1150, pos_y: 150, width: 120, height: 60, align: "center" },
  ];

  const { data: insertedElements } = await supabase
    .from("layout_elements")
    .insert(defaultElementsToInsert)
    .select();

  const elementsMapWithId: Record<ElementKey, ElementPositionState> = { ...DEFAULT_ELEMENTS };

  if (insertedElements) {
    insertedElements.forEach((el: DbLayoutElement) => {
      const key = el.element_key as ElementKey;
      if (key in elementsMapWithId) {
        elementsMapWithId[key].id = el.id;
      }
    });
  }

  const obsToken = generateObsToken();
  const { data: newMatch, error: matchInsertError } = await supabase
    .from("matches")
    .insert({
      user_id: user.id,
      layout_id: newLayout.id,
      obs_token: obsToken,
      status: "live",
    })
    .select()
    .single();

  if (matchInsertError || !newMatch) {
    console.error("Gagal membuat match default:", matchInsertError?.message);
    return null;
  }

  const defaultTeamsToInsert = [
    { match_id: newMatch.id, slot: "team1", name: "SADNESS", score: 0, name_color: "#ffffff", score_color: "#ffffff" },
    { match_id: newMatch.id, slot: "team2", name: "NBA", score: 0, name_color: "#ffffff", score_color: "#ffffff" },
  ];

  const { data: createdTeams } = await supabase
    .from("teams")
    .insert(defaultTeamsToInsert)
    .select();

  const newTimerToken = generateTimerToken();
  const { error: timerInsertError } = await supabase
    .from("match_timers")
    .insert({
      match_id: newMatch.id,
      timer_token: newTimerToken,
      duration_seconds: 300,
      remaining_seconds: 300,
      is_running: false,
      font_size: 90,
      audio_volume: 100,
      font_family: "Montserrat",
      custom_font_url: null,
      color: "#06b6d4"
    });
  
  if (timerInsertError) {
    console.error("Gagal membuat default match_timers:", timerInsertError.message);
  }

  const team1Created = createdTeams?.find((t: DbTeam) => t.slot === "team1");
  const team2Created = createdTeams?.find((t: DbTeam) => t.slot === "team2");

  return {
    matchId: newMatch.id,
    obsToken: newMatch.obs_token,
    status: newMatch.status,
    team1: {
      id: team1Created?.id,
      name: team1Created?.name ?? "SADNESS",
      score: team1Created?.score ?? 0,
      nameColor: team1Created?.name_color ?? "#ffffff",
      scoreColor: team1Created?.score_color ?? "#ffffff",
    },
    team2: {
      id: team2Created?.id,
      name: team2Created?.name ?? "NBA",
      score: team2Created?.score ?? 0,
      nameColor: team2Created?.name_color ?? "#ffffff",
      scoreColor: team2Created?.score_color ?? "#ffffff",
    },
    layout: {
      id: newLayout.id,
      name: newLayout.name,
      backgroundImageUrl: newLayout.background_image_url,
      nameFontFamily: newLayout.name_font_family,
      nameCustomFontUrl: newLayout.name_custom_font_url,
      scoreFontFamily: newLayout.score_font_family,
      scoreCustomFontUrl: newLayout.score_custom_font_url,
      teamNameSize: newLayout.name_font_size,
      scoreSize: newLayout.score_font_size,
    },
    elements: elementsMapWithId,
    customElements: [],
    timer: {
      timerToken: newTimerToken,
      durationSeconds: 300,
      remainingSeconds: 300,
      isRunning: false,
      fontSize: 90,
      audioVolume: 100,
      fontFamily: "Montserrat",
      customFontUrl: null,
      color: "#06b6d4",
    },
  };
}

export async function getMatchByObsToken(obsToken: string) {
  const { data: matchData, error } = await supabase
    .from("matches")
    .select(`
      id,
      status,
      layout_id,
      layouts (
        id,
        name,
        background_image_url,
        name_font_family,
        name_custom_font_url,
        score_font_family,
        score_custom_font_url,
        name_font_size,
        score_font_size,
        layout_elements (
          id,
          element_key,
          pos_x,
          pos_y,
          width,
          height,
          align
        )
      ),
      teams (
        id,
        slot,
        name,
        score,
        name_color,
        score_color
      ),
      custom_elements (*),
      match_timers (*)
    `)
    .eq("obs_token", obsToken)
    .single();

  if (error || !matchData) {
    return null;
  }

  const layoutData = Array.isArray(matchData.layouts) ? matchData.layouts[0] : matchData.layouts;
  const teamsList = (matchData.teams ?? []) as DbTeam[];

  // Sort alphabetically by slot so any naming (a/b, team1/team2, etc.) works consistently
  const sortedTeams = [...teamsList].sort((a, b) =>
    (a.slot ?? "").localeCompare(b.slot ?? "")
  );
  const team1Data = sortedTeams[0] ?? DEFAULT_TEAM_1;
  const team2Data = sortedTeams[1] ?? DEFAULT_TEAM_2;

  const elementsMap: Record<ElementKey, ElementPositionState> = { ...DEFAULT_ELEMENTS };

  if (layoutData?.layout_elements) {
    layoutData.layout_elements.forEach((el: DbLayoutElement) => {
      const key = el.element_key as ElementKey;
      if (key in elementsMap) {
        elementsMap[key] = {
          id: el.id,
          x: Number(el.pos_x),
          y: Number(el.pos_y),
          width: Number(el.width),
          height: Number(el.height),
          align: el.align ?? "center",
        };
      }
    });
  }

  return {
    matchId: matchData.id,
    status: matchData.status,
    team1: {
      id: team1Data.id,
      name: team1Data.name,
      score: team1Data.score,
      nameColor: team1Data.name_color ?? "#ffffff",
      scoreColor: team1Data.score_color ?? "#ffffff",
    },
    team2: {
      id: team2Data.id,
      name: team2Data.name,
      score: team2Data.score,
      nameColor: team2Data.name_color ?? "#ffffff",
      scoreColor: team2Data.score_color ?? "#ffffff",
    },
    layout: {
      id: layoutData?.id,
      name: layoutData?.name ?? "Default Esports Layout",
      backgroundImageUrl: layoutData?.background_image_url ?? null,
      nameFontFamily: layoutData?.name_font_family ?? "Montserrat",
      nameCustomFontUrl: layoutData?.name_custom_font_url ?? null,
      scoreFontFamily: layoutData?.score_font_family ?? "Bebas Neue",
      scoreCustomFontUrl: layoutData?.score_custom_font_url ?? null,
      teamNameSize: layoutData?.name_font_size ?? 90,
      scoreSize: layoutData?.score_font_size ?? 90,
    },
    elements: elementsMap,
    customElements: (matchData.custom_elements ?? []).map((el: any) => ({
      id: el.id,
      matchId: el.match_id,
      type: el.type,
      content: el.content,
      fontFamily: el.font_family,
      customFontUrl: el.custom_font_url,
      fontSize: el.font_size,
      color: el.color,
      x: Number(el.pos_x),
      y: Number(el.pos_y),
      width: Number(el.width),
      height: Number(el.height),
      align: el.align,
      rotation: el.rotation,
      isLocked: el.is_locked,
    })),
  };
}

export async function getTimerByToken(token: string) {
  if (!token) return null;

  // 1. Try finding by timer_token
  const { data: timerData, error } = await supabase
    .from("match_timers")
    .select("*")
    .eq("timer_token", token)
    .maybeSingle();

  if (timerData) {
    return {
      matchId: timerData.match_id,
      timerToken: timerData.timer_token,
      durationSeconds: timerData.duration_seconds,
      remainingSeconds: timerData.remaining_seconds,
      isRunning: timerData.is_running,
      fontSize: timerData.font_size,
      audioVolume: timerData.audio_volume,
      fontFamily: timerData.font_family ?? "Montserrat",
      customFontUrl: timerData.custom_font_url ?? null,
      color: timerData.color ?? "#06b6d4",
      updatedAt: timerData.updated_at,
    };
  }

  // 2. Fallback: Check if token is actually a match obs_token
  const { data: matchData } = await supabase
    .from("matches")
    .select(`
      id,
      match_timers (*)
    `)
    .eq("obs_token", token)
    .maybeSingle();

  const fallbackTimer = (matchData?.match_timers as unknown as DbMatchTimer[])?.[0];
  if (fallbackTimer) {
    return {
      matchId: fallbackTimer.match_id,
      timerToken: fallbackTimer.timer_token,
      durationSeconds: fallbackTimer.duration_seconds,
      remainingSeconds: fallbackTimer.remaining_seconds,
      isRunning: fallbackTimer.is_running,
      fontSize: fallbackTimer.font_size,
      audioVolume: fallbackTimer.audio_volume,
      fontFamily: fallbackTimer.font_family ?? "Montserrat",
      customFontUrl: fallbackTimer.custom_font_url ?? null,
      color: fallbackTimer.color ?? "#06b6d4",
      updatedAt: fallbackTimer.updated_at,
    };
  }

  if (error) {
    console.error("Gagal getTimerByToken:", error.message);
  }
  return null;
}