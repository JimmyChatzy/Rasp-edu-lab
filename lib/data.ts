import { eq } from "drizzle-orm";
import { db } from "@/db";
import { scenarios, comments, users } from "@/db/schema";
import type { Comment, TeachingScenario, User } from "./types";

function rowToScenario(row: typeof scenarios.$inferSelect): TeachingScenario {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    gradeLevel: row.gradeLevel as TeachingScenario["gradeLevel"],
    subjects: JSON.parse(row.subjects) as string[],
    difficulty: row.difficulty as TeachingScenario["difficulty"],
    duration: row.duration,
    idea: row.idea,
    content: row.content,
    equipment: row.equipment ?? undefined,
    curriculumConnection: row.curriculumConnection ?? undefined,
    teachingDesign: row.teachingDesign ? JSON.parse(row.teachingDesign) : undefined,
    assessment: row.assessment ? JSON.parse(row.assessment) : undefined,
    images: row.images ? (JSON.parse(row.images) as string[]) : undefined,
    tinkercadLink: row.tinkercadLink ?? undefined,
    authorName: row.authorName ?? undefined,
    authorId: row.authorId ?? undefined,
    createdAt: row.createdAt ?? undefined,
  };
}

export async function getScenarios(): Promise<TeachingScenario[]> {
  const rows = await db.select().from(scenarios).orderBy(scenarios.createdAt);
  return rows.map(rowToScenario);
}

export async function getScenarioById(id: string): Promise<TeachingScenario | undefined> {
  const rows = await db.select().from(scenarios).where(eq(scenarios.id, id)).limit(1);
  return rows.length > 0 ? rowToScenario(rows[0]) : undefined;
}

export async function createScenario(scenario: TeachingScenario): Promise<void> {
  await db.insert(scenarios).values({
    id: scenario.id,
    title: scenario.title,
    description: scenario.description,
    gradeLevel: scenario.gradeLevel,
    subjects: JSON.stringify(scenario.subjects),
    difficulty: scenario.difficulty,
    duration: scenario.duration,
    idea: scenario.idea,
    content: scenario.content,
    equipment: scenario.equipment ?? null,
    curriculumConnection: scenario.curriculumConnection ?? null,
    teachingDesign: scenario.teachingDesign ? JSON.stringify(scenario.teachingDesign) : null,
    assessment: scenario.assessment ? JSON.stringify(scenario.assessment) : null,
    images: scenario.images ? JSON.stringify(scenario.images) : null,
    tinkercadLink: scenario.tinkercadLink ?? null,
    authorName: scenario.authorName ?? null,
    authorId: scenario.authorId ?? null,
    createdAt: scenario.createdAt ?? null,
  });
}

export async function getCommentsByScenarioId(scenarioId: string): Promise<Comment[]> {
  const rows = await db
    .select()
    .from(comments)
    .where(eq(comments.scenarioId, scenarioId))
    .orderBy(comments.createdAt);
  return rows.map((row) => ({
    id: row.id,
    scenarioId: row.scenarioId,
    authorName: row.authorName,
    text: row.text,
    createdAt: row.createdAt,
  }));
}

export async function createComment(comment: Comment): Promise<void> {
  await db.insert(comments).values({
    id: comment.id,
    scenarioId: comment.scenarioId,
    authorName: comment.authorName,
    text: comment.text,
    createdAt: comment.createdAt,
  });
}

export async function getUsers(): Promise<User[]> {
  const rows = await db.select().from(users);
  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    name: row.name,
    createdAt: row.createdAt,
  }));
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return rows.length > 0
    ? {
        id: rows[0].id,
        email: rows[0].email,
        passwordHash: rows[0].passwordHash,
        name: rows[0].name,
        createdAt: rows[0].createdAt,
      }
    : undefined;
}

export async function createUser(user: User): Promise<void> {
  await db.insert(users).values({
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    name: user.name,
    createdAt: user.createdAt,
  });
}

export async function getScenariosByAuthorId(authorId: string): Promise<TeachingScenario[]> {
  const rows = await db
    .select()
    .from(scenarios)
    .where(eq(scenarios.authorId, authorId))
    .orderBy(scenarios.createdAt);
  return rows.map(rowToScenario);
}