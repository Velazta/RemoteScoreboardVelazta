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
export function injectFontFace(fontFamily: string, fontUrl: string | null) {
  if (typeof window === "undefined" || !fontFamily) return;

  const fontStyleId = `font-${fontFamily.replace(/\s+/g, '-')}`;
  const existingElement = document.getElementById(fontStyleId);

  if (fontUrl) {
    // Custom Uploaded Font
    const styleContent = `
      @font-face {
        font-family: '${fontFamily}';
        src: url('${fontUrl}') format('truetype'), url('${fontUrl}') format('woff2');
        font-display: swap;
      }
    `;

    if (existingElement && existingElement.tagName === 'STYLE') {
      existingElement.textContent = styleContent;
      return;
    } else if (existingElement) {
      existingElement.remove();
    }

    const style = document.createElement("style");
    style.id = fontStyleId;
    style.textContent = styleContent;
    document.head.appendChild(style);
  } else {
    // Google Font
    const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}&display=swap`;
    
    if (existingElement && existingElement.tagName === 'LINK') {
      (existingElement as HTMLLinkElement).href = googleFontUrl;
      return;
    } else if (existingElement) {
      existingElement.remove();
    }

    const link = document.createElement("link");
    link.id = fontStyleId;
    link.rel = "stylesheet";
    link.href = googleFontUrl;
    document.head.appendChild(link);
  }
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

    // Database update is now handled entirely by Zustand auto-save
    return { publicUrl, fontFamily };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Upload custom font error:", message);
    return null;
  }
}
