import Link from "next/link";
import { getMyScenarios } from "@/features/scenarios/api";
import { ScenarioActions, STATUS_LABEL } from "@/features/scenarios/components/ScenarioActions";
import { authed } from "@/lib/strapi/guard";

export default async function DashboardPage() {
  const scenarios = await authed(getMyScenarios);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Τα σενάρια μου</h1>
        <Link href="/scenarios/new" className="rounded bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800">
          + Νέο Σενάριο
        </Link>
      </div>

      {scenarios.length === 0 ? (
        <p className="text-sm text-slate-500">Δεν έχετε δημιουργήσει σενάρια ακόμη.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900">
          {scenarios.map((s) => (
            <li key={s.documentId} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                  {String(s.title ?? s.documentId)}
                </p>
                <span className="text-xs text-slate-500">{STATUS_LABEL[s.reviewStatus]}</span>
              </div>
              <ScenarioActions documentId={s.documentId} status={s.reviewStatus} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
