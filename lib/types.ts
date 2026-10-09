import { ScenarioFieldValue, ScenarioFieldView } from "@/components/renderer/types";

export interface Comment {
  id: string;
  scenarioId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
}

export interface Session {
  name: string;
  userId: string;
  jwt: string;
}

export interface StrapiDocument {
  documentId: string;
  [key: string]: unknown;
}

export interface ScenarioSchemaField {
  name: string;
  type: string;
  required?: boolean;
  options?: string[];
  value?: ScenarioFieldValue;
  view?: ScenarioFieldView;
  onChange?: (value: ScenarioFieldValue) => void;
  placeholder?: string;
}

export interface ScenarioSchemaTab {
  label: string;
  order: number | null | undefined;
  fields: string[];
}

export interface ScenarioSchema {
  fields: ScenarioSchemaField[];
  tabs: ScenarioSchemaTab[];
}
