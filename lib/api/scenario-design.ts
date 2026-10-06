import { getSession } from "@/lib/auth";

const STRAPI_URL =
  process.env.STRAPI_URL ?? "http://localhost:1337";

export async function createScenarioDesign(
  values: Record<string, string | number | boolean | null>
) {
  const session = await getSession();

  if (!session?.jwt) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(
    `${STRAPI_URL}/api/scenario-designs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.jwt}`,
      },
      body: JSON.stringify({
        data: values,
      }),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ?? "Failed to create scenario"
    );
  }

  return data;
}

export async function getScenarioDesign(
  documentId: string
) {
  const response = await fetch(
    `${STRAPI_URL}/api/scenario-designs/${documentId}?populate=author`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ?? "Failed to fetch scenario"
    );
  }
  return data.data;
}