import Link from "next/link";
import { notFound } from "next/navigation";
import type { BlocksContent } from "@strapi/blocks-react-renderer";
import { getPublishedScenario, getScenarioSchema } from "@/features/scenarios/api";
import BlocksContentRenderer from "@/components/scenario-form/BlocksContentRenderer";
import { SCENARIO_SCHEMA_ID } from "@/lib/config";
import { mediaUrl, type StrapiFile } from "@/lib/media";
import type { ScenarioSchemaField } from "@/lib/types";
import { displayName } from "@/lib/utils";

interface ScenarioPageProps {
  params: Promise<{ documentId: string }>;
}

function formatValue(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Ναι" : "Όχι";
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const relation = value as Record<string, unknown>;

    if (typeof relation.username === "string") {
      return relation.username;
    }

    if (typeof relation.name === "string") {
      return relation.name;
    }
  }

  return undefined;
}

function isBlocksField(
  field: ScenarioSchemaField,
  value: unknown
): value is BlocksContent {
  return (
    field.type === "blocks" &&
    Array.isArray(value)
  );
}

function getFieldLabel(field: ScenarioSchemaField): string {
  return field.view?.label ?? field.name;
}

function isSystemField(name: string): boolean {
  return [
    "id",
    "documentId",
    "createdAt",
    "updatedAt",
    "publishedAt",
    "locale",
  ].includes(name);
}

export default async function ScenarioPage({
  params,
}: ScenarioPageProps) {
  const { documentId } = await params;

  const schema = await getScenarioSchema(SCENARIO_SCHEMA_ID);
  const fields = schema.fields ?? [];

  const scenario = await getPublishedScenario(documentId, schema);
  if (!scenario) notFound();

  const titleField = fields.find(
    (field) => field.name === "title"
  );

  const title = formatValue(scenario.title) ?? "Χωρίς τίτλο";

  const blocksFields = fields.filter(
    (field) =>
      field.view?.visible !== false &&
      isBlocksField(field, scenario[field.name])
  );

  const metadataFields = fields.filter(
    (field) =>
      field.view?.visible !== false &&
      field.name !== titleField?.name &&
      !isSystemField(field.name) &&
      field.type !== "blocks" &&
      field.type !== "richtext" &&
      scenario[field.name] != null
  );

  const mediaFields = fields.filter(
    (field) =>
      field.type === "media" &&
      field.view?.visible !== false &&
      Array.isArray(scenario[field.name]) &&
      (scenario[field.name] as unknown[]).length > 0
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
      >
        <span aria-hidden="true">←</span>
        Επιστροφή στα σενάρια
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
          {title}
        </h1>
        {scenario.author && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Συγγραφέας: <span className="font-medium">{displayName(scenario.author)}</span>
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          {metadataFields.map((field) => {
            const value = formatValue(scenario[field.name]);

            if (!value) return null;

            return (
              <div
                key={field.name}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {getFieldLabel(field)}
                </p>
                <p className="mt-1 font-medium text-slate-800 dark:text-slate-100">
                  {value}
                </p>
              </div>
            );
          })}
        </div>
      </header>

      <div className="space-y-8">
        {/* Native <details>: each rich text section collapses by clicking its heading, no client JS */}
        {blocksFields.map((field) => (
          <details
            key={field.name}
            open
            className="group rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-8 [&::-webkit-details-marker]:hidden">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {getFieldLabel(field)}
              </h2>
              <svg
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-slate-500 transition-transform group-open:rotate-180 dark:text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>

            <div className="px-5 pb-5 text-slate-700 dark:text-slate-300 sm:px-8 sm:pb-8">
              <BlocksContentRenderer
                content={scenario[field.name] as BlocksContent}
              />
            </div>
          </details>
        ))}
      </div>
      {mediaFields.map((field) => {
        const files = scenario[field.name] as StrapiFile[];
        return (
          <section key={field.name} className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8">
            <h2 className="mb-5 text-xl font-semibold text-slate-900 dark:text-slate-100">{getFieldLabel(field)}</h2>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {files.map((file) => (
                <li key={file.id}>
                  {file.mime.startsWith("image/") ? (
                    <a href={mediaUrl(file.url)} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mediaUrl(file.formats?.medium?.url ?? file.url)} alt={file.alternativeText ?? file.name}
                        className="h-40 w-full rounded object-cover" />
                    </a>
                  ) : (
                    <a href={mediaUrl(file.url)} target="_blank" rel="noopener noreferrer"
                      className="block truncate rounded border border-slate-200 p-3 text-sm text-blue-700 hover:underline dark:border-slate-700 dark:text-blue-400">
                      {file.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
