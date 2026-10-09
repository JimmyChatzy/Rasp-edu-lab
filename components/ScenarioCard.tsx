import Link from "next/link";
import type { ScenarioValues } from "@/components/renderer/types";

interface ScenarioCardProps {
  scenario: ScenarioValues & {
    documentId: string;
  };
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function getAuthorUsername(value: unknown): string | undefined {
  if (
    typeof value === "object" &&
    value !== null &&
    "username" in value &&
    typeof value.username === "string"
  ) {
    return value.username;
  }

  return undefined;
}

export default function ScenarioCard({
  scenario,
}: ScenarioCardProps) {
  const title = getString(scenario.title);
  const difficulty = getString(scenario.difficulty);
  const duration = getNumber(scenario.duration);
  const authorUsername = getAuthorUsername(scenario.author);

  return (
    <Link href={`/scenarios/${scenario.documentId}`}>
      <article className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title || "Χωρίς τίτλο"}
        </h2>

        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          {difficulty && (
            <p>
              Δυσκολία: {difficulty}
            </p>
          )}

          {duration != null && (
            <p>
              Διάρκεια: {duration}
            </p>
          )}

          {authorUsername && (
            <p>
              Δημιουργός: {authorUsername}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

/*
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
}*/