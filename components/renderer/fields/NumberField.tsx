import { formatLabel } from "@/lib/utils";
import { ScenarioSchemaField } from "@/lib/types";
import { ScenarioFieldValue } from "../types";

interface NumberFieldProps extends ScenarioSchemaField {
  value?: number | null;
  onChange?: (value: ScenarioFieldValue) => void;
}

export default function NumberField({
  name,
  type,
  required,
  value,
  onChange,
  view,
}: NumberFieldProps) {
  const isInteger =
    type === "integer" ||
    type === "biginteger";

  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {view?.label ?? formatLabel(name)}
      </label>

      <input
        id={name}
        name={name}
        type="number"
        value={value ?? ""}
        required={required}
        placeholder={view?.placeholder}
        disabled={view?.editable === false}
        step={isInteger ? "1" : "any"}
        onChange={(event) => {
          const rawValue = event.target.value;

          onChange?.(
            rawValue === ""
              ? null
              : Number(rawValue)
          );
        }}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      />
    </div>
  );
}
