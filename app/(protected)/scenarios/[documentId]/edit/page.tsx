import { notFound } from "next/navigation";
import { getScenarioForEdit, getScenarioSchema } from "@/features/scenarios/api";
import { ScenarioForm } from "@/features/scenarios/components/ScenarioForm";
import { SCENARIO_SCHEMA_ID } from "@/lib/config";
import { toFormValues } from "@/lib/serialize";
import { authed } from "@/lib/strapi/guard";

export default async function EditScenarioPage({ params }: { params: Promise<{ documentId: string }> }) {
  const { documentId } = await params;

  const schema = await getScenarioSchema(SCENARIO_SCHEMA_ID);
  const scenario = await authed(() => getScenarioForEdit(documentId, schema));
  if (!scenario) notFound(); // missing, or not the owner (the controller sets meta.isOwner)

  return <ScenarioForm schema={schema} documentId={documentId} initialValues={toFormValues(schema, scenario)} />;
}