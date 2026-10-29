import Link from "next/link";
import ScenarioList from "@/features/scenarios/components/ScenarioList";
import { getPublishedScenarios, getScenarioSchema } from "@/features/scenarios/api";
import { getSession } from "@/lib/auth";
import { SCENARIO_SCHEMA_ID } from "@/lib/config";

export default async function HomePage() {
  const [scenarios, schema, session] = await Promise.all([
    getPublishedScenarios(),
    getScenarioSchema(SCENARIO_SCHEMA_ID),
    getSession(),
  ]);

  return (
    <div>
      <section className="mb-8">
        <h1 className="mb-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">
          Διδακτικά Σενάρια Raspberry Pi
        </h1>
        <p className="mb-4 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Πλατφόρμα για εκπαιδευτικούς δημοτικού σχολείου. Ανακαλύψτε, μοιραστείτε
          και σχολιάστε ιδέες για έργα ρομποτικής και προγραμματισμού με Raspberry Pi.
        </p>
        <Link
          href={session ? "/scenarios/new" : "/login"}
          className="inline-block rounded bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          {session ? "+ Νέο Σενάριο" : "Σύνδεση για νέο σενάριο"}
        </Link>
      </section>

      <ScenarioList scenarios={scenarios} fields={schema.fields} />
    </div>
  );
}
