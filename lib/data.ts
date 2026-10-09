//import { eq } from "drizzle-orm";
//import { db } from "@/db";
import { comments, users } from "@/db/schema";
//import type { Comment, TeachingScenario, User } from "./types";
import type { ScenarioValues } from "@/components/renderer/types";

const STRAPI_URL =
  process.env.STRAPI_URL ?? "http://localhost:1337";

export type StrapiScenario = ScenarioValues & {
  documentId: string;
};

export async function getScenarios(): Promise<StrapiScenario[]> {
  const response = await fetch(
    `${STRAPI_URL}/api/scenario-designs?populate[author]=true&sort=createdAt:desc`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ?? "Failed to fetch scenarios"
    );
  }

  return data.data;
}

export async function getScenarioByDocumentId(
  documentId: string
): Promise<StrapiScenario> {
  const response = await fetch(
    `${STRAPI_URL}/api/scenario-designs/${documentId}?populate[author]=true`,
    {
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ?? "Failed to fetch scenario"
    );
  }

  return data.data;
}


export async function getScenariosByAuthorId(
  authorId: string,
  jwt: string
): Promise<StrapiScenario[]> {
 
  const params = new URLSearchParams();
/*
  params.set("filters[author][id][$eq]", authorId);
  params.set("populate[author]", "true");
  params.set("sort", "createdAt:desc");
*/
  const response = await fetch(
     `${STRAPI_URL}/api/scenario-designs?populate[author]=true&sort=createdAt:desc`,
    // `${STRAPI_URL}/api/scenario-designs?${params.toString()}`,
    {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  const data = await response.json();

   console.log("SCENARIO REQUEST:", {
    status: response.status,
    data,
  });

  if (!response.ok) {
    throw new Error(
      data?.error?.message ?? "Failed to fetch author's scenarios"
    );
  }

  return data.data;
}
/*
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
    extraFields: row.extraFields ? JSON.parse(row.extraFields) : undefined,
    authorName: row.authorName ?? undefined,
    authorId: row.authorId ?? undefined,
    createdAt: row.createdAt ?? undefined,
  };
}

const STRAPI_URL =
  process.env.STRAPI_URL ?? "http://localhost:1337";

export async function getScenarios(): Promise<TeachingScenario[]> {
  const response = await fetch(
    `${STRAPI_URL}/api/scenario-designs?populate[author]=true&sort=createdAt:desc`,
    {
      cache: "no-store",
      headers: {
        "Authorization": "Bearer f282a0411ca308cd68062166d4093ed7dd33e4bd8808099de5ad61a10a30c6ad5fbeee81bd4c3a39a635c6c965cf4c8221869c774ab3a47a953093053c039a8bd66567c7072992116b34386c4a26727e8c4740bcb786dd1f0c19b11a3b00a6e89fa7c7567d46368c323b0a95a154c03aa614bd673551acb90147da8959849349"
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ?? "Failed to fetch scenarios"
    );
  }

  return data.data;
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
    extraFields: scenario.extraFields ? JSON.stringify(scenario.extraFields) : null,
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


export async function getScenariosByAuthorId(authorId: string): Promise<TeachingScenario[]> {
  const rows = await db
    .select()
    .from(scenarios)
    .where(eq(scenarios.authorId, authorId))
    .orderBy(scenarios.createdAt);
  return rows.map(rowToScenario);
}
  */