import { createClient } from "./client";
import { TeamState, LayoutConfigState, ElementPositionState } from "@/store/useScoreboardStore";
import { DbMatch, DbLayout, DbTeam, DbLayoutElement, ElementKey } from "@/types/database";

const supabase = createClient();

// Helper murni tanpa 'let'
function generateObsToken(): string {
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `match-${randomStr}`;
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
        custom_font_url,
        font_family,
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
      )
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
    const teamsList = match.teams ?? [];

    const team1Data = teamsList.find((t: DbTeam) => t.slot === "team1") ?? DEFAULT_TEAM_1;
    const team2Data = teamsList.find((t: DbTeam) => t.slot === "team2") ?? DEFAULT_TEAM_2;

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

    return {
      matchId: match.id,
      obsToken: match.obs_token,
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
        customFontUrl: layoutData?.custom_font_url ?? null,
        fontFamily: layoutData?.font_family ?? "Montserrat",
        teamNameSize: layoutData?.name_font_size ?? 90,
        scoreSize: layoutData?.score_font_size ?? 90,
      },
      elements: elementsMap,
    };
  }

  // 4. JIKA BELUM ADA: Auto-seed baru
  console.log("Melakukan auto-seed data awal untuk operator...");

  const { data: newLayout, error: layoutInsertError } = await supabase
    .from("layouts")
    .insert({
      user_id: user.id,
      name: "Default Esports Layout",
      font_family: "Montserrat",
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

  await supabase.from("layout_elements").insert(defaultElementsToInsert);

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

  const team1Created = createdTeams?.find((t: DbTeam) => t.slot === "team1");
  const team2Created = createdTeams?.find((t: DbTeam) => t.slot === "team2");

  return {
    matchId: newMatch.id,
    obsToken: newMatch.obs_token,
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
      customFontUrl: newLayout.custom_font_url,
      fontFamily: newLayout.font_family,
      teamNameSize: newLayout.name_font_size,
      scoreSize: newLayout.score_font_size,
    },
    elements: DEFAULT_ELEMENTS,
  };
}