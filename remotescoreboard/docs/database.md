## Verdict singkat

ERD lama itu **konsepnya kearah benar** (layout, match, team, event log), tapi masih dirancang untuk skenario "tournament management" yang lebih besar dari yang sebenarnya kamu butuhkan. Berdasarkan UI Live Match Control & Layout Customization di screenshot, aplikasimu sebenarnya jauh lebih simpel: **1 operator → beberapa layout (desain) → beberapa match (sesi scoring) → 2 team per match**. Nggak ada manajemen tournament, roster tim yang reusable, atau timer/round sama sekali di UI.

Jawaban per poin kamu:

**1. Auth (login-only, akun pre-seeded)** — table `profiles`/`accounts` cukup pakai `email` + `password_hash`, tambah kolom `google_id` nullable (disiapkan tapi kosong dulu). Tidak perlu tabel terpisah untuk OAuth karena belum dipakai.

**2. Layout FK ke user_id** — sudah benar. Tapi `elements_config jsonb` sebaiknya dipecah jadi tabel sendiri (`layout_elements`) karena posisinya selalu 4 elemen tetap (team1 name/score, team2 name/score) dengan struktur X, Y, W, align yang persis sama tiap layout — lebih aman & gampang di-query/validasi daripada blob JSON bebas.

**3. Tournaments** — setuju, **drop**. Tidak ada input data tournament di UI, jadi tabel ini cuma nambah kompleksitas tanpa dipakai.

**4. Teams** — setuju, disederhanakan jadi `name`, `score`, `name_color`, `score_color`. Tapi konsekuensinya: karena tidak ada tournament/roster, **team jadi child dari match** (bukan entitas reusable lagi), karena di UI operator selalu ngetik nama tim langsung per sesi, bukan pilih dari daftar tim tersimpan.

**5. Sisanya** — `matches` bisa dipangkas: hapus `tournament_id`, `team_a_id/team_b_id` (diganti relasi dari `teams.match_id`), `team_a_custom_name/team_b_custom_name` (redundan — cukup `teams.name`), `score_a/score_b` (redundan — cukup `teams.score`), dan `round_text`/`timer_seconds`/`is_timer_running` (tidak ada di UI sama sekali, YAGNI — bisa ditambah nanti kalau fitur timer beneran dibangun). `match_events` sifatnya opsional (fase 2, untuk audit/undo), bukan kebutuhan MVP.

---

## Skema ideal yang disarankan

### `profiles`
| Kolom | Tipe | Ket |
|---|---|---|
| id | uuid PK | |
| email | text UNIQUE NOT NULL | login |
| password_hash | text NOT NULL | |
| full_name | text | |
| role | text default `'operator'` | siap kalau nanti ada admin |
| google_id | text UNIQUE NULL | disiapkan, selalu NULL dulu |
| avatar_url | text NULL | |
| created_at / updated_at | timestamp | |

### `layouts` (desain scoreboard, reusable)
| Kolom | Tipe | Ket |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → profiles.id | owns |
| name | text | nama layout |
| background_image_url | text | |
| font_family | text | |
| custom_font_url | text NULL | |
| name_font_size | int | slider "Team Name Size" |
| score_font_size | int | slider "Score Size" |
| is_default | boolean default false | |
| created_at / updated_at | timestamp | |

> Warna (`name_color`/`score_color`) **dipindah ke `teams`**, bukan di sini — karena kamu mau tiap tim bisa punya warna teks beda (align sama purple/yellow accent di operator console).

### `layout_elements` (pengganti `elements_config` jsonb)
| Kolom | Tipe | Ket |
|---|---|---|
| id | uuid PK | |
| layout_id | uuid FK → layouts.id ON DELETE CASCADE | |
| element_key | text CHECK IN (`team1_name`,`team1_score`,`team2_name`,`team2_score`) | |
| pos_x, pos_y, width | numeric | dari X/Y/W di panel Element Positioning |
| align | text CHECK IN (`left`,`center`,`right`,`justify`) default `left` | |
| UNIQUE(layout_id, element_key) | | |

### `matches` (sesi scoring, dulu namanya bisa dianggap "session")
| Kolom | Tipe | Ket |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → profiles.id | operates |
| layout_id | uuid FK → layouts.id | layout yang dipakai |
| obs_token | text UNIQUE NOT NULL | isi URL `/obs/{token}`, bisa di-regenerate tanpa ganti data |
| status | text default `'live'` | opsional: draft/live/archived |
| created_at / updated_at | timestamp | |

### `teams` (child dari match, bukan roster reusable lagi)
| Kolom | Tipe | Ket |
|---|---|---|
| id | uuid PK | |
| match_id | uuid FK → matches.id ON DELETE CASCADE | |
| slot | text CHECK IN (`a`,`b`) | pengganti team_a_id/team_b_id di matches |
| name | text NOT NULL | |
| score | int NOT NULL default 0 | |
| name_color | text (hex) | |
| score_color | text (hex) | |
| UNIQUE(match_id, slot) | | |

### `match_events` — opsional, fase 2
Kalau nanti mau fitur "riwayat perubahan skor" / undo, baru bikin tabel ini (`match_id`, `event_type`, `snapshot_payload jsonb`, `created_at`). Untuk sekarang **skip**, tidak ada di UI.

---

## Relasi final

```
profiles ──< layouts ──< layout_elements
profiles ──< matches >── layouts
matches ──< teams   (max 2 baris per match, slot a/b)
```

5 tabel inti (dari 7 di ERD lama), lebih pas dengan alur produkmu: operator bikin/pilih **layout** (background + font + posisi), buka **match** baru pakai layout itu → dapat link OBS, lalu isi **team** langsung di situ (nama, skor, warna). Kalau mau, aku bisa buatkan versi SQL `CREATE TABLE` lengkap dengan constraint-nya.


