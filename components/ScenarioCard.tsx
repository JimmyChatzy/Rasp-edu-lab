import Link from "next/link";
import type { TeachingScenario } from "@/lib/types";

interface ScenarioCardProps {
  scenario: TeachingScenario;
}

export default function ScenarioCard({ scenario }: ScenarioCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800 dark:text-slate-300">Τάξη {scenario.gradeLevel}</span>
        <span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800 dark:text-slate-300">
          Δυσκολία {scenario.difficulty}/5
        </span>
        <span className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800 dark:text-slate-300">
          {scenario.duration} λεπτά
        </span>
      </div>
      <h2 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
        <Link href={`/scenario/${scenario.id}`} className="hover:text-blue-700 dark:hover:text-blue-400">
          {scenario.title}
        </Link>
      </h2>
      <p className="mb-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
        {scenario.description}
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {scenario.subjects.map((subject) => (
          <span
            key={subject}
            className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-200"
          >
            {subject}
          </span>
        ))}
      </div>
      {scenario.authorName && (
        <p className="text-xs text-slate-500 dark:text-slate-400">Από: {scenario.authorName}</p>
      )}
    </article>
  );
}
