import { formatLabel } from "@/lib/utils";
import { ScenarioFieldValue } from "../types";
import { ScenarioSchemaField } from "@/lib/types";

interface TextProps extends ScenarioSchemaField {
  value?: string;
  onChange?: (value: ScenarioFieldValue) => void;
}

export default function Text({
  name,
  required,
  value = "",
  onChange,
  view,
}: TextProps) {
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
        type="text"
        value={value}
        required={required}
        placeholder={view?.placeholder}
        disabled={view?.editable === false}
        onChange={(event) => {
          onChange?.(event.target.value);
        }}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
      />
    </div>
  );
}