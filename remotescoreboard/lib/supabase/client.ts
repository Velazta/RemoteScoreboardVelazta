import { createBrowserClient } from "@supabase/ssr";

function parseBrowserCookies(): Record<string, string> {
  if (typeof document === "undefined") {
    return {};
  }
  const cookieMap: Record<string, string> = {};
  const rawCookies = document.cookie ? document.cookie.split(";") : [];

  rawCookies.forEach((raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const splitIndex = trimmed.indexOf("=");
    if (splitIndex === -1) {
      cookieMap[trimmed] = "";
    } else {
      const name = trimmed.substring(0, splitIndex);
      const val = trimmed.substring(splitIndex + 1);
      cookieMap[name] = decodeURIComponent(val);
    }
  });

  return cookieMap;
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const parsed = parseBrowserCookies();
          return Object.keys(parsed).map((name) => ({
            name,
            value: parsed[name] ?? "",
          }));
        },
        setAll(cookiesToSet) {
          if (typeof document === "undefined") return;

          const isRememberMe =
            typeof window !== "undefined" &&
            localStorage.getItem("remember_me") === "true";

          cookiesToSet.forEach(({ name, value, options }) => {
            const parts: string[] = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];
            parts.push(`path=${options?.path ?? "/"}`);

            if (options?.sameSite) {
              parts.push(`SameSite=${options.sameSite}`);
            }
            if (
              options?.secure ||
              (typeof window !== "undefined" && window.location.protocol === "https:")
            ) {
              parts.push("Secure");
            }

            // Session cookie vs Persistent cookie handling:
            if (options?.maxAge === 0) {
              // Explicit cookie deletion request
              parts.push("max-age=0");
            } else if (isRememberMe) {
              // Remember Me ON: set persistent 30-day cookie
              const maxAgeSec = options?.maxAge && options.maxAge > 0
                ? options.maxAge
                : 60 * 60 * 24 * 30;
              parts.push(`max-age=${maxAgeSec}`);
            }
            // If Remember Me OFF: omit max-age entirely to form a pure browser Session Cookie

            document.cookie = parts.join("; ");
          });
        },
      },
    }
  );
}
