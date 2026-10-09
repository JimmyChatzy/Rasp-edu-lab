import Link from "next/link";
import { redirect } from "next/navigation";
import ScenarioCard from "@/components/ScenarioCard";
import { getSession } from "@/lib/auth";
import { getScenariosByAuthorId } from "@/lib/data";
import {getMe} from "@/lib/api/me";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  console.log("DASHBOARD SESSION:", {
  userId: session.userId,
  name: session.name,
  hasJwt: Boolean(session.jwt),
});

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
            <ScenarioCard key={scenario.documentId} scenario={scenario} />
          ))}
        </div>
      )}
    </div>
  );
}
