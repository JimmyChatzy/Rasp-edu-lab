import type { User } from "@/lib/types";
import { ApiError } from "@/lib/strapi/errors";

const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";

type AuthResponse = { jwt: string; user: User };

async function post(path: string, body: unknown): Promise<AuthResponse> {
  let response: Response;
  try {
    response = await fetch(`${STRAPI_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Ο διακομιστής δεν είναι διαθέσιμος.", 503);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(data?.error?.message ?? "Request failed", response.status);
  return data as AuthResponse;
}

export const loginWithStrapi = (identifier: string, password: string) =>
  post("/api/auth/local", { identifier, password });

// fullName is accepted because of register.allowedFields in the Strapi users-permissions config
export const registerWithStrapi = (username: string, email: string, password: string, fullName: string) =>
  post("/api/auth/local/register", { username, email, password, fullName });
