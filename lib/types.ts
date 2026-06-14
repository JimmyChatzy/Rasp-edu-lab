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
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  name: string;
}