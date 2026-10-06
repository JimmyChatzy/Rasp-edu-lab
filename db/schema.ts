import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const scenarios = sqliteTable("scenarios", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  gradeLevel: text("grade_level").notNull(),
  subjects: text("subjects").notNull(), // JSON array stored as string
  difficulty: integer("difficulty").notNull(),
  duration: integer("duration").notNull(),
  idea: text("idea").notNull(),
  content: text("content").notNull(),
  equipment: text("equipment"),
  curriculumConnection: text("curriculum_connection"),
  teachingDesign: text("teaching_design"), // JSON string
  assessment: text("assessment"), // JSON string
  images: text("images"), // JSON array of base64 strings
  tinkercadLink: text("tinkercad_link"),
  extraFields: text("extra_fields"), // JSON object of admin-configured fields
  authorName: text("author_name"),
  authorId: text("author_id"),
  createdAt: text("created_at"),
});

export const comments = sqliteTable("comments", {
  id: text("id").primaryKey(),
  scenarioId: text("scenario_id").notNull(),
  authorName: text("author_name").notNull(),
  text: text("text").notNull(),
  createdAt: text("created_at").notNull(),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
});