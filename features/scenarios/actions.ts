"use server";

import { revalidatePath } from "next/cache";
import { strapiFetch } from "@/lib/strapi/client";
import { ApiError, ForbiddenError, UnauthorizedError, extractFieldErrors, type FieldErrors } from "@/lib/strapi/errors";
import type { ScenarioPayload } from "@/lib/serialize";

export type ActionResult =
  | { ok: true }
  | { ok: false; code: "unauthorized" | "forbidden" | "validation" | "server"; message?: string; fieldErrors?: FieldErrors };

function toFailure(error: unknown): Extract<ActionResult, { ok: false }> {
  if (error instanceof UnauthorizedError) return { ok: false, code: "unauthorized" };
  if (error instanceof ForbiddenError) return { ok: false, code: "forbidden" };
  if (error instanceof ApiError && error.status === 400) {
    return { ok: false, code: "validation", message: error.message, fieldErrors: extractFieldErrors(error) };
  }
  console.error(error);
  return { ok: false, code: "server" };
}

async function run(fn: () => Promise<unknown>): Promise<ActionResult> {
  try {
    await fn();
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { ok: true };
  } catch (error) {
    return toFailure(error);
  }
}

export async function createScenarioAction(data: ScenarioPayload) {
  return run(() => strapiFetch("/api/scenario-designs", { method: "POST", body: JSON.stringify({ data }) }));
}

export async function updateScenarioAction(documentId: string, data: ScenarioPayload) {
  return run(() =>
    strapiFetch(`/api/scenario-designs/${encodeURIComponent(documentId)}`, { method: "PUT", body: JSON.stringify({ data }) })
  );
}

export async function deleteScenarioAction(documentId: string) {
  return run(() => strapiFetch(`/api/scenario-designs/${encodeURIComponent(documentId)}`, { method: "DELETE" }));
}

export async function submitScenarioAction(documentId: string) {
  return run(() => strapiFetch(`/api/scenario-designs/${encodeURIComponent(documentId)}/submit`, { method: "POST" }));
}


/*

"use server";

import { ScenarioValues } from "@/components/scenario-form/types";
import { UnauthorizedError, ApiError } from "@/lib/strapi/errors"
import { strapiFetch } from "@/lib/strapi/client"

export type ActionResult = { ok: true } | { ok: false; code: "unauthorized" | "validation" | "server"; message?: string };

export async function createScenarioAction(values: ScenarioValues): Promise<ActionResult> {
  try {
    await strapiFetch("/api/scenarios", { method: "POST", body: JSON.stringify({ data: values }), headers: { "Content-Type": "application/json" } });
    return { ok: true };
  } catch (error) {
    if (error instanceof UnauthorizedError) return { ok: false, code: "unauthorized" };
    if (error instanceof ApiError && error.status === 400) return { ok: false, code: "validation", message: error.message };
    console.error(error);
    return { ok: false, code: "server" };
  }
}*/