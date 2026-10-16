
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getScenarioByDocumentId,
  getScenarioSchema,
} from "@/lib/data";
import BlocksContentRenderer from "@/components/renderer/BlocksContentRenderer";
import type { BlocksContent } from "@strapi/blocks-react-renderer";
import type { ScenarioSchemaField } from "@/components/renderer/types";

interface ScenarioPageProps {
  params: Promise<{ id: string }>;
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
  const { id } = await params;

  console.log("Document ID from URL:", id);

  const scenario = await getScenarioByDocumentId(id);

  if (!scenario) {
    console.log ('scenario not found');
    notFound();
  }

  const schema = await getScenarioSchema(scenario.documentId);
  const fields = schema.fields ?? [];

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

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
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
        {blocksFields.map((field) => (
          <section
            key={field.name}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8"
          >
            <h2 className="mb-5 text-xl font-semibold text-slate-900 dark:text-slate-100">
              {getFieldLabel(field)}
            </h2>

            <div className="text-slate-700 dark:text-slate-300">
              <BlocksContentRenderer
                content={scenario[field.name] as BlocksContent}
              />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
