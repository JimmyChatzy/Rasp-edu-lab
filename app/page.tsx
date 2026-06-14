import Link from "next/link";
import ScenarioListWithFilters from "@/components/ScenarioListWithFilters";
import { getScenarios } from "@/lib/data";

export default async function HomePage() {
  const scenarios = await getScenarios();

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
          href="/create"
          className="inline-block rounded bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          + Νέο Σενάριο
        </Link>
      </section>

      <ScenarioListWithFilters scenarios={scenarios} />
    </div>
  );
}
