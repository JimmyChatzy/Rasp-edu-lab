import { db } from "../db";
import { scenarios, comments, users } from "../db/schema";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

async function seed() {
  console.log("Seeding database from JSON files...");

  // Seed scenarios
  const scenariosPath = path.join(DATA_DIR, "scenarios.json");
  if (fs.existsSync(scenariosPath)) {
    const raw = fs.readFileSync(scenariosPath, "utf-8");
    const data = JSON.parse(raw);
    for (const item of data) {
      await db.insert(scenarios).values({
        id: item.id,
        title: item.title,
        description: item.description,
        gradeLevel: item.gradeLevel,
        subjects: JSON.stringify(item.subjects || []),
        difficulty: item.difficulty,
        duration: item.duration,
        idea: item.idea,
        content: item.content,
        equipment: item.equipment ?? null,
        curriculumConnection: item.curriculumConnection ?? null,
        teachingDesign: item.teachingDesign ? JSON.stringify(item.teachingDesign) : null,
        assessment: item.assessment ? JSON.stringify(item.assessment) : null,
        images: item.images ? JSON.stringify(item.images) : null,
        tinkercadLink: item.tinkercadLink ?? null,
        authorName: item.authorName ?? null,
        authorId: item.authorId ?? null,
        createdAt: item.createdAt ?? null,
      });
    }
    console.log(`Inserted ${data.length} scenarios`);
  }

  // Seed comments
  const commentsPath = path.join(DATA_DIR, "comments.json");
  if (fs.existsSync(commentsPath)) {
    const raw = fs.readFileSync(commentsPath, "utf-8");
    const data = JSON.parse(raw);
    for (const item of data) {
      await db.insert(comments).values({
        id: item.id,
        scenarioId: item.scenarioId,
        authorName: item.authorName,
        text: item.text,
        createdAt: item.createdAt,
      });
    }
    console.log(`Inserted ${data.length} comments`);
  }

  // Seed users
  const usersPath = path.join(DATA_DIR, "users.json");
  if (fs.existsSync(usersPath)) {
    const raw = fs.readFileSync(usersPath, "utf-8");
    const data = JSON.parse(raw);
    for (const item of data) {
      await db.insert(users).values({
        id: item.id,
        email: item.email,
        passwordHash: item.passwordHash,
        name: item.name,
        createdAt: item.createdAt,
      });
    }
    console.log(`Inserted ${data.length} users`);
  }

  console.log("Seeding complete!");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));