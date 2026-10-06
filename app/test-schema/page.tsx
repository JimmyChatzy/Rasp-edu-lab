import { ScenarioDesignForm } from "@/components/ScenarioDesignForm";
import { ScenarioRenderer } from "@/components/ScenarioRenderer";
import { getScenarioSchema } from "@/lib/strapi-scenarios";

export default async function TestSchemaPage() {
  const schema = await getScenarioSchema("gol1wvlw5o4paor1719wo41w");

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">
        Scenario Designer
      </h1>

      <ScenarioDesignForm schema={schema} />
    </main>
  );
}