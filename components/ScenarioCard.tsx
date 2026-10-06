import Link from "next/link";

interface ScenarioCardProps {
  scenario: {
    documentId: string;
    title?: string;
    difficulty?: string;
    duration?: number;
    author?: {
      username?: string;
    };
    createdAt?: string;
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function ScenarioCard({
  scenario,
}: ScenarioCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
        {scenario.title || "Χωρίς τίτλο"}
      </h2>

      <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
        {scenario.difficulty && (
          <p>
            Δυσκολία: {scenario.difficulty}
          </p>
        )}

        {scenario.duration != null && (
          <p>
            Διάρκεια: {scenario.duration}
          </p>
        )}

        {scenario.author?.username && (
          <p>
            Δημιουργός: {scenario.author.username}
          </p>
        )}
      </div>
    </article>
  );
}