import { getSession } from "@/lib/auth";
// import { createScenarioAction } from "@/app/actions/scenarios";
// import { getScenarioFieldConfig } from "@/lib/strapi";
import ScenarioForm from "@/components/ScenarioForm";

export default async function CreatePage() {
  const session = await getSession();
  // const fields = await getScenarioFieldConfig();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">
        Δημιουργία Σεναρίου
      </h1>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        Μοιραστείτε μια διδακτική ιδέα για έργα Raspberry Pi. Οι επισκέπτες
        μπορούν να δημοσιεύσουν χωρίς λογαριασμό.
      </p>

      {/* <ScenarioForm
        isLoggedIn={Boolean(session)}
        // action={createScenarioAction}
        // fields={fields}
        noValidate={true} */}
      {/* /> */}
    </div>
  );
}