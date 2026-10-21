export type ScenarioFieldValue =
  | string
  | number
  | boolean
  | null
  | Record<string, unknown>[];

export type ScenarioValues = Record<string, ScenarioFieldValue>;

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
  multiple?: boolean;
  allowedTypes?: string[];
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

export interface User {
  id: number;
  documentId?: string;
  username: string;
  email: string;
}

export interface Session {
  userId: string;
  name: string;
  jwt: string;
}


/*
import { ScenarioFieldValue, ScenarioFieldView } from "@/components/scenario-form/types";

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
  multiple?: boolean;        // media: Strapi "Allow multiple files"
  allowedTypes?: string[];   // media: ["images" | "files" | "videos" | "audios"]
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
*/