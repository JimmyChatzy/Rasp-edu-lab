import type { ScenarioSchemaField } from "@/lib/strapi-scenarios";
import type { ScenarioFieldValue } from "../types";
import { formatLabel } from "@/lib/utils";

interface SelectProps extends ScenarioSchemaField {
  value?: string;
  onChange?: (value: ScenarioFieldValue) => void;
}

export default function Select({
  name,
  required,
  options,
  view,
  value = "",
  onChange,
}: SelectProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {view?.label ?? formatLabel(name)}
      </label>

      <select
        id={name}
        name={name}
        required={required}
        value={value}
        onChange={(event) => {
          onChange?.(event.target.value);
        }}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      >
        <option value="" disabled>
          Επιλέξτε...
        </option>

        {options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
