import { strapi } from '@strapi/client';
import { getSession } from "@/lib/auth";
import { ApiError, UnauthorizedError } from "@/lib/errors";

const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";

export async function strapiFetch<T>(
  path: string,
  { auth = true, ...init }: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const headers = new Headers(init.headers);

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

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) throw new UnauthorizedError(data?.error?.message);
    throw new ApiError(data?.error?.message ?? `Request failed (${response.status})`, response.status);
  }

  return data as T;
}


export const strapiClient = strapi({
  baseURL: `${STRAPI_URL}/api`,
  auth: process.env.STRAPI_API_TOKEN
});