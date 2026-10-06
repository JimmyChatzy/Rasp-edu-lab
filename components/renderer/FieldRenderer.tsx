import Text from "./fields/Text";
import Select from "./fields/Select";
import NumberField from "./fields/NumberField";
import MediaField from "./fields/MediaField";

import {
  ScenarioFieldValue,
  ScenarioSchemaField,
} from "./types";
import RichTextEditor from "./fields/RichTextEditor";

interface FieldRendererProps {
  field: ScenarioSchemaField;
  value?: ScenarioFieldValue;
  onChange?: (value: ScenarioFieldValue) => void;
}

export function FieldRenderer({
  field,
  value,
  onChange,
}: FieldRendererProps) {
  console.log("FIELD BEFORE RENDER:", {
  name: field.name,
  type: field.type,
  view: field.view,
  value,
});
  switch (field.type) {
    case "string":
      return (
        <Text
          name={field.name}
          type={field.type}
          required={field.required}
          value={
            typeof value === "string"
              ? value
              : ""
          }
          onChange={onChange}
          view={field.view}
        />
      );
    case "blocks":
      return (
        <RichTextEditor
          name={field.name}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
          view={field.view}
        />
      );
    case "media":
      return (
        <MediaField
          name={field.name}
          value={value}
          onChange={onChange}
          view={field.view}
        />
  );
    case "enumeration":
      return (
        <Select
          name={field.name}
          type={field.type}
          required={field.required}
          options={field.options}
          value={
            typeof value === "string"
              ? value
              : ""
          }
          onChange={onChange}
          view={field.view}
        />
      );

    case "decimal":
    case "float":
    case "integer":
    case "biginteger":
      return (
        <NumberField
          name={field.name}
          type={field.type}
          required={field.required}
          value={
            typeof value === "number"
              ? value
              : undefined
          }
          onChange={onChange}
          view={field.view}
        />
      );

    default:
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Unsupported field type:{" "}
          <strong>{field.type}</strong>
        </div>
      );
  }
}
