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

/*

import Link from "next/link";
import { redirect } from "next/navigation";
import ScenarioCard from "@/components/ScenarioCard";
import { getSession } from "@/lib/auth";
import { getScenariosByAuthorId, getScenarioSchema } from "@/features/scenarios/api";
import {getMe} from "@/lib/strapi/users";


export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }


const me = await getMe();

const meResponse = await fetch(
  `${process.env.STRAPI_URL}/api/users/me`,
  {
    headers: {
      Authorization: `Bearer ${session.jwt}`,
    },
    cache: "no-store",
  }
);

  const scenarios = await getScenariosByAuthorId(
    session.userId,
    session.jwt
  );

  const schema = scenarios.length
    ? await getScenarioSchema(scenarios[0].documentId)
    : { fields: [], tabs: [] };

   // console.log("SCHEMA:", JSON.stringify(schema, null, 2));
//console.log("SCENARIO DATA:", scenarios[0]);

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
            href="/scenarios/new"
            className="rounded bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Δημιουργία πρώτου σεναρίου
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          <Link
            href="/scenarios/new"
            className="rounded bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Δημιουργία νέου σεναρίου
          </Link>
          {scenarios.map((scenario) => (
           <ScenarioCard
              key={scenario.documentId}
              scenario={scenario}
              fields={schema.fields}
          />
           //<ScenarioCard key={scenario.documentId} scenario={scenario} />
          ))}
        </div>
      )}
    </div>
  );
}
*/