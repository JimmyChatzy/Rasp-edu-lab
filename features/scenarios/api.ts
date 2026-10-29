import { strapiFetch } from "@/lib/strapi/client";
import { ApiError } from "@/lib/strapi/errors";
import type { ScenarioSchema } from "@/lib/types";

export type ReviewStatus = "draft" | "pending_review" | "published" | "rejected";

export interface StrapiScenario {
  documentId: string;
  reviewStatus: ReviewStatus;
  createdAt: string;
  author?: { username: string; fullName: string | null } | null; // set by the controller on public reads
  [field: string]: unknown;
}

function populateMedia(schema?: ScenarioSchema): string {
  const names = schema?.fields.filter((f) => f.type === "media").map((f) => f.name) ?? [];
  return names.length ? "?" + names.map((n) => `populate[${n}]=true`).join("&") : "";
}

export async function getScenarioSchema(documentId: string): Promise<ScenarioSchema> {
  const res = await strapiFetch<{ data: ScenarioSchema }>(
    `/api/scenario-design/schema/${encodeURIComponent(documentId)}`,
    { auth: false }
  );
  return res.data;
}

// Public: the server only returns published entries
export async function getPublishedScenarios(): Promise<StrapiScenario[]> {
  const res = await strapiFetch<{ data: StrapiScenario[] }>(
    "/api/scenario-designs?sort=createdAt:desc&pagination[pageSize]=100",
    { auth: false }
  );
  return res.data;
}

export async function getPublishedScenario(documentId: string, schema?: ScenarioSchema): Promise<StrapiScenario | null> {
  try {
    const res = await strapiFetch<{ data: StrapiScenario }>(
      `/api/scenario-designs/${encodeURIComponent(documentId)}${populateMedia(schema)}`,
      { auth: false }
    );
    return res.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function getMyScenarios(): Promise<StrapiScenario[]> {
  const res = await strapiFetch<{ data: StrapiScenario[] }>("/api/scenario-designs/mine");
  return res.data;
}

// Returns null unless the logged-in user owns it (meta.isOwner is set by the controller)
export async function getScenarioForEdit(documentId: string, schema: ScenarioSchema): Promise<StrapiScenario | null> {
  try {
    const res = await strapiFetch<{ data: StrapiScenario; meta?: { isOwner?: boolean } }>(
      `/api/scenario-designs/${encodeURIComponent(documentId)}${populateMedia(schema)}`
    );
    return res.meta?.isOwner ? res.data : null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
