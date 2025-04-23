/* ----------------------------------------------------------------
   Helpers de autenticación para el cliente (browser-side)
----------------------------------------------------------------- */
const TOKEN_COOKIE = "token";

/* Utilidades básicas de cookies -------------------------------- */
const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; Path=/; SameSite=Lax; Expires=${expires}`;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

const getCookie = (name: string): string | null => {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1] ?? null
  );
};

/* ----------------------------------------------------------------
   Llamadas al backend
----------------------------------------------------------------- */
export async function checkEmailExists(email: string): Promise<boolean> {
  const res = await fetch("/api/auth/check-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Unable to verify e-mail");
  const data = (await res.json()) as { exists: boolean };
  return data.exists;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<boolean> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return false;
  const { token } = (await res.json()) as { token: string };
  setCookie(TOKEN_COOKIE, token);
  return true;
}

export async function registerUser(
  email: string,
  password: string,
): Promise<boolean> {
  /* 1 · Registrar */
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, confirmPassword: password }),
  });
  if (!res.ok) return false;

  /* 2 · Autologin para obtener token y cookie */
  return loginUser(email, password);
}

export async function setupUserProfile(
  name: string,
  phone: string,
  avatarUrl: string,
): Promise<boolean> {
  const token = getCookie(TOKEN_COOKIE);
  if (!token) throw new Error("Not authenticated");
  const res = await fetch("/api/auth/setup-profile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, phone, avatarUrl }),
  });
  return res.ok;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  profilePicture: string | null;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const token = getCookie(TOKEN_COOKIE);
  if (!token) return null;

  const res = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;

  const { user } = (await res.json()) as {
    user: { id: string; email: string; name: string | null; avatarUrl: string | null };
  };

  return {
    id: user.id,
    email: user.email,
    fullName: user.name ?? "",
    profilePicture: user.avatarUrl ?? null,
  };
}

export function getAuthToken(): string | null {
  // 1 · Cookie accesible por JS
  const cookieMatch = typeof document !== "undefined"
    ? document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1]
    : null;
  if (cookieMatch) return decodeURIComponent(cookieMatch);

  // 2 · Fallback localStorage (si decides duplicarlo allí)
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }

  return null;
}

export function logout(): void {
  deleteCookie(TOKEN_COOKIE);
}