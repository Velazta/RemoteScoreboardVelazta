import { createClient } from "./client";

const supabase = createClient();

export async function updateTeam(
  teamId: string,
  data: { name: string; score: number; name_color: string; score_color: string }
) {
  const { error } = await supabase
    .from("teams")
    .update(data)
    .eq("id", teamId);
    
  if (error) {
    console.error("Gagal update team:", error.message);
  }
}

export async function updateLayout(
  layoutId: string,
  data: {
    name_font_size: number;
    score_font_size: number;
    background_image_url: string | null;
    custom_font_url: string | null;
    font_family: string | null;
  }
) {
  const { error } = await supabase
    .from("layouts")
    .update(data)
    .eq("id", layoutId);

  if (error) {
    console.error("Gagal update layout:", error.message);
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
    console.error("Gagal update layout element:", error.message);
  }
}
