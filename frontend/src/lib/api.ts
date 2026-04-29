import config from "../../config";

const TOKEN_KEY = "uniflow_token";

/**
 * The backend's GlobalExceptionHandler joins Bean Validation messages as
 * "field: message, field: message". Strip the field prefixes so toasts read
 * naturally for end users.
 */
function cleanBackendMessage(raw: string): string {
  return raw
    .split(",")
    .map((part) => part.trim().replace(/^[a-zA-Z0-9_]+:\s*/, ""))
    .filter((part) => part.length > 0)
    .join(" ");
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${config.backendUrl}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login/";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    let message = `API error: ${res.status}`;
    try {
      const body = await res.json();
      const raw =
        typeof body?.message === "string" && body.message.trim()
          ? body.message
          : typeof body?.error === "string" && body.error.trim()
            ? body.error
            : null;
      if (raw) message = cleanBackendMessage(raw);
    } catch {
      // no JSON body
    }
    throw new Error(message);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return res.json();
}
