
import Link from "next/link";
   import type { ScenarioSchemaField, } from "@/lib/types";
   import type { StrapiScenario } from "../api";


interface ScenarioCardProps {
  scenario: StrapiScenario;
  fields?: ScenarioSchemaField[];
}

function formatValue(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Ναι" : "Όχι";
  }

  if (Array.isArray(value)) return undefined;

  if (value && typeof value === "object") {
    if ("username" in value && typeof value.username === "string") {
      return value.username;
    }

    if ("name" in value && typeof value.name === "string") {
      return value.name;
    }
  }

  return undefined;
}

/** Extract readable text from Strapi Blocks JSON. */
function extractBlocksText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(extractBlocksText).filter(Boolean).join(" ");
  }

  if (!value || typeof value !== "object") return "";

  const node = value as Record<string, unknown>;

  if (typeof node.text === "string") {
    return node.text;
  }

  return node.children ? extractBlocksText(node.children) : "";
}

function truncate(text: string, maxLength = 160): string {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) return normalized;

  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}

export default function ScenarioCard({
  scenario,
  fields = [],
}: ScenarioCardProps) {
  const title = formatValue(scenario.title) ?? "Χωρίς τίτλο";

  const blocksField = fields.find(
    (field) =>
      field.type === "blocks" &&
      field.view?.visible !== false !== false &&
      Array.isArray(scenario[field.name])
  );

  const description = blocksField
    ? truncate(extractBlocksText(scenario[blocksField.name]))
    : undefined;

  const displayFields = fields.filter(
    (field) =>
      field.view?.visible !== false !== false &&
      field.name !== "title" &&
      field.name !== blocksField?.name &&
      ![
        "documentId",
        "id",
        "createdAt",
        "updatedAt",
        "publishedAt",
      ].includes(field.name) &&
      !["blocks", "richtext", "json"].includes(field.type) &&
      scenario[field.name] != null
  );

  return (
    <Link
      //href="/scenario/euubsqr0qy3yga4gqvzbiec2"
      href={`/scenario/${scenario.documentId}`}
      className="block h-full"
    >
      <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h2>

        {description && (
          <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {description}
          </p>
        )}

        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          {displayFields.map((field) => {
            const value = formatValue(scenario[field.name]);

            if (value === undefined || value === "") return null;

            return (
              <p key={field.name}>
                <span className="font-medium">
                  {field.view?.label ?? field.name}:
                </span>{" "}
                {value}
              </p>
            );
          })}
        </div>

        <span className="mt-auto pt-4 text-sm font-medium text-blue-600 dark:text-blue-400">
          Περισσότερα →
        </span>
      </article>
    </Link>
  );
}






/*import Link from "next/link";
import type { ScenarioValues } from "@/components/renderer/types";
import BlocksContentRenderer from "@/components/renderer/BlocksContentRenderer";
import type { BlocksContent } from "@strapi/blocks-react-renderer";

interface ScenarioCardProps {
  scenario: ScenarioValues & {
    documentId: string;
  };
  fields: Array<{
    name: string;
    label?: string;
    type: string;
    visible?: boolean;
  }>;
}

function formatValue(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Ναι" : "Όχι";
  }

  if (Array.isArray(value)) {
    return undefined;
  }

  if (value && typeof value === "object") {
    if ("username" in value && typeof value.username === "string") {
      return value.username;
    }


    if ("name" in value && typeof value.name === "string") {
      return value.name;
    }


  }

  return undefined;
}

export default function ScenarioCard({
  scenario,
  fields,
}: ScenarioCardProps) {
   const safeFields = Array.isArray(fields) ? fields : [];

  const title = formatValue(scenario.title) ?? "Χωρίς τίτλο";
  
  const blocksFields = safeFields.filter(
  (field) =>
    field.type === "blocks" &&
    field.visible !== false &&
    scenario[field.name] != null
);

console.log(
  "CARD FIELD VALUES:",
  safeFields.map((field) => ({
    name: field.name,
    type: field.type,
    visible: field.visible,
    value: scenario[field.name],
  }))
);

const displayFields = safeFields.filter(
  (field) =>
    field.name !== "title" &&
    !["documentId", "id", "createdAt", "updatedAt", "publishedAt"].includes(
      field.name
    ) &&
    !["blocks", "richtext"].includes(field.type) &&
    scenario[field.name] != null
);

  return (
    <Link
      href={`/scenarios/${encodeURIComponent(scenario.documentId)}`}
      className="block"
    > <article className="h-full rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"> <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
      {title} </h2>


        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          {displayFields.map((field) => {
            const value = formatValue(scenario[field.name]);

            if (!value) return null;

            return (
              <p key={field.name}>
                {field.label ?? field.name}: {value}
              </p>
            );
          })}
          {blocksFields.map((field) => (
            <div
              key={field.name}
              className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700"
            >
              {field.label && (
                <h3 className="mb-2 text-sm font-semibold">
                  {field.label}
                </h3>
              )}

              <BlocksContentRenderer
                content={scenario[field.name] as BlocksContent}
              />
            </div>
          ))}
        </div>
      </article>
    </Link>


  );
}*/