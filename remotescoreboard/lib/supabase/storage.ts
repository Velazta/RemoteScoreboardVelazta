import { createClient } from "./client";

const supabase = createClient();

/**
 * Upload gambar background ke Supabase Storage (bucket: backgrounds)
 * dan update kolom background_image_url di tabel layouts.
 */
export async function uploadBackgroundImage(file: File, layoutId: string): Promise<string | null> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error("User belum terotentikasi");
    }

    const fileExt = file.name.split(".").pop();
    const filePath = `${authData.user.id}/${layoutId}_bg_${Date.now()}.${fileExt}`;

    // 1. Upload ke Storage Bucket 'backgrounds'
    const { error: uploadError } = await supabase.storage
      .from("backgrounds")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // 2. Dapatkan Public URL
    const { data: publicUrlData } = supabase.storage
      .from("backgrounds")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // 3. Update database tabel layouts jika layoutId valid
    if (layoutId) {
      const { error: updateError } = await supabase
        .from("layouts")
        .update({ background_image_url: publicUrl })
        .eq("id", layoutId);

      if (updateError) {
        console.error("Gagal mengupdate database layout:", updateError.message);
      }
    }

    return publicUrl;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Upload background error:", message);
    return null;
  }
}

/**
 * Inject dynamic @font-face ke document.head browser
 */
export function injectFontFace(fontFamily: string, fontUrl: string) {
  if (typeof window === "undefined" || !fontUrl) return;

  const fontStyleId = `custom-font-${fontFamily}`;
  const existingStyle = document.getElementById(fontStyleId);

  if (existingStyle) {
    existingStyle.textContent = `
      @font-face {
        font-family: '${fontFamily}';
        src: url('${fontUrl}') format('truetype'), url('${fontUrl}') format('woff2');
        font-display: swap;
      }
    `;
    return;
  }

  const style = document.createElement("style");
  style.id = fontStyleId;
  style.textContent = `
    @font-face {
      font-family: '${fontFamily}';
      src: url('${fontUrl}') format('truetype'), url('${fontUrl}') format('woff2');
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Upload file font (.ttf, .woff2) ke Supabase Storage (bucket: fonts)
 * dan update custom_font_url & font_family di tabel layouts.
 */
export async function uploadCustomFont(
  file: File,
  layoutId: string
): Promise<{ publicUrl: string; fontFamily: string } | null> {
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error("User belum terotentikasi");
    }

    const fileExt = file.name.split(".").pop();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, "_");
    const fontFamily = `Font_${cleanFileName}`;
    const filePath = `${authData.user.id}/${layoutId}_font_${Date.now()}.${fileExt}`;

    // 1. Upload ke Storage Bucket 'fonts'
    const { error: uploadError } = await supabase.storage
      .from("fonts")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // 2. Dapatkan Public URL
    const { data: publicUrlData } = supabase.storage
      .from("fonts")
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // 3. Inject @font-face ke DOM browser secara langsung
    injectFontFace(fontFamily, publicUrl);

    // 4. Update database tabel layouts
    if (layoutId) {
      const { error: updateError } = await supabase
        .from("layouts")
        .update({
          custom_font_url: publicUrl,
          font_family: fontFamily,
        })
        .eq("id", layoutId);

      if (updateError) {
        console.error("Gagal mengupdate database font layout:", updateError.message);
      }
    }

    return { publicUrl, fontFamily };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Upload custom font error:", message);
    return null;
  }
}
