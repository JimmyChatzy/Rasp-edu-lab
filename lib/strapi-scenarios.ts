import { ScenarioFieldValue, ScenarioSchema, ScenarioValues } from '@/components/renderer/types';
import { strapiClient } from '@/lib/strapi';

interface ScenarioSchemaResponse {
  data: ScenarioSchema;
}

export async function getScenarioSchema(
  documentId: string
): Promise<ScenarioSchema> {
  const response = await strapiClient.fetch(
    `/scenario-design/schema/${documentId}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch scenario schema: ${response.status}`
    );
  }

  const json = (await response.json()) as ScenarioSchemaResponse;

  return json.data;
}


export async function createScenarioDesign(
  values: ScenarioValues
) {
  const response = await strapiClient
    .collection("scenario-designs")
    .create({
      data: values,
    });

  return response;
}