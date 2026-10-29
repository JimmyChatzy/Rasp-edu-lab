import Link from "next/link";
import type { BlocksContent } from "@strapi/blocks-react-renderer";
import type { ScenarioSchemaField } from "@/lib/types";
import { displayName } from "@/lib/utils";
import type { StrapiScenario } from "../api";
import { ExpandableBlocks } from "./ExpandableBlocks";

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

export default function ScenarioCard({
  scenario,
  fields = [],
}: ScenarioCardProps) {
  const title = formatValue(scenario.title) ?? "Χωρίς τίτλο";

  // Short description: the first rich text field (content-type order) that has content
  const blocksField = fields.find(
    (field) =>
      field.type === "blocks" &&
      field.view?.visible !== false &&
      Array.isArray(scenario[field.name])
  );

  const displayFields = fields.filter(
    (field) =>
      field.view?.visible !== false &&
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

  const href = `/scenarios/${encodeURIComponent(scenario.documentId)}`;

  // Not one big link: the card holds a "show more" button and the rich text can contain links
  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
        <Link href={href} className="hover:underline">
          {title}
        </Link>
      </h2>

      {scenario.author && (
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
          Συγγραφέας: {displayName(scenario.author)}
        </p>
      )}

      {blocksField && (
        <ExpandableBlocks content={scenario[blocksField.name] as BlocksContent} />
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

      <Link href={href} className="mt-auto pt-4 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
        Περισσότερα →
      </Link>
    </article>
  );
}
