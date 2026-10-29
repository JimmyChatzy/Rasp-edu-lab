import { getScenarioSchema } from "@/features/scenarios/api";
import { ScenarioForm } from "@/features/scenarios/components/ScenarioForm";
import { SCENARIO_SCHEMA_ID } from "@/lib/config";

export default async function CreatePage() {
  const schema = await getScenarioSchema(SCENARIO_SCHEMA_ID);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">
        Δημιουργία Σεναρίου
      </h1>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        Μοιραστείτε μια διδακτική ιδέα για έργα Raspberry Pi. Μετά την αποθήκευση
        μπορείτε να την υποβάλετε για δημοσίευση από τον πίνακα ελέγχου.
      </p>
      <ScenarioForm schema={schema} />
    </div>
  );
}
