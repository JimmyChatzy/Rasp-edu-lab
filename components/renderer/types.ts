export type ScenarioFieldValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>[];

export type ScenarioValues = Record<
  string,
  ScenarioFieldValue
>;

export interface ScenarioFieldView {
  label?: string;
  description?: string;
  placeholder?: string;
  editable?: boolean;
  visible?: boolean;
  size?: number;
}

export interface ScenarioSchemaField {
  name: string;
  type: string;
  required?: boolean;
  options?: string[];
  view?: ScenarioFieldView;
}

export interface ScenarioSchemaTab {
  label: string;
  order?: number | null;
  fields: string[];
}

export interface ScenarioSchema {
  fields: ScenarioSchemaField[];
  tabs: ScenarioSchemaTab[];
}