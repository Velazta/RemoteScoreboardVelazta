import { createClient } from "./client";

const supabase = createClient();

export async function updateTeam(
  teamId: string,
  data: { name: string; score: number; name_color: string; score_color: string }
) {
  console.log("[dbUpdates] updateTeam →", teamId, data);

  const { data: updated, error } = await supabase
    .from("teams")
    .update(data)
    .eq("id", teamId)
    .select("id");

  if (error) {
    console.error("[dbUpdates] updateTeam FAILED:", error.message, "code:", error.code);
  } else {
    console.log("[dbUpdates] updateTeam OK — rows updated:", updated?.length ?? 0);
  }
}

export async function updateLayout(
  layoutId: string,
  data: {
    name_font_size: number;
    score_font_size: number;
    background_image_url: string | null;
    name_font_family: string | null;
    name_custom_font_url: string | null;
    score_font_family: string | null;
    score_custom_font_url: string | null;
  }
) {
  const { error } = await supabase
    .from("layouts")
    .update(data)
    .eq("id", layoutId);

  if (error) {
    console.error("[dbUpdates] updateLayout FAILED:", error.message);
  }
}

export async function updateElement(
  elementId: string,
  data: {
    pos_x: number;
    pos_y: number;
    width: number;
    height: number;
    align: string;
  }
) {
  const { error } = await supabase
    .from("layout_elements")
    .update(data)
    .eq("id", elementId);

  if (error) {
    console.error("[dbUpdates] updateElement FAILED:", error.message);
  }
}

export async function updateMatchStatus(matchId: string, status: string) {
  const { error } = await supabase
    .from("matches")
    .update({ status })
    .eq("id", matchId);

  if (error) {
    console.error("[dbUpdates] updateMatchStatus FAILED:", error.message);
  }
}

export async function upsertCustomElement(data: {
  id: string;
  match_id: string;
  type: string;
  content: string;
  font_family?: string;
  custom_font_url?: string | null;
  font_size?: number;
  color?: string;
  pos_x: number;
  pos_y: number;
  width: number;
  height: number;
  align: string;
  rotation?: number;
  is_locked?: boolean;
}) {
  const { error } = await supabase.from("custom_elements").upsert(data);
  if (error) {
    if (error.message.includes("column") || error.code === "PGRST204") {
      const { custom_font_url, rotation, ...baseData } = data;
      const { error: retryError } = await supabase.from("custom_elements").upsert(baseData);
      if (retryError) {
        console.error("[dbUpdates] upsertCustomElement retry FAILED:", retryError.message);
      }
      return;
    }
    console.error("[dbUpdates] upsertCustomElement FAILED:", error.message);
  }
}

export async function deleteCustomElementDb(id: string) {
  const { error } = await supabase.from("custom_elements").delete().eq("id", id);
  if (error) {
    console.error("[dbUpdates] deleteCustomElementDb FAILED:", error.message);
  }
}

export async function upsertMatchTimer(data: {
  match_id: string;
  timer_token: string;
  duration_seconds: number;
  remaining_seconds: number;
  is_running: boolean;
  font_size: number;
  audio_volume: number;
  font_family?: string;
  custom_font_url?: string | null;
  color?: string;
}) {
  // Use UPDATE by timer_token to avoid RLS INSERT issues and uniqueness conflicts
  const { error } = await supabase
    .from("match_timers")
    .update({
      duration_seconds: data.duration_seconds,
      remaining_seconds: data.remaining_seconds,
      is_running: data.is_running,
      font_size: data.font_size,
      audio_volume: data.audio_volume,
      ...(data.font_family !== undefined && { font_family: data.font_family }),
      ...(data.custom_font_url !== undefined && { custom_font_url: data.custom_font_url }),
      ...(data.color !== undefined && { color: data.color }),
    })
    .eq("timer_token", data.timer_token);

  if (error) {
    console.error("[dbUpdates] upsertMatchTimer FAILED:", error.message);
  }
}
