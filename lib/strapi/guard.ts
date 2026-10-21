import { redirect } from "next/navigation";
import { UnauthorizedError } from "./errors";
import { getMe } from "./users";

// Wrap any server-side data call. Expired session → clear cookie → login page.
export async function authed<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof UnauthorizedError) redirect("/session-expired"); // outside the try
    throw error;
  }
}

export const requireUser = () => authed(getMe);