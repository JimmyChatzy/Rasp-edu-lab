import Link from "next/link";
import { redirect } from "next/navigation";
import ScenarioCard from "@/components/ScenarioCard";
import { getSession } from "@/lib/auth";
import { getScenariosByAuthorId } from "@/lib/data";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const scenarios = await getScenariosByAuthorId(session.userId);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-slate-800 dark:text-slate-100">
        Πίνακας Ελέγχου
      </h1>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        Τα σενάρια που δημοσιεύσατε, {session.name}.
      </p>

      {scenarios.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="mb-4 text-slate-500 dark:text-slate-400">
            Δεν έχετε δημοσιεύσει σενάρια ακόμα.
          </p>
          <Link
            href="/create"
            className="rounded bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Δημιουργία πρώτου σεναρίου
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {scenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      )}
    </div>
  );
}
