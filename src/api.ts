// API Configuration for Store pages compatibility
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3004";

export interface DecodedToken {
  sub?: number;
  email?: string | null;
  username?: string;
  user_name?: string;
  name?: string;
  employee_id?: string;
  role?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export function isTokenExpired(token?: string | null): boolean {
  if (!token) return true;
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    const expirationTime = (decoded.exp as number) * 1000;
    const currentTime = Date.now();
    return currentTime >= expirationTime - 5000;
  } catch {
    return true;
  }
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as DecodedToken;
  } catch (e) {
    console.error("Invalid token:", e);
    return null;
  }
}

export function handleAuthError(): void {
  localStorage.removeItem("token");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}


