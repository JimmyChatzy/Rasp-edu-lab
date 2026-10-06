import { ScenarioFieldValue, ScenarioFieldView } from "@/components/renderer/types";

export type GradeLevel = "Α" | "Β" | "Γ" | "Δ" | "Ε" | "ΣΤ";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type TeachingScenario = {
  id: string;

  // Core fields (keep existing)
  title: string;
  description: string;
  gradeLevel: GradeLevel;
  subjects: string[];
  difficulty: Difficulty;
  duration: number;
  idea: string;
  content: string;

  // Optional metadata
  equipment?: string;
  curriculumConnection?: string;

  // Teaching design (optional)
  teachingDesign?: {
    prerequisiteKnowledge?: string;
    learningOutcomes?: string;
    teachingMethod?: string;
    classOrganization?: string;
    lessonStages?: string;
  };

  // Assessment (optional)
  assessment?: {
    methodology?: string;
    tools?: string;
  };

  // Images
  images?: string[]; // base64 encoded images

  // Tinkercad schematic link
  tinkercadLink?: string;

  // Admin-configured fields from Strapi (name → value)
  extraFields?: Record<string, string>;

  // System fields
  authorName?: string;
  authorId?: string;
  createdAt?: string;
};

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
