export type ElementKey = "team1_name" | "team1_score" | "team2_name" | "team2_score";
export type TextAlignment = "left" | "center" | "right" | "justify";

export interface DbLayoutElement {
  id?: string;
  element_key: string;
  pos_x: number | string;
  pos_y: number | string;
  width: number | string;
  height: number | string;
  align: TextAlignment;
}

export interface DbLayout {
  id: string;
  user_id?: string;
  name: string;
  background_image_url: string | null;
  custom_font_url: string | null;
  font_family: string | null;
  name_font_size: number | null;
  score_font_size: number | null;
  is_default?: boolean;
  layout_elements?: DbLayoutElement[];
}

export interface DbTeam {
  id?: string;
  match_id?: string;
  slot: "team1" | "team2";
  name: string;
  score: number;
  name_color: string | null;
  score_color: string | null;
}

export interface DbMatch {
  id: string;
  user_id: string;
  layout_id: string;
  obs_token: string;
  status: "live" | "finished" | "paused";
  layouts?: DbLayout | DbLayout[];
  teams?: DbTeam[];
}