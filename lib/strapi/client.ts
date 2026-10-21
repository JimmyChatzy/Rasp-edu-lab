import { strapi } from "@strapi/client"
import { getSession } from "@/lib/auth";
import { ApiError, ForbiddenError, UnauthorizedError } from "./errors";

const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";

export async function strapiFetch<T>(
  path: string,
  { auth = true, ...init }: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  if (typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const session = await getSession();
    if (!session?.jwt) throw new UnauthorizedError();
    headers.set("Authorization", `Bearer ${session.jwt}`);
  }

  let response: Response;
  try {
    response = await fetch(`${STRAPI_URL}${path}`, { ...init, headers, cache: "no-store" });
  } catch {
    throw new ApiError("Ο διακομιστής δεν είναι διαθέσιμος.", 503);
  }

  const data = await response.json().catch(() => null); // DELETE returns an empty body

  if (!response.ok) {
    const err = data?.error;
    const message = err?.message ?? `Request failed (${response.status})`;
    if (response.status === 401 && auth) throw new UnauthorizedError(message);
    if (response.status === 403) throw new ForbiddenError(message);
    throw new ApiError(message, response.status, err?.details);
  }
  return data as T;
}

export const strapiClient = strapi({
  baseURL: `${STRAPI_URL}/api`,
  auth: process.env.STRAPI_API_TOKEN
});