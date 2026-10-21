import { strapiFetch } from "@/lib/strapi/client";
import { ApiError } from "@/lib/strapi/errors";
import type { ScenarioSchema } from "@/lib/types";

export type ReviewStatus = "draft" | "pending_review" | "published" | "rejected";

export interface StrapiScenario {
  documentId: string;
  reviewStatus: ReviewStatus;
  createdAt: string;
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
/*
import { comments, users } from "@/db/schema";
import type { ScenarioValues } from "@/components/scenario-form/types";
import type { ScenarioSchema } from "@/components/scenario-form/types";

export type StrapiScenario = ScenarioValues & {
  documentId: string;
};

export async function getScenarioSchema(
  documentId: string
): Promise<ScenarioSchema> {
  const response = await fetch(
    `${STRAPI_URL}/api/scenario-design/schema/${encodeURIComponent(documentId)}`,
    { cache: "no-store" }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ?? "Failed to fetch scenario schema"
    );
  }

  return data.data;
}

const STRAPI_URL =
  process.env.STRAPI_URL ?? "http://localhost:1337";



export async function getScenarios(): Promise<StrapiScenario[]> {
  const response = await fetch(
    `${STRAPI_URL}/api/scenario-designs?populate[author]=true&sort=createdAt:desc`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ?? "Failed to fetch scenarios"
    );
  }

  return data.data;
}


export async function getScenarioByDocumentId(documentId: string) {
  const params = new URLSearchParams();
  params.set("filters[documentId][$eq]", documentId);
  params.set("populate[author]", "true");

  const response = await fetch(
    `${STRAPI_URL}/api/scenario-designs/?${params.toString()}`,
    { cache: "no-store" }
  );

  const body = await response.json();

  console.log("SCENARIO REQUEST (mine):", {
    status: response.status,
    body,
  });

  if (!response.ok) {
    throw new Error(
      body?.error?.message ?? "Failed to fetch scenario"
    );
  }

  return body.data?.[0] ?? undefined;
}

export async function getScenariosByAuthorId(
  authorId: string,
  jwt: string
): Promise<StrapiScenario[]> {
 
  const params = new URLSearchParams();

  params.set("filters[author][id][$eq]", authorId);
  params.set("populate[author]", "true");
  params.set("sort", "createdAt:desc");

  const response = await fetch(
     `${STRAPI_URL}/api/scenario-designs?populate[author]=true&sort=createdAt:desc`,
    // `${STRAPI_URL}/api/scenario-designs?${params.toString()}`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  const data = await response.json();

   console.log("SCENARIO REQUEST:", {
    status: response.status,
    data,
  });

  if (!response.ok) {
    throw new Error(
      data?.error?.message ?? "Failed to fetch author's scenarios"
    );
  }

  return data.data;
}
*/